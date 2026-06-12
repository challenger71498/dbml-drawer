import { describe, expect, it } from 'vitest'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  getActiveRelationEndpointColumnIds,
  getActiveTableIds,
  getRelationEndpointColumnIdsForTargets,
  getRelationIdsForTargets,
  isSameDiagramSelectionTarget,
  type DbmlDiagramSelectionTarget,
} from './dbml-diagram-selection'

const TABLE_TARGET: DbmlDiagramSelectionTarget = {
  type: 'table',
  tableId: 'table:public.users',
}

const COLUMN_TARGET: DbmlDiagramSelectionTarget = {
  type: 'column',
  tableId: 'table:public.posts',
  columnId: 'table:public.posts.column:user_id',
}

const TARGET_SIDE_COLUMN_TARGET: DbmlDiagramSelectionTarget = {
  type: 'column',
  tableId: 'table:public.posts',
  columnId: 'table:public.posts.column:id',
}

const DIAGRAM = {
  tables: [],
  relations: [
    {
      id: 'relation:1:0',
      sourceTableId: 'table:public.posts',
      sourceColumnId: 'table:public.posts.column:user_id',
      targetTableId: 'table:public.users',
      targetColumnId: 'table:public.users.column:id',
    },
    {
      id: 'relation:2:0',
      sourceTableId: 'table:public.comments',
      sourceColumnId: 'table:public.comments.column:post_id',
      targetTableId: 'table:public.posts',
      targetColumnId: 'table:public.posts.column:id',
    },
  ],
} as unknown as LayoutedDbmlDiagram

describe('dbml diagram selection', () => {
  it('prefers hovered target over focused target', () => {
    expect(
      getActiveDiagramSelectionTarget({
        hoveredTarget: COLUMN_TARGET,
        focusedTarget: TABLE_TARGET,
      }),
    ).toEqual(COLUMN_TARGET)
  })

  it('falls back to focused target when no target is hovered', () => {
    expect(
      getActiveDiagramSelectionTarget({
        hoveredTarget: null,
        focusedTarget: TABLE_TARGET,
      }),
    ).toEqual(TABLE_TARGET)
  })

  it('derives active relation ids for a table target', () => {
    expect([...getActiveRelationIds(DIAGRAM, TABLE_TARGET)]).toEqual([
      'relation:1:0',
    ])
  })

  it('derives active relation ids for a column target', () => {
    expect([...getActiveRelationIds(DIAGRAM, COLUMN_TARGET)]).toEqual([
      'relation:1:0',
    ])
  })

  it('combines relation ids for hovered and focused targets', () => {
    expect([
      ...getRelationIdsForTargets(DIAGRAM, [
        TABLE_TARGET,
        TARGET_SIDE_COLUMN_TARGET,
      ]),
    ]).toEqual(['relation:1:0', 'relation:2:0'])
  })

  it('derives active table ids for a table target', () => {
    expect([...getActiveTableIds(DIAGRAM, TABLE_TARGET)]).toEqual([
      'table:public.users',
      'table:public.posts',
    ])
  })

  it('derives active table ids for a column target', () => {
    expect([...getActiveTableIds(DIAGRAM, COLUMN_TARGET)]).toEqual([
      'table:public.posts',
      'table:public.users',
    ])
  })

  it('derives endpoint column ids when the selected column is a relation source', () => {
    const endpointColumnIds = getActiveRelationEndpointColumnIds(
      DIAGRAM,
      COLUMN_TARGET,
    )

    expect([...endpointColumnIds.sourceColumnIds]).toEqual([
      'table:public.users.column:id',
    ])
    expect([...endpointColumnIds.referenceColumnIds]).toEqual([
      'table:public.posts.column:user_id',
    ])
  })

  it('derives endpoint column ids when the selected column is a relation target', () => {
    const endpointColumnIds = getActiveRelationEndpointColumnIds(
      DIAGRAM,
      TARGET_SIDE_COLUMN_TARGET,
    )

    expect([...endpointColumnIds.sourceColumnIds]).toEqual([
      'table:public.posts.column:id',
    ])
    expect([...endpointColumnIds.referenceColumnIds]).toEqual([
      'table:public.comments.column:post_id',
    ])
  })

  it('does not derive endpoint column ids for table targets', () => {
    const endpointColumnIds = getActiveRelationEndpointColumnIds(
      DIAGRAM,
      TABLE_TARGET,
    )

    expect([...endpointColumnIds.sourceColumnIds]).toEqual([])
    expect([...endpointColumnIds.referenceColumnIds]).toEqual([])
  })

  it('combines endpoint column ids for hovered and focused column targets', () => {
    const endpointColumnIds = getRelationEndpointColumnIdsForTargets(DIAGRAM, [
      COLUMN_TARGET,
      TARGET_SIDE_COLUMN_TARGET,
    ])

    expect([...endpointColumnIds.sourceColumnIds]).toEqual([
      'table:public.users.column:id',
      'table:public.posts.column:id',
    ])
    expect([...endpointColumnIds.referenceColumnIds]).toEqual([
      'table:public.posts.column:user_id',
      'table:public.comments.column:post_id',
    ])
  })

  it('compares table and column targets by semantic identity', () => {
    expect(
      isSameDiagramSelectionTarget(TABLE_TARGET, {
        type: 'table',
        tableId: TABLE_TARGET.tableId,
      }),
    ).toBe(true)
    expect(
      isSameDiagramSelectionTarget(COLUMN_TARGET, {
        type: 'column',
        tableId: COLUMN_TARGET.tableId,
        columnId: COLUMN_TARGET.columnId,
      }),
    ).toBe(true)
    expect(isSameDiagramSelectionTarget(TABLE_TARGET, COLUMN_TARGET)).toBe(
      false,
    )
    expect(isSameDiagramSelectionTarget(COLUMN_TARGET, null)).toBe(false)
  })
})
