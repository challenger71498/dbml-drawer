import type {
  LayoutedDbmlDiagram,
  LayoutedDbmlDiagramRelation,
} from './dbml-layout'

export type DbmlDiagramSelectionTarget =
  | {
      type: 'table'
      tableId: string
    }
  | {
      type: 'column'
      tableId: string
      columnId: string
    }

export type DbmlDiagramSelectionState = {
  hoveredTarget: DbmlDiagramSelectionTarget | null
  focusedTarget: DbmlDiagramSelectionTarget | null
}

export function getActiveDiagramSelectionTarget({
  hoveredTarget,
  focusedTarget,
}: DbmlDiagramSelectionState) {
  return hoveredTarget ?? focusedTarget
}

export function getActiveRelationIds(
  diagram: LayoutedDbmlDiagram | null,
  activeTarget: DbmlDiagramSelectionTarget | null,
) {
  if (!diagram || !activeTarget) {
    return new Set<string>()
  }

  return new Set(
    diagram.relations
      .filter((relation) => isRelationConnectedToTarget(relation, activeTarget))
      .map((relation) => relation.id),
  )
}

export function isTableNodeActive(
  activeTarget: DbmlDiagramSelectionTarget | null,
  tableId: string,
) {
  return activeTarget?.tableId === tableId
}

export function isTableHeaderActive(
  activeTarget: DbmlDiagramSelectionTarget | null,
  tableId: string,
) {
  return activeTarget?.type === 'table' && activeTarget.tableId === tableId
}

export function isColumnActive(
  activeTarget: DbmlDiagramSelectionTarget | null,
  columnId: string,
) {
  return activeTarget?.type === 'column' && activeTarget.columnId === columnId
}

function isRelationConnectedToTarget(
  relation: LayoutedDbmlDiagramRelation,
  target: DbmlDiagramSelectionTarget,
) {
  if (target.type === 'table') {
    return (
      relation.sourceTableId === target.tableId ||
      relation.targetTableId === target.tableId
    )
  }

  return (
    relation.sourceColumnId === target.columnId ||
    relation.targetColumnId === target.columnId
  )
}
