import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EDITOR_SETTINGS_STORAGE_KEY,
  normalizeBoolean,
  normalizeCodeEditorThemeMode,
  normalizeEditorSidebarWidth,
  normalizeEditorThemeMode,
  normalizeOffscreenRelationProxyCollisionMode,
  normalizeOffscreenRelationProxyPlacementMode,
  normalizeOffscreenRelationProxyVisibilityMode,
  normalizeRelationHighlightMode,
  normalizeRelationLineStyle,
  getEditorSettingsStateForTests,
  resetEditorSettingsStoreForTests,
  useEditorSettings,
} from './editor-theme'

type ThemeChangeListener = () => void

describe('editor theme settings', () => {
  afterEach(() => {
    cleanup()
    window.localStorage?.clear()
    resetEditorSettingsStoreForTests()
    vi.restoreAllMocks()
  })

  it('falls back to defaults for invalid persisted preference values', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    setStoredEditorSettings({
      workspaceThemeMode: 'sepia',
      codeEditorThemeMode: 'invalid',
      codeEditorOverrideThemeMode: 'workspace',
      isOffscreenRelationProxiesEnabled: 'true',
      shouldConnectOffscreenRelationProxyLines: 'false',
      shouldAvoidOffscreenRelationProxyActiveNodes: 'true',
      offscreenRelationProxyCollisionMode: 'invalid',
      offscreenRelationProxyPlacementMode: 'diagonal',
      offscreenRelationProxyVisibilityMode: 'invalid',
      editorSidebarWidth: '10000',
      isEditorSidebarExpanded: 'false',
      relationLineStyle: 'arc',
      relationHighlightMode: 'blink',
    })
    resetEditorSettingsStoreForTests()

    expect(normalizeEditorThemeMode('light-solarized')).toBe('light-solarized')
    expect(normalizeEditorThemeMode('workspace')).toBe('system')
    expect(normalizeCodeEditorThemeMode('workspace')).toBe('workspace')
    expect(normalizeEditorThemeMode('unknown')).toBe('system')
    expect(normalizeOffscreenRelationProxyPlacementMode('parallel')).toBe(
      'parallel',
    )
    expect(normalizeOffscreenRelationProxyPlacementMode('unknown')).toBe('line')
    expect(normalizeOffscreenRelationProxyCollisionMode('iterative')).toBe(
      'iterative',
    )
    expect(normalizeOffscreenRelationProxyCollisionMode('score')).toBe('score')
    expect(normalizeOffscreenRelationProxyCollisionMode('constrained')).toBe(
      'iterative',
    )
    expect(normalizeOffscreenRelationProxyCollisionMode('unknown')).toBe(
      'legacy',
    )
    expect(normalizeOffscreenRelationProxyVisibilityMode('center')).toBe(
      'center',
    )
    expect(normalizeOffscreenRelationProxyVisibilityMode('unknown')).toBe(
      'any-overlap',
    )
    expect(normalizeEditorSidebarWidth(120)).toBe(320)
    expect(normalizeBoolean(true, false)).toBe(true)
    expect(normalizeBoolean('true', false)).toBe(false)
    expect(normalizeRelationLineStyle('rounded-orthogonal')).toBe(
      'rounded-orthogonal',
    )
    expect(normalizeRelationHighlightMode('dynamic')).toBe('dynamic')

    const state = getEditorSettingsStateForTests()

    expect(state.workspaceThemeMode).toBe('system')
    expect(state.codeEditorThemeMode).toBe('workspace')
    expect(state.codeEditorOverrideThemeMode).toBe('system')
    expect(state.isOffscreenRelationProxiesEnabled).toBe(false)
    expect(state.shouldConnectOffscreenRelationProxyLines).toBe(false)
    expect(state.shouldAvoidOffscreenRelationProxyActiveNodes).toBe(false)
    expect(state.offscreenRelationProxyCollisionMode).toBe('legacy')
    expect(state.offscreenRelationProxyPlacementMode).toBe('line')
    expect(state.offscreenRelationProxyVisibilityMode).toBe('any-overlap')
    expect(state.editorSidebarWidth).toBe(720)
    expect(state.isEditorSidebarExpanded).toBe(true)
    expect(state.relationLineStyle).toBe('bezier')
    expect(state.relationHighlightMode).toBe('gradient')
    expect(state.selectedLayoutAlgorithmId).toBe('org.eclipse.elk.layered')
    expect(state.selectedLayoutOptionValues).toEqual({
      'elk.direction': 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      'elk.layered.highDegreeNodes.treatment': 'false',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.spacing.nodeNodeBetweenLayers': '96',
    })
  })

  it('persists workspace and code editor theme modes independently', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorSettingsStoreForTests()

    const { unmount } = render(<ThemeHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Workspace dark' }))
    fireEvent.click(screen.getByRole('button', { name: 'Code light' }))

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent('light')
    expect(getStoredEditorSettings().workspaceThemeMode).toBe('dark')
    expect(getStoredEditorSettings().codeEditorThemeMode).toBe('light')
    expect(getStoredEditorSettings().codeEditorOverrideThemeMode).toBe('light')

    unmount()
    render(<ThemeHarness />)

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent('light')
    expect(screen.getByTestId('workspace-resolved')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-resolved')).toHaveTextContent(
      'light',
    )
  })

  it('updates resolved themes when system preference changes', () => {
    installLocalStorageMock()
    const mediaQuery = installMatchMediaMock(false)
    resetEditorSettingsStoreForTests()

    render(<ThemeHarness />)

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('system')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent(
      'workspace',
    )
    expect(screen.getByTestId('workspace-resolved')).toHaveTextContent('light')
    expect(screen.getByTestId('code-editor-resolved')).toHaveTextContent(
      'light',
    )

    act(() => {
      mediaQuery.setMatches(true)
    })

    expect(screen.getByTestId('workspace-resolved')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-resolved')).toHaveTextContent('dark')
  })

  it('resolves code editor theme from the workspace theme mode', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorSettingsStoreForTests()

    render(<ThemeHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Code workspace' }))
    fireEvent.click(screen.getByRole('button', { name: 'Workspace dark' }))

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent(
      'workspace',
    )
    expect(screen.getByTestId('workspace-resolved')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-resolved')).toHaveTextContent('dark')
    expect(getStoredEditorSettings().codeEditorThemeMode).toBe('workspace')
  })

  it('persists the offscreen relation proxy settings with disabled defaults', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorSettingsStoreForTests()

    const { unmount } = render(<ThemeHarness />)

    expect(screen.getByTestId('offscreen-proxies')).toHaveTextContent(
      'disabled',
    )
    expect(screen.getByTestId('offscreen-proxy-lines')).toHaveTextContent(
      'disconnected',
    )
    expect(
      screen.getByTestId('offscreen-proxy-active-node-avoidance'),
    ).toHaveTextContent('unavoided')
    expect(screen.getByTestId('offscreen-proxy-placement')).toHaveTextContent(
      'line',
    )
    expect(screen.getByTestId('offscreen-proxy-collision')).toHaveTextContent(
      'legacy',
    )
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'any-overlap',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enable proxies' }))
    fireEvent.click(screen.getByRole('button', { name: 'Connect proxies' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avoid active nodes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Iterate collisions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Place parallel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Visible at center' }))

    expect(screen.getByTestId('offscreen-proxies')).toHaveTextContent('enabled')
    expect(screen.getByTestId('offscreen-proxy-lines')).toHaveTextContent(
      'connected',
    )
    expect(
      screen.getByTestId('offscreen-proxy-active-node-avoidance'),
    ).toHaveTextContent('avoided')
    expect(screen.getByTestId('offscreen-proxy-placement')).toHaveTextContent(
      'parallel',
    )
    expect(screen.getByTestId('offscreen-proxy-collision')).toHaveTextContent(
      'iterative',
    )
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'center',
    )
    expect(getStoredEditorSettings().isOffscreenRelationProxiesEnabled).toBe(
      true,
    )
    expect(
      getStoredEditorSettings().shouldConnectOffscreenRelationProxyLines,
    ).toBe(true)
    expect(
      getStoredEditorSettings().shouldAvoidOffscreenRelationProxyActiveNodes,
    ).toBe(true)
    expect(getStoredEditorSettings().offscreenRelationProxyCollisionMode).toBe(
      'iterative',
    )
    expect(getStoredEditorSettings().offscreenRelationProxyPlacementMode).toBe(
      'parallel',
    )
    expect(getStoredEditorSettings().offscreenRelationProxyVisibilityMode).toBe(
      'center',
    )

    unmount()
    render(<ThemeHarness />)

    expect(screen.getByTestId('offscreen-proxies')).toHaveTextContent('enabled')
    expect(screen.getByTestId('offscreen-proxy-lines')).toHaveTextContent(
      'connected',
    )
    expect(
      screen.getByTestId('offscreen-proxy-active-node-avoidance'),
    ).toHaveTextContent('avoided')
    expect(screen.getByTestId('offscreen-proxy-placement')).toHaveTextContent(
      'parallel',
    )
    expect(screen.getByTestId('offscreen-proxy-collision')).toHaveTextContent(
      'iterative',
    )
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'center',
    )
  })

  it('persists sidebar and relation rendering settings', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorSettingsStoreForTests()

    const { unmount } = render(<ThemeHarness />)

    expect(screen.getByTestId('editor-sidebar-width')).toHaveTextContent('480')
    expect(screen.getByTestId('editor-sidebar-expanded')).toHaveTextContent(
      'expanded',
    )
    expect(screen.getByTestId('relation-line-style')).toHaveTextContent(
      'bezier',
    )
    expect(screen.getByTestId('relation-highlight-mode')).toHaveTextContent(
      'gradient',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Resize sidebar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Use step lines' }))
    fireEvent.click(screen.getByRole('button', { name: 'Use dynamic lines' }))

    expect(screen.getByTestId('editor-sidebar-width')).toHaveTextContent('520')
    expect(screen.getByTestId('editor-sidebar-expanded')).toHaveTextContent(
      'collapsed',
    )
    expect(screen.getByTestId('relation-line-style')).toHaveTextContent(
      'orthogonal',
    )
    expect(screen.getByTestId('relation-highlight-mode')).toHaveTextContent(
      'dynamic',
    )
    expect(getStoredEditorSettings().editorSidebarWidth).toBe(520)
    expect(getStoredEditorSettings().isEditorSidebarExpanded).toBe(false)
    expect(getStoredEditorSettings().relationLineStyle).toBe('orthogonal')
    expect(getStoredEditorSettings().relationHighlightMode).toBe('dynamic')

    unmount()
    resetEditorSettingsStoreForTests()
    render(<ThemeHarness />)

    expect(screen.getByTestId('editor-sidebar-width')).toHaveTextContent('520')
    expect(screen.getByTestId('editor-sidebar-expanded')).toHaveTextContent(
      'collapsed',
    )
    expect(screen.getByTestId('relation-line-style')).toHaveTextContent(
      'orthogonal',
    )
    expect(screen.getByTestId('relation-highlight-mode')).toHaveTextContent(
      'dynamic',
    )
  })

  it('persists layout settings with layout option normalization', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorSettingsStoreForTests()

    const { unmount } = render(<ThemeHarness />)

    expect(screen.getByTestId('layout-algorithm')).toHaveTextContent(
      'org.eclipse.elk.layered',
    )
    expect(screen.getByTestId('layout-options')).toHaveTextContent(
      'elk.direction=RIGHT',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Use box layout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear packing mode' }))

    expect(screen.getByTestId('layout-algorithm')).toHaveTextContent(
      'org.eclipse.elk.box',
    )
    expect(screen.getByTestId('layout-options')).toHaveTextContent('')
    expect(getStoredEditorSettings().selectedLayoutAlgorithmId).toBe(
      'org.eclipse.elk.box',
    )
    expect(getStoredEditorSettings().selectedLayoutOptionValues).toEqual({})

    unmount()
    resetEditorSettingsStoreForTests()
    render(<ThemeHarness />)

    expect(screen.getByTestId('layout-algorithm')).toHaveTextContent(
      'org.eclipse.elk.box',
    )
    expect(screen.getByTestId('layout-options')).toHaveTextContent('')
  })

  it('falls back to layout option defaults for the normalized layout algorithm', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    setStoredEditorSettings({
      selectedLayoutAlgorithmId: 'org.eclipse.elk.box',
      selectedLayoutOptionValues: null,
    })
    resetEditorSettingsStoreForTests()

    const state = getEditorSettingsStateForTests()

    expect(state.selectedLayoutAlgorithmId).toBe('org.eclipse.elk.box')
    expect(state.selectedLayoutOptionValues).toEqual({
      'elk.box.packingMode': 'SIMPLE',
    })
  })
})

