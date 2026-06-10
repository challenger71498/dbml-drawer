import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { DbmlTableNodeData } from '../lib/map-dbml-diagram-flow'
import styles from './EditorPage.module.css'

export function DbmlTableNode({ data }: NodeProps<Node<DbmlTableNodeData>>) {
  const { table } = data

  return (
    <article className={styles.diagramTableNode}>
      <header className={styles.diagramTableHeader}>
        <span>{table.name}</span>
        {table.schemaName !== 'public' ? (
          <small>{table.schemaName}</small>
        ) : null}
      </header>

      <div className={styles.diagramColumnList}>
        {table.columns.map((column) => (
          <div className={styles.diagramColumnRow} key={column.id}>
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
            <span className={styles.diagramColumnType}>{column.typeName}</span>
            <Handle
              id={column.rightPortId}
              className={styles.diagramColumnHandle}
              type="source"
              position={Position.Right}
              isConnectable={false}
            />
          </div>
        ))}
      </div>
    </article>
  )
}
