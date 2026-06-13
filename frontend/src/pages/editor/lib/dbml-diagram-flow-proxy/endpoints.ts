import { Position } from '@xyflow/react'
import type { DbmlDiagramColumn } from '../../model/dbml-diagram'
import type {
  DbmlRelationEdgeData,
  DbmlRelationEdgeEndpoint,
  DbmlRelationEdgeEndpointOverride,
} from '../dbml-diagram-flow'
import {
  getScaledProxyCardHeight,
  getScaledProxyCardWidth,
  getScaledProxyColumnHeight,
  getScaledProxyHeaderHeight,
} from './card-metrics'
import type {
  DbmlOffscreenRelationProxyLayout,
  DbmlOffscreenRelationProxyLayoutRect,
} from './layout'
import type { DbmlDiagramViewport } from './proxy'

const DIAGRAM_TABLE_HEADER_HEIGHT = 44
const MORPH_ENDPOINT_HANDOFF_PROGRESS = 0.2

export function getProxyRelationEndpointOverride({
  proxyLayout,
  relation,
  viewport,
}: {
  proxyLayout: DbmlOffscreenRelationProxyLayout
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
  proxyLayout: DbmlOffscreenRelationProxyLayout
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
  proxyLayout: DbmlOffscreenRelationProxyLayout,
  viewport: DbmlDiagramViewport,
): DbmlOffscreenRelationProxyLayoutRect {
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

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
