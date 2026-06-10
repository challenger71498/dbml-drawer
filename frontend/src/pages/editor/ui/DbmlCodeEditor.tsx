import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useCallback, useEffect, useRef } from 'react'
import {
  DBML_LANGUAGE_ID,
  type MonacoApi,
  publishDbmlMarkers,
  registerDbmlLanguage,
} from '../lib/monaco-dbml-language'
import type { DbmlDiagnostic } from '../model/dbml-diagnostics'

type DbmlCodeEditorProps = {
  value: string
  diagnostics: readonly DbmlDiagnostic[]
  onChange: (value: string) => void
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

export function DbmlCodeEditor({
  value,
  diagnostics,
  onChange,
}: DbmlCodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<MonacoApi | null>(null)

  const handleBeforeMount = useCallback((monacoApi: MonacoApi) => {
    registerDbmlLanguage(monacoApi)
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

  return (
    <Editor
      beforeMount={handleBeforeMount}
      defaultLanguage={DBML_LANGUAGE_ID}
      language={DBML_LANGUAGE_ID}
      onChange={handleChange}
      onMount={handleMount}
      options={EDITOR_OPTIONS}
      path="workspace.dbml"
      theme="vs-dark"
      value={value}
    />
  )
}
