import { describe, expect, it } from 'vitest'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  getActiveTableIds,
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
})
