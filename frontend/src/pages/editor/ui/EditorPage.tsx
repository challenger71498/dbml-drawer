import { Suspense, lazy, useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivitySidebar,
  useActivitySidebar,
} from '@/shared/ui/activity-sidebar'
import {
  DbmlCodeEditor,
  type DbmlCodeEditorHandle,
  type DbmlEditorSourceRange,
} from './DbmlCodeEditor'
import { EditorInspector } from './EditorInspector'
import {
  DatabaseIcon,
  DbmlEditorIcon,
  DiagramSettingsIcon,
  DiagnosticsIcon,
  PresetsIcon,
  SettingsIcon,
} from './EditorInspectorIcons'
import { EditorSettingsPanel } from './EditorSettingsPanel'
import { EditorDiagramExportControl } from './EditorDiagramExportControl'
import { isEditorDevModeEnabled } from '../lib/editor-dev-mode'
import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  getActiveTableIds,
  getRelationEndpointColumnIdsForTargets,
  getRelationIdsForTargets,
  isSameDiagramSelectionTarget,
  type DbmlDiagramSelectionTarget,
} from '../model/dbml-diagram-selection'
import { useDbmlDocument } from '../model/dbml-document'
import { useEditorDiagramInteractionStore } from '../model/editor-diagram-interaction-store'
import {
  EDITOR_SIDEBAR_DEFAULT_WIDTH,
  EDITOR_SIDEBAR_KEYBOARD_STEP,
  EDITOR_SIDEBAR_MAX_WIDTH,
  EDITOR_SIDEBAR_MIN_WIDTH,
  type EditorThemeMode,
  useEditorSettings,
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

export function EditorPage({
  isEditorDevMode = isEditorDevModeEnabled(),
}: EditorPageProps) {
  const editorRef = useRef<DbmlCodeEditorHandle | null>(null)
  const [isInspectorExpanded, setInspectorExpanded] = useState(false)
  const [hoveredDiagramTarget, setHoveredDiagramTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const focusedDiagramTarget = useEditorDiagramInteractionStore(
    (state) => state.focusedTarget,
  )
  const focusDiagramTarget = useEditorDiagramInteractionStore(
    (state) => state.focusTarget,
  )
  const clearDiagramFocus = useEditorDiagramInteractionStore(
    (state) => state.clearFocus,
  )
  const {
    workspaceThemeMode,
    codeEditorThemeMode,
    codeEditorOverrideThemeMode,
    resolvedWorkspaceTheme,
    resolvedCodeEditorTheme,
    isOffscreenRelationProxiesEnabled,
    shouldConnectOffscreenRelationProxyLines,
    shouldAvoidOffscreenRelationProxyActiveNodes,
    offscreenRelationProxyCollisionMode,
    offscreenRelationProxyPlacementMode,
    offscreenRelationProxyVisibilityMode,
    offscreenRelationProxyTransitionMode,
    relationLineStyle,
    relationHighlightMode,
    editorSidebarWidth,
    isEditorSidebarExpanded,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
    setCodeEditorOverrideThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setShouldAvoidOffscreenRelationProxyActiveNodes,
    setOffscreenRelationProxyCollisionMode,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyVisibilityMode,
    setOffscreenRelationProxyTransitionMode,
    setRelationLineStyle,
    setRelationHighlightMode,
    setEditorSidebarWidth,
    setEditorSidebarExpanded,
  } = useEditorSettings()
  const editorSidebar = useActivitySidebar<'dbml-editor'>({
    defaultActiveActivityId: 'dbml-editor',
    defaultExpanded: isEditorSidebarExpanded,
    defaultWidth: EDITOR_SIDEBAR_DEFAULT_WIDTH,
    isExpanded: isEditorSidebarExpanded,
    keyboardStep: EDITOR_SIDEBAR_KEYBOARD_STEP,
    maxWidth: EDITOR_SIDEBAR_MAX_WIDTH,
    minWidth: EDITOR_SIDEBAR_MIN_WIDTH,
    resizeHandleEdge: 'right',
    width: editorSidebarWidth,
    onExpandedChange: setEditorSidebarExpanded,
    onWidthChange: setEditorSidebarWidth,
  })
  const {
    documentText,
    setDocumentText,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    selectLayoutAlgorithm,
    setSelectedLayoutOptionValue,
    diagnostics,
    documentMetadata,
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

      focusDiagramTarget(nextTarget)
      revealSourcePosition(table.source)
    },
    [focusDiagramTarget, revealSourcePosition],
  )

  const handleColumnFocus = useCallback(
    (column: DbmlDiagramColumn) => {
      const nextTarget = {
        type: 'column',
        tableId: column.tableId,
        columnId: column.id,
      } satisfies DbmlDiagramSelectionTarget

      focusDiagramTarget(nextTarget)
      revealSourcePosition(column.source)
    },
    [focusDiagramTarget, revealSourcePosition],
  )

  const handleDiagramFocusClear = useCallback(() => {
    setHoveredDiagramTarget((currentTarget) =>
      currentTarget === null ? currentTarget : null,
    )
    clearDiagramFocus()
  }, [clearDiagramFocus])

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
        icon: <DiagnosticsIcon />,
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
        icon: <PresetsIcon />,
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
        icon: <DiagramSettingsIcon />,
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
  const editorActivityState = editorSidebar.getActivityState('dbml-editor')

  const pageClassName = [
    styles.editorPage,
    editorSidebar.isExpanded ? styles.editorPageLeftSidebarExpanded : '',
    styles.editorPageWithInspector,
    isInspectorExpanded ? styles.editorPageInspectorExpanded : '',
  ]
    .filter(Boolean)
    .join(' ')

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
    },
    [setCodeEditorOverrideThemeMode],
  )

  const settingsActivity = useMemo<EditorInspectorActivity>(
    () => ({
      id: 'settings',
      label: 'Settings',
      panelLabel: 'Settings',
      icon: <SettingsIcon />,
      renderPanel: () => (
        <EditorSettingsPanel
          codeEditorOverrideThemeMode={codeEditorOverrideThemeMode}
          isCodeEditorThemeOverrideEnabled={codeEditorThemeMode !== 'workspace'}
          isOffscreenRelationProxiesEnabled={isOffscreenRelationProxiesEnabled}
          offscreenRelationProxyCollisionMode={
            offscreenRelationProxyCollisionMode
          }
          offscreenRelationProxyPlacementMode={
            offscreenRelationProxyPlacementMode
          }
          offscreenRelationProxyVisibilityMode={
            offscreenRelationProxyVisibilityMode
          }
          offscreenRelationProxyTransitionMode={
            offscreenRelationProxyTransitionMode
          }
          relationLineStyle={relationLineStyle}
          relationHighlightMode={relationHighlightMode}
          shouldConnectOffscreenRelationProxyLines={
            shouldConnectOffscreenRelationProxyLines
          }
          shouldAvoidOffscreenRelationProxyActiveNodes={
            shouldAvoidOffscreenRelationProxyActiveNodes
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
          onAvoidOffscreenRelationProxyActiveNodesChange={
            setShouldAvoidOffscreenRelationProxyActiveNodes
          }
          onOffscreenRelationProxyCollisionModeChange={
            setOffscreenRelationProxyCollisionMode
          }
          onOffscreenRelationProxyPlacementModeChange={
            setOffscreenRelationProxyPlacementMode
          }
          onOffscreenRelationProxyVisibilityModeChange={
            setOffscreenRelationProxyVisibilityMode
          }
          onOffscreenRelationProxyTransitionModeChange={
            setOffscreenRelationProxyTransitionMode
          }
          onRelationLineStyleChange={setRelationLineStyle}
          onRelationHighlightModeChange={setRelationHighlightMode}
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
      offscreenRelationProxyCollisionMode,
      offscreenRelationProxyPlacementMode,
      offscreenRelationProxyTransitionMode,
      offscreenRelationProxyVisibilityMode,
      relationHighlightMode,
      relationLineStyle,
      setShouldAvoidOffscreenRelationProxyActiveNodes,
      setOffscreenRelationProxyCollisionMode,
      setOffscreenRelationProxyPlacementMode,
      setOffscreenRelationProxyTransitionMode,
      setOffscreenRelationProxyVisibilityMode,
      setOffscreenRelationProxiesEnabled,
      setRelationHighlightMode,
      setRelationLineStyle,
      setShouldConnectOffscreenRelationProxyLines,
      shouldConnectOffscreenRelationProxyLines,
      shouldAvoidOffscreenRelationProxyActiveNodes,
      setWorkspaceThemeMode,
      workspaceThemeMode,
    ],
  )

  return (
    <main
      className={pageClassName}
      data-code-editor-theme={resolvedCodeEditorTheme}
      data-code-editor-theme-mode={codeEditorThemeMode}
      data-workspace-theme={resolvedWorkspaceTheme}
      data-workspace-theme-mode={workspaceThemeMode}
    >
      <ActivitySidebar
        side="left"
        panelPlacement="after-activity-bar"
        label="Editor authoring activities"
        activityBarLabel="Editor authoring activities"
        activityGroups={{
          top: [
            {
              id: 'dbml-editor',
              label: 'DBML editor',
              icon: <DbmlEditorIcon />,
              panelId: editorPanelId,
              isActive: editorActivityState.isActive,
              isExpanded: editorActivityState.isExpanded,
              onSelect: (event) =>
                editorSidebar.selectActivity('dbml-editor', event),
            },
          ],
        }}
        isExpanded={editorSidebar.isExpanded}
        panelWidth={editorSidebar.panelWidth}
        panelId={editorPanelId}
        panelLabel="DBML editor"
        closeLabel="Close DBML editor"
        onClose={editorSidebar.close}
        resizeHandle={editorSidebar.getResizeHandle({
          label: 'Resize DBML editor',
        })}
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
      </ActivitySidebar>

      <section className={styles.editorWorkspace} aria-label="Editor workspace">
        <header
          className={styles.editorToolbar}
          aria-labelledby="editor-heading"
        >
          <div className={styles.editorHeaderMetadata}>
            <h1 id="editor-heading">{documentMetadata.projectName}</h1>
            {documentMetadata.note ? <p>{documentMetadata.note}</p> : null}
          </div>
          <div className={styles.editorToolbarActions}>
            <EditorDiagramExportControl
              diagram={layoutedDiagram}
              focusedTarget={focusedDiagramTarget}
              projectName={documentMetadata.projectName}
              relationHighlightMode={relationHighlightMode}
              relationLineStyle={relationLineStyle}
              resolvedWorkspaceTheme={resolvedWorkspaceTheme}
            />
          </div>
        </header>

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
                offscreenRelationProxyCollisionMode={
                  offscreenRelationProxyCollisionMode
                }
                offscreenRelationProxyPlacementMode={
                  offscreenRelationProxyPlacementMode
                }
                offscreenRelationProxyVisibilityMode={
                  offscreenRelationProxyVisibilityMode
                }
                offscreenRelationProxyTransitionMode={
                  offscreenRelationProxyTransitionMode
                }
                shouldConnectOffscreenRelationProxyLines={
                  shouldConnectOffscreenRelationProxyLines
                }
                shouldAvoidOffscreenRelationProxyActiveNodes={
                  shouldAvoidOffscreenRelationProxyActiveNodes
                }
                isPending={isDiagramPending}
                isPaused={isDiagramPaused}
                validationMessage={diagnostics[0]?.message ?? null}
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

        {documentMetadata.databaseType ? (
          <footer className={styles.editorFooter}>
            <DatabaseIcon className={styles.editorFooterDatabaseIcon} />
            <span className={styles.editorFooterDatabaseType}>
              {documentMetadata.databaseType}
            </span>
          </footer>
        ) : null}
      </section>

      <EditorInspector
        activities={inspectorActivities}
        bottomActivities={[settingsActivity]}
        onExpandedChange={setInspectorExpanded}
      />
    </main>
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
