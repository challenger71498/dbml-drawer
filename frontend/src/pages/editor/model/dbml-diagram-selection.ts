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

export type DbmlDiagramRelationEndpointColumnIds = {
  sourceColumnIds: ReadonlySet<string>
  referenceColumnIds: ReadonlySet<string>
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
  return getRelationIdsForTargets(diagram, [activeTarget])
}

export function getRelationIdsForTargets(
  diagram: LayoutedDbmlDiagram | null,
  targets: readonly (DbmlDiagramSelectionTarget | null)[],
) {
  if (!diagram) {
    return new Set<string>()
  }

  const relationIds = new Set<string>()

  for (const target of targets) {
    if (!target) {
      continue
    }

    for (const relation of diagram.relations) {
      if (isRelationConnectedToTarget(relation, target)) {
        relationIds.add(relation.id)
      }
    }
  }

  return relationIds
}

export function getActiveTableIds(
  diagram: LayoutedDbmlDiagram | null,
  activeTarget: DbmlDiagramSelectionTarget | null,
) {
  if (!diagram || !activeTarget) {
    return new Set<string>()
  }

  const tableIds = new Set<string>([activeTarget.tableId])

  for (const relation of diagram.relations) {
    if (!isRelationConnectedToTarget(relation, activeTarget)) {
      continue
    }

    tableIds.add(relation.sourceTableId)
    tableIds.add(relation.targetTableId)
  }

  return tableIds
}

export function getActiveRelationEndpointColumnIds(
  diagram: LayoutedDbmlDiagram | null,
  activeTarget: DbmlDiagramSelectionTarget | null,
): DbmlDiagramRelationEndpointColumnIds {
  return getRelationEndpointColumnIdsForTargets(diagram, [activeTarget])
}

export function getRelationEndpointColumnIdsForTargets(
  diagram: LayoutedDbmlDiagram | null,
  targets: readonly (DbmlDiagramSelectionTarget | null)[],
): DbmlDiagramRelationEndpointColumnIds {
  const sourceColumnIds = new Set<string>()
  const referenceColumnIds = new Set<string>()

  if (!diagram) {
    return {
      sourceColumnIds,
      referenceColumnIds,
    }
  }

  for (const target of targets) {
    if (target?.type !== 'column') {
      continue
    }

    for (const relation of diagram.relations) {
      if (!isRelationConnectedToTarget(relation, target)) {
        continue
      }

      sourceColumnIds.add(relation.sourceColumnId)
      referenceColumnIds.add(relation.targetColumnId)
    }
  }

  return {
    sourceColumnIds,
    referenceColumnIds,
  }
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
