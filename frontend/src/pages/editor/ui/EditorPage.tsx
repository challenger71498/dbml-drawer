import {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
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
  SettingsIcon,
} from './EditorInspectorIcons'
import { EditorSidebarShell } from './EditorSidebarShell'
import { EditorSettingsPanel } from './EditorSettingsPanel'
import { isEditorDevModeEnabled } from '../lib/editor-dev-mode'
import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  getActiveTableIds,
  getRelationEndpointColumnIdsForTargets,
  getRelationIdsForTargets,
  type DbmlDiagramSelectionTarget,
} from '../model/dbml-diagram-selection'
import { useDbmlDocument } from '../model/dbml-document'
import {
  type EditorThemeMode,
  useEditorThemePreferences,
} from '../model/editor-theme'
import type { EditorInspectorActivity } from '../model/editor-inspector'
import { EDITOR_COLOR_VARIABLES } from '../../../shared/design-tokens/generated/tokens'
import '../../../shared/design-tokens/generated/tokens.css'
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

const EDITOR_SIDEBAR_DEFAULT_WIDTH = 480
const EDITOR_SIDEBAR_MIN_WIDTH = 320
const EDITOR_SIDEBAR_MAX_WIDTH = 720
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
    workspaceThemeMode,
    codeEditorThemeMode,
    resolvedWorkspaceTheme,
    resolvedCodeEditorTheme,
    isOffscreenRelationProxiesEnabled,
    shouldConnectOffscreenRelationProxyLines,
    offscreenRelationProxyPlacementMode,
    offscreenRelationProxyVisibilityMode,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyVisibilityMode,
  } = useEditorThemePreferences()
  const [codeEditorOverrideThemeMode, setCodeEditorOverrideThemeMode] =
    useState<EditorThemeMode>(() =>
      codeEditorThemeMode === 'workspace' ? 'system' : codeEditorThemeMode,
    )
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
    () =>
      getRelationIdsForTargets(layoutedDiagram, [
        hoveredDiagramTarget,
        focusedDiagramTarget,
      ]),
    [focusedDiagramTarget, hoveredDiagramTarget, layoutedDiagram],
  )
  const focusedRelationIds = useMemo(
    () => getActiveRelationIds(layoutedDiagram, focusedDiagramTarget),
    [focusedDiagramTarget, layoutedDiagram],
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

  const editorPanelId = 'editor-left-sidebar-panel-dbml'

  const pageClassName = [
    styles.editorPage,
    isEditorSidebarExpanded ? styles.editorPageLeftSidebarExpanded : '',
    styles.editorPageWithInspector,
    isInspectorExpanded ? styles.editorPageInspectorExpanded : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleEditorSidebarToggle = useCallback(() => {
    setEditorSidebarExpanded((isExpanded) => !isExpanded)
  }, [])

  const handleCodeEditorThemeOverrideEnabledChange = useCallback(
    (isEnabled: boolean) => {
      setCodeEditorThemeMode(
        isEnabled ? codeEditorOverrideThemeMode : 'workspace',
      )
    },
    [codeEditorOverrideThemeMode, setCodeEditorThemeMode],
  )

  const handleCodeEditorOverrideThemeModeChange = useCallback(
    (mode: EditorThemeMode) => {
      setCodeEditorOverrideThemeMode(mode)
      setCodeEditorThemeMode(mode)
    },
    [setCodeEditorThemeMode],
  )

  const handleEditorSidebarClose = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setEditorSidebarExpanded(false)
      event.currentTarget.blur()
    },
    [],
  )

  const settingsActivity = useMemo<EditorInspectorActivity>(
    () => ({
      id: 'settings',
      label: 'Settings',
      panelLabel: 'Settings',
      icon: <SettingsIcon className={styles.editorActivityIcon} />,
      renderPanel: () => (
        <EditorSettingsPanel
          codeEditorOverrideThemeMode={codeEditorOverrideThemeMode}
          isCodeEditorThemeOverrideEnabled={codeEditorThemeMode !== 'workspace'}
          isOffscreenRelationProxiesEnabled={isOffscreenRelationProxiesEnabled}
          offscreenRelationProxyPlacementMode={
            offscreenRelationProxyPlacementMode
          }
          offscreenRelationProxyVisibilityMode={
            offscreenRelationProxyVisibilityMode
          }
          shouldConnectOffscreenRelationProxyLines={
            shouldConnectOffscreenRelationProxyLines
          }
          workspaceThemeMode={workspaceThemeMode}
          onCodeEditorOverrideThemeModeChange={
            handleCodeEditorOverrideThemeModeChange
          }
          onCodeEditorThemeOverrideEnabledChange={
            handleCodeEditorThemeOverrideEnabledChange
          }
          onOffscreenRelationProxiesEnabledChange={
            setOffscreenRelationProxiesEnabled
          }
          onConnectOffscreenRelationProxyLinesChange={
            setShouldConnectOffscreenRelationProxyLines
          }
          onOffscreenRelationProxyPlacementModeChange={
            setOffscreenRelationProxyPlacementMode
          }
          onOffscreenRelationProxyVisibilityModeChange={
            setOffscreenRelationProxyVisibilityMode
          }
          onWorkspaceThemeModeChange={setWorkspaceThemeMode}
        />
      ),
    }),
    [
      codeEditorOverrideThemeMode,
      codeEditorThemeMode,
      handleCodeEditorOverrideThemeModeChange,
      handleCodeEditorThemeOverrideEnabledChange,
      isOffscreenRelationProxiesEnabled,
      offscreenRelationProxyPlacementMode,
      offscreenRelationProxyVisibilityMode,
      setOffscreenRelationProxyPlacementMode,
      setOffscreenRelationProxyVisibilityMode,
      setOffscreenRelationProxiesEnabled,
      setShouldConnectOffscreenRelationProxyLines,
      shouldConnectOffscreenRelationProxyLines,
      setWorkspaceThemeMode,
      workspaceThemeMode,
    ],
  )

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
        return
      }
    },
    [],
  )

  return (
    <main
      className={pageClassName}
      data-code-editor-theme={resolvedCodeEditorTheme}
      data-code-editor-theme-mode={codeEditorThemeMode}
      data-workspace-theme={resolvedWorkspaceTheme}
      data-workspace-theme-mode={workspaceThemeMode}
    >
      <EditorSidebarShell
        side="left"
        panelPlacement="after-activity-bar"
        label="Editor authoring activities"
        activityBarLabel="Editor authoring activities"
        activityGroups={{
          top: [
            {
              id: 'dbml-editor',
              label: 'DBML editor',
              icon: <DbmlEditorIcon className={styles.editorActivityIcon} />,
              panelId: editorPanelId,
              isActive: isEditorSidebarExpanded,
              isExpanded: isEditorSidebarExpanded,
              onSelect: handleEditorSidebarToggle,
            },
          ],
        }}
        isExpanded={isEditorSidebarExpanded}
        panelWidth={editorSidebarWidth}
        panelId={editorPanelId}
        panelLabel="DBML editor"
        closeLabel="Close DBML editor"
        onClose={handleEditorSidebarClose}
        resizeHandle={{
          label: 'Resize DBML editor',
          min: EDITOR_SIDEBAR_MIN_WIDTH,
          max: EDITOR_SIDEBAR_MAX_WIDTH,
          value: editorSidebarWidth,
          valueText: `${editorSidebarWidth}px`,
          onKeyDown: handleEditorSidebarResizeKeyDown,
          onPointerCancel: handleEditorSidebarResizePointerEnd,
          onPointerDown: handleEditorSidebarResizePointerDown,
          onPointerMove: handleEditorSidebarResizePointerMove,
          onPointerUp: handleEditorSidebarResizePointerEnd,
        }}
      >
        <div className={styles.editorSurface}>
          <DbmlCodeEditor
            ref={editorRef}
            value={documentText}
            diagnostics={diagnostics}
            theme={resolvedCodeEditorTheme}
            onChange={setDocumentText}
          />
        </div>
      </EditorSidebarShell>

      <section
        className={styles.editorWorkspace}
        aria-labelledby="editor-heading"
      >
        <div className={styles.editorToolbar}>
          <div>
            <p className={styles.eyebrow}>DBML</p>
            <h1 id="editor-heading">Editor</h1>
          </div>
          <div className={styles.editorToolbarActions}>
            <span className={styles.documentState}>
              {diagnostics.length === 0 ? 'Valid' : 'Needs attention'}
            </span>
          </div>
        </div>

        <div className={styles.editorContent}>
          <div className={styles.editorMainPane}>
            <Suspense fallback={<div className={styles.diagramFallback} />}>
              <DbmlDiagramPreview
                activeRelationIds={activeRelationIds}
                activeTarget={activeDiagramTarget}
                backgroundColor={EDITOR_COLOR_VARIABLES.diagramGridDot}
                diagram={layoutedDiagram}
                focusedRelationIds={focusedRelationIds}
                focusedTableIds={focusedTableIds}
                focusedTarget={focusedDiagramTarget}
                isOffscreenRelationProxiesEnabled={
                  isOffscreenRelationProxiesEnabled
                }
                offscreenRelationProxyPlacementMode={
                  offscreenRelationProxyPlacementMode
                }
                offscreenRelationProxyVisibilityMode={
                  offscreenRelationProxyVisibilityMode
                }
                shouldConnectOffscreenRelationProxyLines={
                  shouldConnectOffscreenRelationProxyLines
                }
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

      <EditorInspector
        activities={inspectorActivities}
        bottomActivities={[settingsActivity]}
        onExpandedChange={setInspectorExpanded}
      />
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
