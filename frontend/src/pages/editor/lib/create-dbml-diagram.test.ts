import { describe, expect, it } from 'vitest'
import { createDbmlDiagram } from './create-dbml-diagram'
import { parseDbmlDocument } from './parse-dbml-document'

const SOURCE = `Table users {
  id integer [pk]
  org_id integer
}

Table posts {
  id integer [pk]
  user_id integer [not null]
}

Ref: posts.user_id > users.id
`

describe('createDbmlDiagram', () => {
  it('wraps parsed tables and columns with stable diagram metadata', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))

    expect(diagram.tables).toHaveLength(2)

    const users = diagram.tables.find((table) => table.name === 'users')

    expect(users).toBeDefined()
    expect(users?.source.name).toBe('users')
    expect(users?.columns[0]).toMatchObject({
      id: 'table:public.users.column:id',
      name: 'id',
      typeName: 'integer',
      rowIndex: 0,
      leftPortId: 'table:public.users.column:id.port:left',
      rightPortId: 'table:public.users.column:id.port:right',
      isPrimaryKey: true,
    })
    expect(users?.ports.map((port) => port.id)).toContain(
      'table:public.users.column:id.port:left',
    )
  })

  it('converts DBML refs to column-level diagram relations', () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))

    expect(diagram.relations).toHaveLength(1)
    expect(diagram.relations[0]).toMatchObject({
      sourceTableId: 'table:public.posts',
      sourceColumnId: 'table:public.posts.column:user_id',
      sourcePortId: 'table:public.posts.column:user_id.port:right',
      targetTableId: 'table:public.users',
      targetColumnId: 'table:public.users.column:id',
      targetPortId: 'table:public.users.column:id.port:left',
      cardinality: {
        source: 'many',
        target: 'one',
      },
    })
  })
})
