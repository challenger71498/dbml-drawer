import { Suspense, lazy } from 'react'
import { DbmlCodeEditor } from './DbmlCodeEditor'
import { DiagnosticsPanel } from './DiagnosticsPanel'
import { useDbmlDocument } from '../model/dbml-document'
import styles from './EditorPage.module.css'

const DbmlDiagramPreview = lazy(() =>
  import('./DbmlDiagramPreview').then((module) => ({
    default: module.DbmlDiagramPreview,
  })),
)

export function EditorPage() {
  const {
    documentText,
    setDocumentText,
    diagnostics,
    layoutedDiagram,
    isDiagramPending,
    isDiagramPaused,
  } = useDbmlDocument()

  return (
    <main className={styles.editorPage}>
      <section
        className={styles.editorWorkspace}
        aria-labelledby="editor-heading"
      >
        <div className={styles.editorToolbar}>
          <div>
            <p className={styles.eyebrow}>DBML</p>
            <h1 id="editor-heading">Editor</h1>
          </div>
          <span className={styles.documentState}>
            {diagnostics.length === 0 ? 'Valid' : 'Needs attention'}
          </span>
        </div>

        <div className={styles.editorContent}>
          <div className={styles.editorSurface}>
            <DbmlCodeEditor
              value={documentText}
              diagnostics={diagnostics}
              onChange={setDocumentText}
            />
          </div>

          <Suspense fallback={<div className={styles.diagramFallback} />}>
            <DbmlDiagramPreview
              diagram={layoutedDiagram}
              isPending={isDiagramPending}
              isPaused={isDiagramPaused}
            />
          </Suspense>
        </div>
      </section>

      <aside className={styles.inspectorSidebar}>
        <DiagnosticsPanel diagnostics={diagnostics} />
      </aside>
    </main>
  )
}
