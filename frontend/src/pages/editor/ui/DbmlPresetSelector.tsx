import type { DbmlPreset, DbmlPresetId } from '../lib/dbml-presets'
import styles from './EditorPage.module.css'

type DbmlPresetSelectorProps = {
  presets: readonly DbmlPreset[]
  selectedPresetId: DbmlPresetId
  onSelect: (preset: DbmlPreset) => void
}

export function DbmlPresetSelector({
  presets,
  selectedPresetId,
  onSelect,
}: DbmlPresetSelectorProps) {
  const selectedPreset = presets.find(
    (preset) => preset.id === selectedPresetId,
  )

  return (
    <section className={styles.presetPanel}>
      <div className={styles.presetList} role="group" aria-label="DBML presets">
        {presets.map((preset) => (
          <button
            className={styles.presetListButton}
            key={preset.id}
            onClick={() => onSelect(preset)}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {selectedPreset ? (
        <p className={styles.presetDescription}>{selectedPreset.description}</p>
      ) : null}
    </section>
  )
}
