import type { DbmlDiagramColumn } from './dbml-diagram'
import type { DbmlDiagramSelectionTarget } from './dbml-diagram-selection'
import type {
  LayoutedDbmlDiagram,
  LayoutedDbmlDiagramRelation,
  LayoutedDbmlDiagramTable,
} from './dbml-layout'

export type DbmlDiagramViewport = {
  x: number
  y: number
  zoom: number
  width: number
  height: number
}

export type DbmlDiagramBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type DbmlOffscreenRelationProxySide = 'top' | 'right' | 'bottom' | 'left'

export type DbmlOffscreenRelationProxy = {
  id: string
  table: LayoutedDbmlDiagramTable
  side: DbmlOffscreenRelationProxySide
  anchor: {
    x: number
    y: number
  }
  relationIds: readonly string[]
  columns: readonly DbmlDiagramColumn[]
}

export function getFlowViewportBounds({
  x,
  y,
  zoom,
  width,
  height,
}: DbmlDiagramViewport): DbmlDiagramBounds {
  return {
    x: -x / zoom,
    y: -y / zoom,
    width: width / zoom,
    height: height / zoom,
  }
}

export function getOffscreenRelationProxies({
  diagram,
  focusedTarget,
  viewport,
}: {
  diagram: LayoutedDbmlDiagram | null
  focusedTarget: DbmlDiagramSelectionTarget | null
  viewport: DbmlDiagramViewport | null
}): DbmlOffscreenRelationProxy[] {
  if (!diagram || !focusedTarget || !viewport || viewport.zoom <= 0) {
    return []
  }

  const viewportBounds = getFlowViewportBounds(viewport)
  const tableById = new Map(diagram.tables.map((table) => [table.id, table]))
  const focusedTable = tableById.get(focusedTarget.tableId)

  if (!focusedTable) {
    return []
  }

  const proxyBuilders = new Map<
    string,
    {
      table: LayoutedDbmlDiagramTable
      relationIds: Set<string>
      columnIds: Set<string>
    }
  >()

  for (const relation of diagram.relations) {
    if (!isRelationConnectedToFocusedTarget(relation, focusedTarget)) {
      continue
    }

    const proxyTableId = getOppositeTableId(relation, focusedTarget.tableId)
    const proxyColumnId = getColumnIdForTable(relation, proxyTableId)
    const proxyTable = tableById.get(proxyTableId)

    if (!proxyTable || isTableVisible(proxyTable, viewportBounds)) {
      continue
    }

    const proxyBuilder = proxyBuilders.get(proxyTable.id) ?? {
      table: proxyTable,
      relationIds: new Set<string>(),
      columnIds: new Set<string>(),
    }

    proxyBuilder.relationIds.add(relation.id)
    proxyBuilder.columnIds.add(proxyColumnId)
    proxyBuilders.set(proxyTable.id, proxyBuilder)
  }

  return [...proxyBuilders.values()].map((proxyBuilder) => {
    const columns = proxyBuilder.table.columns.filter((column) =>
      proxyBuilder.columnIds.has(column.id),
    )
    const placement = getProxyPlacementOnViewportEdge({
      focusedTable,
      proxyTable: proxyBuilder.table,
      viewportBounds,
    })

    return {
      id: `offscreen-proxy:${proxyBuilder.table.id}`,
      table: proxyBuilder.table,
      side: placement.side,
      anchor: placement.anchor,
      relationIds: [...proxyBuilder.relationIds],
      columns,
    }
  })
}

export function isTableVisible(
  table: LayoutedDbmlDiagramTable,
  viewportBounds: DbmlDiagramBounds,
) {
  return rectanglesIntersect(getTableBounds(table), viewportBounds)
}

export function getTableBounds(
  table: LayoutedDbmlDiagramTable,
): DbmlDiagramBounds {
  return {
    x: table.position.x,
    y: table.position.y,
    width: table.size.width,
    height: table.size.height,
  }
}

export function getTableCenter(table: LayoutedDbmlDiagramTable) {
  return {
    x: table.position.x + table.size.width / 2,
    y: table.position.y + table.size.height / 2,
  }
}

function isRelationConnectedToFocusedTarget(
  relation: LayoutedDbmlDiagramRelation,
  focusedTarget: DbmlDiagramSelectionTarget,
) {
  if (focusedTarget.type === 'table') {
    return (
      relation.sourceTableId === focusedTarget.tableId ||
      relation.targetTableId === focusedTarget.tableId
    )
  }

  return (
    relation.sourceColumnId === focusedTarget.columnId ||
    relation.targetColumnId === focusedTarget.columnId
  )
}

function getOppositeTableId(
  relation: LayoutedDbmlDiagramRelation,
  focusedTableId: string,
) {
  return relation.sourceTableId === focusedTableId
    ? relation.targetTableId
    : relation.sourceTableId
}

