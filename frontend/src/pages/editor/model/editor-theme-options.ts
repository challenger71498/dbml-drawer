import type {
  DbmlRelationHighlightMode,
  DbmlRelationLineStyle,
} from './dbml-diagram-rendering'

export type EditorThemeMode = 'light' | 'light-solarized' | 'dark' | 'system'
export type CodeEditorThemeMode = EditorThemeMode | 'workspace'
export type ResolvedEditorTheme = 'light' | 'light-solarized' | 'dark'
export type OffscreenRelationProxyPlacementMode = 'line' | 'parallel'
export type OffscreenRelationProxyVisibilityMode = 'any-overlap' | 'center'
export type OffscreenRelationProxyTransitionMode = 'none' | 'opacity' | 'morph'

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
export const OFFSCREEN_RELATION_PROXY_TRANSITION_MODES = [
  'none',
  'opacity',
  'morph',
] as const
export const EDITOR_RELATION_LINE_STYLE_MODES = [
  'bezier',
  'orthogonal',
  'rounded-orthogonal',
] as const satisfies readonly DbmlRelationLineStyle[]
export const EDITOR_RELATION_HIGHLIGHT_MODES = [
  'solid',
  'gradient',
  'dynamic',
] as const satisfies readonly DbmlRelationHighlightMode[]

export const PURE_WHITE_LIGHT_MONACO_THEME = 'dbml-drawer-light-pure-white'
export const LIGHT_SOLARIZED_MONACO_THEME = 'dbml-drawer-light-solarized'
export const GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME =
  'dbml-drawer-gruvbox-material-dark-medium'

export const EDITOR_SETTINGS_STORAGE_KEY = 'dbml-drawer.editor.settings'

export const EDITOR_SIDEBAR_DEFAULT_WIDTH = 480
export const EDITOR_SIDEBAR_MIN_WIDTH = 320
export const EDITOR_SIDEBAR_MAX_WIDTH = 720
export const EDITOR_SIDEBAR_KEYBOARD_STEP = 24
export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

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

export function normalizeEditorThemeMode(value: unknown): EditorThemeMode {
  return EDITOR_WORKSPACE_THEME_MODES.includes(value as EditorThemeMode)
    ? (value as EditorThemeMode)
    : 'system'
}

export function normalizeCodeEditorThemeMode(
  value: unknown,
): CodeEditorThemeMode {
  return EDITOR_CODE_EDITOR_THEME_MODES.includes(value as CodeEditorThemeMode)
    ? (value as CodeEditorThemeMode)
    : 'workspace'
}

export function normalizeOffscreenRelationProxyPlacementMode(
  value: unknown,
): OffscreenRelationProxyPlacementMode {
  return OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES.includes(
    value as OffscreenRelationProxyPlacementMode,
  )
    ? (value as OffscreenRelationProxyPlacementMode)
    : 'line'
}

export function normalizeOffscreenRelationProxyVisibilityMode(
  value: unknown,
): OffscreenRelationProxyVisibilityMode {
  return OFFSCREEN_RELATION_PROXY_VISIBILITY_MODES.includes(
    value as OffscreenRelationProxyVisibilityMode,
  )
    ? (value as OffscreenRelationProxyVisibilityMode)
    : 'any-overlap'
}

export function normalizeOffscreenRelationProxyTransitionMode(
  value: unknown,
): OffscreenRelationProxyTransitionMode {
  return OFFSCREEN_RELATION_PROXY_TRANSITION_MODES.includes(
    value as OffscreenRelationProxyTransitionMode,
  )
    ? (value as OffscreenRelationProxyTransitionMode)
    : 'none'
}

export function normalizeRelationLineStyle(
  value: unknown,
): DbmlRelationLineStyle {
  return EDITOR_RELATION_LINE_STYLE_MODES.includes(
    value as DbmlRelationLineStyle,
  )
    ? (value as DbmlRelationLineStyle)
    : 'bezier'
}

export function normalizeRelationHighlightMode(
  value: unknown,
): DbmlRelationHighlightMode {
  return EDITOR_RELATION_HIGHLIGHT_MODES.includes(
    value as DbmlRelationHighlightMode,
  )
    ? (value as DbmlRelationHighlightMode)
    : 'gradient'
}

export function normalizeEditorSidebarWidth(value: unknown) {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (!Number.isFinite(numericValue)) {
    return EDITOR_SIDEBAR_DEFAULT_WIDTH
  }

  return clampEditorSidebarWidth(numericValue)
}

export function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

export function clampEditorSidebarWidth(width: number) {
  return Math.min(
    EDITOR_SIDEBAR_MAX_WIDTH,
    Math.max(EDITOR_SIDEBAR_MIN_WIDTH, Math.round(width)),
  )
}

export function getSystemTheme() {
  return resolveSystemTheme(getSystemThemeQuery()?.matches ?? false)
}

export function getSystemThemeQuery() {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null
  }

  return window.matchMedia(SYSTEM_THEME_QUERY)
}

export function resolveSystemTheme(matchesDark: boolean): ResolvedEditorTheme {
  return matchesDark ? 'dark' : 'light'
}
