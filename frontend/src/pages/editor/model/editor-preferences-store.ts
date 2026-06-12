import { useEffect } from 'react'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware'
import type {
  DbmlRelationHighlightMode,
  DbmlRelationLineStyle,
} from './dbml-diagram-rendering'
import {
  EDITOR_PREFERENCES_STORAGE_KEY,
  EDITOR_SIDEBAR_DEFAULT_WIDTH,
  getSystemTheme,
  getSystemThemeQuery,
  normalizeBoolean,
  normalizeCodeEditorThemeMode,
  normalizeEditorSidebarWidth,
  normalizeEditorThemeMode,
  normalizeOffscreenRelationProxyPlacementMode,
  normalizeOffscreenRelationProxyVisibilityMode,
  normalizeRelationHighlightMode,
  normalizeRelationLineStyle,
  resolveCodeEditorThemeMode,
  resolveSystemTheme,
  resolveThemeMode,
  type CodeEditorThemeMode,
  type EditorThemeMode,
  type OffscreenRelationProxyPlacementMode,
  type OffscreenRelationProxyVisibilityMode,
  type ResolvedEditorTheme,
} from './editor-theme-options'

export type EditorPreferencesState = {
  systemTheme: ResolvedEditorTheme
  workspaceThemeMode: EditorThemeMode
  codeEditorThemeMode: CodeEditorThemeMode
  codeEditorOverrideThemeMode: EditorThemeMode
  isOffscreenRelationProxiesEnabled: boolean
  shouldConnectOffscreenRelationProxyLines: boolean
  shouldAvoidOffscreenRelationProxyActiveNodes: boolean
  offscreenRelationProxyPlacementMode: OffscreenRelationProxyPlacementMode
  offscreenRelationProxyVisibilityMode: OffscreenRelationProxyVisibilityMode
  editorSidebarWidth: number
  isEditorSidebarExpanded: boolean
  relationLineStyle: DbmlRelationLineStyle
  relationHighlightMode: DbmlRelationHighlightMode
  setSystemTheme: (theme: ResolvedEditorTheme) => void
  setWorkspaceThemeMode: (mode: EditorThemeMode) => void
  setCodeEditorThemeMode: (mode: CodeEditorThemeMode) => void
  setCodeEditorOverrideThemeMode: (mode: EditorThemeMode) => void
  setOffscreenRelationProxiesEnabled: (isEnabled: boolean) => void
  setShouldConnectOffscreenRelationProxyLines: (shouldConnect: boolean) => void
  setShouldAvoidOffscreenRelationProxyActiveNodes: (
    shouldAvoid: boolean,
  ) => void
  setOffscreenRelationProxyPlacementMode: (
    mode: OffscreenRelationProxyPlacementMode,
  ) => void
  setOffscreenRelationProxyVisibilityMode: (
    mode: OffscreenRelationProxyVisibilityMode,
  ) => void
  setEditorSidebarWidth: (width: number) => void
  setEditorSidebarExpanded: (isExpanded: boolean) => void
  setRelationLineStyle: (style: DbmlRelationLineStyle) => void
  setRelationHighlightMode: (mode: DbmlRelationHighlightMode) => void
}

export type EditorThemePreferences = Pick<
  EditorPreferencesState,
  | 'workspaceThemeMode'
  | 'codeEditorThemeMode'
  | 'codeEditorOverrideThemeMode'
  | 'isOffscreenRelationProxiesEnabled'
  | 'shouldConnectOffscreenRelationProxyLines'
  | 'shouldAvoidOffscreenRelationProxyActiveNodes'
  | 'offscreenRelationProxyPlacementMode'
  | 'offscreenRelationProxyVisibilityMode'
  | 'editorSidebarWidth'
  | 'isEditorSidebarExpanded'
  | 'relationLineStyle'
  | 'relationHighlightMode'
  | 'setWorkspaceThemeMode'
  | 'setCodeEditorThemeMode'
  | 'setCodeEditorOverrideThemeMode'
  | 'setOffscreenRelationProxiesEnabled'
  | 'setShouldConnectOffscreenRelationProxyLines'
  | 'setShouldAvoidOffscreenRelationProxyActiveNodes'
  | 'setOffscreenRelationProxyPlacementMode'
  | 'setOffscreenRelationProxyVisibilityMode'
  | 'setEditorSidebarWidth'
  | 'setEditorSidebarExpanded'
  | 'setRelationLineStyle'
  | 'setRelationHighlightMode'
