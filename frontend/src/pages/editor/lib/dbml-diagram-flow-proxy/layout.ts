import type { DbmlDiagramViewport, DbmlOffscreenRelationProxy } from './proxy'
import type {
  OffscreenRelationProxyCollisionMode,
  OffscreenRelationProxyPlacementMode,
} from '../../model/editor-theme'
import {
  getScaledProxyCardHeight,
  getScaledProxyCardWidth,
  PROXY_CARD_EDGE_GAP,
  PROXY_CARD_GAP,
} from './card-metrics'
import {
  clampScreenPosition,
  getNonOverlappingStackPositions,
  getRectangleOverlapArea,
  rectanglesOverlap,
  type DbmlDiagramFlowProxyRect,
} from './screen-geometry'

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

export type DbmlOffscreenRelationProxyLayoutRect = DbmlDiagramFlowProxyRect

export type DbmlOffscreenRelationProxyLayoutObstacle = {
  id: string
  kind: 'active-node' | 'safe-area'
  rect: DbmlOffscreenRelationProxyLayoutRect
}

export type LegacyOffscreenRelationProxyLayoutOptions = {
  collisionMode?: OffscreenRelationProxyCollisionMode
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
  if (options.collisionMode === 'iterative') {
    return getIterativeOffscreenRelationProxyLayouts({
      proxies,
      viewport,
      obstacles,
      options,
    })
  }

  if (options.collisionMode === 'score') {
    return getScoreOffscreenRelationProxyLayouts({
      proxies,
      viewport,
      obstacles,
      options,
    })
  }

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

function getIterativeOffscreenRelationProxyLayouts({
  proxies,
  viewport,
  obstacles,
  options,
}: DbmlOffscreenRelationProxyLayoutInput<LegacyOffscreenRelationProxyLayoutOptions>) {
  const layoutObstacles = getEffectiveProxyLayoutObstacles(
    obstacles,
    options.shouldAvoidActiveNodes,
  )
  const rawLayouts = proxies.map((proxy, sourceIndex) => ({
    proxy,
    sourceIndex,
    ...getConstrainedRawProxyCardPosition(
      proxy,
      viewport,
      options.placementMode,
    ),
  }))
  const sourceIndexByProxyId = new Map(
    rawLayouts.map((layout) => [layout.proxy.id, layout.sourceIndex]),
  )
  const layoutGroups = getConstrainedRawLayoutGroups(rawLayouts, viewport)
  const placedLayouts: DbmlOffscreenRelationProxyLayout[] = []

  for (const layouts of layoutGroups) {
    const orderedLayouts = getOrderedConstrainedRawLayouts(layouts, viewport)

    for (const layout of orderedLayouts) {
      placedLayouts.push(
        getConstrainedProxyLayout({
          layout,
          placedLayouts,
          viewport,
          obstacles: layoutObstacles,
        }),
      )
    }
  }

  return [...placedLayouts].sort(
    (first, second) =>
      (sourceIndexByProxyId.get(first.proxy.id) ?? 0) -
      (sourceIndexByProxyId.get(second.proxy.id) ?? 0),
  )
}

function getScoreOffscreenRelationProxyLayouts({
  proxies,
  viewport,
  obstacles,
  options,
}: DbmlOffscreenRelationProxyLayoutInput<LegacyOffscreenRelationProxyLayoutOptions>) {
  const layoutObstacles = getEffectiveProxyLayoutObstacles(
    obstacles,
    options.shouldAvoidActiveNodes,
  )
  const rawLayouts = proxies.map((proxy, sourceIndex) => ({
    proxy,
    sourceIndex,
    ...getConstrainedRawProxyCardPosition(
      proxy,
      viewport,
      options.placementMode,
    ),
  }))
  const sourceIndexByProxyId = new Map(
    rawLayouts.map((layout) => [layout.proxy.id, layout.sourceIndex]),
  )
  const placedLayouts: DbmlOffscreenRelationProxyLayout[] = []
  const orderedLayouts = [...rawLayouts].sort(compareScoreRawLayoutPriority)

  for (const layout of orderedLayouts) {
    placedLayouts.push(
      getScoredProxyLayout({
        layout,
        obstacles: layoutObstacles,
        placedLayouts,
        viewport,
      }),
    )
  }

  return [...placedLayouts].sort(
    (first, second) =>
      (sourceIndexByProxyId.get(first.proxy.id) ?? 0) -
      (sourceIndexByProxyId.get(second.proxy.id) ?? 0),
  )
}

function compareScoreRawLayoutPriority(
  first: RawOffscreenRelationProxyLayout,
  second: RawOffscreenRelationProxyLayout,
) {
  return (
    getScoreSidePriority(first.proxy.side) -
      getScoreSidePriority(second.proxy.side) ||
    getScoreOverflowPriority(second) - getScoreOverflowPriority(first) ||
    (first.sourceIndex ?? 0) - (second.sourceIndex ?? 0)
  )
}

function getScoreSidePriority(side: DbmlOffscreenRelationProxy['side']) {
  switch (side) {
    case 'top':
    case 'bottom':
      return 0
    case 'left':
    case 'right':
      return 1
  }
}

function getScoreOverflowPriority(layout: RawOffscreenRelationProxyLayout) {
  return Math.max(layout.topOverflow ?? 0, layout.bottomOverflow ?? 0)
}

function getScoredProxyLayout({
  layout,
  obstacles,
  placedLayouts,
  viewport,
}: {
  layout: RawOffscreenRelationProxyLayout
  obstacles: readonly DbmlOffscreenRelationProxyLayoutObstacle[]
  placedLayouts: readonly DbmlOffscreenRelationProxyLayout[]
  viewport: DbmlDiagramViewport
}): DbmlOffscreenRelationProxyLayout {
  const effectiveObstacles = obstacles.filter(
    (obstacle) =>
      obstacle.kind !== 'active-node' || obstacle.id !== layout.proxy.table.id,
  )
  const hardObstacleRects = effectiveObstacles.map((obstacle) => obstacle.rect)
  const proxyObstacleRects = placedLayouts.map((placedLayout) =>
    getProxyLayoutRect(placedLayout, viewport),
  )
  const candidates = getScoredProxyLayoutCandidates({
    hardObstacleRects,
    layout,
    proxyObstacleRects,
    viewport,
  })
  const bestCandidate = candidates.sort(
    (first, second) =>
      getScoredProxyLayoutCandidateScore({
        candidate: first,
        hardObstacleRects,
        layout,
        proxyObstacleRects,
        viewport,
      }) -
        getScoredProxyLayoutCandidateScore({
          candidate: second,
          hardObstacleRects,
          layout,
          proxyObstacleRects,
          viewport,
        }) ||
      first.top - second.top ||
      first.left - second.left,
  )[0]

  return {
    proxy: layout.proxy,
    style: {
      left: bestCandidate.left,
      top: bestCandidate.top,
      transform: `scale(${viewport.zoom})`,
    },
  }
}

function getScoredProxyLayoutCandidates({
  hardObstacleRects,
  layout,
  proxyObstacleRects,
  viewport,
}: {
  hardObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  layout: RawOffscreenRelationProxyLayout
  proxyObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  viewport: DbmlDiagramViewport
}) {
  const cardWidth = getScaledProxyCardWidth(viewport)
  const cardHeight = getScaledProxyCardHeight(layout.proxy, viewport)
  const maxLeft = viewport.width - cardWidth - PROXY_CARD_EDGE_GAP
  const maxTop = viewport.height - cardHeight - PROXY_CARD_EDGE_GAP
  const laneStep = cardWidth + PROXY_CARD_GAP
  const leftCandidates = new Set<number>([
    layout.left,
    layout.left - laneStep,
    layout.left + laneStep,
    layout.left - laneStep * 2,
    layout.left + laneStep * 2,
  ])
  const candidates: RawProxyCardPosition[] = []

  for (const leftCandidate of leftCandidates) {
    const left = clampScreenPosition({
      max: maxLeft,
      min: PROXY_CARD_EDGE_GAP,
      value: leftCandidate,
    })
    const topCandidates = new Set<number>([
      layout.top,
      PROXY_CARD_EDGE_GAP,
      maxTop,
    ])

    for (const obstacleRect of [...hardObstacleRects, ...proxyObstacleRects]) {
      if (
        !intervalsOverlap(
          left,
          left + cardWidth,
          obstacleRect.left,
          obstacleRect.left + obstacleRect.width,
        )
      ) {
        continue
      }

      topCandidates.add(obstacleRect.top - cardHeight - PROXY_CARD_GAP)
      topCandidates.add(obstacleRect.top + obstacleRect.height + PROXY_CARD_GAP)
    }

    for (const topCandidate of topCandidates) {
      candidates.push({
        left,
        top: clampScreenPosition({
          max: maxTop,
          min: PROXY_CARD_EDGE_GAP,
          value: topCandidate,
        }),
      })
    }
  }

  return getUniqueScoredProxyLayoutCandidates(candidates)
}

function getUniqueScoredProxyLayoutCandidates(
  candidates: readonly RawProxyCardPosition[],
) {
  const seenCandidates = new Set<string>()
  const uniqueCandidates: RawProxyCardPosition[] = []

  for (const candidate of candidates) {
    const key = `${candidate.left}:${candidate.top}`

    if (seenCandidates.has(key)) {
      continue
    }

    seenCandidates.add(key)
    uniqueCandidates.push(candidate)
  }

  return uniqueCandidates
}

function getScoredProxyLayoutCandidateScore({
  candidate,
  hardObstacleRects,
  layout,
  proxyObstacleRects,
  viewport,
}: {
  candidate: RawProxyCardPosition
  hardObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  layout: RawOffscreenRelationProxyLayout
  proxyObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  viewport: DbmlDiagramViewport
}) {
  const cardHeight = getScaledProxyCardHeight(layout.proxy, viewport)
  const rect = {
    left: candidate.left,
    top: candidate.top,
    width: getScaledProxyCardWidth(viewport),
    height: cardHeight,
  }
  const hardOverlapArea = hardObstacleRects.reduce(
    (sum, obstacleRect) => sum + getRectangleOverlapArea(rect, obstacleRect),
    0,
  )
  const proxyOverlapArea = proxyObstacleRects.reduce(
    (sum, obstacleRect) => sum + getRectangleOverlapArea(rect, obstacleRect),
    0,
  )
  const maxTop = viewport.height - cardHeight - PROXY_CARD_EDGE_GAP
  const edgePriorityPenalty =
    layout.proxy.side === 'top'
      ? Math.abs(candidate.top - PROXY_CARD_EDGE_GAP)
      : layout.proxy.side === 'bottom'
        ? Math.abs(candidate.top - maxTop)
        : 0
  const movementDistance =
    Math.abs(candidate.left - layout.left) +
    Math.abs(candidate.top - layout.top)

  return (
    hardOverlapArea * 1_000_000_000 +
    proxyOverlapArea * 1_000_000 +
    edgePriorityPenalty * 1_000 +
    movementDistance
  )
}

function getConstrainedProxyLayout({
  layout,
  placedLayouts,
  viewport,
  obstacles,
}: {
  layout: RawOffscreenRelationProxyLayout
  placedLayouts: readonly DbmlOffscreenRelationProxyLayout[]
  viewport: DbmlDiagramViewport
  obstacles: readonly DbmlOffscreenRelationProxyLayoutObstacle[]
}): DbmlOffscreenRelationProxyLayout {
  const isVerticalShift = true
  const rect = getRawProxyLayoutRect(layout, viewport)
  const position = getRawLayoutAxisPosition(layout, isVerticalShift)
  const size = isVerticalShift ? rect.height : rect.width
  const maxPosition =
    (isVerticalShift ? viewport.height : viewport.width) -
    size -
    PROXY_CARD_EDGE_GAP
  const effectiveObstacles = obstacles.filter(
    (obstacle) =>
      obstacle.kind !== 'active-node' || obstacle.id !== layout.proxy.table.id,
  )
  const proxyObstacleRects = placedLayouts.map((placedLayout) =>
    getProxyLayoutRect(placedLayout, viewport),
  )
  const hardForbiddenIntervals = getForbiddenPositionIntervals({
    gap: PROXY_CARD_GAP,
    isVerticalShift,
    obstacleRects: effectiveObstacles.map((obstacle) => obstacle.rect),
    rect,
  })
  const proxyForbiddenIntervals = getForbiddenPositionIntervals({
    gap: PROXY_CARD_GAP,
    isVerticalShift,
    obstacleRects: proxyObstacleRects,
    rect,
  })
  const allowedIntervals = getAllowedPositionIntervals({
    forbiddenIntervals: [...hardForbiddenIntervals, ...proxyForbiddenIntervals],
    max: maxPosition,
    min: PROXY_CARD_EDGE_GAP,
  })
  const nextPosition =
    getClosestPositionInIntervals(allowedIntervals, position) ??
    getFallbackConstrainedPosition({
      hardObstacleRects: effectiveObstacles.map((obstacle) => obstacle.rect),
      isVerticalShift,
      max: maxPosition,
      min: PROXY_CARD_EDGE_GAP,
      position,
      proxyObstacleRects,
      rect,
    })
  const nextLayout = setRawLayoutAxisPosition(
    layout,
    isVerticalShift,
    nextPosition,
  )

  return {
    proxy: layout.proxy,
    style: {
      left: nextLayout.left,
      top: nextLayout.top,
      transform: `scale(${viewport.zoom})`,
    },
  }
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
      clampScreenPosition({
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

function getConstrainedRawProxyCardPosition(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
  placementMode: OffscreenRelationProxyPlacementMode,
) {
  const position = getRawProxyCardPosition(proxy, viewport, placementMode)
  const unclampedTop = getUnclampedProxyCardTop(proxy, viewport, placementMode)
  const cardHeight = getScaledProxyCardHeight(proxy, viewport)
  const minTop = PROXY_CARD_EDGE_GAP
  const maxTop = viewport.height - cardHeight - PROXY_CARD_EDGE_GAP

  return {
    ...position,
    bottomOverflow: Math.max(0, unclampedTop - maxTop),
    topOverflow: Math.max(0, minTop - unclampedTop),
    unclampedTop,
  }
}

function getUnclampedProxyCardTop(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
  placementMode: OffscreenRelationProxyPlacementMode,
) {
  if (placementMode === 'parallel') {
    return getUnclampedParallelProxyCardTop(proxy, viewport)
  }

  return getUnclampedLineProxyCardTop(proxy, viewport)
}

function getUnclampedLineProxyCardTop(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
) {
  const anchorY = proxy.anchor.y * viewport.zoom + viewport.y
  const cardHeight = getScaledProxyCardHeight(proxy, viewport)

  if (proxy.side === 'bottom') {
    return anchorY - cardHeight
  }

  return anchorY - cardHeight / 2
}

function getUnclampedParallelProxyCardTop(
  proxy: DbmlOffscreenRelationProxy,
  viewport: DbmlDiagramViewport,
) {
  return proxy.table.position.y * viewport.zoom + viewport.y
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
      top: clampScreenPosition({
        max: viewport.height - cardHeight - PROXY_CARD_EDGE_GAP,
        min: PROXY_CARD_EDGE_GAP,
        value: tableTop,
      }),
    }
  }

  return {
    left: clampScreenPosition({
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
  const isVerticalStack = isVerticalProxyStack(side, placementMode)
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
    gap: PROXY_CARD_GAP,
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
    nextLeft = clampScreenPosition({
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

function getConstrainedRawLayoutGroups(
  layouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  return getCollidingRawLayoutGroups(layouts, viewport).flatMap((layoutGroup) =>
    getConstrainedRawLayoutLanes(layoutGroup, viewport),
  )
}

function getCollidingRawLayoutGroups(
  layouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  const visitedLayoutIndexes = new Set<number>()
  const groups: RawOffscreenRelationProxyLayout[][] = []

  for (const [layoutIndex] of layouts.entries()) {
    if (visitedLayoutIndexes.has(layoutIndex)) {
      continue
    }

    const group: RawOffscreenRelationProxyLayout[] = []
    const pendingLayoutIndexes = [layoutIndex]
    visitedLayoutIndexes.add(layoutIndex)

    while (pendingLayoutIndexes.length > 0) {
      const currentLayoutIndex = pendingLayoutIndexes.pop()

      if (currentLayoutIndex === undefined) {
        continue
      }

      const currentLayout = layouts[currentLayoutIndex]

      group.push(currentLayout)

      for (const [candidateLayoutIndex, candidateLayout] of layouts.entries()) {
        if (visitedLayoutIndexes.has(candidateLayoutIndex)) {
          continue
        }

        if (
          !rectanglesOverlap(
            getRawProxyLayoutRect(currentLayout, viewport),
            getRawProxyLayoutRect(candidateLayout, viewport),
          )
        ) {
          continue
        }

        visitedLayoutIndexes.add(candidateLayoutIndex)
        pendingLayoutIndexes.push(candidateLayoutIndex)
      }
    }

    groups.push(group)
  }

  return groups.map((group) =>
    [...group].sort(
      (first, second) => (first.sourceIndex ?? 0) - (second.sourceIndex ?? 0),
    ),
  )
}

function getConstrainedRawLayoutLanes(
  layouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  const availableHeight = viewport.height - PROXY_CARD_EDGE_GAP * 2

  if (getConstrainedStackHeight(layouts, viewport) <= availableHeight) {
    return [layouts]
  }

  const intent = getConstrainedGroupVerticalIntent(layouts)
  const lanes: RawOffscreenRelationProxyLayout[][] = []
  const priorityOrderedLayouts = [...layouts].sort((first, second) =>
    compareConstrainedLanePriority(first, second, intent),
  )

  for (const layout of priorityOrderedLayouts) {
    const targetLane = lanes.find((lane) =>
      canFitConstrainedLane([...lane, layout], viewport),
    )

    if (targetLane) {
      targetLane.push(layout)
      continue
    }

    lanes.push([layout])
  }

  const laneOffsets = getConstrainedLaneOffsets(layouts, viewport, lanes.length)

  return lanes.map((lane, laneIndex) =>
    lane.map((layout) => ({
      ...layout,
      left: clampScreenPosition({
        max:
          viewport.width -
          getScaledProxyCardWidth(viewport) -
          PROXY_CARD_EDGE_GAP,
        min: PROXY_CARD_EDGE_GAP,
        value: layout.left + laneOffsets[laneIndex],
      }),
    })),
  )
}

function canFitConstrainedLane(
  layouts: readonly RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  if (layouts.length <= 1) {
    return true
  }

  return (
    getConstrainedStackHeight(layouts, viewport) <=
    viewport.height - PROXY_CARD_EDGE_GAP * 2
  )
}

function getConstrainedStackHeight(
  layouts: readonly RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  return layouts.reduce(
    (height, layout, index) =>
      height +
      getScaledProxyCardHeight(layout.proxy, viewport) +
      (index === 0 ? 0 : PROXY_CARD_GAP),
    0,
  )
}

function getConstrainedLaneOffsets(
  layouts: readonly RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
  laneCount: number,
) {
  const cardWidth = getScaledProxyCardWidth(viewport)
  const groupLeft = Math.min(...layouts.map((layout) => layout.left))
  const groupRight = Math.max(
    ...layouts.map((layout) => layout.left + cardWidth),
  )
  const groupWidth = groupRight - groupLeft
  const laneStep = groupWidth + PROXY_CARD_GAP
  const viewportCenter = viewport.width / 2
  const groupCenter = groupLeft + groupWidth / 2
  const preferredDirection = groupCenter >= viewportCenter ? -1 : 1
  const minOffset = PROXY_CARD_EDGE_GAP - groupLeft
  const maxOffset = viewport.width - PROXY_CARD_EDGE_GAP - groupRight
  const offsets = [0]
  const usedOffsets = new Set(offsets)

  for (let laneIndex = 1; laneIndex < laneCount; laneIndex += 1) {
    let nextOffset: number | undefined

    for (
      let distance = 1;
      distance <= laneCount && nextOffset === undefined;
      distance += 1
    ) {
      for (const direction of [preferredDirection, -preferredDirection]) {
        const candidate = direction * distance * laneStep

        if (
          usedOffsets.has(candidate) ||
          candidate < minOffset ||
          candidate > maxOffset
        ) {
          continue
        }

        nextOffset = candidate
        break
      }
    }

    if (nextOffset === undefined) {
      nextOffset = clampScreenPosition({
        max: maxOffset,
        min: minOffset,
        value: preferredDirection * laneIndex * laneStep,
      })
    }

    offsets.push(nextOffset)
    usedOffsets.add(nextOffset)
  }

  return offsets
}

function compareConstrainedLanePriority(
  first: RawOffscreenRelationProxyLayout,
  second: RawOffscreenRelationProxyLayout,
  intent: ConstrainedVerticalStackIntent,
) {
  const firstOverflow = getConstrainedIntentOverflow(first, intent)
  const secondOverflow = getConstrainedIntentOverflow(second, intent)

  if (firstOverflow !== secondOverflow) {
    return secondOverflow - firstOverflow
  }

  const firstDesiredTop = first.unclampedTop ?? first.top
  const secondDesiredTop = second.unclampedTop ?? second.top

  if (firstDesiredTop !== secondDesiredTop) {
    return intent === 'top'
      ? firstDesiredTop - secondDesiredTop
      : secondDesiredTop - firstDesiredTop
  }

  return (first.sourceIndex ?? 0) - (second.sourceIndex ?? 0)
}

function getConstrainedIntentOverflow(
  layout: RawOffscreenRelationProxyLayout,
  intent: ConstrainedVerticalStackIntent,
) {
  if (intent === 'top') {
    return layout.topOverflow ?? 0
  }

  if (intent === 'bottom') {
    return layout.bottomOverflow ?? 0
  }

  return Math.max(layout.topOverflow ?? 0, layout.bottomOverflow ?? 0)
}

function getOrderedConstrainedRawLayouts(
  layouts: RawOffscreenRelationProxyLayout[],
  viewport: DbmlDiagramViewport,
) {
  const intent = getConstrainedGroupVerticalIntent(layouts)
  const sortedLayouts = [...layouts].sort(
    (first, second) =>
      getConstrainedStackOrderPriority(first, intent) -
        getConstrainedStackOrderPriority(second, intent) ||
      (first.unclampedTop ?? first.top) - (second.unclampedTop ?? second.top) ||
      first.left - second.left ||
      (first.sourceIndex ?? 0) - (second.sourceIndex ?? 0),
  )
  const itemSizes = sortedLayouts.map((layout) =>
    getScaledProxyCardHeight(layout.proxy, viewport),
  )
  const stackPositions = getConstrainedStackPositions({
    desiredPositions: sortedLayouts.map((layout) => layout.top),
    intent,
    itemSizes,
    maxEndPosition: viewport.height - PROXY_CARD_EDGE_GAP,
    minPosition: PROXY_CARD_EDGE_GAP,
  })

  return sortedLayouts.map((layout, index) => ({
    ...layout,
    top: stackPositions[index],
  }))
}

function getConstrainedStackOrderPriority(
  layout: RawOffscreenRelationProxyLayout,
  intent: ConstrainedVerticalStackIntent,
) {
  if (intent === 'top') {
    return layout.proxy.side === 'top' ? 0 : 1
  }

  if (intent === 'bottom') {
    return layout.proxy.side === 'bottom' ? 1 : 0
  }

  switch (layout.proxy.side) {
    case 'top':
      return 0
    case 'bottom':
      return 2
    case 'left':
    case 'right':
      return 1
  }
}

function getConstrainedGroupVerticalIntent(
  layouts: readonly RawOffscreenRelationProxyLayout[],
): ConstrainedVerticalStackIntent {
  const topOverflow = layouts.reduce(
    (overflow, layout) => overflow + (layout.topOverflow ?? 0),
    0,
  )
  const bottomOverflow = layouts.reduce(
    (overflow, layout) => overflow + (layout.bottomOverflow ?? 0),
    0,
  )

  if (topOverflow > bottomOverflow) {
    return 'top'
  }

  if (bottomOverflow > topOverflow) {
    return 'bottom'
  }

  return 'neutral'
}

function getConstrainedStackPositions({
  desiredPositions,
  intent,
  itemSizes,
  maxEndPosition,
  minPosition,
}: {
  desiredPositions: readonly number[]
  intent: ConstrainedVerticalStackIntent
  itemSizes: readonly number[]
  maxEndPosition: number
  minPosition: number
}) {
  if (intent === 'top') {
    return getTopAnchoredStackPositions({
      gap: PROXY_CARD_GAP,
      itemSizes,
      minPosition,
    })
  }

  if (intent === 'bottom') {
    return getBottomAnchoredStackPositions({
      gap: PROXY_CARD_GAP,
      itemSizes,
      maxEndPosition,
      minPosition,
    })
  }

  return getNonOverlappingStackPositions({
    desiredPositions,
    gap: PROXY_CARD_GAP,
    itemSizes,
    maxEndPosition,
    minPosition,
  })
}

function getTopAnchoredStackPositions({
  gap,
  itemSizes,
  minPosition,
}: {
  gap: number
  itemSizes: readonly number[]
  minPosition: number
}) {
  const positions: number[] = []
  let nextPosition = minPosition

  for (const itemSize of itemSizes) {
    positions.push(nextPosition)
    nextPosition += itemSize + gap
  }

  return positions
}

function getBottomAnchoredStackPositions({
  gap,
  itemSizes,
  maxEndPosition,
  minPosition,
}: {
  gap: number
  itemSizes: readonly number[]
  maxEndPosition: number
  minPosition: number
}) {
  const positions = Array<number>(itemSizes.length)
  let nextEndPosition = maxEndPosition

  for (let index = itemSizes.length - 1; index >= 0; index -= 1) {
    positions[index] = nextEndPosition - itemSizes[index]
    nextEndPosition = positions[index] - gap
  }

  const underflow = minPosition - positions[0]

  if (underflow <= 0) {
    return positions
  }

  return positions.map((position) => position + underflow)
}

function isVerticalProxyStack(
  side: DbmlOffscreenRelationProxy['side'] | undefined,
  placementMode: OffscreenRelationProxyPlacementMode,
) {
  return placementMode === 'parallel' || side === 'left' || side === 'right'
}

function getRawLayoutAxisPosition(
  layout: RawOffscreenRelationProxyLayout,
  isVerticalShift: boolean,
) {
  return isVerticalShift ? layout.top : layout.left
}

function setRawLayoutAxisPosition(
  layout: RawOffscreenRelationProxyLayout,
  isVerticalShift: boolean,
  position: number,
): RawOffscreenRelationProxyLayout {
  return {
    ...layout,
    left: isVerticalShift ? layout.left : position,
    top: isVerticalShift ? position : layout.top,
  }
}

function getForbiddenPositionIntervals({
  gap,
  isVerticalShift,
  obstacleRects,
  rect,
}: {
  gap: number
  isVerticalShift: boolean
  obstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  rect: DbmlOffscreenRelationProxyLayoutRect
}): PositionInterval[] {
  const size = isVerticalShift ? rect.height : rect.width

  return obstacleRects
    .filter((obstacleRect) =>
      intervalsOverlap(
        isVerticalShift ? rect.left : rect.top,
        isVerticalShift ? rect.left + rect.width : rect.top + rect.height,
        isVerticalShift ? obstacleRect.left : obstacleRect.top,
        isVerticalShift
          ? obstacleRect.left + obstacleRect.width
          : obstacleRect.top + obstacleRect.height,
      ),
    )
    .map((obstacleRect) => {
      const obstacleStart = isVerticalShift
        ? obstacleRect.top
        : obstacleRect.left
      const obstacleEnd =
        obstacleStart +
        (isVerticalShift ? obstacleRect.height : obstacleRect.width)

      return {
        start: obstacleStart - size - gap,
        end: obstacleEnd + gap,
      }
    })
}

function getAllowedPositionIntervals({
  forbiddenIntervals,
  max,
  min,
}: {
  forbiddenIntervals: readonly PositionInterval[]
  max: number
  min: number
}): PositionInterval[] {
  if (max < min) {
    return []
  }

  const mergedForbiddenIntervals = getMergedIntervals(
    forbiddenIntervals
      .map((interval) => ({
        start: clampScreenPosition({
          max,
          min,
          value: interval.start,
        }),
        end: clampScreenPosition({
          max,
          min,
          value: interval.end,
        }),
      }))
      .filter((interval) => interval.start <= interval.end),
  )
  const allowedIntervals: PositionInterval[] = []
  let cursor = min

  for (const interval of mergedForbiddenIntervals) {
    if (interval.start > cursor) {
      allowedIntervals.push({
        start: cursor,
        end: interval.start,
      })
    }

    cursor = Math.max(cursor, interval.end)
  }

  if (cursor <= max) {
    allowedIntervals.push({
      start: cursor,
      end: max,
    })
  }

  return allowedIntervals
}

function getMergedIntervals(
  intervals: readonly PositionInterval[],
): PositionInterval[] {
  const sortedIntervals = [...intervals].sort(
    (first, second) => first.start - second.start,
  )
  const mergedIntervals: PositionInterval[] = []

  for (const interval of sortedIntervals) {
    const previousInterval = mergedIntervals.at(-1)

    if (!previousInterval || interval.start > previousInterval.end) {
      mergedIntervals.push({ ...interval })
      continue
    }

    previousInterval.end = Math.max(previousInterval.end, interval.end)
  }

  return mergedIntervals
}

function getClosestPositionInIntervals(
  intervals: readonly PositionInterval[],
  position: number,
) {
  return intervals
    .map((interval) =>
      clampScreenPosition({
        max: interval.end,
        min: interval.start,
        value: position,
      }),
    )
    .sort(
      (first, second) =>
        Math.abs(first - position) - Math.abs(second - position) ||
        first - second,
    )[0]
}

function getFallbackConstrainedPosition({
  hardObstacleRects,
  isVerticalShift,
  max,
  min,
  position,
  proxyObstacleRects,
  rect,
}: {
  hardObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  isVerticalShift: boolean
  max: number
  min: number
  position: number
  proxyObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  rect: DbmlOffscreenRelationProxyLayoutRect
}) {
  const size = isVerticalShift ? rect.height : rect.width
  const candidates = new Set<number>([position, min, max])

  for (const obstacleRect of [...hardObstacleRects, ...proxyObstacleRects]) {
    const obstacleStart = isVerticalShift ? obstacleRect.top : obstacleRect.left
    const obstacleEnd =
      obstacleStart +
      (isVerticalShift ? obstacleRect.height : obstacleRect.width)

    candidates.add(obstacleStart - size - PROXY_CARD_GAP)
    candidates.add(obstacleEnd + PROXY_CARD_GAP)
  }

  return [...candidates]
    .map((candidate) =>
      clampScreenPosition({
        max,
        min,
        value: candidate,
      }),
    )
    .sort(
      (first, second) =>
        getConstrainedFallbackScore({
          hardObstacleRects,
          isVerticalShift,
          position: first,
          proxyObstacleRects,
          rect,
          targetPosition: position,
        }) -
          getConstrainedFallbackScore({
            hardObstacleRects,
            isVerticalShift,
            position: second,
            proxyObstacleRects,
            rect,
            targetPosition: position,
          }) || first - second,
    )[0]
}

function getConstrainedFallbackScore({
  hardObstacleRects,
  isVerticalShift,
  position,
  proxyObstacleRects,
  rect,
  targetPosition,
}: {
  hardObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  isVerticalShift: boolean
  position: number
  proxyObstacleRects: readonly DbmlOffscreenRelationProxyLayoutRect[]
  rect: DbmlOffscreenRelationProxyLayoutRect
  targetPosition: number
}) {
  const nextRect = {
    ...rect,
    left: isVerticalShift ? rect.left : position,
    top: isVerticalShift ? position : rect.top,
  }
  const hardOverlapArea = hardObstacleRects.reduce(
    (sum, obstacleRect) =>
      sum + getRectangleOverlapArea(nextRect, obstacleRect),
    0,
  )
  const proxyOverlapArea = proxyObstacleRects.reduce(
    (sum, obstacleRect) =>
      sum + getRectangleOverlapArea(nextRect, obstacleRect),
    0,
  )

  return (
    hardOverlapArea * 1_000_000_000 +
    proxyOverlapArea * 1_000_000 +
    Math.abs(position - targetPosition)
  )
}

function intervalsOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) {
  return firstStart < secondEnd && firstEnd > secondStart
}

type PositionInterval = {
  start: number
  end: number
}

type RawOffscreenRelationProxyLayout = {
  bottomOverflow?: number
  proxy: DbmlOffscreenRelationProxy
  left: number
  sourceIndex?: number
  top: number
  topOverflow?: number
  unclampedTop?: number
}

type RawProxyCardPosition = {
  left: number
  top: number
}

type ConstrainedVerticalStackIntent = 'bottom' | 'neutral' | 'top'
