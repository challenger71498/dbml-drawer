import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DbmlCodeEditor } from './DbmlCodeEditor'

const monacoApi = vi.hoisted(() => ({
  MarkerSeverity: {
    Error: 8,
    Warning: 4,
  },
  editor: {
    setModelMarkers: vi.fn(),
  },
  languages: {
    getLanguages: vi.fn(() => []),
    register: vi.fn(),
    setLanguageConfiguration: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
  },
}))

const editorInstance = vi.hoisted(() => ({
  getModel: vi.fn(() => ({ uri: 'workspace.dbml' })),
}))

vi.mock('@dbml/core', () => ({
  dbmlMonarchTokensProvider: {},
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({
    beforeMount,
    onMount,
    value,
    onChange,
  }: {
    beforeMount: (api: typeof monacoApi) => void
    onMount: (editor: typeof editorInstance, api: typeof monacoApi) => void
    value: string
    onChange: (value?: string) => void
  }) => {
    beforeMount(monacoApi)
    onMount(editorInstance, monacoApi)

    return (
      <textarea
        aria-label="DBML editor"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    )
  },
}))

describe('DbmlCodeEditor', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('publishes Monaco markers from diagnostics', () => {
    render(
      <DbmlCodeEditor
        value="Table users {"
        diagnostics={[
          {
            message: 'Expected closing brace.',
            severity: 'error',
            line: 1,
            column: 13,
          },
        ]}
        onChange={vi.fn()}
      />,
    )

    expect(monacoApi.editor.setModelMarkers).toHaveBeenCalledWith(
      { uri: 'workspace.dbml' },
      'dbml-diagnostics',
      [
        expect.objectContaining({
          message: 'Expected closing brace.',
          startLineNumber: 1,
          startColumn: 13,
        }),
      ],
    )
  })
})
