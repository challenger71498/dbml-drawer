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
  type CSSProperties,
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
  DEFAULT_DBML_RELATION_HIGHLIGHT_MODE,
  DEFAULT_DBML_RELATION_LINE_STYLE,
  type DbmlRelationHighlightMode,
  type DbmlRelationLineStyle,
} from '../model/dbml-diagram-rendering'
import {
  getOffscreenRelationProxies,
  type DbmlDiagramViewport,
  type DbmlOffscreenRelationProxy,
  type DbmlOffscreenRelationProxyVisibilityMode,
} from '../model/dbml-offscreen-relation-proxies'
import type { DbmlDiagramSelectionTarget } from '../model/dbml-diagram-selection'
import type { OffscreenRelationProxyPlacementMode } from '../model/editor-theme'
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
  shouldConnectOffscreenRelationProxyLines?: boolean
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
const PROXY_CARD_WIDTH = 184
const PROXY_CARD_HEADER_HEIGHT = 30
const PROXY_CARD_COLUMN_HEIGHT = 30
const PROXY_CARD_GAP = 10
const PROXY_CARD_EDGE_GAP = 14

const RELATION_LINE_STYLE_OPTIONS = [
  {
    value: 'bezier',
    label: 'Bezier',
  },
  {
    value: 'orthogonal',
    label: 'Step',
  },
  {
    value: 'rounded-orthogonal',
    label: 'Rounded',
  },
] satisfies Array<{
  value: DbmlRelationLineStyle
  label: string
}>

