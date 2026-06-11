import type {
  CodeEditorThemeMode,
  EditorThemeMode,
  OffscreenRelationProxyPlacementMode,
} from '../model/editor-theme'
import {
  EDITOR_WORKSPACE_THEME_MODES,
  OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES,
} from '../model/editor-theme'
import styles from './EditorPage.module.css'

type EditorSettingsPanelProps = {
  workspaceThemeMode: EditorThemeMode
  codeEditorOverrideThemeMode: EditorThemeMode
  isCodeEditorThemeOverrideEnabled: boolean
  isOffscreenRelationProxiesEnabled: boolean
  shouldConnectOffscreenRelationProxyLines: boolean
  offscreenRelationProxyPlacementMode: OffscreenRelationProxyPlacementMode
  onWorkspaceThemeModeChange: (mode: EditorThemeMode) => void
  onCodeEditorThemeOverrideEnabledChange: (isEnabled: boolean) => void
  onCodeEditorOverrideThemeModeChange: (mode: EditorThemeMode) => void
  onOffscreenRelationProxiesEnabledChange: (isEnabled: boolean) => void
  onConnectOffscreenRelationProxyLinesChange: (shouldConnect: boolean) => void
  onOffscreenRelationProxyPlacementModeChange: (
    mode: OffscreenRelationProxyPlacementMode,
  ) => void
}

export function EditorSettingsPanel({
  workspaceThemeMode,
  codeEditorOverrideThemeMode,
  isCodeEditorThemeOverrideEnabled,
  isOffscreenRelationProxiesEnabled,
  shouldConnectOffscreenRelationProxyLines,
  offscreenRelationProxyPlacementMode,
  onWorkspaceThemeModeChange,
  onCodeEditorThemeOverrideEnabledChange,
  onCodeEditorOverrideThemeModeChange,
  onOffscreenRelationProxiesEnabledChange,
  onConnectOffscreenRelationProxyLinesChange,
  onOffscreenRelationProxyPlacementModeChange,
}: EditorSettingsPanelProps) {
  return (
    <div className={styles.editorSettingsPanel}>
      <section className={styles.editorSettingsSection}>
        <ThemeModeControl
          label="Workspace theme"
          modes={EDITOR_WORKSPACE_THEME_MODES}
          value={workspaceThemeMode}
          onChange={onWorkspaceThemeModeChange}
        />
      </section>

      <section className={styles.editorSettingsSection}>
        <label className={styles.editorSettingsToggleField}>
          <input
            checked={isCodeEditorThemeOverrideEnabled}
            type="checkbox"
            onChange={(event) =>
              onCodeEditorThemeOverrideEnabledChange(
                event.currentTarget.checked,
              )
            }
          />
          <span>Override workspace theme</span>
        </label>

        {isCodeEditorThemeOverrideEnabled ? (
          <ThemeModeControl
            label="Code editor theme"
            modes={EDITOR_WORKSPACE_THEME_MODES}
            value={codeEditorOverrideThemeMode}
            onChange={onCodeEditorOverrideThemeModeChange}
          />
        ) : null}
      </section>

      <section className={styles.editorSettingsSection}>
        <label className={styles.editorSettingsToggleField}>
          <input
            checked={isOffscreenRelationProxiesEnabled}
            type="checkbox"
            onChange={(event) =>
              onOffscreenRelationProxiesEnabledChange(
                event.currentTarget.checked,
              )
            }
          />
          <span>Show offscreen relation proxies</span>
        </label>
        <label className={styles.editorSettingsToggleField}>
          <input
            checked={shouldConnectOffscreenRelationProxyLines}
            disabled={!isOffscreenRelationProxiesEnabled}
            type="checkbox"
            onChange={(event) =>
              onConnectOffscreenRelationProxyLinesChange(
                event.currentTarget.checked,
              )
            }
          />
          <span>Connect relation lines to proxies</span>
        </label>
        <ThemeModeControl
          isDisabled={!isOffscreenRelationProxiesEnabled}
          label="Proxy placement"
          modes={OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES}
          value={offscreenRelationProxyPlacementMode}
          onChange={onOffscreenRelationProxyPlacementModeChange}
        />
      </section>
    </div>
  )
}

function ThemeModeControl<TMode extends ThemeModeControlMode>({
  label,
  modes,
  value,
  onChange,
  isDisabled = false,
}: {
  label: string
  modes: readonly TMode[]
  value: TMode
  onChange: (mode: TMode) => void
  isDisabled?: boolean
}) {
  return (
    <div className={styles.themeControl}>
      <span className={styles.themeControlLabel}>{label}</span>
      <div className={styles.themeModeGroup} role="group" aria-label={label}>
        {modes.map((mode) => (
          <button
            aria-pressed={value === mode}
            className={[
              styles.themeModeButton,
              value === mode ? styles.themeModeButtonActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={mode}
            disabled={isDisabled}
            onClick={() => onChange(mode)}
            type="button"
          >
            {getThemeModeLabel(mode)}
          </button>
        ))}
      </div>
    </div>
  )
}

type ThemeModeControlMode =
  | EditorThemeMode
  | CodeEditorThemeMode
  | OffscreenRelationProxyPlacementMode

function getThemeModeLabel(mode: ThemeModeControlMode) {
  if (mode === 'workspace') {
    return 'Workspace'
  }

  if (mode === 'line') {
    return 'Line'
  }

  if (mode === 'parallel') {
    return 'Parallel'
  }

  if (mode === 'system') {
    return 'System'
  }

  if (mode === 'dark') {
    return 'Dark'
  }

  return mode === 'light-solarized' ? 'Solarized' : 'Light'
}