function ThemeHarness() {
  const {
    workspaceThemeMode,
    codeEditorThemeMode,
    resolvedWorkspaceTheme,
    resolvedCodeEditorTheme,
    isOffscreenRelationProxiesEnabled,
    shouldConnectOffscreenRelationProxyLines,
    shouldAvoidOffscreenRelationProxyActiveNodes,
    offscreenRelationProxyPlacementMode,
    offscreenRelationProxyCollisionMode,
    offscreenRelationProxyVisibilityMode,
    editorSidebarWidth,
    isEditorSidebarExpanded,
    relationLineStyle,
    relationHighlightMode,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setShouldAvoidOffscreenRelationProxyActiveNodes,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyCollisionMode,
    setOffscreenRelationProxyVisibilityMode,
    setEditorSidebarWidth,
    setEditorSidebarExpanded,
    setRelationLineStyle,
    setRelationHighlightMode,
    selectLayoutAlgorithm,
    setSelectedLayoutOptionValue,
  } = useEditorSettings()

  return (
    <div>
      <span data-testid="workspace-mode">{workspaceThemeMode}</span>
      <span data-testid="code-editor-mode">{codeEditorThemeMode}</span>
      <span data-testid="workspace-resolved">{resolvedWorkspaceTheme}</span>
      <span data-testid="code-editor-resolved">{resolvedCodeEditorTheme}</span>
      <span data-testid="offscreen-proxies">
        {isOffscreenRelationProxiesEnabled ? 'enabled' : 'disabled'}
      </span>
      <span data-testid="offscreen-proxy-lines">
        {shouldConnectOffscreenRelationProxyLines
          ? 'connected'
          : 'disconnected'}
      </span>
      <span data-testid="offscreen-proxy-active-node-avoidance">
        {shouldAvoidOffscreenRelationProxyActiveNodes ? 'avoided' : 'unavoided'}
      </span>
      <span data-testid="offscreen-proxy-placement">
        {offscreenRelationProxyPlacementMode}
      </span>
      <span data-testid="offscreen-proxy-collision">
        {offscreenRelationProxyCollisionMode}
      </span>
      <span data-testid="offscreen-proxy-visibility">
        {offscreenRelationProxyVisibilityMode}
      </span>
      <span data-testid="editor-sidebar-width">{editorSidebarWidth}</span>
      <span data-testid="editor-sidebar-expanded">
        {isEditorSidebarExpanded ? 'expanded' : 'collapsed'}
      </span>
      <span data-testid="relation-line-style">{relationLineStyle}</span>
      <span data-testid="relation-highlight-mode">{relationHighlightMode}</span>
      <span data-testid="layout-algorithm">{selectedLayoutAlgorithmId}</span>
      <span data-testid="layout-options">
        {Object.entries(selectedLayoutOptionValues)
          .map(([key, value]) => `${key}=${value}`)
          .join(',')}
      </span>
      <button type="button" onClick={() => setWorkspaceThemeMode('dark')}>
        Workspace dark
      </button>
      <button type="button" onClick={() => setCodeEditorThemeMode('light')}>
        Code light
      </button>
      <button type="button" onClick={() => setCodeEditorThemeMode('workspace')}>
        Code workspace
      </button>
      <button
        type="button"
        onClick={() => setOffscreenRelationProxyCollisionMode('iterative')}
      >
        Iterate collisions
      </button>
      <button
        type="button"
        onClick={() => setOffscreenRelationProxiesEnabled(true)}
      >
        Enable proxies
      </button>
      <button
        type="button"
        onClick={() => setShouldConnectOffscreenRelationProxyLines(true)}
      >
        Connect proxies
      </button>
      <button
        type="button"
        onClick={() => setShouldAvoidOffscreenRelationProxyActiveNodes(true)}
      >
        Avoid active nodes
      </button>
      <button
        type="button"
        onClick={() => setOffscreenRelationProxyPlacementMode('parallel')}
      >
        Place parallel
      </button>
      <button
        type="button"
        onClick={() => setOffscreenRelationProxyVisibilityMode('center')}
      >
        Visible at center
      </button>
      <button type="button" onClick={() => setEditorSidebarWidth(520)}>
        Resize sidebar
      </button>
      <button type="button" onClick={() => setEditorSidebarExpanded(false)}>
        Collapse sidebar
      </button>
      <button type="button" onClick={() => setRelationLineStyle('orthogonal')}>
        Use step lines
      </button>
      <button type="button" onClick={() => setRelationHighlightMode('dynamic')}>
        Use dynamic lines
      </button>
      <button
        type="button"
        onClick={() => selectLayoutAlgorithm('org.eclipse.elk.box')}
      >
        Use box layout
      </button>
      <button
        type="button"
        onClick={() => setSelectedLayoutOptionValue('elk.box.packingMode', '')}
      >
        Clear packing mode
      </button>
    </div>
  )
}

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

function getStoredEditorSettings() {
  const storedValue = window.localStorage.getItem(EDITOR_SETTINGS_STORAGE_KEY)

  if (!storedValue) {
    throw new Error('Expected editor settings to be persisted.')
  }

  const parsedValue = JSON.parse(storedValue) as {
    state?: Record<string, unknown>
  }

  return parsedValue.state ?? {}
}

function setStoredEditorSettings(state: Record<string, unknown>) {
  window.localStorage.setItem(
    EDITOR_SETTINGS_STORAGE_KEY,
    JSON.stringify({ state, version: 0 }),
  )
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
