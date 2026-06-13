import { Position } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import { getRelationPath, getRelationPathLength } from './dbml-relation-path'

describe('dbml relation path', () => {
  it('rounds same-side right ports with an outside bezier loop', () => {
    const path = getRelationPath({
      lineStyle: 'bezier',
      sourceX: 100,
      sourceY: 20,
      sourcePosition: Position.Right,
      targetX: 100,
      targetY: 80,
      targetPosition: Position.Right,
    })

    expect(path).toBe('M 100 20 C 164 20 164 80 100 80')
  })

  it('routes same-side right ports outside the node edge', () => {
    const path = getRelationPath({
      lineStyle: 'orthogonal',
      sourceX: 100,
      sourceY: 20,
      sourcePosition: Position.Right,
      targetX: 100,
      targetY: 80,
      targetPosition: Position.Right,
    })

    expect(path).toBe('M 100 20 L 164 20 L 164 80 L 100 80')
  })

  it('uses the same-side detour when calculating orthogonal path length', () => {
    const length = getRelationPathLength({
      lineStyle: 'orthogonal',
      sourceX: 100,
      sourceY: 20,
      sourcePosition: Position.Right,
      targetX: 100,
      targetY: 80,
      targetPosition: Position.Right,
    })

    expect(length).toBe(188)
  })
})
