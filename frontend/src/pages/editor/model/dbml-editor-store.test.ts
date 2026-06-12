import { afterEach, describe, expect, it } from 'vitest'
import {
  DBML_EDITOR_STORAGE_KEY,
  resetDbmlEditorStoreForTests,
  useDbmlEditorStore,
} from './dbml-editor-store'
import { INITIAL_DBML_DOCUMENT } from '../lib/dbml-default-document'

describe('dbml editor store', () => {
  afterEach(() => {
    window.localStorage?.clear()
    resetDbmlEditorStoreForTests()
  })

  it('updates the DBML document text', () => {
    useDbmlEditorStore.getState().setDocumentText('Table users { id int }')

    expect(useDbmlEditorStore.getState().documentText).toBe(
      'Table users { id int }',
    )
  })

  it('persists the DBML document text', () => {
    installLocalStorageMock()
    resetDbmlEditorStoreForTests()

    useDbmlEditorStore.getState().setDocumentText('Table posts { id int }')

    expect(getStoredDbmlEditorState().documentText).toBe(
      'Table posts { id int }',
    )
  })

  it('restores persisted DBML document text', async () => {
    installLocalStorageMock()
    setStoredDbmlEditorState({
      documentText: 'Table accounts { id int }',
    })

    await useDbmlEditorStore.persist.rehydrate()

    expect(useDbmlEditorStore.getState().documentText).toBe(
      'Table accounts { id int }',
    )
  })

  it('falls back to the default DBML document for invalid persisted text', async () => {
    installLocalStorageMock()
    setStoredDbmlEditorState({
      documentText: 123,
    })

    await useDbmlEditorStore.persist.rehydrate()

    expect(useDbmlEditorStore.getState().documentText).toBe(
      INITIAL_DBML_DOCUMENT,
    )
  })
})

function getStoredDbmlEditorState() {
  const storedValue = window.localStorage.getItem(DBML_EDITOR_STORAGE_KEY)

  if (!storedValue) {
    throw new Error('Expected DBML editor state to be persisted.')
  }

  const parsedValue = JSON.parse(storedValue) as {
    state?: Record<string, unknown>
  }

  return parsedValue.state ?? {}
}

function setStoredDbmlEditorState(state: Record<string, unknown>) {
  window.localStorage.setItem(
    DBML_EDITOR_STORAGE_KEY,
    JSON.stringify({ state, version: 0 }),
  )
}

function installLocalStorageMock() {
  const values = new Map<string, string>()

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value)
      },
      removeItem: (key: string) => {
        values.delete(key)
      },
      clear: () => {
        values.clear()
      },
    },
  })
}
