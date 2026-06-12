import { afterEach, describe, expect, it } from 'vitest'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import {
  resetDbmlDocumentStoreForTests,
  useDbmlDocumentStore,
} from './dbml-document-store'

const EMPTY_LAYOUTED_DIAGRAM: LayoutedDbmlDiagram = {
  tables: [],
  relations: [],
}

describe('dbml document store', () => {
  afterEach(() => {
    resetDbmlDocumentStoreForTests()
  })

  it('updates the document text', () => {
    useDbmlDocumentStore.getState().setDocumentText('Table users { id int }')

    expect(useDbmlDocumentStore.getState().documentText).toBe(
      'Table users { id int }',
    )
  })

  it('selects a layout algorithm and resets option values', () => {
    useDbmlDocumentStore
      .getState()
      .setSelectedLayoutOptionValue('elk.direction', 'DOWN')

    useDbmlDocumentStore.getState().selectLayoutAlgorithm('org.eclipse.elk.box')

    expect(useDbmlDocumentStore.getState().selectedLayoutAlgorithmId).toBe(
      'org.eclipse.elk.box',
    )
    expect(useDbmlDocumentStore.getState().selectedLayoutOptionValues).toEqual({
      'elk.box.packingMode': 'SIMPLE',
    })
  })

  it('normalizes layout option updates', () => {
    useDbmlDocumentStore
      .getState()
      .setSelectedLayoutOptionValue('elk.direction', '')

    expect(
      useDbmlDocumentStore.getState().selectedLayoutOptionValues,
    ).not.toHaveProperty('elk.direction')
  })

  it('applies validation diagnostics and pauses pending layout on invalid DBML', () => {
    const request = useDbmlDocumentStore.getState().startLayout('cache-key')

    expect(request).not.toBeNull()
    expect(useDbmlDocumentStore.getState().isDiagramPending).toBe(true)

    useDbmlDocumentStore.getState().applyValidationResult({
      valid: false,
      diagnostics: [
        {
          message: 'Expected table end',
          severity: 'error',
        },
      ],
    })

    expect(useDbmlDocumentStore.getState().diagnostics).toHaveLength(1)
    expect(useDbmlDocumentStore.getState().isDiagramPending).toBe(false)
  })

  it('ignores stale layout completions', () => {
    const firstRequest = useDbmlDocumentStore.getState().startLayout('first')
    const secondRequest = useDbmlDocumentStore.getState().startLayout('second')

    if (!firstRequest || !secondRequest) {
      throw new Error('Expected layout requests to start.')
    }

    useDbmlDocumentStore
      .getState()
      .completeLayout(firstRequest, EMPTY_LAYOUTED_DIAGRAM)

    expect(useDbmlDocumentStore.getState().layoutedDiagram).toBeNull()
    expect(useDbmlDocumentStore.getState().isDiagramPending).toBe(true)

    useDbmlDocumentStore
      .getState()
      .completeLayout(secondRequest, EMPTY_LAYOUTED_DIAGRAM)

    expect(useDbmlDocumentStore.getState().layoutedDiagram).toBe(
      EMPTY_LAYOUTED_DIAGRAM,
    )
    expect(useDbmlDocumentStore.getState().lastLayoutedCacheKey).toBe('second')
    expect(useDbmlDocumentStore.getState().isDiagramPending).toBe(false)
  })
})
