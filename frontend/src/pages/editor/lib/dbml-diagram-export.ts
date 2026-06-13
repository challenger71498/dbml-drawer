import { Position } from '@xyflow/react'
import { getRelationPath } from './dbml-relation-path'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import {
  getActiveRelationEndpointColumnIds,
  getActiveRelationIds,
  getActiveTableIds,
  isColumnActive,
  isTableHeaderActive,
  isTableNodeActive,
  type DbmlDiagramSelectionTarget,
} from '../model/dbml-diagram-selection'
import type {
  DbmlRelationHighlightMode,
  DbmlRelationLineStyle,
} from '../model/dbml-diagram-rendering'
import type { ResolvedEditorTheme } from '../model/editor-theme'
import { EDITOR_THEME_COLOR_TOKENS } from '../../../shared/design-tokens/generated/tokens'

const EXPORT_PADDING = 48
const EXPORT_TABLE_HEADER_HEIGHT = 44
const EXPORT_COLUMN_HEIGHT = 30
const EXPORT_MIN_SIZE = 1
const EXPORT_SVG_TEXT_FONT =
  'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'

export type DbmlDiagramExportFormat = 'png' | 'html'

export type DbmlDiagramExportSnapshot = {
  diagram: LayoutedDbmlDiagram
  bounds: DbmlDiagramExportBounds
  focusedTarget: DbmlDiagramSelectionTarget | null
  relationLineStyle: DbmlRelationLineStyle
  relationHighlightMode: DbmlRelationHighlightMode
  theme: ResolvedEditorTheme
}

export type DbmlDiagramExportBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type DbmlDiagramExportBlobOptions = {
  format: DbmlDiagramExportFormat
  snapshot: DbmlDiagramExportSnapshot
}

export function buildDbmlDiagramExportSnapshot({
  diagram,
  focusedTarget,
  includeSelectionHighlight,
  relationHighlightMode,
  relationLineStyle,
  theme,
}: {
  diagram: LayoutedDbmlDiagram | null
  focusedTarget: DbmlDiagramSelectionTarget | null
  includeSelectionHighlight: boolean
  relationHighlightMode: DbmlRelationHighlightMode
  relationLineStyle: DbmlRelationLineStyle
  theme: ResolvedEditorTheme
}): DbmlDiagramExportSnapshot | null {
  if (!diagram || diagram.tables.length === 0) {
    return null
  }

  return {
    diagram,
    bounds: getDbmlDiagramExportBounds(diagram),
    focusedTarget: includeSelectionHighlight ? focusedTarget : null,
    relationLineStyle,
    relationHighlightMode: normalizeDbmlDiagramExportRelationHighlightMode(
      relationHighlightMode,
    ),
    theme,
  }
}

export function normalizeDbmlDiagramExportRelationHighlightMode(
  mode: DbmlRelationHighlightMode,
): DbmlRelationHighlightMode {
  return mode === 'dynamic' ? 'gradient' : mode
}

