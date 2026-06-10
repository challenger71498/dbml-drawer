import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDbmlDiagram } from '../lib/create-dbml-diagram'
import { layoutDbmlDiagram } from '../lib/layout-dbml-diagram'
import { parseDbmlDocument } from '../lib/parse-dbml-document'
import { DbmlDiagramPreview } from './DbmlDiagramPreview'

vi.mock('@xyflow/react', () => ({
  Background: () => <div data-testid="diagram-background" />,
  BaseEdge: ({ path }: { path: string }) => (
    <path data-testid="diagram-edge" d={path} />
  ),
  Controls: () => <div data-testid="diagram-controls" />,
  Handle: ({ id }: { id: string }) => <span data-handle-id={id} />,
  Position: {
    Left: 'left',
    Right: 'right',
  },
  ReactFlow: ({
    children,
    nodeTypes,
    nodes,
  }: {
    children: React.ReactNode
    nodeTypes: Record<string, React.ComponentType<{ data: unknown }>>
    nodes: Array<{ id: string; type?: string; data: unknown }>
  }) => (
    <div aria-label="Diagram canvas">
      {nodes.map((node) => {
        const NodeComponent = nodeTypes[node.type ?? '']

        return NodeComponent ? (
          <NodeComponent data={node.data} key={node.id} />
        ) : null
      })}
      {children}
    </div>
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
})
