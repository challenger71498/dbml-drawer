import type { LayoutedDbmlDiagram } from './dbml-layout'
import type {
  DbmlDiagramViewport,
  DbmlOffscreenRelationProxy,
} from './dbml-offscreen-relation-proxies'
import type { OffscreenRelationProxyPlacementMode } from './editor-theme'

const PROXY_CARD_WIDTH = 184
const PROXY_CARD_HEADER_HEIGHT = 30
const PROXY_CARD_COLUMN_HEIGHT = 30
const PROXY_CARD_GAP = 10
const PROXY_CARD_EDGE_GAP = 14
const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_WIDTH = 232
const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_TOP = 12
const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_RIGHT = 12
const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_HEIGHT = 70

export type DbmlOffscreenRelationProxyLayout = {
  proxy: DbmlOffscreenRelationProxy
  handoffProgress?: number
  originalOpacity?: number
  screenRect?: DbmlOffscreenRelationProxyLayoutRect
  sourceScreenRect?: DbmlOffscreenRelationProxyLayoutRect
  style: {
    left: number
    height?: number
    opacity?: number
    top: number
    transform: string
    width?: number
  }
}

export type DbmlOffscreenRelationProxyLayoutRect = {
  left: number
  top: number
  width: number
  height: number
}

export type DbmlOffscreenRelationProxyLayoutObstacle = {
  id: string
  kind: 'active-node' | 'safe-area'
  rect: DbmlOffscreenRelationProxyLayoutRect
}

export type LegacyOffscreenRelationProxyLayoutOptions = {
  placementMode: OffscreenRelationProxyPlacementMode
  shouldAvoidActiveNodes: boolean
}

export type DbmlOffscreenRelationProxyLayoutStrategy<TOptions> = {
  id: string
  getLayouts: (
    input: DbmlOffscreenRelationProxyLayoutInput<TOptions>,
  ) => DbmlOffscreenRelationProxyLayout[]
}

export type DbmlOffscreenRelationProxyLayoutInput<TOptions> = {
  proxies: readonly DbmlOffscreenRelationProxy[]
  viewport: DbmlDiagramViewport
  obstacles: readonly DbmlOffscreenRelationProxyLayoutObstacle[]
  options: TOptions
}

export const legacyOffscreenRelationProxyLayoutStrategy = {
  id: 'legacy',
  getLayouts: getLegacyOffscreenRelationProxyLayouts,
} satisfies DbmlOffscreenRelationProxyLayoutStrategy<LegacyOffscreenRelationProxyLayoutOptions>

function getLegacyOffscreenRelationProxyLayouts({
  proxies,
  viewport,
  obstacles,
  options,
}: DbmlOffscreenRelationProxyLayoutInput<LegacyOffscreenRelationProxyLayoutOptions>) {
  const layoutObstacles = getEffectiveProxyLayoutObstacles(
    obstacles,
    options.shouldAvoidActiveNodes,
  )
  const rawLayouts = proxies.map((proxy) => ({
    proxy,
    ...getRawProxyCardPosition(proxy, viewport, options.placementMode),
  }))
  const activeNodeResolvedRawLayouts = getActiveNodeAvoidingRawProxyLayouts(
    rawLayouts,
    viewport,
    layoutObstacles,
  )
  const sideResolvedLayouts = getNonOverlappingProxyLayoutsBySide(
    activeNodeResolvedRawLayouts,
    viewport,
    options.placementMode,
  )
  const adjacentResolvedLayouts = getNonOverlappingAdjacentProxyLayouts(
    sideResolvedLayouts,
    viewport,
  )

  return getNonOverlappingProxyLayoutsBySide(
    getActiveNodeAvoidingRawProxyLayouts(
      adjacentResolvedLayouts.map((layout) => ({
        proxy: layout.proxy,
        left: layout.style.left,
        top: layout.style.top,
      })),
      viewport,
      layoutObstacles,
    ),
    viewport,
    options.placementMode,
  )
}

