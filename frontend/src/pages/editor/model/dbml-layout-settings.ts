import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkLayoutAlgorithmDescription } from 'elkjs/lib/elk-api'

export type DbmlLayoutAlgorithmId = string

export type DbmlLayoutAlgorithmOption = {
  id: DbmlLayoutAlgorithmId
  label: string
  description?: string
}

export type DbmlLayoutOptionValueMap = Record<string, string>

export type DbmlLayoutOptionControl =
  | {
      id: string
      label: string
      kind: 'select'
      defaultValue: string
      choices: readonly DbmlLayoutOptionChoice[]
      description?: string
    }
  | {
      id: string
      label: string
      kind: 'number'
      defaultValue?: string
      min?: number
      step?: number
      description?: string
    }
  | {
      id: string
      label: string
      kind: 'boolean'
      defaultValue: string
      description?: string
    }

export type DbmlLayoutOptionChoice = {
  value: string
  label: string
}

export const DEFAULT_DBML_LAYOUT_ALGORITHM_ID = 'org.eclipse.elk.layered'

export const DEFAULT_DBML_LAYOUT_ALGORITHM_OPTION: DbmlLayoutAlgorithmOption = {
  id: DEFAULT_DBML_LAYOUT_ALGORITHM_ID,
  label: 'ELK Layered',
  description:
    'Layer-based layout that keeps directed relationships flowing across the diagram.',
}

export const CURATED_DBML_LAYOUT_OPTION_CONTROLS: Record<
  string,
  readonly DbmlLayoutOptionControl[]
> = {
  'org.eclipse.elk.layered': [
    {
      id: 'elk.direction',
      label: 'Direction',
      kind: 'select',
      defaultValue: 'RIGHT',
      choices: [
        { value: 'RIGHT', label: 'Right' },
        { value: 'LEFT', label: 'Left' },
        { value: 'DOWN', label: 'Down' },
        { value: 'UP', label: 'Up' },
      ],
      description: 'Overall direction of layout flow.',
    },
    {
      id: 'elk.edgeRouting',
      label: 'Edge routing',
      kind: 'select',
      defaultValue: 'ORTHOGONAL',
      choices: [
        { value: 'ORTHOGONAL', label: 'Orthogonal' },
        { value: 'POLYLINE', label: 'Polyline' },
        { value: 'SPLINES', label: 'Splines' },
      ],
      description: 'Routing style for relation edges.',
    },
    {
      id: 'elk.layered.layering.strategy',
      label: 'Layering strategy',
      kind: 'select',
      defaultValue: 'NETWORK_SIMPLEX',
      choices: [
        { value: 'NETWORK_SIMPLEX', label: 'Network simplex' },
        { value: 'LONGEST_PATH', label: 'Longest path' },
        { value: 'LONGEST_PATH_SOURCE', label: 'Longest path source' },
        { value: 'COFFMAN_GRAHAM', label: 'Coffman Graham' },
        { value: 'MIN_WIDTH', label: 'Min width' },
      ],
      description: 'Strategy for assigning nodes to layers.',
    },
    {
      id: 'elk.layered.cycleBreaking.strategy',
      label: 'Cycle breaking',
      kind: 'select',
      defaultValue: 'GREEDY',
      choices: [
        { value: 'GREEDY', label: 'Greedy' },
        { value: 'DEPTH_FIRST', label: 'Depth first' },
        { value: 'MODEL_ORDER', label: 'Model order' },
        { value: 'GREEDY_MODEL_ORDER', label: 'Greedy model order' },
      ],
      description: 'Strategy for reversing edges when cycles exist.',
    },
    {
      id: 'elk.layered.nodePlacement.strategy',
      label: 'Node placement',
      kind: 'select',
      defaultValue: 'BRANDES_KOEPF',
      choices: [
        { value: 'BRANDES_KOEPF', label: 'Brandes Koepf' },
        { value: 'NETWORK_SIMPLEX', label: 'Network simplex' },
        { value: 'LINEAR_SEGMENTS', label: 'Linear segments' },
        { value: 'SIMPLE', label: 'Simple' },
      ],
      description: 'Strategy for assigning concrete node coordinates.',
    },
    {
      id: 'elk.layered.spacing.nodeNodeBetweenLayers',
      label: 'Layer spacing',
      kind: 'number',
      defaultValue: '96',
      min: 0,
      step: 8,
      description: 'Horizontal or vertical spacing between layout layers.',
    },
    {
      id: 'elk.layered.highDegreeNodes.treatment',
      label: 'High-degree treatment',
      kind: 'boolean',
      defaultValue: 'false',
      description: 'Enable special handling for highly connected nodes.',
    },
  ],
  'org.eclipse.elk.force': [
    {
      id: 'elk.force.model',
      label: 'Force model',
      kind: 'select',
      defaultValue: 'FRUCHTERMAN_REINGOLD',
      choices: [
        { value: 'FRUCHTERMAN_REINGOLD', label: 'Fruchterman Reingold' },
        { value: 'EADES', label: 'Eades' },
      ],
      description: 'Physical force model used to place nodes.',
    },
    {
      id: 'elk.force.iterations',
      label: 'Iterations',
      kind: 'number',
      min: 1,
      step: 25,
      description: 'Number of force layout iterations.',
    },
    {
      id: 'elk.force.repulsion',
      label: 'Repulsion',
      kind: 'number',
      min: 0,
      step: 0.1,
      description: 'Repulsive force between nodes.',
    },
  ],
  'org.eclipse.elk.stress': [
    {
      id: 'elk.stress.desiredEdgeLength',
      label: 'Desired edge length',
      kind: 'number',
      min: 1,
      step: 10,
      description: 'Preferred geometric distance for connected nodes.',
    },
    {
      id: 'elk.stress.iterationLimit',
      label: 'Iteration limit',
      kind: 'number',
      min: 1,
      step: 25,
      description: 'Maximum number of stress majorization iterations.',
    },
  ],
  'org.eclipse.elk.box': [
    {
      id: 'elk.box.packingMode',
      label: 'Packing mode',
      kind: 'select',
      defaultValue: 'SIMPLE',
      choices: [
        { value: 'SIMPLE', label: 'Simple' },
        { value: 'GROUP_DEC', label: 'Group descending' },
        { value: 'GROUP_MIXED', label: 'Group mixed' },
        { value: 'GROUP_INC', label: 'Group ascending' },
      ],
      description: 'Packing strategy for unconnected boxes.',
    },
  ],
  'org.eclipse.elk.rectpacking': [
    {
      id: 'elk.rectpacking.widthApproximation.targetWidth',
      label: 'Target width',
      kind: 'number',
      min: 1,
      step: 100,
      description: 'Target width for rectangle packing.',
    },
    {
      id: 'elk.rectpacking.orderBySize',
      label: 'Order by height',
      kind: 'boolean',
      defaultValue: 'false',
      description: 'Sort rectangles by height before packing.',
    },
  ],
}

