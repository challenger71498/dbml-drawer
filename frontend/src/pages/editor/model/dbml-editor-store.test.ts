import { afterEach, describe, expect, it } from 'vitest'
import {
  resetDbmlEditorStoreForTests,
  useDbmlEditorStore,
} from './dbml-editor-store'

describe('dbml editor store', () => {
  afterEach(() => {
    resetDbmlEditorStoreForTests()
  })

  it('updates the DBML document text', () => {
    useDbmlEditorStore.getState().setDocumentText('Table users { id int }')

    expect(useDbmlEditorStore.getState().documentText).toBe(
      'Table users { id int }',
    )
  })
})
