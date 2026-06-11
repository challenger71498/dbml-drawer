import { useEffect, useState } from 'react'
import { EDITOR_MONACO_THEME_DEFINITIONS } from '../../../shared/design-tokens/generated/monaco-themes'
import type { MonacoApi } from '../lib/monaco-dbml-language'

export type EditorThemeMode = 'light' | 'light-solarized' | 'dark' | 'system'
export type CodeEditorThemeMode = EditorThemeMode | 'workspace'
export type ResolvedEditorTheme = 'light' | 'light-solarized' | 'dark'
export type OffscreenRelationProxyPlacementMode = 'line' | 'parallel'
export type OffscreenRelationProxyVisibilityMode = 'any-overlap' | 'center'

export const EDITOR_WORKSPACE_THEME_MODES = [
  'light',
  'light-solarized',
  'dark',
  'system',
] as const
export const EDITOR_CODE_EDITOR_THEME_MODES = [
  'workspace',
  ...EDITOR_WORKSPACE_THEME_MODES,
] as const
export const OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES = [
  'line',
  'parallel',
] as const
export const OFFSCREEN_RELATION_PROXY_VISIBILITY_MODES = [
  'any-overlap',
  'center',
] as const
export const PURE_WHITE_LIGHT_MONACO_THEME = 'dbml-drawer-light-pure-white'
export const LIGHT_SOLARIZED_MONACO_THEME = 'dbml-drawer-light-solarized'
export const GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME =
  'dbml-drawer-gruvbox-material-dark-medium'

export const EDITOR_WORKSPACE_THEME_STORAGE_KEY =
  'dbml-drawer.editor.workspace-theme'
export const EDITOR_CODE_EDITOR_THEME_STORAGE_KEY =
  'dbml-drawer.editor.code-editor-theme'
export const EDITOR_OFFSCREEN_RELATION_PROXIES_STORAGE_KEY =
  'dbml-drawer.editor.offscreen-relation-proxies'
export const EDITOR_OFFSCREEN_RELATION_PROXY_LINES_STORAGE_KEY =
  'dbml-drawer.editor.offscreen-relation-proxy-lines'
export const EDITOR_OFFSCREEN_RELATION_PROXY_PLACEMENT_STORAGE_KEY =
  'dbml-drawer.editor.offscreen-relation-proxy-placement'
export const EDITOR_OFFSCREEN_RELATION_PROXY_VISIBILITY_STORAGE_KEY =
  'dbml-drawer.editor.offscreen-relation-proxy-visibility'
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

export type EditorThemePreferences = {
  workspaceThemeMode: EditorThemeMode
  codeEditorThemeMode: CodeEditorThemeMode
  resolvedWorkspaceTheme: ResolvedEditorTheme
  resolvedCodeEditorTheme: ResolvedEditorTheme
  isOffscreenRelationProxiesEnabled: boolean
  shouldConnectOffscreenRelationProxyLines: boolean
  offscreenRelationProxyPlacementMode: OffscreenRelationProxyPlacementMode
  offscreenRelationProxyVisibilityMode: OffscreenRelationProxyVisibilityMode
  setWorkspaceThemeMode: (mode: EditorThemeMode) => void
  setCodeEditorThemeMode: (mode: CodeEditorThemeMode) => void
  setOffscreenRelationProxiesEnabled: (isEnabled: boolean) => void
  setShouldConnectOffscreenRelationProxyLines: (shouldConnect: boolean) => void
  setOffscreenRelationProxyPlacementMode: (
    mode: OffscreenRelationProxyPlacementMode,
  ) => void
  setOffscreenRelationProxyVisibilityMode: (
    mode: OffscreenRelationProxyVisibilityMode,
  ) => void
}

