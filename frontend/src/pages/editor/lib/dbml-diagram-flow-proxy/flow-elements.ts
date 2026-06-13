import type { DbmlDiagramFlowElements } from '../dbml-diagram-flow'
import { getProxyRelationEndpointOverride } from './endpoints'
import type { DbmlOffscreenRelationProxyLayout } from './layout'
import type { DbmlDiagramViewport } from './proxy'

export function getFlowElementsWithProxyLineEndpoints({
  elements,
  proxyLayouts,
  viewport,
}: {
  elements: DbmlDiagramFlowElements
  proxyLayouts: readonly DbmlOffscreenRelationProxyLayout[]
  viewport: DbmlDiagramViewport | null
}): DbmlDiagramFlowElements {
  if (!viewport || proxyLayouts.length === 0) {
    return elements
  }

  const proxyLayoutByRelationId = new Map<
    string,
    DbmlOffscreenRelationProxyLayout
  >()

  for (const layout of proxyLayouts) {
    for (const relationId of layout.proxy.relationIds) {
      proxyLayoutByRelationId.set(relationId, layout)
    }
  }

  return {
    nodes: elements.nodes,
    edges: elements.edges.map((edge) => {
      const data = edge.data
      const proxyLayout = proxyLayoutByRelationId.get(edge.id)

      if (!data || !proxyLayout) {
        return edge
      }

      const endpointOverride = getProxyRelationEndpointOverride({
        proxyLayout,
        relation: data.relation,
        viewport,
      })

      return {
        ...edge,
        data: {
          ...data,
          endpointOverride,
        },
      }
    }),
  }
}

export function getFlowElementsWithHiddenProxyOriginalNodes({
  elements,
  proxyLayouts,
}: {
  elements: DbmlDiagramFlowElements
  proxyLayouts: readonly DbmlOffscreenRelationProxyLayout[]
}): DbmlDiagramFlowElements {
  if (proxyLayouts.length === 0) {
    return elements
  }

  const opacityByTableId = new Map<string, number>()

  for (const layout of proxyLayouts) {
    opacityByTableId.set(
      layout.proxy.table.id,
      Math.min(
        opacityByTableId.get(layout.proxy.table.id) ?? 1,
        layout.originalOpacity ?? 0,
      ),
    )
  }

  if (opacityByTableId.size === 0) {
    return elements
  }

  return {
    ...elements,
    nodes: elements.nodes.map((node) => {
      const opacity = opacityByTableId.get(node.id)

      if (opacity === undefined) {
        return node
      }

      return {
        ...node,
        style: {
          ...node.style,
          opacity,
        },
      }
    }),
  }
}
