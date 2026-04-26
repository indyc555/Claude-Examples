import { useState, useMemo } from 'react'
import { workoutGroups, getGroupColorClass } from '../data/workoutTypes'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function lastWeight(workouts, group, exercise) {
  const hits = workouts
    .filter(w => w.group === group && w.exercise === exercise && w.lbs != null)
    .sort((a, b) => b.date.localeCompare(a.date))
  return hits[0]?.lbs ?? null
}

export default function LogWorkout({ workouts, onAdd }) {
  const [selectedGroup, setSelectedGroup] = useState(workoutGroups[0])
  const [date, setDate] = useState(today)
  const [rows, setRows] = useState(() => buildRows(workoutGroups[0], workouts))
  const [newExName, setNewExName] = useState('')
  const [toast, setToast] = useState(false)

  function buildRows(group, wk) {
    return group.exercises.map(ex => ({
      exercise: ex.name,
      sets: ex.defaultSets,
      reps: '',
      lbs: '',
      lastLbs: lastWeight(wk, group.name, ex.name),
    }))
  }

  function selectGroup(g) {
    setSelectedGroup(g)
    setRows(buildRows(g, workouts))
  }

  function updateRow(i, field, value) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  function addExercise() {
    const name = newExName.trim().toLowerCase()
    if (!name) return
    setRows(prev => [...prev, {
      exercise: name,
      sets: 4,
      reps: '',
      lbs: '',
      lastLbs: lastWeight(workouts, selectedGroup.name, name),
    }])
    setNewExName('')
  }

  function removeRow(i) {
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit() {
    const filled = rows.filter(r => r.lbs !== '' && !isNaN(Number(r.lbs)))
    if (!filled.length) return
    const entries = filled.map(r => ({
      id: `e${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date,
      group: selectedGroup.name,
      exercise: r.exercise,
      sets: Number(r.sets) || 0,
      reps: r.reps !== '' ? Number(r.reps) : null,
      lbs: Number(r.lbs),
    }))
    onAdd(entries)
    setRows(buildRows(selectedGroup, [...workouts, ...entries]))
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const cc = getGroupColorClass(selectedGroup.name)

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
        LOG WORKOUT
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Select your workout group, fill in your weights, and save.
      </p>

      {/* Group selector */}
      <div className="group-selector">
        {workoutGroups.map(g => (
          <button
            key={g.id}
            className={`group-btn ${g.colorClass} ${selectedGroup.id === g.id ? 'active' : ''}`}
            onClick={() => selectGroup(g)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Date */}
      <div className="date-row">
        <span className="date-label">Date</span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {/* Exercise table */}
      <div className={`card border-${cc} bg-${cc}`} style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="exercise-table">
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Exercise</th>
                <th style={{ width: 70 }}>Sets</th>
                <th style={{ width: 80 }}>Reps</th>
                <th style={{ width: 100 }}>Lbs</th>
                <th style={{ width: 120 }}>Last Weight</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const lbs = Number(row.lbs)
                const delta = row.lbs !== '' && row.lastLbs != null
                  ? lbs - row.lastLbs
                  : null
                const deltaClass = delta === null ? '' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'same'
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{row.exercise}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={row.sets}
                        onChange={e => updateRow(i, 'sets', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="—"
                        value={row.reps}
                        onChange={e => updateRow(i, 'reps', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="lbs"
                        className="lbs-input"
                        value={row.lbs}
                        onChange={e => updateRow(i, 'lbs', e.target.value)}
                      />
                    </td>
                    <td>
                      {row.lastLbs != null ? (
                        <span className={`last-weight ${deltaClass}`}>
                          {row.lastLbs} lbs
                          {delta !== null && delta !== 0 && (
                            <span> {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}</span>
                          )}
                        </span>
                      ) : (
                        <span className="last-weight">First time</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeRow(i)}
                        title="Remove"
                        style={{ padding: '4px 8px', color: 'var(--red)', borderColor: 'transparent' }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add custom exercise */}
      <div className="add-exercise-row">
        <input
          type="text"
          placeholder="Add exercise..."
          value={newExName}
          onChange={e => setNewExName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addExercise()}
        />
        <button className="btn btn-ghost btn-sm" onClick={addExercise}>+ Add</button>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Save Workout
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setRows(buildRows(selectedGroup, workouts))
            setDate(today())
          }}
        >
          Reset
        </button>
      </div>

      {toast && <div className="toast">Workout saved!</div>}
    </div>
  )
}