export function useEditorThemePreferences(): EditorThemePreferences {
  const [systemTheme, setSystemTheme] =
    useState<ResolvedEditorTheme>(getSystemTheme)
  const [workspaceThemeMode, setWorkspaceThemeModeState] =
    useState<EditorThemeMode>(() =>
      readStoredThemeMode(EDITOR_WORKSPACE_THEME_STORAGE_KEY),
    )
  const [codeEditorThemeMode, setCodeEditorThemeModeState] =
    useState<CodeEditorThemeMode>(() =>
      readStoredCodeEditorThemeMode(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY),
    )
  const [
    isOffscreenRelationProxiesEnabled,
    setOffscreenRelationProxiesEnabledState,
  ] = useState(() =>
    readStoredBoolean(EDITOR_OFFSCREEN_RELATION_PROXIES_STORAGE_KEY, false),
  )
  const [
    shouldConnectOffscreenRelationProxyLines,
    setShouldConnectOffscreenRelationProxyLinesState,
  ] = useState(() =>
    readStoredBoolean(EDITOR_OFFSCREEN_RELATION_PROXY_LINES_STORAGE_KEY, false),
  )
  const [
    offscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyPlacementModeState,
  ] = useState(() =>
    readStoredOffscreenRelationProxyPlacementMode(
      EDITOR_OFFSCREEN_RELATION_PROXY_PLACEMENT_STORAGE_KEY,
    ),
  )
  const [
    offscreenRelationProxyVisibilityMode,
    setOffscreenRelationProxyVisibilityModeState,
  ] = useState(() =>
    readStoredOffscreenRelationProxyVisibilityMode(
      EDITOR_OFFSCREEN_RELATION_PROXY_VISIBILITY_STORAGE_KEY,
    ),
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

  const setCodeEditorThemeMode = (mode: CodeEditorThemeMode) => {
    setCodeEditorThemeModeState(mode)
    writeStoredThemeMode(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY, mode)
  }

  const setOffscreenRelationProxiesEnabled = (isEnabled: boolean) => {
    setOffscreenRelationProxiesEnabledState(isEnabled)
    writeStoredBoolean(EDITOR_OFFSCREEN_RELATION_PROXIES_STORAGE_KEY, isEnabled)
  }

  const setShouldConnectOffscreenRelationProxyLines = (
    shouldConnect: boolean,
  ) => {
    setShouldConnectOffscreenRelationProxyLinesState(shouldConnect)
    writeStoredBoolean(
      EDITOR_OFFSCREEN_RELATION_PROXY_LINES_STORAGE_KEY,
      shouldConnect,
    )
  }

  const setOffscreenRelationProxyPlacementMode = (
    mode: OffscreenRelationProxyPlacementMode,
  ) => {
    setOffscreenRelationProxyPlacementModeState(mode)
    writeStoredOffscreenRelationProxyPlacementMode(
      EDITOR_OFFSCREEN_RELATION_PROXY_PLACEMENT_STORAGE_KEY,
      mode,
    )
  }

  const setOffscreenRelationProxyVisibilityMode = (
    mode: OffscreenRelationProxyVisibilityMode,
  ) => {
    setOffscreenRelationProxyVisibilityModeState(mode)
    writeStoredOffscreenRelationProxyVisibilityMode(
      EDITOR_OFFSCREEN_RELATION_PROXY_VISIBILITY_STORAGE_KEY,
      mode,
    )
  }

  const resolvedWorkspaceTheme = resolveThemeMode(
    workspaceThemeMode,
    systemTheme,
  )

  return {
    workspaceThemeMode,
    codeEditorThemeMode,
    resolvedWorkspaceTheme,
    resolvedCodeEditorTheme: resolveCodeEditorThemeMode(
      codeEditorThemeMode,
      resolvedWorkspaceTheme,
      systemTheme,
    ),
    isOffscreenRelationProxiesEnabled,
    shouldConnectOffscreenRelationProxyLines,
    offscreenRelationProxyPlacementMode,
    offscreenRelationProxyVisibilityMode,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyVisibilityMode,
  }
}

export function getMonacoTheme(theme: ResolvedEditorTheme) {
  if (theme === 'dark') {
    return GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME
  }

  return theme === 'light-solarized'
    ? LIGHT_SOLARIZED_MONACO_THEME
    : PURE_WHITE_LIGHT_MONACO_THEME
}

export function defineEditorMonacoThemes(monacoApi: MonacoApi) {
  monacoApi.editor.defineTheme(
    PURE_WHITE_LIGHT_MONACO_THEME,
    EDITOR_MONACO_THEME_DEFINITIONS.light,
  )
  monacoApi.editor.defineTheme(
    LIGHT_SOLARIZED_MONACO_THEME,
    EDITOR_MONACO_THEME_DEFINITIONS['light-solarized'],
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

export function resolveCodeEditorThemeMode(
  mode: CodeEditorThemeMode,
  workspaceTheme: ResolvedEditorTheme,
  systemTheme: ResolvedEditorTheme,
): ResolvedEditorTheme {
  return mode === 'workspace'
    ? workspaceTheme
    : resolveThemeMode(mode, systemTheme)
}

export function normalizeEditorThemeMode(
  value: string | null | undefined,
): EditorThemeMode {
  return EDITOR_WORKSPACE_THEME_MODES.includes(value as EditorThemeMode)
    ? (value as EditorThemeMode)
    : 'system'
}

export function normalizeCodeEditorThemeMode(
  value: string | null | undefined,
): CodeEditorThemeMode {
  return EDITOR_CODE_EDITOR_THEME_MODES.includes(value as CodeEditorThemeMode)
    ? (value as CodeEditorThemeMode)
    : 'workspace'
}

export function normalizeOffscreenRelationProxyPlacementMode(
  value: string | null | undefined,
): OffscreenRelationProxyPlacementMode {
  return OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES.includes(
    value as OffscreenRelationProxyPlacementMode,
  )
    ? (value as OffscreenRelationProxyPlacementMode)
    : 'line'
}

export function normalizeOffscreenRelationProxyVisibilityMode(
  value: string | null | undefined,
): OffscreenRelationProxyVisibilityMode {
  return OFFSCREEN_RELATION_PROXY_VISIBILITY_MODES.includes(
    value as OffscreenRelationProxyVisibilityMode,
  )
    ? (value as OffscreenRelationProxyVisibilityMode)
    : 'any-overlap'
}

export function readStoredThemeMode(storageKey: string): EditorThemeMode {
  try {
    return normalizeEditorThemeMode(window.localStorage.getItem(storageKey))
  } catch {
    return 'system'
  }
}

export function readStoredCodeEditorThemeMode(
  storageKey: string,
): CodeEditorThemeMode {
  try {
    return normalizeCodeEditorThemeMode(window.localStorage.getItem(storageKey))
  } catch {
    return 'workspace'
  }
}

export function readStoredOffscreenRelationProxyPlacementMode(
  storageKey: string,
): OffscreenRelationProxyPlacementMode {
  try {
    return normalizeOffscreenRelationProxyPlacementMode(
      window.localStorage.getItem(storageKey),
    )
  } catch {
    return 'line'
  }
}

export function readStoredOffscreenRelationProxyVisibilityMode(
  storageKey: string,
): OffscreenRelationProxyVisibilityMode {
  try {
    return normalizeOffscreenRelationProxyVisibilityMode(
      window.localStorage.getItem(storageKey),
    )
  } catch {
    return 'any-overlap'
  }
}

function writeStoredThemeMode(
  storageKey: string,
  mode: EditorThemeMode | CodeEditorThemeMode,
) {
  try {
    window.localStorage.setItem(storageKey, mode)
  } catch {
    // Ignore storage failures; the in-memory selection still applies.
  }
}

function writeStoredOffscreenRelationProxyPlacementMode(
  storageKey: string,
  mode: OffscreenRelationProxyPlacementMode,
) {
  try {
    window.localStorage.setItem(storageKey, mode)
  } catch {
    // Ignore storage failures; the in-memory selection still applies.
  }
}

function writeStoredOffscreenRelationProxyVisibilityMode(
  storageKey: string,
  mode: OffscreenRelationProxyVisibilityMode,
) {
  try {
    window.localStorage.setItem(storageKey, mode)
  } catch {
    // Ignore storage failures; the in-memory selection still applies.
  }
}

export function readStoredBoolean(storageKey: string, fallback: boolean) {
  try {
    const storedValue = window.localStorage.getItem(storageKey)

    if (storedValue === 'true') {
      return true
    }

    if (storedValue === 'false') {
      return false
    }

    return fallback
  } catch {
    return fallback
  }
}

function writeStoredBoolean(storageKey: string, value: boolean) {
  try {
    window.localStorage.setItem(storageKey, String(value))
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
