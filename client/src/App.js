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
  const [language, setLanguage] = useState('Python')
  const [analysisId, setAnalysisId] = useState(null)

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value)
    setCode('')
    setResult(null)
    setAnalysisId(null)
  }

  const handleAnalyze = async (isReanalyze = false) => {
    if (!code) return
    setLoading(true)
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, isReanalyze, analysisId, language })
      })
      const parsed = await response.json()
      setResult(parsed)
      if (parsed._id) setAnalysisId(parsed._id)
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

  // check if detected language differs from selected
  const hasMismatch = result &&
    result.detectedLanguage &&
    result.detectedLanguage.toLowerCase() !== language.toLowerCase()

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">SmartCode <span className="logo-accent">Reviewer</span></span>
        </div>
        <div className="nav-badge">AI Powered</div>
      </nav>

      <div className="tabs">
        <button className={tab === 'analyze' ? 'tab active' : 'tab'} onClick={() => handleTabSwitch('analyze')}>Analyze</button>
        <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={() => handleTabSwitch('history')}>History</button>
      </div>

      {tab === 'analyze' && (
        <div>
          <div className="editor-header">
            <select value={language} onChange={handleLanguageChange} className="lang-select">
              <option>Python</option>
              <option>JavaScript</option>
              <option>C#</option>
              <option>Java</option>
              <option>C++</option>
              <option>TypeScript</option>
            </select>
            <span className="editor-label">Code Editor</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Paste your ${language} code here...`}
            rows={12}
          />
          <div className="btn-row">
            <button onClick={() => handleAnalyze(false)} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Code'}
            </button>
            {result && (
              <button className="btn-reanalyze" onClick={() => handleAnalyze(true)} disabled={loading}>
                🔄 Re-analyze
              </button>
            )}
          </div>

          {result && (
            <div className="results">

              {/* Language Mismatch Warning */}
              {hasMismatch && (
                <div className="language-warning">
                  ⚠️ Language Mismatch: You selected <strong>{language}</strong> but
                  the code appears to be <strong>{result.detectedLanguage}</strong>.
                  Results may be inaccurate.
                </div>
              )}

              <div className="stats-row">
                <div className="stat-badge bug-stat">🐛 {(result.bugs||[]).length} Bugs</div>
                <div className="stat-badge sec-stat">🔒 {(result.security||[]).length} Security</div>
                <div className="stat-badge opt-stat">⚡ {(result.optimizations||[]).length} Optimizations</div>
              </div>

              <DiffViewer originalCode={code} improvedCode={result.improvedCode} />

              <div className="card bugs">
                <h2>🐛 Bugs</h2>
                {(result.bugs||[]).length === 0
                  ? <p>No bugs found</p>
                  : (result.bugs||[]).map((bug,i) => <p key={i}>{bug}</p>)}
              </div>
              <div className="card security">
                <h2>🔒 Security</h2>
                {(result.security||[]).length === 0
                  ? <p>No issues found</p>
                  : (result.security||[]).map((s,i) => <p key={i}>{s}</p>)}
              </div>
              <div className="card optimizations">
                <h2>⚡ Optimizations</h2>
                {(result.optimizations||[]).map((o,i) => <p key={i}>{o}</p>)}
              </div>
              <div className="card improved">
                <h2>✨ Improved Code</h2>
                <pre>{result.improvedCode}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="history">
          {historyLoading && <p>Loading history...</p>}
          {!historyLoading && history.length === 0 && <p>No analyses yet.</p>}
          {history.map((item) => (
            <div key={item._id} className="history-card"
              onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
              style={{cursor:'pointer'}}>
              <div className="history-meta">🕒 {new Date(item.createdAt).toLocaleString()}</div>
              <pre className="history-code">{item.originalCode}</pre>
              <div className="history-summary">
                <span>🐛 {(item.bugs||[]).length} bugs</span>
                <span>🔒 {(item.security||[]).length} security issues</span>
                <span>⚡ {(item.optimizations||[]).length} optimizations</span>
              </div>
              {expandedId === item._id && (
                <div className="history-expanded"
                  onClick={(e) => e.stopPropagation()}
                  style={{cursor:'default'}}>
                  <div className="card bugs">
                    <h2>🐛 Bugs</h2>
                    {(item.bugs||[]).length === 0 ? <p>No bugs found</p> : item.bugs.map((bug,i) => <p key={i}>{bug}</p>)}
                  </div>
                  <div className="card security">
                    <h2>🔒 Security</h2>
                    {(item.security||[]).length === 0 ? <p>No issues found</p> : item.security.map((s,i) => <p key={i}>{s}</p>)}
                  </div>
                  <div className="card optimizations">
                    <h2>⚡ Optimizations</h2>
                    {(item.optimizations||[]).map((o,i) => <p key={i}>{o}</p>)}
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