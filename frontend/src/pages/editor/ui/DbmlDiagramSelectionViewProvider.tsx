import type { ReactNode } from 'react'
import {
  DbmlDiagramSelectionViewContext,
  type DbmlDiagramSelectionViewState,
} from '../model/dbml-diagram-selection-view'

export function DbmlDiagramSelectionViewProvider({
  children,
  value,
}: {
  children: ReactNode
  value: DbmlDiagramSelectionViewState
}) {
  return (
    <DbmlDiagramSelectionViewContext.Provider value={value}>
      {children}
    </DbmlDiagramSelectionViewContext.Provider>
  )
}
