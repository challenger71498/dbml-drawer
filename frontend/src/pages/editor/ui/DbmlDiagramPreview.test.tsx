import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { Position } from '@xyflow/react'
import { useState, type CSSProperties } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDbmlDiagram } from '../lib/create-dbml-diagram'
import { layoutDbmlDiagram } from '../lib/layout-dbml-diagram'
import { parseDbmlDocument } from '../lib/parse-dbml-document'
import {
  getActiveDiagramSelectionTarget,
  getActiveRelationIds,
  getActiveTableIds,
  getRelationEndpointColumnIdsForTargets,
  getRelationIdsForTargets,
  type DbmlDiagramSelectionTarget,
} from '../model/dbml-diagram-selection'
import {
  DBML_RELATION_REFERENCE_COLOR,
  DBML_RELATION_SOURCE_COLOR,
} from '../model/dbml-diagram-rendering'
import { resetEditorSettingsStoreForTests } from '../model/editor-theme'
import { EDITOR_COLOR_VARIABLES } from '../../../shared/design-tokens/generated/tokens'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import { DbmlDiagramSelectionViewProvider } from './DbmlDiagramSelectionViewProvider'
import { DbmlDiagramPreview } from './DbmlDiagramPreview'
import { DbmlRelationEdge } from './DbmlRelationEdge'

const reactFlowProps = vi.hoisted(() => ({
  capture: vi.fn(),
  fitView: vi.fn(),
  getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  getZoom: vi.fn(() => 1),
  setCenter: vi.fn(),
}))

vi.mock('@xyflow/react', () => ({
  Background: ({ color }: { color?: string }) => (
    <div data-testid="diagram-background" data-color={color} />
  ),
  BaseEdge: ({ path, style }: { path: string; style?: CSSProperties }) => (
    <path
      data-testid="diagram-edge"
      d={path}
      data-opacity={String(style?.opacity ?? '')}
      data-stroke={String(style?.stroke ?? '')}
      data-stroke-dasharray={String(style?.strokeDasharray ?? '')}
      data-stroke-linecap={String(style?.strokeLinecap ?? '')}
      data-stroke-width={String(style?.strokeWidth ?? '')}
    />
  ),
  Controls: () => <div data-testid="diagram-controls" />,
  getBezierPath: ({
    sourceX,
    sourceY,
    targetX,
    targetY,
  }: {
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
  }) => [
    `M ${sourceX} ${sourceY} C 48 ${sourceY} 72 ${targetY} ${targetX} ${targetY}`,
  ],
  Handle: ({ id }: { id: string }) => <span data-handle-id={id} />,
  Position: {
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
    Top: 'top',
  },
  ReactFlow: ({
    children,
    nodeTypes,
    nodes,
    edgeTypes,
    edges,
    ...props
  }: {
    children: React.ReactNode
    edgeTypes: Record<string, React.ComponentType<Record<string, unknown>>>
    edges: Array<{ id: string; type?: string; data: unknown; zIndex?: number }>
    nodeTypes: Record<string, React.ComponentType<{ data: unknown }>>
    onNodeClick?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown; zIndex?: number },
    ) => void
    onNodeMouseEnter?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown; zIndex?: number },
    ) => void
    onNodeMouseLeave?: (
      event: React.MouseEvent<HTMLDivElement>,
      node: { id: string; type?: string; data: unknown; zIndex?: number },
    ) => void
    onPaneClick?: (event: React.MouseEvent<HTMLDivElement>) => void
    nodes: Array<{
      id: string
      className?: string
      type?: string
      data: unknown
      zIndex?: number
    }>
    [key: string]: unknown
  }) => (
    reactFlowProps.capture({ ...props, edges, nodes }),
    (
      <div aria-label="Diagram canvas">
        <div
          data-testid="diagram-pane"
          onClick={(event) => props.onPaneClick?.(event)}
        />
        {nodes.map((node) => {
          const NodeComponent = nodeTypes[node.type ?? '']

          return NodeComponent ? (
            <div
              className={node.className}
              data-testid={`diagram-node-${node.id}`}
              data-node-id={node.id}
              data-z-index={String(node.zIndex ?? 0)}
              key={node.id}
              onClick={(event) => props.onNodeClick?.(event, node)}
              onMouseEnter={(event) => props.onNodeMouseEnter?.(event, node)}
              onMouseLeave={(event) => props.onNodeMouseLeave?.(event, node)}
            >
              <NodeComponent data={node.data} />
            </div>
          ) : null
        })}
        <svg data-testid="diagram-edges">
          {edges.map((edge) => {
            const EdgeComponent = edgeTypes[edge.type ?? '']

            return EdgeComponent ? (
              <EdgeComponent
                data={edge.data}
                key={edge.id}
                markerEnd="url(#arrow)"
                sourcePosition="right"
                sourceX={0}
                sourceY={20}
                targetPosition="left"
                targetX={120}
                targetY={80}
              />
            ) : null
          })}
        </svg>
        {children}
      </div>
    )
  ),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  useReactFlow: () => ({
    fitView: reactFlowProps.fitView,
    getViewport: reactFlowProps.getViewport,
    getZoom: reactFlowProps.getZoom,
    setCenter: reactFlowProps.setCenter,
  }),
  useOnViewportChange: () => undefined,
}))

