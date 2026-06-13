import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useOnViewportChange,
  useReactFlow,
  type EdgeTypes,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
  type Viewport,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import {
  mapDbmlDiagramToFlow,
  type DbmlDiagramFlowElements,
  type DbmlTableNodeData,
} from '../lib/dbml-diagram-flow'
import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import {
  createDbmlDiagramFlowProxyState,
  type DbmlDiagramViewport,
  type DbmlOffscreenRelationProxyVisibilityMode,
} from '../lib/dbml-diagram-flow-proxy'
import type { DbmlDiagramSelectionTarget } from '../model/dbml-diagram-selection'
import {
  EDITOR_RELATION_HIGHLIGHT_MODE_OPTIONS,
  useRelationHighlightModeSetting,
  useRelationLineStyleSetting,
  useSetRelationHighlightMode,
  type OffscreenRelationProxyCollisionMode,
  type OffscreenRelationProxyPlacementMode,
  type OffscreenRelationProxyTransitionMode,
} from '../model/editor-theme'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import { EDITOR_COLOR_VARIABLES } from '../../../shared/design-tokens/generated/tokens'
import { DbmlRelationEdge } from './DbmlRelationEdge'
import { DbmlDiagramSelectionViewProvider } from './DbmlDiagramSelectionViewProvider'
import { DbmlDiagramFlowProxyOverlay } from './DbmlDiagramFlowProxyOverlay'
import { DbmlTableNode } from './DbmlTableNode'
import styles from './EditorPage.module.css'

type DbmlDiagramPreviewProps = {
  diagram: LayoutedDbmlDiagram | null
  isPending: boolean
  isPaused: boolean
  backgroundColor?: string
  activeRelationIds?: ReadonlySet<string>
  activeTarget?: DbmlDiagramSelectionTarget | null
  focusedRelationIds?: ReadonlySet<string>
  focusedTableIds?: ReadonlySet<string>
  focusedTarget?: DbmlDiagramSelectionTarget | null
  sourceColumnIds?: ReadonlySet<string>
  referenceColumnIds?: ReadonlySet<string>
  isOffscreenRelationProxiesEnabled?: boolean
  offscreenRelationProxyCollisionMode?: OffscreenRelationProxyCollisionMode
  offscreenRelationProxyPlacementMode?: OffscreenRelationProxyPlacementMode
  offscreenRelationProxyVisibilityMode?: DbmlOffscreenRelationProxyVisibilityMode
  offscreenRelationProxyTransitionMode?: OffscreenRelationProxyTransitionMode
  shouldConnectOffscreenRelationProxyLines?: boolean
  shouldAvoidOffscreenRelationProxyActiveNodes?: boolean
  validationMessage?: string | null
  onTableFocus?: (table: DbmlDiagramTable) => void
  onTableHover?: (target: DbmlDiagramSelectionTarget | null) => void
  onColumnFocus?: (column: DbmlDiagramColumn) => void
  onColumnHover?: (target: DbmlDiagramSelectionTarget | null) => void
  onFocusClear?: () => void
}

const NODE_TYPES = {
  dbmlTable: DbmlTableNode,
} satisfies NodeTypes

const EDGE_TYPES = {
  dbmlRelation: DbmlRelationEdge,
} satisfies EdgeTypes

const EMPTY_FLOW_ELEMENTS: DbmlDiagramFlowElements = {
  nodes: [],
  edges: [],
}

const EMPTY_ACTIVE_RELATION_IDS = new Set<string>()
const EMPTY_ENDPOINT_COLUMN_IDS = new Set<string>()

const NOOP_FOCUS_CLEAR = () => undefined
const NOOP_COLUMN_FOCUS = () => undefined
const NOOP_COLUMN_HOVER = () => undefined

