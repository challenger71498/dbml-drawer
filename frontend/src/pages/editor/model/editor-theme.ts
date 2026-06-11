import { useEffect, useState } from 'react'
import type { MonacoApi } from '../lib/monaco-dbml-language'

export type EditorThemeMode = 'light' | 'dark' | 'system'
export type ResolvedEditorTheme = 'light' | 'dark'

export const EDITOR_THEME_MODES = ['light', 'dark', 'system'] as const
export const VSCODE_LIGHT_2026_MONACO_THEME = 'dbml-drawer-vscode-light-2026'
export const GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME =
  'dbml-drawer-gruvbox-material-dark-medium'

export const EDITOR_WORKSPACE_THEME_STORAGE_KEY =
  'dbml-drawer.editor.workspace-theme'
export const EDITOR_CODE_EDITOR_THEME_STORAGE_KEY =
  'dbml-drawer.editor.code-editor-theme'
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

export type EditorThemePreferences = {
  workspaceThemeMode: EditorThemeMode
  codeEditorThemeMode: EditorThemeMode
  resolvedWorkspaceTheme: ResolvedEditorTheme
  resolvedCodeEditorTheme: ResolvedEditorTheme
  setWorkspaceThemeMode: (mode: EditorThemeMode) => void
  setCodeEditorThemeMode: (mode: EditorThemeMode) => void
}

export function useEditorThemePreferences(): EditorThemePreferences {
  const [systemTheme, setSystemTheme] =
    useState<ResolvedEditorTheme>(getSystemTheme)
  const [workspaceThemeMode, setWorkspaceThemeModeState] =
    useState<EditorThemeMode>(() =>
      readStoredThemeMode(EDITOR_WORKSPACE_THEME_STORAGE_KEY),
    )
  const [codeEditorThemeMode, setCodeEditorThemeModeState] =
    useState<EditorThemeMode>(() =>
      readStoredThemeMode(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY),
    )

  useEffect(() => {
    const query = getSystemThemeQuery()

    if (!query) {
      return
    }

    const handleChange = () => {
      setSystemTheme(resolveSystemTheme(query.matches))
    }

    if (query.addEventListener) {
      query.addEventListener('change', handleChange)
    } else {
      query.addListener?.(handleChange)
    }

    return () => {
      if (query.removeEventListener) {
        query.removeEventListener('change', handleChange)
      } else {
        query.removeListener?.(handleChange)
      }
    }
  }, [])

  const setWorkspaceThemeMode = (mode: EditorThemeMode) => {
    setWorkspaceThemeModeState(mode)
    writeStoredThemeMode(EDITOR_WORKSPACE_THEME_STORAGE_KEY, mode)
  }

  const setCodeEditorThemeMode = (mode: EditorThemeMode) => {
    setCodeEditorThemeModeState(mode)
    writeStoredThemeMode(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY, mode)
  }

  return {
    workspaceThemeMode,
    codeEditorThemeMode,
    resolvedWorkspaceTheme: resolveThemeMode(workspaceThemeMode, systemTheme),
    resolvedCodeEditorTheme: resolveThemeMode(codeEditorThemeMode, systemTheme),
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
  }
}

export function getMonacoTheme(theme: ResolvedEditorTheme) {
  return theme === 'dark'
    ? GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME
    : VSCODE_LIGHT_2026_MONACO_THEME
}

export function defineEditorMonacoThemes(monacoApi: MonacoApi) {
  monacoApi.editor.defineTheme(VSCODE_LIGHT_2026_MONACO_THEME, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '202020', background: 'ffffff' },
      { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cf222e', fontStyle: 'bold' },
      { token: 'string', foreground: '0a7a3b' },
      { token: 'number', foreground: '953800' },
      { token: 'type', foreground: '0550ae' },
      { token: 'delimiter', foreground: '606060' },
      { token: 'operator', foreground: '8250df' },
      { token: 'identifier', foreground: '202020' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#202020',
      'editorLineNumber.foreground': '#606060',
      'editorLineNumber.activeForeground': '#202020',
      'editorCursor.foreground': '#202020',
      'editor.selectionBackground': '#0069cc40',
      'editor.inactiveSelectionBackground': '#0069cc1a',
      'editor.lineHighlightBackground': '#eaeaea40',
      'editorWhitespace.foreground': '#60606040',
      'editorIndentGuide.background1': '#f7f7f740',
      'editorIndentGuide.activeBackground1': '#eeeeee',
    },
  })

  monacoApi.editor.defineTheme(GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'd4be98', background: '282828' },
      { token: 'comment', foreground: '928374', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'd8a657', fontStyle: 'bold' },
      { token: 'string', foreground: 'a9b665' },
      { token: 'number', foreground: 'e78a4e' },
      { token: 'type', foreground: '7daea3' },
      { token: 'delimiter', foreground: 'a89984' },
      { token: 'operator', foreground: 'd3869b' },
      { token: 'identifier', foreground: 'ddc7a1' },
    ],
    colors: {
      'editor.background': '#282828',
      'editor.foreground': '#d4be98',
      'editorLineNumber.foreground': '#7c6f64',
      'editorLineNumber.activeForeground': '#ddc7a1',
      'editorCursor.foreground': '#e78a4e',
      'editor.selectionBackground': '#374141',
      'editor.inactiveSelectionBackground': '#3c3836',
      'editor.lineHighlightBackground': '#32302f',
      'editorWhitespace.foreground': '#5a524c',
      'editorIndentGuide.background1': '#45403d',
      'editorIndentGuide.activeBackground1': '#928374',
    },
  })
}

export function resolveThemeMode(
  mode: EditorThemeMode,
  systemTheme: ResolvedEditorTheme,
): ResolvedEditorTheme {
  return mode === 'system' ? systemTheme : mode
}

export function normalizeEditorThemeMode(
  value: string | null | undefined,
): EditorThemeMode {
  return EDITOR_THEME_MODES.includes(value as EditorThemeMode)
    ? (value as EditorThemeMode)
    : 'system'
}

export function readStoredThemeMode(storageKey: string): EditorThemeMode {
  try {
    return normalizeEditorThemeMode(window.localStorage.getItem(storageKey))
  } catch {
    return 'system'
  }
}

function writeStoredThemeMode(storageKey: string, mode: EditorThemeMode) {
  try {
    window.localStorage.setItem(storageKey, mode)
  } catch {
    // Ignore storage failures; the in-memory selection still applies.
  }
}

function getSystemTheme() {
  return resolveSystemTheme(getSystemThemeQuery()?.matches ?? false)
}

function getSystemThemeQuery() {
  if (typeof window.matchMedia !== 'function') {
    return null
  }

  return window.matchMedia(SYSTEM_THEME_QUERY)
}

function resolveSystemTheme(matchesDark: boolean): ResolvedEditorTheme {
  return matchesDark ? 'dark' : 'light'
}
