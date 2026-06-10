import type { DbmlDiagnostic } from '../model/dbml-diagnostics'
import styles from './EditorPage.module.css'

type DiagnosticsPanelProps = {
  diagnostics: readonly DbmlDiagnostic[]
}

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  const issueLabel =
    diagnostics.length === 1 ? '1 issue' : `${diagnostics.length} issues`

  return (
    <section className={styles.diagnosticsPanel} aria-live="polite">
      <span className={styles.diagnosticsCount}>{issueLabel}</span>

      {diagnostics.length === 0 ? (
        <p className={styles.diagnosticsEmpty}>No diagnostics</p>
      ) : (
        <ul className={styles.diagnosticsList}>
          {diagnostics.map((diagnostic, index) => (
            <li
              className={styles.diagnosticsItem}
              key={`${diagnostic.message}-${index}`}
            >
              <span
                className={`${styles.severityDot} ${
                  diagnostic.severity === 'warning'
                    ? styles.severityDotWarning
                    : styles.severityDotError
                }`}
              />
              <div>
                <p>{diagnostic.message}</p>
                <span>{formatDiagnosticLocation(diagnostic)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function formatDiagnosticLocation(diagnostic: DbmlDiagnostic) {
  if (!diagnostic.line || !diagnostic.column) {
    return 'Location unavailable'
  }

  return `Line ${diagnostic.line}, column ${diagnostic.column}`
}
