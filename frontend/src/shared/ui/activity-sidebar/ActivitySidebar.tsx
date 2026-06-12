import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type {
  ActivitySidebarActivity,
  ActivitySidebarActivityGroups,
  ActivitySidebarPanelPlacement,
  ActivitySidebarResizeHandle,
  ActivitySidebarSide,
} from './activity-sidebar'
import styles from './ActivitySidebar.module.css'

type ActivitySidebarProps<TActivityId extends string = string> = {
  side: ActivitySidebarSide
  panelPlacement: ActivitySidebarPanelPlacement
  label: string
  activityBarLabel: string
  activityGroups: ActivitySidebarActivityGroups<TActivityId>
  isExpanded: boolean
  panelWidth?: number
  panelId?: string
  panelLabel?: string
  children?: ReactNode
  closeLabel?: string
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void
  resizeHandle?: ActivitySidebarResizeHandle
}

const activityBarSideClassNames = {
  left: styles.activityBarLeft,
  right: styles.activityBarRight,
} satisfies Record<ActivitySidebarSide, string>

const panelSideClassNames = {
  left: styles.panelLeft,
  right: styles.panelRight,
} satisfies Record<ActivitySidebarSide, string>

export function ActivitySidebar<TActivityId extends string = string>({
  side,
  panelPlacement,
  label,
  activityBarLabel,
  activityGroups,
  isExpanded,
  panelWidth,
  panelId,
  panelLabel,
  children,
  closeLabel,
  onClose,
  resizeHandle,
}: ActivitySidebarProps<TActivityId>) {
  const style = panelWidth
    ? ({
        '--activity-sidebar-panel-width': `${panelWidth}px`,
      } as CSSProperties)
    : undefined
  const panel =
    isExpanded && panelId && panelLabel ? (
      <ActivitySidebarPanel
        closeLabel={closeLabel}
        onClose={onClose}
        panelId={panelId}
        panelLabel={panelLabel}
        resizeHandle={resizeHandle}
        side={side}
      >
        {children}
      </ActivitySidebarPanel>
    ) : null
  const activityBar = (
    <div
      className={`${styles.activityBar} ${activityBarSideClassNames[side]}`}
      aria-label={activityBarLabel}
    >
      <ActivitySidebarActivityGroup activities={activityGroups.top ?? []} />
      <ActivitySidebarActivityGroup
        activities={activityGroups.bottom ?? []}
        placement="bottom"
      />
    </div>
  )

  return (
    <aside
      aria-label={label}
      className={`${styles.dock} ${isExpanded ? styles.dockExpanded : ''} ${
        panelPlacement === 'before-activity-bar'
          ? styles.dockPanelBefore
          : styles.dockPanelAfter
      }`}
      style={style}
    >
      {panelPlacement === 'before-activity-bar' ? panel : null}
      {activityBar}
      {panelPlacement === 'after-activity-bar' ? panel : null}
    </aside>
  )
}

function ActivitySidebarActivityGroup<TActivityId extends string = string>({
  activities,
  placement = 'top',
}: {
  activities: readonly ActivitySidebarActivity<TActivityId>[]
  placement?: 'top' | 'bottom'
}) {
  if (activities.length === 0) {
    return null
  }

  return (
    <div
      className={`${styles.activityGroup} ${
        placement === 'bottom' ? styles.activityGroupBottom : ''
      }`}
    >
      {activities.map((activity) => (
        <button
          className={`${styles.activityButton} ${
            activity.isActive ? styles.activityButtonActive : ''
          }`}
          type="button"
          aria-controls={activity.panelId}
          aria-expanded={activity.isExpanded}
          aria-label={activity.label}
          aria-pressed={activity.isActive}
          key={activity.id}
          title={activity.label}
          onClick={activity.onSelect}
        >
          {activity.icon}
        </button>
      ))}
    </div>
  )
}

function ActivitySidebarPanel({
  side,
  panelId,
  panelLabel,
  children,
  closeLabel,
  onClose,
  resizeHandle,
}: {
  side: ActivitySidebarSide
  panelId: string
  panelLabel: string
  children: ReactNode
  closeLabel?: string
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void
  resizeHandle?: ActivitySidebarResizeHandle
}) {
  const headingId = `${panelId}-heading`

  return (
    <section
      className={`${styles.panel} ${panelSideClassNames[side]}`}
      id={panelId}
      aria-labelledby={headingId}
    >
      <div className={styles.header}>
        <h2 id={headingId}>{panelLabel}</h2>
        {onClose && closeLabel ? (
          <button
            className={styles.closeButton}
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon className={styles.activityIcon} />
          </button>
        ) : null}
      </div>
      <div className={styles.panelContent}>{children}</div>
      {resizeHandle ? (
        <div
          className={styles.resizeHandle}
          role="separator"
          aria-label={resizeHandle.label}
          aria-orientation="vertical"
          aria-valuemax={resizeHandle.max}
          aria-valuemin={resizeHandle.min}
          aria-valuenow={resizeHandle.value}
          aria-valuetext={resizeHandle.valueText}
          tabIndex={0}
          onKeyDown={resizeHandle.onKeyDown}
          onPointerCancel={resizeHandle.onPointerCancel}
          onPointerDown={resizeHandle.onPointerDown}
          onPointerMove={resizeHandle.onPointerMove}
          onPointerUp={resizeHandle.onPointerUp}
        />
      ) : null}
    </section>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}
