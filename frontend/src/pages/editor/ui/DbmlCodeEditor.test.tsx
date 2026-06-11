import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
  VSCODE_LIGHT_2026_MONACO_THEME,
} from '../model/editor-theme'
import { DbmlCodeEditor } from './DbmlCodeEditor'

const monacoApi = vi.hoisted(() => ({
  MarkerSeverity: {
    Error: 8,
    Warning: 4,
  },
  editor: {
    defineTheme: vi.fn(),
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
  focus: vi.fn(),
  getModel: vi.fn(() => ({ uri: 'workspace.dbml' })),
  revealRangeInCenter: vi.fn(),
  revealPositionInCenter: vi.fn(),
  setPosition: vi.fn(),
  setSelection: vi.fn(),
}))

vi.mock('@dbml/core', () => ({
  dbmlMonarchTokensProvider: {},
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({
    beforeMount,
    onMount,
    theme,
    value,
    onChange,
  }: {
    beforeMount: (api: typeof monacoApi) => void
    onMount: (editor: typeof editorInstance, api: typeof monacoApi) => void
    theme: string
    value: string
    onChange: (value?: string) => void
  }) => {
    beforeMount(monacoApi)
    onMount(editorInstance, monacoApi)

    return (
      <textarea
        aria-label="DBML editor"
        data-monaco-theme={theme}
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
        theme="light"
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

  it('registers editor Monaco themes and uses the VS Code Light 2026 theme', () => {
    render(
      <DbmlCodeEditor
        value=""
        theme="light"
        diagnostics={[]}
        onChange={vi.fn()}
      />,
    )

    expect(monacoApi.editor.defineTheme).toHaveBeenCalledWith(
      VSCODE_LIGHT_2026_MONACO_THEME,
      expect.objectContaining({ base: 'vs' }),
    )
    expect(monacoApi.editor.defineTheme).toHaveBeenCalledWith(
      GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
      expect.objectContaining({ base: 'vs-dark' }),
    )
    expect(screen.getByLabelText('DBML editor')).toHaveAttribute(
      'data-monaco-theme',
      VSCODE_LIGHT_2026_MONACO_THEME,
    )
  })

  it('uses the dark Gruvbox Material medium Monaco theme', () => {
    render(
      <DbmlCodeEditor
        value=""
        theme="dark"
        diagnostics={[]}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('DBML editor')).toHaveAttribute(
      'data-monaco-theme',
      GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
    )
  })
})
