import ELK from 'elkjs/lib/elk.bundled.js'
import type {
  ElkEdgeSection,
  ElkExtendedEdge,
  ElkNode,
  ElkPort,
} from 'elkjs/lib/elk-api'
import type {
  DbmlDiagram,
  DbmlDiagramPort,
  DbmlDiagramRelation,
  DbmlDiagramTable,
} from '../model/dbml-diagram'
import type {
  DbmlDiagramPoint,
  DbmlDiagramRoute,
  LayoutedDbmlDiagram,
  LayoutedDbmlDiagramTable,
} from '../model/dbml-layout'
import {
  DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
  type DbmlLayoutAlgorithmId,
  type DbmlLayoutOptionValueMap,
} from '../model/dbml-layout-settings'
import { TABLE_COLUMN_HEIGHT } from './create-dbml-diagram'

const elk = new ELK()

export type DbmlDiagramLayoutOptions = {
  algorithmId?: DbmlLayoutAlgorithmId
  optionValues?: DbmlLayoutOptionValueMap
}

const DEFAULT_ELK_LAYOUT_OPTIONS = {
  'elk.direction': 'RIGHT',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.portConstraints': 'FIXED_ORDER',
  'elk.spacing.nodeNode': '48',
  'elk.layered.spacing.nodeNodeBetweenLayers': '96',
  'elk.spacing.edgeEdge': '12',
  'elk.spacing.portPort': '8',
}

const EMPTY_ROUTE: DbmlDiagramRoute = {
  startPoint: { x: 0, y: 0 },
  bendPoints: [],
  endPoint: { x: 0, y: 0 },
}

export async function layoutDbmlDiagram(
  diagram: DbmlDiagram,
  options: DbmlDiagramLayoutOptions = {},
): Promise<LayoutedDbmlDiagram> {
  if (diagram.tables.length === 0) {
    return {
      tables: [],
      relations: [],
    }
  }

  const graph = await elk.layout(toElkGraph(diagram, options))

  return fromElkGraph(diagram, graph)
}

export function toElkGraph(
  diagram: DbmlDiagram,
  options: DbmlDiagramLayoutOptions = {},
): ElkNode {
  return {
    id: 'dbml-diagram',
    layoutOptions: createElkLayoutOptions(options),
    children: diagram.tables.map(toElkNode),
    edges: diagram.relations.map(toElkEdge),
  }
}

export function createElkLayoutOptions({
  algorithmId = DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
  optionValues = {},
}: DbmlDiagramLayoutOptions) {
  return {
    'elk.algorithm': algorithmId,
    ...DEFAULT_ELK_LAYOUT_OPTIONS,
    ...optionValues,
  }
}

export function fromElkGraph(
  diagram: DbmlDiagram,
  graph: ElkNode,
): LayoutedDbmlDiagram {
  const elkNodeById = new Map(
    (graph.children ?? []).map((node) => [node.id, node]),
  )
  const elkEdgeById = new Map(
    (graph.edges ?? []).map((edge) => [edge.id, edge]),
  )
  const tables = diagram.tables.map((table) =>
    layoutTable(table, elkNodeById.get(table.id)),
  )
  const relations = diagram.relations.map((relation) => ({
    ...relation,
    route: getRelationRoute(elkEdgeById.get(relation.id)),
  }))

  return {
    tables,
    relations,
  }
}

function toElkNode(table: DbmlDiagramTable): ElkNode {
  return {
    id: table.id,
    width: table.size.width,
    height: table.size.height,
    ports: table.ports.map((port) => toElkPort(table, port)),
  }
}

function toElkPort(table: DbmlDiagramTable, port: DbmlDiagramPort): ElkPort {
  const column = table.columns.find(
    (candidate) => candidate.id === port.columnId,
  )
  const portY =
    column === undefined
      ? 0
      : 44 + column.rowIndex * TABLE_COLUMN_HEIGHT + TABLE_COLUMN_HEIGHT / 2

  return {
    id: port.id,
    width: 1,
    height: 1,
    x: port.side === 'left' ? 0 : table.size.width,
    y: portY,
    layoutOptions: {
      'elk.port.side': port.side === 'left' ? 'WEST' : 'EAST',
      'elk.port.index': String(port.rowIndex),
    },
  }
}

function toElkEdge(relation: DbmlDiagramRelation): ElkExtendedEdge {
  return {
    id: relation.id,
    sources: [relation.sourcePortId],
    targets: [relation.targetPortId],
  }
}

function layoutTable(
  table: DbmlDiagramTable,
  elkNode: ElkNode | undefined,
): LayoutedDbmlDiagramTable {
  const portById = new Map(
    (elkNode?.ports ?? []).map((port) => [port.id, port]),
  )
  const position = {
    x: elkNode?.x ?? 0,
    y: elkNode?.y ?? 0,
  }

  return {
    ...table,
    position,
    columns: table.columns.map((column) => ({
      ...column,
      portPositions: {
        left: getPortPosition(position, portById.get(column.leftPortId)),
        right: getPortPosition(position, portById.get(column.rightPortId)),
      },
    })),
  }
}

function getPortPosition(
  nodePosition: DbmlDiagramPoint,
  port: ElkPort | undefined,
): DbmlDiagramPoint {
  return {
    x: nodePosition.x + (port?.x ?? 0),
    y: nodePosition.y + (port?.y ?? 0),
  }
}

function getRelationRoute(edge: ElkExtendedEdge | undefined): DbmlDiagramRoute {
  const section = edge?.sections?.[0]

  if (!section) {
    return EMPTY_ROUTE
  }

  return {
    startPoint: toDiagramPoint(section.startPoint),
    bendPoints: getBendPoints(section),
    endPoint: toDiagramPoint(section.endPoint),
  }
}

function getBendPoints(section: ElkEdgeSection): DbmlDiagramPoint[] {
  return (section.bendPoints ?? []).map(toDiagramPoint)
}

function toDiagramPoint(point: DbmlDiagramPoint): DbmlDiagramPoint {
  return {
    x: point.x,
    y: point.y,
  }
}
