import { create } from 'zustand'
import { INITIAL_DBML_DOCUMENT } from '../lib/dbml-default-document'
import type { DbmlValidationResult } from '../lib/validate-dbml'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import {
  DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
  getDefaultDbmlLayoutOptionValues,
  normalizeDbmlLayoutOptionValues,
  type DbmlLayoutAlgorithmId,
  type DbmlLayoutOptionValueMap,
} from './dbml-layout-settings'
import type { DbmlDiagnostic } from './dbml-diagnostics'

export type DbmlDocumentLayoutRequest = {
  id: number
  cacheKey: string
}

export type DbmlDocumentState = {
  documentText: string
  selectedLayoutAlgorithmId: DbmlLayoutAlgorithmId
  selectedLayoutOptionValues: DbmlLayoutOptionValueMap
  diagnostics: readonly DbmlDiagnostic[]
  layoutedDiagram: LayoutedDbmlDiagram | null
  isDiagramPending: boolean
  lastLayoutedCacheKey: string | null
  pendingLayoutCacheKey: string | null
  activeLayoutRequestId: number
  setDocumentText: (documentText: string) => void
  selectLayoutAlgorithm: (algorithmId: DbmlLayoutAlgorithmId) => void
  setSelectedLayoutOptionValue: (optionId: string, value: string) => void
  applyValidationResult: (result: DbmlValidationResult) => void
  startLayout: (cacheKey: string) => DbmlDocumentLayoutRequest | null
  completeLayout: (
    request: DbmlDocumentLayoutRequest,
    diagram: LayoutedDbmlDiagram,
  ) => void
  failLayout: (request: DbmlDocumentLayoutRequest) => void
}

export const useDbmlDocumentStore = create<DbmlDocumentState>()((set, get) => ({
  ...getDefaultDbmlDocumentState(),
  setDocumentText: (documentText) => set({ documentText }),
  selectLayoutAlgorithm: (algorithmId) =>
    set({
      selectedLayoutAlgorithmId: algorithmId,
      selectedLayoutOptionValues: getDefaultDbmlLayoutOptionValues(algorithmId),
    }),
  setSelectedLayoutOptionValue: (optionId, value) =>
    set((state) => ({
      selectedLayoutOptionValues: normalizeDbmlLayoutOptionValues({
        ...state.selectedLayoutOptionValues,
        [optionId]: value,
      }),
    })),
  applyValidationResult: (result) =>
    set((state) => ({
      diagnostics: result.diagnostics,
      isDiagramPending: result.valid ? state.isDiagramPending : false,
      pendingLayoutCacheKey: result.valid ? state.pendingLayoutCacheKey : null,
      activeLayoutRequestId: result.valid
        ? state.activeLayoutRequestId
        : state.activeLayoutRequestId + 1,
    })),
  startLayout: (cacheKey) => {
    const state = get()

    if (
      state.lastLayoutedCacheKey === cacheKey ||
      state.pendingLayoutCacheKey === cacheKey
    ) {
      return null
    }

    const request = {
      id: state.activeLayoutRequestId + 1,
      cacheKey,
    }

    set({
      activeLayoutRequestId: request.id,
      isDiagramPending: true,
      pendingLayoutCacheKey: cacheKey,
    })

    return request
  },
  completeLayout: (request, diagram) =>
    set((state) =>
      state.activeLayoutRequestId === request.id
        ? {
            layoutedDiagram: diagram,
            lastLayoutedCacheKey: request.cacheKey,
            pendingLayoutCacheKey: null,
            isDiagramPending: false,
          }
        : state,
    ),
  failLayout: (request) =>
    set((state) =>
      state.activeLayoutRequestId === request.id
        ? { isDiagramPending: false, pendingLayoutCacheKey: null }
        : state,
    ),
}))

export function resetDbmlDocumentStoreForTests() {
  useDbmlDocumentStore.setState(getDefaultDbmlDocumentState(), false)
}

function getDefaultDbmlDocumentState(): Omit<
  DbmlDocumentState,
  | 'setDocumentText'
  | 'selectLayoutAlgorithm'
  | 'setSelectedLayoutOptionValue'
  | 'applyValidationResult'
  | 'startLayout'
  | 'completeLayout'
  | 'failLayout'
> {
  return {
    documentText: INITIAL_DBML_DOCUMENT,
    selectedLayoutAlgorithmId: DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
    selectedLayoutOptionValues: getDefaultDbmlLayoutOptionValues(
      DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
    ),
    diagnostics: [],
    layoutedDiagram: null,
    isDiagramPending: false,
    lastLayoutedCacheKey: null,
    pendingLayoutCacheKey: null,
    activeLayoutRequestId: 0,
  }
}
