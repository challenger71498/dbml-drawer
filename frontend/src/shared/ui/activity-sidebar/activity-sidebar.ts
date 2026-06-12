import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react'

export type ActivitySidebarSide = 'left' | 'right'

export type ActivitySidebarPanelPlacement =
  | 'before-activity-bar'
  | 'after-activity-bar'

export type ActivitySidebarActivity<TActivityId extends string = string> = {
  id: TActivityId
  label: string
  icon: ReactNode
  panelId: string
  isActive: boolean
  isExpanded: boolean
  onSelect: (event: MouseEvent<HTMLButtonElement>) => void
}

export type ActivitySidebarActivityGroups<TActivityId extends string = string> =
  {
    top?: readonly ActivitySidebarActivity<TActivityId>[]
    bottom?: readonly ActivitySidebarActivity<TActivityId>[]
  }

export type ActivitySidebarResizeHandle = {
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