> & {
  resolvedWorkspaceTheme: ResolvedEditorTheme
  resolvedCodeEditorTheme: ResolvedEditorTheme
}

type EditorPreferencesData = Omit<
  EditorPreferencesState,
  | 'setSystemTheme'
  | 'setWorkspaceThemeMode'
  | 'setCodeEditorThemeMode'
  | 'setCodeEditorOverrideThemeMode'
  | 'setOffscreenRelationProxiesEnabled'
  | 'setShouldConnectOffscreenRelationProxyLines'
  | 'setShouldAvoidOffscreenRelationProxyActiveNodes'
  | 'setOffscreenRelationProxyPlacementMode'
  | 'setOffscreenRelationProxyVisibilityMode'
  | 'setEditorSidebarWidth'
  | 'setEditorSidebarExpanded'
  | 'setRelationLineStyle'
  | 'setRelationHighlightMode'
>

type PersistedEditorPreferencesState = Omit<
  EditorPreferencesData,
  'systemTheme'
>

export const useEditorPreferencesStore = create<EditorPreferencesState>()(
  persist(
    (set) => ({
      ...getDefaultEditorPreferencesState(),
      setSystemTheme: (theme) => set({ systemTheme: theme }),
      setWorkspaceThemeMode: (mode) => set({ workspaceThemeMode: mode }),
      setCodeEditorThemeMode: (mode) =>
        set((state) => ({
          codeEditorThemeMode: mode,
          codeEditorOverrideThemeMode:
            mode === 'workspace' ? state.codeEditorOverrideThemeMode : mode,
        })),
      setCodeEditorOverrideThemeMode: (mode) =>
        set({
          codeEditorThemeMode: mode,
          codeEditorOverrideThemeMode: mode,
        }),
      setOffscreenRelationProxiesEnabled: (isEnabled) =>
        set({ isOffscreenRelationProxiesEnabled: isEnabled }),
      setShouldConnectOffscreenRelationProxyLines: (shouldConnect) =>
        set({ shouldConnectOffscreenRelationProxyLines: shouldConnect }),
      setShouldAvoidOffscreenRelationProxyActiveNodes: (shouldAvoid) =>
        set({ shouldAvoidOffscreenRelationProxyActiveNodes: shouldAvoid }),
      setOffscreenRelationProxyPlacementMode: (mode) =>
        set({ offscreenRelationProxyPlacementMode: mode }),
      setOffscreenRelationProxyVisibilityMode: (mode) =>
        set({ offscreenRelationProxyVisibilityMode: mode }),
      setEditorSidebarWidth: (width) =>
        set({ editorSidebarWidth: normalizeEditorSidebarWidth(width) }),
      setEditorSidebarExpanded: (isExpanded) =>
        set({ isEditorSidebarExpanded: isExpanded }),
      setRelationLineStyle: (style) => set({ relationLineStyle: style }),
      setRelationHighlightMode: (mode) => set({ relationHighlightMode: mode }),
    }),
    {
      name: EDITOR_PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(createEditorPreferencesStorage),
      partialize: (state): PersistedEditorPreferencesState =>
        partializeEditorPreferencesState(state),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedEditorPreferencesState(persistedState),
        systemTheme: getSystemTheme(),
      }),
    },
  ),
)