export function DbmlDiagramPreview({
  diagram,
  isPending,
  isPaused,
  backgroundColor = EDITOR_COLOR_VARIABLES.diagramGridDot,
  activeRelationIds = EMPTY_ACTIVE_RELATION_IDS,
  activeTarget = null,
  focusedRelationIds = EMPTY_ACTIVE_RELATION_IDS,
  focusedTableIds = EMPTY_ACTIVE_RELATION_IDS,
  focusedTarget = null,
  sourceColumnIds = EMPTY_ENDPOINT_COLUMN_IDS,
  referenceColumnIds = EMPTY_ENDPOINT_COLUMN_IDS,
  isOffscreenRelationProxiesEnabled = false,
  offscreenRelationProxyCollisionMode = 'legacy',
  offscreenRelationProxyPlacementMode = 'line',
  offscreenRelationProxyVisibilityMode = 'any-overlap',
  offscreenRelationProxyTransitionMode = 'none',
  shouldConnectOffscreenRelationProxyLines = false,
  shouldAvoidOffscreenRelationProxyActiveNodes = false,
  validationMessage = null,
  onTableFocus = () => undefined,
  onTableHover = () => undefined,
  onColumnFocus = NOOP_COLUMN_FOCUS,
  onColumnHover = NOOP_COLUMN_HOVER,
  onFocusClear = NOOP_FOCUS_CLEAR,
}: DbmlDiagramPreviewProps) {
  const relationLineStyle = useRelationLineStyleSetting()
  const relationHighlightMode = useRelationHighlightModeSetting()
  const setRelationHighlightMode = useSetRelationHighlightMode()
  const [hoveredProxyRelationIds, setHoveredProxyRelationIds] =
    useState<ReadonlySet<string> | null>(null)
  const effectiveActiveRelationIds = useMemo(() => {
    if (!hoveredProxyRelationIds || hoveredProxyRelationIds.size === 0) {
      return activeRelationIds
    }

    return new Set([...activeRelationIds, ...hoveredProxyRelationIds])
  }, [activeRelationIds, hoveredProxyRelationIds])
  const elements = useMemo(
    () =>
      diagram
        ? mapDbmlDiagramToFlow(diagram, {
            highlightMode: relationHighlightMode,
            lineStyle: relationLineStyle,
          })
        : EMPTY_FLOW_ELEMENTS,
    [diagram, relationHighlightMode, relationLineStyle],
  )
  const selectionViewState = useMemo(
    () => ({
      activeRelationIds: effectiveActiveRelationIds,
      activeTarget,
      focusedRelationIds,
      focusedTableIds,
      focusedTarget,
      sourceColumnIds,
      referenceColumnIds,
      onColumnFocus,
      onColumnHover,
    }),
    [
      effectiveActiveRelationIds,
      activeTarget,
      focusedRelationIds,
      focusedTableIds,
      focusedTarget,
      sourceColumnIds,
      referenceColumnIds,
      onColumnFocus,
      onColumnHover,
    ],
  )
  const isEmpty = diagram !== null && diagram.tables.length === 0
  const diagramSurfaceRef = useRef<HTMLDivElement | null>(null)

  return (
    <section
      className={styles.diagramPanel}
      aria-label="DBML diagram preview"
      aria-busy={isPending}
    >
      <div className={styles.diagramSurface} ref={diagramSurfaceRef}>
        <div className={styles.diagramOverlayTopLeft}>
          {validationMessage ? (
            <p className={styles.diagramValidationStatus} role="status">
              <span aria-hidden="true">!</span>
              <span>{validationMessage}</span>
            </p>
          ) : null}
          {isPaused ? (
            <p className={styles.diagramStatus}>Preview paused</p>
          ) : null}
        </div>
        <div className={styles.diagramOverlayTopRight}>
          <div
            className={styles.compactRelationStyleControl}
            role="group"
            aria-label="Relation highlight mode"
          >
            {EDITOR_RELATION_HIGHLIGHT_MODE_OPTIONS.map((option) => (
              <button
                aria-pressed={relationHighlightMode === option.value}
                className={[
                  styles.compactRelationStyleButton,
                  relationHighlightMode === option.value
                    ? styles.compactRelationStyleButtonActive
                    : '',
                  relationHighlightMode === option.value &&
                  option.value === 'dynamic'
                    ? styles.compactRelationStyleButtonDynamicActive
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={option.value}
                onClick={() => setRelationHighlightMode(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          {relationHighlightMode === 'dynamic' ? (
            <p className={styles.compactRelationStyleWarning}>
              This option may impact battery life.
            </p>
          ) : null}
        </div>
        <ReactFlowProvider>
          <DbmlDiagramSelectionViewProvider value={selectionViewState}>
            <DiagramCanvas
              backgroundColor={backgroundColor}
              diagram={diagram}
              diagramSurfaceRef={diagramSurfaceRef}
              elements={elements}
              focusedTableIds={focusedTableIds}
              focusedTarget={focusedTarget}
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
              isEmpty={isEmpty}
              onColumnFocus={onColumnFocus}
              onFocusClear={onFocusClear}
              onProxyRelationHover={setHoveredProxyRelationIds}
              onTableFocus={onTableFocus}
              onTableHover={onTableHover}
            />
          </DbmlDiagramSelectionViewProvider>
        </ReactFlowProvider>

        {isEmpty ? (
          <p className={styles.diagramEmpty}>No renderable tables</p>
        ) : null}
      </div>
    </section>
  )
}

type DiagramCanvasProps = {
  backgroundColor: string
  diagram: LayoutedDbmlDiagram | null
  diagramSurfaceRef: RefObject<HTMLDivElement | null>
  elements: DbmlDiagramFlowElements
  focusedTableIds: ReadonlySet<string>
  focusedTarget: DbmlDiagramSelectionTarget | null
  isOffscreenRelationProxiesEnabled: boolean
  offscreenRelationProxyCollisionMode: OffscreenRelationProxyCollisionMode
  offscreenRelationProxyPlacementMode: OffscreenRelationProxyPlacementMode
  offscreenRelationProxyVisibilityMode: DbmlOffscreenRelationProxyVisibilityMode
  offscreenRelationProxyTransitionMode: OffscreenRelationProxyTransitionMode
  shouldConnectOffscreenRelationProxyLines: boolean
  shouldAvoidOffscreenRelationProxyActiveNodes: boolean
  isEmpty: boolean
  onColumnFocus: (column: DbmlDiagramColumn) => void
  onFocusClear: () => void
  onProxyRelationHover: (relationIds: ReadonlySet<string> | null) => void
  onTableFocus: (table: DbmlDiagramTable) => void
  onTableHover: (target: DbmlDiagramSelectionTarget | null) => void
}

type DbmlTableFlowNode = Node<DbmlTableNodeData>

function DiagramCanvas({
  backgroundColor,
  diagram,
  diagramSurfaceRef,
  elements,
  focusedTableIds,
  focusedTarget,
  isOffscreenRelationProxiesEnabled,
  offscreenRelationProxyCollisionMode,
  offscreenRelationProxyPlacementMode,
  offscreenRelationProxyVisibilityMode,
  offscreenRelationProxyTransitionMode,
  shouldConnectOffscreenRelationProxyLines,
  shouldAvoidOffscreenRelationProxyActiveNodes,
  isEmpty,
  onColumnFocus,
  onFocusClear,
  onProxyRelationHover,
  onTableFocus,
  onTableHover,
}: DiagramCanvasProps) {
  const reactFlow = useReactFlow()
  const hasFitInitialViewportRef = useRef(false)
  const [diagramViewport, setDiagramViewport] =
    useState<DbmlDiagramViewport | null>(null)

  const syncDiagramViewport = useCallback(
    (viewport: Viewport) => {
      const bounds = diagramSurfaceRef.current?.getBoundingClientRect()

      if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
        return
      }

      const nextViewport = {
        x: viewport.x,
        y: viewport.y,
        zoom: viewport.zoom,
        width: bounds.width,
        height: bounds.height,
      }

      setDiagramViewport((currentViewport) =>
        areDiagramViewportsEqual(currentViewport, nextViewport)
          ? currentViewport
          : nextViewport,
      )
    },
    [diagramSurfaceRef],
  )

  useOnViewportChange({
    onChange: syncDiagramViewport,
    onEnd: syncDiagramViewport,
  })

  const proxyFlowState = useMemo(
    () =>
      createDbmlDiagramFlowProxyState({
        diagram,
        elements,
        focusedTableIds,
        focusedTarget,
        collisionMode: offscreenRelationProxyCollisionMode,
        isEnabled: isOffscreenRelationProxiesEnabled,
        placementMode: offscreenRelationProxyPlacementMode,
        shouldAvoidActiveNodes: shouldAvoidOffscreenRelationProxyActiveNodes,
        shouldConnectLines: shouldConnectOffscreenRelationProxyLines,
        transitionMode: offscreenRelationProxyTransitionMode,
        viewport: diagramViewport,
        visibilityMode: offscreenRelationProxyVisibilityMode,
      }),
    [
      diagram,
      diagramViewport,
      elements,
      focusedTableIds,
      focusedTarget,
      isOffscreenRelationProxiesEnabled,
      offscreenRelationProxyCollisionMode,
      offscreenRelationProxyPlacementMode,
      offscreenRelationProxyTransitionMode,
      offscreenRelationProxyVisibilityMode,
      shouldAvoidOffscreenRelationProxyActiveNodes,
      shouldConnectOffscreenRelationProxyLines,
    ],
  )

  const handleNodeMouseEnter = useCallback<NodeMouseHandler<DbmlTableFlowNode>>(
    (_, node) => {
      onTableHover({
        type: 'table',
        tableId: node.data.table.id,
      })
    },
    [onTableHover],
  )

  const handleNodeMouseLeave = useCallback<
    NodeMouseHandler<DbmlTableFlowNode>
  >(() => {
    onTableHover(null)
  }, [onTableHover])

  const handleNodeClick = useCallback<NodeMouseHandler<DbmlTableFlowNode>>(
    (_, node) => {
      onTableFocus(node.data.table)
    },
    [onTableFocus],
  )

  const handlePaneClick = useCallback(() => {
    onProxyRelationHover(null)
    onFocusClear()
  }, [onFocusClear, onProxyRelationHover])

  useEffect(() => {
    if (isEmpty) {
      hasFitInitialViewportRef.current = false
      return
    }

    if (hasFitInitialViewportRef.current) {
      return
    }

    hasFitInitialViewportRef.current = true
    window.requestAnimationFrame(() => {
      void reactFlow.fitView({ padding: 0.18, duration: 240 })
      syncDiagramViewport(reactFlow.getViewport())
    })
  }, [isEmpty, reactFlow, syncDiagramViewport])

  useEffect(() => {
    syncDiagramViewport(reactFlow.getViewport())
  }, [elements.nodes, reactFlow, syncDiagramViewport])

  return (
    <>
      <ReactFlow
        nodes={proxyFlowState.flowElements.nodes}
        edges={proxyFlowState.flowElements.edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={handlePaneClick}
        deleteKeyCode={null}
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        panActivationKeyCode={null}
        zoomActivationKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={backgroundColor} gap={20} />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
      {proxyFlowState.proxyLayouts.length > 0 ? (
        <DbmlDiagramFlowProxyOverlay
          proxyLayouts={proxyFlowState.proxyLayouts}
          onProxyActivate={(proxy) => {
            void reactFlow.setCenter(
              proxy.table.position.x + proxy.table.size.width / 2,
              proxy.table.position.y + proxy.table.size.height / 2,
              {
                duration: 240,
                zoom: reactFlow.getZoom(),
              },
            )
          }}
          onProxyColumnFocus={onColumnFocus}
          onProxyHover={onProxyRelationHover}
          onProxyTableFocus={onTableFocus}
        />
      ) : null}
    </>
  )
}

function areDiagramViewportsEqual(
  currentViewport: DbmlDiagramViewport | null,
  nextViewport: DbmlDiagramViewport,
) {
  return (
    currentViewport?.x === nextViewport.x &&
    currentViewport.y === nextViewport.y &&
    currentViewport.zoom === nextViewport.zoom &&
    currentViewport.width === nextViewport.width &&
    currentViewport.height === nextViewport.height
  )
}
