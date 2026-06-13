import {
  getScaledProxyCardHeight,
  getScaledProxyCardWidth,
} from './card-metrics'
import type {
  DbmlOffscreenRelationProxyLayout,
  DbmlOffscreenRelationProxyLayoutRect,
} from './layout'
import type { LayoutedDbmlDiagramTable } from '../../model/dbml-layout'
import type { DbmlDiagramViewport, DbmlOffscreenRelationProxy } from './proxy'
import type { OffscreenRelationProxyTransitionMode } from '../../model/editor-theme'

const MIN_PROXY_OPACITY = 0.1
const PROXY_HANDOFF_DISTANCE = 80
const PROXY_COMPLETE_VISIBILITY_RATIO = 0.8

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

  return layouts.map((layout) => {
    const progress = getOpacityHandoffProgress({
      proxy: layout.proxy,
      viewport,
      viewportRect,
    })

    return {
      ...layout,
      originalOpacity: progress,
      style: {
        ...layout.style,
        opacity: 1 - progress * (1 - MIN_PROXY_OPACITY),
      },
    }
  })
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
    const progress = getProxyHandoffProgress({
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
        top: screenRect.top,
        transform: `scale(${formatTransformNumber(viewport.zoom)})`,
        width: screenRect.width / viewport.zoom,
      },
    }
  })
}

function getOpacityHandoffProgress({
  proxy,
  viewport,
  viewportRect,
}: {
  proxy: DbmlOffscreenRelationProxy
  viewport: DbmlDiagramViewport
  viewportRect: DbmlOffscreenRelationProxyLayoutRect
}) {
  return getProxyHandoffProgress({
    tableRect: getTableScreenRect(proxy.table, viewport),
    viewportRect,
  })
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

function getProxyHandoffProgress({
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

  return 1 - clamp(startDistance / PROXY_HANDOFF_DISTANCE, 0, 1)
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
  const insetX = tableRect.width * (PROXY_COMPLETE_VISIBILITY_RATIO - 0.5)
  const insetY = tableRect.height * (PROXY_COMPLETE_VISIBILITY_RATIO - 0.5)
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatTransformNumber(value: number) {
  return Number(value.toFixed(4)).toString()
}
