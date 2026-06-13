import { getBezierPath, type EdgeProps } from '@xyflow/react'
import type { DbmlRelationEdgeData } from './dbml-diagram-flow'

const BEZIER_LENGTH_SAMPLE_COUNT = 16

export type RelationPathParams = {
  lineStyle: DbmlRelationEdgeData['lineStyle']
  sourceX: number
  sourceY: number
  sourcePosition: EdgeProps['sourcePosition']
  targetX: number
  targetY: number
  targetPosition: EdgeProps['targetPosition']
}

export function getRelationPath({
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

export function getRelationPathLength({
  lineStyle,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: RelationPathParams) {
  if (lineStyle === 'orthogonal' || lineStyle === 'rounded-orthogonal') {
    return getOrthogonalPathLength({ sourceX, sourceY, targetX, targetY })
  }

  return getBezierPathLength({ sourceX, sourceY, targetX, targetY })
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

function getOrthogonalPathLength({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: OrthogonalPathParams) {
  return Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY)
}

function getBezierPathLength({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: OrthogonalPathParams) {
  const controlOffset = Math.abs(targetX - sourceX) * 0.4
  const firstControlPoint = {
    x: sourceX + controlOffset,
    y: sourceY,
  }
  const secondControlPoint = {
    x: targetX - controlOffset,
    y: targetY,
  }
  let length = 0
  let previousPoint = {
    x: sourceX,
    y: sourceY,
  }

  for (let index = 1; index <= BEZIER_LENGTH_SAMPLE_COUNT; index += 1) {
    const point = getCubicBezierPoint({
      firstControlPoint,
      secondControlPoint,
      sourceX,
      sourceY,
      targetX,
      targetY,
      t: index / BEZIER_LENGTH_SAMPLE_COUNT,
    })

    length += getDistance(previousPoint, point)
    previousPoint = point
  }

  return length
}

function getCubicBezierPoint({
  firstControlPoint,
  secondControlPoint,
  sourceX,
  sourceY,
  targetX,
  targetY,
  t,
}: {
  firstControlPoint: DbmlRelationPoint
  secondControlPoint: DbmlRelationPoint
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  t: number
}) {
  const inverseT = 1 - t

  return {
    x:
      inverseT ** 3 * sourceX +
      3 * inverseT ** 2 * t * firstControlPoint.x +
      3 * inverseT * t ** 2 * secondControlPoint.x +
      t ** 3 * targetX,
    y:
      inverseT ** 3 * sourceY +
      3 * inverseT ** 2 * t * firstControlPoint.y +
      3 * inverseT * t ** 2 * secondControlPoint.y +
      t ** 3 * targetY,
  }
}

type DbmlRelationPoint = {
  x: number
  y: number
}

function getDistance(
  firstPoint: DbmlRelationPoint,
  secondPoint: DbmlRelationPoint,
) {
  return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y)
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
