import { useState, useEffect } from 'react'
import './App.css'

interface LogEntry {
  event: string
  timestamp: string
}

interface ButtonConfig {
  text: string
  isDefault?: boolean
}

const DEFAULT_BUTTONS = [
  "run 1 mile",
  "run 2 miles",
  "run 3 miles",
  "walk 1 mile",
  "walk 2 miles",
  "walk 3 miles",
  "stretch 5 minutes",
  "breakfast",
  "lunch",
  "dinner",
]

function App() {
  const [log, setLog] = useState<LogEntry[]>([])
  const [deleteMode, setDeleteMode] = useState(false)
  const [customButtons, setCustomButtons] = useState<ButtonConfig[]>([])
  const [deletedDefaultButtons, setDeletedDefaultButtons] = useState<string[]>([])

  useEffect(() => {
    const savedLog = localStorage.getItem('activityLog')
    const savedCustomButtons = localStorage.getItem('customButtons')
    const savedDeletedDefaultButtons = localStorage.getItem('deletedDefaultButtons')
    if (savedLog) setLog(JSON.parse(savedLog))
    if (savedCustomButtons) setCustomButtons(JSON.parse(savedCustomButtons))
    if (savedDeletedDefaultButtons) setDeletedDefaultButtons(JSON.parse(savedDeletedDefaultButtons))
  }, [])

  // Combine default and custom buttons, excluding deleted default buttons
  const buttons = [
    ...DEFAULT_BUTTONS
      .filter(text => !deletedDefaultButtons.includes(text))
      .map(text => ({ text, isDefault: true })),
    ...customButtons
  ].sort((a, b) => a.text.localeCompare(b.text))

  const logEvent = (event: string) => {
    const newEntry = {
      event,
      timestamp: new Date().toISOString()
    }
    const updatedLog = [...log, newEntry]
    setLog(updatedLog)
    localStorage.setItem('activityLog', JSON.stringify(updatedLog))
  }

  const deleteLogEntry = (index: number) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      const actualIndex = log.length - 1 - index
      const updatedLog = log.filter((_, i) => i !== actualIndex)
      setLog(updatedLog)
      localStorage.setItem('activityLog', JSON.stringify(updatedLog))
    }
  }

  const addNewButton = () => {
    const newActivity = window.prompt("Enter new activity:")
    if (!newActivity?.trim()) return

    const trimmedActivity = newActivity.trim()

    // If this was a deleted default button, remove it from deletedDefaultButtons
    if (DEFAULT_BUTTONS.includes(trimmedActivity)) {
      const updatedDeletedButtons = deletedDefaultButtons.filter(text => text !== trimmedActivity)
      setDeletedDefaultButtons(updatedDeletedButtons)
      localStorage.setItem('deletedDefaultButtons', JSON.stringify(updatedDeletedButtons))
      return
    }

    // Otherwise add as a custom button
    const updatedButtons = [...customButtons, { text: trimmedActivity }]
    setCustomButtons(updatedButtons)
    localStorage.setItem('customButtons', JSON.stringify(updatedButtons))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return `${days[date.getDay()]}, ${date.toLocaleDateString()}`
  }

  return (
    <div className="app">
      <h1>slog</h1>

      <div className="button-grid">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => {
              if (deleteMode) {
                if (window.confirm(`Delete "${button.text}" button?`)) {
                  if (button.isDefault) {
                    // Add to deleted default buttons
                    const updatedDeletedButtons = [...deletedDefaultButtons, button.text]
                    setDeletedDefaultButtons(updatedDeletedButtons)
                    localStorage.setItem('deletedDefaultButtons', JSON.stringify(updatedDeletedButtons))
                  } else {
                    // Remove from custom buttons
                    const updatedButtons = customButtons.filter(btn => btn.text !== button.text)
                    setCustomButtons(updatedButtons)
                    localStorage.setItem('customButtons', JSON.stringify(updatedButtons))
                  }
                  setDeleteMode(false)
                }
              } else {
                logEvent(button.text)
              }
            }}
            className={`activity-button ${deleteMode ? 'delete-mode' : ''}`}
          >
            {button.text}
          </button>
        ))}
        <button
          onClick={addNewButton}
          className="add-activity-button"
          title="Add new activity"
        >
          +
        </button>
        &nbsp;&nbsp;&nbsp;
        <button
          onClick={() => setDeleteMode(!deleteMode)}
          className={`delete-activity-button ${deleteMode ? 'active' : ''}`}
          title={deleteMode ? "Cancel delete" : "Delete an activity"}
        >
          🗑️
        </button>
      </div>

      <div className="log-container">
        {log.slice().reverse().map((entry, index) => (
          <div key={index} className="log-entry">
            <div className="log-content">
              <div className="log-date">{formatDate(entry.timestamp)}</div>
              <div className="log-event">{entry.event}</div>
            </div>
            <button
              onClick={() => deleteLogEntry(index)}
              className="log-delete-button"
              title="Delete log entry"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
