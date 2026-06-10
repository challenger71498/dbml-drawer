import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDbmlDiagram } from '../lib/create-dbml-diagram'
import { layoutDbmlDiagram } from '../lib/layout-dbml-diagram'
import { parseDbmlDocument } from '../lib/parse-dbml-document'
import { DbmlDiagramPreview } from './DbmlDiagramPreview'

const reactFlowProps = vi.hoisted(() => ({
  capture: vi.fn(),
}))

vi.mock('@xyflow/react', () => ({
  Background: () => <div data-testid="diagram-background" />,
  BaseEdge: ({ path }: { path: string }) => (
    <path data-testid="diagram-edge" d={path} />
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
    edges: Array<{ id: string; type?: string; data: unknown }>
    nodeTypes: Record<string, React.ComponentType<{ data: unknown }>>
    nodes: Array<{ id: string; type?: string; data: unknown }>
    [key: string]: unknown
  }) => (
    reactFlowProps.capture(props),
    (
      <div aria-label="Diagram canvas">
        {nodes.map((node) => {
          const NodeComponent = nodeTypes[node.type ?? '']

          return NodeComponent ? (
            <NodeComponent data={node.data} key={node.id} />
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
    fitView: vi.fn(),
  }),
}))

const SOURCE = `Table users {
  id integer [pk]
}
`

describe('DbmlDiagramPreview', () => {
  afterEach(() => {
    cleanup()
    reactFlowProps.capture.mockClear()
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
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('renders relation edges with bezier paths', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(`Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
}
`),
    )
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
    const diagram = createDbmlDiagram(
      parseDbmlDocument(`Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
}
`),
    )
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
