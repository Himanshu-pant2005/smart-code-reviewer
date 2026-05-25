import { diffLines } from 'diff'

function DiffViewer({ originalCode, improvedCode }) {
  if (!originalCode || !improvedCode) return null

  const differences = diffLines(originalCode, improvedCode)

  return (
    <div className="diff-container">
      <div className="diff-panel">
        <div className="diff-header original">Original Code</div>
        <pre className="diff-code">
          {differences.map((part, i) => (
            !part.added && (
              <span key={i} className={part.removed ? 'diff-removed' : 'diff-unchanged'}>
                {part.value}
              </span>
            )
          ))}
        </pre>
      </div>

      <div className="diff-panel">
        <div className="diff-header improved">Improved Code</div>
        <pre className="diff-code">
          {differences.map((part, i) => (
            !part.removed && (
              <span key={i} className={part.added ? 'diff-added' : 'diff-unchanged'}>
                {part.value}
              </span>
            )
          ))}
        </pre>
      </div>
    </div>
  )
}

export default DiffViewer