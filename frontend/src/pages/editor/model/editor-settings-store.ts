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
  DbmlRelationPortRoutingMode,
} from './dbml-diagram-rendering'
import {
  DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
  getDefaultDbmlLayoutOptionValues,
  normalizeDbmlLayoutOptionValues,
  type DbmlLayoutAlgorithmId,
  type DbmlLayoutOptionValueMap,
} from './dbml-layout-settings'
import {
  EDITOR_SETTINGS_STORAGE_KEY,
  EDITOR_SIDEBAR_DEFAULT_WIDTH,
  getSystemTheme,
  getSystemThemeQuery,
  normalizeBoolean,
  normalizeCodeEditorThemeMode,
  normalizeEditorSidebarWidth,
  normalizeEditorThemeMode,
  normalizeOffscreenRelationProxyPlacementMode,
  normalizeOffscreenRelationProxyCollisionMode,
  normalizeOffscreenRelationProxyTransitionMode,
  normalizeOffscreenRelationProxyVisibilityMode,
  normalizeRelationHighlightMode,
  normalizeRelationLineStyle,
  normalizeRelationPortRoutingMode,
  resolveCodeEditorThemeMode,
  resolveSystemTheme,
  resolveThemeMode,
  type CodeEditorThemeMode,
  type EditorThemeMode,
  type OffscreenRelationProxyPlacementMode,
  type OffscreenRelationProxyCollisionMode,
  type OffscreenRelationProxyTransitionMode,
  type OffscreenRelationProxyVisibilityMode,
  type ResolvedEditorTheme,
} from './editor-theme-options'

export type EditorSettingsState = {
  systemTheme: ResolvedEditorTheme
  workspaceThemeMode: EditorThemeMode
  codeEditorThemeMode: CodeEditorThemeMode
  codeEditorOverrideThemeMode: EditorThemeMode
  isOffscreenRelationProxiesEnabled: boolean
  shouldConnectOffscreenRelationProxyLines: boolean
  shouldAvoidOffscreenRelationProxyActiveNodes: boolean
  offscreenRelationProxyCollisionMode: OffscreenRelationProxyCollisionMode
  offscreenRelationProxyPlacementMode: OffscreenRelationProxyPlacementMode
  offscreenRelationProxyVisibilityMode: OffscreenRelationProxyVisibilityMode
  offscreenRelationProxyTransitionMode: OffscreenRelationProxyTransitionMode
  editorSidebarWidth: number
  isEditorSidebarExpanded: boolean
  relationLineStyle: DbmlRelationLineStyle
  relationHighlightMode: DbmlRelationHighlightMode
  relationPortRoutingMode: DbmlRelationPortRoutingMode
  selectedLayoutAlgorithmId: DbmlLayoutAlgorithmId
  selectedLayoutOptionValues: DbmlLayoutOptionValueMap
  setSystemTheme: (theme: ResolvedEditorTheme) => void
  setWorkspaceThemeMode: (mode: EditorThemeMode) => void
  setCodeEditorThemeMode: (mode: CodeEditorThemeMode) => void
  setCodeEditorOverrideThemeMode: (mode: EditorThemeMode) => void
  setOffscreenRelationProxiesEnabled: (isEnabled: boolean) => void
  setShouldConnectOffscreenRelationProxyLines: (shouldConnect: boolean) => void
  setShouldAvoidOffscreenRelationProxyActiveNodes: (
    shouldAvoid: boolean,
  ) => void
  setOffscreenRelationProxyCollisionMode: (
    mode: OffscreenRelationProxyCollisionMode,
  ) => void
  setOffscreenRelationProxyPlacementMode: (
    mode: OffscreenRelationProxyPlacementMode,
  ) => void
  setOffscreenRelationProxyVisibilityMode: (
    mode: OffscreenRelationProxyVisibilityMode,
  ) => void
  setOffscreenRelationProxyTransitionMode: (
    mode: OffscreenRelationProxyTransitionMode,
  ) => void
  setEditorSidebarWidth: (width: number) => void
  setEditorSidebarExpanded: (isExpanded: boolean) => void
  setRelationLineStyle: (style: DbmlRelationLineStyle) => void
  setRelationHighlightMode: (mode: DbmlRelationHighlightMode) => void
  setRelationPortRoutingMode: (mode: DbmlRelationPortRoutingMode) => void
  selectLayoutAlgorithm: (algorithmId: DbmlLayoutAlgorithmId) => void
  setSelectedLayoutOptionValue: (optionId: string, value: string) => void
}

