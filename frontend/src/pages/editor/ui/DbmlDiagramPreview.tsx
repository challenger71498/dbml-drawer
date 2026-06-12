import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  Position,
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
  type DbmlRelationEdgeData,
  type DbmlRelationEdgeEndpoint,
  type DbmlRelationEdgeEndpointOverride,
  type DbmlTableNodeData,
} from '../lib/map-dbml-diagram-flow'
import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import {
  getOffscreenRelationProxies,
  type DbmlDiagramViewport,
  type DbmlOffscreenRelationProxy,
  type DbmlOffscreenRelationProxyVisibilityMode,
} from '../model/dbml-offscreen-relation-proxies'
import {
  getActiveTableProxyLayoutObstacles,
  getPreviewTopRightControlProxyLayoutObstacle,
  getScaledProxyCardHeight,
  getScaledProxyCardWidth,
  getScaledProxyColumnHeight,
  getScaledProxyHeaderHeight,
  legacyOffscreenRelationProxyLayoutStrategy,
  type DbmlOffscreenRelationProxyLayout as OffscreenRelationProxyLayout,
} from '../model/dbml-offscreen-relation-proxy-layout'
import { getOffscreenRelationProxyTransitionLayouts } from '../model/dbml-offscreen-relation-proxy-transition'
import type { DbmlDiagramSelectionTarget } from '../model/dbml-diagram-selection'
import {
  EDITOR_RELATION_HIGHLIGHT_MODE_OPTIONS,
  useRelationHighlightModeSetting,
  useRelationLineStyleSetting,
  useSetRelationHighlightMode,
  type OffscreenRelationProxyPlacementMode,
  type OffscreenRelationProxyTransitionMode,
} from '../model/editor-theme'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import { EDITOR_COLOR_VARIABLES } from '../../../shared/design-tokens/generated/tokens'
import { DbmlRelationEdge } from './DbmlRelationEdge'
import { DbmlDiagramSelectionViewProvider } from './DbmlDiagramSelectionViewProvider'
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

const DIAGRAM_TABLE_HEADER_HEIGHT = 44
const MORPH_ENDPOINT_HANDOFF_PROGRESS = 0.2
const PROXY_TRANSITION_COMPLETION_VISIBLE_RATIO = 0.8

