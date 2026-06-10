import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EditorPage } from './EditorPage'

const monacoEditor = vi.hoisted(() => ({
  focus: vi.fn(),
  getModel: vi.fn(() => ({})),
  revealRangeInCenter: vi.fn(),
  revealPositionInCenter: vi.fn(),
  setSelection: vi.fn(),
  setPosition: vi.fn(),
}))

const monacoApi = vi.hoisted(() => ({
  editor: {
    setModelMarkers: vi.fn(),
  },
  MarkerSeverity: {
    Error: 8,
    Warning: 4,
  },
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    onChange,
    onMount,
  }: {
    value: string
    onChange: (value?: string) => void
    onMount?: (editor: typeof monacoEditor, monaco: typeof monacoApi) => void
  }) => (
    onMount?.(monacoEditor, monacoApi),
    (
      <textarea
        aria-label="DBML editor"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    )
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
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPaneClick,
  }: {
    children: React.ReactNode
    nodeTypes: Record<string, React.ComponentType<{ data: unknown }>>
    nodes: Array<{ id: string; type?: string; data: unknown }>
    onNodeClick?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown },
    ) => void
    onNodeMouseEnter?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown },
    ) => void
    onNodeMouseLeave?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown },
    ) => void
    onPaneClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  }) => (
    <div aria-label="Diagram canvas">
      <div
        data-testid="diagram-pane"
        onClick={(event) => onPaneClick?.(event)}
      />
      {nodes.map((node) => {
        const NodeComponent = nodeTypes[node.type ?? '']

        return NodeComponent ? (
          <div
            data-testid={`diagram-node-${node.id}`}
            key={node.id}
            onClick={(event) => onNodeClick?.(event, node)}
            onMouseEnter={(event) => onNodeMouseEnter?.(event, node)}
            onMouseLeave={(event) => onNodeMouseLeave?.(event, node)}
          >
            <NodeComponent data={node.data} />
          </div>
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
    monacoEditor.focus.mockClear()
    monacoEditor.getModel.mockClear()
    monacoEditor.revealRangeInCenter.mockClear()
    monacoEditor.revealPositionInCenter.mockClear()
    monacoEditor.setSelection.mockClear()
    monacoEditor.setPosition.mockClear()
    monacoApi.editor.setModelMarkers.mockClear()
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

  it('moves the editor cursor when a diagram table is focused', async () => {
    render(<EditorPage isEditorDevMode={false} />)

    fireEvent.click(
      await screen.findByTestId('diagram-node-table:public.users'),
    )

    expectEditorRangeCall(monacoEditor.setSelection)
    expectEditorRangeCall(monacoEditor.revealRangeInCenter)
    expect(monacoEditor.setPosition).not.toHaveBeenCalled()
    expect(monacoEditor.focus).toHaveBeenCalled()
  })

  it('clears diagram focus when the empty diagram pane is clicked', async () => {
    render(<EditorPage isEditorDevMode={false} />)

    fireEvent.click(
      await screen.findByTestId('diagram-node-table:public.users'),
    )

    expect(screen.getByText('users').closest('article')).toHaveAttribute(
      'data-active',
      'true',
    )

    fireEvent.click(screen.getByTestId('diagram-pane'))

    expect(screen.getByText('users').closest('article')).toHaveAttribute(
      'data-active',
      'false',
    )
  })

  it('moves the editor cursor when a diagram column is focused', async () => {
    render(<EditorPage isEditorDevMode={false} />)

    const emailColumn = await screen.findByText('email')
    const columnRow = emailColumn.closest('div')

    if (!columnRow) {
      throw new Error('Expected email column to render inside a diagram row.')
    }

    fireEvent.click(columnRow)

    expectEditorRangeCall(monacoEditor.setSelection)
    expectEditorRangeCall(monacoEditor.revealRangeInCenter)
    expect(monacoEditor.setPosition).not.toHaveBeenCalled()
    expect(monacoEditor.focus).toHaveBeenCalled()
  })
})

function expectEditorRangeCall(callback: typeof monacoEditor.setSelection) {
  const lastCall = callback.mock.lastCall as [unknown] | undefined
  const range = lastCall?.[0]

  if (!isEditorRange(range)) {
    throw new Error('Expected editor range callback to receive a range.')
  }

  expect(range.startLineNumber).toBeGreaterThan(0)
  expect(range.startColumn).toBeGreaterThan(0)
  expect(range.endLineNumber).toBeGreaterThan(0)
  expect(range.endColumn).toBeGreaterThan(0)
}

function isEditorRange(value: unknown): value is {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'startLineNumber' in value &&
    'startColumn' in value &&
    'endLineNumber' in value &&
    'endColumn' in value &&
    typeof value.startLineNumber === 'number' &&
    typeof value.startColumn === 'number' &&
    typeof value.endLineNumber === 'number' &&
    typeof value.endColumn === 'number'
  )
}
