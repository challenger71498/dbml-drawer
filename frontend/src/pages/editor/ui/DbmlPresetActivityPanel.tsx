import { useState } from 'react'
import { DbmlPresetSelector } from './DbmlPresetSelector'
import {
  DBML_PRESETS,
  DEFAULT_DBML_PRESET,
  type DbmlPreset,
  type DbmlPresetId,
} from '../lib/dbml-presets'

type DbmlPresetActivityPanelProps = {
  onPresetSelect: (document: string) => void
}

export function DbmlPresetActivityPanel({
  onPresetSelect,
}: DbmlPresetActivityPanelProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<DbmlPresetId>(
    DEFAULT_DBML_PRESET.id,
  )

  const handlePresetSelect = (preset: DbmlPreset) => {
    setSelectedPresetId(preset.id)
    onPresetSelect(preset.document)
  }

  return (
    <DbmlPresetSelector
      presets={DBML_PRESETS}
      selectedPresetId={selectedPresetId}
      onSelect={handlePresetSelect}
    />
  )
}