function DiagramCanvas({
  backgroundColor,
  diagram,
  diagramSurfaceRef,
  elements,
  focusedTableIds,
  focusedTarget,
  isOffscreenRelationProxiesEnabled,
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

  const offscreenRelationProxies = useMemo(
    () =>
      isOffscreenRelationProxiesEnabled
        ? getOffscreenRelationProxies({
            diagram,
            focusedTarget,
            minimumVisibleRatio:
              offscreenRelationProxyTransitionMode === 'morph' ||
              offscreenRelationProxyTransitionMode === 'opacity'
                ? PROXY_TRANSITION_COMPLETION_VISIBLE_RATIO
                : undefined,
            viewport: diagramViewport,
            visibilityMode: offscreenRelationProxyVisibilityMode,
          })
        : [],
    [
      diagram,
      diagramViewport,
      focusedTarget,
      isOffscreenRelationProxiesEnabled,
      offscreenRelationProxyTransitionMode,
      offscreenRelationProxyVisibilityMode,
    ],
  )
  const offscreenRelationProxyLayouts = useMemo(() => {
    if (!diagramViewport) {
      return []
    }

    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: offscreenRelationProxies,
      viewport: diagramViewport,
      obstacles: [
        getPreviewTopRightControlProxyLayoutObstacle({
          viewport: diagramViewport,
        }),
        ...(shouldAvoidOffscreenRelationProxyActiveNodes
          ? getActiveTableProxyLayoutObstacles({
              diagram,
              focusedTableIds,
              viewport: diagramViewport,
            })
          : []),
      ],
      options: {
        placementMode: offscreenRelationProxyPlacementMode,
        shouldAvoidActiveNodes: shouldAvoidOffscreenRelationProxyActiveNodes,
      },
    })

    return getOffscreenRelationProxyTransitionLayouts({
      layouts,
      viewport: diagramViewport,
      options: {
        mode: offscreenRelationProxyTransitionMode,
      },
    })
  }, [
    diagramViewport,
    diagram,
    focusedTableIds,
    offscreenRelationProxies,
    offscreenRelationProxyPlacementMode,
    offscreenRelationProxyTransitionMode,
    shouldAvoidOffscreenRelationProxyActiveNodes,
  ])
  const flowElementsWithProxyLineEndpoints = useMemo(
    () =>
      shouldConnectOffscreenRelationProxyLines
        ? getFlowElementsWithProxyLineEndpoints({
            elements,
            proxyLayouts: offscreenRelationProxyLayouts,
            viewport: diagramViewport,
          })
        : elements,
    [
      diagramViewport,
      elements,
      offscreenRelationProxyLayouts,
      shouldConnectOffscreenRelationProxyLines,
    ],
  )
  const flowElements = useMemo(
    () =>
      getFlowElementsWithHiddenProxyOriginalNodes({
        elements: flowElementsWithProxyLineEndpoints,
        proxyLayouts: offscreenRelationProxyLayouts,
      }),
    [flowElementsWithProxyLineEndpoints, offscreenRelationProxyLayouts],
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
        nodes={flowElements.nodes}
        edges={flowElements.edges}
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
      {offscreenRelationProxyLayouts.length > 0 ? (
        <OffscreenRelationProxyOverlay
          proxyLayouts={offscreenRelationProxyLayouts}
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

function OffscreenRelationProxyOverlay({
  proxyLayouts,
  onProxyActivate,
  onProxyColumnFocus,
  onProxyHover,
  onProxyTableFocus,
}: {
  proxyLayouts: readonly OffscreenRelationProxyLayout[]
  onProxyActivate: (proxy: DbmlOffscreenRelationProxy) => void
  onProxyColumnFocus: (column: DbmlDiagramColumn) => void
  onProxyHover: (relationIds: ReadonlySet<string> | null) => void
  onProxyTableFocus: (table: DbmlDiagramTable) => void
}) {
  if (proxyLayouts.length === 0) {
    return null
  }

  return (
    <div
      className={styles.offscreenProxyOverlay}
      aria-label="Offscreen relations"
    >
      {proxyLayouts.map(({ handoffProgress = 0, proxy, style }) => {
        const compactLayerStyle =
          handoffProgress > 0
            ? {
                opacity: 1 - handoffProgress,
                pointerEvents:
                  handoffProgress > 0.5 ? ('none' as const) : ('auto' as const),
              }
            : undefined
        const originalLayerStyle =
          handoffProgress > 0
            ? {
                opacity: handoffProgress,
                pointerEvents:
                  handoffProgress > 0.5 ? ('auto' as const) : ('none' as const),
              }
            : undefined

        return (
          <button
            aria-label={`Show ${proxy.table.name}`}
            className={styles.offscreenProxyCard}
            data-handoff-progress={String(handoffProgress)}
            data-testid={`offscreen-relation-proxy:${proxy.table.id}`}
            key={proxy.id}
            style={style}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              const columnId = (
                event.target as HTMLElement
              ).closest<HTMLElement>('[data-proxy-column-id]')?.dataset
                .proxyColumnId
              const column = columnId
                ? proxy.table.columns.find(
                    (candidate) => candidate.id === columnId,
                  )
                : null

              if (column) {
                onProxyColumnFocus(column)
              } else {
                onProxyTableFocus(proxy.table)
              }

              onProxyActivate(proxy)
            }}
            onMouseEnter={() => onProxyHover(new Set(proxy.relationIds))}
            onMouseLeave={() => onProxyHover(null)}
          >
            <span className={styles.offscreenProxyLayerFrame}>
              <OffscreenRelationProxyContent
                columns={proxy.columns}
                tableName={proxy.table.name}
                style={compactLayerStyle}
              />
              {handoffProgress > 0 ? (
                <OffscreenRelationProxyContent
                  columns={proxy.table.columns}
                  tableName={proxy.table.name}
                  variant="original"
                  style={originalLayerStyle}
                />
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function OffscreenRelationProxyContent({
  columns,
  tableName,
  variant = 'compact',
  style,
}: {
  columns: readonly DbmlDiagramColumn[]
  tableName: string
  variant?: 'compact' | 'original'
  style?: {
    opacity: number
    pointerEvents: 'auto' | 'none'
  }
}) {
  return (
    <span className={styles.offscreenProxyLayer} style={style}>
      <span
        className={[
          styles.diagramTableHeader,
          variant === 'compact' ? styles.offscreenProxyHeader : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span>{tableName}</span>
      </span>
      <span
        className={[
          styles.diagramColumnList,
          styles.offscreenProxyColumns,
        ].join(' ')}
      >
        {columns.map((column) => (
          <span
            className={[
              styles.diagramColumnRow,
              styles.offscreenProxyColumn,
            ].join(' ')}
            data-proxy-column-id={column.id}
            key={column.id}
          >
            <span className={styles.diagramColumnName}>
              {column.name}
              {column.isPrimaryKey ? (
                <span className={styles.diagramColumnBadge}>PK</span>
              ) : null}
            </span>
            <span className={styles.diagramColumnType}>{column.typeName}</span>
          </span>
        ))}
      </span>
    </span>
  )
}

function getFlowElementsWithProxyLineEndpoints({
  elements,
  proxyLayouts,
  viewport,
}: {
  elements: DbmlDiagramFlowElements
  proxyLayouts: readonly OffscreenRelationProxyLayout[]
  viewport: DbmlDiagramViewport | null
}): DbmlDiagramFlowElements {
  if (!viewport || proxyLayouts.length === 0) {
    return elements
  }

  const proxyLayoutByRelationId = new Map<
    string,
    OffscreenRelationProxyLayout
  >()

  for (const layout of proxyLayouts) {
    for (const relationId of layout.proxy.relationIds) {
      proxyLayoutByRelationId.set(relationId, layout)
    }
  }

  return {
    nodes: elements.nodes,
    edges: elements.edges.map((edge) => {
      const data = edge.data
      const proxyLayout = proxyLayoutByRelationId.get(edge.id)

      if (!data || !proxyLayout) {
        return edge
      }

      const endpointOverride = getProxyRelationEndpointOverride({
        proxyLayout,
        relation: data.relation,
        viewport,
      })

      return {
        ...edge,
        data: {
          ...data,
          endpointOverride,
        },
      }
    }),
  }
}

function getFlowElementsWithHiddenProxyOriginalNodes({
  elements,
  proxyLayouts,
}: {
  elements: DbmlDiagramFlowElements
  proxyLayouts: readonly OffscreenRelationProxyLayout[]
}): DbmlDiagramFlowElements {
  if (proxyLayouts.length === 0) {
    return elements
  }

  const opacityByTableId = new Map<string, number>()

  for (const layout of proxyLayouts) {
    opacityByTableId.set(
      layout.proxy.table.id,
      Math.min(
        opacityByTableId.get(layout.proxy.table.id) ?? 1,
        layout.originalOpacity ?? 0,
      ),
    )
  }

  if (opacityByTableId.size === 0) {
    return elements
  }

  return {
    ...elements,
    nodes: elements.nodes.map((node) => {
      const opacity = opacityByTableId.get(node.id)

      if (opacity === undefined) {
        return node
      }

      return {
        ...node,
        style: {
          ...node.style,
          opacity,
        },
      }
    }),
  }
}

function getProxyRelationEndpointOverride({
  proxyLayout,
  relation,
  viewport,
}: {
  proxyLayout: OffscreenRelationProxyLayout
  relation: DbmlRelationEdgeData['relation']
  viewport: DbmlDiagramViewport
}): DbmlRelationEdgeEndpointOverride {
  const endpoint = getProxyRelationEndpoint({
    proxyLayout,
    relation,
    viewport,
  })

  return relation.sourceTableId === proxyLayout.proxy.table.id
    ? {
        source: endpoint,
      }
    : {
        target: endpoint,
      }
}

function getProxyRelationEndpoint({
  proxyLayout,
  relation,
  viewport,
}: {
  proxyLayout: OffscreenRelationProxyLayout
  relation: DbmlRelationEdgeData['relation']
  viewport: DbmlDiagramViewport
}): DbmlRelationEdgeEndpoint {
  const { proxy } = proxyLayout
  const proxyRect = getProxyLayoutScreenRect(proxyLayout, viewport)
  const sourceProxyRect = proxyLayout.sourceScreenRect ?? proxyRect
  const proxyColumnId =
    relation.sourceTableId === proxy.table.id
      ? relation.sourceColumnId
      : relation.targetColumnId
  const handoffProgress = proxyLayout.handoffProgress ?? 0
  const originalEndpoint =
    relation.sourceTableId === proxy.table.id
      ? relation.route.startPoint
      : relation.route.endPoint
  const proxyTableCenterX = proxy.table.position.x + proxy.table.size.width / 2
  const position =
    originalEndpoint.x < proxyTableCenterX ? Position.Left : Position.Right
  const compactEndpoint = getProxyColumnScreenEndpoint({
    columnId: proxyColumnId,
    columns: proxy.columns,
    columnHeight: getScaledProxyColumnHeight(viewport),
    headerHeight: getScaledProxyHeaderHeight(viewport),
    position,
    rect: sourceProxyRect,
  })
  const morphEndpoint = getProxyColumnScreenEndpoint({
    columnId: proxyColumnId,
    columns: proxy.table.columns,
    columnHeight: getScaledProxyColumnHeight(viewport) * getMorphHeightScale(),
    headerHeight:
      DIAGRAM_TABLE_HEADER_HEIGHT * viewport.zoom * getMorphHeightScale(),
    position,
    rect: proxyRect,
  })
  const endpointProgress = clamp(
    handoffProgress / MORPH_ENDPOINT_HANDOFF_PROGRESS,
    0,
    1,
  )
  const proxyScreenEndpoint =
    handoffProgress > 0
      ? {
          x: interpolate(compactEndpoint.x, morphEndpoint.x, endpointProgress),
          y: interpolate(compactEndpoint.y, morphEndpoint.y, endpointProgress),
          position,
        }
      : compactEndpoint

  return {
    x: (proxyScreenEndpoint.x - viewport.x) / viewport.zoom,
    y: (proxyScreenEndpoint.y - viewport.y) / viewport.zoom,
    position: proxyScreenEndpoint.position,
  }

  function getMorphHeightScale() {
    return proxyRect.height / (proxy.table.size.height * viewport.zoom)
  }
}

function getProxyColumnScreenEndpoint({
  columnId,
  columns,
  columnHeight,
  headerHeight,
  position,
  rect,
}: {
  columnId: string
  columns: readonly DbmlDiagramColumn[]
  columnHeight: number
  headerHeight: number
  position: Position.Left | Position.Right
  rect: {
    left: number
    top: number
    width: number
  }
}) {
  const columnIndex = Math.max(
    0,
    columns.findIndex((column) => column.id === columnId),
  )

  return {
    x: position === Position.Left ? rect.left : rect.left + rect.width,
    y: rect.top + headerHeight + columnIndex * columnHeight + columnHeight / 2,
    position,
  }
}

function getProxyLayoutScreenRect(
  proxyLayout: OffscreenRelationProxyLayout,
  viewport: DbmlDiagramViewport,
) {
  if (proxyLayout.screenRect) {
    return proxyLayout.screenRect
  }

  return {
    left: Number(proxyLayout.style.left),
    top: Number(proxyLayout.style.top),
    width: getScaledProxyCardWidth(viewport),
    height: getScaledProxyCardHeight(proxyLayout.proxy, viewport),
  }
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

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
