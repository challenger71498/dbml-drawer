import { describe, expect, it } from 'vitest'
import { createDbmlDiagram } from './create-dbml-diagram'
import {
  buildDbmlDiagramExportSnapshot,
  createDbmlDiagramExportFilename,
  getDbmlDiagramExportBounds,
  normalizeDbmlDiagramExportRelationHighlightMode,
  renderDbmlDiagramExportHtml,
  renderDbmlDiagramExportSvg,
} from './dbml-diagram-export'
import { layoutDbmlDiagram } from './layout-dbml-diagram'
import { parseDbmlDocument } from './parse-dbml-document'

const RELATION_SOURCE = `Project dbml_drawer {
  database_type: 'PostgreSQL'
}

Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
}
`

describe('dbml diagram export', () => {
  it('normalizes dynamic relation highlighting to gradient for export', () => {
    expect(normalizeDbmlDiagramExportRelationHighlightMode('dynamic')).toBe(
      'gradient',
    )
    expect(normalizeDbmlDiagramExportRelationHighlightMode('solid')).toBe(
      'solid',
    )
    expect(normalizeDbmlDiagramExportRelationHighlightMode('gradient')).toBe(
      'gradient',
    )
  })

  it('builds a snapshot with full bounds and optional focused target', async () => {
    const layoutedDiagram = await getLayoutedDiagram()
    const focusedTarget = {
      type: 'table',
      tableId: layoutedDiagram.tables[0]?.id ?? '',
    } as const
    const snapshot = buildDbmlDiagramExportSnapshot({
      diagram: layoutedDiagram,
      focusedTarget,
      includeSelectionHighlight: true,
      relationHighlightMode: 'dynamic',
      relationLineStyle: 'rounded-orthogonal',
      theme: 'dark',
    })
    const omittedFocusSnapshot = buildDbmlDiagramExportSnapshot({
      diagram: layoutedDiagram,
      focusedTarget,
      includeSelectionHighlight: false,
      relationHighlightMode: 'solid',
      relationLineStyle: 'bezier',
      theme: 'light',
    })

    expect(snapshot?.focusedTarget).toEqual(focusedTarget)
    expect(snapshot?.relationHighlightMode).toBe('gradient')
    expect(snapshot?.bounds.width).toBeGreaterThan(
      layoutedDiagram.tables[0]?.size.width ?? 0,
    )
    expect(omittedFocusSnapshot?.focusedTarget).toBeNull()
  })

  it('includes routed relation points when calculating export bounds', async () => {
    const layoutedDiagram = await getLayoutedDiagram()
    const firstRelation = layoutedDiagram.relations[0]

    if (!firstRelation) {
      throw new Error('Expected relation fixture to include a relation.')
    }

    const diagramWithFarBend = {
      ...layoutedDiagram,
      relations: [
        {
          ...firstRelation,
          route: {
            ...firstRelation.route,
            bendPoints: [{ x: 2000, y: 1800 }],
          },
        },
      ],
    }
    const bounds = getDbmlDiagramExportBounds(diagramWithFarBend)

    expect(bounds.width).toBeGreaterThan(1900)
    expect(bounds.height).toBeGreaterThan(1700)
  })

  it('serializes standalone HTML with theme styles and focused highlights', async () => {
    const layoutedDiagram = await getLayoutedDiagram()
    const relation = layoutedDiagram.relations[0]

    if (!relation) {
      throw new Error('Expected relation fixture to include a relation.')
    }

    const snapshot = buildDbmlDiagramExportSnapshot({
      diagram: layoutedDiagram,
      focusedTarget: {
        type: 'column',
        tableId: relation.sourceTableId,
        columnId: relation.sourceColumnId,
      },
      includeSelectionHighlight: true,
      relationHighlightMode: 'dynamic',
      relationLineStyle: 'orthogonal',
      theme: 'light-solarized',
    })

    if (!snapshot) {
      throw new Error('Expected export snapshot to be created.')
    }

    const html = renderDbmlDiagramExportHtml(snapshot)

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('users')
    expect(html).toContain('posts')
    expect(html).toContain('dbml-export-relation-active')
    expect(html).toContain('dbml-export-column-row-reference')
    expect(html).toContain('data-relation-highlight-mode="gradient"')
    expect(html).toContain('data-line-style="orthogonal"')
    expect(html).not.toContain('relation-edge-flow-dot')
    expect(html).not.toContain('var(--editor-color')
  })

  it('omits focused styling when selection highlight export is disabled', async () => {
    const layoutedDiagram = await getLayoutedDiagram()
    const snapshot = buildDbmlDiagramExportSnapshot({
      diagram: layoutedDiagram,
      focusedTarget: {
        type: 'table',
        tableId: layoutedDiagram.tables[0]?.id ?? '',
      },
      includeSelectionHighlight: false,
      relationHighlightMode: 'gradient',
      relationLineStyle: 'bezier',
      theme: 'light',
    })

    if (!snapshot) {
      throw new Error('Expected export snapshot to be created.')
    }

    const html = renderDbmlDiagramExportHtml(snapshot)

    expect(html).not.toMatch(/class="[^"]*dbml-export-table-active/)
    expect(html).not.toMatch(/class="[^"]*dbml-export-relation-active/)
    expect(html).not.toMatch(/class="[^"]*dbml-export-table-dimmed/)
  })

  it('serializes PNG source SVG without foreignObject content', async () => {
    const layoutedDiagram = await getLayoutedDiagram()
    const relation = layoutedDiagram.relations[0]

    if (!relation) {
      throw new Error('Expected relation fixture to include a relation.')
    }

    const snapshot = buildDbmlDiagramExportSnapshot({
      diagram: layoutedDiagram,
      focusedTarget: {
        type: 'column',
        tableId: relation.sourceTableId,
        columnId: relation.sourceColumnId,
      },
      includeSelectionHighlight: true,
      relationHighlightMode: 'dynamic',
      relationLineStyle: 'orthogonal',
      theme: 'dark',
    })

    if (!snapshot) {
      throw new Error('Expected export snapshot to be created.')
    }

    const svg = renderDbmlDiagramExportSvg(snapshot)

    expect(svg).toContain('<svg')
    expect(svg).toContain('data-relation-highlight-mode')
    expect(svg).toContain('users')
    expect(svg).toContain('posts')
    expect(svg).toContain('url(#dbml-export-relation-gradient-')
    expect(svg).not.toContain('<foreignObject')
    expect(svg).not.toContain('<article')
    expect(svg).not.toContain('<div')
  })

  it('creates stable export filenames', () => {
    expect(
      createDbmlDiagramExportFilename({
        format: 'png',
        projectName: 'DBML Drawer Demo',
      }),
    ).toBe('dbml-drawer-demo.png')
    expect(
      createDbmlDiagramExportFilename({
        format: 'html',
        projectName: '   ',
      }),
    ).toBe('dbml-diagram.html')
  })
})

async function getLayoutedDiagram() {
  return layoutDbmlDiagram(
    createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE)),
  )
}
