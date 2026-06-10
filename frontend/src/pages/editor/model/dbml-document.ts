import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@/shared/lib/debounce'
import { INITIAL_DBML_DOCUMENT } from '../lib/dbml-sample'
import { validateDbml } from '../lib/validate-dbml'

const VALIDATION_DELAY_MS = 300

export function useDbmlDocument() {
  const [documentText, setDocumentText] = useState(() => INITIAL_DBML_DOCUMENT)
  const debouncedDocumentText = useDebouncedValue(
    documentText,
    VALIDATION_DELAY_MS,
  )
  const diagnostics = useMemo(
    () => validateDbml(debouncedDocumentText).diagnostics,
    [debouncedDocumentText],
  )

  return {
    documentText,
    setDocumentText,
    diagnostics,
  }
}
