import { EDITOR_COLOR_VARIABLES } from '../../../shared/design-tokens/generated/tokens'

export type DbmlRelationLineStyle =
  | 'bezier'
  | 'orthogonal'
  | 'rounded-orthogonal'

export type DbmlRelationHighlightMode = 'solid' | 'gradient' | 'dynamic'
export type DbmlRelationPortRoutingMode = 'fixed' | 'nearest'

export const DEFAULT_DBML_RELATION_LINE_STYLE: DbmlRelationLineStyle = 'bezier'
export const DEFAULT_DBML_RELATION_HIGHLIGHT_MODE: DbmlRelationHighlightMode =
  'gradient'

export const DBML_RELATION_DEFAULT_COLOR = EDITOR_COLOR_VARIABLES.relationLine
export const DBML_RELATION_SOURCE_COLOR = EDITOR_COLOR_VARIABLES.relationSource
export const DBML_RELATION_REFERENCE_COLOR =
  EDITOR_COLOR_VARIABLES.relationReference