export type EditorSettings = Pick<
  EditorSettingsState,
  | 'workspaceThemeMode'
  | 'codeEditorThemeMode'
  | 'codeEditorOverrideThemeMode'
  | 'isOffscreenRelationProxiesEnabled'
  | 'shouldConnectOffscreenRelationProxyLines'
  | 'shouldAvoidOffscreenRelationProxyActiveNodes'
  | 'offscreenRelationProxyCollisionMode'
  | 'offscreenRelationProxyPlacementMode'
  | 'offscreenRelationProxyVisibilityMode'
  | 'offscreenRelationProxyTransitionMode'
  | 'editorSidebarWidth'
  | 'isEditorSidebarExpanded'
  | 'relationLineStyle'
  | 'relationHighlightMode'
  | 'relationPortRoutingMode'
  | 'selectedLayoutAlgorithmId'
  | 'selectedLayoutOptionValues'
  | 'setWorkspaceThemeMode'
  | 'setCodeEditorThemeMode'
  | 'setCodeEditorOverrideThemeMode'
  | 'setOffscreenRelationProxiesEnabled'
  | 'setShouldConnectOffscreenRelationProxyLines'
  | 'setShouldAvoidOffscreenRelationProxyActiveNodes'
  | 'setOffscreenRelationProxyCollisionMode'
  | 'setOffscreenRelationProxyPlacementMode'
  | 'setOffscreenRelationProxyVisibilityMode'
  | 'setOffscreenRelationProxyTransitionMode'
  | 'setEditorSidebarWidth'
  | 'setEditorSidebarExpanded'
  | 'setRelationLineStyle'
  | 'setRelationHighlightMode'
  | 'setRelationPortRoutingMode'
  | 'selectLayoutAlgorithm'
  | 'setSelectedLayoutOptionValue'
> & {
  resolvedWorkspaceTheme: ResolvedEditorTheme
  resolvedCodeEditorTheme: ResolvedEditorTheme
}

type EditorSettingsData = Omit<
  EditorSettingsState,
  | 'setSystemTheme'
  | 'setWorkspaceThemeMode'
  | 'setCodeEditorThemeMode'
  | 'setCodeEditorOverrideThemeMode'
  | 'setOffscreenRelationProxiesEnabled'
  | 'setShouldConnectOffscreenRelationProxyLines'
  | 'setShouldAvoidOffscreenRelationProxyActiveNodes'
  | 'setOffscreenRelationProxyCollisionMode'
  | 'setOffscreenRelationProxyPlacementMode'
  | 'setOffscreenRelationProxyVisibilityMode'
  | 'setOffscreenRelationProxyTransitionMode'
  | 'setEditorSidebarWidth'
  | 'setEditorSidebarExpanded'
  | 'setRelationLineStyle'
  | 'setRelationHighlightMode'
  | 'setRelationPortRoutingMode'
  | 'selectLayoutAlgorithm'
  | 'setSelectedLayoutOptionValue'
>

type PersistedEditorSettingsState = Omit<EditorSettingsData, 'systemTheme'>

const useEditorSettingsStore = create<EditorSettingsState>()(
  persist(
    (set) => ({
      ...getDefaultEditorSettingsState(),
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
      setOffscreenRelationProxyCollisionMode: (mode) =>
        set({ offscreenRelationProxyCollisionMode: mode }),
      setOffscreenRelationProxyPlacementMode: (mode) =>
        set({ offscreenRelationProxyPlacementMode: mode }),
      setOffscreenRelationProxyVisibilityMode: (mode) =>
        set({ offscreenRelationProxyVisibilityMode: mode }),
      setOffscreenRelationProxyTransitionMode: (mode) =>
        set({ offscreenRelationProxyTransitionMode: mode }),
      setEditorSidebarWidth: (width) =>
        set({ editorSidebarWidth: normalizeEditorSidebarWidth(width) }),
      setEditorSidebarExpanded: (isExpanded) =>
        set({ isEditorSidebarExpanded: isExpanded }),
      setRelationLineStyle: (style) => set({ relationLineStyle: style }),
      setRelationHighlightMode: (mode) => set({ relationHighlightMode: mode }),
      setRelationPortRoutingMode: (mode) =>
        set({ relationPortRoutingMode: mode }),
      selectLayoutAlgorithm: (algorithmId) =>
        set({
          selectedLayoutAlgorithmId: algorithmId,
          selectedLayoutOptionValues:
            getDefaultDbmlLayoutOptionValues(algorithmId),
        }),
      setSelectedLayoutOptionValue: (optionId, value) =>
        set((state) => ({
          selectedLayoutOptionValues: normalizeDbmlLayoutOptionValues({
            ...state.selectedLayoutOptionValues,
            [optionId]: value,
          }),
        })),
    }),
    {
      name: EDITOR_SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(createEditorSettingsStorage),
      partialize: (state): PersistedEditorSettingsState =>
        partializeEditorSettingsState(state),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedEditorSettingsState(persistedState),
        systemTheme: getSystemTheme(),
      }),
    },
  ),
)

