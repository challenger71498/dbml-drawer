import type { Edge, Node, Position } from '@xyflow/react'
import type {
  DbmlDiagramRoute,
  LayoutedDbmlDiagram,
  LayoutedDbmlDiagramRelation,
  LayoutedDbmlDiagramTable,
} from '../model/dbml-layout'
import type {
  DbmlRelationHighlightMode,
  DbmlRelationLineStyle,
} from '../model/dbml-diagram-rendering'

export type DbmlDiagramFlowOptions = {
  highlightMode: DbmlRelationHighlightMode
  lineStyle: DbmlRelationLineStyle
}

export type DbmlTableNodeData = {
  table: LayoutedDbmlDiagramTable
}

export type DbmlRelationEdgeData = {
  relation: LayoutedDbmlDiagramRelation
  route: DbmlDiagramRoute
  highlightMode: DbmlRelationHighlightMode
  lineStyle: DbmlRelationLineStyle
  endpointOverride?: DbmlRelationEdgeEndpointOverride
}

export type DbmlRelationEdgeEndpointOverride = {
  source?: DbmlRelationEdgeEndpoint
  target?: DbmlRelationEdgeEndpoint
}

export type DbmlRelationEdgeEndpoint = {
  x: number
  y: number
  position: Position
}

export type DbmlDiagramFlowElements = {
  nodes: Node<DbmlTableNodeData>[]
  edges: Edge<DbmlRelationEdgeData>[]
}

export function mapDbmlDiagramToFlow(
  diagram: LayoutedDbmlDiagram,
  { highlightMode, lineStyle }: DbmlDiagramFlowOptions,
): DbmlDiagramFlowElements {
  return {
    nodes: diagram.tables.map((table) => ({
      id: table.id,
      type: 'dbmlTable',
      position: table.position,
      data: {
        table,
      },
    })),
    edges: diagram.relations.map((relation) => ({
      id: relation.id,
      type: 'dbmlRelation',
      source: relation.sourceTableId,
      target: relation.targetTableId,
      sourceHandle: relation.sourcePortId,
      targetHandle: relation.targetPortId,
      data: {
        relation,
        route: relation.route,
        highlightMode,
        lineStyle,
      },
    })),
  }
}
