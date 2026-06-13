import { describe, expect, it } from 'vitest'
import { mapDbmlDiagramToFlow } from './dbml-diagram-flow'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'

describe('dbml diagram flow elements', () => {
  it('uses the selected relation port ids as React Flow handles', () => {
    const elements = mapDbmlDiagramToFlow(
      {
        tables: [],
        relations: [
          {
            id: 'relation:1:0',
            source: {} as LayoutedDbmlDiagram['relations'][number]['source'],
            sourceTableId: 'table:public.posts',
            sourceColumnId: 'table:public.posts.column:user_id',
            sourcePortId: 'table:public.posts.column:user_id.port:left',
            targetTableId: 'table:public.users',
            targetColumnId: 'table:public.users.column:id',
            targetPortId: 'table:public.users.column:id.port:right',
            cardinality: {
              source: 'many',
              target: 'one',
            },
            route: {
              startPoint: { x: 0, y: 0 },
              bendPoints: [],
              endPoint: { x: 100, y: 0 },
            },
          },
        ],
      },
      {
        highlightMode: 'gradient',
        lineStyle: 'bezier',
      },
    )

    expect(elements.edges[0]).toMatchObject({
      sourceHandle: 'table:public.posts.column:user_id.port:left',
      targetHandle: 'table:public.users.column:id.port:right',
    })
  })
})
