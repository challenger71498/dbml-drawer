import { useEffect, useMemo, useReducer, useRef } from 'react'
import { useDebouncedValue } from '@/shared/lib/debounce'
import { validateDbml } from '../lib/validate-dbml'
import { useDbmlEditorStore } from './dbml-editor-store'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import {
  type DbmlLayoutAlgorithmId,
  type DbmlLayoutOptionValueMap,
} from './dbml-layout-settings'
import {
  useSelectedDbmlLayoutAlgorithmId,
  useSelectedDbmlLayoutOptionValues,
  useSelectDbmlLayoutAlgorithm,
  useSetSelectedDbmlLayoutOptionValue,
} from './editor-settings-store'

const VALIDATION_DELAY_MS = 300

type DbmlDocumentLayoutState = {
  layoutedDiagram: LayoutedDbmlDiagram | null
  isDiagramPending: boolean
}

type DbmlDocumentLayoutAction =
  | { type: 'start' }
  | { type: 'complete'; diagram: LayoutedDbmlDiagram }
  | { type: 'pause' }
  | { type: 'fail' }

export function useDbmlDocument() {
  const documentText = useDbmlEditorStore((state) => state.documentText)
  const setDocumentText = useDbmlEditorStore((state) => state.setDocumentText)
  const selectedLayoutAlgorithmId = useSelectedDbmlLayoutAlgorithmId()
  const selectedLayoutOptionValues = useSelectedDbmlLayoutOptionValues()
  const selectLayoutAlgorithm = useSelectDbmlLayoutAlgorithm()
  const setSelectedLayoutOptionValue = useSetSelectedDbmlLayoutOptionValue()
  const [{ layoutedDiagram, isDiagramPending }, dispatchLayout] = useReducer(
    reduceDbmlDocumentLayoutState,
    {
      layoutedDiagram: null,
      isDiagramPending: false,
    },
  )
  const activeLayoutRequestIdRef = useRef(0)
  const lastLayoutedCacheKeyRef = useRef<string | null>(null)
  const pendingLayoutCacheKeyRef = useRef<string | null>(null)
  const debouncedDocumentText = useDebouncedValue(
    documentText,
    VALIDATION_DELAY_MS,
  )
  const validationResult = useMemo(
    () => validateDbml(debouncedDocumentText),
    [debouncedDocumentText],
  )
  const diagnostics = validationResult.diagnostics
  const isDiagramPaused = diagnostics.length > 0

  useEffect(() => {
    if (!validationResult.valid) {
      activeLayoutRequestIdRef.current += 1
      pendingLayoutCacheKeyRef.current = null
      dispatchLayout({ type: 'pause' })
    }
  }, [validationResult])

  useEffect(() => {
    if (!validationResult.valid) {
      return
    }

    const layoutCacheKey = createDbmlLayoutCacheKey({
      documentText: debouncedDocumentText,
      algorithmId: selectedLayoutAlgorithmId,
      optionValues: selectedLayoutOptionValues,
    })
    if (
      lastLayoutedCacheKeyRef.current === layoutCacheKey ||
      pendingLayoutCacheKeyRef.current === layoutCacheKey
    ) {
      return
    }

    const requestId = activeLayoutRequestIdRef.current + 1
    let isStale = false

    activeLayoutRequestIdRef.current = requestId
    pendingLayoutCacheKeyRef.current = layoutCacheKey
    dispatchLayout({ type: 'start' })

    void buildAndLayoutDiagram({
      documentText: debouncedDocumentText,
      algorithmId: selectedLayoutAlgorithmId,
      optionValues: selectedLayoutOptionValues,
    })
      .then((nextLayoutedDiagram) => {
        if (isStale || activeLayoutRequestIdRef.current !== requestId) {
          return
        }

        lastLayoutedCacheKeyRef.current = layoutCacheKey
        pendingLayoutCacheKeyRef.current = null
        dispatchLayout({ type: 'complete', diagram: nextLayoutedDiagram })
      })
      .catch(() => {
        if (isStale || activeLayoutRequestIdRef.current !== requestId) {
          return
        }

        pendingLayoutCacheKeyRef.current = null
        dispatchLayout({ type: 'fail' })
      })

    return () => {
      isStale = true
      if (
        activeLayoutRequestIdRef.current === requestId &&
        pendingLayoutCacheKeyRef.current === layoutCacheKey
      ) {
        pendingLayoutCacheKeyRef.current = null
      }
    }
  }, [
    debouncedDocumentText,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    validationResult,
  ])

  return {
    documentText,
    setDocumentText,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    selectLayoutAlgorithm,
    setSelectedLayoutOptionValue,
    diagnostics,
    layoutedDiagram,
    isDiagramPending,
    isDiagramPaused,
  }
}

function reduceDbmlDocumentLayoutState(
  state: DbmlDocumentLayoutState,
  action: DbmlDocumentLayoutAction,
): DbmlDocumentLayoutState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        isDiagramPending: true,
      }
    case 'complete':
      return {
        layoutedDiagram: action.diagram,
        isDiagramPending: false,
      }
    case 'pause':
    case 'fail':
      return {
        ...state,
        isDiagramPending: false,
      }
  }
}

export function createDbmlLayoutCacheKey({
  documentText,
  algorithmId,
  optionValues = {},
}: {
  documentText: string
  algorithmId: DbmlLayoutAlgorithmId
  optionValues?: DbmlLayoutOptionValueMap
}) {
  const serializedOptionValues = [...Object.entries(optionValues)]
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  return `${algorithmId}\n${serializedOptionValues}\n${documentText}`
}

async function buildAndLayoutDiagram({
  documentText,
  algorithmId,
  optionValues,
}: {
  documentText: string
  algorithmId: DbmlLayoutAlgorithmId
  optionValues: DbmlLayoutOptionValueMap
}): Promise<LayoutedDbmlDiagram> {
  const [{ createDbmlDiagram }, { layoutDbmlDiagram }, { parseDbmlDocument }] =
    await Promise.all([
      import('../lib/create-dbml-diagram'),
      import('../lib/layout-dbml-diagram'),
      import('../lib/parse-dbml-document'),
    ])
  const parsedDatabase = parseDbmlDocument(documentText)
  const diagram = createDbmlDiagram(parsedDatabase)

  return layoutDbmlDiagram(diagram, {
    algorithmId,
    optionValues,
  })
}
