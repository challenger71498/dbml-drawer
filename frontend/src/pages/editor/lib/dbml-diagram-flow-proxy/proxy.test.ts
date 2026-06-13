import { describe, expect, it } from 'vitest'
import type { DbmlDiagramSelectionTarget } from '../../model/dbml-diagram-selection'
import type {
  LayoutedDbmlDiagram,
  LayoutedDbmlDiagramRelation,
  LayoutedDbmlDiagramTable,
} from '../../model/dbml-layout'
import {
  getFlowViewportBounds,
  getOffscreenRelationProxies,
  isTableVisible,
} from './proxy'

const FOCUSED_TABLE_TARGET: DbmlDiagramSelectionTarget = {
  type: 'table',
  tableId: 'table:public.posts',
}

const FOCUSED_COLUMN_TARGET: DbmlDiagramSelectionTarget = {
  type: 'column',
  tableId: 'table:public.posts',
  columnId: 'table:public.posts.column:user_id',
}

const POSTS = createTable('posts', 0, 0, ['id', 'user_id'])
const USERS = createTable('users', 900, 0, ['id', 'email', 'name'])
const TEAMS = createTable('teams', 120, 40, ['id'])
const MEMBERS = createTable('members', -500, 0, ['id'])

const DIAGRAM: LayoutedDbmlDiagram = {
  tables: [POSTS, USERS, TEAMS, MEMBERS],
  relations: [
    createRelation({
      id: 'relation:users:1',
      sourceTable: POSTS,
      sourceColumn: 'user_id',
      targetTable: USERS,
      targetColumn: 'id',
    }),
    createRelation({
      id: 'relation:users:2',
      sourceTable: POSTS,
      sourceColumn: 'user_id',
      targetTable: USERS,
      targetColumn: 'email',
    }),
    createRelation({
      id: 'relation:teams:1',
      sourceTable: POSTS,
      sourceColumn: 'id',
      targetTable: TEAMS,
      targetColumn: 'id',
    }),
    createRelation({
      id: 'relation:members:1',
      sourceTable: MEMBERS,
      sourceColumn: 'id',
      targetTable: POSTS,
      targetColumn: 'id',
    }),
  ],
}

describe('dbml offscreen relation proxies', () => {
  it('converts React Flow viewport transforms to flow bounds', () => {
    expect(
      getFlowViewportBounds({
        x: -200,
        y: -100,
        zoom: 2,
        width: 800,
        height: 600,
      }),
    ).toEqual({
      x: 100,
      y: 50,
      width: 400,
      height: 300,
    })
  })

  it('detects whether a table intersects the viewport bounds', () => {
    expect(isTableVisible(TEAMS, { x: 0, y: 0, width: 400, height: 300 })).toBe(
      true,
    )
    expect(isTableVisible(USERS, { x: 0, y: 0, width: 400, height: 300 })).toBe(
      false,
    )
  })

  it('derives deduplicated proxies for offscreen tables connected to a focused table', () => {
    const proxies = getOffscreenRelationProxies({
      diagram: DIAGRAM,
      focusedTarget: FOCUSED_TABLE_TARGET,
      viewport: { x: 0, y: 0, zoom: 1, width: 600, height: 400 },
    })

    expect(proxies).toHaveLength(2)
    expect(proxies.map((proxy) => proxy.table.id)).toEqual([
      USERS.id,
      MEMBERS.id,
    ])
    expect(proxies[0]).toMatchObject({
      side: 'right',
      relationIds: ['relation:users:1', 'relation:users:2'],
    })
    expect(proxies[0].anchor.x).toBeCloseTo(600, 2)
    expect(proxies[0].anchor.y).toBeCloseTo(59.83, 2)
    expect(proxies[0].columns.map((column) => column.name)).toEqual([
      'id',
      'email',
    ])
    expect(proxies[1]).toMatchObject({
      side: 'left',
      relationIds: ['relation:members:1'],
    })
    expect(proxies[1].anchor.x).toBeCloseTo(0, 2)
    expect(proxies[1].anchor.y).toBeCloseTo(48.1, 2)
  })

  it('derives only opposite endpoint table proxies for a focused column relation', () => {
    const proxies = getOffscreenRelationProxies({
      diagram: DIAGRAM,
      focusedTarget: FOCUSED_COLUMN_TARGET,
      viewport: { x: 0, y: 0, zoom: 1, width: 600, height: 400 },
    })

    expect(proxies).toHaveLength(1)
    expect(proxies[0].table.id).toBe(USERS.id)
    expect(proxies[0].relationIds).toEqual([
      'relation:users:1',
      'relation:users:2',
    ])
  })

  it('can keep proxies visible until the original table center enters the viewport', () => {
    const partiallyVisibleUsers = createTable('users', 500, 0, ['id', 'email'])
    const diagram: LayoutedDbmlDiagram = {
      tables: [POSTS, partiallyVisibleUsers],
      relations: [
        createRelation({
          id: 'relation:users:partial',
          sourceTable: POSTS,
          sourceColumn: 'user_id',
          targetTable: partiallyVisibleUsers,
          targetColumn: 'id',
        }),
      ],
    }
    const viewport = { x: 0, y: 0, zoom: 1, width: 600, height: 400 }

    expect(
      getOffscreenRelationProxies({
        diagram,
        focusedTarget: FOCUSED_TABLE_TARGET,
        viewport,
      }),
    ).toHaveLength(0)
    expect(
      getOffscreenRelationProxies({
        diagram,
        focusedTarget: FOCUSED_TABLE_TARGET,
        viewport,
        visibilityMode: 'center',
      }).map((proxy) => proxy.table.id),
    ).toEqual([partiallyVisibleUsers.id])
  })

  it('keeps proxies visible until both axes pass the minimum visible ratio', () => {
    const cornerVisibleUsers = createTable('users', 366, 96, ['id', 'email'])
    const diagram: LayoutedDbmlDiagram = {
      tables: [POSTS, cornerVisibleUsers],
      relations: [
        createRelation({
          id: 'relation:users:corner',
          sourceTable: POSTS,
          sourceColumn: 'user_id',
          targetTable: cornerVisibleUsers,
          targetColumn: 'id',
        }),
      ],
    }
    const viewport = { x: 0, y: 0, zoom: 1, width: 600, height: 160 }

    expect(
      getOffscreenRelationProxies({
        diagram,
        focusedTarget: FOCUSED_TABLE_TARGET,
        minimumVisibleRatio: 0.8,
        viewport,
      }).map((proxy) => proxy.table.id),
    ).toEqual([cornerVisibleUsers.id])
  })
})

function createTable(
  name: string,
  x: number,
  y: number,
  columnNames: readonly string[],
): LayoutedDbmlDiagramTable {
  const id = `table:public.${name}`
  const columns = columnNames.map((columnName, rowIndex) =>
    createColumn(id, columnName, rowIndex),
  )

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

function createColumn(
  tableId: string,
  name: string,
  rowIndex: number,
): LayoutedDbmlDiagramTable['columns'][number] {
  return {
    id: `${tableId}.column:${name}`,
    source: {} as LayoutedDbmlDiagramTable['columns'][number]['source'],
    tableId,
    name,
    typeName: 'uuid',
    rowIndex,
    leftPortId: `${tableId}.column:${name}.port:left`,
    rightPortId: `${tableId}.column:${name}.port:right`,
    isPrimaryKey: name === 'id',
    isUnique: false,
    isNotNull: false,
    portPositions: {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
    },
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
      startPoint: { x: 0, y: 0 },
      bendPoints: [],
      endPoint: { x: 0, y: 0 },
    },
  }
}
