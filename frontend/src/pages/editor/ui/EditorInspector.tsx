import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import type {
  EditorInspectorActivity,
  EditorInspectorActivityId,
} from '../model/editor-inspector'
import { EditorSidebarShell } from './EditorSidebarShell'

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
  const resizeRef = useRef<{
    startX: number
    startWidth: number
  } | null>(null)
  const [activeActivityId, setActiveActivityId] =
    useState<EditorInspectorActivityId | null>(null)
  const [isExpanded, setExpanded] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(
    INSPECTOR_SIDEBAR_DEFAULT_WIDTH,
  )

  const allActivities = [...activities, ...bottomActivities]

  if (allActivities.length === 0) {
    return null
  }

  const activeActivity = allActivities.find(
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

  const handleResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    resizeRef.current = {
      startX: event.clientX,
      startWidth: sidebarWidth,
    }
  }

  const handleResizePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const resizeState = resizeRef.current

    if (!resizeState) {
      return
    }

    setSidebarWidth(
      clampInspectorSidebarWidth(
        resizeState.startWidth + resizeState.startX - event.clientX,
      ),
    )
  }

  const handleResizePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    resizeRef.current = null
  }

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setSidebarWidth((currentWidth) =>
        clampInspectorSidebarWidth(
          currentWidth + INSPECTOR_SIDEBAR_KEYBOARD_STEP,
        ),
      )
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setSidebarWidth((currentWidth) =>
        clampInspectorSidebarWidth(
          currentWidth - INSPECTOR_SIDEBAR_KEYBOARD_STEP,
        ),
      )
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setSidebarWidth(INSPECTOR_SIDEBAR_MIN_WIDTH)
    }
  }

  return (
    <EditorSidebarShell
      side="right"
      panelPlacement="before-activity-bar"
      label="Editor inspector"
      activityBarLabel="Editor activities"
      activityGroups={{
        top: activities.map((activity) => {
          const isActive = activity.id === activeActivityId

          return {
            id: activity.id,
            label: activity.label,
            icon: activity.icon,
            panelId: getActivityPanelId(activity.id),
            isActive,
            isExpanded: isActive && isExpanded,
            onSelect: (event: MouseEvent<HTMLButtonElement>) =>
              handleActivitySelect(activity.id, event),
          }
        }),
        bottom: bottomActivities.map((activity) => {
          const isActive = activity.id === activeActivityId

          return {
            id: activity.id,
            label: activity.label,
            icon: activity.icon,
            panelId: getActivityPanelId(activity.id),
            isActive,
            isExpanded: isActive && isExpanded,
            onSelect: (event: MouseEvent<HTMLButtonElement>) =>
              handleActivitySelect(activity.id, event),
          }
        }),
      }}
      isExpanded={Boolean(isSidebarVisible)}
      panelWidth={sidebarWidth}
      panelId={
        activeActivity ? getActivityPanelId(activeActivity.id) : undefined
      }
      panelLabel={activeActivity?.panelLabel}
      closeLabel="Close inspector"
      onClose={closeSidebar}
      resizeHandle={{
        label: 'Resize inspector',
        min: INSPECTOR_SIDEBAR_MIN_WIDTH,
        max: INSPECTOR_SIDEBAR_MAX_WIDTH,
        value: sidebarWidth,
        valueText: `${sidebarWidth}px`,
        onKeyDown: handleResizeKeyDown,
        onPointerCancel: handleResizePointerEnd,
        onPointerDown: handleResizePointerDown,
        onPointerMove: handleResizePointerMove,
        onPointerUp: handleResizePointerEnd,
      }}
    >
      {activeActivity?.renderPanel()}
    </EditorSidebarShell>
  )
}

function getActivityPanelId(activityId: EditorInspectorActivityId) {
  return `editor-inspector-panel-${activityId}`
}

function clampInspectorSidebarWidth(width: number) {
  return Math.min(
    INSPECTOR_SIDEBAR_MAX_WIDTH,
    Math.max(INSPECTOR_SIDEBAR_MIN_WIDTH, Math.round(width)),
  )
}
