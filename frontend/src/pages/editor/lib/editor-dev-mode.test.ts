import { describe, expect, it } from 'vitest'
import { isEditorDevModeEnabled } from './editor-dev-mode'

describe('isEditorDevModeEnabled', () => {
  it('enables editor dev mode only for true', () => {
    expect(isEditorDevModeEnabled('true')).toBe(true)
    expect(isEditorDevModeEnabled(' TRUE ')).toBe(true)
    expect(isEditorDevModeEnabled('false')).toBe(false)
    expect(isEditorDevModeEnabled(undefined)).toBe(false)
  })
})
