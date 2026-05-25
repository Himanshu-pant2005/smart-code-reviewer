import { useState } from 'react'
import './App.css'
import DiffViewer from './components/DiffViewer'

function App() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('analyze')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const handleAnalyze = async () => {
    if (!code) return
    setLoading(true)
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const parsed = await response.json()
      setResult(parsed)
    } catch (err) {
      alert('Analysis failed, try again')
    }
    setLoading(false)
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await fetch('/history')
      const data = await response.json()
      setHistory(data)
    } catch (err) {
      alert('Could not load history')
    }
    setHistoryLoading(false)
  }

  const handleTabSwitch = (t) => {
    setTab(t)
    if (t === 'history') fetchHistory()
  }

  return (
    <div className="App">
      <h1>SmartCode Reviewer</h1>
      <p className="subtitle">AI-Powered Code Analysis & Optimization Platform</p>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={tab === 'analyze' ? 'tab active' : 'tab'}
          onClick={() => handleTabSwitch('analyze')}
        >
          Analyze
        </button>
        <button
          className={tab === 'history' ? 'tab active' : 'tab'}
          onClick={() => handleTabSwitch('history')}
        >
          History
        </button>
      </div>

      {/* Analyze Tab */}
      {tab === 'analyze' && (
        <div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={10}
            cols={60}
          />
          <br/>
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </button>

          {result && (
            <div className="results">
              <div className="card bugs">
                <h2>🐛 Bugs</h2>
                {(result.bugs || []).length === 0
                  ? <p>No bugs found</p>
                  : (result.bugs || []).map((bug, i) => <p key={i}>{bug}</p>)}
              </div>
              <div className="card security">
                <h2>🔒 Security</h2>
                {(result.security || []).length === 0
                  ? <p>No issues found</p>
                  : (result.security || []).map((s, i) => <p key={i}>{s}</p>)}
              </div>
              <div className="card optimizations">
                <h2>⚡ Optimizations</h2>
                {(result.optimizations || []).map((o, i) => <p key={i}>{o}</p>)}
              </div>
              <div className="card improved">
                <h2>✨ Improved Code</h2>
                <pre>{result.improvedCode}</pre>
              </div>
              <DiffViewer 
                originalCode={code} 
                improvedCode={result.improvedCode} 
              />
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="history">
          {historyLoading && <p>Loading history...</p>}
          {!historyLoading && history.length === 0 && <p>No analyses yet.</p>}
          {history.map((item) => (
  <div key={item._id} className="history-card"
       onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
       style={{cursor: 'pointer'}}>
    
    <div className="history-meta">
      🕒 {new Date(item.createdAt).toLocaleString()}
    </div>
    <pre className="history-code">{item.originalCode}</pre>
    <div className="history-summary">
      <span>🐛 {item.bugs.length} bugs</span>
      <span>🔒 {item.security.length} security issues</span>
      <span>⚡ {item.optimizations.length} optimizations</span>
    </div>

    {expandedId === item._id && (
      <div className="history-expanded">
        <div className="card bugs">
          <h2>🐛 Bugs</h2>
          {item.bugs.length === 0 ? <p>No bugs found</p> : item.bugs.map((bug, i) => <p key={i}>{bug}</p>)}
        </div>
        <div className="card security">
          <h2>🔒 Security</h2>
          {item.security.length === 0 ? <p>No issues found</p> : item.security.map((s, i) => <p key={i}>{s}</p>)}
        </div>
        <div className="card optimizations">
          <h2>⚡ Optimizations</h2>
          {item.optimizations.map((o, i) => <p key={i}>{o}</p>)}
        </div>
        <div className="card improved">
          <h2>✨ Improved Code</h2>
          <pre>{item.improvedCode}</pre>
        </div>
      </div>
    )}
  </div>
))}
        </div>
      )}

    </div>
  )
}

export default App