import type { LayoutedDbmlDiagramTable } from './dbml-layout'
import type {
  DbmlDiagramViewport,
  DbmlOffscreenRelationProxy,
} from './dbml-offscreen-relation-proxies'
import type {
  DbmlOffscreenRelationProxyLayout,
  DbmlOffscreenRelationProxyLayoutRect,
} from './dbml-offscreen-relation-proxy-layout'
import type { OffscreenRelationProxyTransitionMode } from './editor-theme'

const OPACITY_HANDOFF_DISTANCE = 40
const MIN_PROXY_OPACITY = 0.1

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
  getLayouts: noneOffscreenRelationProxyTransitionStrategy.getLayouts,
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

function getProxyOpacity({
  proxy,
  viewport,
  viewportRect,
}: {
  proxy: DbmlOffscreenRelationProxy
  viewport: DbmlDiagramViewport
  viewportRect: DbmlOffscreenRelationProxyLayoutRect
}) {
  const distance = getRectDistanceToViewport(
    getTableScreenRect(proxy.table, viewport),
    viewportRect,
  )
  const progress = 1 - clamp(distance / OPACITY_HANDOFF_DISTANCE, 0, 1)

  return 1 - progress * (1 - MIN_PROXY_OPACITY)
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
