import { describe, expect, it } from 'vitest'
import type { DbmlOffscreenRelationProxy } from './dbml-offscreen-relation-proxies'
import type { DbmlOffscreenRelationProxyLayout } from './dbml-offscreen-relation-proxy-layout'
import { getOffscreenRelationProxyTransitionLayouts } from './dbml-offscreen-relation-proxy-transition'
import type { LayoutedDbmlDiagramTable } from './dbml-layout'

const VIEWPORT = { x: 0, y: 0, zoom: 1, width: 800, height: 600 }

describe('dbml offscreen relation proxy transition', () => {
  it('keeps proxy layout unchanged for none transition mode', () => {
    const layout = createLayout(createTable('users', 900, 20))

    expect(
      getOffscreenRelationProxyTransitionLayouts({
        layouts: [layout],
        viewport: VIEWPORT,
        options: { mode: 'none' },
      }),
    ).toEqual([layout])
  })

  it('fades a proxy as its original table approaches the viewport', () => {
    const [layout] = getOffscreenRelationProxyTransitionLayouts({
      layouts: [createLayout(createTable('users', 805, 20))],
      viewport: VIEWPORT,
      options: { mode: 'opacity' },
    })

    expect(layout.style.opacity).toBeLessThan(0.5)
    expect(layout.style.left).toBe(602)
    expect(layout.style.top).toBe(20)
  })

  it('keeps full opacity while the original table is far from the viewport', () => {
    const [layout] = getOffscreenRelationProxyTransitionLayouts({
      layouts: [createLayout(createTable('users', 1200, 20))],
      viewport: VIEWPORT,
      options: { mode: 'opacity' },
    })

    expect(layout.style.opacity).toBe(1)
  })

  it('falls back to none behavior for morph until morph animation is implemented', () => {
    const layout = createLayout(createTable('users', 805, 20))

    expect(
      getOffscreenRelationProxyTransitionLayouts({
        layouts: [layout],
        viewport: VIEWPORT,
        options: { mode: 'morph' },
      }),
    ).toEqual([layout])
  })
})

function createLayout(
  table: LayoutedDbmlDiagramTable,
): DbmlOffscreenRelationProxyLayout {
  return {
    proxy: createProxy(table),
    style: {
      left: 602,
      top: 20,
      transform: 'scale(1)',
    },
  }
}

function createProxy(
  table: LayoutedDbmlDiagramTable,
): DbmlOffscreenRelationProxy {
  return {
    id: `offscreen-proxy:${table.id}`,
    table,
    side: 'right',
    anchor: { x: 800, y: 35 },
    relationIds: ['relation:posts-users'],
    columns: [],
  }
}

function createTable(
  name: string,
  x: number,
  y: number,
): LayoutedDbmlDiagramTable {
  return {
    id: `table:public.${name}`,
    name,
    schemaName: 'public',
    columns: [],
    ports: [],
    size: {
      width: 184,
      height: 30,
    },
    source: {} as LayoutedDbmlDiagramTable['source'],
    position: { x, y },
  }
}
