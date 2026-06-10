export type DbmlRelationLineStyle =
  | 'bezier'
  | 'orthogonal'
  | 'rounded-orthogonal'

export type DbmlRelationHighlightMode = 'solid' | 'gradient' | 'dynamic'

export const DEFAULT_DBML_RELATION_LINE_STYLE: DbmlRelationLineStyle = 'bezier'
export const DEFAULT_DBML_RELATION_HIGHLIGHT_MODE: DbmlRelationHighlightMode =
  'gradient'

export const DBML_RELATION_SOURCE_COLOR = '#22324a'
export const DBML_RELATION_REFERENCE_COLOR = '#e05d2f'
