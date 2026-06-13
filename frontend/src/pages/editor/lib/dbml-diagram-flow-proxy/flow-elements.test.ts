import { Position } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import type { DbmlDiagramFlowElements } from '../dbml-diagram-flow'
import type {
  LayoutedDbmlDiagramRelation,
  LayoutedDbmlDiagramTable,
} from '../../model/dbml-layout'
import type { DbmlOffscreenRelationProxyLayout } from './layout'
import {
  getFlowElementsWithHiddenProxyOriginalNodes,
  getFlowElementsWithProxyLineEndpoints,
} from './flow-elements'

describe('dbml diagram flow proxy element adaptation', () => {
  it('adds proxy endpoint overrides to represented relation edges', () => {
    const users = createTable('users', 900, 0, ['id'])
    const posts = createTable('posts', 0, 0, ['id', 'user_id'])
    const relation = createRelation({
      id: 'relation:posts-users',
      sourceTable: users,
      sourceColumn: 'id',
      targetTable: posts,
      targetColumn: 'user_id',
    })
    const elements = createFlowElements({
      nodes: [users, posts],
      relations: [relation],
    })
    const proxyLayout = createProxyLayout({
      table: users,
      relationIds: [relation.id],
      style: {
        left: 402,
        top: 14,
        transform: 'scale(1)',
      },
    })

    const adaptedElements = getFlowElementsWithProxyLineEndpoints({
      elements,
      proxyLayouts: [proxyLayout],
      viewport: { x: 0, y: 0, zoom: 1, width: 600, height: 400 },
    })

    const adaptedEdge = adaptedElements.edges[0]

    if (!adaptedEdge?.data) {
      throw new Error('Expected adapted relation edge data.')
    }

    expect(adaptedElements.nodes).toBe(elements.nodes)
    expect(adaptedEdge.data.endpointOverride).toEqual({
      source: {
        x: 586,
        y: 59,
        position: Position.Right,
      },
    })
  })

  it('keeps unrelated relation edges unchanged', () => {
    const users = createTable('users', 900, 0, ['id'])
    const posts = createTable('posts', 0, 0, ['id', 'user_id'])
    const relation = createRelation({
      id: 'relation:posts-users',
      sourceTable: users,
      sourceColumn: 'id',
      targetTable: posts,
      targetColumn: 'user_id',
    })
    const elements = createFlowElements({
      nodes: [users, posts],
      relations: [relation],
    })

    const adaptedElements = getFlowElementsWithProxyLineEndpoints({
      elements,
      proxyLayouts: [
        createProxyLayout({
          table: users,
          relationIds: ['relation:other'],
        }),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 600, height: 400 },
    })

    expect(adaptedElements.edges[0]).toBe(elements.edges[0])
  })

  it('applies the lowest proxy transition opacity to original table nodes', () => {
    const users = createTable('users', 900, 0, ['id'])
    const posts = createTable('posts', 0, 0, ['id', 'user_id'])
    const elements = createFlowElements({
      nodes: [users, posts],
      relations: [],
    })

    const adaptedElements = getFlowElementsWithHiddenProxyOriginalNodes({
      elements,
      proxyLayouts: [
        createProxyLayout({
          table: users,
          originalOpacity: 0.65,
        }),
        createProxyLayout({
          table: users,
          originalOpacity: 0.25,
        }),
      ],
    })

    expect(adaptedElements.edges).toBe(elements.edges)
    expect(adaptedElements.nodes.find((node) => node.id === users.id)).toEqual(
      expect.objectContaining({
        style: {
          opacity: 0.25,
        },
      }),
    )
    expect(adaptedElements.nodes.find((node) => node.id === posts.id)).toBe(
      elements.nodes[1],
    )
  })
})

function createFlowElements({
  nodes,
  relations,
}: {
  nodes: readonly LayoutedDbmlDiagramTable[]
  relations: readonly LayoutedDbmlDiagramRelation[]
}): DbmlDiagramFlowElements {
  return {
    nodes: nodes.map((table) => ({
      id: table.id,
      type: 'dbmlTable',
      position: table.position,
      data: {
        table,
      },
    })),
    edges: relations.map((relation) => ({
      id: relation.id,
      type: 'dbmlRelation',
      source: relation.sourceTableId,
      target: relation.targetTableId,
      data: {
        relation,
        route: relation.route,
        highlightMode: 'gradient',
        lineStyle: 'bezier',
      },
    })),
  }
}

function createProxyLayout({
  table,
  relationIds = [],
  originalOpacity,
  style = {
    left: 0,
    top: 0,
    transform: 'scale(1)',
  },
}: {
  table: LayoutedDbmlDiagramTable
  relationIds?: readonly string[]
  originalOpacity?: number
  style?: {
    left: number
    top: number
    transform: string
  }
}): DbmlOffscreenRelationProxyLayout {
  return {
    proxy: {
      id: `offscreen-proxy:${table.id}`,
      table,
      side: 'right',
      anchor: { x: 600, y: 0 },
      relationIds,
      columns: table.columns.slice(0, 1),
    },
    style,
    originalOpacity,
  }
}

function createTable(
  name: string,
  x: number,
  y: number,
  columnNames: readonly string[],
): LayoutedDbmlDiagramTable {
  const id = `table:public.${name}`
  const columns = columnNames.map((columnName, rowIndex) => ({
    id: `${id}.column:${columnName}`,
    source: {} as LayoutedDbmlDiagramTable['columns'][number]['source'],
    tableId: id,
    name: columnName,
    typeName: 'uuid',
    rowIndex,
    leftPortId: `${id}.column:${columnName}.port:left`,
    rightPortId: `${id}.column:${columnName}.port:right`,
    isPrimaryKey: columnName === 'id',
    isUnique: false,
    isNotNull: false,
    portPositions: {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
    },
  }))

  return {
    id,
    source: {} as LayoutedDbmlDiagramTable['source'],
    schemaName: 'public',
    name,
    columns,
    ports: [],
    size: {
      width: 260,
      height: 44 + columns.length * 30,
    },
    position: { x, y },
  }
}

function createRelation({
  id,
  sourceTable,
  sourceColumn,
  targetTable,
  targetColumn,
}: {
  id: string
  sourceTable: LayoutedDbmlDiagramTable
  sourceColumn: string
  targetTable: LayoutedDbmlDiagramTable
  targetColumn: string
}): LayoutedDbmlDiagramRelation {
  return {
    id,
    source: {} as LayoutedDbmlDiagramRelation['source'],
    sourceTableId: sourceTable.id,
    sourceColumnId: `${sourceTable.id}.column:${sourceColumn}`,
    sourcePortId: `${sourceTable.id}.column:${sourceColumn}.port:right`,
    targetTableId: targetTable.id,
    targetColumnId: `${targetTable.id}.column:${targetColumn}`,
    targetPortId: `${targetTable.id}.column:${targetColumn}.port:left`,
    cardinality: {
      source: 'many',
      target: 'one',
    },
    route: {
      startPoint: { x: 1200, y: 59 },
      bendPoints: [],
      endPoint: { x: 0, y: 59 },
    },
  }
}
