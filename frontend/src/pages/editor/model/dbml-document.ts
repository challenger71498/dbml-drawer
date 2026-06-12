import { useEffect, useMemo } from 'react'
import { useDebouncedValue } from '@/shared/lib/debounce'
import { validateDbml } from '../lib/validate-dbml'
import {
  useDbmlDocumentStore,
  type DbmlDocumentLayoutRequest,
} from './dbml-document-store'
import {
  type DbmlLayoutAlgorithmId,
  type DbmlLayoutOptionValueMap,
} from './dbml-layout-settings'

const VALIDATION_DELAY_MS = 300

export function useDbmlDocument() {
  const documentText = useDbmlDocumentStore((state) => state.documentText)
  const selectedLayoutAlgorithmId = useDbmlDocumentStore(
    (state) => state.selectedLayoutAlgorithmId,
  )
  const selectedLayoutOptionValues = useDbmlDocumentStore(
    (state) => state.selectedLayoutOptionValues,
  )
  const diagnostics = useDbmlDocumentStore((state) => state.diagnostics)
  const layoutedDiagram = useDbmlDocumentStore((state) => state.layoutedDiagram)
  const isDiagramPending = useDbmlDocumentStore(
    (state) => state.isDiagramPending,
  )
  const setDocumentText = useDbmlDocumentStore((state) => state.setDocumentText)
  const selectLayoutAlgorithm = useDbmlDocumentStore(
    (state) => state.selectLayoutAlgorithm,
  )
  const setSelectedLayoutOptionValue = useDbmlDocumentStore(
    (state) => state.setSelectedLayoutOptionValue,
  )
  const applyValidationResult = useDbmlDocumentStore(
    (state) => state.applyValidationResult,
  )
  const startLayout = useDbmlDocumentStore((state) => state.startLayout)
  const completeLayout = useDbmlDocumentStore((state) => state.completeLayout)
  const failLayout = useDbmlDocumentStore((state) => state.failLayout)
  const debouncedDocumentText = useDebouncedValue(
    documentText,
    VALIDATION_DELAY_MS,
  )
  const validationResult = useMemo(
    () => validateDbml(debouncedDocumentText),
    [debouncedDocumentText],
  )
  const isDiagramPaused = diagnostics.length > 0

  useEffect(() => {
    applyValidationResult(validationResult)
  }, [applyValidationResult, validationResult])

  useEffect(() => {
    if (!validationResult.valid) {
      return
    }

    const layoutCacheKey = createDbmlLayoutCacheKey({
      documentText: debouncedDocumentText,
      algorithmId: selectedLayoutAlgorithmId,
      optionValues: selectedLayoutOptionValues,
    })
    const request = startLayout(layoutCacheKey)

    if (!request) {
      return
    }

    let isStale = false

    void buildAndLayoutDiagram({
      documentText: debouncedDocumentText,
      algorithmId: selectedLayoutAlgorithmId,
      optionValues: selectedLayoutOptionValues,
      request,
      completeLayout,
      failLayout,
      isStale: () => isStale,
    })

    return () => {
      isStale = true
    }
  }, [
    completeLayout,
    debouncedDocumentText,
    failLayout,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    startLayout,
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
  request,
  completeLayout,
  failLayout,
  isStale,
}: {
  documentText: string
  algorithmId: DbmlLayoutAlgorithmId
  optionValues: DbmlLayoutOptionValueMap
  request: DbmlDocumentLayoutRequest
  completeLayout: ReturnType<
    typeof useDbmlDocumentStore.getState
  >['completeLayout']
  failLayout: ReturnType<typeof useDbmlDocumentStore.getState>['failLayout']
  isStale: () => boolean
}) {
  try {
    const [
      { createDbmlDiagram },
      { layoutDbmlDiagram },
      { parseDbmlDocument },
    ] = await Promise.all([
      import('../lib/create-dbml-diagram'),
      import('../lib/layout-dbml-diagram'),
      import('../lib/parse-dbml-document'),
    ])
    const parsedDatabase = parseDbmlDocument(documentText)
    const diagram = createDbmlDiagram(parsedDatabase)
    const nextLayoutedDiagram = await layoutDbmlDiagram(diagram, {
      algorithmId,
      optionValues,
    })

    if (!isStale()) {
      completeLayout(request, nextLayoutedDiagram)
    }
  } catch {
    if (!isStale()) {
      failLayout(request)
    }
  }
}
