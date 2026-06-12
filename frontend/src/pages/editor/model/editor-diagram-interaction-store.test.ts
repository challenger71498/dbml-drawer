import { afterEach, describe, expect, it } from 'vitest'
import {
  resetEditorDiagramInteractionStoreForTests,
  useEditorDiagramInteractionStore,
} from './editor-diagram-interaction-store'
import type { DbmlDiagramSelectionTarget } from './dbml-diagram-selection'

const TABLE_TARGET: DbmlDiagramSelectionTarget = {
  type: 'table',
  tableId: 'table:public.users',
}

const SAME_TABLE_TARGET: DbmlDiagramSelectionTarget = {
  type: 'table',
  tableId: 'table:public.users',
}

const COLUMN_TARGET: DbmlDiagramSelectionTarget = {
  type: 'column',
  tableId: 'table:public.posts',
  columnId: 'table:public.posts.column:user_id',
}

describe('editor diagram interaction store', () => {
  afterEach(() => {
    resetEditorDiagramInteractionStoreForTests()
  })

  it('focuses and clears a diagram target', () => {
    useEditorDiagramInteractionStore.getState().focusTarget(TABLE_TARGET)

    expect(useEditorDiagramInteractionStore.getState().focusedTarget).toEqual(
      TABLE_TARGET,
    )

    useEditorDiagramInteractionStore.getState().clearFocus()

    expect(useEditorDiagramInteractionStore.getState().focusedTarget).toBeNull()
  })

  it('keeps the focused target reference when the next target is equivalent', () => {
    useEditorDiagramInteractionStore.getState().focusTarget(TABLE_TARGET)
    useEditorDiagramInteractionStore.getState().focusTarget(SAME_TABLE_TARGET)

    expect(useEditorDiagramInteractionStore.getState().focusedTarget).toBe(
      TABLE_TARGET,
    )
  })

  it('replaces the focused target when the next target is different', () => {
    useEditorDiagramInteractionStore.getState().focusTarget(TABLE_TARGET)
    useEditorDiagramInteractionStore.getState().focusTarget(COLUMN_TARGET)

    expect(useEditorDiagramInteractionStore.getState().focusedTarget).toEqual(
      COLUMN_TARGET,
    )
  })
})
