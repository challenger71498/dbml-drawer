import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { Position } from '@xyflow/react'
import { useState, type CSSProperties } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDbmlDiagram } from '../lib/create-dbml-diagram'
import { layoutDbmlDiagram } from '../lib/layout-dbml-diagram'
import { parseDbmlDocument } from '../lib/parse-dbml-document'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  getActiveTableIds,
  getRelationEndpointColumnIdsForTargets,
  type DbmlDiagramSelectionTarget,
} from '../model/dbml-diagram-selection'
import {
  DBML_RELATION_REFERENCE_COLOR,
  DBML_RELATION_SOURCE_COLOR,
} from '../model/dbml-diagram-rendering'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import { DbmlDiagramSelectionViewProvider } from './DbmlDiagramSelectionViewProvider'
import { DbmlDiagramPreview } from './DbmlDiagramPreview'
import { DbmlRelationEdge } from './DbmlRelationEdge'

const reactFlowProps = vi.hoisted(() => ({
  capture: vi.fn(),
  fitView: vi.fn(),
}))

vi.mock('@xyflow/react', () => ({
  Background: () => <div data-testid="diagram-background" />,
  BaseEdge: ({ path, style }: { path: string; style?: CSSProperties }) => (
    <path
      data-testid="diagram-edge"
      d={path}
      data-opacity={String(style?.opacity ?? '')}
      data-stroke={String(style?.stroke ?? '')}
      data-stroke-dasharray={String(style?.strokeDasharray ?? '')}
      data-stroke-linecap={String(style?.strokeLinecap ?? '')}
      data-stroke-width={String(style?.strokeWidth ?? '')}
    />
  ),
  Controls: () => <div data-testid="diagram-controls" />,
  getBezierPath: ({
    sourceX,
    sourceY,
    targetX,
    targetY,
  }: {
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
  }) => [
    `M ${sourceX} ${sourceY} C 48 ${sourceY} 72 ${targetY} ${targetX} ${targetY}`,
  ],
  Handle: ({ id }: { id: string }) => <span data-handle-id={id} />,
  Position: {
    Left: 'left',
    Right: 'right',
  },
  ReactFlow: ({
    children,
    nodeTypes,
    nodes,
    edgeTypes,
    edges,
    ...props
  }: {
    children: React.ReactNode
    edgeTypes: Record<string, React.ComponentType<Record<string, unknown>>>
    edges: Array<{ id: string; type?: string; data: unknown; zIndex?: number }>
    nodeTypes: Record<string, React.ComponentType<{ data: unknown }>>
    onNodeClick?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown; zIndex?: number },
    ) => void
    onNodeMouseEnter?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown; zIndex?: number },
    ) => void
    onNodeMouseLeave?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown; zIndex?: number },
    ) => void
    onPaneClick?: (event: React.MouseEvent<HTMLDivElement>) => void
    nodes: Array<{
      id: string
      className?: string
      type?: string
      data: unknown
      zIndex?: number
    }>
    [key: string]: unknown
  }) => (
    reactFlowProps.capture({ ...props, edges, nodes }),
    (
      <div aria-label="Diagram canvas">
        <div
          data-testid="diagram-pane"
          onClick={(event) => props.onPaneClick?.(event)}
        />
        {nodes.map((node) => {
          const NodeComponent = nodeTypes[node.type ?? '']

          return NodeComponent ? (
            <div
              className={node.className}
              data-testid={`diagram-node-${node.id}`}
              data-node-id={node.id}
              data-z-index={String(node.zIndex ?? 0)}
              key={node.id}
              onClick={(event) => props.onNodeClick?.(event, node)}
              onMouseEnter={(event) => props.onNodeMouseEnter?.(event, node)}
              onMouseLeave={(event) => props.onNodeMouseLeave?.(event, node)}
            >
              <NodeComponent data={node.data} />
            </div>
          ) : null
        })}
        <svg data-testid="diagram-edges">
          {edges.map((edge) => {
            const EdgeComponent = edgeTypes[edge.type ?? '']

            return EdgeComponent ? (
              <EdgeComponent
                data={edge.data}
                key={edge.id}
                markerEnd="url(#arrow)"
                sourcePosition="right"
                sourceX={0}
                sourceY={20}
                targetPosition="left"
                targetX={120}
                targetY={80}
              />
            ) : null
          })}
        </svg>
        {children}
      </div>
    )
  ),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  useReactFlow: () => ({
    fitView: reactFlowProps.fitView,
  }),
}))