const SOURCE = `Table users {
  id integer [pk]
}
`

const RELATION_SOURCE = `Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
}
`

const PROXY_RELATION_SOURCE = `Table users {
  id integer [pk]
  email varchar
  name varchar
}

Table accounts {
  id integer [pk]
  name varchar
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
  account_id integer [ref: > accounts.id]
}
`

const STACKED_PROXY_RELATION_SOURCE = `Table audit_events {
  id uuid [pk]
  actor_member_id uuid
}

Table incidents {
  id uuid [pk]
  opened_by_member_id uuid
}

Table deployments {
  id uuid [pk]
  requested_by_member_id uuid
}

Table members {
  id uuid [pk]
  audit_event_id uuid [ref: > audit_events.id]
  incident_id uuid [ref: > incidents.id]
  deployment_id uuid [ref: > deployments.id]
}
`

const MIXED_SIDE_PROXY_RELATION_SOURCE = `Table left_a {
  id uuid [pk]
}

Table left_b {
  id uuid [pk]
}

Table bottom_a {
  id uuid [pk]
}

Table bottom_b {
  id uuid [pk]
}

Table bottom_c {
  id uuid [pk]
}

Table members {
  id uuid [pk]
  left_a_id uuid [ref: > left_a.id]
  left_b_id uuid [ref: > left_b.id]
  bottom_a_id uuid [ref: > bottom_a.id]
  bottom_b_id uuid [ref: > bottom_b.id]
  bottom_c_id uuid [ref: > bottom_c.id]
}
`

const REFERENCE_FOCUS_SOURCE = `Table posts {
  id integer [pk]
}

Table comments {
  id integer [pk]
  post_id integer [ref: > posts.id]
}
`

const ISOLATED_RELATION_SOURCE = `Table users {
  id integer [pk]
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
}

Table teams {
  id integer [pk]
}

Table memberships {
  id integer [pk]
  team_id integer [ref: > teams.id]
}
`

