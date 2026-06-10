import { Suspense, lazy, useMemo, useState } from 'react'
import { DbmlCodeEditor } from './DbmlCodeEditor'
import { EditorInspector } from './EditorInspector'
import { DiagnosticsIcon, PresetsIcon } from './EditorInspectorIcons'
import { isEditorDevModeEnabled } from '../lib/editor-dev-mode'
import { useDbmlDocument } from '../model/dbml-document'
import type { EditorInspectorActivity } from '../model/editor-inspector'
import styles from './EditorPage.module.css'

const DbmlDiagramPreview = lazy(() =>
  import('./DbmlDiagramPreview').then((module) => ({
    default: module.DbmlDiagramPreview,
  })),
)

const DiagnosticsPanel = lazy(() =>
  import('./DiagnosticsPanel').then((module) => ({
    default: module.DiagnosticsPanel,
  })),
)

const DbmlPresetActivityPanel = lazy(() =>
  import('./DbmlPresetActivityPanel').then((module) => ({
    default: module.DbmlPresetActivityPanel,
  })),
)

type EditorPageProps = {
  isEditorDevMode?: boolean
}

export function EditorPage({
  isEditorDevMode = isEditorDevModeEnabled(),
}: EditorPageProps) {
  const [isInspectorExpanded, setInspectorExpanded] = useState(false)
  const {
    documentText,
    setDocumentText,
    diagnostics,
    layoutedDiagram,
    isDiagramPending,
    isDiagramPaused,
  } = useDbmlDocument()

  const inspectorActivities = useMemo<
    readonly EditorInspectorActivity[]
  >(() => {
    if (!isEditorDevMode) {
      return []
    }

    return [
      {
        id: 'diagnostics',
        label: 'Diagnostics',
        panelLabel: 'Diagnostics',
        icon: <DiagnosticsIcon className={styles.editorActivityIcon} />,
        renderPanel: () => (
          <Suspense
            fallback={<div className={styles.inspectorPanelFallback} />}
          >
            <DiagnosticsPanel diagnostics={diagnostics} />
          </Suspense>
        ),
      },
      {
        id: 'presets',
        label: 'DBML presets',
        panelLabel: 'DBML presets',
        icon: <PresetsIcon className={styles.editorActivityIcon} />,
        renderPanel: () => (
          <Suspense
            fallback={<div className={styles.inspectorPanelFallback} />}
          >
            <DbmlPresetActivityPanel onPresetSelect={setDocumentText} />
          </Suspense>
        ),
      },
    ]
  }, [diagnostics, isEditorDevMode, setDocumentText])

  const hasInspectorActivities = inspectorActivities.length > 0

  const pageClassName = [
    styles.editorPage,
    hasInspectorActivities ? styles.editorPageWithInspector : '',
    hasInspectorActivities && isInspectorExpanded
      ? styles.editorPageInspectorExpanded
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

      {hasInspectorActivities ? (
        <EditorInspector
          activities={inspectorActivities}
          onExpandedChange={setInspectorExpanded}
        />
      ) : null}
    </main>
  )
}
