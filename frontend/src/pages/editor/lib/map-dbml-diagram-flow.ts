import type { Edge, Node } from '@xyflow/react'
import type {
  DbmlDiagramRoute,
  LayoutedDbmlDiagram,
  LayoutedDbmlDiagramRelation,
  LayoutedDbmlDiagramTable,
} from '../model/dbml-layout'
import type { DbmlRelationLineStyle } from '../model/dbml-diagram-rendering'

export type DbmlDiagramFlowOptions = {
  lineStyle: DbmlRelationLineStyle
}

export type DbmlTableNodeData = {
  table: LayoutedDbmlDiagramTable
}

export type DbmlRelationEdgeData = {
  relation: LayoutedDbmlDiagramRelation
  route: DbmlDiagramRoute
  lineStyle: DbmlRelationLineStyle
}

export type DbmlDiagramFlowElements = {
  nodes: Node<DbmlTableNodeData>[]
  edges: Edge<DbmlRelationEdgeData>[]
}

export function mapDbmlDiagramToFlow(
  diagram: LayoutedDbmlDiagram,
  { lineStyle }: DbmlDiagramFlowOptions,
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
        lineStyle,
      },
    })),
  }
}
