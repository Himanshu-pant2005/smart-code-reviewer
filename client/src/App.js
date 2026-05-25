import { useState } from 'react'
import './App.css'

function App() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    const data = await response.text()
    setResult(data)
  }

  return (
    <div className="App">
      <h1>SmartCode Reviewer</h1>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        rows={10}
        cols={60}
      />
      <br/>
      <button onClick={handleAnalyze}>Analyze Code</button>
      {result && <pre>{result}</pre>}
    </div>
  )
}

export default App