export function getDbmlDiagramExportBounds(
  diagram: LayoutedDbmlDiagram,
): DbmlDiagramExportBounds {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  const includePoint = (x: number, y: number) => {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  for (const table of diagram.tables) {
    includePoint(table.position.x, table.position.y)
    includePoint(
      table.position.x + table.size.width,
      table.position.y + table.size.height,
    )
  }

  for (const relation of diagram.relations) {
    const routePoints = [
      relation.route.startPoint,
      ...relation.route.bendPoints,
      relation.route.endPoint,
    ]

    for (const point of routePoints) {
      includePoint(point.x, point.y)
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return {
      x: 0,
      y: 0,
      width: EXPORT_MIN_SIZE,
      height: EXPORT_MIN_SIZE,
    }
  }

  return {
    x: minX - EXPORT_PADDING,
    y: minY - EXPORT_PADDING,
    width: Math.max(EXPORT_MIN_SIZE, maxX - minX + EXPORT_PADDING * 2),
    height: Math.max(EXPORT_MIN_SIZE, maxY - minY + EXPORT_PADDING * 2),
  }
}

export function createDbmlDiagramExportFilename({
  format,
  projectName,
}: {
  format: DbmlDiagramExportFormat
  projectName: string
}) {
  const basename = projectName
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')

  return `${basename || 'dbml-diagram'}.${format}`
}

export async function createDbmlDiagramExportBlob({
  format,
  snapshot,
}: DbmlDiagramExportBlobOptions) {
  if (format === 'html') {
    return new Blob([renderDbmlDiagramExportHtml(snapshot)], {
      type: 'text/html;charset=utf-8',
    })
  }

  return captureDbmlDiagramExportPng(snapshot)
}

export function downloadDbmlDiagramExportBlob({
  blob,
  documentRef = document,
  filename,
}: {
  blob: Blob
  documentRef?: Document
  filename: string
}) {
  const objectUrl = URL.createObjectURL(blob)
  const link = documentRef.createElement('a')

  link.href = objectUrl
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  documentRef.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export function renderDbmlDiagramExportHtml(
  snapshot: DbmlDiagramExportSnapshot,
) {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<title>DBML Diagram Export</title>',
    '</head>',
    `<body>${renderDbmlDiagramExportMarkup(snapshot)}</body>`,
    '</html>',
  ].join('')
}

export function renderDbmlDiagramExportSvg(
  snapshot: DbmlDiagramExportSnapshot,
) {
  const width = Math.ceil(snapshot.bounds.width)
  const height = Math.ceil(snapshot.bounds.height)
  const colors = EDITOR_THEME_COLOR_TOKENS[snapshot.theme]
  const focusedRelationIds = getActiveRelationIds(
    snapshot.diagram,
    snapshot.focusedTarget,
  )
  const focusedTableIds = getActiveTableIds(
    snapshot.diagram,
    snapshot.focusedTarget,
  )
  const { sourceColumnIds, referenceColumnIds } =
    getActiveRelationEndpointColumnIds(snapshot.diagram, snapshot.focusedTarget)
  const gridPatternId = getExportSvgScopedId(snapshot, 'grid')
  const shadowFilterId = getExportSvgScopedId(snapshot, 'table-shadow')
  const activeShadowFilterId = getExportSvgScopedId(
    snapshot,
    'table-active-shadow',
  )

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="DBML diagram export" data-theme="${escapeHtml(snapshot.theme)}" data-relation-highlight-mode="${escapeHtml(snapshot.relationHighlightMode)}">`,
    '<defs>',
    `<pattern id="${gridPatternId}" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${colors.diagramGridDot}" /></pattern>`,
    `<filter id="${shadowFilterId}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="${colors.textStrong}" flood-opacity=".12" /></filter>`,
    `<filter id="${activeShadowFilterId}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="${colors.textStrong}" flood-opacity=".18" /></filter>`,
    renderRelationGradientDefinitions(snapshot, focusedRelationIds, colors),
    '</defs>',
    `<rect width="100%" height="100%" fill="${colors.diagramBg}" />`,
    `<rect width="100%" height="100%" fill="url(#${gridPatternId})" />`,
    '<g>',
    ...snapshot.diagram.relations.map((relation) => {
      const isActive = focusedRelationIds.has(relation.id)
      const isDimmed =
        snapshot.focusedTarget !== null && !focusedRelationIds.has(relation.id)
      const gradientId =
        isActive && snapshot.relationHighlightMode === 'gradient'
          ? getExportRelationGradientId(relation.id)
          : null

      return `<path data-relation-id="${escapeHtml(relation.id)}" data-line-style="${escapeHtml(snapshot.relationLineStyle)}" d="${escapeHtml(
        getExportRelationPath(snapshot, relation),
      )}" fill="none" stroke="${gradientId ? `url(#${gradientId})` : isActive ? colors.relationSource : colors.relationLine}" stroke-width="${isActive ? '2.5' : '1.5'}" stroke-linecap="round" stroke-linejoin="round" opacity="${isDimmed ? '.28' : '1'}" />`
    }),
    '</g>',
    ...snapshot.diagram.tables.map((table) => {
      const isNodeActive = isTableNodeActive(snapshot.focusedTarget, table.id)
      const isNodeConnected = focusedTableIds.has(table.id)
      const isNodeDimmed = snapshot.focusedTarget !== null && !isNodeConnected
      const isHeaderActive = isTableHeaderActive(
        snapshot.focusedTarget,
        table.id,
      )
      const tableX = table.position.x - snapshot.bounds.x
      const tableY = table.position.y - snapshot.bounds.y
      const tableClipId = getExportSvgScopedId(snapshot, `table-${table.id}`)
      const nameClipId = getExportSvgScopedId(
        snapshot,
        `table-name-${table.id}`,
      )
      const schemaClipId = getExportSvgScopedId(
        snapshot,
        `table-schema-${table.id}`,
      )

      return [
        '<g',
        ` data-table-id="${escapeHtml(table.id)}"`,
        ` transform="translate(${formatNumber(tableX)} ${formatNumber(tableY)})"`,
        ` opacity="${isNodeDimmed ? '.62' : '1'}"`,
        '>',
        '<defs>',
        `<clipPath id="${tableClipId}"><rect width="${formatNumber(table.size.width)}" height="${formatNumber(table.size.height)}" rx="8" ry="8" /></clipPath>`,
        `<clipPath id="${nameClipId}"><rect x="14" y="0" width="${formatNumber(Math.max(1, table.schemaName !== 'public' ? table.size.width - 128 : table.size.width - 28))}" height="${EXPORT_TABLE_HEADER_HEIGHT}" /></clipPath>`,
        `<clipPath id="${schemaClipId}"><rect x="${formatNumber(Math.max(14, table.size.width - 104))}" y="0" width="90" height="${EXPORT_TABLE_HEADER_HEIGHT}" /></clipPath>`,
        '</defs>',
        isNodeActive
          ? `<rect x="-2" y="-2" width="${formatNumber(table.size.width + 4)}" height="${formatNumber(table.size.height + 4)}" rx="10" ry="10" fill="none" stroke="${colors.tableActiveRing}" stroke-width="4" />`
          : '',
        `<rect width="${formatNumber(table.size.width)}" height="${formatNumber(table.size.height)}" rx="8" ry="8" fill="${colors.panelBg}" stroke="${isNodeActive ? colors.tableActiveAccent : colors.tableBorder}" filter="url(#${isNodeActive ? activeShadowFilterId : shadowFilterId})" />`,
        `<g clip-path="url(#${tableClipId})">`,
        `<rect width="${formatNumber(table.size.width)}" height="${EXPORT_TABLE_HEADER_HEIGHT}" fill="${isHeaderActive ? colors.tableHeaderActiveBg : colors.tableHeaderBg}" />`,
        `<line x1="0" y1="${EXPORT_TABLE_HEADER_HEIGHT}" x2="${formatNumber(table.size.width)}" y2="${EXPORT_TABLE_HEADER_HEIGHT}" stroke="${colors.border}" />`,
        `<text x="14" y="27" clip-path="url(#${nameClipId})" fill="${colors.title}" font-family="${EXPORT_SVG_TEXT_FONT}" font-size="13" font-weight="800">${escapeHtml(table.name)}</text>`,
        table.schemaName !== 'public'
          ? `<text x="${formatNumber(table.size.width - 14)}" y="27" clip-path="url(#${schemaClipId})" fill="${colors.tableHeaderMuted}" font-family="${EXPORT_SVG_TEXT_FONT}" font-size="12" text-anchor="end">${escapeHtml(table.schemaName)}</text>`
          : '',
        ...table.columns.map((column, columnIndex) => {
          const rowY =
            EXPORT_TABLE_HEADER_HEIGHT + columnIndex * EXPORT_COLUMN_HEIGHT
          const rowBottomY = rowY + EXPORT_COLUMN_HEIGHT
          const isColumnSelected = isColumnActive(
            snapshot.focusedTarget,
            column.id,
          )
          const isSourceColumn = sourceColumnIds.has(column.id)
          const isReferenceColumn = referenceColumnIds.has(column.id)
          const activeFill = isSourceColumn
            ? colors.sourceBg
            : isColumnSelected || isReferenceColumn
              ? colors.referenceBg
              : colors.panelBg
          const activeAccent = isSourceColumn
            ? colors.sourceAccent
            : isColumnSelected || isReferenceColumn
              ? colors.referenceAccent
              : null
          const columnNameClipId = getExportSvgScopedId(
            snapshot,
            `column-name-${column.id}`,
          )
          const columnTypeClipId = getExportSvgScopedId(
            snapshot,
            `column-type-${column.id}`,
          )
          const typeWidth = Math.min(96, Math.max(54, table.size.width * 0.36))
          const nameWidth = Math.max(1, table.size.width - typeWidth - 32)
          const badgeX = Math.min(
            table.size.width - typeWidth - 44,
            14 + column.name.length * 7.1 + 8,
          )

          return [
            `<defs><clipPath id="${columnNameClipId}"><rect x="12" y="${formatNumber(rowY)}" width="${formatNumber(nameWidth)}" height="${EXPORT_COLUMN_HEIGHT}" /></clipPath><clipPath id="${columnTypeClipId}"><rect x="${formatNumber(table.size.width - typeWidth - 12)}" y="${formatNumber(rowY)}" width="${formatNumber(typeWidth)}" height="${EXPORT_COLUMN_HEIGHT}" /></clipPath></defs>`,
            `<rect x="0" y="${formatNumber(rowY)}" width="${formatNumber(table.size.width)}" height="${EXPORT_COLUMN_HEIGHT}" fill="${activeFill}" />`,
            activeAccent
              ? `<rect x="0" y="${formatNumber(rowY)}" width="3" height="${EXPORT_COLUMN_HEIGHT}" fill="${activeAccent}" />`
              : '',
            `<line x1="0" y1="${formatNumber(rowBottomY)}" x2="${formatNumber(table.size.width)}" y2="${formatNumber(rowBottomY)}" stroke="${colors.columnBorder}" />`,
            `<text x="12" y="${formatNumber(rowY + 20)}" clip-path="url(#${columnNameClipId})" fill="${isColumnSelected || isSourceColumn || isReferenceColumn ? colors.textStrong : colors.text}" font-family="${EXPORT_SVG_TEXT_FONT}" font-size="12" font-weight="700">${escapeHtml(column.name)}</text>`,
            column.isPrimaryKey && badgeX > 24
              ? `<g transform="translate(${formatNumber(badgeX)} ${formatNumber(rowY + 7)})"><rect width="20" height="16" rx="4" ry="4" fill="${colors.badgeBg}" /><text x="10" y="11" fill="${colors.badgeText}" font-family="${EXPORT_SVG_TEXT_FONT}" font-size="10" font-weight="800" text-anchor="middle">PK</text></g>`
              : '',
            `<text x="${formatNumber(table.size.width - 12)}" y="${formatNumber(rowY + 20)}" clip-path="url(#${columnTypeClipId})" fill="${colors.textSubtle}" font-family="${EXPORT_SVG_TEXT_FONT}" font-size="12" text-anchor="end">${escapeHtml(column.typeName)}</text>`,
          ].join('')
        }),
        '</g>',
        '</g>',
      ].join('')
    }),
    '</svg>',
  ].join('')
}

function renderDbmlDiagramExportMarkup(
  snapshot: DbmlDiagramExportSnapshot,
  { includeXmlNamespace = false }: { includeXmlNamespace?: boolean } = {},
) {
  const namespace = includeXmlNamespace
    ? ' xmlns="http://www.w3.org/1999/xhtml"'
    : ''
  const colors = EDITOR_THEME_COLOR_TOKENS[snapshot.theme]
  const focusedRelationIds = getActiveRelationIds(
    snapshot.diagram,
    snapshot.focusedTarget,
  )
  const focusedTableIds = getActiveTableIds(
    snapshot.diagram,
    snapshot.focusedTarget,
  )
  const { sourceColumnIds, referenceColumnIds } =
    getActiveRelationEndpointColumnIds(snapshot.diagram, snapshot.focusedTarget)

  return [
    `<div${namespace} class="dbml-diagram-export" data-theme="${escapeHtml(snapshot.theme)}" data-relation-highlight-mode="${escapeHtml(snapshot.relationHighlightMode)}" style="width:${formatNumber(snapshot.bounds.width)}px;height:${formatNumber(snapshot.bounds.height)}px">`,
    `<style>${getDbmlDiagramExportCss(snapshot)}</style>`,
    '<svg class="dbml-export-relations" aria-hidden="true">',
    renderRelationGradientDefinitions(snapshot, focusedRelationIds, colors),
    ...snapshot.diagram.relations.map((relation) => {
      const isActive = focusedRelationIds.has(relation.id)
      const isDimmed =
        snapshot.focusedTarget !== null && !focusedRelationIds.has(relation.id)
      const gradientId =
        isActive && snapshot.relationHighlightMode === 'gradient'
          ? getExportRelationGradientId(relation.id)
          : null

      return `<path class="${[
        'dbml-export-relation',
        isActive ? 'dbml-export-relation-active' : '',
        isDimmed ? 'dbml-export-relation-dimmed' : '',
      ]
        .filter(Boolean)
        .join(
          ' ',
        )}" data-relation-id="${escapeHtml(relation.id)}" data-line-style="${escapeHtml(snapshot.relationLineStyle)}" d="${escapeHtml(
        getExportRelationPath(snapshot, relation),
      )}" fill="none" stroke="${gradientId ? `url(#${gradientId})` : isActive ? colors.relationSource : colors.relationLine}" />`
    }),
    '</svg>',
    ...snapshot.diagram.tables.map((table) => {
      const isNodeActive = isTableNodeActive(snapshot.focusedTarget, table.id)
      const isNodeConnected = focusedTableIds.has(table.id)
      const isNodeDimmed = snapshot.focusedTarget !== null && !isNodeConnected
      const isHeaderActive = isTableHeaderActive(
        snapshot.focusedTarget,
        table.id,
      )

      return [
        `<article class="${[
          'dbml-export-table',
          isNodeActive ? 'dbml-export-table-active' : '',
          isNodeDimmed ? 'dbml-export-table-dimmed' : '',
        ]
          .filter(Boolean)
          .join(
            ' ',
          )}" data-table-id="${escapeHtml(table.id)}" style="left:${formatNumber(
          table.position.x - snapshot.bounds.x,
        )}px;top:${formatNumber(table.position.y - snapshot.bounds.y)}px;width:${formatNumber(table.size.width)}px;height:${formatNumber(table.size.height)}px">`,
        `<header class="${[
          'dbml-export-table-header',
          isHeaderActive ? 'dbml-export-table-header-active' : '',
        ]
          .filter(Boolean)
          .join(' ')}"><span>${escapeHtml(table.name)}</span>${
          table.schemaName !== 'public'
            ? `<small>${escapeHtml(table.schemaName)}</small>`
            : ''
        }</header>`,
        '<div class="dbml-export-column-list">',
        ...table.columns.map((column) => {
          const isColumnSelected = isColumnActive(
            snapshot.focusedTarget,
            column.id,
          )
          const isSourceColumn = sourceColumnIds.has(column.id)
          const isReferenceColumn = referenceColumnIds.has(column.id)

          return `<div class="${[
            'dbml-export-column-row',
            isColumnSelected ? 'dbml-export-column-row-active' : '',
            isSourceColumn ? 'dbml-export-column-row-source' : '',
            isReferenceColumn ? 'dbml-export-column-row-reference' : '',
          ]
            .filter(Boolean)
            .join(
              ' ',
            )}" data-column-id="${escapeHtml(column.id)}"><span class="dbml-export-column-name">${escapeHtml(column.name)}${
            column.isPrimaryKey
              ? '<span class="dbml-export-column-badge">PK</span>'
              : ''
          }</span><span class="dbml-export-column-type">${escapeHtml(column.typeName)}</span></div>`
        }),
        '</div>',
        '</article>',
      ].join('')
    }),
    '</div>',
  ].join('')
}

async function captureDbmlDiagramExportPng(
  snapshot: DbmlDiagramExportSnapshot,
) {
  const svgMarkup = renderDbmlDiagramExportSvg(snapshot)
  const svgBlob = new Blob([svgMarkup], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const objectUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImage(objectUrl)
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(snapshot.bounds.width)
    canvas.height = Math.ceil(snapshot.bounds.height)

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Unable to create PNG export canvas context.')
    }

    context.drawImage(image, 0, 0)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Unable to create PNG export blob.'))
          return
        }

        resolve(blob)
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load PNG export image.'))
    image.src = source
  })
}

