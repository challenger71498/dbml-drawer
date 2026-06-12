import type {
  DbmlRelationHighlightMode,
  DbmlRelationLineStyle,
} from '../model/dbml-diagram-rendering'
import type {
  CodeEditorThemeMode,
  EditorThemeMode,
  OffscreenRelationProxyPlacementMode,
  OffscreenRelationProxyTransitionMode,
  OffscreenRelationProxyVisibilityMode,
} from '../model/editor-theme'
import {
  EDITOR_RELATION_HIGHLIGHT_MODE_OPTIONS,
  EDITOR_RELATION_LINE_STYLE_OPTIONS,
  EDITOR_WORKSPACE_THEME_MODES,
  OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES,
  OFFSCREEN_RELATION_PROXY_TRANSITION_MODES,
  OFFSCREEN_RELATION_PROXY_VISIBILITY_MODES,
} from '../model/editor-theme'
import styles from './EditorPage.module.css'

type EditorSettingsPanelProps = {
  workspaceThemeMode: EditorThemeMode
  codeEditorOverrideThemeMode: EditorThemeMode
  isCodeEditorThemeOverrideEnabled: boolean
  isOffscreenRelationProxiesEnabled: boolean
  shouldConnectOffscreenRelationProxyLines: boolean
  shouldAvoidOffscreenRelationProxyActiveNodes: boolean
  offscreenRelationProxyPlacementMode: OffscreenRelationProxyPlacementMode
  offscreenRelationProxyVisibilityMode: OffscreenRelationProxyVisibilityMode
  offscreenRelationProxyTransitionMode: OffscreenRelationProxyTransitionMode
  relationLineStyle: DbmlRelationLineStyle
  relationHighlightMode: DbmlRelationHighlightMode
  onWorkspaceThemeModeChange: (mode: EditorThemeMode) => void
  onCodeEditorThemeOverrideEnabledChange: (isEnabled: boolean) => void
  onCodeEditorOverrideThemeModeChange: (mode: EditorThemeMode) => void
  onOffscreenRelationProxiesEnabledChange: (isEnabled: boolean) => void
  onConnectOffscreenRelationProxyLinesChange: (shouldConnect: boolean) => void
  onAvoidOffscreenRelationProxyActiveNodesChange: (shouldAvoid: boolean) => void
  onOffscreenRelationProxyPlacementModeChange: (
    mode: OffscreenRelationProxyPlacementMode,
  ) => void
  onOffscreenRelationProxyVisibilityModeChange: (
    mode: OffscreenRelationProxyVisibilityMode,
  ) => void
  onOffscreenRelationProxyTransitionModeChange: (
    mode: OffscreenRelationProxyTransitionMode,
  ) => void
  onRelationLineStyleChange: (style: DbmlRelationLineStyle) => void
  onRelationHighlightModeChange: (mode: DbmlRelationHighlightMode) => void
}

