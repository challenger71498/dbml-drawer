import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import type {
  DbmlOffscreenRelationProxy,
  DbmlOffscreenRelationProxyLayout,
} from '../lib/dbml-diagram-flow-proxy'
import styles from './EditorPage.module.css'

export function DbmlDiagramFlowProxyOverlay({
  proxyLayouts,
  onProxyActivate,
  onProxyColumnFocus,
  onProxyHover,
  onProxyTableFocus,
}: {
  proxyLayouts: readonly DbmlOffscreenRelationProxyLayout[]
  onProxyActivate: (proxy: DbmlOffscreenRelationProxy) => void
  onProxyColumnFocus: (column: DbmlDiagramColumn) => void
  onProxyHover: (relationIds: ReadonlySet<string> | null) => void
  onProxyTableFocus: (table: DbmlDiagramTable) => void
}) {
  if (proxyLayouts.length === 0) {
    return null
  }

  return (
    <div
      className={styles.offscreenProxyOverlay}
      aria-label="Offscreen relations"
    >
      {proxyLayouts.map(({ handoffProgress = 0, proxy, style }) => {
        const compactLayerStyle =
          handoffProgress > 0
            ? {
                opacity: 1 - handoffProgress,
                pointerEvents:
                  handoffProgress > 0.5 ? ('none' as const) : ('auto' as const),
              }
            : undefined
        const originalLayerStyle =
          handoffProgress > 0
            ? {
                opacity: handoffProgress,
                pointerEvents:
                  handoffProgress > 0.5 ? ('auto' as const) : ('none' as const),
              }
            : undefined

        return (
          <button
            aria-label={`Show ${proxy.table.name}`}
            className={styles.offscreenProxyCard}
            data-handoff-progress={String(handoffProgress)}
            data-testid={`offscreen-relation-proxy:${proxy.table.id}`}
            key={proxy.id}
            style={style}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              const columnId = (
                event.target as HTMLElement
              ).closest<HTMLElement>('[data-proxy-column-id]')?.dataset
                .proxyColumnId
              const column = columnId
                ? proxy.table.columns.find(
                    (candidate) => candidate.id === columnId,
                  )
                : null

              if (column) {
                onProxyColumnFocus(column)
              } else {
                onProxyTableFocus(proxy.table)
              }

              onProxyActivate(proxy)
            }}
            onMouseEnter={() => onProxyHover(new Set(proxy.relationIds))}
            onMouseLeave={() => onProxyHover(null)}
          >
            <span className={styles.offscreenProxyLayerFrame}>
              <DbmlDiagramFlowProxyContent
                columns={proxy.columns}
                tableName={proxy.table.name}
                style={compactLayerStyle}
              />
              {handoffProgress > 0 ? (
                <DbmlDiagramFlowProxyContent
                  columns={proxy.table.columns}
                  tableName={proxy.table.name}
                  variant="original"
                  style={originalLayerStyle}
                />
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function DbmlDiagramFlowProxyContent({
  columns,
  tableName,
  variant = 'compact',
  style,
}: {
  columns: readonly DbmlDiagramColumn[]
  tableName: string
  variant?: 'compact' | 'original'
  style?: {
    opacity: number
    pointerEvents: 'auto' | 'none'
  }
}) {
  return (
    <span className={styles.offscreenProxyLayer} style={style}>
      <span
        className={[
          styles.diagramTableHeader,
          variant === 'compact' ? styles.offscreenProxyHeader : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span>{tableName}</span>
      </span>
      <span
        className={[
          styles.diagramColumnList,
          styles.offscreenProxyColumns,
        ].join(' ')}
      >
        {columns.map((column) => (
          <span
            className={[
              styles.diagramColumnRow,
              styles.offscreenProxyColumn,
            ].join(' ')}
            data-proxy-column-id={column.id}
            key={column.id}
          >
            <span className={styles.diagramColumnName}>
              {column.name}
              {column.isPrimaryKey ? (
                <span className={styles.diagramColumnBadge}>PK</span>
              ) : null}
            </span>
            <span className={styles.diagramColumnType}>{column.typeName}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
