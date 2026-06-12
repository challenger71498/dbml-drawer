import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ActivitySidebar } from './ActivitySidebar'
import { useActivitySidebar } from './use-activity-sidebar'

type TestActivityId = 'files' | 'settings'

function TestActivitySidebar() {
  const sidebar = useActivitySidebar<TestActivityId>({
    defaultWidth: 300,
    maxWidth: 500,
    minWidth: 200,
    resizeHandleEdge: 'right',
  })
  const activities = [
    {
      id: 'files',
      label: 'Files',
      icon: <span aria-hidden="true">F</span>,
      panelLabel: 'Files',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <span aria-hidden="true">S</span>,
      panelLabel: 'Settings',
    },
  ] as const
  const activeActivity = activities.find(
    (activity) => activity.id === sidebar.activeActivityId,
  )

  return (
    <ActivitySidebar
      activityBarLabel="Test activities"
      activityGroups={{
        top: [activities[0]].map((activity) => {
          const activityState = sidebar.getActivityState(activity.id)

          return {
            ...activity,
            panelId: `panel-${activity.id}`,
            isActive: activityState.isActive,
            isExpanded: activityState.isExpanded,
            onSelect: (event) => sidebar.selectActivity(activity.id, event),
          }
        }),
        bottom: [activities[1]].map((activity) => {
          const activityState = sidebar.getActivityState(activity.id)

          return {
            ...activity,
            panelId: `panel-${activity.id}`,
            isActive: activityState.isActive,
            isExpanded: activityState.isExpanded,
            onSelect: (event) => sidebar.selectActivity(activity.id, event),
          }
        }),
      }}
      closeLabel="Close panel"
      isExpanded={sidebar.isExpanded && activeActivity !== undefined}
      label="Test sidebar"
      panelId={activeActivity ? `panel-${activeActivity.id}` : undefined}
      panelLabel={activeActivity?.panelLabel}
      panelPlacement="after-activity-bar"
      panelWidth={sidebar.panelWidth}
      resizeHandle={sidebar.getResizeHandle({ label: 'Resize panel' })}
      side="left"
      onClose={sidebar.close}
    >
      <p>{activeActivity?.id} content</p>
    </ActivitySidebar>
  )
}

describe('ActivitySidebar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders grouped activities and keeps one panel active', () => {
    render(<TestActivitySidebar />)

    const filesButton = screen.getByRole('button', { name: 'Files' })
    const settingsButton = screen.getByRole('button', { name: 'Settings' })

    expect(filesButton).toHaveAttribute('aria-expanded', 'false')
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(filesButton)

    expect(screen.getByRole('heading', { name: 'Files' })).toBeInTheDocument()
    expect(filesButton).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(settingsButton)

    expect(
      screen.queryByRole('heading', { name: 'Files' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument()
    expect(filesButton).toHaveAttribute('aria-pressed', 'false')
    expect(settingsButton).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Close panel' }))

    expect(
      screen.queryByRole('heading', { name: 'Settings' }),
    ).not.toBeInTheDocument()
    expect(settingsButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('resizes with pointer and keyboard controls within bounds', () => {
    render(<TestActivitySidebar />)

    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    const sidebar = screen.getByRole('complementary', {
      name: 'Test sidebar',
    })
    const resizeHandle = screen.getByRole('separator', {
      name: 'Resize panel',
    })

    expect(
      sidebar.style.getPropertyValue('--activity-sidebar-panel-width'),
    ).toBe('300px')
    expect(resizeHandle).toHaveAttribute('aria-valuenow', '300')

    fireEvent.pointerDown(resizeHandle, {
      clientX: 100,
      pointerId: 1,
    })
    fireEvent.pointerMove(resizeHandle, {
      clientX: 260,
      pointerId: 1,
    })
    fireEvent.pointerUp(resizeHandle, {
      clientX: 260,
      pointerId: 1,
    })

    expect(
      sidebar.style.getPropertyValue('--activity-sidebar-panel-width'),
    ).toBe('460px')

    fireEvent.keyDown(resizeHandle, { key: 'ArrowLeft' })

    expect(
      sidebar.style.getPropertyValue('--activity-sidebar-panel-width'),
    ).toBe('436px')

    fireEvent.keyDown(resizeHandle, { key: 'End' })

    expect(
      sidebar.style.getPropertyValue('--activity-sidebar-panel-width'),
    ).toBe('500px')
  })
})
