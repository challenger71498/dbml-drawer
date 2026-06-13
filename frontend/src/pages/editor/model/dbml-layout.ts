import type {
  DbmlDiagramColumn,
  DbmlDiagramRelation,
  DbmlDiagramTable,
} from './dbml-diagram'

export type LayoutedDbmlDiagram = {
  tables: LayoutedDbmlDiagramTable[]
  relations: LayoutedDbmlDiagramRelation[]
}

export type LayoutedDbmlDiagramTable = Omit<DbmlDiagramTable, 'columns'> & {
  position: DbmlDiagramPoint
  columns: LayoutedDbmlDiagramColumn[]
}

type LayoutedDbmlDiagramColumn = DbmlDiagramColumn & {
  portPositions: {
    left: DbmlDiagramPoint
    right: DbmlDiagramPoint
  }
}

export type LayoutedDbmlDiagramRelation = DbmlDiagramRelation & {
  route: DbmlDiagramRoute
}

export type DbmlDiagramRoute = {
  startPoint: DbmlDiagramPoint
  bendPoints: DbmlDiagramPoint[]
  endPoint: DbmlDiagramPoint
}

export type DbmlDiagramPoint = {
  x: number
  y: number
}
