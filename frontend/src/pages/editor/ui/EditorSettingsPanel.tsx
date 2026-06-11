import type {
  CodeEditorThemeMode,
  EditorThemeMode,
} from '../model/editor-theme'
import { EDITOR_WORKSPACE_THEME_MODES } from '../model/editor-theme'
import styles from './EditorPage.module.css'

type EditorSettingsPanelProps = {
  workspaceThemeMode: EditorThemeMode
  codeEditorOverrideThemeMode: EditorThemeMode
  isCodeEditorThemeOverrideEnabled: boolean
  onWorkspaceThemeModeChange: (mode: EditorThemeMode) => void
  onCodeEditorThemeOverrideEnabledChange: (isEnabled: boolean) => void
  onCodeEditorOverrideThemeModeChange: (mode: EditorThemeMode) => void
}

export function EditorSettingsPanel({
  workspaceThemeMode,
  codeEditorOverrideThemeMode,
  isCodeEditorThemeOverrideEnabled,
  onWorkspaceThemeModeChange,
  onCodeEditorThemeOverrideEnabledChange,
  onCodeEditorOverrideThemeModeChange,
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
    </div>
  )
}

function ThemeModeControl<TMode extends ThemeModeControlMode>({
  label,
  modes,
  value,
  onChange,
}: {
  label: string
  modes: readonly TMode[]
  value: TMode
  onChange: (mode: TMode) => void
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

type ThemeModeControlMode = EditorThemeMode | CodeEditorThemeMode

function getThemeModeLabel(mode: ThemeModeControlMode) {
  if (mode === 'workspace') {
    return 'Workspace'
  }

  if (mode === 'system') {
    return 'System'
  }

  if (mode === 'dark') {
    return 'Dark'
  }

  return mode === 'light-solarized' ? 'Solarized' : 'Light'
}
