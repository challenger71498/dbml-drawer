import { createContext, useContext } from 'react'
import type { DbmlDiagramColumn } from './dbml-diagram'
import type { DbmlDiagramSelectionTarget } from './dbml-diagram-selection'

export type DbmlDiagramSelectionViewState = {
  activeRelationIds: ReadonlySet<string>
  activeTarget: DbmlDiagramSelectionTarget | null
  focusedTableIds: ReadonlySet<string>
  focusedTarget: DbmlDiagramSelectionTarget | null
  sourceColumnIds: ReadonlySet<string>
  referenceColumnIds: ReadonlySet<string>
  onColumnFocus: (column: DbmlDiagramColumn) => void
  onColumnHover: (target: DbmlDiagramSelectionTarget | null) => void
}

const EMPTY_ACTIVE_RELATION_IDS = new Set<string>()
const EMPTY_ENDPOINT_COLUMN_IDS = new Set<string>()

const EMPTY_SELECTION_VIEW_STATE: DbmlDiagramSelectionViewState = {
  activeRelationIds: EMPTY_ACTIVE_RELATION_IDS,
  activeTarget: null,
  focusedTableIds: EMPTY_ACTIVE_RELATION_IDS,
  focusedTarget: null,
  sourceColumnIds: EMPTY_ENDPOINT_COLUMN_IDS,
  referenceColumnIds: EMPTY_ENDPOINT_COLUMN_IDS,
  onColumnFocus: () => undefined,
  onColumnHover: () => undefined,
}

export const DbmlDiagramSelectionViewContext =
  createContext<DbmlDiagramSelectionViewState>(EMPTY_SELECTION_VIEW_STATE)

export function useDbmlDiagramSelectionView() {
  return useContext(DbmlDiagramSelectionViewContext)
}
