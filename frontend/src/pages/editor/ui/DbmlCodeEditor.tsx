import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import {
  DBML_LANGUAGE_ID,
  type MonacoApi,
  publishDbmlMarkers,
  registerDbmlLanguage,
} from '../lib/monaco-dbml-language'
import type { DbmlDiagnostic } from '../model/dbml-diagnostics'
import {
  defineEditorMonacoThemes,
  getMonacoTheme,
  type ResolvedEditorTheme,
} from '../model/editor-theme'

type DbmlCodeEditorProps = {
  value: string
  diagnostics: readonly DbmlDiagnostic[]
  theme: ResolvedEditorTheme
  onChange: (value: string) => void
}

type DbmlEditorSourcePosition = {
  lineNumber: number
  column: number
}

export type DbmlEditorSourceRange = DbmlEditorSourcePosition & {
  endLineNumber?: number
  endColumn?: number
}

export type DbmlCodeEditorHandle = {
  revealSourceRange: (range: DbmlEditorSourceRange) => void
}

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontFamily:
    '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
  fontSize: 14,
  lineHeight: 22,
  minimap: {
    enabled: false,
  },
  padding: {
    top: 16,
    bottom: 16,
  },
  scrollBeyondLastLine: false,
  tabSize: 2,
  wordWrap: 'on',
}

export const DbmlCodeEditor = forwardRef<
  DbmlCodeEditorHandle,
  DbmlCodeEditorProps
>(function DbmlCodeEditor({ value, diagnostics, theme, onChange }, ref) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<MonacoApi | null>(null)

  const handleBeforeMount = useCallback((monacoApi: MonacoApi) => {
    registerDbmlLanguage(monacoApi)
    defineEditorMonacoThemes(monacoApi)
  }, [])

  const handleMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor, monacoApi: MonacoApi) => {
      editorRef.current = editorInstance
      monacoRef.current = monacoApi
    },
    [],
  )

  const handleChange = useCallback(
    (nextValue?: string) => {
      onChange(nextValue ?? '')
    },
    [onChange],
  )

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return
    }

    publishDbmlMarkers(monacoRef.current, editorRef.current, diagnostics)
  }, [diagnostics])

  useImperativeHandle(
    ref,
    () => ({
      revealSourceRange(range) {
        const editorInstance = editorRef.current

        if (!editorInstance) {
          return
        }

        if (isCompleteSourceRange(range)) {
          const selection = {
            startLineNumber: range.lineNumber,
            startColumn: range.column,
            endLineNumber: range.endLineNumber,
            endColumn: range.endColumn,
          }

          editorInstance.setSelection(selection)
          editorInstance.revealRangeInCenter(selection)
        } else {
          editorInstance.setPosition(range)
          editorInstance.revealPositionInCenter(range)
        }

        editorInstance.focus()
      },
    }),
    [],
  )

  return (
    <Editor
      beforeMount={handleBeforeMount}
      defaultLanguage={DBML_LANGUAGE_ID}
      language={DBML_LANGUAGE_ID}
      onChange={handleChange}
      onMount={handleMount}
      options={EDITOR_OPTIONS}
      path="workspace.dbml"
      theme={getMonacoTheme(theme)}
      value={value}
    />
  )
})

function isCompleteSourceRange(
  range: DbmlEditorSourceRange,
): range is Required<DbmlEditorSourceRange> {
  return (
    typeof range.endLineNumber === 'number' &&
    typeof range.endColumn === 'number'
  )
}
