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

  it('uses iterative collision mode to avoid safe area obstacles', () => {
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
        collisionMode: 'iterative',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layout.style.top).toBe(92)
  })

  it('does not treat a iterative proxy own original table as an active obstacle', () => {
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
        collisionMode: 'iterative',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: true,
      },
    })

    expect(layout.style.top).toBe(20)
  })

  it('resolves iterative proxy overlap after avoiding hard obstacles', () => {
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
        collisionMode: 'iterative',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layouts.map((layout) => layout.style.top)).toEqual([92, 132])
    expect(
      rectanglesOverlap(getLayoutRect(layouts[0]), getLayoutRect(layouts[1])),
    ).toBe(false)
  })

  it('uses score collision mode to avoid hard obstacles and proxy overlap', () => {
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
        collisionMode: 'score',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layouts.map((layout) => layout.style.top)).toEqual([92, 132])
    expect(
      rectanglesOverlap(getLayoutRect(layouts[0]), getLayoutRect(layouts[1])),
    ).toBe(false)
  })

  it('splits iterative proxies into secondary lanes when one stack cannot fit', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', 900, 20)),
        createProxy(createTable('comments', 900, 20)),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 80 },
      obstacles: [],
      options: {
        collisionMode: 'iterative',
        placementMode: 'parallel',
        shouldAvoidActiveNodes: false,
      },
    })

    expect(layouts.map((layout) => layout.style.top)).toEqual([20, 20])
    expect(layouts.map((layout) => layout.style.left)).toEqual([602, 408])
    expect(
      rectanglesOverlap(getLayoutRect(layouts[0]), getLayoutRect(layouts[1])),
    ).toBe(false)
  })

  it('stacks iterative right-side proxies upward when they crowd the lower edge', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', 900, 60), {
          anchor: { x: 800, y: 75 },
          side: 'right',
        }),
        createProxy(createTable('comments', 900, 100), {
          anchor: { x: 800, y: 115 },
          side: 'right',
        }),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 120 },
      obstacles: [],
      options: {
        collisionMode: 'iterative',
        placementMode: 'line',
        shouldAvoidActiveNodes: false,
      },
    })
    const topByTableId = new Map(
      layouts.map((layout) => [layout.proxy.table.id, layout.style.top]),
    )

    expect(topByTableId.get('table:public.comments')).toBe(76)
    expect(topByTableId.get('table:public.users')).toBe(36)
    expect(
      rectanglesOverlap(getLayoutRect(layouts[0]), getLayoutRect(layouts[1])),
    ).toBe(false)
  })

  it('uses iterative vertical overflow intent at corners', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', 900, 0), {
          anchor: { x: 800, y: 29 },
          side: 'right',
        }),
        createProxy(createTable('comments', 760, -200), {
          anchor: { x: 760, y: 0 },
          side: 'top',
        }),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [],
      options: {
        collisionMode: 'iterative',
        placementMode: 'line',
        shouldAvoidActiveNodes: false,
      },
    })
    const layoutByTableId = new Map(
      layouts.map((layout) => [layout.proxy.table.id, layout]),
    )
    const topLayout = layoutByTableId.get('table:public.comments')
    const rightLayout = layoutByTableId.get('table:public.users')

    expect(topLayout?.style.left).toBe(602)
    expect(topLayout?.style.top).toBe(14)
    expect(rightLayout?.style.left).toBe(602)
    expect(rightLayout?.style.top).toBe(54)
    expect(
      rectanglesOverlap(getLayoutRect(topLayout!), getLayoutRect(rightLayout!)),
    ).toBe(false)
  })

  it('prioritizes iterative bottom-side proxies over left-side proxies at the lower corner', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', -200, 900), {
          anchor: { x: 0, y: 590 },
          side: 'left',
        }),
        createProxy(createTable('comments', 14, 900), {
          anchor: { x: 106, y: 586 },
          side: 'bottom',
        }),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [],
      options: {
        collisionMode: 'iterative',
        placementMode: 'line',
        shouldAvoidActiveNodes: false,
      },
    })
    const layoutByTableId = new Map(
      layouts.map((layout) => [layout.proxy.table.id, layout]),
    )
    const leftLayout = layoutByTableId.get('table:public.users')
    const bottomLayout = layoutByTableId.get('table:public.comments')

    expect(leftLayout?.style.left).toBe(14)
    expect(leftLayout?.style.top).toBe(516)
    expect(bottomLayout?.style.left).toBe(14)
    expect(bottomLayout?.style.top).toBe(556)
    expect(
      rectanglesOverlap(
        getLayoutRect(leftLayout!),
        getLayoutRect(bottomLayout!),
      ),
    ).toBe(false)
  })

  it('uses score collision mode to preserve bottom-side priority at the lower corner', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', -200, 900), {
          anchor: { x: 0, y: 590 },
          side: 'left',
        }),
        createProxy(createTable('comments', 14, 900), {
          anchor: { x: 106, y: 586 },
          side: 'bottom',
        }),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [],
      options: {
        collisionMode: 'score',
        placementMode: 'line',
        shouldAvoidActiveNodes: false,
      },
    })
    const layoutByTableId = new Map(
      layouts.map((layout) => [layout.proxy.table.id, layout]),
    )
    const leftLayout = layoutByTableId.get('table:public.users')
    const bottomLayout = layoutByTableId.get('table:public.comments')

    expect(bottomLayout?.style.left).toBe(14)
    expect(bottomLayout?.style.top).toBe(556)
    expect(leftLayout?.style.left).toBe(14)
    expect(leftLayout?.style.top).toBe(516)
    expect(
      rectanglesOverlap(
        getLayoutRect(leftLayout!),
        getLayoutRect(bottomLayout!),
      ),
    ).toBe(false)
  })

  it('does not group iterative proxies that only overlap horizontally', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', 900, 20), {
          anchor: { x: 800, y: 35 },
          side: 'right',
        }),
        createProxy(createTable('comments', 900, 620), {
          anchor: { x: 800, y: 635 },
          side: 'right',
        }),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },
      obstacles: [],
      options: {
        collisionMode: 'iterative',
        placementMode: 'line',
        shouldAvoidActiveNodes: false,
      },
    })
    const topByTableId = new Map(
      layouts.map((layout) => [layout.proxy.table.id, layout.style.top]),
    )

    expect(topByTableId.get('table:public.users')).toBe(20)
    expect(topByTableId.get('table:public.comments')).toBe(556)
    expect(
      rectanglesOverlap(getLayoutRect(layouts[0]), getLayoutRect(layouts[1])),
    ).toBe(false)
  })

  it('keeps stronger bottom-intent proxies in the primary lane', () => {
    const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
      proxies: [
        createProxy(createTable('users', 900, 0), {
          anchor: { x: 500, y: 130 },
          side: 'right',
        }),
        createProxy(createTable('comments', 900, 0), {
          anchor: { x: 500, y: 140 },
          side: 'right',
        }),
        createProxy(createTable('tags', 900, 0), {
          anchor: { x: 500, y: 150 },
          side: 'right',
        }),
      ],
      viewport: { x: 0, y: 0, zoom: 1, width: 500, height: 100 },
      obstacles: [],
      options: {
        collisionMode: 'iterative',
        placementMode: 'line',
        shouldAvoidActiveNodes: false,
      },
    })
    const layoutByTableId = new Map(
      layouts.map((layout) => [layout.proxy.table.id, layout]),
    )
    const usersLayout = layoutByTableId.get('table:public.users')
    const commentsLayout = layoutByTableId.get('table:public.comments')
    const tagsLayout = layoutByTableId.get('table:public.tags')

    expect(usersLayout?.style.left).toBe(108)
    expect(usersLayout?.style.top).toBe(56)
    expect(commentsLayout?.style.left).toBe(302)
    expect(commentsLayout?.style.top).toBe(16)
    expect(tagsLayout?.style.left).toBe(302)
    expect(tagsLayout?.style.top).toBe(56)
    expect(
      layouts.every((layout, index) =>
        layouts
          .slice(index + 1)
          .every(
            (nextLayout) =>
              !rectanglesOverlap(
                getLayoutRect(layout),
                getLayoutRect(nextLayout),
              ),
          ),
      ),
    ).toBe(true)
  })
})

function createProxy(
  table: LayoutedDbmlDiagramTable,
  options: {
    anchor?: DbmlOffscreenRelationProxy['anchor']
    side?: DbmlOffscreenRelationProxy['side']
  } = {},
): DbmlOffscreenRelationProxy {
  return {
    id: `offscreen-proxy:${table.id}`,
    table,
    side: options.side ?? 'right',
    anchor: options.anchor ?? { x: 800, y: 35 },
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
