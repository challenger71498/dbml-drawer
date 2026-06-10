import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebouncedValue } from '@/shared/lib/debounce'
import { INITIAL_DBML_DOCUMENT } from '../lib/dbml-default-document'
import { validateDbml } from '../lib/validate-dbml'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import {
  DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
  getDefaultDbmlLayoutOptionValues,
  normalizeDbmlLayoutOptionValues,
  type DbmlLayoutAlgorithmId,
  type DbmlLayoutOptionValueMap,
} from './dbml-layout-settings'

const VALIDATION_DELAY_MS = 300

export function useDbmlDocument() {
  const [documentText, setDocumentText] = useState(() => INITIAL_DBML_DOCUMENT)
  const [selectedLayoutAlgorithmId, setSelectedLayoutAlgorithmId] =
    useState<DbmlLayoutAlgorithmId>(() => DEFAULT_DBML_LAYOUT_ALGORITHM_ID)
  const [selectedLayoutOptionValues, setSelectedLayoutOptionValues] =
    useState<DbmlLayoutOptionValueMap>(() =>
      getDefaultDbmlLayoutOptionValues(DEFAULT_DBML_LAYOUT_ALGORITHM_ID),
    )
  const [layoutedDiagram, setLayoutedDiagram] =
    useState<LayoutedDbmlDiagram | null>(null)
  const lastLayoutedCacheKeyRef = useRef<string | null>(null)
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
  const selectLayoutAlgorithm = useCallback(
    (algorithmId: DbmlLayoutAlgorithmId) => {
      setSelectedLayoutAlgorithmId(algorithmId)
      setSelectedLayoutOptionValues(
        getDefaultDbmlLayoutOptionValues(algorithmId),
      )
    },
    [],
  )
  const setSelectedLayoutOptionValue = useCallback(
    (optionId: string, value: string) => {
      setSelectedLayoutOptionValues((currentValues) =>
        normalizeDbmlLayoutOptionValues({
          ...currentValues,
          [optionId]: value,
        }),
      )
    },
    [],
  )

  useEffect(() => {
    if (!validationResult.valid) {
      return
    }

    const layoutCacheKey = createDbmlLayoutCacheKey({
      documentText: debouncedDocumentText,
      algorithmId: selectedLayoutAlgorithmId,
      optionValues: selectedLayoutOptionValues,
    })

    if (lastLayoutedCacheKeyRef.current === layoutCacheKey) {
      return
    }

    let isStale = false

    async function buildAndLayoutDiagram() {
      const [
        { createDbmlDiagram },
        { layoutDbmlDiagram },
        { parseDbmlDocument },
      ] = await Promise.all([
        import('../lib/create-dbml-diagram'),
        import('../lib/layout-dbml-diagram'),
        import('../lib/parse-dbml-document'),
      ])
      const parsedDatabase = parseDbmlDocument(debouncedDocumentText)
      const diagram = createDbmlDiagram(parsedDatabase)
      const nextLayoutedDiagram = await layoutDbmlDiagram(diagram, {
        algorithmId: selectedLayoutAlgorithmId,
        optionValues: selectedLayoutOptionValues,
      })

      if (isStale) {
        return
      }

      lastLayoutedCacheKeyRef.current = layoutCacheKey
      setLayoutedDiagram(nextLayoutedDiagram)
    }

    void buildAndLayoutDiagram().catch(() => undefined)

    return () => {
      isStale = true
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
    isDiagramPending: false,
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