describe('DbmlDiagramPreview', () => {
  afterEach(() => {
    cleanup()
    reactFlowProps.capture.mockClear()
    reactFlowProps.fitView.mockClear()
    reactFlowProps.getViewport.mockReset()
    reactFlowProps.getViewport.mockReturnValue({ x: 0, y: 0, zoom: 1 })
    reactFlowProps.getZoom.mockReset()
    reactFlowProps.getZoom.mockReturnValue(1)
    reactFlowProps.setCenter.mockClear()
    window.localStorage?.clear()
    resetEditorSettingsStoreForTests()
    vi.restoreAllMocks()
  })

  it('renders tables and columns for a layouted diagram', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Diagram' })).toBeInTheDocument()
    expect(screen.getByTestId('diagram-background')).toHaveAttribute(
      'data-color',
      EDITOR_COLOR_VARIABLES.diagramGridDot,
    )
    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('users').closest('article')).not.toHaveClass(
      'nodrag',
      'nopan',
    )
    expect(
      screen.getByTestId('diagram-node-table:public.users'),
    ).not.toHaveClass('nodrag', 'nopan')
    expect(getColumnRow('id')).toHaveClass('nodrag', 'nopan')
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('renders relation edges with bezier paths', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' C '),
    )
  })

  it('switches relation edge line styles', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByRole('button', { name: 'Bezier' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Step' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' L '),
    )
    expect(screen.getByRole('button', { name: 'Step' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rounded' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' Q '),
    )
    expect(screen.getByRole('button', { name: 'Rounded' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('keeps active relation gradients when switching line styles', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))

    fireEvent.click(screen.getByRole('button', { name: 'Step' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' L '),
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))

    fireEvent.click(screen.getByRole('button', { name: 'Rounded' }))

    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'd',
      expect.stringContaining(' Q '),
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
  })

  it('switches active relation highlight modes', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    expect(screen.getByRole('button', { name: 'Gradient' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))

    fireEvent.click(screen.getByRole('button', { name: 'Solid' }))

    expect(screen.getByRole('button', { name: 'Solid' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId('diagram-edge')).toHaveAttribute(
      'data-stroke',
      DBML_RELATION_SOURCE_COLOR,
    )
    expect(
      screen.queryByTestId('relation-edge-gradient'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dynamic' }))

    expect(screen.getByRole('button', { name: 'Dynamic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expectDynamicEdge(screen.getByTestId('diagram-edge'))
  })

  it('keeps dynamic dot speed consistent across relation lengths', () => {
    const shortEdge = renderDynamicRelationEdge({
      relationId: 'relation:short',
      targetX: 60,
    })
    const shortDots = screen.getAllByTestId('relation-edge-flow-dot')
    const shortAnimation = screen.getAllByTestId(
      'relation-edge-flow-animation',
    )[0]

    expect(shortDots).toHaveLength(1)
    expect(shortDots[0].tagName.toLowerCase()).toBe('g')
    expect(shortAnimation).toHaveAttribute('dur', '0.5s')

    shortEdge.unmount()

    renderDynamicRelationEdge({
      relationId: 'relation:long',
      targetX: 240,
    })

    const longDots = screen.getAllByTestId('relation-edge-flow-dot')
    const longAnimation = screen.getAllByTestId(
      'relation-edge-flow-animation',
    )[0]

    expect(longDots).toHaveLength(3)
    expect(longAnimation).toHaveAttribute('dur', '2s')
  })

  it('highlights a hovered relation without changing table state', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')

    fireEvent.mouseEnter(postsNode)

    expect(getTableArticle('posts')).toHaveAttribute('data-active', 'false')
    expect(getTableArticle('posts')).toHaveAttribute('data-connected', 'false')
    expect(getTableArticle('users')).toHaveAttribute('data-connected', 'false')
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expect(screen.getByTestId('diagram-edge').closest('g')).toHaveAttribute(
      'data-relation-edge-active',
      'true',
    )
    expect(screen.getByTestId('diagram-edge').closest('g')).toHaveAttribute(
      'data-relation-edge-dimmed',
      'false',
    )

    fireEvent.mouseLeave(postsNode)

    expect(getTableArticle('posts')).toHaveAttribute('data-active', 'false')
  })

  it('does not dim unrelated relations while hovering a table', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(ISOLATED_RELATION_SOURCE),
    )
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.mouseEnter(screen.getByTestId('diagram-node-table:public.posts'))

    expect(
      getRelationEdgeDimmedStates().every((dimmed) => dimmed === 'false'),
    ).toBe(true)
  })

  it('dims only tables and relations unrelated to the focused table', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(ISOLATED_RELATION_SOURCE),
    )
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    expect(getTableArticle('posts')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('users')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('teams')).toHaveAttribute('data-dimmed', 'true')
    expect(getTableArticle('memberships')).toHaveAttribute(
      'data-dimmed',
      'true',
    )
    const edges = screen.getAllByTestId('diagram-edge')

    expect(
      edges.some((edge) => isGradientStroke(edge.getAttribute('data-stroke'))),
    ).toBe(true)
    expect(
      edges.some((edge) => edge.getAttribute('data-opacity') === '0.28'),
    ).toBe(true)
    expect(
      edges.some(
        (edge) =>
          edge.closest('g')?.getAttribute('data-relation-edge-active') ===
          'true',
      ),
    ).toBe(true)
    expect(
      edges.some(
        (edge) =>
          edge.closest('g')?.getAttribute('data-relation-edge-dimmed') ===
          'true',
      ),
    ).toBe(true)
  })

  it('keeps focused relation highlights while hovering another table', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(ISOLATED_RELATION_SOURCE),
    )
    const layoutedDiagram = await layoutDbmlDiagram(diagram)
    const focusedRelationIds = getActiveRelationIds(layoutedDiagram, {
      type: 'table',
      tableId: 'table:public.posts',
    })

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    for (const relationId of focusedRelationIds) {
      expect(getRelationEdgeGroup(relationId)).toHaveAttribute(
        'data-relation-edge-active',
        'true',
      )
    }

    fireEvent.mouseEnter(screen.getByTestId('diagram-node-table:public.teams'))

    for (const relationId of focusedRelationIds) {
      expect(getRelationEdgeGroup(relationId)).toHaveAttribute(
        'data-relation-edge-active',
        'true',
      )
    }
  })

  it('keeps relation dim states based on focus while hovering another table', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(ISOLATED_RELATION_SOURCE),
    )
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const focusedDimmedStates = getRelationEdgeDimmedStates()

    fireEvent.mouseEnter(screen.getByTestId('diagram-node-table:public.teams'))

    expect(getRelationEdgeDimmedStates()).toEqual(focusedDimmedStates)
  })

  it('keeps table focus after the pointer leaves', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')

    fireEvent.click(postsNode)
    fireEvent.mouseLeave(postsNode)

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'true',
    )
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
  })

  it('clears focused table selection when the diagram pane is clicked', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')

    fireEvent.click(postsNode)

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'true',
    )

    fireEvent.click(screen.getByTestId('diagram-pane'))

    expect(screen.getByText('posts').closest('article')).toHaveAttribute(
      'data-active',
      'false',
    )
  })

  it('does not refit the viewport when diagram selection changes', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    await waitFor(() => expect(reactFlowProps.fitView).toHaveBeenCalled())
    reactFlowProps.fitView.mockClear()

    fireEvent.mouseEnter(screen.getByTestId('diagram-node-table:public.posts'))
    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))
    fireEvent.mouseLeave(screen.getByTestId('diagram-node-table:public.posts'))

    expect(reactFlowProps.fitView).not.toHaveBeenCalled()
  })

  it('does not refit the viewport when diagram elements update', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)
    const updatedDiagram = createDbmlDiagram(
      parseDbmlDocument(`Table users {
  id integer [pk]
  email varchar
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
  title varchar
}
`),
    )
    const updatedLayoutedDiagram = await layoutDbmlDiagram(updatedDiagram)

    const { rerender } = render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    await waitFor(() => expect(reactFlowProps.fitView).toHaveBeenCalled())
    reactFlowProps.fitView.mockClear()

    rerender(
      <DbmlDiagramPreview
        diagram={updatedLayoutedDiagram}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(reactFlowProps.fitView).not.toHaveBeenCalled()
  })

  it('hides offscreen relation proxies when the setting is disabled', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 1200, y: 0 },
    )

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    expect(
      screen.queryByTestId('offscreen-relation-proxy:table:public.users'),
    ).not.toBeInTheDocument()
  })

  it('shows compact offscreen relation proxies for focused targets', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTables(await layoutDbmlDiagram(diagram), {
      'table:public.users': { x: 1200, y: 0 },
      'table:public.accounts': { x: 1200, y: 20 },
    })

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const proxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.users',
    )

    expect(within(proxy).getByText('users')).toBeInTheDocument()
    expect(within(proxy).getByText('id')).toBeInTheDocument()
    expect(within(proxy).queryByText('email')).not.toBeInTheDocument()
    expect(within(proxy).queryByText('3 cols')).not.toBeInTheDocument()
    expect(within(proxy).queryByText('...')).not.toBeInTheDocument()
    expect(within(proxy).queryByText('↗')).not.toBeInTheDocument()
  })

  it('keeps offscreen relation proxy cards from overlapping each other', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTables(await layoutDbmlDiagram(diagram), {
      'table:public.users': { x: 1200, y: 0 },
      'table:public.accounts': { x: 1200, y: 20 },
    })

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const usersProxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.users',
    )
    const accountsProxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.accounts',
    )
    const topValues = [usersProxy, accountsProxy]
      .map((proxy) => Number.parseFloat(proxy.style.top))
      .sort((first, second) => first - second)

    expect(topValues[1] - topValues[0]).toBeCloseTo(70)
  })

  it('shifts a crowded offscreen relation proxy stack away from the viewport edge', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(
      parseDbmlDocument(STACKED_PROXY_RELATION_SOURCE),
    )
    const layoutedDiagram = moveTables(await layoutDbmlDiagram(diagram), {
      'table:public.members': { x: 260, y: 120 },
      'table:public.audit_events': { x: -1200, y: 900 },
      'table:public.incidents': { x: -1200, y: 920 },
      'table:public.deployments': { x: -1200, y: 940 },
    })

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.members'))

    const proxies = await Promise.all([
      screen.findByTestId('offscreen-relation-proxy:table:public.audit_events'),
      screen.findByTestId('offscreen-relation-proxy:table:public.incidents'),
      screen.findByTestId('offscreen-relation-proxy:table:public.deployments'),
    ])
    const topValues = proxies
      .map((proxy) => Number.parseFloat(proxy.style.top))
      .sort((first, second) => first - second)

    expect(topValues).toEqual([186, 256, 326])
  })

  it('stacks offscreen relation proxy cards independently per viewport side', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(
      parseDbmlDocument(MIXED_SIDE_PROXY_RELATION_SOURCE),
    )
    const layoutedDiagram = moveTables(await layoutDbmlDiagram(diagram), {
      'table:public.members': { x: 260, y: 120 },
      'table:public.left_a': { x: -1200, y: 120 },
      'table:public.left_b': { x: -1200, y: 140 },
      'table:public.bottom_a': { x: -100, y: 900 },
      'table:public.bottom_b': { x: 170, y: 920 },
      'table:public.bottom_c': { x: 364, y: 940 },
    })

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.members'))

    await Promise.all([
      screen.findByTestId('offscreen-relation-proxy:table:public.left_a'),
      screen.findByTestId('offscreen-relation-proxy:table:public.left_b'),
    ])
    const bottomProxies = await Promise.all([
      screen.findByTestId('offscreen-relation-proxy:table:public.bottom_a'),
      screen.findByTestId('offscreen-relation-proxy:table:public.bottom_b'),
      screen.findByTestId('offscreen-relation-proxy:table:public.bottom_c'),
    ])
    const bottomTopValues = bottomProxies
      .map((proxy) => Number.parseFloat(proxy.style.top))
      .sort((first, second) => first - second)

    expect(bottomTopValues).toEqual([326, 326, 326])
  })

  it('shifts top and bottom proxy cards away from adjacent side proxy blocks', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(
      parseDbmlDocument(MIXED_SIDE_PROXY_RELATION_SOURCE),
    )
    const layoutedDiagram = moveTables(await layoutDbmlDiagram(diagram), {
      'table:public.members': { x: 260, y: 120 },
      'table:public.left_a': { x: -1200, y: 280 },
      'table:public.left_b': { x: -1200, y: 300 },
      'table:public.bottom_a': { x: -100, y: 900 },
      'table:public.bottom_b': { x: 500, y: 920 },
      'table:public.bottom_c': { x: 700, y: 940 },
    })

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.members'))

    const bottomProxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.bottom_a',
    )

    expect(Number.parseFloat(bottomProxy.style.left)).toBeGreaterThan(14)
  })

  it('moves offscreen relation proxies away from active visible nodes when enabled', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = moveTables(await layoutDbmlDiagram(diagram), {
      'table:public.posts': { x: 340, y: 0 },
      'table:public.users': { x: 1200, y: 0 },
    })

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
        shouldAvoidOffscreenRelationProxyActiveNodes
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const proxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.users',
    )

    expect(Number.parseFloat(proxy.style.top)).toBeGreaterThan(100)
  })

  it('scales offscreen relation proxy cards with the diagram viewport zoom', async () => {
    installDiagramSurfaceBounds()
    reactFlowProps.getViewport.mockReturnValue({ x: 0, y: 0, zoom: 1.5 })
    reactFlowProps.getZoom.mockReturnValue(1.5)
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 1200, y: 0 },
    )

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const proxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.users',
    )

    expect(proxy.style.transform).toBe('scale(1.5)')
  })

  it('places offscreen relation proxies by parallel translation when selected', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 1200, y: 180 },
    )

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const proxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.users',
    )

    expect(Number.parseFloat(proxy.style.left)).toBe(402)
    expect(Number.parseFloat(proxy.style.top)).toBe(180)
  })

  it('centers top and bottom parallel proxies on the original table center', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 200, y: -1200 },
    )

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        offscreenRelationProxyPlacementMode="parallel"
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const proxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.users',
    )

    expect(Number.parseFloat(proxy.style.left)).toBe(238)
    expect(Number.parseFloat(proxy.style.top)).toBe(14)
  })

  it('connects active relation lines to offscreen proxies when enabled', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 1200, y: 0 },
    )

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        shouldConnectOffscreenRelationProxyLines
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    await screen.findByTestId('offscreen-relation-proxy:table:public.users')

    expect(
      screen
        .getAllByTestId('diagram-edge')
        .some((edge) => edge.getAttribute('d')?.includes('402')),
    ).toBe(true)
  })

  it('connects top and bottom offscreen proxy lines to column ports', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 0, y: -1200 },
    )

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
        shouldConnectOffscreenRelationProxyLines
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    await screen.findByTestId('offscreen-relation-proxy:table:public.users')

    expect(
      screen
        .getAllByTestId('diagram-edge')
        .some((edge) => edge.getAttribute('d')?.includes('59')),
    ).toBe(true)
  })

  it('navigates to the original table when an offscreen relation proxy is clicked', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 1200, y: 0 },
    )

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))
    fireEvent.click(
      await screen.findByTestId('offscreen-relation-proxy:table:public.users'),
    )

    const usersTable = layoutedDiagram.tables.find(
      (table) => table.id === 'table:public.users',
    )

    expect(reactFlowProps.setCenter).toHaveBeenCalledWith(
      usersTable!.position.x + usersTable!.size.width / 2,
      usersTable!.position.y + usersTable!.size.height / 2,
      {
        duration: 240,
        zoom: 1,
      },
    )
    expect(getTableArticle('users')).toHaveAttribute('data-active', 'true')
  })

  it('focuses the represented column when an offscreen relation proxy column is clicked', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 1200, y: 0 },
    )

    render(
      <InteractivePreviewHarness
        diagram={layoutedDiagram}
        isOffscreenRelationProxiesEnabled
      />,
    )

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))
    const proxy = await screen.findByTestId(
      'offscreen-relation-proxy:table:public.users',
    )

    fireEvent.click(within(proxy).getByText('id'))

    expect(getColumnRow('id', 'users')).toHaveAttribute('data-active', 'true')
    expect(getColumnRow('id', 'users')).toHaveAttribute(
      'data-reference',
      'true',
    )
  })

  it('highlights represented relations when an offscreen relation proxy is hovered', async () => {
    installDiagramSurfaceBounds()
    const diagram = createDbmlDiagram(parseDbmlDocument(PROXY_RELATION_SOURCE))
    const layoutedDiagram = moveTable(
      await layoutDbmlDiagram(diagram),
      'table:public.users',
      { x: 1200, y: 0 },
    )

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        focusedTarget={{
          type: 'table',
          tableId: 'table:public.posts',
        }}
        isOffscreenRelationProxiesEnabled
        isPending={false}
        isPaused={false}
      />,
    )

    expect(getRelationEdgeActiveStates()).not.toContain('true')

    fireEvent.mouseEnter(
      await screen.findByTestId('offscreen-relation-proxy:table:public.users'),
    )

    expect(getRelationEdgeActiveStates()).toContain('true')
  })

  it('keeps base flow elements stable when diagram selection changes', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const initialProps = getCapturedReactFlowProps()

    fireEvent.mouseEnter(screen.getByTestId('diagram-node-table:public.posts'))

    const hoverProps = getCapturedReactFlowProps()

    expect(hoverProps.nodes).toBe(initialProps.nodes)
    expect(hoverProps.edges).toBe(initialProps.edges)

    fireEvent.click(screen.getByTestId('diagram-node-table:public.posts'))

    const focusProps = getCapturedReactFlowProps()

    expect(focusProps.nodes).toBe(initialProps.nodes)
    expect(focusProps.edges).toBe(initialProps.edges)
  })

  it('highlights a hovered column relation without changing column state', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')

    fireEvent.mouseEnter(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'false')
    expect(userIdColumn).toHaveAttribute('data-source', 'true')
    expect(userIdColumn).toHaveAttribute('data-reference', 'false')
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expect(getColumnRow('id', 'users')).toHaveAttribute('data-source', 'false')
    expect(getColumnRow('id', 'users')).toHaveAttribute(
      'data-reference',
      'true',
    )

    fireEvent.mouseLeave(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'false')
    expect(getColumnRow('id', 'users')).toHaveAttribute(
      'data-reference',
      'false',
    )
  })

  it('keeps both endpoint tables visible when a relation column is focused', async () => {
    const diagram = createDbmlDiagram(
      parseDbmlDocument(ISOLATED_RELATION_SOURCE),
    )
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    fireEvent.click(getColumnRow('user_id'))

    expect(getTableArticle('posts')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('users')).toHaveAttribute('data-dimmed', 'false')
    expect(getTableArticle('teams')).toHaveAttribute('data-dimmed', 'true')
  })

  it('restores table hover when the pointer leaves a column inside the same table', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postsNode = screen.getByTestId('diagram-node-table:public.posts')
    const userIdColumn = getColumnRow('user_id')

    fireEvent.mouseEnter(postsNode)
    fireEvent.mouseEnter(userIdColumn)
    fireEvent.mouseLeave(userIdColumn, {
      relatedTarget: getTableHeader('posts'),
    })

    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
  })

  it('keeps column focus after the pointer leaves', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')

    fireEvent.click(userIdColumn)
    fireEvent.mouseLeave(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(userIdColumn).toHaveAttribute('data-source', 'true')
    expect(userIdColumn).toHaveAttribute('data-reference', 'false')
    expectActiveGradientEdge(screen.getByTestId('diagram-edge'))
    expect(getColumnRow('id', 'users')).toHaveAttribute('data-source', 'false')
    expect(getColumnRow('id', 'users')).toHaveAttribute(
      'data-reference',
      'true',
    )
  })

  it('highlights a focused source column with the source color role', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(REFERENCE_FOCUS_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const postIdColumn = getColumnRow('id', 'posts')
    const commentPostIdColumn = getColumnRow('post_id')

    fireEvent.click(postIdColumn)

    expect(postIdColumn).toHaveAttribute('data-active', 'true')
    expect(postIdColumn).toHaveAttribute('data-source', 'false')
    expect(postIdColumn).toHaveAttribute('data-reference', 'true')
    expect(commentPostIdColumn).toHaveAttribute('data-source', 'true')
    expect(commentPostIdColumn).toHaveAttribute('data-reference', 'false')
  })

  it('keeps focused destination column role while another column is hovered', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(RELATION_SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(<InteractivePreviewHarness diagram={layoutedDiagram} />)

    const userIdColumn = getColumnRow('user_id')
    const unrelatedPostIdColumn = getColumnRow('id', 'posts')

    fireEvent.click(userIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(userIdColumn).toHaveAttribute('data-source', 'true')
    expect(userIdColumn).toHaveAttribute('data-reference', 'false')

    fireEvent.mouseEnter(unrelatedPostIdColumn)

    expect(userIdColumn).toHaveAttribute('data-active', 'true')
    expect(userIdColumn).toHaveAttribute('data-source', 'true')
    expect(userIdColumn).toHaveAttribute('data-reference', 'false')
  })

  it('shows a paused state while keeping the last valid diagram', async () => {
    const diagram = createDbmlDiagram(parseDbmlDocument(SOURCE))
    const layoutedDiagram = await layoutDbmlDiagram(diagram)

    render(
      <DbmlDiagramPreview
        diagram={layoutedDiagram}
        isPending={false}
        isPaused
      />,
    )

    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('Preview paused: invalid DBML')).toBeInTheDocument()
  })

  it('shows an empty diagram state', () => {
    render(
      <DbmlDiagramPreview
        diagram={{ tables: [], relations: [] }}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(screen.getByText('No renderable tables')).toBeInTheDocument()
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })

  it('disables React Flow keyboard shortcuts so editor typing is not intercepted', () => {
    render(
      <DbmlDiagramPreview
        diagram={{ tables: [], relations: [] }}
        isPending={false}
        isPaused={false}
      />,
    )

    expect(reactFlowProps.capture).toHaveBeenCalledWith(
      expect.objectContaining({
        deleteKeyCode: null,
        selectionKeyCode: null,
        multiSelectionKeyCode: null,
        panActivationKeyCode: null,
        zoomActivationKeyCode: null,
      }),
    )
  })
})

