import type { MouseEvent } from 'react'
import {
  ActivitySidebar,
  useActivitySidebar,
} from '@/shared/ui/activity-sidebar'
import type {
  EditorInspectorActivity,
  EditorInspectorActivityId,
} from '../model/editor-inspector'

type EditorInspectorProps = {
  activities: readonly EditorInspectorActivity[]
  bottomActivities?: readonly EditorInspectorActivity[]
  onExpandedChange?: (isExpanded: boolean) => void
}

const INSPECTOR_SIDEBAR_DEFAULT_WIDTH = 384
const INSPECTOR_SIDEBAR_MIN_WIDTH = 320
const INSPECTOR_SIDEBAR_MAX_WIDTH = 720
const INSPECTOR_SIDEBAR_KEYBOARD_STEP = 24

export function EditorInspector({
  activities,
  bottomActivities = [],
  onExpandedChange,
}: EditorInspectorProps) {
  const sidebar = useActivitySidebar<EditorInspectorActivityId>({
    defaultWidth: INSPECTOR_SIDEBAR_DEFAULT_WIDTH,
    keyboardStep: INSPECTOR_SIDEBAR_KEYBOARD_STEP,
    maxWidth: INSPECTOR_SIDEBAR_MAX_WIDTH,
    minWidth: INSPECTOR_SIDEBAR_MIN_WIDTH,
    resizeHandleEdge: 'left',
    onExpandedChange,
  })

  const allActivities = [...activities, ...bottomActivities]

  if (allActivities.length === 0) {
    return null
  }

  const activeActivity = allActivities.find(
    (activity) => activity.id === sidebar.activeActivityId,
  )
  const isSidebarVisible = sidebar.isExpanded && activeActivity

  return (
    <ActivitySidebar
      side="right"
      panelPlacement="before-activity-bar"
      label="Editor inspector"
      activityBarLabel="Editor activities"
      activityGroups={{
        top: activities.map((activity) => {
          const activityState = sidebar.getActivityState(activity.id)

          return {
            id: activity.id,
            label: activity.label,
            icon: activity.icon,
            panelId: getActivityPanelId(activity.id),
            isActive: activityState.isActive,
            isExpanded: activityState.isExpanded,
            onSelect: (event: MouseEvent<HTMLButtonElement>) =>
              sidebar.selectActivity(activity.id, event),
          }
        }),
        bottom: bottomActivities.map((activity) => {
          const activityState = sidebar.getActivityState(activity.id)

          return {
            id: activity.id,
            label: activity.label,
            icon: activity.icon,
            panelId: getActivityPanelId(activity.id),
            isActive: activityState.isActive,
            isExpanded: activityState.isExpanded,
            onSelect: (event: MouseEvent<HTMLButtonElement>) =>
              sidebar.selectActivity(activity.id, event),
          }
        }),
      }}
      isExpanded={Boolean(isSidebarVisible)}
      panelWidth={sidebar.panelWidth}
      panelId={
        activeActivity ? getActivityPanelId(activeActivity.id) : undefined
      }
      panelLabel={activeActivity?.panelLabel}
      closeLabel="Close inspector"
      onClose={sidebar.close}
      resizeHandle={sidebar.getResizeHandle({ label: 'Resize inspector' })}
    >
      {activeActivity?.renderPanel()}
    </ActivitySidebar>
  )
}

function getActivityPanelId(activityId: EditorInspectorActivityId) {
  return `editor-inspector-panel-${activityId}`
}
