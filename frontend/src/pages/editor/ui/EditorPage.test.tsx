import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EditorPage } from './EditorPage'

vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (value?: string) => void
  }) => (
    <textarea
      aria-label="DBML editor"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  ),
}))

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

describe('EditorPage', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows development diagnostics and preset controls when editor dev mode is enabled', async () => {
    render(<EditorPage isEditorDevMode />)

    expect(
      await screen.findByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('DBML preset')).toBeInTheDocument()
    expect(screen.getByText('Simple')).toBeInTheDocument()
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Very complex')).toBeInTheDocument()
  })

  it('hides development diagnostics and preset controls when editor dev mode is disabled', () => {
    render(<EditorPage isEditorDevMode={false} />)

    expect(
      screen.queryByRole('heading', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('DBML preset')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Editor' })).toBeInTheDocument()
  })

  it('keeps validation state active when development diagnostics are hidden', () => {
    vi.useFakeTimers()
    render(<EditorPage isEditorDevMode={false} />)

    fireEvent.change(screen.getByLabelText('DBML editor'), {
      target: { value: 'Table users {' },
    })

    act(() => {
      vi.advanceTimersByTime(350)
    })

    expect(screen.getByText('Needs attention')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
  })

  it('collapses and expands the development diagnostics sidebar', async () => {
    render(<EditorPage isEditorDevMode />)

    expect(
      await screen.findByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Hide' }))

    expect(
      screen.queryByRole('heading', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Show' }))

    expect(
      screen.getByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('replaces the editor document when a development preset is selected', async () => {
    render(<EditorPage isEditorDevMode />)

    const editor = screen.getByLabelText('DBML editor')

    if (!(editor instanceof HTMLTextAreaElement)) {
      throw new Error('Expected DBML editor to render as a textarea in tests.')
    }

    expect(editor.value).toContain('Project dbml_drawer')

    fireEvent.change(await screen.findByLabelText('DBML preset'), {
      target: { value: 'very-complex' },
    })

    expect(editor.value).toContain('Project operations')
    expect(editor.value).toContain('Table deployment_steps')
  })
})
