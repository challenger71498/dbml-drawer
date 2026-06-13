import type { DbmlDiagramSelectionTarget } from '../../model/dbml-diagram-selection'
import type { LayoutedDbmlDiagram } from '../../model/dbml-layout'
import type {
  OffscreenRelationProxyPlacementMode,
  OffscreenRelationProxyTransitionMode,
} from '../../model/editor-theme'
import type { DbmlDiagramFlowElements } from '../dbml-diagram-flow'
import {
  getFlowElementsWithHiddenProxyOriginalNodes,
  getFlowElementsWithProxyLineEndpoints,
} from './flow-elements'
import {
  legacyOffscreenRelationProxyLayoutStrategy,
  type DbmlOffscreenRelationProxyLayout,
} from './layout'
import {
  getActiveTableProxyLayoutObstacles,
  getPreviewTopRightControlProxyLayoutObstacle,
} from './obstacles'
import {
  getOffscreenRelationProxies,
  type DbmlDiagramViewport,
  type DbmlOffscreenRelationProxyVisibilityMode,
} from './proxy'
import { getOffscreenRelationProxyTransitionLayouts } from './transition'

const PROXY_TRANSITION_COMPLETION_VISIBLE_RATIO = 0.8

export type DbmlDiagramFlowProxyState = {
  flowElements: DbmlDiagramFlowElements
  proxyLayouts: DbmlOffscreenRelationProxyLayout[]
}

export function createDbmlDiagramFlowProxyState({
  diagram,
  elements,
  focusedTableIds,
  focusedTarget,
  isEnabled,
  placementMode,
  shouldAvoidActiveNodes,
  shouldConnectLines,
  transitionMode,
  viewport,
  visibilityMode,
}: {
  diagram: LayoutedDbmlDiagram | null
  elements: DbmlDiagramFlowElements
  focusedTableIds: ReadonlySet<string>
  focusedTarget: DbmlDiagramSelectionTarget | null
  isEnabled: boolean
  placementMode: OffscreenRelationProxyPlacementMode
  shouldAvoidActiveNodes: boolean
  shouldConnectLines: boolean
  transitionMode: OffscreenRelationProxyTransitionMode
  viewport: DbmlDiagramViewport | null
  visibilityMode: DbmlOffscreenRelationProxyVisibilityMode
}): DbmlDiagramFlowProxyState {
  if (!isEnabled || !viewport) {
    return {
      flowElements: elements,
      proxyLayouts: [],
    }
  }

  const proxies = getOffscreenRelationProxies({
    diagram,
    focusedTarget,
    minimumVisibleRatio:
      transitionMode === 'morph' || transitionMode === 'opacity'
        ? PROXY_TRANSITION_COMPLETION_VISIBLE_RATIO
        : undefined,
    viewport,
    visibilityMode,
  })
  const layouts = legacyOffscreenRelationProxyLayoutStrategy.getLayouts({
    proxies,
    viewport,
    obstacles: [
      getPreviewTopRightControlProxyLayoutObstacle({
        viewport,
      }),
      ...(shouldAvoidActiveNodes
        ? getActiveTableProxyLayoutObstacles({
            diagram,
            focusedTableIds,
            viewport,
          })
        : []),
    ],
    options: {
      placementMode,
      shouldAvoidActiveNodes,
    },
  })
  const proxyLayouts = getOffscreenRelationProxyTransitionLayouts({
    layouts,
    viewport,
    options: {
      mode: transitionMode,
    },
  })
  const flowElementsWithProxyLineEndpoints = shouldConnectLines
    ? getFlowElementsWithProxyLineEndpoints({
        elements,
        proxyLayouts,
        viewport,
      })
    : elements

  return {
    flowElements: getFlowElementsWithHiddenProxyOriginalNodes({
      elements: flowElementsWithProxyLineEndpoints,
      proxyLayouts,
    }),
    proxyLayouts,
  }
}
