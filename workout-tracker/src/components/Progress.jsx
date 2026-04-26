import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { getGroupColorClass } from '../data/workoutTypes'

const GROUP_COLORS = {
  'Pull / Arms':     '#4fc3f7',
  'Chest / Triceps': '#ffa726',
  'Back / Legs':     '#66bb6a',
}

const EXERCISE_PALETTE = [
  '#4fc3f7', '#ffa726', '#66bb6a', '#ab47bc', '#ef5350',
  '#ffd54f', '#26c6da', '#ec407a', '#8d6e63', '#78909c',
]

function shortDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
}

function monthKey(dateStr) {
  const [y, m] = dateStr.split('-')
  const date = new Date(Number(y), Number(m) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d0d2b', border: '1px solid #1c1c4a', borderRadius: 8,
      padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ color: '#7986cb', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value} lbs
        </div>
      ))}
    </div>
  )
}

const FreqTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d0d2b', border: '1px solid #1c1c4a', borderRadius: 8,
      padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ color: '#7986cb', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill, fontWeight: 600 }}>
          {p.name}: {p.value} sessions
        </div>
      ))}
    </div>
  )
}

export default function Progress({ workouts }) {
  const allExercises = useMemo(() => {
    const set = new Set()
    workouts.forEach(w => set.add(`${w.group}||${w.exercise}`))
    return [...set].map(k => {
      const [group, exercise] = k.split('||')
      return { group, exercise, label: exercise }
    }).sort((a, b) => a.exercise.localeCompare(b.exercise))
  }, [workouts])

  const [selectedExercises, setSelectedExercises] = useState(() =>
    allExercises.slice(0, 4).map(e => `${e.group}||${e.exercise}`)
  )

  function toggleEx(key) {
    setSelectedExercises(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  // Weight progression data
  const progressData = useMemo(() => {
    const dateSet = new Set()
    workouts.forEach(w => dateSet.add(w.date))
    const dates = [...dateSet].sort()

    return dates.map(date => {
      const point = { date: shortDate(date), fullDate: date }
      selectedExercises.forEach(key => {
        const [group, exercise] = key.split('||')
        const hit = workouts.find(w => w.date === date && w.group === group && w.exercise === exercise)
        if (hit) point[key] = hit.lbs
      })
      return point
    })
  }, [workouts, selectedExercises])

  // Monthly frequency
  const freqData = useMemo(() => {
    const map = {}
    const sessionKeys = new Set()
    workouts.forEach(w => {
      const sKey = `${w.date}|${w.group}`
      if (!sessionKeys.has(sKey)) {
        sessionKeys.add(sKey)
        const mo = monthKey(w.date)
        if (!map[mo]) map[mo] = { month: mo, 'Pull / Arms': 0, 'Chest / Triceps': 0, 'Back / Legs': 0 }
        map[mo][w.group] = (map[mo][w.group] || 0) + 1
      }
    })
    return Object.values(map)
  }, [workouts])

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
        PROGRESS
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
        Track your weight progression and workout frequency over time.
      </p>

      {/* Weight progression chart */}
      <div className="card section-gap">
        <div className="card-title">Weight Progression (lbs)</div>

        {/* Exercise selector */}
        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          Select exercises to compare:
        </div>
        <div className="exercise-select" style={{ marginBottom: 20 }}>
          {allExercises.map((ex, i) => {
            const key = `${ex.group}||${ex.exercise}`
            const selected = selectedExercises.includes(key)
            const color = EXERCISE_PALETTE[i % EXERCISE_PALETTE.length]
            return (
              <button
                key={key}
                className={`ex-chip ${selected ? 'selected' : ''}`}
                style={selected ? { borderColor: color, color, background: `${color}18` } : {}}
                onClick={() => toggleEx(key)}
              >
                {ex.exercise}
                <span style={{ fontSize: 10, marginLeft: 4, opacity: .6 }}>
                  ({ex.group.split(' / ')[0]})
                </span>
              </button>
            )
          })}
        </div>

        {selectedExercises.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div>Select at least one exercise above.</div>
          </div>
        ) : (
          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c4a" />
                <XAxis dataKey="date" tick={{ fill: '#7986cb', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7986cb', fontSize: 11 }} unit=" lbs" width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => {
                    const [, ex] = value.split('||')
                    return <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{ex}</span>
                  }}
                  wrapperStyle={{ paddingTop: 12 }}
                />
                {selectedExercises.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={EXERCISE_PALETTE[
                      allExercises.findIndex(e => `${e.group}||${e.exercise}` === key) % EXERCISE_PALETTE.length
                    ]}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Frequency bar chart */}
      <div className="card">
        <div className="card-title">Sessions per Month</div>
        <div className="chart-container" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={freqData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c4a" />
              <XAxis dataKey="month" tick={{ fill: '#7986cb', fontSize: 11 }} />
              <YAxis tick={{ fill: '#7986cb', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<FreqTooltip />} />
              <Legend
                formatter={v => <span style={{ fontSize: 12 }}>{v}</span>}
                wrapperStyle={{ paddingTop: 12 }}
              />
              {Object.entries(GROUP_COLORS).map(([group, color]) => (
                <Bar key={group} dataKey={group} stackId="a" fill={color} name={group} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="chart-legend" style={{ marginTop: 8 }}>
          {Object.entries(GROUP_COLORS).map(([g, c]) => (
            <div className="legend-item" key={g}>
              <div className="legend-dot" style={{ background: c }} />
              {g}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