function InteractivePreviewHarness({
  diagram,
  isOffscreenRelationProxiesEnabled = false,
  offscreenRelationProxyPlacementMode = 'line',
  shouldAvoidOffscreenRelationProxyActiveNodes = false,
  shouldConnectOffscreenRelationProxyLines = false,
}: {
  diagram: LayoutedDbmlDiagram
  isOffscreenRelationProxiesEnabled?: boolean
  offscreenRelationProxyPlacementMode?: 'line' | 'parallel'
  shouldAvoidOffscreenRelationProxyActiveNodes?: boolean
  shouldConnectOffscreenRelationProxyLines?: boolean
}) {
  const [hoveredTarget, setHoveredTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const [focusedTarget, setFocusedTarget] =
    useState<DbmlDiagramSelectionTarget | null>(null)
  const activeTarget = getActiveDiagramSelectionTarget({
    hoveredTarget,
    focusedTarget,
  })
  const activeRelationEndpointColumnIds =
    getRelationEndpointColumnIdsForTargets(diagram, [
      activeTarget,
      focusedTarget,
    ])

  return (
    <DbmlDiagramPreview
      activeRelationIds={getRelationIdsForTargets(diagram, [
        hoveredTarget,
        focusedTarget,
      ])}
      activeTarget={activeTarget}
      diagram={diagram}
      focusedRelationIds={getActiveRelationIds(diagram, focusedTarget)}
      focusedTableIds={getActiveTableIds(diagram, focusedTarget)}
      focusedTarget={focusedTarget}
      isOffscreenRelationProxiesEnabled={isOffscreenRelationProxiesEnabled}
      isPending={false}
      isPaused={false}
      offscreenRelationProxyPlacementMode={offscreenRelationProxyPlacementMode}
      shouldAvoidOffscreenRelationProxyActiveNodes={
        shouldAvoidOffscreenRelationProxyActiveNodes
      }
      shouldConnectOffscreenRelationProxyLines={
        shouldConnectOffscreenRelationProxyLines
      }
      sourceColumnIds={activeRelationEndpointColumnIds.sourceColumnIds}
      referenceColumnIds={activeRelationEndpointColumnIds.referenceColumnIds}
      onColumnFocus={(column) =>
        setFocusedTarget({
          type: 'column',
          tableId: column.tableId,
          columnId: column.id,
        })
      }
      onColumnHover={setHoveredTarget}
      onFocusClear={() => {
        setHoveredTarget(null)
        setFocusedTarget(null)
      }}
      onTableFocus={(table) =>
        setFocusedTarget({
          type: 'table',
          tableId: table.id,
        })
      }
      onTableHover={setHoveredTarget}
    />
  )
}

function renderDynamicRelationEdge({
  relationId,
  targetX,
}: {
  relationId: string
  targetX: number
}) {
  return render(
    <svg>
      <DbmlDiagramSelectionViewProvider
        value={{
          activeRelationIds: new Set([relationId]),
          activeTarget: {
            type: 'column',
            tableId: 'table:public.posts',
            columnId: 'table:public.posts.column:user_id',
          },
          focusedRelationIds: new Set(),
          focusedTableIds: new Set(),
          focusedTarget: null,
          onColumnFocus: () => undefined,
          onColumnHover: () => undefined,
          referenceColumnIds: new Set(),
          sourceColumnIds: new Set(),
        }}
      >
        <DbmlRelationEdge
          animated={false}
          data={
            {
              highlightMode: 'dynamic',
              lineStyle: 'orthogonal',
              relation: {
                id: relationId,
              },
              route: {
                bendPoints: [],
                endPoint: { x: targetX, y: 20 },
                startPoint: { x: 0, y: 20 },
              },
            } as never
          }
          deletable={false}
          id={relationId}
          markerEnd=""
          selectable={false}
          selected={false}
          source="table:public.users"
          sourcePosition={Position.Right}
          sourceX={0}
          sourceY={20}
          style={{}}
          target="table:public.posts"
          targetPosition={Position.Left}
          targetX={targetX}
          targetY={20}
          type="dbmlRelation"
        />
      </DbmlDiagramSelectionViewProvider>
    </svg>,
  )
}

function getTableArticle(tableName: string) {
  const table = screen.getByText(tableName).closest('article')

  if (!table) {
    throw new Error(`Expected ${tableName} table to render in an article.`)
  }

  return table
}

function getTableHeader(tableName: string) {
  const header = getTableArticle(tableName).querySelector('header')

  if (!header) {
    throw new Error(`Expected ${tableName} table to render a header.`)
  }

  return header
}

function getColumnRow(columnName: string, tableName?: string) {
  const queryRoot = tableName ? within(getTableArticle(tableName)) : screen
  const row = queryRoot.getByText(columnName).closest('div')

  if (!row) {
    throw new Error(`Expected ${columnName} column to render in a row.`)
  }

  return row
}

function getCapturedReactFlowProps() {
  const lastCall = reactFlowProps.capture.mock.lastCall?.[0] as
    | {
        edges?: Array<{ id: string; zIndex?: number }>
        nodes?: Array<{ id: string; zIndex?: number }>
      }
    | undefined

  if (!lastCall?.nodes || !lastCall.edges) {
    throw new Error('Expected React Flow props to be captured.')
  }

  return {
    edges: lastCall.edges,
    nodes: lastCall.nodes,
  }
}

function installDiagramSurfaceBounds() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    top: 0,
    right: 600,
    bottom: 400,
    left: 0,
    toJSON: () => ({}),
  })
}

