import { Suspense, lazy, useState } from 'react'
import { DbmlCodeEditor } from './DbmlCodeEditor'
import { isEditorDevModeEnabled } from '../lib/editor-dev-mode'
import { useDbmlDocument } from '../model/dbml-document'
import styles from './EditorPage.module.css'

const DbmlDiagramPreview = lazy(() =>
  import('./DbmlDiagramPreview').then((module) => ({
    default: module.DbmlDiagramPreview,
  })),
)

const EditorDevTools = lazy(() =>
  import('./EditorDevTools').then((module) => ({
    default: module.EditorDevTools,
  })),
)

type EditorPageProps = {
  isEditorDevMode?: boolean
}

export function EditorPage({
  isEditorDevMode = isEditorDevModeEnabled(),
}: EditorPageProps) {
  const [isDiagnosticsCollapsed, setDiagnosticsCollapsed] = useState(false)
  const {
    documentText,
    setDocumentText,
    diagnostics,
    layoutedDiagram,
    isDiagramPending,
    isDiagramPaused,
  } = useDbmlDocument()

  const toggleDiagnostics = () => {
    setDiagnosticsCollapsed((currentValue) => !currentValue)
  }

  const pageClassName = [
    styles.editorPage,
    isEditorDevMode ? styles.editorPageDevMode : '',
    isEditorDevMode && isDiagnosticsCollapsed
      ? styles.editorPageInspectorCollapsed
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className={pageClassName}>
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

      {isEditorDevMode ? (
        <Suspense fallback={<div className={styles.inspectorFallback} />}>
          <EditorDevTools
            diagnostics={diagnostics}
            isDiagnosticsCollapsed={isDiagnosticsCollapsed}
            onToggleDiagnostics={toggleDiagnostics}
            onPresetSelect={setDocumentText}
          />
        </Suspense>
      ) : null}
    </main>
  )
}
