import { describe, expect, it } from 'vitest'
import { createDbmlLayoutCacheKey } from './dbml-document'

describe('dbml document model', () => {
  it('changes the layout cache key when the layout algorithm changes', () => {
    const documentText = `Table users {
  id integer [pk]
}
`

    expect(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
      }),
    ).not.toBe(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.force',
      }),
    )
  })

  it('changes the layout cache key when a layout option changes', () => {
    const documentText = `Table users {
  id integer [pk]
}
`

    expect(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        optionValues: {
          'elk.direction': 'RIGHT',
        },
      }),
    ).not.toBe(
      createDbmlLayoutCacheKey({
        documentText,
        algorithmId: 'org.eclipse.elk.layered',
        optionValues: {
          'elk.direction': 'DOWN',
        },
      }),
    )
  })
})