function moveTable(
  diagram: LayoutedDbmlDiagram,
  tableId: string,
  position: { x: number; y: number },
): LayoutedDbmlDiagram {
  return moveTables(diagram, {
    [tableId]: position,
  })
}

function moveTables(
  diagram: LayoutedDbmlDiagram,
  positionsByTableId: Record<string, { x: number; y: number }>,
): LayoutedDbmlDiagram {
  return {
    ...diagram,
    tables: diagram.tables.map((table) =>
      positionsByTableId[table.id]
        ? {
            ...table,
            position: positionsByTableId[table.id],
          }
        : table,
    ),
  }
}

function expectActiveGradientEdge(edge: HTMLElement) {
  expect(DBML_RELATION_SOURCE_COLOR).toBe(EDITOR_COLOR_VARIABLES.relationSource)
  expect(DBML_RELATION_REFERENCE_COLOR).toBe(
    EDITOR_COLOR_VARIABLES.relationReference,
  )

  expect(edge.getAttribute('data-stroke')).toEqual(
    expect.stringMatching(/^url\(#dbml-relation-gradient-/),
  )

  const gradient = edge
    .closest('g')
    ?.querySelector('[data-testid="relation-edge-gradient"]')

  expect(gradient).not.toBeNull()
  expect(gradient).toHaveAttribute('x1', '0')
  expect(gradient).toHaveAttribute('y1', '20')
  expect(gradient).toHaveAttribute('x2', '120')
  expect(gradient).toHaveAttribute('y2', '80')

  const stops = gradient?.querySelectorAll('stop')

  expect(stops?.[0]).toHaveAttribute('offset', '0%')
  expect(getStopColor(stops?.[0])).toBe(DBML_RELATION_REFERENCE_COLOR)
  expect(stops?.[1]).toHaveAttribute('offset', '90%')
  expect(getStopColor(stops?.[1])).toBe(DBML_RELATION_SOURCE_COLOR)
  expect(stops?.[2]).toHaveAttribute('offset', '100%')
  expect(getStopColor(stops?.[2])).toBe(DBML_RELATION_SOURCE_COLOR)
}

function expectDynamicEdge(edge: HTMLElement) {
  expect(edge).toHaveAttribute('data-stroke-dasharray', '')
  expect(edge).toHaveAttribute('data-stroke-linecap', '')

  const dots = edge
    .closest('g')
    ?.querySelectorAll('[data-testid="relation-edge-flow-dot"]')
  const referenceDots = edge
    .closest('g')
    ?.querySelectorAll('[data-testid="relation-edge-flow-dot-reference"]')
  const sourceDots = edge
    .closest('g')
    ?.querySelectorAll('[data-testid="relation-edge-flow-dot-source"]')
  const sourceOpacityAnimations = edge
    .closest('g')
    ?.querySelectorAll(
      '[data-testid="relation-edge-flow-source-opacity-animation"]',
    )
  const animations = edge.closest('g')?.querySelectorAll('animateMotion')

  expect(dots).toHaveLength(2)
  expect(referenceDots).toHaveLength(2)
  expect(sourceDots).toHaveLength(2)
  expect(sourceOpacityAnimations).toHaveLength(2)
  expect(animations).toHaveLength(2)
  expect(referenceDots?.[0]).toHaveAttribute(
    'fill',
    DBML_RELATION_REFERENCE_COLOR,
  )
  expect(sourceDots?.[0]).toHaveAttribute('fill', DBML_RELATION_SOURCE_COLOR)
  expect(referenceDots?.[0]).toHaveAttribute('cx', '0')
  expect(referenceDots?.[0]).toHaveAttribute('cy', '0')
  expect(referenceDots?.[0]).toHaveAttribute('r', '3.2')
  expect(sourceDots?.[0]).toHaveAttribute('cx', '0')
  expect(sourceDots?.[0]).toHaveAttribute('cy', '0')
  expect(sourceDots?.[0]).toHaveAttribute('r', '3.2')
  expect(sourceOpacityAnimations?.[0]).toHaveAttribute('begin', '0s')
  expect(sourceOpacityAnimations?.[1]).toHaveAttribute('begin', '-0.57s')
  expect(sourceOpacityAnimations?.[0]).toHaveAttribute('dur', '1.14s')
  expect(sourceOpacityAnimations?.[0]).toHaveAttribute('keyTimes', '0;0.1;1')
  expect(sourceOpacityAnimations?.[0]).toHaveAttribute('values', '1;1;0')
  expect(animations?.[0]).toHaveAttribute('begin', '0s')
  expect(animations?.[1]).toHaveAttribute('begin', '-0.57s')
  expect(animations?.[0]).toHaveAttribute('dur', '1.14s')
  expect(animations?.[0]).toHaveAttribute('keyPoints', '1;0')
  expect(animations?.[0]).toHaveAttribute('keyTimes', '0;1')
  expect(animations?.[0]).toHaveAttribute('path', edge.getAttribute('d'))
  expect(animations?.[0]).not.toHaveAttribute('rotate')
}

function isGradientStroke(stroke: string | null) {
  return stroke?.startsWith('url(#dbml-relation-gradient-') ?? false
}

function getRelationEdgeDimmedStates() {
  return screen
    .getAllByTestId('diagram-edge')
    .map((edge) => edge.closest('g')?.getAttribute('data-relation-edge-dimmed'))
}

function getRelationEdgeActiveStates() {
  return screen
    .getAllByTestId('diagram-edge')
    .map((edge) => edge.closest('g')?.getAttribute('data-relation-edge-active'))
}

function getRelationEdgeGroup(relationId: string) {
  const edgeGroup = document.querySelector(
    `[data-relation-edge-id="${relationId}"]`,
  )

  expect(edgeGroup).not.toBeNull()

  return edgeGroup as HTMLElement
}

function getStopColor(stop: Element | undefined) {
  return stop?.getAttribute('stop-color') ?? stop?.getAttribute('stopColor')
}
