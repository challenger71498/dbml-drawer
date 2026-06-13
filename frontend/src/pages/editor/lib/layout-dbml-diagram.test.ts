import { describe, expect, it } from 'vitest'
import type { ElkNode } from 'elkjs/lib/elk-api'
import { createDbmlDiagram } from './create-dbml-diagram'
import {
  applyRelationPortRouting,
  createElkLayoutOptions,
  fromElkGraph,
  getNearestRelationPortPair,
  layoutDbmlDiagram,
  toElkGraph,
} from './layout-dbml-diagram'
import { parseDbmlDocument } from './parse-dbml-document'
import { DEFAULT_DBML_LAYOUT_ALGORITHM_ID } from '../model/dbml-layout-settings'
import type {
  DbmlDiagram,
  DbmlDiagramRelation,
  DbmlDiagramTable,
} from '../model/dbml-diagram'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'

const SOURCE = `Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer
}

Ref: posts.user_id > users.id
`

const SELF_REFERENCE_SOURCE = `Table categories {
  id integer [pk]
  parent_id integer
}

Ref: categories.parent_id > categories.id
`

describe('layout-dbml-diagram', () => {
  it('maps diagram tables and column ports into an ELK graph', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const graph = toElkGraph(diagram)
    const posts = graph.children?.find(
      (node) => node.id === 'table:public.posts',
    )

    expect(graph.layoutOptions).toMatchObject({
      'elk.algorithm': DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.portConstraints': 'FIXED_ORDER',
    })
    expect(posts?.ports?.map((port) => port.layoutOptions)).toContainEqual({
      'elk.port.side': 'EAST',
      'elk.port.index': '1',
    })
    expect(graph.edges?.[0]).toMatchObject({
      sources: ['table:public.posts.column:user_id.port:right'],
      targets: ['table:public.users.column:id.port:left'],
    })
  })

  it('uses the selected ELK layout algorithm in layout options', () => {
    expect(
      createElkLayoutOptions({
        algorithmId: 'org.eclipse.elk.force',
        optionValues: {
          'elk.force.model': 'EADES',
        },
      }),
    ).toMatchObject({
      'elk.algorithm': 'org.eclipse.elk.force',
      'elk.force.model': 'EADES',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.portConstraints': 'FIXED_ORDER',
    })
  })

  it('maps ELK layout results back to layouted diagram data', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const graph: ElkNode = {
      id: 'dbml-diagram',
      children: [
        {
          id: 'table:public.users',
          x: 400,
          y: 100,
          ports: [
            {
              id: 'table:public.users.column:id.port:left',
              x: 0,
              y: 59,
            },
          ],
        },
        {
          id: 'table:public.posts',
          x: 80,
          y: 100,
          ports: [
            {
              id: 'table:public.posts.column:user_id.port:right',
              x: 260,
              y: 89,
            },
          ],
        },
      ],
      edges: [
        {
          id: 'relation:1:0',
          sources: ['table:public.posts.column:user_id.port:right'],
          targets: ['table:public.users.column:id.port:left'],
          sections: [
            {
              id: 'route:1',
              startPoint: { x: 340, y: 189 },
              bendPoints: [{ x: 370, y: 189 }],
              endPoint: { x: 400, y: 159 },
            },
          ],
        },
      ],
    }

    const layoutedDiagram = fromElkGraph(diagram, graph)

    expect(layoutedDiagram.tables[0]?.position).toEqual({ x: 400, y: 100 })
    expect(layoutedDiagram.relations[0]?.route).toEqual({
      startPoint: { x: 340, y: 189 },
      bendPoints: [{ x: 370, y: 189 }],
      endPoint: { x: 400, y: 159 },
    })
  })

  it('preserves fixed relation ports when fixed routing is selected', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const routedDiagram = applyRelationPortRouting(
      diagram,
      createLayoutedDiagram(diagram, {
        'table:public.posts': { x: 400, y: 0 },
        'table:public.users': { x: 0, y: 0 },
      }),
      'fixed',
    )

    expect(routedDiagram.relations[0]).toMatchObject({
      sourcePortId: 'table:public.posts.column:user_id.port:right',
      targetPortId: 'table:public.users.column:id.port:left',
    })
  })

  it('selects relation ports that face the related table', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const layoutedDiagram = createLayoutedDiagram(diagram, {
      'table:public.posts': { x: 400, y: 0 },
      'table:public.users': { x: 0, y: 0 },
    })
    const routedDiagram = applyRelationPortRouting(
      diagram,
      layoutedDiagram,
      'nearest',
    )

    expect(routedDiagram.relations[0]).toMatchObject({
      sourcePortId: 'table:public.posts.column:user_id.port:left',
      targetPortId: 'table:public.users.column:id.port:right',
    })
  })

  it('uses fixed direction when related table centers align', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const relation = getRequiredRelation(diagram)
    const layoutedDiagram = createLayoutedDiagram(diagram, {
      'table:public.posts': { x: 0, y: 0 },
      'table:public.users': { x: 0, y: 30 },
    })

    expect(getNearestRelationPortPair(layoutedDiagram, relation)).toEqual({
      sourcePortId: 'table:public.posts.column:user_id.port:right',
      targetPortId: 'table:public.users.column:id.port:left',
    })
  })

  it('routes same-table self-reference relations right to right in nearest mode', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SELF_REFERENCE_SOURCE))
    const selfRelation = getRequiredRelation(diagram)
    const routedDiagram = applyRelationPortRouting(
      diagram,
      createLayoutedDiagram(diagram, {
        'table:public.categories': { x: 0, y: 0 },
      }),
      'nearest',
    )

    expect(selfRelation.sourceTableId).toBe(selfRelation.targetTableId)
    expect(selfRelation.sourceColumnId).not.toBe(selfRelation.targetColumnId)
    expect(routedDiagram.relations[0]).toMatchObject({
      sourcePortId: 'table:public.categories.column:parent_id.port:right',
      targetPortId: 'table:public.categories.column:id.port:right',
    })
  })

  it('keeps nearest relation ports facing the related table in the returned layout', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram, {
      relationPortRoutingMode: 'nearest',
    })

    for (const relation of layoutedDiagram.relations) {
      expect(getNearestRelationPortPair(layoutedDiagram, relation)).toEqual({
        sourcePortId: relation.sourcePortId,
        targetPortId: relation.targetPortId,
      })
    }
  })
})

function getRequiredRelation(diagram: DbmlDiagram): DbmlDiagramRelation {
  const relation = diagram.relations[0]

  if (!relation) {
    throw new Error('Expected diagram fixture to include a relation.')
  }

  return relation
}

function createLayoutedDiagram(
  diagram: DbmlDiagram,
  tablePositions: Record<string, { x: number; y: number }>,
): LayoutedDbmlDiagram {
  return {
    tables: diagram.tables.map((table) =>
      createLayoutedTable(table, tablePositions[table.id] ?? { x: 0, y: 0 }),
    ),
    relations: diagram.relations.map((relation) => ({
      ...relation,
      route: {
        startPoint: { x: 0, y: 0 },
        bendPoints: [],
        endPoint: { x: 0, y: 0 },
      },
    })),
  }
}

function createLayoutedTable(
  table: DbmlDiagramTable,
  position: { x: number; y: number },
): LayoutedDbmlDiagram['tables'][number] {
  return {
    ...table,
    position,
    columns: table.columns.map((column) => {
      const y = position.y + 44 + column.rowIndex * 30 + 15

      return {
        ...column,
        portPositions: {
          left: {
            x: position.x,
            y,
          },
          right: {
            x: position.x + table.size.width,
            y,
          },
        },
      }
    }),
  }
}
