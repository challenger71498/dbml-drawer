import { useEffect, useMemo, useRef, useState } from 'react'
import { useDebouncedValue } from '@/shared/lib/debounce'
import { INITIAL_DBML_DOCUMENT } from '../lib/dbml-default-document'
import { validateDbml } from '../lib/validate-dbml'
import type { LayoutedDbmlDiagram } from './dbml-layout'

const VALIDATION_DELAY_MS = 300

export function useDbmlDocument() {
  const [documentText, setDocumentText] = useState(() => INITIAL_DBML_DOCUMENT)
  const [layoutedDiagram, setLayoutedDiagram] =
    useState<LayoutedDbmlDiagram | null>(null)
  const lastLayoutedSourceRef = useRef<string | null>(null)
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
      return
    }

    if (lastLayoutedSourceRef.current === debouncedDocumentText) {
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
      const nextLayoutedDiagram = await layoutDbmlDiagram(diagram)

      if (isStale) {
        return
      }

      lastLayoutedSourceRef.current = debouncedDocumentText
      setLayoutedDiagram(nextLayoutedDiagram)
    }

    void buildAndLayoutDiagram().catch(() => undefined)

    return () => {
      isStale = true
    }
  }, [debouncedDocumentText, validationResult])

  return {
    documentText,
    setDocumentText,
    diagnostics,
    layoutedDiagram,
    isDiagramPending: false,
    isDiagramPaused,
  }
}
