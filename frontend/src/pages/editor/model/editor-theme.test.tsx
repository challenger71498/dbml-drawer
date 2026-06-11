import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EDITOR_CODE_EDITOR_THEME_STORAGE_KEY,
  EDITOR_WORKSPACE_THEME_STORAGE_KEY,
  normalizeEditorThemeMode,
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

  it('falls back to system for invalid stored theme modes', () => {
    installLocalStorageMock()
    window.localStorage.setItem(EDITOR_WORKSPACE_THEME_STORAGE_KEY, 'sepia')

    expect(normalizeEditorThemeMode('unknown')).toBe('system')
    expect(readStoredThemeMode(EDITOR_WORKSPACE_THEME_STORAGE_KEY)).toBe(
      'system',
    )
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
    expect(screen.getByTestId('code-editor-mode')).toHaveTextContent('system')
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
})

function ThemeHarness() {
  const {
    workspaceThemeMode,
    codeEditorThemeMode,
    resolvedWorkspaceTheme,
    resolvedCodeEditorTheme,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
  } = useEditorThemePreferences()

  return (
    <div>
      <span data-testid="workspace-mode">{workspaceThemeMode}</span>
      <span data-testid="code-editor-mode">{codeEditorThemeMode}</span>
      <span data-testid="workspace-resolved">{resolvedWorkspaceTheme}</span>
      <span data-testid="code-editor-resolved">{resolvedCodeEditorTheme}</span>
      <button type="button" onClick={() => setWorkspaceThemeMode('dark')}>
        Workspace dark
      </button>
      <button type="button" onClick={() => setCodeEditorThemeMode('light')}>
        Code light
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
