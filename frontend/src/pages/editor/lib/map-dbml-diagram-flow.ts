import type { Edge, Node } from '@xyflow/react'
import type {
  DbmlDiagramRoute,
  LayoutedDbmlDiagram,
  LayoutedDbmlDiagramRelation,
  LayoutedDbmlDiagramTable,
} from '../model/dbml-layout'

export type DbmlTableNodeData = {
  table: LayoutedDbmlDiagramTable
}

export type DbmlRelationEdgeData = {
  relation: LayoutedDbmlDiagramRelation
  route: DbmlDiagramRoute
}

export type DbmlDiagramFlowElements = {
  nodes: Node<DbmlTableNodeData>[]
  edges: Edge<DbmlRelationEdgeData>[]
}

export function mapDbmlDiagramToFlow(
  diagram: LayoutedDbmlDiagram,
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
      },
    })),
  }
}