const SOURCE = `Table users {
  id integer [pk]
}
`

const RELATION_SOURCE = `Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
}
`

const REFERENCE_FOCUS_SOURCE = `Table posts {
  id integer [pk]
}

Table comments {
  id integer [pk]
  post_id integer [ref: > posts.id]
}
`

const ISOLATED_RELATION_SOURCE = `Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
}

Table teams {
  id integer [pk]
}

Table memberships {
  id integer [pk]
  team_id integer [ref: > teams.id]
}
`

describe('DbmlDiagramPreview', () => {
  afterEach(() => {
    cleanup()
    reactFlowProps.capture.mockClear()
    reactFlowProps.fitView.mockClear()
  })

  it('renders tables and columns for a layouted diagram', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Diagram' })).toBeInTheDocument()
    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('users').closest('article')).not.toHaveClass(
      'nodrag',
      'nopan',
    )
    expect(
      screen.getByTestId('diagram-node-table:public.users'),
    ).not.toHaveClass('nodrag', 'nopan')
    expect(getColumnRow('id')).toHaveClass('nodrag', 'nopan')
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('renders relation edges with bezier paths', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' C '),
    )
  })

  it('switches relation edge line styles', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByRole('button', { name: 'Bezier' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Step' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' L '),
    )
    expect(screen.getByRole('button', { name: 'Step' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rounded' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' Q '),
    )
    expect(screen.getByRole('button', { name: 'Rounded' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('keeps active relation gradients when switching line styles', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))

    fireEvent.click(screen.getByRole('button', { name: 'Step' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' L '),
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))

    fireEvent.click(screen.getByRole('button', { name: 'Rounded' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' Q '),
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
  })

  it('switches active relation highlight modes', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    expect(screen.getByRole('button', { name: 'Gradient' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))

    fireEvent.click(screen.getByRole('button', { name: 'Solid' }))

    expect(screen.getByRole('button', { name: 'Solid' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'data-stroke',
      DBML_RELATION_REFERENCE_COLOR,
    )
    expect(
      screen.queryByTestId('relation-edge-gradient'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dynamic' }))

    expect(screen.getByRole('button', { name: 'Dynamic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expectDynamicEdge(screen.getByTestId('diagram-edge'))
  })

  it('keeps dynamic dot speed consistent across relation lengths', () => {
    const shortEdge = renderDynamicRelationEdge({
      relationId: 'relation:short',
      targetX: 60,
    })
    const shortDots = screen.getAllByTestId('relation-edge-flow-dot')
    const shortAnimation = screen.getAllByTestId(
      'relation-edge-flow-animation',
    )[0]

    expect(shortDots).toHaveLength(1)
    expect(shortDots[0].tagName.toLowerCase()).toBe('circle')
    expect(shortAnimation).toHaveAttribute('dur', '0.5s')

    shortEdge.unmount()

    renderDynamicRelationEdge({
      relationId: 'relation:long',
      targetX: 240,
    })

    const longDots = screen.getAllByTestId('relation-edge-flow-dot')
    const longAnimation = screen.getAllByTestId(
      'relation-edge-flow-animation',
    )[0]

    expect(longDots).toHaveLength(3)
    expect(longAnimation).toHaveAttribute('dur', '2s')
  })

  it('highlights a hovered relation without changing table state', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')

    fireEvent.mouseEnter(postsNode)

    expect(getTableArticle('posts')).toHaveAttribute('data-active', 'false')
    expect(getTableArticle('posts')).toHaveAttribute('data-connected', 'false')
    expect(getTableArticle('users')).toHaveAttribute('data-connected', 'false')
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expect(screen.getByTestId('diagram-edge').closest('g')).toHaveAttribute(
      'data-relation-edge-active',
      'true',
    )
    expect(screen.getByTestId('diagram-edge').closest('g')).toHaveAttribute(
      'data-relation-edge-dimmed',
      'false',
    )

    fireEvent.mouseLeave(postsNode)

    expect(getTableArticle('posts')).toHaveAttribute('data-active', 'false')
  })

  it('dims only tables and relations unrelated to the focused table', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(ISOLATED_RELATION_SOURCE),
    )
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    expect(getTableArticle('posts')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('users')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('teams')).toHaveAttribute('data-dimmed', 'true')
    expect(getTableArticle('memberships')).toHaveAttribute(
      'data-dimmed',
      'true',
    )
    const edges = screen.getAllByTestId('diagram-edge')

    expect(
      edges.some((edge) => isGradientStroke(edge.getAttribute('data-stroke'))),
    ).toBe(true)
    expect(
      edges.some((edge) => edge.getAttribute('data-opacity') === '0.28'),
    ).toBe(true)
    expect(
      edges.some(
        (edge) =>
          edge.closest('g')?.getAttribute('data-relation-edge-active') ===
          'true',
      ),
    ).toBe(true)
    expect(
      edges.some(
        (edge) =>
          edge.closest('g')?.getAttribute('data-relation-edge-dimmed') ===
          'true',
      ),
    ).toBe(true)
  })

  it('keeps table focus after the pointer leaves', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')

    fireEvent.click(postsNode)
    fireEvent.mouseLeave(postsNode)

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'true',
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
  })

  it('clears focused table selection when the diagram pane is clicked', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')

    fireEvent.click(postsNode)

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'true',
    )

    fireEvent.click(screen.getByTestId('diagram-pane'))

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'false',
    )
  })

  it('does not refit the viewport when diagram selection changes', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    await waitFor(() => expect(reactFlowProps.fitView).toHaveBeenCalled())
    reactFlowProps.fitView.mockClear()

    fireEvent.mouseEnter(screen.getByTestId('diagram-node-table:public.posts'))
    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))
    fireEvent.mouseLeave(screen.getByTestId('diagram-node-table:public.posts'))

    expect(reactFlowProps.fitView).not.toHaveBeenCalled()
  })

  it('keeps base flow elements stable when diagram selection changes', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const initialProps = getCapturedReactFlowProps()

    fireEvent.mouseEnter(screen.getByTestId('diagram-node-table:public.posts'))

    const hoverProps = getCapturedReactFlowProps()

    expect(hoverProps.nodes).toBe(initialProps.nodes)
    expect(hoverProps.edges).toBe(initialProps.edges)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const focusProps = getCapturedReactFlowProps()

    expect(focusProps.nodes).toBe(initialProps.nodes)
    expect(focusProps.edges).toBe(initialProps.edges)
  })

  it('highlights a hovered column relation without changing column state', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')

    fireEvent.mouseEnter(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'false')
    expect(userIdColumn).toHaveAttribute('data-source', 'false')
    expect(userIdColumn).toHaveAttribute('data-reference', 'true')
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expect(getColumnRow('id', 'users')).toHaveAttribute('data-source', 'true')
    expect(getColumnRow('id', 'users')).toHaveAttribute(
      'data-reference',
      'false',
    )

    fireEvent.mouseLeave(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'false')
    expect(getColumnRow('id', 'users')).toHaveAttribute(
      'data-reference',
      'false',
    )
  })

  it('keeps both endpoint tables visible when a relation column is focused', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(ISOLATED_RELATION_SOURCE),
    )
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(getColumnRow('user_id'))

    expect(getTableArticle('posts')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('users')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('teams')).toHaveAttribute('data-dimmed', 'true')
  })

  it('restores table hover when the pointer leaves a column inside the same table', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')
    const userIdColumn = getColumnRow('user_id')

    fireEvent.mouseEnter(postsNode)
    fireEvent.mouseEnter(userIdColumn)
    fireEvent.mouseLeave(userIdColumn, {
      relatedTarget: getTableHeader('posts'),
    })

    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
  })

  it('keeps column focus after the pointer leaves', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')

    fireEvent.click(userIdColumn)
    fireEvent.mouseLeave(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(userIdColumn).toHaveAttribute('data-source', 'false')
    expect(userIdColumn).toHaveAttribute('data-reference', 'true')
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expect(getColumnRow('id', 'users')).toHaveAttribute('data-source', 'true')
    expect(getColumnRow('id', 'users')).toHaveAttribute(
      'data-reference',
      'false',
    )
  })

  it('highlights a focused source column with the source color role', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(REFERENCE_FOCUS_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postIdColumn = getColumnRow('id', 'posts')
    const commentPostIdColumn = getColumnRow('post_id')

    fireEvent.click(postIdColumn)

    expect(postIdColumn).toHaveAttribute('data-active', 'true')
    expect(postIdColumn).toHaveAttribute('data-source', 'true')
    expect(postIdColumn).toHaveAttribute('data-reference', 'false')
    expect(commentPostIdColumn).toHaveAttribute('data-source', 'false')
    expect(commentPostIdColumn).toHaveAttribute('data-reference', 'true')
  })

  it('keeps focused reference column role while another column is hovered', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')
    const unrelatedPostIdColumn = getColumnRow('id', 'posts')

    fireEvent.click(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(userIdColumn).toHaveAttribute('data-reference', 'true')

    fireEvent.mouseEnter(unrelatedPostIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(userIdColumn).toHaveAttribute('data-source', 'false')
    expect(userIdColumn).toHaveAttribute('data-reference', 'true')
  })

  it('shows a paused state while keeping the last valid diagram', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused
      />,
    )

    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('Preview paused: invalid DBML')).toBeInTheDocument()
  })

  it('shows an empty diagram state', () => {
    render(
      <DbmlDiagramPreview
        diagram={{ tables: [], relations: [] }}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByText('No renderable tables')).toBeInTheDocument()
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })

  it('disables React Flow keyboard shortcuts so editor typing is not intercepted', () => {
    render(
      <DbmlDiagramPreview
        diagram={{ tables: [], relations: [] }}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(reactFlowProps.capture).toHaveBeenCalledWith(
      expect.objectContaining({
        deleteKeyCode: null,
        selectionKeyCode: null,
        multiSelectionKeyCode: null,
        panActivationKeyCode: null,
        zoomActivationKeyCode: null,
      }),
    )
  })
})