export function useEditorSettings(): EditorSettings {
  const systemTheme = useEditorSettingsStore((state) => state.systemTheme)
  const workspaceThemeMode = useEditorSettingsStore(
    (state) => state.workspaceThemeMode,
  )
  const codeEditorThemeMode = useEditorSettingsStore(
    (state) => state.codeEditorThemeMode,
  )
  const codeEditorOverrideThemeMode = useEditorSettingsStore(
    (state) => state.codeEditorOverrideThemeMode,
  )
  const isOffscreenRelationProxiesEnabled = useEditorSettingsStore(
    (state) => state.isOffscreenRelationProxiesEnabled,
  )
  const shouldConnectOffscreenRelationProxyLines = useEditorSettingsStore(
    (state) => state.shouldConnectOffscreenRelationProxyLines,
  )
  const shouldAvoidOffscreenRelationProxyActiveNodes = useEditorSettingsStore(
    (state) => state.shouldAvoidOffscreenRelationProxyActiveNodes,
  )
  const offscreenRelationProxyPlacementMode = useEditorSettingsStore(
    (state) => state.offscreenRelationProxyPlacementMode,
  )
  const offscreenRelationProxyCollisionMode = useEditorSettingsStore(
    (state) => state.offscreenRelationProxyCollisionMode,
  )
  const offscreenRelationProxyVisibilityMode = useEditorSettingsStore(
    (state) => state.offscreenRelationProxyVisibilityMode,
  )
  const offscreenRelationProxyTransitionMode = useEditorSettingsStore(
    (state) => state.offscreenRelationProxyTransitionMode,
  )
  const editorSidebarWidth = useEditorSettingsStore(
    (state) => state.editorSidebarWidth,
  )
  const isEditorSidebarExpanded = useEditorSettingsStore(
    (state) => state.isEditorSidebarExpanded,
  )
  const relationLineStyle = useEditorSettingsStore(
    (state) => state.relationLineStyle,
  )
  const relationHighlightMode = useEditorSettingsStore(
    (state) => state.relationHighlightMode,
  )
  const relationPortRoutingMode = useEditorSettingsStore(
    (state) => state.relationPortRoutingMode,
  )
  const selectedLayoutAlgorithmId = useEditorSettingsStore(
    (state) => state.selectedLayoutAlgorithmId,
  )
  const selectedLayoutOptionValues = useEditorSettingsStore(
    (state) => state.selectedLayoutOptionValues,
  )
  const setSystemTheme = useEditorSettingsStore((state) => state.setSystemTheme)
  const setWorkspaceThemeMode = useEditorSettingsStore(
    (state) => state.setWorkspaceThemeMode,
  )
  const setCodeEditorThemeMode = useEditorSettingsStore(
    (state) => state.setCodeEditorThemeMode,
  )
  const setCodeEditorOverrideThemeMode = useEditorSettingsStore(
    (state) => state.setCodeEditorOverrideThemeMode,
  )
  const setOffscreenRelationProxiesEnabled = useEditorSettingsStore(
    (state) => state.setOffscreenRelationProxiesEnabled,
  )
  const setShouldConnectOffscreenRelationProxyLines = useEditorSettingsStore(
    (state) => state.setShouldConnectOffscreenRelationProxyLines,
  )
  const setShouldAvoidOffscreenRelationProxyActiveNodes =
    useEditorSettingsStore(
      (state) => state.setShouldAvoidOffscreenRelationProxyActiveNodes,
    )
  const setOffscreenRelationProxyPlacementMode = useEditorSettingsStore(
    (state) => state.setOffscreenRelationProxyPlacementMode,
  )
  const setOffscreenRelationProxyCollisionMode = useEditorSettingsStore(
    (state) => state.setOffscreenRelationProxyCollisionMode,
  )
  const setOffscreenRelationProxyVisibilityMode = useEditorSettingsStore(
    (state) => state.setOffscreenRelationProxyVisibilityMode,
  )
  const setOffscreenRelationProxyTransitionMode = useEditorSettingsStore(
    (state) => state.setOffscreenRelationProxyTransitionMode,
  )
  const setEditorSidebarWidth = useEditorSettingsStore(
    (state) => state.setEditorSidebarWidth,
  )
  const setEditorSidebarExpanded = useEditorSettingsStore(
    (state) => state.setEditorSidebarExpanded,
  )
  const setRelationLineStyle = useEditorSettingsStore(
    (state) => state.setRelationLineStyle,
  )
  const setRelationHighlightMode = useEditorSettingsStore(
    (state) => state.setRelationHighlightMode,
  )
  const setRelationPortRoutingMode = useEditorSettingsStore(
    (state) => state.setRelationPortRoutingMode,
  )
  const selectLayoutAlgorithm = useEditorSettingsStore(
    (state) => state.selectLayoutAlgorithm,
  )
  const setSelectedLayoutOptionValue = useEditorSettingsStore(
    (state) => state.setSelectedLayoutOptionValue,
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
    offscreenRelationProxyCollisionMode,
    offscreenRelationProxyPlacementMode,
    offscreenRelationProxyVisibilityMode,
    offscreenRelationProxyTransitionMode,
    editorSidebarWidth,
    isEditorSidebarExpanded,
    relationLineStyle,
    relationHighlightMode,
    relationPortRoutingMode,
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues,
    setWorkspaceThemeMode,
    setCodeEditorThemeMode,
    setCodeEditorOverrideThemeMode,
    setOffscreenRelationProxiesEnabled,
    setShouldConnectOffscreenRelationProxyLines,
    setShouldAvoidOffscreenRelationProxyActiveNodes,
    setOffscreenRelationProxyCollisionMode,
    setOffscreenRelationProxyPlacementMode,
    setOffscreenRelationProxyVisibilityMode,
    setOffscreenRelationProxyTransitionMode,
    setEditorSidebarWidth,
    setEditorSidebarExpanded,
    setRelationLineStyle,
    setRelationHighlightMode,
    setRelationPortRoutingMode,
    selectLayoutAlgorithm,
    setSelectedLayoutOptionValue,
  }
}

