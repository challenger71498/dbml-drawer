import { create } from 'zustand'
import { INITIAL_DBML_DOCUMENT } from '../lib/dbml-default-document'

export type DbmlEditorState = {
  documentText: string
  setDocumentText: (documentText: string) => void
}

export const useDbmlEditorStore = create<DbmlEditorState>()((set) => ({
  documentText: INITIAL_DBML_DOCUMENT,
  setDocumentText: (documentText) => set({ documentText }),
}))

export function resetDbmlEditorStoreForTests() {
  useDbmlEditorStore.setState(
    {
      documentText: INITIAL_DBML_DOCUMENT,
      setDocumentText: useDbmlEditorStore.getState().setDocumentText,
    },
    false,
  )
}