function InteractivePreviewHarness({
  diagram,
}: {
  diagram: LayoutedDbmlDiagram
}) {
  const [hoveredTarget, setHoveredTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const [focusedTarget, setFocusedTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const activeTarget = getActiveDiagramSelectionTarget({
    hoveredTarget,
    focusedTarget,
  })
  const activeRelationEndpointColumnIds =
    getRelationEndpointColumnIdsForTargets(diagram, [
      activeTarget,
      focusedTarget,
    ])

  return (
    <DbmlDiagramPreview
      activeRelationIds={getActiveRelationIds(diagram, activeTarget)}
      activeTarget={activeTarget}
      diagram={diagram}
      focusedTableIds={getActiveTableIds(diagram, focusedTarget)}
      focusedTarget={focusedTarget}
      isPending={false}
      isPaused={false}
      sourceColumnIds={activeRelationEndpointColumnIds.sourceColumnIds}
      referenceColumnIds={activeRelationEndpointColumnIds.referenceColumnIds}
      onColumnFocus={(column) =>
        setFocusedTarget({
          type: 'column',
          tableId: column.tableId,
          columnId: column.id,
        })
      }
      onColumnHover={setHoveredTarget}
      onFocusClear={() => {
        setHoveredTarget(null)
        setFocusedTarget(null)
      }}
      onTableFocus={(table) =>
        setFocusedTarget({
          type: 'table',
          tableId: table.id,
        })
      }
      onTableHover={setHoveredTarget}
    />
  )
}

function renderDynamicRelationEdge({
  relationId,
  targetX,
}: {
  relationId: string
  targetX: number
}) {
  return render(
    <svg>
      <DbmlDiagramSelectionViewProvider
        value={{
          activeRelationIds: new Set([relationId]),
          activeTarget: {
            type: 'column',
            tableId: 'table:public.posts',
            columnId: 'table:public.posts.column:user_id',
          },
          focusedTableIds: new Set(),
          focusedTarget: null,
          onColumnFocus: () => undefined,
          onColumnHover: () => undefined,
          referenceColumnIds: new Set(),
          sourceColumnIds: new Set(),
        }}
      >
        <DbmlRelationEdge
          animated={false}
          data={
            {
              highlightMode: 'dynamic',
              lineStyle: 'orthogonal',
              relation: {
                id: relationId,
              },
              route: {
                bendPoints: [],
                endPoint: { x: targetX, y: 20 },
                startPoint: { x: 0, y: 20 },
              },
            } as never
          }
          deletable={false}
          id={relationId}
          markerEnd=""
          selectable={false}
          selected={false}
          source="table:public.users"
          sourcePosition={Position.Right}
          sourceX={0}
          sourceY={20}
          style={{}}
          target="table:public.posts"
          targetPosition={Position.Left}
          targetX={targetX}
          targetY={20}
          type="dbmlRelation"
        />
      </DbmlDiagramSelectionViewProvider>
    </svg>,
  )
}

function getTableArticle(tableName: string) {
  const table = screen.getByText(tableName).closest('article')

  if (!table) {
    throw new Error(`Expected ${tableName} table to render in an article.`)
  }

  return table
}

function getTableHeader(tableName: string) {
  const header = getTableArticle(tableName).querySelector('header')

  if (!header) {
    throw new Error(`Expected ${tableName} table to render a header.`)
  }

  return header
}

function getColumnRow(columnName: string, tableName?: string) {
  const queryRoot = tableName ? within(getTableArticle(tableName)) : screen
  const row = queryRoot.getByText(columnName).closest('div')

  if (!row) {
    throw new Error(`Expected ${columnName} column to render in a row.`)
  }

  return row
}

function getCapturedReactFlowProps() {
  const lastCall = reactFlowProps.capture.mock.lastCall?.[0] as
    | {
        edges?: Array<{ id: string; zIndex?: number }>
        nodes?: Array<{ id: string; zIndex?: number }>
      }
    | undefined

  if (!lastCall?.nodes || !lastCall.edges) {
    throw new Error('Expected React Flow props to be captured.')
  }

  return {
    edges: lastCall.edges,
    nodes: lastCall.nodes,
  }
}

function expectActiveGradientEdge(edge: HTMLElement) {
  expect(edge.getAttribute('data-stroke')).toEqual(
    expect.stringMatching(/^url\(#dbml-relation-gradient-/),
  )

  const gradient = edge
    .closest('g')
    ?.querySelector('[data-testid="relation-edge-gradient"]')

  expect(gradient).not.toBeNull()
  expect(gradient).toHaveAttribute('x1', '0')
  expect(gradient).toHaveAttribute('y1', '20')
  expect(gradient).toHaveAttribute('x2', '120')
  expect(gradient).toHaveAttribute('y2', '80')

  const stops = gradient?.querySelectorAll('stop')

  expect(stops?.[0]).toHaveAttribute('offset', '0%')
  expect(getStopColor(stops?.[0])).toBe(DBML_RELATION_SOURCE_COLOR)
  expect(stops?.[1]).toHaveAttribute('offset', '33%')
  expect(getStopColor(stops?.[1])).toBe(DBML_RELATION_SOURCE_COLOR)
  expect(stops?.[2]).toHaveAttribute('offset', '100%')
  expect(getStopColor(stops?.[2])).toBe(DBML_RELATION_REFERENCE_COLOR)
}

function expectDynamicEdge(edge: HTMLElement) {
  expect(edge).toHaveAttribute('data-stroke-dasharray', '')
  expect(edge).toHaveAttribute('data-stroke-linecap', '')

  const dots = edge
    .closest('g')
    ?.querySelectorAll('[data-testid="relation-edge-flow-dot"]')
  const fillAnimations = edge
    .closest('g')
    ?.querySelectorAll('[data-testid="relation-edge-flow-fill-animation"]')
  const animations = edge.closest('g')?.querySelectorAll('animateMotion')

  expect(dots).toHaveLength(2)
  expect(fillAnimations).toHaveLength(2)
  expect(animations).toHaveLength(2)
  expect(dots?.[0]).toHaveAttribute('fill', DBML_RELATION_REFERENCE_COLOR)
  expect(dots?.[0]).toHaveAttribute('cx', '0')
  expect(dots?.[0]).toHaveAttribute('cy', '0')
  expect(dots?.[0]).toHaveAttribute('r', '3.2')
  expect(animations?.[0]).toHaveAttribute('begin', '0s')
  expect(animations?.[1]).toHaveAttribute('begin', '-0.57s')
  expect(animations?.[0]).toHaveAttribute('dur', '1.14s')
  expect(animations?.[0]).toHaveAttribute('keyPoints', '1;0')
  expect(animations?.[0]).toHaveAttribute('keyTimes', '0;1')
  expect(animations?.[0]).toHaveAttribute('path', edge.getAttribute('d'))
  expect(animations?.[0]).not.toHaveAttribute('rotate')
  expect(fillAnimations?.[0]).toHaveAttribute('begin', '0s')
  expect(fillAnimations?.[1]).toHaveAttribute('begin', '-0.57s')
  expect(fillAnimations?.[0]).toHaveAttribute('dur', '1.14s')
  expect(fillAnimations?.[0]).toHaveAttribute('keyTimes', '0;0.67;1')
  expect(fillAnimations?.[0]).toHaveAttribute(
    'values',
    `${DBML_RELATION_REFERENCE_COLOR};${DBML_RELATION_SOURCE_COLOR};${DBML_RELATION_SOURCE_COLOR}`,
  )
}

function isGradientStroke(stroke: string | null) {
  return stroke?.startsWith('url(#dbml-relation-gradient-') ?? false
}

function getStopColor(stop: Element | undefined) {
  return stop?.getAttribute('stop-color') ?? stop?.getAttribute('stopColor')
}
