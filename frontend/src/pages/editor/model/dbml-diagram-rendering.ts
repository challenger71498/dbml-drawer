export type DbmlRelationLineStyle =
  | 'bezier'
  | 'orthogonal'
  | 'rounded-orthogonal'

export type DbmlRelationHighlightMode = 'solid' | 'gradient' | 'dynamic'

export const DEFAULT_DBML_RELATION_LINE_STYLE: DbmlRelationLineStyle = 'bezier'
export const DEFAULT_DBML_RELATION_HIGHLIGHT_MODE: DbmlRelationHighlightMode =
  'gradient'

export const DBML_RELATION_DEFAULT_COLOR =
  'var(--editor-color-relation-line, currentColor)'
export const DBML_RELATION_SOURCE_COLOR =
  'var(--editor-color-relation-source, #d8a657)'
export const DBML_RELATION_REFERENCE_COLOR =
  'var(--editor-color-relation-reference, #7daea3)'
