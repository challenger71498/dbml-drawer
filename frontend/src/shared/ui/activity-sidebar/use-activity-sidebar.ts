import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'

export type ActivitySidebarResizeHandleEdge = 'left' | 'right'

type UseActivitySidebarOptions<TActivityId extends string> = {
  defaultActiveActivityId?: TActivityId | null
  defaultExpanded?: boolean
  defaultWidth: number
  isExpanded?: boolean
  keyboardStep?: number
  maxWidth?: number
  minWidth: number
  resizeHandleEdge: ActivitySidebarResizeHandleEdge
  width?: number
  onExpandedChange?: (isExpanded: boolean) => void
  onWidthChange?: (width: number) => void
}

export type UseActivitySidebarResult<TActivityId extends string> = {
  activeActivityId: TActivityId | null
  isExpanded: boolean
  panelWidth: number
  close: (event?: MouseEvent<HTMLButtonElement>) => void
  getActivityState: (activityId: TActivityId) => {
    isActive: boolean
    isExpanded: boolean
  }
  getResizeHandle: (options: { label: string }) => {
    label: string
    min: number
    max?: number
    value: number
    valueText: string
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  }
  selectActivity: (
    activityId: TActivityId,
    event?: MouseEvent<HTMLButtonElement>,
  ) => void
}

export function useActivitySidebar<TActivityId extends string>({
  defaultActiveActivityId = null,
  defaultExpanded = false,
  defaultWidth,
  isExpanded: controlledExpanded,
  keyboardStep = 24,
  maxWidth,
  minWidth,
  resizeHandleEdge,
  width: controlledWidth,
  onExpandedChange,
  onWidthChange,
}: UseActivitySidebarOptions<TActivityId>): UseActivitySidebarResult<TActivityId> {
  const resizeRef = useRef<{
    startX: number
    startWidth: number
  } | null>(null)
  const [activeActivityId, setActiveActivityId] = useState<TActivityId | null>(
    defaultActiveActivityId,
  )
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState(defaultExpanded)
  const [uncontrolledWidth, setUncontrolledWidth] = useState(() =>
    clampActivitySidebarWidth(defaultWidth, minWidth, maxWidth),
  )

  const isExpanded = controlledExpanded ?? uncontrolledExpanded
  const panelWidth = controlledWidth ?? uncontrolledWidth

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (controlledExpanded === undefined) {
        setUncontrolledExpanded(nextExpanded)
      }

      onExpandedChange?.(nextExpanded)
    },
    [controlledExpanded, onExpandedChange],
  )

  const setPanelWidth = useCallback(
    (nextWidth: number) => {
      const clampedWidth = clampActivitySidebarWidth(
        nextWidth,
        minWidth,
        maxWidth,
      )

      if (controlledWidth === undefined) {
        setUncontrolledWidth(clampedWidth)
      }

      onWidthChange?.(clampedWidth)
    },
    [controlledWidth, maxWidth, minWidth, onWidthChange],
  )

  const selectActivity = useCallback(
    (activityId: TActivityId, event?: MouseEvent<HTMLButtonElement>) => {
      if (activityId === activeActivityId) {
        const nextExpanded = !isExpanded

        setExpanded(nextExpanded)

        if (!nextExpanded) {
          setActiveActivityId(null)
          event?.currentTarget.blur()
        }

        return
      }

      setActiveActivityId(activityId)
      setExpanded(true)
    },
    [activeActivityId, isExpanded, setExpanded],
  )

  const close = useCallback(
    (event?: MouseEvent<HTMLButtonElement>) => {
      setExpanded(false)
      setActiveActivityId(null)
      event?.currentTarget.blur()
    },
    [setExpanded],
  )

  const handleResizePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      resizeRef.current = {
        startX: event.clientX,
        startWidth: panelWidth,
      }
    },
    [panelWidth],
  )

  const handleResizePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const resizeState = resizeRef.current

      if (!resizeState) {
        return
      }

      const delta =
        resizeHandleEdge === 'right'
          ? event.clientX - resizeState.startX
          : resizeState.startX - event.clientX

      setPanelWidth(resizeState.startWidth + delta)
    },
    [resizeHandleEdge, setPanelWidth],
  )

  const handleResizePointerEnd = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
      resizeRef.current = null
    },
    [],
  )

  const handleResizeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const increaseKey =
        resizeHandleEdge === 'right' ? 'ArrowRight' : 'ArrowLeft'
      const decreaseKey =
        resizeHandleEdge === 'right' ? 'ArrowLeft' : 'ArrowRight'

      if (event.key === increaseKey) {
        event.preventDefault()
        setPanelWidth(panelWidth + keyboardStep)
        return
      }

      if (event.key === decreaseKey) {
        event.preventDefault()
        setPanelWidth(panelWidth - keyboardStep)
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        setPanelWidth(minWidth)
        return
      }

      if (event.key === 'End' && maxWidth !== undefined) {
        event.preventDefault()
        setPanelWidth(maxWidth)
      }
    },
    [
      keyboardStep,
      maxWidth,
      minWidth,
      panelWidth,
      resizeHandleEdge,
      setPanelWidth,
    ],
  )

  const getActivityState = useCallback(
    (activityId: TActivityId) => {
      const isActive = activityId === activeActivityId

      return {
        isActive,
        isExpanded: isActive && isExpanded,
      }
    },
    [activeActivityId, isExpanded],
  )

  const getResizeHandle = useCallback(
    ({ label }: { label: string }) => ({
      label,
      min: minWidth,
      max: maxWidth,
      value: panelWidth,
      valueText: `${panelWidth}px`,
      onKeyDown: handleResizeKeyDown,
      onPointerCancel: handleResizePointerEnd,
      onPointerDown: handleResizePointerDown,
      onPointerMove: handleResizePointerMove,
      onPointerUp: handleResizePointerEnd,
    }),
    [
      handleResizeKeyDown,
      handleResizePointerDown,
      handleResizePointerEnd,
      handleResizePointerMove,
      maxWidth,
      minWidth,
      panelWidth,
    ],
  )

  return {
    activeActivityId,
    isExpanded,
    panelWidth,
    close,
    getActivityState,
    getResizeHandle,
    selectActivity,
  }
}

export function clampActivitySidebarWidth(
  width: number,
  minWidth: number,
  maxWidth?: number,
) {
  const roundedWidth = Math.round(width)
  const boundedMaxWidth =
    maxWidth === undefined ? roundedWidth : Math.min(maxWidth, roundedWidth)

  return Math.max(minWidth, boundedMaxWidth)
}
