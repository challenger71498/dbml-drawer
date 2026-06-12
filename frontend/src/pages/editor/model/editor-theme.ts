import { EDITOR_MONACO_THEME_DEFINITIONS } from '../../../shared/design-tokens/generated/monaco-themes'
import type { MonacoApi } from '../lib/monaco-dbml-language'
import {
  GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
  LIGHT_SOLARIZED_MONACO_THEME,
  PURE_WHITE_LIGHT_MONACO_THEME,
  type ResolvedEditorTheme,
} from './editor-theme-options'

export {
  EDITOR_CODE_EDITOR_THEME_MODES,
  EDITOR_SETTINGS_STORAGE_KEY,
  EDITOR_SIDEBAR_DEFAULT_WIDTH,
  EDITOR_SIDEBAR_KEYBOARD_STEP,
  EDITOR_SIDEBAR_MAX_WIDTH,
  EDITOR_SIDEBAR_MIN_WIDTH,
  EDITOR_WORKSPACE_THEME_MODES,
  GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
  LIGHT_SOLARIZED_MONACO_THEME,
  OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES,
  OFFSCREEN_RELATION_PROXY_VISIBILITY_MODES,
  PURE_WHITE_LIGHT_MONACO_THEME,
  clampEditorSidebarWidth,
  getSystemTheme,
  getSystemThemeQuery,
  normalizeBoolean,
  normalizeCodeEditorThemeMode,
  normalizeEditorSidebarWidth,
  normalizeEditorThemeMode,
  normalizeOffscreenRelationProxyPlacementMode,
  normalizeOffscreenRelationProxyVisibilityMode,
  normalizeRelationHighlightMode,
  normalizeRelationLineStyle,
  resolveCodeEditorThemeMode,
  resolveSystemTheme,
  resolveThemeMode,
  type CodeEditorThemeMode,
  type EditorThemeMode,
  type OffscreenRelationProxyPlacementMode,
  type OffscreenRelationProxyVisibilityMode,
  type ResolvedEditorTheme,
} from './editor-theme-options'
export {
  getEditorSettingsStateForTests,
  resetEditorSettingsStoreForTests,
  useEditorSettings,
  useRelationHighlightModeSetting,
  useRelationLineStyleSetting,
  useSelectedDbmlLayoutAlgorithmId,
  useSelectedDbmlLayoutOptionValues,
  useSelectDbmlLayoutAlgorithm,
  useSetRelationHighlightMode,
  useSetRelationLineStyle,
  useSetSelectedDbmlLayoutOptionValue,
  type EditorSettings,
  type EditorSettingsState,
} from './editor-settings-store'

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
