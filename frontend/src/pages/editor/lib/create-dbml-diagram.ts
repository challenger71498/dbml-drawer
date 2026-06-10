import type {
  DbmlColumn,
  DbmlDatabase,
  DbmlEndpoint,
  DbmlTable,
} from '../model/dbml-entities'
import type {
  DbmlDiagram,
  DbmlDiagramCardinality,
  DbmlDiagramColumn,
  DbmlDiagramPort,
  DbmlDiagramRelation,
  DbmlDiagramSize,
  DbmlDiagramTable,
} from '../model/dbml-diagram'

const TABLE_WIDTH = 260
const TABLE_HEADER_HEIGHT = 44
export const TABLE_COLUMN_HEIGHT = 30

export function createDbmlDiagram(database: DbmlDatabase): DbmlDiagram {
  const tables = database.schemas.flatMap((schema) =>
    schema.tables.map((table) => buildDiagramTable(table)),
  )
  const tableByKey = new Map(tables.map((table) => [tableKey(table), table]))
  const relations = database.schemas.flatMap((schema) =>
    schema.refs.flatMap((ref) =>
      ref.endpoints.length >= 2
        ? buildDiagramRelations(
            ref,
            ref.endpoints[0],
            ref.endpoints[1],
            tableByKey,
          )
        : [],
    ),
  )

  return {
    tables,
    relations,
  }
}

function buildDiagramTable(source: DbmlTable): DbmlDiagramTable {
  const schemaName = source.schema.name
  const tableId = createTableId(schemaName, source.name)
  const columns = source.fields.map((field, rowIndex) =>
    buildDiagramColumn(tableId, field, rowIndex),
  )
  const ports = columns.flatMap((column) => [
    buildDiagramPort(column, 'left'),
    buildDiagramPort(column, 'right'),
  ])

  return {
    id: tableId,
    source,
    schemaName,
    name: source.name,
    columns,
    ports,
    size: getTableSize(columns.length),
  }
}

function buildDiagramColumn(
  tableId: string,
  source: DbmlColumn,
  rowIndex: number,
): DbmlDiagramColumn {
  const columnId = createColumnId(tableId, source.name)

  return {
    id: columnId,
    source,
    tableId,
    name: source.name,
    typeName: getColumnTypeName(source),
    rowIndex,
    leftPortId: createPortId(columnId, 'left'),
    rightPortId: createPortId(columnId, 'right'),
    isPrimaryKey: Boolean(source.pk),
    isUnique: Boolean(source.unique),
    isNotNull: Boolean(source.not_null),
  }
}

function buildDiagramPort(
  column: DbmlDiagramColumn,
  side: DbmlDiagramPort['side'],
): DbmlDiagramPort {
  return {
    id: side === 'left' ? column.leftPortId : column.rightPortId,
    tableId: column.tableId,
    columnId: column.id,
    rowIndex: column.rowIndex,
    side,
  }
}

function buildDiagramRelations(
  sourceRef: DbmlDiagramRelation['source'],
  firstEndpoint: DbmlEndpoint,
  secondEndpoint: DbmlEndpoint,
  tableByKey: ReadonlyMap<string, DbmlDiagramTable>,
): DbmlDiagramRelation[] {
  const firstTable = tableByKey.get(
    createTableId(
      firstEndpoint.schemaName ?? 'public',
      firstEndpoint.tableName,
    ),
  )
  const secondTable = tableByKey.get(
    createTableId(
      secondEndpoint.schemaName ?? 'public',
      secondEndpoint.tableName,
    ),
  )

  if (!firstTable || !secondTable) {
    return []
  }

  const fieldCount = Math.min(
    firstEndpoint.fieldNames.length,
    secondEndpoint.fieldNames.length,
  )

  return Array.from({ length: fieldCount }, (_, index) => {
    const firstColumn = findColumn(firstTable, firstEndpoint.fieldNames[index])
    const secondColumn = findColumn(
      secondTable,
      secondEndpoint.fieldNames[index],
    )

    if (!firstColumn || !secondColumn) {
      return null
    }

    return {
      id: createRelationId(sourceRef.id, index),
      source: sourceRef,
      sourceTableId: firstTable.id,
      sourceColumnId: firstColumn.id,
      sourcePortId: firstColumn.rightPortId,
      targetTableId: secondTable.id,
      targetColumnId: secondColumn.id,
      targetPortId: secondColumn.leftPortId,
      cardinality: {
        source: mapEndpointCardinality(firstEndpoint),
        target: mapEndpointCardinality(secondEndpoint),
      },
    } satisfies DbmlDiagramRelation
  }).filter((relation): relation is DbmlDiagramRelation => relation !== null)
}

function getTableSize(columnCount: number): DbmlDiagramSize {
  return {
    width: TABLE_WIDTH,
    height: TABLE_HEADER_HEIGHT + columnCount * TABLE_COLUMN_HEIGHT,
  }
}

function getColumnTypeName(column: DbmlColumn): string {
  const columnType: unknown = column.type

  if (
    typeof columnType === 'object' &&
    columnType !== null &&
    'type_name' in columnType
  ) {
    const typeName = columnType.type_name

    if (typeof typeName === 'string') {
      return typeName
    }
  }

  return String(columnType)
}

function findColumn(table: DbmlDiagramTable, columnName: string | undefined) {
  if (!columnName) {
    return undefined
  }

  return table.columns.find((column) => column.name === columnName)
}

function mapEndpointCardinality(
  endpoint: DbmlEndpoint,
): DbmlDiagramCardinality {
  return endpoint.relation === '1' ? 'one' : 'many'
}

function tableKey(table: DbmlDiagramTable) {
  return table.id
}

function createTableId(schemaName: string, tableName: string) {
  return `table:${schemaName}.${tableName}`
}

function createColumnId(tableId: string, columnName: string) {
  return `${tableId}.column:${columnName}`
}

function createPortId(columnId: string, side: DbmlDiagramPort['side']) {
  return `${columnId}.port:${side}`
}

function createRelationId(refId: number, fieldIndex: number) {
  return `relation:${refId}:${fieldIndex}`
}