function getColumnIdForTable(
  relation: LayoutedDbmlDiagramRelation,
  tableId: string,
) {
  return relation.sourceTableId === tableId
    ? relation.sourceColumnId
    : relation.targetColumnId
}

function getOffscreenProxySide(
  table: LayoutedDbmlDiagramTable,
  viewportBounds: DbmlDiagramBounds,
): DbmlOffscreenRelationProxySide {
  const tableBounds = getTableBounds(table)
  const viewportRight = viewportBounds.x + viewportBounds.width
  const viewportBottom = viewportBounds.y + viewportBounds.height
  const tableRight = tableBounds.x + tableBounds.width
  const tableBottom = tableBounds.y + tableBounds.height
  const overflows = [
    {
      side: 'left',
      distance: viewportBounds.x - tableRight,
    },
    {
      side: 'right',
      distance: tableBounds.x - viewportRight,
    },
    {
      side: 'top',
      distance: viewportBounds.y - tableBottom,
    },
    {
      side: 'bottom',
      distance: tableBounds.y - viewportBottom,
    },
  ] satisfies Array<{
    side: DbmlOffscreenRelationProxySide
    distance: number
  }>
  const overflow = overflows
    .filter((candidate) => candidate.distance > 0)
    .sort((first, second) => second.distance - first.distance)[0]

  if (overflow) {
    return overflow.side
  }

  const tableCenterX = tableBounds.x + tableBounds.width / 2
  const tableCenterY = tableBounds.y + tableBounds.height / 2
  const viewportCenterX = viewportBounds.x + viewportBounds.width / 2
  const viewportCenterY = viewportBounds.y + viewportBounds.height / 2
  const horizontalDistance = Math.abs(tableCenterX - viewportCenterX)
  const verticalDistance = Math.abs(tableCenterY - viewportCenterY)

  if (horizontalDistance >= verticalDistance) {
    return tableCenterX < viewportCenterX ? 'left' : 'right'
  }

  return tableCenterY < viewportCenterY ? 'top' : 'bottom'
}

function getProxyPlacementOnViewportEdge({
  focusedTable,
  proxyTable,
  viewportBounds,
}: {
  focusedTable: LayoutedDbmlDiagramTable
  proxyTable: LayoutedDbmlDiagramTable
  viewportBounds: DbmlDiagramBounds
}) {
  const focusedCenter = getTableCenter(focusedTable)
  const proxyCenter = getTableCenter(proxyTable)
  const deltaX = proxyCenter.x - focusedCenter.x
  const deltaY = proxyCenter.y - focusedCenter.y
  const candidates: Array<{
    side: DbmlOffscreenRelationProxySide
    t: number
    x: number
    y: number
  }> = []

  if (deltaX > 0) {
    addCandidateForX('right', viewportBounds.x + viewportBounds.width)
  } else if (deltaX < 0) {
    addCandidateForX('left', viewportBounds.x)
  }

  if (deltaY > 0) {
    addCandidateForY('bottom', viewportBounds.y + viewportBounds.height)
  } else if (deltaY < 0) {
    addCandidateForY('top', viewportBounds.y)
  }

  const placement = candidates
    .filter(
      (candidate) =>
        candidate.t >= 0 &&
        candidate.t <= 1 &&
        isCandidateOnViewportEdge(candidate),
    )
    .sort((first, second) => first.t - second.t)[0]

  if (placement) {
    return {
      side: placement.side,
      anchor: {
        x: placement.x,
        y: placement.y,
      },
    }
  }

  return {
    side: getOffscreenProxySide(proxyTable, viewportBounds),
    anchor: {
      x: Math.min(
        viewportBounds.x + viewportBounds.width,
        Math.max(viewportBounds.x, proxyCenter.x),
      ),
      y: Math.min(
        viewportBounds.y + viewportBounds.height,
        Math.max(viewportBounds.y, proxyCenter.y),
      ),
    },
  }

  function addCandidateForX(side: DbmlOffscreenRelationProxySide, x: number) {
    const t = (x - focusedCenter.x) / deltaX
    candidates.push({
      side,
      t,
      x,
      y: focusedCenter.y + deltaY * t,
    })
  }

  function addCandidateForY(side: DbmlOffscreenRelationProxySide, y: number) {
    const t = (y - focusedCenter.y) / deltaY
    candidates.push({
      side,
      t,
      x: focusedCenter.x + deltaX * t,
      y,
    })
  }

  function isCandidateOnViewportEdge(candidate: { x: number; y: number }) {
    const viewportRight = viewportBounds.x + viewportBounds.width
    const viewportBottom = viewportBounds.y + viewportBounds.height
    const epsilon = 0.001

    return (
      candidate.x >= viewportBounds.x - epsilon &&
      candidate.x <= viewportRight + epsilon &&
      candidate.y >= viewportBounds.y - epsilon &&
      candidate.y <= viewportBottom + epsilon
    )
  }
}

function rectanglesIntersect(
  first: DbmlDiagramBounds,
  second: DbmlDiagramBounds,
) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  )
}
