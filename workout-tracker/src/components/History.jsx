import { useState, useMemo } from 'react'
import { getGroupColorClass } from '../data/workoutTypes'

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: '2-digit',
  })
}

export default function History({ workouts, onDeleteSession }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const sessions = useMemo(() => {
    const map = {}
    workouts.forEach(w => {
      const key = `${w.date}|${w.group}`
      if (!map[key]) map[key] = { date: w.date, group: w.group, exercises: [] }
      map[key].exercises.push(w)
    })
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date))
  }, [workouts])

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.group === filter)

  const groups = [...new Set(sessions.map(s => s.group))]

  function toggle(key) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleDelete(date, group) {
    const key = `${date}|${group}`
    if (confirmDelete === key) {
      onDeleteSession(date, group)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(key)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
        WORKOUT HISTORY
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        {sessions.length} sessions logged
      </p>

      {/* Filters */}
      <div className="filter-bar">
        <button
          className={`filter-chip ${filter === 'all' ? 'active-pull' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Groups
        </button>
        {groups.map(g => {
          const cc = getGroupColorClass(g)
          return (
            <button
              key={g}
              className={`filter-chip ${filter === g ? `active-${cc}` : ''}`}
              onClick={() => setFilter(g === filter ? 'all' : g)}
            >
              {g}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No sessions found</div>
        </div>
      )}

      {filtered.map(s => {
        const key = `${s.date}|${s.group}`
        const cc = getGroupColorClass(s.group)
        const isOpen = expanded[key]
        const isConfirm = confirmDelete === key

        return (
          <div className="session-card" key={key}>
            <div className="session-header" onClick={() => toggle(key)}>
              <div className="session-meta">
                <span className={`badge ${cc}`}>{s.group}</span>
                <span className="session-date-text">{formatDate(s.date)}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {s.exercises.length} exercises
                </span>
              </div>
              <div className="session-actions" onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(s.date, s.group)}
                >
                  {isConfirm ? 'Confirm?' : 'Delete'}
                </button>
                <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: '0 4px 8px' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Sets</th>
                      <th>Reps</th>
                      <th>Lbs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.exercises.map((e, i) => (
                      <tr key={i}>
                        <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{e.exercise}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{e.sets}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{e.reps ?? '—'}</td>
                        <td style={{ fontWeight: 700, color: `var(--${cc === 'pull' ? 'blue' : cc === 'chest' ? 'orange' : 'green'})` }}>
                          {e.lbs} lbs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
