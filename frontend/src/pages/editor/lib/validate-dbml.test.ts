import { describe, expect, it } from 'vitest'
import { DBML_PRESETS } from './dbml-presets'
import { validateDbml } from './validate-dbml'

describe('validateDbml', () => {
  it('returns no diagnostics for valid DBML', () => {
    const result = validateDbml(`Table users {
  id integer [pk]
}
`)

    expect(result.valid).toBe(true)
    expect(result.diagnostics).toEqual([])
  })

  it('keeps every DBML preset valid', () => {
    for (const preset of DBML_PRESETS) {
      const result = validateDbml(preset.document)

      expect(result.diagnostics, preset.id).toEqual([])
      expect(result.valid, preset.id).toBe(true)
    }
  })

  it('normalizes parser errors for invalid DBML', () => {
    const result = validateDbml('Table users {')

    expect(result.valid).toBe(false)
    expect(result.diagnostics).toHaveLength(1)
    expect(result.diagnostics[0]).toMatchObject({
      severity: 'error',
    })
    expect(result.diagnostics[0]?.message).toContain('Expected')
  })
})
