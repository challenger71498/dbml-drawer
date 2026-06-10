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

  it('shows development inspector activity controls when editor dev mode is enabled', () => {
    render(<EditorPage isEditorDevMode />)

    expect(
      screen.getByRole('button', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'DBML presets' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
  })

  it('opens diagnostics and presets through inspector activities', async () => {
    render(<EditorPage isEditorDevMode />)

    fireEvent.click(screen.getByRole('button', { name: 'Diagnostics' }))

    expect(
      await screen.findByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'DBML presets' }))

    expect(await screen.findByLabelText('DBML preset')).toBeInTheDocument()
    expect(screen.getByText('Simple')).toBeInTheDocument()
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Very complex')).toBeInTheDocument()
  })

  it('hides development diagnostics and preset controls when editor dev mode is disabled', () => {
    render(<EditorPage isEditorDevMode={false} />)

    expect(
      screen.queryByRole('button', { name: 'Diagnostics' }),
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

  it('collapses and expands the active inspector activity', async () => {
    render(<EditorPage isEditorDevMode />)

    const diagnosticsButton = screen.getByRole('button', {
      name: 'Diagnostics',
    })

    expect(diagnosticsButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(diagnosticsButton)

    expect(
      await screen.findByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(diagnosticsButton).toHaveAttribute('aria-expanded', 'true')
    expect(diagnosticsButton).toHaveAttribute('aria-pressed', 'true')

    diagnosticsButton.focus()
    fireEvent.click(diagnosticsButton)

    expect(
      screen.queryByRole('heading', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
    expect(diagnosticsButton).toHaveAttribute('aria-expanded', 'false')
    expect(diagnosticsButton).toHaveAttribute('aria-pressed', 'false')
    expect(diagnosticsButton).not.toHaveFocus()

    fireEvent.click(diagnosticsButton)

    expect(
      screen.getByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(diagnosticsButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the inspector sidebar from the active panel', async () => {
    render(<EditorPage isEditorDevMode />)

    fireEvent.click(screen.getByRole('button', { name: 'Diagnostics' }))

    expect(
      await screen.findByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()

    const closeButton = screen.getByRole('button', { name: 'Close inspector' })

    closeButton.focus()
    fireEvent.click(closeButton)

    expect(
      screen.queryByRole('heading', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
    expect(closeButton).not.toHaveFocus()
    expect(screen.getByRole('button', { name: 'Diagnostics' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('replaces the editor document when a development preset is selected', async () => {
    render(<EditorPage isEditorDevMode />)

    const editor = screen.getByLabelText('DBML editor')

    if (!(editor instanceof HTMLTextAreaElement)) {
      throw new Error('Expected DBML editor to render as a textarea in tests.')
    }

    expect(editor.value).toContain('Project dbml_drawer')

    fireEvent.click(screen.getByRole('button', { name: 'DBML presets' }))

    fireEvent.change(await screen.findByLabelText('DBML preset'), {
      target: { value: 'very-complex' },
    })

    expect(editor.value).toContain('Project operations')
    expect(editor.value).toContain('Table deployment_steps')
  })
})
