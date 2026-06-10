import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from 'react'
import { CloseIcon } from './EditorInspectorIcons'
import styles from './EditorPage.module.css'

export type EditorSidebarShellSide = 'left' | 'right'
export type EditorSidebarPanelPlacement =
  | 'before-activity-bar'
  | 'after-activity-bar'

export type EditorSidebarShellActivity = {
  id: string
  label: string
  icon: ReactNode
  panelId: string
  isActive: boolean
  isExpanded: boolean
  onSelect: (event: MouseEvent<HTMLButtonElement>) => void
}

type EditorSidebarResizeHandleProps = {
  label: string
  min: number
  value: number
  valueText: string
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
}

type EditorSidebarShellProps = {
  side: EditorSidebarShellSide
  panelPlacement: EditorSidebarPanelPlacement
  label: string
  activityBarLabel: string
  activities: readonly EditorSidebarShellActivity[]
  isExpanded: boolean
  panelWidth?: number
  panelId?: string
  panelLabel?: string
  children?: ReactNode
  closeLabel?: string
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void
  resizeHandle?: EditorSidebarResizeHandleProps
}

const activityBarSideClassNames = {
  left: styles.editorSidebarActivityBarLeft,
  right: styles.editorSidebarActivityBarRight,
} satisfies Record<EditorSidebarShellSide, string>

const panelSideClassNames = {
  left: styles.editorSidebarPanelLeft,
  right: styles.editorSidebarPanelRight,
} satisfies Record<EditorSidebarShellSide, string>

export function EditorSidebarShell({
  side,
  panelPlacement,
  label,
  activityBarLabel,
  activities,
  isExpanded,
  panelWidth,
  panelId,
  panelLabel,
  children,
  closeLabel,
  onClose,
  resizeHandle,
}: EditorSidebarShellProps) {
  const style = panelWidth
    ? ({
        '--editor-sidebar-panel-width': `${panelWidth}px`,
      } as CSSProperties)
    : undefined
  const panel =
    isExpanded && panelId && panelLabel ? (
      <EditorSidebarPanel
        closeLabel={closeLabel}
        onClose={onClose}
        panelId={panelId}
        panelLabel={panelLabel}
        resizeHandle={resizeHandle}
        side={side}
      >
        {children}
      </EditorSidebarPanel>
    ) : null
  const activityBar = (
    <div
      className={`${styles.editorSidebarActivityBar} ${activityBarSideClassNames[side]}`}
      aria-label={activityBarLabel}
    >
      {activities.map((activity) => (
        <button
          className={`${styles.editorActivityButton} ${
            activity.isActive ? styles.editorActivityButtonActive : ''
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

  return (
    <aside
      aria-label={label}
      className={`${styles.editorSidebarDock} ${
        isExpanded ? styles.editorSidebarDockExpanded : ''
      } ${
        panelPlacement === 'before-activity-bar'
          ? styles.editorSidebarDockPanelBefore
          : styles.editorSidebarDockPanelAfter
      }`}
      style={style}
    >
      {panelPlacement === 'before-activity-bar' ? panel : null}
      {activityBar}
      {panelPlacement === 'after-activity-bar' ? panel : null}
    </aside>
  )
}

function EditorSidebarPanel({
  side,
  panelId,
  panelLabel,
  children,
  closeLabel,
  onClose,
  resizeHandle,
}: {
  side: EditorSidebarShellSide
  panelId: string
  panelLabel: string
  children: ReactNode
  closeLabel?: string
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void
  resizeHandle?: EditorSidebarResizeHandleProps
}) {
  const headingId = `${panelId}-heading`

  return (
    <section
      className={`${styles.editorSidebarPanel} ${panelSideClassNames[side]}`}
      id={panelId}
      aria-labelledby={headingId}
    >
      <div className={styles.editorSidebarHeader}>
        <h2 id={headingId}>{panelLabel}</h2>
        {onClose && closeLabel ? (
          <button
            className={styles.editorSidebarClose}
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon className={styles.editorActivityIcon} />
          </button>
        ) : null}
      </div>
      <div className={styles.editorSidebarPanelContent}>{children}</div>
      {resizeHandle ? (
        <div
          className={styles.editorSidebarResizeHandle}
          role="separator"
          aria-label={resizeHandle.label}
          aria-orientation="vertical"
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
