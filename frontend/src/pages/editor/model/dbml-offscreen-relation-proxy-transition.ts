import {
  getScaledProxyCardHeight,
  getScaledProxyCardWidth,
  type DbmlOffscreenRelationProxyLayout,
  type DbmlOffscreenRelationProxyLayoutRect,
} from './dbml-offscreen-relation-proxy-layout'
import type { LayoutedDbmlDiagramTable } from './dbml-layout'
import type {
  DbmlDiagramViewport,
  DbmlOffscreenRelationProxy,
} from './dbml-offscreen-relation-proxies'
import type { OffscreenRelationProxyTransitionMode } from './editor-theme'

const OPACITY_HANDOFF_DISTANCE = 40
const MIN_PROXY_OPACITY = 0.1
const MORPH_HANDOFF_DISTANCE = 80
const MORPH_COMPLETE_VISIBILITY_RATIO = 0.8
const MIN_MORPH_OPACITY = 0.1

export type DbmlOffscreenRelationProxyTransitionOptions = {
  mode: OffscreenRelationProxyTransitionMode
}

export type DbmlOffscreenRelationProxyTransitionStrategy<TOptions> = {
  id: string
  getLayouts: (
    input: DbmlOffscreenRelationProxyTransitionInput<TOptions>,
  ) => DbmlOffscreenRelationProxyLayout[]
}

export type DbmlOffscreenRelationProxyTransitionInput<TOptions> = {
  layouts: readonly DbmlOffscreenRelationProxyLayout[]
  viewport: DbmlDiagramViewport
  options: TOptions
}

export const noneOffscreenRelationProxyTransitionStrategy = {
  id: 'none',
  getLayouts: ({ layouts }) => [...layouts],
} satisfies DbmlOffscreenRelationProxyTransitionStrategy<object>

export const opacityOffscreenRelationProxyTransitionStrategy = {
  id: 'opacity',
  getLayouts: getOpacityTransitionLayouts,
} satisfies DbmlOffscreenRelationProxyTransitionStrategy<object>

export const morphOffscreenRelationProxyTransitionStrategy = {
  id: 'morph',
  getLayouts: getMorphTransitionLayouts,
} satisfies DbmlOffscreenRelationProxyTransitionStrategy<object>

export function getOffscreenRelationProxyTransitionLayouts({
  layouts,
  viewport,
  options,
}: DbmlOffscreenRelationProxyTransitionInput<DbmlOffscreenRelationProxyTransitionOptions>) {
  switch (options.mode) {
    case 'opacity':
      return opacityOffscreenRelationProxyTransitionStrategy.getLayouts({
        layouts,
        viewport,
        options: {},
      })
    case 'morph':
      return morphOffscreenRelationProxyTransitionStrategy.getLayouts({
        layouts,
        viewport,
        options: {},
      })
    case 'none':
      return noneOffscreenRelationProxyTransitionStrategy.getLayouts({
        layouts,
        viewport,
        options: {},
      })
  }
}

function getOpacityTransitionLayouts({
  layouts,
  viewport,
}: DbmlOffscreenRelationProxyTransitionInput<object>) {
  const viewportRect = {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height,
  }

  return layouts.map((layout) => ({
    ...layout,
    style: {
      ...layout.style,
      opacity: getProxyOpacity({
        proxy: layout.proxy,
        viewport,
        viewportRect,
      }),
    },
  }))
}

function getMorphTransitionLayouts({
  layouts,
  viewport,
}: DbmlOffscreenRelationProxyTransitionInput<object>) {
  const viewportRect = {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height,
  }

  return layouts.map((layout) => {
    const tableRect = getTableScreenRect(layout.proxy.table, viewport)
    const progress = getMorphHandoffProgress({
      tableRect,
      viewportRect,
    })

    if (progress <= 0) {
      return layout
    }

    const proxyRect = getProxyScreenRect(layout, viewport)
    const screenRect = interpolateRect(proxyRect, tableRect, progress)
    return {
      ...layout,
      handoffProgress: progress,
      screenRect,
      sourceScreenRect: proxyRect,
      style: {
        ...layout.style,
        height: screenRect.height / viewport.zoom,
        left: screenRect.left,
        opacity: interpolate(1, MIN_MORPH_OPACITY, progress),
        top: screenRect.top,
        transform: `scale(${formatTransformNumber(viewport.zoom)})`,
        width: screenRect.width / viewport.zoom,
      },
    }
  })
}