export function useEditorThemePreferences(): EditorThemePreferences {
  const systemTheme = useEditorPreferencesStore((state) => state.systemTheme)
  const workspaceThemeMode = useEditorPreferencesStore(
    (state) => state.workspaceThemeMode,
  )
  const codeEditorThemeMode = useEditorPreferencesStore(
    (state) => state.codeEditorThemeMode,
  )
  const codeEditorOverrideThemeMode = useEditorPreferencesStore(
    (state) => state.codeEditorOverrideThemeMode,
  )
  const isOffscreenRelationProxiesEnabled = useEditorPreferencesStore(
    (state) => state.isOffscreenRelationProxiesEnabled,
  )
  const shouldConnectOffscreenRelationProxyLines = useEditorPreferencesStore(
    (state) => state.shouldConnectOffscreenRelationProxyLines,
  )
  const shouldAvoidOffscreenRelationProxyActiveNodes =
    useEditorPreferencesStore(
      (state) => state.shouldAvoidOffscreenRelationProxyActiveNodes,
    )
  const offscreenRelationProxyPlacementMode = useEditorPreferencesStore(
    (state) => state.offscreenRelationProxyPlacementMode,
  )
  const offscreenRelationProxyVisibilityMode = useEditorPreferencesStore(
    (state) => state.offscreenRelationProxyVisibilityMode,
  )
  const editorSidebarWidth = useEditorPreferencesStore(
    (state) => state.editorSidebarWidth,
  )
  const isEditorSidebarExpanded = useEditorPreferencesStore(
    (state) => state.isEditorSidebarExpanded,
  )
  const relationLineStyle = useEditorPreferencesStore(
    (state) => state.relationLineStyle,
  )
  const relationHighlightMode = useEditorPreferencesStore(
    (state) => state.relationHighlightMode,
  )
  const setSystemTheme = useEditorPreferencesStore(
    (state) => state.setSystemTheme,
  )
  const setWorkspaceThemeMode = useEditorPreferencesStore(
    (state) => state.setWorkspaceThemeMode,
  )
  const setCodeEditorThemeMode = useEditorPreferencesStore(
    (state) => state.setCodeEditorThemeMode,
  )
  const setCodeEditorOverrideThemeMode = useEditorPreferencesStore(
    (state) => state.setCodeEditorOverrideThemeMode,
  )
  const setOffscreenRelationProxiesEnabled = useEditorPreferencesStore(
    (state) => state.setOffscreenRelationProxiesEnabled,
  )
  const setShouldConnectOffscreenRelationProxyLines = useEditorPreferencesStore(
    (state) => state.setShouldConnectOffscreenRelationProxyLines,
  )
  const setShouldAvoidOffscreenRelationProxyActiveNodes =
    useEditorPreferencesStore(
      (state) => state.setShouldAvoidOffscreenRelationProxyActiveNodes,
    )
  const setOffscreenRelationProxyPlacementMode = useEditorPreferencesStore(
    (state) => state.setOffscreenRelationProxyPlacementMode,
  )
  const setOffscreenRelationProxyVisibilityMode = useEditorPreferencesStore(
    (state) => state.setOffscreenRelationProxyVisibilityMode,
  )
  const setEditorSidebarWidth = useEditorPreferencesStore(
    (state) => state.setEditorSidebarWidth,
  )
  const setEditorSidebarExpanded = useEditorPreferencesStore(
    (state) => state.setEditorSidebarExpanded,
  )
  const setRelationLineStyle = useEditorPreferencesStore(
    (state) => state.setRelationLineStyle,
  )
  const setRelationHighlightMode = useEditorPreferencesStore(
    (state) => state.setRelationHighlightMode,
  )

  useEffect(() => {
    const query = getSystemThemeQuery()

    if (!query) {
      return
    }

    const handleChange = () => {
      setSystemTheme(resolveSystemTheme(query.matches))
    }

    handleChange()

    if (query.addEventListener) {
      query.addEventListener('change', handleChange)
    } else {
      query.addListener?.(handleChange)
    }

    return () => {
      if (query.removeEventListener) {
        query.removeEventListener('change', handleChange)
      } else {
        query.removeListener?.(handleChange)
      }
    }
  }, [setSystemTheme])

  const resolvedWorkspaceTheme = resolveThemeMode(
    workspaceThemeMode,
    systemTheme,
  )

  return {
    workspaceThemeMode,
    codeEditorThemeMode,
    codeEditorOverrideThemeMode,
    resolvedWorkspaceTheme,
    resolvedCodeEditorTheme: resolveCodeEditorThemeMode(
      codeEditorThemeMode,
      resolvedWorkspaceTheme,
      systemTheme,
    ),
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
    setCodeEditorOverrideThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setShouldAvoidOffscreenRelationProxyActiveNodes,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyVisibilityMode,
    setEditorSidebarWidth,
    setEditorSidebarExpanded,
    setRelationLineStyle,
    setRelationHighlightMode,
  }
}

export function resetEditorPreferencesStoreForTests() {
  useEditorPreferencesStore.setState(
    {
      ...getDefaultEditorPreferencesState(),
      ...readPersistedEditorPreferencesState(),
    },
    false,
  )
}

