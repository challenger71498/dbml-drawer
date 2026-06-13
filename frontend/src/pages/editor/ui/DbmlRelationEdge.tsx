import { BaseEdge, type Edge, type EdgeProps } from '@xyflow/react'
import type { CSSProperties } from 'react'
import type { DbmlRelationEdgeData } from '../lib/dbml-diagram-flow'
import {
  getRelationPath,
  getRelationPathLength,
  type RelationPathParams,
} from '../lib/dbml-relation-path'
import {
  DEFAULT_DBML_RELATION_HIGHLIGHT_MODE,
  DBML_RELATION_DEFAULT_COLOR,
  DBML_RELATION_REFERENCE_COLOR,
  DBML_RELATION_SOURCE_COLOR,
} from '../model/dbml-diagram-rendering'
import { useDbmlDiagramSelectionView } from '../model/dbml-diagram-selection-view'

const RELATION_EDGE_STYLE = {
  stroke: DBML_RELATION_DEFAULT_COLOR,
  strokeWidth: 1.5,
} satisfies CSSProperties

const ACTIVE_RELATION_EDGE_STYLE = {
  strokeWidth: 2.5,
} satisfies CSSProperties

const DYNAMIC_DOT_SPACING = 72
const DYNAMIC_DOT_SPEED = 120
const DYNAMIC_DOT_RADIUS = 3.2
const DYNAMIC_DOT_SOURCE_OPACITY_KEY_TIMES = '0;0.1;1'
const DYNAMIC_DOT_SOURCE_OPACITY_VALUES = '1;1;0'

const DIMMED_RELATION_EDGE_STYLE = {
  ...RELATION_EDGE_STYLE,
  opacity: 0.28,
} satisfies CSSProperties

export function DbmlRelationEdge({
  data,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
}: EdgeProps<Edge<DbmlRelationEdgeData>>) {
  const { activeRelationIds, focusedRelationIds, focusedTarget } =
    useDbmlDiagramSelectionView()
  const effectiveSourceX = data?.endpointOverride?.source?.x ?? sourceX
  const effectiveSourceY = data?.endpointOverride?.source?.y ?? sourceY
  const effectiveSourcePosition =
    data?.endpointOverride?.source?.position ?? sourcePosition
  const effectiveTargetX = data?.endpointOverride?.target?.x ?? targetX
  const effectiveTargetY = data?.endpointOverride?.target?.y ?? targetY
  const effectiveTargetPosition =
    data?.endpointOverride?.target?.position ?? targetPosition
  const isActive = data ? activeRelationIds.has(data.relation.id) : false
  const isDimmed = data
    ? focusedTarget !== null && !focusedRelationIds.has(data.relation.id)
    : false
  const highlightMode =
    data?.highlightMode ?? DEFAULT_DBML_RELATION_HIGHLIGHT_MODE
  const gradientId =
    data && isActive && highlightMode !== 'solid'
      ? getRelationGradientId(data.relation.id)
      : null
  const shouldRenderDynamicFlow =
    data && isActive && highlightMode === 'dynamic'
  const path = getRelationPath({
    lineStyle: data?.lineStyle ?? 'bezier',
    sourceX: effectiveSourceX,
    sourceY: effectiveSourceY,
    sourcePosition: effectiveSourcePosition,
    targetX: effectiveTargetX,
    targetY: effectiveTargetY,
    targetPosition: effectiveTargetPosition,
  })
  const dynamicFlow = shouldRenderDynamicFlow
    ? getDynamicFlow({
        lineStyle: data?.lineStyle ?? 'bezier',
        sourceX: effectiveSourceX,
        sourceY: effectiveSourceY,
        sourcePosition: effectiveSourcePosition,
        targetX: effectiveTargetX,
        targetY: effectiveTargetY,
        targetPosition: effectiveTargetPosition,
      })
    : null

  return (
    <g
      data-relation-edge-id={data?.relation.id}
      data-relation-edge-active={isActive ? 'true' : 'false'}
      data-relation-edge-dimmed={isDimmed ? 'true' : 'false'}
      data-relation-edge-highlight-mode={isActive ? highlightMode : 'inactive'}
    >
      {gradientId ? (
        <defs>
          <linearGradient
            data-testid="relation-edge-gradient"
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1={effectiveSourceX}
            x2={effectiveTargetX}
            y1={effectiveSourceY}
            y2={effectiveTargetY}
          >
            <stop offset="0%" stopColor={DBML_RELATION_REFERENCE_COLOR} />
            <stop offset="90%" stopColor={DBML_RELATION_SOURCE_COLOR} />
            <stop offset="100%" stopColor={DBML_RELATION_SOURCE_COLOR} />
          </linearGradient>
        </defs>
      ) : null}
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={getRelationEdgeStyle({
          gradientId,
          isActive,
          isDimmed,
        })}
      />
      {dynamicFlow ? (
        <>
          {dynamicFlow?.beginTimes.map((begin) => (
            <g data-testid="relation-edge-flow-dot" key={begin}>
              <circle
                cx={0}
                cy={0}
                data-testid="relation-edge-flow-dot-reference"
                fill={DBML_RELATION_REFERENCE_COLOR}
                r={DYNAMIC_DOT_RADIUS}
              />
              <circle
                cx={0}
                cy={0}
                data-testid="relation-edge-flow-dot-source"
                fill={DBML_RELATION_SOURCE_COLOR}
                r={DYNAMIC_DOT_RADIUS}
              >
                <animate
                  attributeName="opacity"
                  begin={begin}
                  calcMode="linear"
                  data-testid="relation-edge-flow-source-opacity-animation"
                  dur={dynamicFlow.duration}
                  keyTimes={DYNAMIC_DOT_SOURCE_OPACITY_KEY_TIMES}
                  repeatCount="indefinite"
                  values={DYNAMIC_DOT_SOURCE_OPACITY_VALUES}
                />
              </circle>
              <animateMotion
                begin={begin}
                calcMode="linear"
                data-testid="relation-edge-flow-animation"
                dur={dynamicFlow.duration}
                keyPoints="1;0"
                keyTimes="0;1"
                path={path}
                repeatCount="indefinite"
              />
            </g>
          ))}
        </>
      ) : null}
    </g>
  )
}

function getRelationEdgeStyle({
  gradientId,
  isActive,
  isDimmed,
}: {
  gradientId: string | null
  isActive: boolean
  isDimmed: boolean
}) {
  if (isActive) {
    return {
      ...ACTIVE_RELATION_EDGE_STYLE,
      stroke: gradientId ? `url(#${gradientId})` : DBML_RELATION_SOURCE_COLOR,
    } satisfies CSSProperties
  }

  if (isDimmed) {
    return DIMMED_RELATION_EDGE_STYLE
  }

  return RELATION_EDGE_STYLE
}

function getRelationGradientId(relationId: string) {
  return `dbml-relation-gradient-${relationId.replaceAll(/[^a-zA-Z0-9_-]/g, '-')}`
}

function getDynamicFlow(params: RelationPathParams) {
  const length = getRelationPathLength(params)
  const dotCount = Math.max(1, Math.round(length / DYNAMIC_DOT_SPACING))
  const durationSeconds = length / DYNAMIC_DOT_SPEED
  const intervalSeconds = durationSeconds / dotCount

  return {
    beginTimes: Array.from({ length: dotCount }, (_, index) =>
      formatSeconds(-index * intervalSeconds),
    ),
    duration: formatSeconds(durationSeconds),
  }
}

function formatSeconds(value: number) {
  return `${Number(value.toFixed(2))}s`
}