export function useSelectedDbmlLayoutAlgorithmId() {
  return useEditorSettingsStore((state) => state.selectedLayoutAlgorithmId)
}

export function useSelectedDbmlLayoutOptionValues() {
  return useEditorSettingsStore((state) => state.selectedLayoutOptionValues)
}

export function useSelectDbmlLayoutAlgorithm() {
  return useEditorSettingsStore((state) => state.selectLayoutAlgorithm)
}

export function useSetSelectedDbmlLayoutOptionValue() {
  return useEditorSettingsStore((state) => state.setSelectedLayoutOptionValue)
}

export function useRelationLineStyleSetting() {
  return useEditorSettingsStore((state) => state.relationLineStyle)
}

export function useRelationHighlightModeSetting() {
  return useEditorSettingsStore((state) => state.relationHighlightMode)
}

export function useRelationPortRoutingModeSetting() {
  return useEditorSettingsStore((state) => state.relationPortRoutingMode)
}

export function useSetRelationLineStyle() {
  return useEditorSettingsStore((state) => state.setRelationLineStyle)
}

export function useSetRelationHighlightMode() {
  return useEditorSettingsStore((state) => state.setRelationHighlightMode)
}

export function resetEditorSettingsStoreForTests() {
  useEditorSettingsStore.setState(
    {
      ...getDefaultEditorSettingsState(),
      ...readPersistedEditorSettingsState(),
    },
    false,
  )
}

export function getEditorSettingsStateForTests() {
  return useEditorSettingsStore.getState()
}