const RELATION_HIGHLIGHT_MODE_OPTIONS = [
  {
    value: 'solid',
    label: 'Solid',
  },
  {
    value: 'gradient',
    label: 'Gradient',
  },
  {
    value: 'dynamic',
    label: 'Dynamic',
  },
] satisfies Array<{
  value: DbmlRelationHighlightMode
  label: string
}>

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
  shouldConnectOffscreenRelationProxyLines = false,
  onTableFocus = () => undefined,
  onTableHover = () => undefined,
  onColumnFocus = NOOP_COLUMN_FOCUS,
  onColumnHover = NOOP_COLUMN_HOVER,
  onFocusClear = NOOP_FOCUS_CLEAR,
}: DbmlDiagramPreviewProps) {
  const [relationLineStyle, setRelationLineStyle] =
    useState<DbmlRelationLineStyle>(DEFAULT_DBML_RELATION_LINE_STYLE)
  const [relationHighlightMode, setRelationHighlightMode] =
    useState<DbmlRelationHighlightMode>(DEFAULT_DBML_RELATION_HIGHLIGHT_MODE)
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
  const isEmpty = !diagram || diagram.tables.length === 0
  const diagramSurfaceRef = useRef<HTMLDivElement | null>(null)

  return (
    <section
      className={styles.diagramPanel}
      aria-labelledby="diagram-heading"
      aria-busy={isPending}
    >
      <div className={styles.diagramHeader}>
        <div>
          <p className={styles.eyebrow}>Preview</p>
          <h2 id="diagram-heading">Diagram</h2>
        </div>
        <div className={styles.diagramHeaderActions}>
          <div
            className={styles.relationLineStyleControl}
            role="group"
            aria-label="Relation line style"
          >
            {RELATION_LINE_STYLE_OPTIONS.map((option) => (
              <button
                aria-pressed={relationLineStyle === option.value}
                className={[
                  styles.relationLineStyleButton,
                  relationLineStyle === option.value
                    ? styles.relationLineStyleButtonActive
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={option.value}
                onClick={() => setRelationLineStyle(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div
            className={styles.relationLineStyleControl}
            role="group"
            aria-label="Relation highlight mode"
          >
            {RELATION_HIGHLIGHT_MODE_OPTIONS.map((option) => (
              <button
                aria-pressed={relationHighlightMode === option.value}
                className={[
                  styles.relationLineStyleButton,
                  relationHighlightMode === option.value
                    ? styles.relationLineStyleButtonActive
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
          <span className={styles.documentState}>
            {getPreviewStateLabel({ isPending, isPaused, isEmpty })}
          </span>
        </div>
      </div>

      <div className={styles.diagramSurface} ref={diagramSurfaceRef}>
        <ReactFlowProvider>
          <DbmlDiagramSelectionViewProvider value={selectionViewState}>
            <DiagramCanvas
              backgroundColor={backgroundColor}
              diagram={diagram}
              diagramSurfaceRef={diagramSurfaceRef}
              elements={elements}
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
              shouldConnectOffscreenRelationProxyLines={
                shouldConnectOffscreenRelationProxyLines
              }
              isEmpty={isEmpty}
              onFocusClear={onFocusClear}
              onProxyRelationHover={setHoveredProxyRelationIds}
              onTableFocus={onTableFocus}
              onTableHover={onTableHover}
            />
          </DbmlDiagramSelectionViewProvider>
        </ReactFlowProvider>

        {isPaused ? (
          <p className={styles.diagramStatus}>Preview paused: invalid DBML</p>
        ) : null}

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
  focusedTarget: DbmlDiagramSelectionTarget | null
  isOffscreenRelationProxiesEnabled: boolean
  offscreenRelationProxyPlacementMode: OffscreenRelationProxyPlacementMode
  offscreenRelationProxyVisibilityMode: DbmlOffscreenRelationProxyVisibilityMode
  shouldConnectOffscreenRelationProxyLines: boolean
  isEmpty: boolean
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
  focusedTarget,
  isOffscreenRelationProxiesEnabled,
  offscreenRelationProxyPlacementMode,
  offscreenRelationProxyVisibilityMode,
  shouldConnectOffscreenRelationProxyLines,
  isEmpty,
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
            viewport: diagramViewport,
            visibilityMode: offscreenRelationProxyVisibilityMode,
          })
        : [],
    [
      diagram,
      diagramViewport,
      focusedTarget,
      isOffscreenRelationProxiesEnabled,
      offscreenRelationProxyVisibilityMode,
    ],
  )
  const offscreenRelationProxyLayouts = useMemo(
    () =>
      diagramViewport
        ? getProxyCardLayouts(
            offscreenRelationProxies,
            diagramViewport,
            offscreenRelationProxyPlacementMode,
          )
        : [],
    [
      diagramViewport,
      offscreenRelationProxies,
      offscreenRelationProxyPlacementMode,
    ],
  )
  const flowElements = useMemo(
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
        <Controls showInteractive={false} />
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
          onProxyHover={onProxyRelationHover}
        />
      ) : null}
    </>
  )
}

function OffscreenRelationProxyOverlay({
  proxyLayouts,
  onProxyActivate,
  onProxyHover,
}: {
  proxyLayouts: readonly OffscreenRelationProxyLayout[]
  onProxyActivate: (proxy: DbmlOffscreenRelationProxy) => void
  onProxyHover: (relationIds: ReadonlySet<string> | null) => void
}) {
  if (proxyLayouts.length === 0) {
    return null
  }

  return (
    <div
      className={styles.offscreenProxyOverlay}
      aria-label="Offscreen relations"
    >
      {proxyLayouts.map(({ proxy, style }) => {
        return (
          <button
            aria-label={`Show ${proxy.table.name}`}
            className={styles.offscreenProxyCard}
            data-testid={`offscreen-relation-proxy:${proxy.table.id}`}
            key={proxy.id}
            style={style}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onProxyActivate(proxy)
            }}
            onMouseEnter={() => onProxyHover(new Set(proxy.relationIds))}
            onMouseLeave={() => onProxyHover(null)}
          >
            <span
              className={[
                styles.diagramTableHeader,
                styles.offscreenProxyHeader,
              ].join(' ')}
            >
              <span>{proxy.table.name}</span>
            </span>
            <span
              className={[
                styles.diagramColumnList,
                styles.offscreenProxyColumns,
              ].join(' ')}
            >
              {proxy.columns.map((column) => (
                <span
                  className={[
                    styles.diagramColumnRow,
                    styles.offscreenProxyColumn,
                  ].join(' ')}
                  key={column.id}
                >
                  <span className={styles.diagramColumnName}>
                    {column.name}
                    {column.isPrimaryKey ? (
                      <span className={styles.diagramColumnBadge}>PK</span>
                    ) : null}
                  </span>
                  <span className={styles.diagramColumnType}>
                    {column.typeName}
                  </span>
                </span>
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function getProxyCardLayouts(
  proxies: readonly DbmlOffscreenRelationProxy[],
  viewport: DbmlDiagramViewport,
  placementMode: OffscreenRelationProxyPlacementMode,
) {
  const rawLayouts = proxies.map((proxy) => ({
    proxy,
    ...getRawProxyCardPosition(proxy, viewport, placementMode),
  }))
  const sideResolvedLayouts = getNonOverlappingProxyLayoutsBySide(
    rawLayouts,
    viewport,
    placementMode,
  )
  const adjacentResolvedLayouts = getNonOverlappingAdjacentProxyLayouts(
    sideResolvedLayouts,
    viewport,
  )

  return getNonOverlappingProxyLayoutsBySide(
    adjacentResolvedLayouts.map((layout) => ({
      proxy: layout.proxy,
      left: Number(layout.style.left),
      top: Number(layout.style.top),
    })),
    viewport,
    placementMode,
  )
}

function getNonOverlappingProxyLayoutsBySide(
  rawLayouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
  placementMode: OffscreenRelationProxyPlacementMode,
) {
  const layoutsBySide = new Map<
    DbmlOffscreenRelationProxy['side'],
    typeof rawLayouts
  >()

  for (const layout of rawLayouts) {
    layoutsBySide.set(layout.proxy.side, [
      ...(layoutsBySide.get(layout.proxy.side) ?? []),
      layout,
    ])
  }

  return [...layoutsBySide.values()].flatMap((layouts) =>
    getNonOverlappingProxyLayouts(layouts, viewport, placementMode),
  )
}

function getRawProxyCardPosition(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
  placementMode: OffscreenRelationProxyPlacementMode,
) {
  if (placementMode === 'parallel') {
    return getParallelProxyCardPosition(proxy, viewport)
  }

  return getLineProxyCardPosition(proxy, viewport)
}

function getLineProxyCardPosition(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
) {
  const anchorX = proxy.anchor.x * viewport.zoom + viewport.x
  const anchorY = proxy.anchor.y * viewport.zoom + viewport.y
  const cardWidth = getScaledProxyCardWidth(viewport)
  const cardHeight = getScaledProxyCardHeight(proxy, viewport)

  if (proxy.side === 'left' || proxy.side === 'right') {
    return {
      left:
        proxy.side === 'left'
          ? PROXY_CARD_EDGE_GAP
          : Math.max(
              PROXY_CARD_EDGE_GAP,
              Math.min(
                viewport.width - cardWidth - PROXY_CARD_EDGE_GAP,
                anchorX - cardWidth,
              ),
            ),
      top: Math.max(
        PROXY_CARD_EDGE_GAP,
        Math.min(
          viewport.height - cardHeight - PROXY_CARD_EDGE_GAP,
          anchorY - cardHeight / 2,
        ),
      ),
    }
  }

  return {
    left: Math.max(
      PROXY_CARD_EDGE_GAP,
      Math.min(
        viewport.width - cardWidth - PROXY_CARD_EDGE_GAP,
        anchorX - cardWidth / 2,
      ),
    ),
    top:
      proxy.side === 'top'
        ? PROXY_CARD_EDGE_GAP
        : Math.max(
            PROXY_CARD_EDGE_GAP,
            Math.min(
              viewport.height - cardHeight - PROXY_CARD_EDGE_GAP,
              anchorY - cardHeight,
            ),
          ),
  }
}

function getParallelProxyCardPosition(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
) {
  const cardWidth = getScaledProxyCardWidth(viewport)
  const cardHeight = getScaledProxyCardHeight(proxy, viewport)
  const tableCenterX =
    (proxy.table.position.x + proxy.table.size.width / 2) * viewport.zoom +
    viewport.x
  const tableTop = proxy.table.position.y * viewport.zoom + viewport.y

  if (proxy.side === 'left' || proxy.side === 'right') {
    return {
      left:
        proxy.side === 'left'
          ? PROXY_CARD_EDGE_GAP
          : viewport.width - cardWidth - PROXY_CARD_EDGE_GAP,
      top: clampProxyPosition({
        max: viewport.height - cardHeight - PROXY_CARD_EDGE_GAP,
        min: PROXY_CARD_EDGE_GAP,
        value: tableTop,
      }),
    }
  }

  return {
    left: clampProxyPosition({
      max: viewport.width - cardWidth - PROXY_CARD_EDGE_GAP,
      min: PROXY_CARD_EDGE_GAP,
      value: tableCenterX - cardWidth / 2,
    }),
    top:
      proxy.side === 'top'
        ? PROXY_CARD_EDGE_GAP
        : viewport.height - cardHeight - PROXY_CARD_EDGE_GAP,
  }
}

function getNonOverlappingProxyLayouts(
  layouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
  placementMode: OffscreenRelationProxyPlacementMode,
): OffscreenRelationProxyLayout[] {
  const side = layouts[0]?.proxy.side
  const isVerticalStack =
    placementMode === 'parallel' || side === 'left' || side === 'right'
  const collisionGroups = getOverlappingProxyLayoutGroups({
    layouts,
    viewport,
    isVerticalStack,
  })

  return collisionGroups.flatMap((collisionGroup) =>
    getNonOverlappingProxyLayoutGroup(
      collisionGroup,
      viewport,
      isVerticalStack,
    ),
  )
}

function getNonOverlappingProxyLayoutGroup(
  layouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
  isVerticalStack: boolean,
): OffscreenRelationProxyLayout[] {
  const side = layouts[0]?.proxy.side
  const shouldSortByTop = side === 'left' || side === 'right'
  const cardWidth = getScaledProxyCardWidth(viewport)
  const sortedLayouts = [...layouts].sort((first, second) =>
    shouldSortByTop ? first.top - second.top : first.left - second.left,
  )
  const itemSizes = sortedLayouts.map((layout) =>
    isVerticalStack
      ? getScaledProxyCardHeight(layout.proxy, viewport)
      : cardWidth,
  )
  const stackPositions = getNonOverlappingStackPositions({
    desiredPositions: sortedLayouts.map((layout) =>
      isVerticalStack ? layout.top : layout.left,
    ),
    itemSizes,
    maxEndPosition:
      (isVerticalStack ? viewport.height : viewport.width) -
      PROXY_CARD_EDGE_GAP,
    minPosition: PROXY_CARD_EDGE_GAP,
  })

  return sortedLayouts.map((layout, index) => {
    const nextTop = isVerticalStack ? stackPositions[index] : layout.top
    const nextLeft = isVerticalStack ? layout.left : stackPositions[index]

    return {
      proxy: layout.proxy,
      style: {
        left: nextLeft,
        top: nextTop,
        transform: `scale(${viewport.zoom})`,
      },
    }
  })
}

function getOverlappingProxyLayoutGroups({
  layouts,
  viewport,
  isVerticalStack,
}: {
  layouts: RawOffscreenRelationProxyLayout[]
  viewport: DbmlDiagramViewport
  isVerticalStack: boolean
}) {
  const cardWidth = getScaledProxyCardWidth(viewport)
  const sortedLayouts = [...layouts].sort(
    (first, second) =>
      getProxyLayoutCrossAxisStart(first, viewport, isVerticalStack) -
      getProxyLayoutCrossAxisStart(second, viewport, isVerticalStack),
  )
  const groups: RawOffscreenRelationProxyLayout[][] = []
  let activeGroupEnd = Number.NEGATIVE_INFINITY

  for (const layout of sortedLayouts) {
    const crossAxisStart = getProxyLayoutCrossAxisStart(
      layout,
      viewport,
      isVerticalStack,
    )
    const crossAxisSize = isVerticalStack
      ? cardWidth
      : getScaledProxyCardHeight(layout.proxy, viewport)
    const crossAxisEnd = crossAxisStart + crossAxisSize

    if (groups.length === 0 || crossAxisStart >= activeGroupEnd) {
      groups.push([layout])
      activeGroupEnd = crossAxisEnd
      continue
    }

    groups[groups.length - 1].push(layout)
    activeGroupEnd = Math.max(activeGroupEnd, crossAxisEnd)
  }

  return groups
}

function getProxyLayoutCrossAxisStart(
  layout: RawOffscreenRelationProxyLayout,
  _viewport: DbmlDiagramViewport,
  isVerticalStack: boolean,
) {
  return isVerticalStack ? layout.left : layout.top
}

function getNonOverlappingAdjacentProxyLayouts(
  layouts: OffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  const edgeLayouts = layouts.filter(
    (layout) => layout.proxy.side === 'left' || layout.proxy.side === 'right',
  )

  if (edgeLayouts.length === 0) {
    return layouts
  }

  return layouts.map((layout) => {
    if (layout.proxy.side !== 'top' && layout.proxy.side !== 'bottom') {
      return layout
    }

    return getLayoutWithoutAdjacentSideOverlap(layout, edgeLayouts, viewport)
  })
}

function getLayoutWithoutAdjacentSideOverlap(
  layout: OffscreenRelationProxyLayout,
  edgeLayouts: OffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  const cardWidth = getScaledProxyCardWidth(viewport)
  let nextLeft = Number(layout.style.left)
  const top = Number(layout.style.top)
  const maxLeft = viewport.width - cardWidth - PROXY_CARD_EDGE_GAP

  for (const edgeLayout of edgeLayouts) {
    const edgeRect = getProxyLayoutRect(edgeLayout, viewport)
    const nextRect = {
      left: nextLeft,
      top,
      width: cardWidth,
      height: getScaledProxyCardHeight(layout.proxy, viewport),
    }

    if (!rectanglesOverlap(nextRect, edgeRect)) {
      continue
    }

    nextLeft =
      edgeLayout.proxy.side === 'left'
        ? edgeRect.left + edgeRect.width + PROXY_CARD_GAP
        : edgeRect.left - cardWidth - PROXY_CARD_GAP
    nextLeft = clampProxyPosition({
      max: maxLeft,
      min: PROXY_CARD_EDGE_GAP,
      value: nextLeft,
    })
  }

  if (nextLeft === Number(layout.style.left)) {
    return layout
  }

  return {
    ...layout,
    style: {
      ...layout.style,
      left: nextLeft,
    },
  }
}

function getProxyLayoutRect(
  layout: OffscreenRelationProxyLayout,
  viewport: DbmlDiagramViewport,
) {
  return {
    left: Number(layout.style.left),
    top: Number(layout.style.top),
    width: getScaledProxyCardWidth(viewport),
    height: getScaledProxyCardHeight(layout.proxy, viewport),
  }
}

function rectanglesOverlap(
  first: { left: number; top: number; width: number; height: number },
  second: { left: number; top: number; width: number; height: number },
) {
  return (
    first.left < second.left + second.width &&
    first.left + first.width > second.left &&
    first.top < second.top + second.height &&
    first.top + first.height > second.top
  )
}

function clampProxyPosition({
  max,
  min,
  value,
}: {
  max: number
  min: number
  value: number
}) {
  return Math.max(min, Math.min(max, value))
}

function getNonOverlappingStackPositions({
  desiredPositions,
  itemSizes,
  maxEndPosition,
  minPosition,
}: {
  desiredPositions: readonly number[]
  itemSizes: readonly number[]
  maxEndPosition: number
  minPosition: number
}) {
  const positions: number[] = []

  for (const [index, position] of desiredPositions.entries()) {
    const previousPosition = positions.at(-1) ?? null
    const minAllowedPosition =
      previousPosition === null
        ? minPosition
        : previousPosition + itemSizes[index - 1] + PROXY_CARD_GAP

    positions.push(Math.max(position, minAllowedPosition))
  }

  const lastPosition = positions.at(-1)
  const lastItemSize = itemSizes.at(-1)
  const overflow =
    lastPosition === undefined || lastItemSize === undefined
      ? 0
      : lastPosition + lastItemSize - maxEndPosition

  if (overflow <= 0) {
    return positions
  }

  const shiftedPositions = positions.map((position) => position - overflow)
  const underflow = minPosition - shiftedPositions[0]

  if (underflow <= 0) {
    return shiftedPositions
  }

  return shiftedPositions.map((position) => position + underflow)
}

type OffscreenRelationProxyLayout = {
  proxy: DbmlOffscreenRelationProxy
  style: CSSProperties
}

type RawOffscreenRelationProxyLayout = {
  proxy: DbmlOffscreenRelationProxy
  left: number
  top: number
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
  const { proxy, style } = proxyLayout
  const left = Number(style.left)
  const top = Number(style.top)
  const cardWidth = getScaledProxyCardWidth(viewport)
  const headerHeight = getScaledProxyHeaderHeight(viewport)
  const columnHeight = getScaledProxyColumnHeight(viewport)
  const proxyColumnId =
    relation.sourceTableId === proxy.table.id
      ? relation.sourceColumnId
      : relation.targetColumnId
  const proxyColumnIndex = Math.max(
    0,
    proxy.columns.findIndex((column) => column.id === proxyColumnId),
  )
  const originalEndpoint =
    relation.sourceTableId === proxy.table.id
      ? relation.route.startPoint
      : relation.route.endPoint
  const proxyTableCenterX = proxy.table.position.x + proxy.table.size.width / 2
  const position =
    originalEndpoint.x < proxyTableCenterX ? Position.Left : Position.Right
  const screenEndpoint = {
    x: position === Position.Left ? left : left + cardWidth,
    y: top + headerHeight + proxyColumnIndex * columnHeight + columnHeight / 2,
    position,
  }

  return {
    x: (screenEndpoint.x - viewport.x) / viewport.zoom,
    y: (screenEndpoint.y - viewport.y) / viewport.zoom,
    position: screenEndpoint.position,
  }
}

function getScaledProxyCardWidth(viewport: DbmlDiagramViewport) {
  return PROXY_CARD_WIDTH * viewport.zoom
}

function getScaledProxyCardHeight(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
) {
  return (
    (PROXY_CARD_HEADER_HEIGHT +
      proxy.columns.length * PROXY_CARD_COLUMN_HEIGHT) *
    viewport.zoom
  )
}

function getScaledProxyHeaderHeight(viewport: DbmlDiagramViewport) {
  return PROXY_CARD_HEADER_HEIGHT * viewport.zoom
}

function getScaledProxyColumnHeight(viewport: DbmlDiagramViewport) {
  return PROXY_CARD_COLUMN_HEIGHT * viewport.zoom
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

function getPreviewStateLabel({
  isPending,
  isPaused,
  isEmpty,
}: {
  isPending: boolean
  isPaused: boolean
  isEmpty: boolean
}) {
  if (isPending) {
    return 'Layout'
  }

  if (isPaused) {
    return 'Paused'
  }

  return isEmpty ? 'Empty' : 'Ready'
}
