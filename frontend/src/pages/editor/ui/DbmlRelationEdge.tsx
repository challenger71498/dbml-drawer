import { BaseEdge, type EdgeProps, type Edge } from '@xyflow/react'
import type { DbmlRelationEdgeData } from '../lib/map-dbml-diagram-flow'
import type { DbmlDiagramPoint } from '../model/dbml-layout'

export function DbmlRelationEdge({
  data,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}: EdgeProps<Edge<DbmlRelationEdgeData>>) {
  const route = data?.route
  const path = buildOrthogonalPath([
    { x: sourceX, y: sourceY },
    ...(route?.bendPoints ?? []),
    { x: targetX, y: targetY },
  ])

  return (
    <BaseEdge
      path={path}
      markerEnd={markerEnd}
      style={{ stroke: '#3b6ea8', strokeWidth: 1.5 }}
    />
  )
}

function buildOrthogonalPath(points: DbmlDiagramPoint[]) {
  const [firstPoint, ...nextPoints] = points

  if (!firstPoint) {
    return ''
  }

  return nextPoints.reduce(
    (path, point) => `${path} L ${point.x} ${point.y}`,
    `M ${firstPoint.x} ${firstPoint.y}`,
  )
}
