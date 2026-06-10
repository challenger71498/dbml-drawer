import {
  BaseEdge,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'
import type { CSSProperties } from 'react'
import type { DbmlRelationEdgeData } from '../lib/map-dbml-diagram-flow'

const RELATION_EDGE_STYLE = {
  stroke: '#3b6ea8',
  strokeWidth: 1.5,
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
  const path = getRelationPath({
    lineStyle: data?.lineStyle ?? 'bezier',
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge path={path} markerEnd={markerEnd} style={RELATION_EDGE_STYLE} />
  )
}

type RelationPathParams = {
  lineStyle: DbmlRelationEdgeData['lineStyle']
  sourceX: number
  sourceY: number
  sourcePosition: EdgeProps<Edge<DbmlRelationEdgeData>>['sourcePosition']
  targetX: number
  targetY: number
  targetPosition: EdgeProps<Edge<DbmlRelationEdgeData>>['targetPosition']
}

function getRelationPath({
  lineStyle,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: RelationPathParams) {
  if (lineStyle === 'orthogonal') {
    return getOrthogonalPath({ sourceX, sourceY, targetX, targetY })
  }

  if (lineStyle === 'rounded-orthogonal') {
    return getRoundedOrthogonalPath({ sourceX, sourceY, targetX, targetY })
  }

  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return path
}

type OrthogonalPathParams = {
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}

function getOrthogonalPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: OrthogonalPathParams) {
  const middleX = getMiddleX(sourceX, targetX)

  return `M ${sourceX} ${sourceY} L ${middleX} ${sourceY} L ${middleX} ${targetY} L ${targetX} ${targetY}`
}

function getRoundedOrthogonalPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: OrthogonalPathParams) {
  const middleX = getMiddleX(sourceX, targetX)
  const horizontalDirection = Math.sign(targetX - sourceX) || 1
  const verticalDirection = Math.sign(targetY - sourceY)
  const radius = Math.min(
    12,
    Math.abs(targetX - sourceX) / 2,
    Math.abs(targetY - sourceY) / 2,
  )

  if (radius < 1 || verticalDirection === 0) {
    return getOrthogonalPath({ sourceX, sourceY, targetX, targetY })
  }

  const firstCornerStartX = middleX - radius * horizontalDirection
  const firstCornerEndY = sourceY + radius * verticalDirection
  const secondCornerStartY = targetY - radius * verticalDirection
  const secondCornerEndX = middleX + radius * horizontalDirection

  return [
    `M ${sourceX} ${sourceY}`,
    `L ${firstCornerStartX} ${sourceY}`,
    `Q ${middleX} ${sourceY} ${middleX} ${firstCornerEndY}`,
    `L ${middleX} ${secondCornerStartY}`,
    `Q ${middleX} ${targetY} ${secondCornerEndX} ${targetY}`,
    `L ${targetX} ${targetY}`,
  ].join(' ')
}

function getMiddleX(sourceX: number, targetX: number) {
  return sourceX + (targetX - sourceX) / 2
}
