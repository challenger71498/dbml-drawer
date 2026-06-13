export type DbmlDiagramFlowProxyRect = {
  left: number
  top: number
  width: number
  height: number
}

export function rectanglesOverlap(
  first: DbmlDiagramFlowProxyRect,
  second: DbmlDiagramFlowProxyRect,
) {
  return (
    first.left < second.left + second.width &&
    first.left + first.width > second.left &&
    first.top < second.top + second.height &&
    first.top + first.height > second.top
  )
}

export function getRectangleOverlapArea(
  first: DbmlDiagramFlowProxyRect,
  second: DbmlDiagramFlowProxyRect,
) {
  const width = Math.max(
    0,
    Math.min(first.left + first.width, second.left + second.width) -
      Math.max(first.left, second.left),
  )
  const height = Math.max(
    0,
    Math.min(first.top + first.height, second.top + second.height) -
      Math.max(first.top, second.top),
  )

  return width * height
}

export function clampScreenPosition({
  max,
  min,
  value,
}: {
  max: number
  min: number
  value: number
}) {
  return Math.max(min, Math.min(max, value))
}

export function getNonOverlappingStackPositions({
  desiredPositions,
  gap,
  itemSizes,
  maxEndPosition,
  minPosition,
}: {
  desiredPositions: readonly number[]
  gap: number
  itemSizes: readonly number[]
  maxEndPosition: number
  minPosition: number
}) {
  const positions: number[] = []

  for (const [index, position] of desiredPositions.entries()) {
    const previousPosition = positions.at(-1) ?? null
    const minAllowedPosition =
      previousPosition === null
        ? minPosition
        : previousPosition + itemSizes[index - 1] + gap

    positions.push(Math.max(position, minAllowedPosition))
  }

  const lastPosition = positions.at(-1)
  const lastItemSize = itemSizes.at(-1)
  const overflow =
    lastPosition === undefined || lastItemSize === undefined
      ? 0
      : lastPosition + lastItemSize - maxEndPosition

  if (overflow <= 0) {
    return positions
  }

  const shiftedPositions = positions.map((position) => position - overflow)
  const underflow = minPosition - shiftedPositions[0]

  if (underflow <= 0) {
    return shiftedPositions
  }

  return shiftedPositions.map((position) => position + underflow)
}
