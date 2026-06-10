import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import {
  DEFAULT_DBML_LAYOUT_ALGORITHM_OPTION,
  getDbmlLayoutOptionControls,
  loadDbmlLayoutAlgorithmOptions,
  type DbmlLayoutAlgorithmId,
  type DbmlLayoutAlgorithmOption,
  type DbmlLayoutOptionControl,
  type DbmlLayoutOptionValueMap,
} from '../model/dbml-layout-settings'
import styles from './EditorPage.module.css'

type DiagramSettingsActivityPanelProps = {
  selectedLayoutAlgorithmId: DbmlLayoutAlgorithmId
  selectedLayoutOptionValues: DbmlLayoutOptionValueMap
  onLayoutAlgorithmSelect: (algorithmId: DbmlLayoutAlgorithmId) => void
  onLayoutOptionChange: (optionId: string, value: string) => void
}

export function DiagramSettingsActivityPanel({
  selectedLayoutAlgorithmId,
  selectedLayoutOptionValues,
  onLayoutAlgorithmSelect,
  onLayoutOptionChange,
}: DiagramSettingsActivityPanelProps) {
  const [layoutAlgorithmOptions, setLayoutAlgorithmOptions] = useState<
    DbmlLayoutAlgorithmOption[]
  >(() => [DEFAULT_DBML_LAYOUT_ALGORITHM_OPTION])
  const selectedLayoutAlgorithm = useMemo(
    () =>
      layoutAlgorithmOptions.find(
        (option) => option.id === selectedLayoutAlgorithmId,
      ),
    [layoutAlgorithmOptions, selectedLayoutAlgorithmId],
  )
  const layoutOptionControls = useMemo(
    () => getDbmlLayoutOptionControls(selectedLayoutAlgorithmId),
    [selectedLayoutAlgorithmId],
  )

  useEffect(() => {
    let isStale = false

    async function loadOptions() {
      const options = await loadDbmlLayoutAlgorithmOptions()

      if (!isStale) {
        setLayoutAlgorithmOptions(options)
      }
    }

    void loadOptions()

    return () => {
      isStale = true
    }
  }, [])

  const handleAlgorithmChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onLayoutAlgorithmSelect(event.currentTarget.value)
  }

  return (
    <section className={styles.diagramSettingsPanel}>
      <label className={styles.presetField}>
        <span>Layout algorithm</span>
        <select
          aria-label="Diagram layout algorithm"
          value={selectedLayoutAlgorithmId}
          onChange={handleAlgorithmChange}
        >
          {layoutAlgorithmOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {selectedLayoutAlgorithm?.description ? (
        <p className={styles.presetDescription}>
          {selectedLayoutAlgorithm.description}
        </p>
      ) : null}

      {layoutOptionControls.length > 0 ? (
        <div
          className={styles.diagramSettingsControls}
          aria-label="Curated layout options"
        >
          {layoutOptionControls.map((control) => (
            <LayoutOptionControl
              control={control}
              key={control.id}
              value={
                selectedLayoutOptionValues[control.id] ??
                control.defaultValue ??
                ''
              }
              onChange={onLayoutOptionChange}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

type LayoutOptionControlProps = {
  control: DbmlLayoutOptionControl
  value: string
  onChange: (optionId: string, value: string) => void
}

function LayoutOptionControl({
  control,
  value,
  onChange,
}: LayoutOptionControlProps) {
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const nextValue =
      control.kind === 'boolean'
        ? String((event.currentTarget as HTMLInputElement).checked)
        : event.currentTarget.value

    onChange(control.id, nextValue)
  }

  if (control.kind === 'boolean') {
    return (
      <label className={styles.diagramSettingsToggleField}>
        <input
          aria-label={control.label}
          checked={value === 'true'}
          type="checkbox"
          onChange={handleInputChange}
        />
        <span>{control.label}</span>
      </label>
    )
  }

  return (
    <label className={styles.presetField}>
      <span>{control.label}</span>
      {control.kind === 'select' ? (
        <select
          aria-label={control.label}
          value={value}
          onChange={handleInputChange}
        >
          {control.choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          aria-label={control.label}
          min={control.min}
          step={control.step}
          type="number"
          value={value}
          onChange={handleInputChange}
        />
      )}
    </label>
  )
}