function getProxyOpacity({
  proxy,
  viewport,
  viewportRect,
}: {
  proxy: DbmlOffscreenRelationProxy
  viewport: DbmlDiagramViewport
  viewportRect: DbmlOffscreenRelationProxyLayoutRect
}) {
  const progress = getHandoffProgress({
    rect: getTableScreenRect(proxy.table, viewport),
    viewportRect,
    distance: OPACITY_HANDOFF_DISTANCE,
  })

  return 1 - progress * (1 - MIN_PROXY_OPACITY)
}

function getProxyScreenRect(
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

function getHandoffProgress({
  rect,
  viewportRect,
  distance,
}: {
  rect: DbmlOffscreenRelationProxyLayoutRect
  viewportRect: DbmlOffscreenRelationProxyLayoutRect
  distance: number
}) {
  return (
    1 - clamp(getRectDistanceToViewport(rect, viewportRect) / distance, 0, 1)
  )
}

function getMorphHandoffProgress({
  tableRect,
  viewportRect,
}: {
  tableRect: DbmlOffscreenRelationProxyLayoutRect
  viewportRect: DbmlOffscreenRelationProxyLayoutRect
}) {
  const center = getTableScreenCenter(tableRect)
  const startDistance = getPointDistanceToMorphCompletion(
    center,
    tableRect,
    viewportRect,
  )

  return 1 - clamp(startDistance / MORPH_HANDOFF_DISTANCE, 0, 1)
}

function interpolateRect(
  from: DbmlOffscreenRelationProxyLayoutRect,
  to: DbmlOffscreenRelationProxyLayoutRect,
  progress: number,
): DbmlOffscreenRelationProxyLayoutRect {
  return {
    left: interpolate(from.left, to.left, progress),
    top: interpolate(from.top, to.top, progress),
    width: interpolate(from.width, to.width, progress),
    height: interpolate(from.height, to.height, progress),
  }
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function getTableScreenRect(
  table: LayoutedDbmlDiagramTable,
  viewport: DbmlDiagramViewport,
): DbmlOffscreenRelationProxyLayoutRect {
  return {
    left: table.position.x * viewport.zoom + viewport.x,
    top: table.position.y * viewport.zoom + viewport.y,
    width: table.size.width * viewport.zoom,
    height: table.size.height * viewport.zoom,
  }
}

function getTableScreenCenter(rect: DbmlOffscreenRelationProxyLayoutRect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function getPointDistanceToMorphCompletion(
  point: { x: number; y: number },
  tableRect: DbmlOffscreenRelationProxyLayoutRect,
  viewportRect: DbmlOffscreenRelationProxyLayoutRect,
) {
  const viewportCenter = getTableScreenCenter(viewportRect)
  const insetX = tableRect.width * (MORPH_COMPLETE_VISIBILITY_RATIO - 0.5)
  const insetY = tableRect.height * (MORPH_COMPLETE_VISIBILITY_RATIO - 0.5)
  const horizontalDistance =
    point.x >= viewportCenter.x
      ? point.x - (viewportRect.left + viewportRect.width - insetX)
      : viewportRect.left + insetX - point.x
  const verticalDistance =
    point.y >= viewportCenter.y
      ? point.y - (viewportRect.top + viewportRect.height - insetY)
      : viewportRect.top + insetY - point.y

  return Math.hypot(
    Math.max(0, horizontalDistance),
    Math.max(0, verticalDistance),
  )
}

function getRectDistanceToViewport(
  rect: DbmlOffscreenRelationProxyLayoutRect,
  viewportRect: DbmlOffscreenRelationProxyLayoutRect,
) {
  const horizontalDistance =
    rect.left > viewportRect.left + viewportRect.width
      ? rect.left - (viewportRect.left + viewportRect.width)
      : viewportRect.left > rect.left + rect.width
        ? viewportRect.left - (rect.left + rect.width)
        : 0
  const verticalDistance =
    rect.top > viewportRect.top + viewportRect.height
      ? rect.top - (viewportRect.top + viewportRect.height)
      : viewportRect.top > rect.top + rect.height
        ? viewportRect.top - (rect.top + rect.height)
        : 0

  return Math.hypot(horizontalDistance, verticalDistance)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatTransformNumber(value: number) {
  return Number(value.toFixed(4)).toString()
}
