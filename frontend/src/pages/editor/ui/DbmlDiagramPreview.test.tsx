import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState, type CSSProperties } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDbmlDiagram } from '../lib/create-dbml-diagram'
import { layoutDbmlDiagram } from '../lib/layout-dbml-diagram'
import { parseDbmlDocument } from '../lib/parse-dbml-document'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  type DbmlDiagramSelectionTarget,
} from '../model/dbml-diagram-selection'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import { DbmlDiagramPreview } from './DbmlDiagramPreview'

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

  it('highlights a hovered table and connected relation', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')

    fireEvent.mouseEnter(postsNode)

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'data-stroke',
      '#e05d2f',
    )

    fireEvent.mouseLeave(postsNode)

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'false',
    )
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
    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'data-stroke',
      '#e05d2f',
    )
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

  it('highlights a hovered column and connected relation', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')

    fireEvent.mouseEnter(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'data-stroke',
      '#e05d2f',
    )

    fireEvent.mouseLeave(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'false')
  })

  it('keeps column focus after the pointer leaves', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')

    fireEvent.click(userIdColumn)
    fireEvent.mouseLeave(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'data-stroke',
      '#e05d2f',
    )
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

  return (
    <DbmlDiagramPreview
      activeRelationIds={getActiveRelationIds(diagram, activeTarget)}
      activeTarget={activeTarget}
      diagram={diagram}
      isPending={false}
      isPaused={false}
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

function getColumnRow(columnName: string) {
  const row = screen.getByText(columnName).closest('div')

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
