import { useState, type MouseEvent } from 'react'
import type {
  EditorInspectorActivity,
  EditorInspectorActivityId,
} from '../model/editor-inspector'
import styles from './EditorPage.module.css'

type EditorInspectorProps = {
  activities: readonly EditorInspectorActivity[]
  onExpandedChange?: (isExpanded: boolean) => void
}

export function EditorInspector({
  activities,
  onExpandedChange,
}: EditorInspectorProps) {
  const [activeActivityId, setActiveActivityId] =
    useState<EditorInspectorActivityId | null>(null)
  const [isExpanded, setExpanded] = useState(false)

  if (activities.length === 0) {
    return null
  }

  const activeActivity = activities.find(
    (activity) => activity.id === activeActivityId,
  )
  const isSidebarVisible = isExpanded && activeActivity

  const setSidebarExpanded = (nextExpanded: boolean) => {
    setExpanded(nextExpanded)
    onExpandedChange?.(nextExpanded)
  }

  const handleActivitySelect = (
    activityId: EditorInspectorActivityId,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    if (activityId === activeActivityId) {
      const nextExpanded = !isExpanded

      setSidebarExpanded(nextExpanded)

      if (!nextExpanded) {
        setActiveActivityId(null)
        event.currentTarget.blur()
      }

      return
    }

    setActiveActivityId(activityId)
    setSidebarExpanded(true)
  }

  const closeSidebar = (event: MouseEvent<HTMLButtonElement>) => {
    setSidebarExpanded(false)
    setActiveActivityId(null)
    event.currentTarget.blur()
  }

  return (
    <aside
      aria-label="Editor inspector"
      className={`${styles.editorInspector} ${
        isSidebarVisible ? styles.editorInspectorExpanded : ''
      }`}
    >
      <div className={styles.editorActivityBar} aria-label="Editor activities">
        {activities.map((activity) => {
          const isActive = activity.id === activeActivityId
          const panelId = getActivityPanelId(activity.id)

          return (
            <button
              className={`${styles.editorActivityButton} ${
                isActive ? styles.editorActivityButtonActive : ''
              }`}
              type="button"
              aria-controls={panelId}
              aria-expanded={isActive && isExpanded}
              aria-label={activity.label}
              aria-pressed={isActive}
              key={activity.id}
              title={activity.label}
              onClick={(event) => handleActivitySelect(activity.id, event)}
            >
              {activity.icon}
            </button>
          )
        })}
      </div>

      {isSidebarVisible ? (
        <section
          className={styles.editorInspectorSidebar}
          id={getActivityPanelId(activeActivity.id)}
          aria-label={activeActivity.panelLabel}
        >
          <div className={styles.editorInspectorHeader}>
            <p>{activeActivity.panelLabel}</p>
            <button
              className={styles.editorInspectorClose}
              type="button"
              aria-label="Close inspector"
              onClick={closeSidebar}
            >
              x
            </button>
          </div>
          <div className={styles.editorInspectorPanel}>
            {activeActivity.renderPanel()}
          </div>
        </section>
      ) : null}
    </aside>
  )
}

function getActivityPanelId(activityId: EditorInspectorActivityId) {
  return `editor-inspector-panel-${activityId}`
}