function renderRelationGradientDefinitions(
  snapshot: DbmlDiagramExportSnapshot,
  activeRelationIds: ReadonlySet<string>,
  colors: (typeof EDITOR_THEME_COLOR_TOKENS)[ResolvedEditorTheme],
) {
  const definitions = snapshot.diagram.relations
    .filter(
      (relation) =>
        activeRelationIds.has(relation.id) &&
        snapshot.relationHighlightMode === 'gradient',
    )
    .map((relation) => {
      const gradientId = getExportRelationGradientId(relation.id)
      const start = translatePoint(snapshot, relation.route.startPoint)
      const end = translatePoint(snapshot, relation.route.endPoint)

      return `<linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="${formatNumber(start.x)}" y1="${formatNumber(start.y)}" x2="${formatNumber(end.x)}" y2="${formatNumber(end.y)}"><stop offset="0%" stop-color="${colors.relationReference}" /><stop offset="90%" stop-color="${colors.relationSource}" /><stop offset="100%" stop-color="${colors.relationSource}" /></linearGradient>`
    })
    .join('')

  return definitions ? `<defs>${definitions}</defs>` : ''
}

function getExportRelationPath(
  snapshot: DbmlDiagramExportSnapshot,
  relation: LayoutedDbmlDiagram['relations'][number],
) {
  const start = translatePoint(snapshot, relation.route.startPoint)
  const end = translatePoint(snapshot, relation.route.endPoint)

  return getRelationPath({
    lineStyle: snapshot.relationLineStyle,
    sourceX: start.x,
    sourceY: start.y,
    sourcePosition: Position.Right,
    targetX: end.x,
    targetY: end.y,
    targetPosition: Position.Left,
  })
}