function getDefaultEditorSettingsState(): EditorSettingsData {
  return {
    systemTheme: getSystemTheme(),
    workspaceThemeMode: 'system',
    codeEditorThemeMode: 'workspace',
    codeEditorOverrideThemeMode: 'system',
    isOffscreenRelationProxiesEnabled: false,
    shouldConnectOffscreenRelationProxyLines: false,
    shouldAvoidOffscreenRelationProxyActiveNodes: false,
    offscreenRelationProxyCollisionMode: 'legacy',
    offscreenRelationProxyPlacementMode: 'line',
    offscreenRelationProxyVisibilityMode: 'any-overlap',
    offscreenRelationProxyTransitionMode: 'none',
    editorSidebarWidth: EDITOR_SIDEBAR_DEFAULT_WIDTH,
    isEditorSidebarExpanded: true,
    relationLineStyle: 'bezier',
    relationHighlightMode: 'gradient',
    relationPortRoutingMode: 'fixed',
    selectedLayoutAlgorithmId: DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
    selectedLayoutOptionValues: getDefaultDbmlLayoutOptionValues(
      DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
    ),
  }
}

function partializeEditorSettingsState(
  state: EditorSettingsState,
): PersistedEditorSettingsState {
  return {
    workspaceThemeMode: state.workspaceThemeMode,
    codeEditorThemeMode: state.codeEditorThemeMode,
    codeEditorOverrideThemeMode: state.codeEditorOverrideThemeMode,
    isOffscreenRelationProxiesEnabled: state.isOffscreenRelationProxiesEnabled,
    shouldConnectOffscreenRelationProxyLines:
      state.shouldConnectOffscreenRelationProxyLines,
    shouldAvoidOffscreenRelationProxyActiveNodes:
      state.shouldAvoidOffscreenRelationProxyActiveNodes,
    offscreenRelationProxyCollisionMode:
      state.offscreenRelationProxyCollisionMode,
    offscreenRelationProxyPlacementMode:
      state.offscreenRelationProxyPlacementMode,
    offscreenRelationProxyVisibilityMode:
      state.offscreenRelationProxyVisibilityMode,
    offscreenRelationProxyTransitionMode:
      state.offscreenRelationProxyTransitionMode,
    editorSidebarWidth: state.editorSidebarWidth,
    isEditorSidebarExpanded: state.isEditorSidebarExpanded,
    relationLineStyle: state.relationLineStyle,
    relationHighlightMode: state.relationHighlightMode,
    relationPortRoutingMode: state.relationPortRoutingMode,
    selectedLayoutAlgorithmId: state.selectedLayoutAlgorithmId,
    selectedLayoutOptionValues: state.selectedLayoutOptionValues,
  }
}

function normalizePersistedEditorSettingsState(
  value: unknown,
): PersistedEditorSettingsState {
  const state = isRecord(value) ? value : {}
  const selectedLayoutAlgorithmId =
    typeof state.selectedLayoutAlgorithmId === 'string'
      ? state.selectedLayoutAlgorithmId
      : DEFAULT_DBML_LAYOUT_ALGORITHM_ID

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
    offscreenRelationProxyCollisionMode:
      normalizeOffscreenRelationProxyCollisionMode(
        state.offscreenRelationProxyCollisionMode,
      ),
    offscreenRelationProxyPlacementMode:
      normalizeOffscreenRelationProxyPlacementMode(
        state.offscreenRelationProxyPlacementMode,
      ),
    offscreenRelationProxyVisibilityMode:
      normalizeOffscreenRelationProxyVisibilityMode(
        state.offscreenRelationProxyVisibilityMode,
      ),
    offscreenRelationProxyTransitionMode:
      normalizeOffscreenRelationProxyTransitionMode(
        state.offscreenRelationProxyTransitionMode,
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
    relationPortRoutingMode: normalizeRelationPortRoutingMode(
      state.relationPortRoutingMode,
    ),
    selectedLayoutAlgorithmId,
    selectedLayoutOptionValues: normalizeDbmlLayoutOptionValues(
      isStringRecord(state.selectedLayoutOptionValues)
        ? state.selectedLayoutOptionValues
        : getDefaultDbmlLayoutOptionValues(selectedLayoutAlgorithmId),
    ),
  }
}

function readPersistedEditorSettingsState():
  | PersistedEditorSettingsState
  | undefined {
  const storageValue = getEditorSettingsStorageValue()

  if (!storageValue) {
    return undefined
  }

  try {
    const parsedValue = JSON.parse(storageValue) as unknown
    const persistedState =
      isRecord(parsedValue) && 'state' in parsedValue
        ? parsedValue.state
        : undefined

    return normalizePersistedEditorSettingsState(persistedState)
  } catch {
    return undefined
  }
}

function createEditorSettingsStorage(): StateStorage {
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

function getEditorSettingsStorageValue() {
  try {
    return getStorage()?.getItem(EDITOR_SETTINGS_STORAGE_KEY) ?? null
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

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  )
}
