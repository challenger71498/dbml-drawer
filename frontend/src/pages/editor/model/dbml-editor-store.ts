import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { INITIAL_DBML_DOCUMENT } from '../lib/dbml-default-document'

export const DBML_EDITOR_STORAGE_KEY = 'dbml-drawer:editor-document'

export type DbmlEditorState = {
  documentText: string
  setDocumentText: (documentText: string) => void
}

type PersistedDbmlEditorState = Pick<DbmlEditorState, 'documentText'>

export const useDbmlEditorStore = create<DbmlEditorState>()(
  persist(
    (set) => ({
      documentText: INITIAL_DBML_DOCUMENT,
      setDocumentText: (documentText) => set({ documentText }),
    }),
    {
      name: DBML_EDITOR_STORAGE_KEY,
      storage: createJSONStorage(createDbmlEditorStorage),
      partialize: (state): PersistedDbmlEditorState => ({
        documentText: state.documentText,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedDbmlEditorState(persistedState),
      }),
    },
  ),
)

export function resetDbmlEditorStoreForTests() {
  useDbmlEditorStore.setState(
    {
      documentText: INITIAL_DBML_DOCUMENT,
      setDocumentText: useDbmlEditorStore.getState().setDocumentText,
    },
    false,
  )
}

function normalizePersistedDbmlEditorState(
  persistedState: unknown,
): PersistedDbmlEditorState {
  if (!isRecord(persistedState)) {
    return {
      documentText: INITIAL_DBML_DOCUMENT,
    }
  }

  return {
    documentText:
      typeof persistedState.documentText === 'string'
        ? persistedState.documentText
        : INITIAL_DBML_DOCUMENT,
  }
}

function createDbmlEditorStorage() {
  return {
    getItem(name: string) {
      return getStorage()?.getItem(name) ?? null
    },
    setItem(name: string, value: string) {
      getStorage()?.setItem(name, value)
    },
    removeItem(name: string) {
      getStorage()?.removeItem(name)
    },
  }
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