function translatePoint(
  snapshot: DbmlDiagramExportSnapshot,
  point: { x: number; y: number },
) {
  return {
    x: point.x - snapshot.bounds.x,
    y: point.y - snapshot.bounds.y,
  }
}

function getDbmlDiagramExportCss(snapshot: DbmlDiagramExportSnapshot) {
  const colors = EDITOR_THEME_COLOR_TOKENS[snapshot.theme]

  return `
*{box-sizing:border-box}
html,body{margin:0}
body{background:${colors.diagramBg}}
.dbml-diagram-export{position:relative;overflow:hidden;background:${colors.diagramBg};color:${colors.text};font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.dbml-diagram-export::before{position:absolute;inset:0;background-image:radial-gradient(${colors.diagramGridDot} 1px,transparent 1px);background-size:18px 18px;content:""}
.dbml-export-relations{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.dbml-export-relation{stroke-width:1.5}
.dbml-export-relation-active{stroke-width:2.5}
.dbml-export-relation-dimmed{opacity:.28}
.dbml-export-table{position:absolute;overflow:hidden;border:1px solid ${colors.tableBorder};border-radius:8px;background:${colors.panelBg};box-shadow:0 10px 24px ${colors.tableShadow}}
.dbml-export-table-active{border-color:${colors.tableActiveAccent};box-shadow:0 0 0 2px ${colors.tableActiveRing},0 14px 30px ${colors.tableActiveShadow}}
.dbml-export-table-dimmed{opacity:.62}
.dbml-export-table-header{display:flex;min-height:${EXPORT_TABLE_HEADER_HEIGHT}px;align-items:center;justify-content:space-between;gap:12px;padding:0 14px;border-bottom:1px solid ${colors.border};background:${colors.tableHeaderBg};color:${colors.title};font-weight:800}
.dbml-export-table-header-active{background:${colors.tableHeaderActiveBg}}
.dbml-export-table-header small{overflow:hidden;color:${colors.tableHeaderMuted};font-size:12px;text-overflow:ellipsis;white-space:nowrap}
.dbml-export-column-list{display:grid}
.dbml-export-column-row{display:grid;min-height:${EXPORT_COLUMN_HEIGHT}px;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;padding:0 12px;border-bottom:1px solid ${colors.columnBorder};color:${colors.text};font-size:12px}
.dbml-export-column-row:last-child{border-bottom:0}
.dbml-export-column-row-active,.dbml-export-column-row-reference{background:${colors.referenceBg};color:${colors.textStrong};box-shadow:inset 3px 0 0 ${colors.referenceAccent}}
.dbml-export-column-row-source{background:${colors.sourceBg};color:${colors.textStrong};box-shadow:inset 3px 0 0 ${colors.sourceAccent}}
.dbml-export-column-name,.dbml-export-column-type{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dbml-export-column-name{display:inline-flex;align-items:center;gap:6px;font-weight:700}
.dbml-export-column-type{color:${colors.textSubtle}}
.dbml-export-column-badge{display:inline-flex;align-items:center;min-height:16px;padding:0 5px;border-radius:4px;background:${colors.badgeBg};color:${colors.badgeText};font-size:10px;font-weight:800}
`.trim()
}

function getExportRelationGradientId(relationId: string) {
  return `dbml-export-relation-gradient-${relationId.replaceAll(
    /[^a-zA-Z0-9_-]/g,
    '-',
  )}`
}

function getExportSvgScopedId(snapshot: DbmlDiagramExportSnapshot, id: string) {
  return `dbml-export-svg-${snapshot.theme}-${id}`.replaceAll(
    /[^a-zA-Z0-9_-]/g,
    '-',
  )
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatNumber(value: number) {
  return Number(value.toFixed(2)).toString()
}
