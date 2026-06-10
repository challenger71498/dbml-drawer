import { Suspense, lazy, useCallback, useMemo, useRef, useState } from 'react'
import {
  DbmlCodeEditor,
  type DbmlCodeEditorHandle,
  type DbmlEditorSourceRange,
} from './DbmlCodeEditor'
import { EditorInspector } from './EditorInspector'
import { DiagnosticsIcon, PresetsIcon } from './EditorInspectorIcons'
import { isEditorDevModeEnabled } from '../lib/editor-dev-mode'
import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  type DbmlDiagramSelectionTarget,
} from '../model/dbml-diagram-selection'
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
  const editorRef = useRef<DbmlCodeEditorHandle | null>(null)
  const [isInspectorExpanded, setInspectorExpanded] = useState(false)
  const [hoveredDiagramTarget, setHoveredDiagramTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const [focusedDiagramTarget, setFocusedDiagramTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const {
    documentText,
    setDocumentText,
    diagnostics,
    layoutedDiagram,
    isDiagramPending,
    isDiagramPaused,
  } = useDbmlDocument()
  const activeDiagramTarget = getActiveDiagramSelectionTarget({
    hoveredTarget: hoveredDiagramTarget,
    focusedTarget: focusedDiagramTarget,
  })
  const activeRelationIds = useMemo(
    () => getActiveRelationIds(layoutedDiagram, activeDiagramTarget),
    [activeDiagramTarget, layoutedDiagram],
  )

  const revealSourcePosition = useCallback(
    (source: DbmlDiagramTable['source'] | DbmlDiagramColumn['source']) => {
      const position = getEditorPositionFromSource(source)

      if (!position) {
        return
      }

      editorRef.current?.revealSourceRange(position)
    },
    [],
  )

  const handleDiagramHover = useCallback(
    (target: DbmlDiagramSelectionTarget | null) => {
      setHoveredDiagramTarget((currentTarget) =>
        isSameDiagramSelectionTarget(currentTarget, target)
          ? currentTarget
          : target,
      )
    },
    [],
  )

  const handleTableFocus = useCallback(
    (table: DbmlDiagramTable) => {
      const nextTarget = {
        type: 'table',
        tableId: table.id,
      } satisfies DbmlDiagramSelectionTarget

      setFocusedDiagramTarget((currentTarget) =>
        isSameDiagramSelectionTarget(currentTarget, nextTarget)
          ? currentTarget
          : nextTarget,
      )
      revealSourcePosition(table.source)
    },
    [revealSourcePosition],
  )

  const handleColumnFocus = useCallback(
    (column: DbmlDiagramColumn) => {
      const nextTarget = {
        type: 'column',
        tableId: column.tableId,
        columnId: column.id,
      } satisfies DbmlDiagramSelectionTarget

      setFocusedDiagramTarget((currentTarget) =>
        isSameDiagramSelectionTarget(currentTarget, nextTarget)
          ? currentTarget
          : nextTarget,
      )
      revealSourcePosition(column.source)
    },
    [revealSourcePosition],
  )

  const handleDiagramFocusClear = useCallback(() => {
    setHoveredDiagramTarget((currentTarget) =>
      currentTarget === null ? currentTarget : null,
    )
    setFocusedDiagramTarget((currentTarget) =>
      currentTarget === null ? currentTarget : null,
    )
  }, [])

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
              ref={editorRef}
              value={documentText}
              diagnostics={diagnostics}
              onChange={setDocumentText}
            />
          </div>

          <Suspense fallback={<div className={styles.diagramFallback} />}>
            <DbmlDiagramPreview
              activeRelationIds={activeRelationIds}
              activeTarget={activeDiagramTarget}
              diagram={layoutedDiagram}
              isPending={isDiagramPending}
              isPaused={isDiagramPaused}
              onColumnFocus={handleColumnFocus}
              onColumnHover={handleDiagramHover}
              onFocusClear={handleDiagramFocusClear}
              onTableFocus={handleTableFocus}
              onTableHover={handleDiagramHover}
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

function isSameDiagramSelectionTarget(
  currentTarget: DbmlDiagramSelectionTarget | null,
  nextTarget: DbmlDiagramSelectionTarget | null,
) {
  if (currentTarget === nextTarget) {
    return true
  }

  if (!currentTarget || !nextTarget) {
    return false
  }

  if (
    currentTarget.type !== nextTarget.type ||
    currentTarget.tableId !== nextTarget.tableId
  ) {
    return false
  }

  if (currentTarget.type === 'table') {
    return true
  }

  return (
    nextTarget.type === 'column' &&
    currentTarget.columnId === nextTarget.columnId
  )
}

function getEditorPositionFromSource(
  source: DbmlDiagramTable['source'] | DbmlDiagramColumn['source'],
): DbmlEditorSourceRange | null {
  const token = source.token
  const start = token?.start

  if (
    !start ||
    typeof start.line !== 'number' ||
    typeof start.column !== 'number'
  ) {
    return null
  }

  return {
    lineNumber: start.line,
    column: start.column,
    endLineNumber: token.end?.line,
    endColumn: token.end?.column,
  }
}
