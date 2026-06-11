import { useEffect, useState } from 'react'
import { EDITOR_MONACO_THEME_DEFINITIONS } from '../../../shared/design-tokens/generated/monaco-themes'
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
  monacoApi.editor.defineTheme(
    VSCODE_LIGHT_2026_MONACO_THEME,
    EDITOR_MONACO_THEME_DEFINITIONS.light,
  )
  monacoApi.editor.defineTheme(
    GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
    EDITOR_MONACO_THEME_DEFINITIONS.dark,
  )
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
