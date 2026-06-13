import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { DbmlTableNodeData } from '../lib/dbml-diagram-flow'
import {
  isColumnActive,
  isTableHeaderActive,
  isTableNodeActive,
} from '../model/dbml-diagram-selection'
import { useDbmlDiagramSelectionView } from '../model/dbml-diagram-selection-view'
import styles from './EditorPage.module.css'

export function DbmlTableNode({ data }: NodeProps<Node<DbmlTableNodeData>>) {
  const { table } = data
  const {
    focusedTableIds,
    focusedTarget,
    sourceColumnIds,
    referenceColumnIds,
    onColumnFocus,
    onColumnHover,
  } = useDbmlDiagramSelectionView()
  const hasFocusedTarget = focusedTarget !== null
  const isNodeActive = isTableNodeActive(focusedTarget, table.id)
  const isNodeConnected = focusedTableIds.has(table.id)
  const isNodeDimmed = hasFocusedTarget && !isNodeConnected
  const isHeaderActive = isTableHeaderActive(focusedTarget, table.id)
  const activeColumnId =
    focusedTarget?.type === 'column' &&
    focusedTarget.tableId === table.id &&
    isColumnActive(focusedTarget, focusedTarget.columnId)
      ? focusedTarget.columnId
      : null

  return (
    <article
      className={[
        styles.diagramTableNode,
        isNodeConnected ? styles.diagramTableNodeConnected : '',
        isNodeActive ? styles.diagramTableNodeActive : '',
        isNodeDimmed ? styles.diagramTableNodeDimmed : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-active={isNodeActive ? 'true' : 'false'}
      data-connected={isNodeConnected ? 'true' : 'false'}
      data-dimmed={isNodeDimmed ? 'true' : 'false'}
    >
      <header
        className={[
          styles.diagramTableHeader,
          isHeaderActive ? styles.diagramTableHeaderActive : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span>{table.name}</span>
        {table.schemaName !== 'public' ? (
          <small>{table.schemaName}</small>
        ) : null}
      </header>

      <div className={styles.diagramColumnList}>
        {table.columns.map((column) => {
          const isColumnSelected = activeColumnId === column.id
          const isSourceColumn = sourceColumnIds.has(column.id)
          const isReferenceColumn = referenceColumnIds.has(column.id)

          return (
            <div
              className={[
                styles.diagramColumnRow,
                'nodrag nopan',
                isColumnSelected ? styles.diagramColumnRowActive : '',
                isSourceColumn ? styles.diagramColumnRowSource : '',
                isReferenceColumn ? styles.diagramColumnRowReference : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-active={isColumnSelected ? 'true' : 'false'}
              data-source={isSourceColumn ? 'true' : 'false'}
              data-reference={isReferenceColumn ? 'true' : 'false'}
              key={column.id}
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                onColumnFocus(column)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  onColumnFocus(column)
                }
              }}
              onMouseEnter={() =>
                onColumnHover({
                  type: 'column',
                  tableId: table.id,
                  columnId: column.id,
                })
              }
              onMouseLeave={() =>
                onColumnHover({
                  type: 'table',
                  tableId: table.id,
                })
              }
              onMouseDown={(event) => event.stopPropagation()}
            >
              <ColumnPortHandles
                id={column.leftPortId}
                position={Position.Left}
              />
              <span className={styles.diagramColumnName}>
                {column.name}
                {column.isPrimaryKey ? (
                  <span className={styles.diagramColumnBadge}>PK</span>
                ) : null}
              </span>
              <span className={styles.diagramColumnType}>
                {column.typeName}
              </span>
              <ColumnPortHandles
                id={column.rightPortId}
                position={Position.Right}
              />
            </div>
          )
        })}
      </div>
    </article>
  )
}

function ColumnPortHandles({
  id,
  position,
}: {
  id: string
  position: Position
}) {
  return (
    <>
      <Handle
        id={id}
        className={styles.diagramColumnHandle}
        type="source"
        position={position}
        isConnectable={false}
      />
      <Handle
        id={id}
        className={styles.diagramColumnHandle}
        type="target"
        position={position}
        isConnectable={false}
      />
    </>
  )
}
