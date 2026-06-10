import { useState } from 'react'
import { DbmlPresetSelector } from './DbmlPresetSelector'
import { DiagnosticsPanel } from './DiagnosticsPanel'
import {
  DBML_PRESETS,
  DEFAULT_DBML_PRESET,
  type DbmlPreset,
  type DbmlPresetId,
} from '../lib/dbml-presets'
import type { DbmlDiagnostic } from '../model/dbml-diagnostics'
import styles from './EditorPage.module.css'

type EditorDevToolsProps = {
  diagnostics: readonly DbmlDiagnostic[]
  isDiagnosticsCollapsed: boolean
  onToggleDiagnostics: () => void
  onPresetSelect: (document: string) => void
}

export function EditorDevTools({
  diagnostics,
  isDiagnosticsCollapsed,
  onToggleDiagnostics,
  onPresetSelect,
}: EditorDevToolsProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<DbmlPresetId>(
    DEFAULT_DBML_PRESET.id,
  )

  const handlePresetSelect = (preset: DbmlPreset) => {
    setSelectedPresetId(preset.id)
    onPresetSelect(preset.document)
  }

  return (
    <aside
      className={`${styles.inspectorSidebar} ${
        isDiagnosticsCollapsed ? styles.inspectorSidebarCollapsed : ''
      }`}
      aria-label="Editor development tools"
    >
      <button
        className={styles.inspectorToggle}
        type="button"
        aria-controls="editor-dev-tools-panel"
        aria-expanded={!isDiagnosticsCollapsed}
        onClick={onToggleDiagnostics}
      >
        {isDiagnosticsCollapsed ? 'Show' : 'Hide'}
      </button>

      {isDiagnosticsCollapsed ? null : (
        <div id="editor-dev-tools-panel" className={styles.inspectorContent}>
          <DbmlPresetSelector
            presets={DBML_PRESETS}
            selectedPresetId={selectedPresetId}
            onSelect={handlePresetSelect}
          />
          <DiagnosticsPanel diagnostics={diagnostics} />
        </div>
      )}
    </aside>
  )
}