function getDefaultEditorPreferencesState(): EditorPreferencesData {
  return {
    systemTheme: getSystemTheme(),
    workspaceThemeMode: 'system',
    codeEditorThemeMode: 'workspace',
    codeEditorOverrideThemeMode: 'system',
    isOffscreenRelationProxiesEnabled: false,
    shouldConnectOffscreenRelationProxyLines: false,
    shouldAvoidOffscreenRelationProxyActiveNodes: false,
    offscreenRelationProxyPlacementMode: 'line',
    offscreenRelationProxyVisibilityMode: 'any-overlap',
    editorSidebarWidth: EDITOR_SIDEBAR_DEFAULT_WIDTH,
    isEditorSidebarExpanded: true,
    relationLineStyle: 'bezier',
    relationHighlightMode: 'gradient',
  }
}

function partializeEditorPreferencesState(
  state: EditorPreferencesState,
): PersistedEditorPreferencesState {
  return {
    workspaceThemeMode: state.workspaceThemeMode,
    codeEditorThemeMode: state.codeEditorThemeMode,
    codeEditorOverrideThemeMode: state.codeEditorOverrideThemeMode,
    isOffscreenRelationProxiesEnabled: state.isOffscreenRelationProxiesEnabled,
    shouldConnectOffscreenRelationProxyLines:
      state.shouldConnectOffscreenRelationProxyLines,
    shouldAvoidOffscreenRelationProxyActiveNodes:
      state.shouldAvoidOffscreenRelationProxyActiveNodes,
    offscreenRelationProxyPlacementMode:
      state.offscreenRelationProxyPlacementMode,
    offscreenRelationProxyVisibilityMode:
      state.offscreenRelationProxyVisibilityMode,
    editorSidebarWidth: state.editorSidebarWidth,
    isEditorSidebarExpanded: state.isEditorSidebarExpanded,
    relationLineStyle: state.relationLineStyle,
    relationHighlightMode: state.relationHighlightMode,
  }
}

function normalizePersistedEditorPreferencesState(
  value: unknown,
): PersistedEditorPreferencesState {
  const state = isRecord(value) ? value : {}

  return {
    workspaceThemeMode: normalizeEditorThemeMode(state.workspaceThemeMode),
    codeEditorThemeMode: normalizeCodeEditorThemeMode(
      state.codeEditorThemeMode,
    ),
    codeEditorOverrideThemeMode: normalizeEditorThemeMode(
      state.codeEditorOverrideThemeMode,
    ),
    isOffscreenRelationProxiesEnabled: normalizeBoolean(
      state.isOffscreenRelationProxiesEnabled,
      false,
    ),
    shouldConnectOffscreenRelationProxyLines: normalizeBoolean(
      state.shouldConnectOffscreenRelationProxyLines,
      false,
    ),
    shouldAvoidOffscreenRelationProxyActiveNodes: normalizeBoolean(
      state.shouldAvoidOffscreenRelationProxyActiveNodes,
      false,
    ),
    offscreenRelationProxyPlacementMode:
      normalizeOffscreenRelationProxyPlacementMode(
        state.offscreenRelationProxyPlacementMode,
      ),
    offscreenRelationProxyVisibilityMode:
      normalizeOffscreenRelationProxyVisibilityMode(
        state.offscreenRelationProxyVisibilityMode,
      ),
    editorSidebarWidth: normalizeEditorSidebarWidth(state.editorSidebarWidth),
    isEditorSidebarExpanded: normalizeBoolean(
      state.isEditorSidebarExpanded,
      true,
    ),
    relationLineStyle: normalizeRelationLineStyle(state.relationLineStyle),
    relationHighlightMode: normalizeRelationHighlightMode(
      state.relationHighlightMode,
    ),
  }
}

function readPersistedEditorPreferencesState():
  | PersistedEditorPreferencesState
  | undefined {
  const storageValue = getEditorPreferencesStorageValue()

  if (!storageValue) {
    return undefined
  }

  try {
    const parsedValue = JSON.parse(storageValue) as unknown
    const persistedState =
      isRecord(parsedValue) && 'state' in parsedValue
        ? parsedValue.state
        : undefined

    return normalizePersistedEditorPreferencesState(persistedState)
  } catch {
    return undefined
  }
}

function createEditorPreferencesStorage(): StateStorage {
  return {
    getItem(name) {
      return getStorage()?.getItem(name) ?? null
    },
    setItem(name, value) {
      getStorage()?.setItem(name, value)
    },
    removeItem(name) {
      getStorage()?.removeItem(name)
    },
  }
}

function getEditorPreferencesStorageValue() {
  try {
    return getStorage()?.getItem(EDITOR_PREFERENCES_STORAGE_KEY) ?? null
  } catch {
    return null
  }
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
