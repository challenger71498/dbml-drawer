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
