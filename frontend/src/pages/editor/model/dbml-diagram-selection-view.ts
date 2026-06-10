import { createContext, useContext } from 'react'
import type { DbmlDiagramColumn } from './dbml-diagram'
import type { DbmlDiagramSelectionTarget } from './dbml-diagram-selection'

export type DbmlDiagramSelectionViewState = {
  activeRelationIds: ReadonlySet<string>
  activeTarget: DbmlDiagramSelectionTarget | null
  onColumnFocus: (column: DbmlDiagramColumn) => void
  onColumnHover: (target: DbmlDiagramSelectionTarget | null) => void
}

const EMPTY_ACTIVE_RELATION_IDS = new Set<string>()

const EMPTY_SELECTION_VIEW_STATE: DbmlDiagramSelectionViewState = {
  activeRelationIds: EMPTY_ACTIVE_RELATION_IDS,
  activeTarget: null,
  onColumnFocus: () => undefined,
  onColumnHover: () => undefined,
}

export const DbmlDiagramSelectionViewContext =
  createContext<DbmlDiagramSelectionViewState>(EMPTY_SELECTION_VIEW_STATE)

export function useDbmlDiagramSelectionView() {
  return useContext(DbmlDiagramSelectionViewContext)
}
