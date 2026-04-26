import { useState } from 'react'
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

function Stepper({ value, onChange, min = 0, max = 999, step = 1, dim = false }) {
  const dec = () => onChange(Math.max(min, parseFloat((value - step).toFixed(1))))
  const inc = () => onChange(Math.min(max, parseFloat((value + step).toFixed(1))))
  return (
    <div className="stepper">
      <button className="stepper-btn" onClick={dec}>−</button>
      <span className="stepper-val" style={{ color: dim ? 'var(--text-muted)' : 'var(--text)' }}>{value}</span>
      <button className="stepper-btn" onClick={inc}>+</button>
    </div>
  )
}

export default function LogWorkout({ workouts, onAdd }) {
  const [selectedGroup, setSelectedGroup] = useState(workoutGroups[0])
  const [date, setDate] = useState(today)
  const [rows, setRows] = useState(() => buildRows(workoutGroups[0], workouts))
  const [newExName, setNewExName] = useState('')
  const [toast, setToast] = useState(false)

  function buildRows(group, wk) {
    return group.exercises.map(ex => {
      const prev = lastWeight(wk, group.name, ex.name)
      return {
        exercise: ex.name,
        sets: ex.defaultSets,
        reps: 12,
        lbs: prev ?? '',
        lastLbs: prev,
        lbsTouched: false,
      }
    })
  }

  function selectGroup(g) {
    setSelectedGroup(g)
    setRows(buildRows(g, workouts))
  }

  function updateRow(i, field, value) {
    setRows(prev => prev.map((r, idx) => {
      if (idx !== i) return r
      const update = { ...r, [field]: value }
      if (field === 'lbs') update.lbsTouched = true
      return update
    }))
  }

  function setLbs(i, value) {
    setRows(prev => prev.map((r, idx) =>
      idx === i ? { ...r, lbs: value, lbsTouched: true } : r
    ))
  }

  function addExercise() {
    const name = newExName.trim().toLowerCase()
    if (!name) return
    const prev = lastWeight(workouts, selectedGroup.name, name)
    setRows(prev2 => [...prev2, {
      exercise: name,
      sets: 4,
      reps: 12,
      lbs: prev ?? '',
      lastLbs: prev,
      lbsTouched: false,
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
      reps: Number(r.reps) || 12,
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
        Select your workout group, adjust weights, and save.
      </p>

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

      <div className="date-row">
        <span className="date-label">Date</span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className={`card border-${cc} bg-${cc}`} style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="exercise-table">
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Exercise</th>
                <th style={{ width: 110 }}>Sets</th>
                <th style={{ width: 110 }}>Reps</th>
                <th style={{ width: 130 }}>Lbs</th>
                <th style={{ width: 120 }}>Last Weight</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const lbsNum = Number(row.lbs)
                const delta = row.lbsTouched && row.lbs !== '' && row.lastLbs != null
                  ? lbsNum - row.lastLbs : null
                const deltaClass = delta === null ? '' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'same'
                const lbsDim = !row.lbsTouched && row.lastLbs != null && row.lbs !== ''

                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{row.exercise}</td>
                    <td>
                      <Stepper
                        value={row.sets}
                        onChange={v => updateRow(i, 'sets', v)}
                        min={1} max={20} step={1}
                      />
                    </td>
                    <td>
                      <Stepper
                        value={row.reps}
                        onChange={v => updateRow(i, 'reps', v)}
                        min={1} max={100} step={1}
                      />
                    </td>
                    <td>
                      <Stepper
                        value={row.lbs === '' ? 0 : Number(row.lbs)}
                        onChange={v => setLbs(i, v)}
                        min={0} max={999} step={2.5}
                        dim={lbsDim}
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

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSubmit}>Save Workout</button>
        <button className="btn btn-ghost" onClick={() => { setRows(buildRows(selectedGroup, workouts)); setDate(today()) }}>
          Reset
        </button>
      </div>

      {toast && <div className="toast">Workout saved!</div>}
    </div>
  )
}
