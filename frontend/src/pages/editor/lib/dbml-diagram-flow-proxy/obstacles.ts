import type { LayoutedDbmlDiagram } from '../../model/dbml-layout'
import { PROXY_CARD_EDGE_GAP } from './card-metrics'
import type {
  DbmlOffscreenRelationProxyLayoutObstacle,
  DbmlOffscreenRelationProxyLayoutRect,
} from './layout'
import type { DbmlDiagramViewport } from './proxy'
import { rectanglesOverlap } from './screen-geometry'

const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_WIDTH = 232
const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_TOP = 12
const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_RIGHT = 12
const PREVIEW_TOP_RIGHT_CONTROL_SAFE_AREA_HEIGHT = 70

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
