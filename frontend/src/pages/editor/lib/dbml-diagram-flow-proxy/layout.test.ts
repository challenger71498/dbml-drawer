import { describe, expect, it } from 'vitest'
import type { DbmlOffscreenRelationProxy } from './proxy'
import { legacyOffscreenRelationProxyLayoutStrategy } from './layout'
import type { LayoutedDbmlDiagramTable } from '../../model/dbml-layout'

describe('dbml offscreen relation proxy layout', () => {
  it('does not move a proxy away from its own original table obstacle', () => {
    const proxy = createProxy(createTable('users', 900, 20))
    const [layout] = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [proxy],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [
        {
          id: proxy.table.id,
          kind: 'active-node',
          rect: {
            left: 602,
            top: 20,
            width: 184,
            height: 30,
          },
        },
      ],
      options: {
        placementMode: 'parallel',
        shouldAvoidActiveNodes: true,
      },
    })

    expect(layout.style.top).toBe(20)
  })

  it('moves a proxy away from other active table obstacles', () => {
    const proxy = createProxy(createTable('users', 900, 20))
    const [layout] = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [proxy],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [
        {
          id: 'table:public.posts',
          kind: 'active-node',
          rect: {
            left: 602,
            top: 20,
            width: 184,
            height: 30,
          },
        },
      ],
      options: {
        placementMode: 'parallel',
        shouldAvoidActiveNodes: true,
      },
    })

    expect(layout.style.top).toBe(60)
  })

  it('moves a proxy away from safe area obstacles even when active-node avoidance is disabled', () => {
    const proxy = createProxy(createTable('users', 900, 20))
    const [layout] = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [proxy],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [
        {
          id: 'preview-top-right-relation-style-control',
          kind: 'safe-area',
          rect: {
            left: 554,
            top: 12,
            width: 232,
            height: 70,
          },
        },
      ],
      options: {
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layout.style.top).toBe(92)
  })

  it('uses constrained collision mode to avoid safe area obstacles', () => {
    const proxy = createProxy(createTable('users', 900, 20))
    const [layout] = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [proxy],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [
        {
          id: 'preview-top-right-relation-style-control',
          kind: 'safe-area',
          rect: {
            left: 554,
            top: 12,
            width: 232,
            height: 70,
          },
        },
      ],
      options: {
        collisionMode: 'constrained',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layout.style.top).toBe(92)
  })

  it('does not treat a constrained proxy own original table as an active obstacle', () => {
    const proxy = createProxy(createTable('users', 900, 20))
    const [layout] = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [proxy],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [
        {
          id: proxy.table.id,
          kind: 'active-node',
          rect: {
            left: 602,
            top: 20,
            width: 184,
            height: 30,
          },
        },
      ],
      options: {
        collisionMode: 'constrained',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: true,
      },
    })

    expect(layout.style.top).toBe(20)
  })

  it('resolves constrained proxy overlap after avoiding hard obstacles', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', 900, 20)),
        createProxy(createTable('comments', 900, 20)),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [
        {
          id: 'preview-top-right-relation-style-control',
          kind: 'safe-area',
          rect: {
            left: 554,
            top: 12,
            width: 232,
            height: 70,
          },
        },
      ],
      options: {
        collisionMode: 'constrained',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layouts.map((layout) => layout.style.top)).toEqual([92, 132])
    expect(
      rectanglesOverlap(getLayoutRect(layouts[0]), getLayoutRect(layouts[1])),
    ).toBe(false)
  })

  it('uses deterministic constrained fallback when proxy cards cannot fully fit', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', 900, 20)),
        createProxy(createTable('comments', 900, 20)),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 80 },
      obstacles: [],
      options: {
        collisionMode: 'constrained',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layouts.map((layout) => layout.style.top)).toEqual([20, 36])
  })
})

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

function getLayoutRect(layout: {
  style: { left: number; top: number }
  proxy: { columns: readonly unknown[] }
}) {
  return {
    left: layout.style.left,
    top: layout.style.top,
    width: 184,
    height: 30 + layout.proxy.columns.length * 30,
  }
}

function rectanglesOverlap(
  first: ReturnType<typeof getLayoutRect>,
  second: ReturnType<typeof getLayoutRect>,
) {
  return (
    first.left < second.left + second.width &&
    first.left + first.width > second.left &&
    first.top < second.top + second.height &&
    first.top + first.height > second.top
  )
}