export function EditorSettingsPanel({
  workspaceThemeMode,
  codeEditorOverrideThemeMode,
  isCodeEditorThemeOverrideEnabled,
  isOffscreenRelationProxiesEnabled,
  shouldConnectOffscreenRelationProxyLines,
  shouldAvoidOffscreenRelationProxyActiveNodes,
  offscreenRelationProxyPlacementMode,
  offscreenRelationProxyVisibilityMode,
  offscreenRelationProxyTransitionMode,
  relationLineStyle,
  relationHighlightMode,
  onWorkspaceThemeModeChange,
  onCodeEditorThemeOverrideEnabledChange,
  onCodeEditorOverrideThemeModeChange,
  onOffscreenRelationProxiesEnabledChange,
  onConnectOffscreenRelationProxyLinesChange,
  onAvoidOffscreenRelationProxyActiveNodesChange,
  onOffscreenRelationProxyPlacementModeChange,
  onOffscreenRelationProxyVisibilityModeChange,
  onOffscreenRelationProxyTransitionModeChange,
  onRelationLineStyleChange,
  onRelationHighlightModeChange,
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
        <ThemeModeControl
          label="Edge routing"
          modes={EDITOR_RELATION_LINE_STYLE_OPTIONS}
          value={relationLineStyle}
          onChange={onRelationLineStyleChange}
        />
        <ThemeModeControl
          label="Relation style"
          modes={EDITOR_RELATION_HIGHLIGHT_MODE_OPTIONS}
          value={relationHighlightMode}
          onChange={onRelationHighlightModeChange}
        />
        {relationHighlightMode === 'dynamic' ? (
          <p className={styles.editorSettingsWarning}>
            This option may impact battery life.
          </p>
        ) : null}
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
        <label className={styles.editorSettingsToggleField}>
          <input
            checked={shouldAvoidOffscreenRelationProxyActiveNodes}
            disabled={!isOffscreenRelationProxiesEnabled}
            type="checkbox"
            onChange={(event) =>
              onAvoidOffscreenRelationProxyActiveNodesChange(
                event.currentTarget.checked,
              )
            }
          />
          <span>Avoid active nodes</span>
        </label>
        <ThemeModeControl
          isDisabled={!isOffscreenRelationProxiesEnabled}
          label="Proxy placement"
          modes={OFFSCREEN_RELATION_PROXY_PLACEMENT_MODES}
          value={offscreenRelationProxyPlacementMode}
          onChange={onOffscreenRelationProxyPlacementModeChange}
        />
        <ThemeModeControl
          isDisabled={!isOffscreenRelationProxiesEnabled}
          label="Proxy visibility"
          modes={OFFSCREEN_RELATION_PROXY_VISIBILITY_MODES}
          value={offscreenRelationProxyVisibilityMode}
          onChange={onOffscreenRelationProxyVisibilityModeChange}
        />
        <ThemeModeControl
          isDisabled={!isOffscreenRelationProxiesEnabled}
          label="Proxy transition"
          modes={OFFSCREEN_RELATION_PROXY_TRANSITION_MODES}
          value={offscreenRelationProxyTransitionMode}
          onChange={onOffscreenRelationProxyTransitionModeChange}
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
  modes: readonly TMode[] | readonly ThemeModeControlOption<TMode>[]
  value: TMode
  onChange: (mode: TMode) => void
  isDisabled?: boolean
}) {
  return (
    <div className={styles.themeControl}>
      <span className={styles.themeControlLabel}>{label}</span>
      <div className={styles.themeModeGroup} role="group" aria-label={label}>
        {modes.map((modeOrOption) => {
          const option = getThemeModeControlOption(modeOrOption)

          return (
            <button
              aria-pressed={value === option.value}
              className={[
                styles.themeModeButton,
                value === option.value ? styles.themeModeButtonActive : '',
                value === option.value && option.value === 'dynamic'
                  ? styles.themeModeButtonDynamicActive
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={option.value}
              disabled={isDisabled}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type ThemeModeControlMode =
  | EditorThemeMode
  | CodeEditorThemeMode
  | OffscreenRelationProxyPlacementMode
  | OffscreenRelationProxyVisibilityMode
  | OffscreenRelationProxyTransitionMode
  | DbmlRelationLineStyle
  | DbmlRelationHighlightMode

type ThemeModeControlOption<TMode extends ThemeModeControlMode> = {
  value: TMode
  label: string
}

function getThemeModeControlOption<TMode extends ThemeModeControlMode>(
  modeOrOption: TMode | ThemeModeControlOption<TMode>,
): ThemeModeControlOption<TMode> {
  return typeof modeOrOption === 'object'
    ? modeOrOption
    : {
        value: modeOrOption,
        label: getThemeModeLabel(modeOrOption),
      }
}

function getThemeModeLabel(mode: ThemeModeControlMode) {
  if (mode === 'bezier') {
    return 'Bezier'
  }

  if (mode === 'orthogonal') {
    return 'Step'
  }

  if (mode === 'rounded-orthogonal') {
    return 'Rounded'
  }

  if (mode === 'solid') {
    return 'Solid'
  }

  if (mode === 'gradient') {
    return 'Gradient'
  }

  if (mode === 'dynamic') {
    return 'Dynamic'
  }

  if (mode === 'workspace') {
    return 'Workspace'
  }

  if (mode === 'line') {
    return 'Line'
  }

  if (mode === 'parallel') {
    return 'Parallel'
  }

  if (mode === 'any-overlap') {
    return 'Any visible'
  }

  if (mode === 'center') {
    return 'Center visible'
  }

  if (mode === 'none') {
    return 'None'
  }

  if (mode === 'opacity') {
    return 'Opacity'
  }

  if (mode === 'morph') {
    return 'Morph'
  }

  if (mode === 'system') {
    return 'System'
  }

  if (mode === 'dark') {
    return 'Dark'
  }

  return mode === 'light-solarized' ? 'Solarized' : 'Light'
}
