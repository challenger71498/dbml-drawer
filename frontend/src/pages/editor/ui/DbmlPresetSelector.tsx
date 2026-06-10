import type { ChangeEvent } from 'react'
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

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPreset = presets.find(
      (preset) => preset.id === event.currentTarget.value,
    )

    if (nextPreset) {
      onSelect(nextPreset)
    }
  }

  return (
    <section className={styles.presetPanel} aria-labelledby="preset-heading">
      <div>
        <p className={styles.eyebrow}>Development</p>
        <h2 id="preset-heading">DBML presets</h2>
      </div>

      <label className={styles.presetField}>
        <span>Preset</span>
        <select
          aria-label="DBML preset"
          value={selectedPresetId}
          onChange={handleChange}
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      {selectedPreset ? (
        <p className={styles.presetDescription}>{selectedPreset.description}</p>
      ) : null}
    </section>
  )
}
