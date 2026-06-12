import { describe, expect, it } from 'vitest'
import { normalizeOffscreenRelationProxyTransitionMode } from './editor-theme-options'

describe('editor theme options', () => {
  it('normalizes offscreen relation proxy transition modes', () => {
    expect(normalizeOffscreenRelationProxyTransitionMode('none')).toBe('none')
    expect(normalizeOffscreenRelationProxyTransitionMode('opacity')).toBe(
      'opacity',
    )
    expect(normalizeOffscreenRelationProxyTransitionMode('morph')).toBe('morph')
    expect(normalizeOffscreenRelationProxyTransitionMode('unknown')).toBe(
      'none',
    )
  })
})
