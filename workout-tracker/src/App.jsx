import { useState, useEffect, useRef } from 'react'
import Dashboard from './components/Dashboard'
import LogWorkout from './components/LogWorkout'
import History from './components/History'
import Progress from './components/Progress'
import { historicalData } from './data/historicalData'
import { loadRemoteWorkouts, saveRemoteWorkouts } from './firebase'
import Gate, { gatePassed } from './Gate'

function mergeById(local, remote) {
  const byId = new Map(local.map(w => [w.id, w]))
  remote.forEach(w => { if (w.id) byId.set(w.id, w) })
  return Array.from(byId.values())
}

export default function App() {
  const [unlocked, setUnlocked] = useState(gatePassed())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [workouts, setWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('ironlog_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (_) {}
    return historicalData
  })
  const hasMerged = useRef(false)

  useEffect(() => {
    localStorage.setItem('ironlog_v1', JSON.stringify(workouts))
    if (hasMerged.current) saveRemoteWorkouts(workouts)
  }, [workouts])

  useEffect(() => {
    if (!unlocked) return
    loadRemoteWorkouts().then(remote => {
      if (remote) setWorkouts(prev => mergeById(prev, remote))
      hasMerged.current = true
    })
  }, [unlocked])

  if (!unlocked) {
    return <Gate onUnlock={() => setUnlocked(true)} />
  }

  const addWorkoutEntries = (entries) => {
    setWorkouts(prev => [...prev, ...entries])
  }

  const deleteSession = (date, group) => {
    setWorkouts(prev => prev.filter(w => !(w.date === date && w.group === group)))
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'log', label: 'Log Workout' },
    { id: 'history', label: 'History' },
    { id: 'progress', label: 'Progress' },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">🏋️</span>
            <div>
              <div className="brand-name">IRON LOG</div>
              <div className="brand-tagline">Track · Lift · Progress</div>
            </div>
          </div>
          <nav className="nav-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard workouts={workouts} onNavigate={setActiveTab} />
        )}
        {activeTab === 'log' && (
          <LogWorkout workouts={workouts} onAdd={addWorkoutEntries} />
        )}
        {activeTab === 'history' && (
          <History workouts={workouts} onDeleteSession={deleteSession} />
        )}
        {activeTab === 'progress' && (
          <Progress workouts={workouts} />
        )}
      </main>
    </div>
  )
}
