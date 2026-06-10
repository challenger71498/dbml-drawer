import { describe, expect, it } from 'vitest'
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
