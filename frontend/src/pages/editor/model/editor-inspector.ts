import type { ReactNode } from 'react'

export type EditorInspectorActivityId =
  | 'diagnostics'
  | 'presets'
  | 'diagram-settings'
  | 'settings'

export type EditorInspectorActivity = {
  id: EditorInspectorActivityId
  label: string
  panelLabel: string
  icon: ReactNode
  renderPanel: () => ReactNode
}
