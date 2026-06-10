import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { DbmlTableNodeData } from '../lib/map-dbml-diagram-flow'
import {
  isColumnActive,
  isTableHeaderActive,
  isTableNodeActive,
} from '../model/dbml-diagram-selection'
import { useDbmlDiagramSelectionView } from '../model/dbml-diagram-selection-view'
import styles from './EditorPage.module.css'

export function DbmlTableNode({ data }: NodeProps<Node<DbmlTableNodeData>>) {
  const { table } = data
  const { activeTableIds, activeTarget, onColumnFocus, onColumnHover } =
    useDbmlDiagramSelectionView()
  const hasActiveTarget = activeTarget !== null
  const isNodeActive = isTableNodeActive(activeTarget, table.id)
  const isNodeConnected = activeTableIds.has(table.id)
  const isNodeDimmed = hasActiveTarget && !isNodeConnected
  const isHeaderActive = isTableHeaderActive(activeTarget, table.id)
  const activeColumnId =
    activeTarget?.type === 'column' &&
    activeTarget.tableId === table.id &&
    isColumnActive(activeTarget, activeTarget.columnId)
      ? activeTarget.columnId
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

          return (
            <div
              className={[
                styles.diagramColumnRow,
                'nodrag nopan',
                isColumnSelected ? styles.diagramColumnRowActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-active={isColumnSelected ? 'true' : 'false'}
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
              onMouseLeave={() => onColumnHover(null)}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Handle
                id={column.leftPortId}
                className={styles.diagramColumnHandle}
                type="target"
                position={Position.Left}
                isConnectable={false}
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
              <Handle
                id={column.rightPortId}
                className={styles.diagramColumnHandle}
                type="source"
                position={Position.Right}
                isConnectable={false}
              />
            </div>
          )
        })}
      </div>
    </article>
  )
}
