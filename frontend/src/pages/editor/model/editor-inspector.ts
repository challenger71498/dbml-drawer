import type { ReactNode } from 'react'

export type EditorInspectorActivityId = 'diagnostics' | 'presets'

export type EditorInspectorActivity = {
  id: EditorInspectorActivityId
  label: string
  panelLabel: string
  icon: ReactNode
  renderPanel: () => ReactNode
}
