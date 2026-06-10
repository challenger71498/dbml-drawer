/// <reference types="vite/client" />

import type { languages } from 'monaco-editor'

export {}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
    readonly VITE_EDITOR_DEV_MODE?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

declare module '@dbml/core' {
  export const dbmlMonarchTokensProvider: languages.IMonarchLanguage
}
