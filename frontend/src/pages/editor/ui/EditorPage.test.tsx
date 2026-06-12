import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EDITOR_PREFERENCES_STORAGE_KEY,
  GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
  LIGHT_SOLARIZED_MONACO_THEME,
  PURE_WHITE_LIGHT_MONACO_THEME,
  resetEditorPreferencesStoreForTests,
} from '../model/editor-theme'
import { resetEditorDiagramInteractionStoreForTests } from '../model/editor-diagram-interaction-store'
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
    defineTheme: vi.fn(),
    setModelMarkers: vi.fn(),
  },
  MarkerSeverity: {
    Error: 8,
    Warning: 4,
  },
}))

const layoutAlgorithmOptions = vi.hoisted(() => [
  {
    id: 'org.eclipse.elk.layered',
    label: 'ELK Layered',
    description: 'Layered layout',
  },
  {
    id: 'org.eclipse.elk.force',
    label: 'ELK Force',
    description: 'Force layout',
  },
])

const layoutOptionControls = vi.hoisted(() => ({
  'org.eclipse.elk.layered': [
    {
      id: 'elk.direction',
      label: 'Direction',
      kind: 'select',
      defaultValue: 'RIGHT',
      choices: [
        { value: 'RIGHT', label: 'Right' },
        { value: 'DOWN', label: 'Down' },
      ],
    },
  ],
  'org.eclipse.elk.force': [
    {
      id: 'elk.force.model',
      label: 'Force model',
      kind: 'select',
      defaultValue: 'FRUCHTERMAN_REINGOLD',
      choices: [
        { value: 'FRUCHTERMAN_REINGOLD', label: 'Fruchterman Reingold' },
        { value: 'EADES', label: 'Eades' },
      ],
    },
  ],
}))

const loadDbmlLayoutAlgorithmOptions = vi.hoisted(() => vi.fn())

vi.mock('../model/dbml-layout-settings', () => ({
  DEFAULT_DBML_LAYOUT_ALGORITHM_ID: 'org.eclipse.elk.layered',
  DEFAULT_DBML_LAYOUT_ALGORITHM_OPTION: layoutAlgorithmOptions[0],
  getDbmlLayoutOptionControls: (algorithmId: string) =>
    layoutOptionControls[algorithmId as keyof typeof layoutOptionControls] ??
    [],
  getDefaultDbmlLayoutOptionValues: (algorithmId: string) =>
    Object.fromEntries(
      (
        layoutOptionControls[
          algorithmId as keyof typeof layoutOptionControls
        ] ?? []
      ).map((control) => [control.id, control.defaultValue]),
    ),
  loadDbmlLayoutAlgorithmOptions,
  normalizeDbmlLayoutOptionValues: (optionValues: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(optionValues).filter(([, value]) => value !== ''),
    ),
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    theme,
    onChange,
    onMount,
  }: {
    value: string
    theme: string
    onChange: (value?: string) => void
    onMount?: (editor: typeof monacoEditor, monaco: typeof monacoApi) => void
  }) => (
    onMount?.(monacoEditor, monacoApi),
    (
      <textarea
        aria-label="DBML editor"
        data-monaco-theme={theme}
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
    getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
    getZoom: vi.fn(() => 1),
    setCenter: vi.fn(),
  }),
  useOnViewportChange: () => undefined,
}))

