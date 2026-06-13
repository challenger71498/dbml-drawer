import { Position, getBezierPath, type EdgeProps } from '@xyflow/react'
import type { DbmlRelationEdgeData } from './dbml-diagram-flow'

const BEZIER_LENGTH_SAMPLE_COUNT = 16
const SAME_SIDE_PORT_DETOUR = 64

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
    return getOrthogonalPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
  }

  if (lineStyle === 'rounded-orthogonal') {
    return getRoundedOrthogonalPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
  }

  if (isSameHorizontalSide(sourcePosition, targetPosition)) {
    return getSameSideBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
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
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: RelationPathParams) {
  if (lineStyle === 'orthogonal' || lineStyle === 'rounded-orthogonal') {
    return getOrthogonalPathLength({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
  }

  return getBezierPathLength({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
}

type OrthogonalPathParams = {
  sourceX: number
  sourceY: number
  sourcePosition: RelationPathParams['sourcePosition']
  targetX: number
  targetY: number
  targetPosition: RelationPathParams['targetPosition']
}

function getOrthogonalPath(params: OrthogonalPathParams) {
  const points = getOrthogonalPathPoints(params)
  const [firstPoint, ...restPoints] = points

  return [
    `M ${firstPoint.x} ${firstPoint.y}`,
    ...restPoints.map((point) => `L ${point.x} ${point.y}`),
  ].join(' ')
}

function getOrthogonalPathLength(params: OrthogonalPathParams) {
  const points = getOrthogonalPathPoints(params)
  let length = 0

  for (let index = 1; index < points.length; index += 1) {
    length += getDistance(points[index - 1], points[index])
  }

  return length
}

function getBezierPathLength({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: BezierPathLengthParams) {
  const { firstControlPoint, secondControlPoint } = getBezierControlPoints({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
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

function getSameSideBezierPath(params: BezierPathLengthParams) {
  const { firstControlPoint, secondControlPoint } =
    getBezierControlPoints(params)

  return [
    `M ${params.sourceX} ${params.sourceY}`,
    `C ${firstControlPoint.x} ${firstControlPoint.y}`,
    `${secondControlPoint.x} ${secondControlPoint.y}`,
    `${params.targetX} ${params.targetY}`,
  ].join(' ')
}

function getBezierControlPoints({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: BezierPathLengthParams) {
  if (sourcePosition === Position.Right && targetPosition === Position.Right) {
    const detourX = Math.max(sourceX, targetX) + SAME_SIDE_PORT_DETOUR

    return {
      firstControlPoint: { x: detourX, y: sourceY },
      secondControlPoint: { x: detourX, y: targetY },
    }
  }

  if (sourcePosition === Position.Left && targetPosition === Position.Left) {
    const detourX = Math.min(sourceX, targetX) - SAME_SIDE_PORT_DETOUR

    return {
      firstControlPoint: { x: detourX, y: sourceY },
      secondControlPoint: { x: detourX, y: targetY },
    }
  }

  const controlOffset = Math.abs(targetX - sourceX) * 0.4

  return {
    firstControlPoint: getBezierControlPoint({
      offset: controlOffset,
      position: sourcePosition,
      x: sourceX,
      y: sourceY,
    }),
    secondControlPoint: getBezierControlPoint({
      offset: controlOffset,
      position: targetPosition,
      x: targetX,
      y: targetY,
    }),
  }
}

function getBezierControlPoint({
  offset,
  position,
  x,
  y,
}: {
  offset: number
  position: RelationPathParams['sourcePosition']
  x: number
  y: number
}) {
  if (position === Position.Left) {
    return {
      x: x - offset,
      y,
    }
  }

  if (position === Position.Right) {
    return {
      x: x + offset,
      y,
    }
  }

  if (position === Position.Top) {
    return {
      x,
      y: y - offset,
    }
  }

  return {
    x,
    y: y + offset,
  }
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

type BezierPathLengthParams = OrthogonalPathParams & {
  sourcePosition: RelationPathParams['sourcePosition']
  targetPosition: RelationPathParams['targetPosition']
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
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: OrthogonalPathParams) {
  const points = getOrthogonalPathPoints({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  const [firstPoint] = points
  const segments = [`M ${firstPoint.x} ${firstPoint.y}`]

  for (let index = 1; index < points.length - 1; index += 1) {
    const previousPoint = points[index - 1]
    const cornerPoint = points[index]
    const nextPoint = points[index + 1]
    const previousLength = getDistance(previousPoint, cornerPoint)
    const nextLength = getDistance(cornerPoint, nextPoint)
    const radius = Math.min(12, previousLength / 2, nextLength / 2)

    if (radius < 1) {
      segments.push(`L ${cornerPoint.x} ${cornerPoint.y}`)
      continue
    }

    const cornerStart = getPointToward(cornerPoint, previousPoint, radius)
    const cornerEnd = getPointToward(cornerPoint, nextPoint, radius)

    segments.push(
      `L ${cornerStart.x} ${cornerStart.y}`,
      `Q ${cornerPoint.x} ${cornerPoint.y} ${cornerEnd.x} ${cornerEnd.y}`,
    )
  }

  const lastPoint = points[points.length - 1]

  segments.push(`L ${lastPoint.x} ${lastPoint.y}`)

  return segments.join(' ')
}

function getOrthogonalPathPoints({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: OrthogonalPathParams): DbmlRelationPoint[] {
  if (sourcePosition === Position.Right && targetPosition === Position.Right) {
    const detourX = Math.max(sourceX, targetX) + SAME_SIDE_PORT_DETOUR

    return dedupeConsecutivePoints([
      { x: sourceX, y: sourceY },
      { x: detourX, y: sourceY },
      { x: detourX, y: targetY },
      { x: targetX, y: targetY },
    ])
  }

  if (sourcePosition === Position.Left && targetPosition === Position.Left) {
    const detourX = Math.min(sourceX, targetX) - SAME_SIDE_PORT_DETOUR

    return dedupeConsecutivePoints([
      { x: sourceX, y: sourceY },
      { x: detourX, y: sourceY },
      { x: detourX, y: targetY },
      { x: targetX, y: targetY },
    ])
  }

  const middleX = getMiddleX(sourceX, targetX)

  return dedupeConsecutivePoints([
    { x: sourceX, y: sourceY },
    { x: middleX, y: sourceY },
    { x: middleX, y: targetY },
    { x: targetX, y: targetY },
  ])
}

function getPointToward(
  fromPoint: DbmlRelationPoint,
  toPoint: DbmlRelationPoint,
  distance: number,
) {
  const length = getDistance(fromPoint, toPoint)

  if (length === 0) {
    return fromPoint
  }

  return {
    x: fromPoint.x + ((toPoint.x - fromPoint.x) / length) * distance,
    y: fromPoint.y + ((toPoint.y - fromPoint.y) / length) * distance,
  }
}

function dedupeConsecutivePoints(points: DbmlRelationPoint[]) {
  return points.filter(
    (point, index) =>
      index === 0 ||
      point.x !== points[index - 1].x ||
      point.y !== points[index - 1].y,
  )
}

function isSameHorizontalSide(
  sourcePosition: RelationPathParams['sourcePosition'],
  targetPosition: RelationPathParams['targetPosition'],
) {
  return (
    (sourcePosition === Position.Left && targetPosition === Position.Left) ||
    (sourcePosition === Position.Right && targetPosition === Position.Right)
  )
}

function getMiddleX(sourceX: number, targetX: number) {
  return sourceX + (targetX - sourceX) / 2
}
