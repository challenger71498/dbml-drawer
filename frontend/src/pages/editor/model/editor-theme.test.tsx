import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EDITOR_CODE_EDITOR_THEME_STORAGE_KEY,
  EDITOR_OFFSCREEN_RELATION_PROXY_LINES_STORAGE_KEY,
  EDITOR_OFFSCREEN_RELATION_PROXY_PLACEMENT_STORAGE_KEY,
  EDITOR_OFFSCREEN_RELATION_PROXY_VISIBILITY_STORAGE_KEY,
  EDITOR_OFFSCREEN_RELATION_PROXIES_STORAGE_KEY,
  EDITOR_WORKSPACE_THEME_STORAGE_KEY,
  normalizeCodeEditorThemeMode,
  normalizeEditorThemeMode,
  normalizeOffscreenRelationProxyPlacementMode,
  normalizeOffscreenRelationProxyVisibilityMode,
  readStoredBoolean,
  readStoredCodeEditorThemeMode,
  readStoredOffscreenRelationProxyPlacementMode,
  readStoredOffscreenRelationProxyVisibilityMode,
  readStoredThemeMode,
  useEditorThemePreferences,
} from './editor-theme'

type ThemeChangeListener = () => void

describe('editor theme preferences', () => {
  afterEach(() => {
    cleanup()
    window.localStorage?.clear()
    vi.restoreAllMocks()
  })

  it('falls back to defaults for invalid stored theme modes', () => {
    installLocalStorageMock()
    window.localStorage.setItem(EDITOR_WORKSPACE_THEME_STORAGE_KEY, 'sepia')

    expect(normalizeEditorThemeMode('light-solarized')).toBe('light-solarized')
    expect(normalizeEditorThemeMode('workspace')).toBe('system')
    expect(normalizeCodeEditorThemeMode('workspace')).toBe('workspace')
    expect(normalizeEditorThemeMode('unknown')).toBe('system')
    expect(readStoredThemeMode(EDITOR_WORKSPACE_THEME_STORAGE_KEY)).toBe(
      'system',
    )

    window.localStorage.setItem(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY, 'invalid')

    expect(
      readStoredCodeEditorThemeMode(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY),
    ).toBe('workspace')

    window.localStorage.setItem(
      EDITOR_OFFSCREEN_RELATION_PROXY_PLACEMENT_STORAGE_KEY,
      'diagonal',
    )

    expect(normalizeOffscreenRelationProxyPlacementMode('parallel')).toBe(
      'parallel',
    )
    expect(normalizeOffscreenRelationProxyPlacementMode('unknown')).toBe('line')
    expect(
      readStoredOffscreenRelationProxyPlacementMode(
        EDITOR_OFFSCREEN_RELATION_PROXY_PLACEMENT_STORAGE_KEY,
      ),
    ).toBe('line')

    window.localStorage.setItem(
      EDITOR_OFFSCREEN_RELATION_PROXY_VISIBILITY_STORAGE_KEY,
      'invalid',
    )

    expect(normalizeOffscreenRelationProxyVisibilityMode('center')).toBe(
      'center',
    )
    expect(normalizeOffscreenRelationProxyVisibilityMode('unknown')).toBe(
      'any-overlap',
    )
    expect(
      readStoredOffscreenRelationProxyVisibilityMode(
        EDITOR_OFFSCREEN_RELATION_PROXY_VISIBILITY_STORAGE_KEY,
      ),
    ).toBe('any-overlap')
  })

  it('persists workspace and code editor theme modes independently', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)

    const { unmount } = render(<ThemeHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Workspace dark' }))
    fireEvent.click(screen.getByRole('button', { name: 'Code light' }))

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent('light')
    expect(
      window.localStorage.getItem(EDITOR_WORKSPACE_THEME_STORAGE_KEY),
    ).toBe('dark')
    expect(
      window.localStorage.getItem(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY),
    ).toBe('light')

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

    render(<ThemeHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Code workspace' }))
    fireEvent.click(screen.getByRole('button', { name: 'Workspace dark' }))

    expect(screen.getByTestId('workspace-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent(
      'workspace',
    )
    expect(screen.getByTestId('workspace-resolved')).toHaveTextContent('dark')
    expect(screen.getByTestId('code-editor-resolved')).toHaveTextContent('dark')
    expect(
      window.localStorage.getItem(EDITOR_CODE_EDITOR_THEME_STORAGE_KEY),
    ).toBe('workspace')
  })

  it('persists the offscreen relation proxy settings with disabled defaults', () => {
    installLocalStorageMock()
    installMatchMediaMock(false)

    expect(
      readStoredBoolean(EDITOR_OFFSCREEN_RELATION_PROXIES_STORAGE_KEY, false),
    ).toBe(false)
    expect(
      readStoredBoolean(
        EDITOR_OFFSCREEN_RELATION_PROXY_LINES_STORAGE_KEY,
        false,
      ),
    ).toBe(false)

    const { unmount } = render(<ThemeHarness />)

    expect(screen.getByTestId('offscreen-proxies')).toHaveTextContent(
      'disabled',
    )
    expect(screen.getByTestId('offscreen-proxy-lines')).toHaveTextContent(
      'disconnected',
    )
    expect(screen.getByTestId('offscreen-proxy-placement')).toHaveTextContent(
      'line',
    )
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'any-overlap',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enable proxies' }))
    fireEvent.click(screen.getByRole('button', { name: 'Connect proxies' }))
    fireEvent.click(screen.getByRole('button', { name: 'Place parallel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Visible at center' }))

    expect(screen.getByTestId('offscreen-proxies')).toHaveTextContent('enabled')
    expect(screen.getByTestId('offscreen-proxy-lines')).toHaveTextContent(
      'connected',
    )
    expect(screen.getByTestId('offscreen-proxy-placement')).toHaveTextContent(
      'parallel',
    )
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'center',
    )
    expect(
      window.localStorage.getItem(
        EDITOR_OFFSCREEN_RELATION_PROXIES_STORAGE_KEY,
      ),
    ).toBe('true')
    expect(
      window.localStorage.getItem(
        EDITOR_OFFSCREEN_RELATION_PROXY_LINES_STORAGE_KEY,
      ),
    ).toBe('true')
    expect(
      window.localStorage.getItem(
        EDITOR_OFFSCREEN_RELATION_PROXY_PLACEMENT_STORAGE_KEY,
      ),
    ).toBe('parallel')
    expect(
      window.localStorage.getItem(
        EDITOR_OFFSCREEN_RELATION_PROXY_VISIBILITY_STORAGE_KEY,
      ),
    ).toBe('center')

    unmount()
    render(<ThemeHarness />)

    expect(screen.getByTestId('offscreen-proxies')).toHaveTextContent('enabled')
    expect(screen.getByTestId('offscreen-proxy-lines')).toHaveTextContent(
      'connected',
    )
    expect(screen.getByTestId('offscreen-proxy-placement')).toHaveTextContent(
      'parallel',
    )
    expect(screen.getByTestId('offscreen-proxy-visibility')).toHaveTextContent(
      'center',
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
    offscreenRelationProxyPlacementMode,
    offscreenRelationProxyVisibilityMode,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyVisibilityMode,
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
      <span data-testid="offscreen-proxy-placement">
        {offscreenRelationProxyPlacementMode}
      </span>
      <span data-testid="offscreen-proxy-visibility">
        {offscreenRelationProxyVisibilityMode}
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