function getEffectiveProxyLayoutObstacles(
  obstacles: readonly DbmlOffscreenRelationProxyLayoutObstacle[],
  shouldAvoidActiveNodes: boolean,
) {
  return obstacles.filter(
    (obstacle) => obstacle.kind === 'safe-area' || shouldAvoidActiveNodes,
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

function getActiveNodeAvoidingRawProxyLayouts(
  layouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
  activeTableObstacles: readonly DbmlOffscreenRelationProxyLayoutObstacle[],
) {
  if (activeTableObstacles.length === 0) {
    return layouts
  }

  return layouts.map((layout) => {
    const effectiveObstacles = activeTableObstacles.filter(
      (obstacle) =>
        obstacle.kind !== 'active-node' ||
        obstacle.id !== layout.proxy.table.id,
    )

    return getRawLayoutWithoutActiveNodeOverlap(
      layout,
      viewport,
      effectiveObstacles,
    )
  })
}

function getRawLayoutWithoutActiveNodeOverlap(
  layout: RawOffscreenRelationProxyLayout,
  viewport: DbmlDiagramViewport,
  activeTableObstacles: readonly DbmlOffscreenRelationProxyLayoutObstacle[],
) {
  const rect = getRawProxyLayoutRect(layout, viewport)

  if (
    activeTableObstacles.every(
      (obstacle) => !rectanglesOverlap(rect, obstacle.rect),
    )
  ) {
    return layout
  }

  const isVerticalShift =
    layout.proxy.side === 'left' || layout.proxy.side === 'right'
  const position = isVerticalShift ? rect.top : rect.left
  const size = isVerticalShift ? rect.height : rect.width
  const maxPosition =
    (isVerticalShift ? viewport.height : viewport.width) -
    size -
    PROXY_CARD_EDGE_GAP
  const candidates = new Set<number>([position])

  for (const obstacle of activeTableObstacles) {
    if (!rectanglesOverlap(rect, obstacle.rect)) {
      continue
    }

    const obstacleStart = isVerticalShift
      ? obstacle.rect.top
      : obstacle.rect.left
    const obstacleEnd =
      obstacleStart +
      (isVerticalShift ? obstacle.rect.height : obstacle.rect.width)

    candidates.add(obstacleStart - size - PROXY_CARD_GAP)
    candidates.add(obstacleEnd + PROXY_CARD_GAP)
  }

  const nextPosition = [...candidates]
    .map((candidate) =>
      clampProxyPosition({
        max: maxPosition,
        min: PROXY_CARD_EDGE_GAP,
        value: candidate,
      }),
    )
    .sort(
      (first, second) =>
        getObstacleAvoidanceScore({
          activeTableObstacles,
          isVerticalShift,
          position: first,
          rect,
        }) -
        getObstacleAvoidanceScore({
          activeTableObstacles,
          isVerticalShift,
          position: second,
          rect,
        }),
    )[0]

  if (nextPosition === undefined || nextPosition === position) {
    return layout
  }

  return {
    ...layout,
    left: isVerticalShift ? layout.left : nextPosition,
    top: isVerticalShift ? nextPosition : layout.top,
  }
}

function getRawProxyLayoutRect(
  layout: RawOffscreenRelationProxyLayout,
  viewport: DbmlDiagramViewport,
): DbmlOffscreenRelationProxyLayoutRect {
  return {
    left: layout.left,
    top: layout.top,
    width: getScaledProxyCardWidth(viewport),
    height: getScaledProxyCardHeight(layout.proxy, viewport),
  }
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
): DbmlOffscreenRelationProxyLayout[] {
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
): DbmlOffscreenRelationProxyLayout[] {
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
  layouts: DbmlOffscreenRelationProxyLayout[],
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
  layout: DbmlOffscreenRelationProxyLayout,
  edgeLayouts: DbmlOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  const cardWidth = getScaledProxyCardWidth(viewport)
  let nextLeft = layout.style.left
  const top = layout.style.top
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

  if (nextLeft === layout.style.left) {
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

function getObstacleAvoidanceScore({
  activeTableObstacles,
  isVerticalShift,
  position,
  rect,
}: {
  activeTableObstacles: readonly DbmlOffscreenRelationProxyLayoutObstacle[]
  isVerticalShift: boolean
  position: number
  rect: DbmlOffscreenRelationProxyLayoutRect
}) {
  const nextRect = {
    ...rect,
    left: isVerticalShift ? rect.left : position,
    top: isVerticalShift ? position : rect.top,
  }
  const overlapArea = activeTableObstacles.reduce(
    (sum, obstacle) => sum + getRectangleOverlapArea(nextRect, obstacle.rect),
    0,
  )

  return (
    overlapArea * 10000 +
    Math.abs(position - (isVerticalShift ? rect.top : rect.left))
  )
}

function getRectangleOverlapArea(
  first: DbmlOffscreenRelationProxyLayoutRect,
  second: DbmlOffscreenRelationProxyLayoutRect,
) {
  const width = Math.max(
    0,
    Math.min(first.left + first.width, second.left + second.width) -
      Math.max(first.left, second.left),
  )
  const height = Math.max(
    0,
    Math.min(first.top + first.height, second.top + second.height) -
      Math.max(first.top, second.top),
  )

  return width * height
}

export function getActiveTableProxyLayoutObstacles({
  diagram,
  focusedTableIds,
  viewport,
}: {
  diagram: LayoutedDbmlDiagram | null
  focusedTableIds: ReadonlySet<string>
  viewport: DbmlDiagramViewport
}): DbmlOffscreenRelationProxyLayoutObstacle[] {
  if (!diagram || focusedTableIds.size === 0) {
    return []
  }

  const viewportRect = {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height,
  }

  return diagram.tables
    .filter((table) => focusedTableIds.has(table.id))
    .map((table) => ({
      id: table.id,
      kind: 'active-node' as const,
      rect: getTableScreenRect(table, viewport),
    }))
    .filter((obstacle) => rectanglesOverlap(obstacle.rect, viewportRect))
}

export function getPreviewTopRightControlProxyLayoutObstacle({
  viewport,
}: {
  viewport: DbmlDiagramViewport
}): DbmlOffscreenRelationProxyLayoutObstacle {
  return {
    id: 'preview-top-right-relation-style-control',
    kind: 'safe-area',
    rect: {
      left: Math.max(
        PROXY_CARD_EDGE_GAP,
        viewport.width -
          PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_WIDTH -
          PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_RIGHT,
      ),
      top: PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_TOP,
      width: Math.max(
        0,
        Math.min(
          PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_WIDTH,
          viewport.width - PROXY_CARD_EDGE_GAP * 2,
        ),
      ),
      height: PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_HEIGHT,
    },
  }
}

function getTableScreenRect(
  table: LayoutedDbmlDiagram['tables'][number],
  viewport: DbmlDiagramViewport,
): DbmlOffscreenRelationProxyLayoutRect {
  return {
    left: table.position.x * viewport.zoom + viewport.x,
    top: table.position.y * viewport.zoom + viewport.y,
    width: table.size.width * viewport.zoom,
    height: table.size.height * viewport.zoom,
  }
}

function getProxyLayoutRect(
  layout: DbmlOffscreenRelationProxyLayout,
  viewport: DbmlDiagramViewport,
): DbmlOffscreenRelationProxyLayoutRect {
  return {
    left: layout.style.left,
    top: layout.style.top,
    width: getScaledProxyCardWidth(viewport),
    height: getScaledProxyCardHeight(layout.proxy, viewport),
  }
}

function rectanglesOverlap(
  first: DbmlOffscreenRelationProxyLayoutRect,
  second: DbmlOffscreenRelationProxyLayoutRect,
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

type RawOffscreenRelationProxyLayout = {
  proxy: DbmlOffscreenRelationProxy
  left: number
  top: number
}

export function getScaledProxyCardWidth(viewport: DbmlDiagramViewport) {
  return PROXY_CARD_WIDTH * viewport.zoom
}

export function getScaledProxyCardHeight(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
) {
  return (
    (PROXY_CARD_HEADER_HEIGHT +
      proxy.columns.length * PROXY_CARD_COLUMN_HEIGHT) *
    viewport.zoom
  )
}

export function getScaledProxyHeaderHeight(viewport: DbmlDiagramViewport) {
  return PROXY_CARD_HEADER_HEIGHT * viewport.zoom
}

export function getScaledProxyColumnHeight(viewport: DbmlDiagramViewport) {
  return PROXY_CARD_COLUMN_HEIGHT * viewport.zoom
}
