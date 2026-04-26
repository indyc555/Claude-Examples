import { useMemo } from 'react'
import { getGroupColorClass } from '../data/workoutTypes'

function sessionVolume(exercises) {
  return exercises.reduce((sum, e) => {
    const reps = e.reps || 12
    return sum + (e.lbs || 0) * (e.sets || 1) * reps
  }, 0)
}

function formatVol(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function Dashboard({ workouts, onNavigate }) {
  const stats = useMemo(() => {
    if (!workouts.length) return null

    const sessions = {}
    workouts.forEach(w => {
      const key = `${w.date}|${w.group}`
      if (!sessions[key]) sessions[key] = { date: w.date, group: w.group, exercises: [] }
      sessions[key].exercises.push(w)
    })
    const sessionList = Object.values(sessions).sort((a, b) => b.date.localeCompare(a.date))
    const totalSessions = sessionList.length

    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const sessionsThisMonth = sessionList.filter(s => s.date.startsWith(monthStr)).length

    const lastDate = sessionList[0]?.date
    let daysSinceLast = null
    if (lastDate) {
      const [y, m, d] = lastDate.split('-').map(Number)
      const diff = Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86400000)
      daysSinceLast = diff
    }

    const prMap = {}
    workouts.forEach(w => {
      const key = `${w.group}|${w.exercise}`
      if (!prMap[key] || w.lbs > prMap[key].lbs) prMap[key] = { ...w }
    })
    const prs = Object.values(prMap).sort((a, b) => b.lbs - a.lbs).slice(0, 8)

    return { totalSessions, sessionsThisMonth, daysSinceLast, prs, recentSessions: sessionList.slice(0, 5) }
  }, [workouts])

  if (!stats) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏋️</div>
        <div className="empty-title">No workouts yet</div>
        <div className="empty-desc">Log your first session to see stats here.</div>
        <br />
        <button className="btn btn-primary" onClick={() => onNavigate('log')}>Log Workout</button>
      </div>
    )
  }

  const { totalSessions, sessionsThisMonth, daysSinceLast, prs, recentSessions } = stats

  return (
    <div>
      <div className="grid-3 section-gap">
        <div className="stat-card">
          <div className="stat-value accent-pull">{totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value accent-chest">{sessionsThisMonth}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: daysSinceLast === 0 ? 'var(--green)' : daysSinceLast <= 2 ? 'var(--gold)' : 'var(--orange)' }}>
            {daysSinceLast === null ? '—' : daysSinceLast === 0 ? 'TODAY' : `${daysSinceLast}d`}
          </div>
          <div className="stat-label">Since Last Workout</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">🏆 Personal Records</div>
          {prs.map((pr, i) => (
            <div className="pr-row" key={i}>
              <div>
                <span className={`badge ${getGroupColorClass(pr.group)}`}>{pr.group.split(' / ')[0]}</span>
                <span className="pr-name" style={{ marginLeft: 8 }}>{pr.exercise}</span>
              </div>
              <div className={`pr-val accent-${getGroupColorClass(pr.group)}`}>{pr.lbs} lbs</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">📅 Recent Sessions</div>
          {recentSessions.map((s, i) => {
            const [y, m, d] = s.date.split('-')
            const mo = new Date(Number(y), Number(m) - 1, 1)
              .toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
            const cc = getGroupColorClass(s.group)
            const vol = sessionVolume(s.exercises)
            return (
              <div className="recent-session" key={i}>
                <div className="session-date-badge">
                  <div style={{ fontSize: 10 }}>{mo}</div>
                  <div className="session-date-day">{d}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`badge ${cc}`}>{s.group}</span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: cc === 'pull' ? 'var(--blue)' : cc === 'chest' ? 'var(--orange)' : 'var(--green)',
                    }}>
                      {formatVol(vol)} lbs total
                    </span>
                  </div>
                  <div className="session-exercises">
                    {s.exercises.map(e =>
                      `${e.exercise}${e.lbs ? ` · ${e.lbs}` : ''}`
                    ).join('  ·  ')}
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('history')}>
              View All History →
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => onNavigate('log')}>+ Log Today's Workout</button>
        <button className="btn btn-ghost" onClick={() => onNavigate('progress')}>📈 View Progress Charts</button>
      </div>
    </div>
  )
}
