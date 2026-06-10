import { dbmlMonarchTokensProvider } from '@dbml/core'
import type * as monaco from 'monaco-editor'
import type { editor } from 'monaco-editor'
import type { DbmlDiagnostic } from '../model/dbml-diagnostics'

export const DBML_LANGUAGE_ID = 'dbml'

const MARKER_OWNER = 'dbml-diagnostics'

export type MonacoApi = typeof monaco

const dbmlLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '`', close: '`' },
  ],
}

export function registerDbmlLanguage(monacoApi: MonacoApi) {
  const isRegistered = monacoApi.languages
    .getLanguages()
    .some((language: { id: string }) => language.id === DBML_LANGUAGE_ID)

  if (!isRegistered) {
    monacoApi.languages.register({ id: DBML_LANGUAGE_ID })
  }

  monacoApi.languages.setMonarchTokensProvider(
    DBML_LANGUAGE_ID,
    dbmlMonarchTokensProvider,
  )
  monacoApi.languages.setLanguageConfiguration(
    DBML_LANGUAGE_ID,
    dbmlLanguageConfiguration,
  )
}

export function publishDbmlMarkers(
  monacoApi: MonacoApi,
  editorInstance: editor.IStandaloneCodeEditor,
  diagnostics: readonly DbmlDiagnostic[],
) {
  const model = editorInstance.getModel()

  if (!model) {
    return
  }

  monacoApi.editor.setModelMarkers(
    model,
    MARKER_OWNER,
    diagnostics.map((diagnostic) => toMarker(monacoApi, diagnostic)),
  )
}

function toMarker(
  monacoApi: MonacoApi,
  diagnostic: DbmlDiagnostic,
): editor.IMarkerData {
  const startLineNumber = diagnostic.line ?? 1
  const startColumn = diagnostic.column ?? 1

  return {
    message: diagnostic.message,
    severity:
      diagnostic.severity === 'warning'
        ? monacoApi.MarkerSeverity.Warning
        : monacoApi.MarkerSeverity.Error,
    startLineNumber,
    startColumn,
    endLineNumber: diagnostic.endLine ?? startLineNumber,
    endColumn: diagnostic.endColumn ?? startColumn + 1,
  }
}
