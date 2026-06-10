import { describe, expect, it } from 'vitest'
import type { ElkNode } from 'elkjs/lib/elk-api'
import { createDbmlDiagram } from './create-dbml-diagram'
import {
  createElkLayoutOptions,
  fromElkGraph,
  toElkGraph,
} from './layout-dbml-diagram'
import { parseDbmlDocument } from './parse-dbml-document'
import { DEFAULT_DBML_LAYOUT_ALGORITHM_ID } from '../model/dbml-layout-settings'

const SOURCE = `Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer
}

Ref: posts.user_id > users.id
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
})
