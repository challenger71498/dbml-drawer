import {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  DbmlCodeEditor,
  type DbmlCodeEditorHandle,
  type DbmlEditorSourceRange,
} from './DbmlCodeEditor'
import { EditorInspector } from './EditorInspector'
import {
  DbmlEditorIcon,
  DiagramSettingsIcon,
  DiagnosticsIcon,
  PresetsIcon,
} from './EditorInspectorIcons'
import { isEditorDevModeEnabled } from '../lib/editor-dev-mode'
import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  getActiveTableIds,
  getRelationEndpointColumnIdsForTargets,
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

const DiagramSettingsActivityPanel = lazy(() =>
  import('./DiagramSettingsActivityPanel').then((module) => ({
    default: module.DiagramSettingsActivityPanel,
  })),
)

type EditorPageProps = {
  isEditorDevMode?: boolean
}

const EDITOR_SIDEBAR_DEFAULT_WIDTH = 384
const EDITOR_SIDEBAR_MIN_WIDTH = 320
const EDITOR_SIDEBAR_MAX_WIDTH = 672
const EDITOR_SIDEBAR_KEYBOARD_STEP = 24

export function EditorPage({
  isEditorDevMode = isEditorDevModeEnabled(),
}: EditorPageProps) {
  const editorRef = useRef<DbmlCodeEditorHandle | null>(null)
  const editorSidebarResizeRef = useRef<{
    startX: number
    startWidth: number
  } | null>(null)
  const [editorSidebarWidth, setEditorSidebarWidth] = useState(
    EDITOR_SIDEBAR_DEFAULT_WIDTH,
  )
  const [isEditorSidebarExpanded, setEditorSidebarExpanded] = useState(true)
  const [isInspectorExpanded, setInspectorExpanded] = useState(false)
  const [hoveredDiagramTarget, setHoveredDiagramTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const [focusedDiagramTarget, setFocusedDiagramTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const {
    documentText,
    setDocumentText,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    selectLayoutAlgorithm,
    setSelectedLayoutOptionValue,
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
  const focusedTableIds = useMemo(
    () => getActiveTableIds(layoutedDiagram, focusedDiagramTarget),
    [focusedDiagramTarget, layoutedDiagram],
  )
  const activeRelationEndpointColumnIds = useMemo(
    () =>
      getRelationEndpointColumnIdsForTargets(layoutedDiagram, [
        activeDiagramTarget,
        focusedDiagramTarget,
      ]),
    [activeDiagramTarget, focusedDiagramTarget, layoutedDiagram],
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
      {
        id: 'diagram-settings',
        label: 'Diagram settings',
        panelLabel: 'Diagram settings',
        icon: <DiagramSettingsIcon className={styles.editorActivityIcon} />,
        renderPanel: () => (
          <Suspense
            fallback={<div className={styles.inspectorPanelFallback} />}
          >
            <DiagramSettingsActivityPanel
              selectedLayoutAlgorithmId={selectedLayoutAlgorithmId}
              selectedLayoutOptionValues={selectedLayoutOptionValues}
              onLayoutAlgorithmSelect={selectLayoutAlgorithm}
              onLayoutOptionChange={setSelectedLayoutOptionValue}
            />
          </Suspense>
        ),
      },
    ]
  }, [
    diagnostics,
    isEditorDevMode,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    selectLayoutAlgorithm,
    setDocumentText,
    setSelectedLayoutOptionValue,
  ])

  const hasInspectorActivities = inspectorActivities.length > 0
  const editorPanelId = 'editor-left-sidebar-panel-dbml'

  const pageClassName = [
    styles.editorPage,
    isEditorSidebarExpanded ? styles.editorPageLeftSidebarExpanded : '',
    hasInspectorActivities ? styles.editorPageWithInspector : '',
    hasInspectorActivities && isInspectorExpanded
      ? styles.editorPageInspectorExpanded
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const pageStyle = useMemo(
    () =>
      ({
        '--editor-left-sidebar-width': `${editorSidebarWidth}px`,
      }) as CSSProperties,
    [editorSidebarWidth],
  )

  const handleEditorSidebarToggle = useCallback(() => {
    setEditorSidebarExpanded((isExpanded) => !isExpanded)
  }, [])

  const handleEditorSidebarResizePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      editorSidebarResizeRef.current = {
        startX: event.clientX,
        startWidth: editorSidebarWidth,
      }
    },
    [editorSidebarWidth],
  )

  const handleEditorSidebarResizePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const resizeState = editorSidebarResizeRef.current

      if (!resizeState) {
        return
      }

      setEditorSidebarWidth(
        clampEditorSidebarWidth(
          resizeState.startWidth + event.clientX - resizeState.startX,
        ),
      )
    },
    [],
  )

  const handleEditorSidebarResizePointerEnd = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
      editorSidebarResizeRef.current = null
    },
    [],
  )

  const handleEditorSidebarResizeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setEditorSidebarWidth((currentWidth) =>
          clampEditorSidebarWidth(currentWidth - EDITOR_SIDEBAR_KEYBOARD_STEP),
        )
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setEditorSidebarWidth((currentWidth) =>
          clampEditorSidebarWidth(currentWidth + EDITOR_SIDEBAR_KEYBOARD_STEP),
        )
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        setEditorSidebarWidth(EDITOR_SIDEBAR_MIN_WIDTH)
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        setEditorSidebarWidth(EDITOR_SIDEBAR_MAX_WIDTH)
      }
    },
    [],
  )

  return (
    <main className={pageClassName} style={pageStyle}>
      <aside
        className={styles.editorLeftActivityBar}
        aria-label="Editor authoring activities"
      >
        <button
          className={`${styles.editorActivityButton} ${
            isEditorSidebarExpanded ? styles.editorActivityButtonActive : ''
          }`}
          type="button"
          aria-controls={editorPanelId}
          aria-expanded={isEditorSidebarExpanded}
          aria-label="DBML editor"
          aria-pressed={isEditorSidebarExpanded}
          title="DBML editor"
          onClick={handleEditorSidebarToggle}
        >
          <DbmlEditorIcon className={styles.editorActivityIcon} />
        </button>
      </aside>

      {isEditorSidebarExpanded ? (
        <section
          className={styles.editorLeftSidebar}
          id={editorPanelId}
          aria-label="DBML editor"
        >
          <div className={styles.editorLeftSidebarHeader}>
            <p>DBML editor</p>
          </div>
          <div className={styles.editorLeftSidebarPanel}>
            <div className={styles.editorSurface}>
              <DbmlCodeEditor
                ref={editorRef}
                value={documentText}
                diagnostics={diagnostics}
                onChange={setDocumentText}
              />
            </div>
          </div>
          <div
            className={styles.editorLeftSidebarResizeHandle}
            role="separator"
            aria-label="Resize DBML editor"
            aria-orientation="vertical"
            aria-valuemin={EDITOR_SIDEBAR_MIN_WIDTH}
            aria-valuemax={EDITOR_SIDEBAR_MAX_WIDTH}
            aria-valuenow={editorSidebarWidth}
            aria-valuetext={`${editorSidebarWidth}px`}
            tabIndex={0}
            onKeyDown={handleEditorSidebarResizeKeyDown}
            onPointerCancel={handleEditorSidebarResizePointerEnd}
            onPointerDown={handleEditorSidebarResizePointerDown}
            onPointerMove={handleEditorSidebarResizePointerMove}
            onPointerUp={handleEditorSidebarResizePointerEnd}
          />
        </section>
      ) : null}

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
          <div className={styles.editorMainPane}>
            <Suspense fallback={<div className={styles.diagramFallback} />}>
              <DbmlDiagramPreview
                activeRelationIds={activeRelationIds}
                activeTarget={activeDiagramTarget}
                diagram={layoutedDiagram}
                focusedTableIds={focusedTableIds}
                focusedTarget={focusedDiagramTarget}
                isPending={isDiagramPending}
                isPaused={isDiagramPaused}
                sourceColumnIds={
                  activeRelationEndpointColumnIds.sourceColumnIds
                }
                referenceColumnIds={
                  activeRelationEndpointColumnIds.referenceColumnIds
                }
                onColumnFocus={handleColumnFocus}
                onColumnHover={handleDiagramHover}
                onFocusClear={handleDiagramFocusClear}
                onTableFocus={handleTableFocus}
                onTableHover={handleDiagramHover}
              />
            </Suspense>
          </div>
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

function clampEditorSidebarWidth(width: number) {
  return Math.min(
    EDITOR_SIDEBAR_MAX_WIDTH,
    Math.max(EDITOR_SIDEBAR_MIN_WIDTH, Math.round(width)),
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
