import { describe, expect, it } from 'vitest'
import type { DbmlOffscreenRelationProxy } from './proxy'
import type { DbmlOffscreenRelationProxyLayout } from './layout'
import { getOffscreenRelationProxyTransitionLayouts } from './transition'
import type { LayoutedDbmlDiagramTable } from '../../model/dbml-layout'

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
      layouts: [
        createLayout(
          createTable('users', 598, 20, {
            height: 180,
            width: 260,
          }),
        ),
      ],
      viewport: VIEWPORT,
      options: { mode: 'opacity' },
    })

    expect(layout.style.opacity).toBeLessThan(0.5)
    expect(layout.originalOpacity).toBeGreaterThan(0.5)
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

  it('morphs a proxy toward its original table during handoff', () => {
    const [layout] = getOffscreenRelationProxyTransitionLayouts({
      layouts: [
        createLayout(
          createTable('users', 598, 20, {
            height: 180,
            width: 260,
          }),
        ),
      ],
      viewport: VIEWPORT,
      options: { mode: 'morph' },
    })

    expect(layout.handoffProgress).toBeGreaterThan(0.9)
    expect(layout.screenRect?.left).toBeGreaterThan(590)
    expect(layout.screenRect?.width).toBeGreaterThan(250)
    expect(layout.style.height).toBeGreaterThan(160)
    expect(layout.style.left).toBe(layout.screenRect?.left)
    expect(layout.style.opacity).toBeUndefined()
    expect(layout.style.transform).toBe('scale(1)')
    expect(layout.style.width).toBeGreaterThan(250)
  })

  it('keeps morph layout unchanged while the original table is far away', () => {
    const layout = createLayout(
      createTable('users', 675, 20, {
        height: 180,
        width: 260,
      }),
    )

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
  size: { width: number; height: number } = { width: 184, height: 30 },
): LayoutedDbmlDiagramTable {
  return {
    id: `table:public.${name}`,
    name,
    schemaName: 'public',
    columns: [],
    ports: [],
    size,
    source: {} as LayoutedDbmlDiagramTable['source'],
    position: { x, y },
  }
}
