import { StrictMode, createElement, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  resetDbmlEditorStoreForTests,
  useDbmlEditorStore,
} from './dbml-editor-store'
import { useDbmlDocument, createDbmlLayoutCacheKey } from './dbml-document'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import {
  getEditorSettingsStateForTests,
  resetEditorSettingsStoreForTests,
} from './editor-settings-store'

const layoutedDiagram = {
  tables: [
    {
      id: 'table:users',
      name: 'users',
      columns: [],
      relations: [],
      size: { width: 200, height: 80 },
      source: null,
      position: { x: 0, y: 0 },
    },
  ],
  relations: [],
} as unknown as LayoutedDbmlDiagram

const layoutDbmlDiagram = vi.hoisted(() => vi.fn())

vi.mock('../lib/parse-dbml-document', () => ({
  parseDbmlDocument: vi.fn(() => ({ schemas: [] })),
}))

vi.mock('../lib/create-dbml-diagram', () => ({
  createDbmlDiagram: vi.fn(() => ({ tables: [], relations: [] })),
}))

vi.mock('../lib/layout-dbml-diagram', () => ({
  layoutDbmlDiagram,
}))

describe('dbml document model', () => {
  afterEach(() => {
    layoutDbmlDiagram.mockReset()
    resetDbmlEditorStoreForTests()
    resetEditorSettingsStoreForTests()
    vi.useRealTimers()
  })

  it('changes the layout cache key when the layout algorithm changes', () => {
    const documentText = `Table users {
  id integer [pk]
}
`

    expect(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        relationPortRoutingMode: 'fixed',
      }),
    ).not.toBe(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.force',
        relationPortRoutingMode: 'fixed',
      }),
    )
  })

  it('changes the layout cache key when a layout option changes', () => {
    const documentText = `Table users {
  id integer [pk]
}
`

    expect(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        relationPortRoutingMode: 'fixed',
        optionValues: {
          'elk.direction': 'RIGHT',
        },
      }),
    ).not.toBe(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        relationPortRoutingMode: 'fixed',
        optionValues: {
          'elk.direction': 'DOWN',
        },
      }),
    )
  })

  it('changes the layout cache key when relation port routing changes', () => {
    const documentText = `Table users {
  id integer [pk]
}
`

    expect(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        relationPortRoutingMode: 'fixed',
      }),
    ).not.toBe(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        relationPortRoutingMode: 'nearest',
      }),
    )
  })

  it('starts the initial diagram layout under React StrictMode', async () => {
    layoutDbmlDiagram.mockResolvedValue(layoutedDiagram)

    const { result } = renderHook(() => useDbmlDocument(), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(StrictMode, null, children),
    })

    await waitFor(() => {
      expect(result.current.layoutedDiagram).toBe(layoutedDiagram)
    })
    expect(layoutDbmlDiagram).toHaveBeenCalled()
    expect(layoutDbmlDiagram).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        relationPortRoutingMode: 'fixed',
      }),
    )
  })

  it('relayouts the current valid document when relation port routing changes', async () => {
    layoutDbmlDiagram.mockResolvedValue(layoutedDiagram)

    const { result } = renderHook(() => useDbmlDocument())

    await waitFor(() => {
      expect(result.current.layoutedDiagram).toBe(layoutedDiagram)
    })

    act(() => {
      getEditorSettingsStateForTests().setRelationPortRoutingMode('nearest')
    })

    await waitFor(() => {
      expect(layoutDbmlDiagram).toHaveBeenCalledTimes(2)
    })
    expect(layoutDbmlDiagram).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        relationPortRoutingMode: 'nearest',
      }),
    )
  })

  it('keeps the last valid document metadata when the document becomes invalid', () => {
    vi.useFakeTimers()
    layoutDbmlDiagram.mockResolvedValue(layoutedDiagram)
    useDbmlEditorStore.getState().setDocumentText(`Project crm {
  database_type: "PostgreSQL"
  Note: "Customer workspace"
}

Table users {
  id integer [pk]
}
`)

    const { result } = renderHook(() => useDbmlDocument())

    expect(result.current.documentMetadata).toEqual({
      projectName: 'crm',
      note: 'Customer workspace',
      databaseType: 'PostgreSQL',
    })

    act(() => {
      result.current.setDocumentText('Table users {')
    })
    act(() => {
      vi.advanceTimersByTime(350)
    })

    expect(result.current.diagnostics).not.toHaveLength(0)
    expect(result.current.documentMetadata).toEqual({
      projectName: 'crm',
      note: 'Customer workspace',
      databaseType: 'PostgreSQL',
    })
  })
})