export async function loadDbmlLayoutAlgorithmOptions(): Promise<
  DbmlLayoutAlgorithmOption[]
> {
  const elk = new ELK()

  try {
    const algorithms = await elk.knownLayoutAlgorithms()
    const options = algorithms.flatMap((algorithm) => {
      const option = toDbmlLayoutAlgorithmOption(algorithm)

      return option ? [option] : []
    })

    return ensureDefaultLayoutAlgorithmOption(options)
  } catch {
    return [DEFAULT_DBML_LAYOUT_ALGORITHM_OPTION]
  }
}

export function getDbmlLayoutOptionControls(
  algorithmId: DbmlLayoutAlgorithmId,
) {
  return CURATED_DBML_LAYOUT_OPTION_CONTROLS[algorithmId] ?? []
}

export function getDefaultDbmlLayoutOptionValues(
  algorithmId: DbmlLayoutAlgorithmId,
): DbmlLayoutOptionValueMap {
  return Object.fromEntries(
    getDbmlLayoutOptionControls(algorithmId).flatMap((control) =>
      control.defaultValue === undefined
        ? []
        : [[control.id, control.defaultValue]],
    ),
  )
}

export function normalizeDbmlLayoutOptionValues(
  optionValues: DbmlLayoutOptionValueMap,
): DbmlLayoutOptionValueMap {
  return Object.fromEntries(
    Object.entries(optionValues).filter(([, value]) => value !== ''),
  )
}

function toDbmlLayoutAlgorithmOption(
  algorithm: ElkLayoutAlgorithmDescription,
): DbmlLayoutAlgorithmOption | null {
  if (!algorithm.id) {
    return null
  }

  const option: DbmlLayoutAlgorithmOption = {
    id: algorithm.id,
    label: algorithm.name || algorithm.id,
  }

  if (algorithm.description) {
    option.description = algorithm.description
  }

  return option
}

function ensureDefaultLayoutAlgorithmOption(
  options: DbmlLayoutAlgorithmOption[],
) {
  if (
    options.some((option) => option.id === DEFAULT_DBML_LAYOUT_ALGORITHM_ID)
  ) {
    return options
  }

  return [DEFAULT_DBML_LAYOUT_ALGORITHM_OPTION, ...options]
}
