import { create } from 'zustand'
import {
  isSameDiagramSelectionTarget,
  type DbmlDiagramSelectionTarget,
} from './dbml-diagram-selection'

export type EditorDiagramInteractionState = {
  focusedTarget: DbmlDiagramSelectionTarget | null
  focusTarget: (target: DbmlDiagramSelectionTarget) => void
  clearFocus: () => void
}

export const useEditorDiagramInteractionStore =
  create<EditorDiagramInteractionState>()((set) => ({
    focusedTarget: null,
    focusTarget: (target) =>
      set((state) =>
        isSameDiagramSelectionTarget(state.focusedTarget, target)
          ? state
          : { focusedTarget: target },
      ),
    clearFocus: () =>
      set((state) =>
        state.focusedTarget === null ? state : { focusedTarget: null },
      ),
  }))

export function resetEditorDiagramInteractionStoreForTests() {
  useEditorDiagramInteractionStore.setState({ focusedTarget: null }, false)
}
