import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EDITOR_PREFERENCES_STORAGE_KEY,
  normalizeBoolean,
  normalizeCodeEditorThemeMode,
  normalizeEditorSidebarWidth,
  normalizeEditorThemeMode,
  normalizeOffscreenRelationProxyPlacementMode,
  normalizeOffscreenRelationProxyVisibilityMode,
  normalizeRelationHighlightMode,
  normalizeRelationLineStyle,
  resetEditorPreferencesStoreForTests,
  useEditorPreferencesStore,
  useEditorThemePreferences,
} from './editor-theme'

type ThemeChangeListener = () => void

describe('editor theme preferences', () => {
  afterEach(() => {
    cleanup()
    window.localStorage?.clear()
    resetEditorPreferencesStoreForTests()
    vi.restoreAllMocks()
  })

  it('falls back to defaults for invalid persisted preference values', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    setStoredEditorPreferences({
      workspaceThemeMode: 'sepia',
      codeEditorThemeMode: 'invalid',
      codeEditorOverrideThemeMode: 'workspace',
      isOffscreenRelationProxiesEnabled: 'true',
      shouldConnectOffscreenRelationProxyLines: 'false',
      shouldAvoidOffscreenRelationProxyActiveNodes: 'true',
      offscreenRelationProxyPlacementMode: 'diagonal',
      offscreenRelationProxyVisibilityMode: 'invalid',
      editorSidebarWidth: '10000',
      isEditorSidebarExpanded: 'false',
      relationLineStyle: 'arc',
      relationHighlightMode: 'blink',
    })
    resetEditorPreferencesStoreForTests()

    expect(normalizeEditorThemeMode('light-solarized')).toBe('light-solarized')
    expect(normalizeEditorThemeMode('workspace')).toBe('system')
    expect(normalizeCodeEditorThemeMode('workspace')).toBe('workspace')
    expect(normalizeEditorThemeMode('unknown')).toBe('system')
    expect(normalizeOffscreenRelationProxyPlacementMode('parallel')).toBe(
      'parallel',
    )
    expect(normalizeOffscreenRelationProxyPlacementMode('unknown')).toBe('line')
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

    const state = useEditorPreferencesStore.getState()

    expect(state.workspaceThemeMode).toBe('system')
    expect(state.codeEditorThemeMode).toBe('workspace')
    expect(state.codeEditorOverrideThemeMode).toBe('system')
    expect(state.isOffscreenRelationProxiesEnabled).toBe(false)
    expect(state.shouldConnectOffscreenRelationProxyLines).toBe(false)
    expect(state.shouldAvoidOffscreenRelationProxyActiveNodes).toBe(false)
    expect(state.offscreenRelationProxyPlacementMode).toBe('line')
    expect(state.offscreenRelationProxyVisibilityMode).toBe('any-overlap')
    expect(state.editorSidebarWidth).toBe(720)
    expect(state.isEditorSidebarExpanded).toBe(true)
    expect(state.relationLineStyle).toBe('bezier')
    expect(state.relationHighlightMode).toBe('gradient')
  })

  it('persists workspace and code editor theme modes independently', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorPreferencesStoreForTests()

    const { unmount } = render(<ThemeHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Workspace dark' }))
    fireEvent.click(screen.getByRole('button', { name: 'Code light' }))

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent('light')
    expect(getStoredEditorPreferences().workspaceThemeMode).toBe('dark')
    expect(getStoredEditorPreferences().codeEditorThemeMode).toBe('light')
    expect(getStoredEditorPreferences().codeEditorOverrideThemeMode).toBe(
      'light',
    )

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
    resetEditorPreferencesStoreForTests()

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
    resetEditorPreferencesStoreForTests()

    render(<ThemeHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Code workspace' }))
    fireEvent.click(screen.getByRole('button', { name: 'Workspace dark' }))

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent(
      'workspace',
    )
    expect(screen.getByTestId('workspace-resolved')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-resolved')).toHaveTextContent('dark')
    expect(getStoredEditorPreferences().codeEditorThemeMode).toBe('workspace')
  })

  it('persists the offscreen relation proxy settings with disabled defaults', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorPreferencesStoreForTests()

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
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'any-overlap',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enable proxies' }))
    fireEvent.click(screen.getByRole('button', { name: 'Connect proxies' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avoid active nodes' }))
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
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'center',
    )
    expect(getStoredEditorPreferences().isOffscreenRelationProxiesEnabled).toBe(
      true,
    )
    expect(
      getStoredEditorPreferences().shouldConnectOffscreenRelationProxyLines,
    ).toBe(true)
    expect(
      getStoredEditorPreferences().shouldAvoidOffscreenRelationProxyActiveNodes,
    ).toBe(true)
    expect(
      getStoredEditorPreferences().offscreenRelationProxyPlacementMode,
    ).toBe('parallel')
    expect(
      getStoredEditorPreferences().offscreenRelationProxyVisibilityMode,
    ).toBe('center')

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
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'center',
    )
  })

  it('persists sidebar and relation rendering preferences', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)
    resetEditorPreferencesStoreForTests()

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
    expect(getStoredEditorPreferences().editorSidebarWidth).toBe(520)
    expect(getStoredEditorPreferences().isEditorSidebarExpanded).toBe(false)
    expect(getStoredEditorPreferences().relationLineStyle).toBe('orthogonal')
    expect(getStoredEditorPreferences().relationHighlightMode).toBe('dynamic')

    unmount()
    resetEditorPreferencesStoreForTests()
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
    offscreenRelationProxyVisibilityMode,
    editorSidebarWidth,
    isEditorSidebarExpanded,
    relationLineStyle,
    relationHighlightMode,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setShouldAvoidOffscreenRelationProxyActiveNodes,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyVisibilityMode,
    setEditorSidebarWidth,
    setEditorSidebarExpanded,
    setRelationLineStyle,
    setRelationHighlightMode,
  } = useEditorThemePreferences()

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
      <span data-testid="offscreen-proxy-visibility">
        {offscreenRelationProxyVisibilityMode}
      </span>
      <span data-testid="editor-sidebar-width">{editorSidebarWidth}</span>
      <span data-testid="editor-sidebar-expanded">
        {isEditorSidebarExpanded ? 'expanded' : 'collapsed'}
      </span>
      <span data-testid="relation-line-style">{relationLineStyle}</span>
      <span data-testid="relation-highlight-mode">{relationHighlightMode}</span>
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

function setStoredEditorPreferences(state: Record<string, unknown>) {
  window.localStorage.setItem(
    EDITOR_PREFERENCES_STORAGE_KEY,
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
