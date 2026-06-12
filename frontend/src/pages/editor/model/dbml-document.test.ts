import { StrictMode, createElement, type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetDbmlEditorStoreForTests } from './dbml-editor-store'
import { useDbmlDocument, createDbmlLayoutCacheKey } from './dbml-document'
import type { LayoutedDbmlDiagram } from './dbml-layout'
import { resetEditorSettingsStoreForTests } from './editor-settings-store'

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
      }),
    ).not.toBe(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.force',
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
        optionValues: {
          'elk.direction': 'RIGHT',
        },
      }),
    ).not.toBe(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        optionValues: {
          'elk.direction': 'DOWN',
        },
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
  })
})
