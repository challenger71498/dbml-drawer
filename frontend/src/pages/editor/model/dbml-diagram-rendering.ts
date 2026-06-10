export type DbmlRelationLineStyle =
  | 'bezier'
  | 'orthogonal'
  | 'rounded-orthogonal'

export type DbmlRelationHighlightMode = 'solid' | 'gradient' | 'dynamic'

export const DEFAULT_DBML_RELATION_LINE_STYLE: DbmlRelationLineStyle = 'bezier'
export const DEFAULT_DBML_RELATION_HIGHLIGHT_MODE: DbmlRelationHighlightMode =
  'gradient'

export const DBML_RELATION_DEFAULT_COLOR = '#3b6ea8'
export const DBML_RELATION_SOURCE_COLOR = DBML_RELATION_DEFAULT_COLOR
export const DBML_RELATION_REFERENCE_COLOR = '#e05d2f'