describe('EditorPage', () => {
  afterEach(() => {
    cleanup()
    loadDbmlLayoutAlgorithmOptions.mockReset()
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    monacoEditor.focus.mockClear()
    monacoEditor.getModel.mockClear()
    monacoEditor.revealRangeInCenter.mockClear()
    monacoEditor.revealPositionInCenter.mockClear()
    monacoEditor.setSelection.mockClear()
    monacoEditor.setPosition.mockClear()
    monacoApi.editor.defineTheme.mockClear()
    monacoApi.editor.setModelMarkers.mockClear()
    window.localStorage?.clear()
    resetEditorPreferencesStoreForTests()
    resetEditorDiagramInteractionStoreForTests()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('shows development inspector activity controls when editor dev mode is enabled', () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode />)

    const inspector = screen.getByRole('complementary', {
      name: 'Editor inspector',
    })
    const inspectorActivityBar =
      within(inspector).getByLabelText('Editor activities')
    const diagnosticsButton = within(inspectorActivityBar).getByRole('button', {
      name: 'Diagnostics',
    })

    expect(diagnosticsButton).toHaveAttribute(
      'aria-controls',
      'editor-inspector-panel-diagnostics',
    )
    expect(diagnosticsButton).toHaveAttribute('aria-expanded', 'false')
    expect(diagnosticsButton).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'DBML presets' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Diagram settings' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
  })

  it('applies and persists the workspace theme from settings', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    const { unmount } = render(<EditorPage isEditorDevMode={false} />)

    openSettingsPanel()

    fireEvent.click(
      within(screen.getByRole('group', { name: 'Workspace theme' })).getByRole(
        'button',
        { name: 'Dark' },
      ),
    )

    const editorPage = screen.getByRole('main')
    const editor = screen.getByRole('textbox', { name: 'DBML editor' })

    expect(editorPage).toHaveAttribute('data-workspace-theme-mode', 'dark')
    expect(editorPage).toHaveAttribute('data-workspace-theme', 'dark')
    expect(editorPage).toHaveAttribute(
      'data-code-editor-theme-mode',
      'workspace',
    )
    expect(editorPage).toHaveAttribute('data-code-editor-theme', 'dark')
    expect(editor).toHaveAttribute(
      'data-monaco-theme',
      GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
    )

    unmount()
    render(<EditorPage isEditorDevMode={false} />)

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-workspace-theme-mode',
      'dark',
    )
    expect(getStoredEditorPreferences().workspaceThemeMode).toBe('dark')
  })

  it('applies the code editor theme independently from the workspace theme', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    openSettingsPanel()
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Override workspace theme' }),
    )
    fireEvent.click(
      within(
        screen.getByRole('group', { name: 'Code editor theme' }),
      ).getByRole('button', { name: 'Dark' }),
    )

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-workspace-theme',
      'light',
    )
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme-mode',
      'dark',
    )
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme',
      'dark',
    )
    expect(
      screen.getByRole('textbox', { name: 'DBML editor' }),
    ).toHaveAttribute(
      'data-monaco-theme',
      GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
    )
    expect(getStoredEditorPreferences().codeEditorThemeMode).toBe('dark')
    expect(getStoredEditorPreferences().codeEditorOverrideThemeMode).toBe(
      'dark',
    )
  })

  it('applies the solarized light theme independently from the pure white light theme', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    openSettingsPanel()
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Workspace theme' })).getByRole(
        'button',
        { name: 'Solarized' },
      ),
    )
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Override workspace theme' }),
    )
    fireEvent.click(
      within(
        screen.getByRole('group', { name: 'Code editor theme' }),
      ).getByRole('button', { name: 'Solarized' }),
    )

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-workspace-theme',
      'light-solarized',
    )
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme',
      'light-solarized',
    )
    expect(
      screen.getByRole('textbox', { name: 'DBML editor' }),
    ).toHaveAttribute('data-monaco-theme', LIGHT_SOLARIZED_MONACO_THEME)
    expect(getStoredEditorPreferences().workspaceThemeMode).toBe(
      'light-solarized',
    )
    expect(getStoredEditorPreferences().codeEditorThemeMode).toBe(
      'light-solarized',
    )
  })

  it('can resolve the code editor theme from the workspace theme', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    openSettingsPanel()
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Workspace theme' })).getByRole(
        'button',
        { name: 'Solarized' },
      ),
    )

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-workspace-theme',
      'light-solarized',
    )
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme-mode',
      'workspace',
    )
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme',
      'light-solarized',
    )
    expect(
      screen.getByRole('textbox', { name: 'DBML editor' }),
    ).toHaveAttribute('data-monaco-theme', LIGHT_SOLARIZED_MONACO_THEME)
    expect(getStoredEditorPreferences().codeEditorThemeMode).toBe('workspace')
  })

  it('preserves the explicit code editor override selection when override is disabled and re-enabled', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    openSettingsPanel()
    const overrideToggle = screen.getByRole('checkbox', {
      name: 'Override workspace theme',
    })

    fireEvent.click(overrideToggle)
    fireEvent.click(
      within(
        screen.getByRole('group', { name: 'Code editor theme' }),
      ).getByRole('button', { name: 'Dark' }),
    )

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme-mode',
      'dark',
    )

    fireEvent.click(overrideToggle)

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme-mode',
      'workspace',
    )
    expect(
      screen.queryByRole('group', { name: 'Code editor theme' }),
    ).toBeNull()

    fireEvent.click(overrideToggle)

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-code-editor-theme-mode',
      'dark',
    )
    expect(
      within(
        screen.getByRole('group', { name: 'Code editor theme' }),
      ).getByRole('button', { name: 'Dark' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies and persists the offscreen relation proxy settings from settings', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    const { unmount } = render(<EditorPage isEditorDevMode={false} />)

    openSettingsPanel()
    const proxyToggle = screen.getByRole('checkbox', {
      name: 'Show offscreen relation proxies',
    })
    const proxyLineToggle = screen.getByRole('checkbox', {
      name: 'Connect relation lines to proxies',
    })
    const proxyPlacementGroup = screen.getByRole('group', {
      name: 'Proxy placement',
    })
    const proxyVisibilityGroup = screen.getByRole('group', {
      name: 'Proxy visibility',
    })

    expect(proxyToggle).not.toBeChecked()
    expect(proxyLineToggle).not.toBeChecked()
    expect(proxyLineToggle).toBeDisabled()
    expect(
      within(proxyPlacementGroup).getByRole('button', { name: 'Line' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(proxyPlacementGroup).getByRole('button', { name: 'Parallel' }),
    ).toBeDisabled()
    expect(
      within(proxyVisibilityGroup).getByRole('button', {
        name: 'Any visible',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(proxyVisibilityGroup).getByRole('button', {
        name: 'Center visible',
      }),
    ).toBeDisabled()

    fireEvent.click(proxyToggle)
    fireEvent.click(proxyLineToggle)
    fireEvent.click(
      within(proxyPlacementGroup).getByRole('button', { name: 'Parallel' }),
    )
    fireEvent.click(
      within(proxyVisibilityGroup).getByRole('button', {
        name: 'Center visible',
      }),
    )

    expect(proxyToggle).toBeChecked()
    expect(proxyLineToggle).toBeChecked()
    expect(proxyLineToggle).not.toBeDisabled()
    expect(
      within(proxyPlacementGroup).getByRole('button', { name: 'Parallel' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(proxyVisibilityGroup).getByRole('button', {
        name: 'Center visible',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(getStoredEditorPreferences().isOffscreenRelationProxiesEnabled).toBe(
      true,
    )
    expect(
      getStoredEditorPreferences().shouldConnectOffscreenRelationProxyLines,
    ).toBe(true)
    expect(
      getStoredEditorPreferences().offscreenRelationProxyPlacementMode,
    ).toBe('parallel')
    expect(
      getStoredEditorPreferences().offscreenRelationProxyVisibilityMode,
    ).toBe('center')

    unmount()
    render(<EditorPage isEditorDevMode={false} />)
    openSettingsPanel()

    expect(
      screen.getByRole('checkbox', {
        name: 'Show offscreen relation proxies',
      }),
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', {
        name: 'Connect relation lines to proxies',
      }),
    ).toBeChecked()
    expect(
      within(screen.getByRole('group', { name: 'Proxy placement' })).getByRole(
        'button',
        { name: 'Parallel' },
      ),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(screen.getByRole('group', { name: 'Proxy visibility' })).getByRole(
        'button',
        { name: 'Center visible' },
      ),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('resolves system theme changes for workspace and code editor themes', () => {
    installLocalStorageMock()
    const mediaQuery = installMatchMediaMock(false)
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-workspace-theme',
      'light',
    )
    expect(
      screen.getByRole('textbox', { name: 'DBML editor' }),
    ).toHaveAttribute('data-monaco-theme', PURE_WHITE_LIGHT_MONACO_THEME)

    act(() => {
      mediaQuery.setMatches(true)
    })

    expect(screen.getByRole('main')).toHaveAttribute(
      'data-workspace-theme',
      'dark',
    )
    expect(
      screen.getByRole('textbox', { name: 'DBML editor' }),
    ).toHaveAttribute(
      'data-monaco-theme',
      GRUVBOX_MATERIAL_DARK_MEDIUM_MONACO_THEME,
    )
  })

  it('renders the DBML editor activity and toggles the left sidebar while keeping the diagram visible', async () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    const editorActivityBar = screen.getByRole('complementary', {
      name: 'Editor authoring activities',
    })
    const editorWorkspace = screen
      .getByRole('heading', { name: 'Editor' })
      .closest('section')
    const editorButton = within(editorActivityBar).getByRole('button', {
      name: 'DBML editor',
    })
    const editorPanel = screen.getByRole('region', { name: 'DBML editor' })

    expect(editorWorkspace).not.toContainElement(editorActivityBar)
    expect(editorWorkspace).not.toContainElement(editorPanel)
    expect(editorButton).toHaveAttribute('aria-expanded', 'true')
    expect(editorButton).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(editorActivityBar).queryByRole('button', { name: 'Settings' }),
    ).not.toBeInTheDocument()
    expect(
      within(editorPanel).getByRole('button', { name: 'Close DBML editor' }),
    ).toBeInTheDocument()
    expect(
      within(editorPanel).getByLabelText('DBML editor'),
    ).toBeInTheDocument()
    expect(
      await screen.findByLabelText('Diagram canvas', undefined, {
        timeout: 3000,
      }),
    ).toBeInTheDocument()

    fireEvent.click(editorButton)

    expect(editorButton).toHaveAttribute('aria-expanded', 'false')
    expect(editorButton).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.queryByRole('region', { name: 'DBML editor' }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Diagram canvas')).toBeInTheDocument()
  })

  it('opens settings from the right sidebar while keeping the DBML editor panel', () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    const editorButton = screen.getByRole('button', { name: 'DBML editor' })
    const settingsButton = screen.getByRole('button', { name: 'Settings' })

    fireEvent.click(settingsButton)

    expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
    expect(settingsButton).toHaveAttribute('aria-pressed', 'true')
    expect(editorButton).toHaveAttribute('aria-expanded', 'true')
    expect(editorButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('region', { name: 'Settings' })).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'DBML editor' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Override workspace theme' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Show offscreen relation proxies' }),
    ).toBeInTheDocument()

    fireEvent.click(settingsButton)

    expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('region', { name: 'Settings' }),
    ).not.toBeInTheDocument()
  })

  it('closes the DBML editor sidebar from the shared panel header', () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    const closeButton = screen.getByRole('button', {
      name: 'Close DBML editor',
    })

    closeButton.focus()
    fireEvent.click(closeButton)

    expect(
      screen.queryByRole('region', { name: 'DBML editor' }),
    ).not.toBeInTheDocument()
    expect(closeButton).not.toHaveFocus()
    expect(screen.getByRole('button', { name: 'DBML editor' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('resizes the DBML editor sidebar with drag and keyboard controls', () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    const editorSidebar = screen.getByRole('complementary', {
      name: 'Editor authoring activities',
    })
    const resizeHandle = screen.getByRole('separator', {
      name: 'Resize DBML editor',
    })

    expect(
      editorSidebar.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('480px')
    expect(resizeHandle).toHaveAttribute('aria-valuenow', '480')
    expect(resizeHandle).toHaveAttribute('aria-valuemax', '720')

    fireEvent.pointerDown(resizeHandle, {
      clientX: 400,
      pointerId: 1,
    })
    fireEvent.pointerMove(resizeHandle, {
      clientX: 520,
      pointerId: 1,
    })
    fireEvent.pointerUp(resizeHandle, {
      clientX: 520,
      pointerId: 1,
    })

    expect(
      editorSidebar.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('600px')
    expect(resizeHandle).toHaveAttribute('aria-valuenow', '600')

    fireEvent.keyDown(resizeHandle, { key: 'ArrowLeft' })

    expect(
      editorSidebar.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('576px')

    fireEvent.keyDown(resizeHandle, { key: 'Home' })

    expect(
      editorSidebar.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('320px')

    fireEvent.pointerDown(resizeHandle, {
      clientX: 400,
      pointerId: 2,
    })
    fireEvent.pointerMove(resizeHandle, {
      clientX: 1000,
      pointerId: 2,
    })
    fireEvent.pointerUp(resizeHandle, {
      clientX: 1000,
      pointerId: 2,
    })

    expect(
      editorSidebar.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('720px')
  })

  it('resizes the inspector sidebar toward the workspace', async () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode />)

    fireEvent.click(screen.getByRole('button', { name: 'Diagnostics' }))

    expect(
      await screen.findByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()

    const inspector = screen.getByRole('complementary', {
      name: 'Editor inspector',
    })
    const resizeHandle = screen.getByRole('separator', {
      name: 'Resize inspector',
    })

    expect(
      within(
        screen.getByRole('region', {
          name: 'Diagnostics',
        }),
      ).getByRole('button', { name: 'Close inspector' }),
    ).toBeInTheDocument()
    expect(
      inspector.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('384px')
    expect(resizeHandle).toHaveAttribute('aria-valuemax', '720')

    fireEvent.pointerDown(resizeHandle, {
      clientX: 500,
      pointerId: 1,
    })
    fireEvent.pointerMove(resizeHandle, {
      clientX: 260,
      pointerId: 1,
    })
    fireEvent.pointerUp(resizeHandle, {
      clientX: 260,
      pointerId: 1,
    })

    expect(
      inspector.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('624px')

    fireEvent.keyDown(resizeHandle, { key: 'ArrowRight' })

    expect(
      inspector.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('600px')

    fireEvent.keyDown(resizeHandle, { key: 'ArrowLeft' })

    expect(
      inspector.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('624px')

    fireEvent.pointerDown(resizeHandle, {
      clientX: 500,
      pointerId: 2,
    })
    fireEvent.pointerMove(resizeHandle, {
      clientX: -500,
      pointerId: 2,
    })
    fireEvent.pointerUp(resizeHandle, {
      clientX: -500,
      pointerId: 2,
    })

    expect(
      inspector.style.getPropertyValue('--editor-sidebar-panel-width'),
    ).toBe('720px')
  })

  it('opens diagnostics and presets through inspector activities', async () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode />)

    fireEvent.click(screen.getByRole('button', { name: 'Diagnostics' }))

    expect(
      await screen.findByRole('heading', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(
      within(
        screen.getByRole('region', {
          name: 'Diagnostics',
        }),
      ).getAllByRole('heading'),
    ).toHaveLength(1)
    expect(
      within(
        screen.getByRole('region', {
          name: 'DBML editor',
        }),
      ).getByLabelText('DBML editor'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'DBML presets' }))

    expect(
      await screen.findByRole('group', { name: 'DBML presets' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Simple' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Complex' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Very complex' }),
    ).toBeInTheDocument()
  })

  it('opens diagram settings through inspector activities', async () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode />)

    fireEvent.click(screen.getByRole('button', { name: 'Diagram settings' }))

    const selector = await screen.findByLabelText('Diagram layout algorithm')

    expect(selector).toHaveValue('org.eclipse.elk.layered')
    expect(await screen.findByLabelText('Direction')).toHaveValue('RIGHT')

    await waitFor(() => {
      expect(screen.getByText('ELK Force')).toBeInTheDocument()
    })
  })

  it('updates the selected diagram layout algorithm from inspector settings', async () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode />)

    fireEvent.click(screen.getByRole('button', { name: 'Diagram settings' }))

    const selector = await screen.findByLabelText('Diagram layout algorithm')

    await waitFor(() => {
      expect(screen.getByText('ELK Force')).toBeInTheDocument()
    })

    fireEvent.change(selector, {
      target: { value: 'org.eclipse.elk.force' },
    })

    expect(selector).toHaveValue('org.eclipse.elk.force')
    expect(await screen.findByLabelText('Force model')).toHaveValue(
      'FRUCHTERMAN_REINGOLD',
    )
  })

  it('updates a curated diagram layout option from inspector settings', async () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode />)

    fireEvent.click(screen.getByRole('button', { name: 'Diagram settings' }))

    const directionSelector = await screen.findByLabelText('Direction')

    fireEvent.change(directionSelector, {
      target: { value: 'DOWN' },
    })

    expect(directionSelector).toHaveValue('DOWN')
  })

  it('hides development diagnostics, preset, and layout settings controls when editor dev mode is disabled', () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode={false} />)

    expect(
      screen.queryByRole('button', { name: 'Diagnostics' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'DBML presets' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Diagram settings' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Diagram layout algorithm'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Editor' })).toBeInTheDocument()
  })

  it('keeps validation state active when development diagnostics are hidden', () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    vi.useFakeTimers()
    render(<EditorPage isEditorDevMode={false} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'DBML editor' }), {
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
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
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
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
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
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
    render(<EditorPage isEditorDevMode />)

    const editor = screen.getByRole('textbox', { name: 'DBML editor' })

    if (!(editor instanceof HTMLTextAreaElement)) {
      throw new Error('Expected DBML editor to render as a textarea in tests.')
    }

    expect(editor.value).toContain('Project dbml_drawer')

    fireEvent.click(screen.getByRole('button', { name: 'DBML presets' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Very complex' }))

    expect(editor.value).toContain('Project operations')
    expect(editor.value).toContain('Table deployment_steps')
  })

  it('moves the editor cursor when a diagram table is focused', async () => {
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
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
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
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
    loadDbmlLayoutAlgorithmOptions.mockResolvedValue(layoutAlgorithmOptions)
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

function openSettingsPanel() {
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  return screen.getByRole('region', { name: 'Settings' })
}

function getStoredEditorPreferences() {
  const storedValue = window.localStorage.getItem(
    EDITOR_PREFERENCES_STORAGE_KEY,
  )

  if (!storedValue) {
    throw new Error('Expected editor preferences to be persisted.')
  }

  const parsedValue = JSON.parse(storedValue) as {
    state?: Record<string, unknown>
  }

  return parsedValue.state ?? {}
}

type ThemeChangeListener = () => void

function installMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches
  const listeners = new Set<ThemeChangeListener>()
  const mediaQuery = {
    get matches() {
      return matches
    },
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn(
      (_event: 'change', listener: ThemeChangeListener) => {
        listeners.add(listener)
      },
    ),
    removeEventListener: vi.fn(
      (_event: 'change', listener: ThemeChangeListener) => {
        listeners.delete(listener)
      },
    ),
    addListener: vi.fn((listener: ThemeChangeListener) => {
      listeners.add(listener)
    }),
    removeListener: vi.fn((listener: ThemeChangeListener) => {
      listeners.delete(listener)
    }),
    setMatches(nextMatches: boolean) {
      matches = nextMatches
      listeners.forEach((listener) => listener())
    },
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => mediaQuery),
  })

  return mediaQuery
}

function installLocalStorageMock() {
  const values = new Map<string, string>()

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, value)
      }),
      removeItem: vi.fn((key: string) => {
        values.delete(key)
      }),
      clear: vi.fn(() => {
        values.clear()
      }),
    },
  })
}
