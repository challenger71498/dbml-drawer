import type { DbmlDiagramViewport, DbmlOffscreenRelationProxy } from './proxy'

export const PROXY_CARD_WIDTH = 184
export const PROXY_CARD_HEADER_HEIGHT = 30
export const PROXY_CARD_COLUMN_HEIGHT = 30
export const PROXY_CARD_GAP = 10
export const PROXY_CARD_EDGE_GAP = 14

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
