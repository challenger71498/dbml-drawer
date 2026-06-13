import type { DbmlColumn, DbmlRef, DbmlTable } from './dbml-entities'

export type DbmlDiagram = {
  tables: DbmlDiagramTable[]
  relations: DbmlDiagramRelation[]
}

export type DbmlDiagramTable = {
  id: string
  source: DbmlTable
  schemaName: string
  name: string
  columns: DbmlDiagramColumn[]
  ports: DbmlDiagramPort[]
  size: DbmlDiagramSize
}

export type DbmlDiagramColumn = {
  id: string
  source: DbmlColumn
  tableId: string
  name: string
  typeName: string
  rowIndex: number
  leftPortId: string
  rightPortId: string
  isPrimaryKey: boolean
  isUnique: boolean
  isNotNull: boolean
}

export type DbmlDiagramPort = {
  id: string
  tableId: string
  columnId: string
  rowIndex: number
  side: DbmlDiagramPortSide
}

export type DbmlDiagramRelation = {
  id: string
  source: DbmlRef
  sourceTableId: string
  sourceColumnId: string
  sourcePortId: string
  targetTableId: string
  targetColumnId: string
  targetPortId: string
  cardinality: {
    source: DbmlDiagramCardinality
    target: DbmlDiagramCardinality
  }
}

export type DbmlDiagramSize = {
  width: number
  height: number
}

export type DbmlDiagramPortSide = 'left' | 'right'

export type DbmlDiagramCardinality = 'one' | 'many'
