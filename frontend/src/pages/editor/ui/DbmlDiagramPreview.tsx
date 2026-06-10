import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect, useMemo, useState } from 'react'
import {
  mapDbmlDiagramToFlow,
  type DbmlDiagramFlowElements,
} from '../lib/map-dbml-diagram-flow'
import {
  DEFAULT_DBML_RELATION_LINE_STYLE,
  type DbmlRelationLineStyle,
} from '../model/dbml-diagram-rendering'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import { DbmlRelationEdge } from './DbmlRelationEdge'
import { DbmlTableNode } from './DbmlTableNode'
import styles from './EditorPage.module.css'

type DbmlDiagramPreviewProps = {
  diagram: LayoutedDbmlDiagram | null
  isPending: boolean
  isPaused: boolean
}

const NODE_TYPES = {
  dbmlTable: DbmlTableNode,
} satisfies NodeTypes

const EDGE_TYPES = {
  dbmlRelation: DbmlRelationEdge,
} satisfies EdgeTypes

const EMPTY_FLOW_ELEMENTS: DbmlDiagramFlowElements = {
  nodes: [],
  edges: [],
}

const RELATION_LINE_STYLE_OPTIONS = [
  {
    value: 'bezier',
    label: 'Bezier',
  },
  {
    value: 'orthogonal',
    label: 'Step',
  },
  {
    value: 'rounded-orthogonal',
    label: 'Rounded',
  },
] satisfies Array<{
  value: DbmlRelationLineStyle
  label: string
}>

export function DbmlDiagramPreview({
  diagram,
  isPending,
  isPaused,
}: DbmlDiagramPreviewProps) {
  const [relationLineStyle, setRelationLineStyle] =
    useState<DbmlRelationLineStyle>(DEFAULT_DBML_RELATION_LINE_STYLE)
  const elements = useMemo(
    () =>
      diagram
        ? mapDbmlDiagramToFlow(diagram, relationLineStyle)
        : EMPTY_FLOW_ELEMENTS,
    [diagram, relationLineStyle],
  )
  const isEmpty = !diagram || diagram.tables.length === 0

  return (
    <section
      className={styles.diagramPanel}
      aria-labelledby="diagram-heading"
      aria-busy={isPending}
    >
      <div className={styles.diagramHeader}>
        <div>
          <p className={styles.eyebrow}>Preview</p>
          <h2 id="diagram-heading">Diagram</h2>
        </div>
        <div className={styles.diagramHeaderActions}>
          <div
            className={styles.relationLineStyleControl}
            role="group"
            aria-label="Relation line style"
          >
            {RELATION_LINE_STYLE_OPTIONS.map((option) => (
              <button
                aria-pressed={relationLineStyle === option.value}
                className={[
                  styles.relationLineStyleButton,
                  relationLineStyle === option.value
                    ? styles.relationLineStyleButtonActive
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={option.value}
                onClick={() => setRelationLineStyle(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className={styles.documentState}>
            {getPreviewStateLabel({ isPending, isPaused, isEmpty })}
          </span>
        </div>
      </div>

      <div className={styles.diagramSurface}>
        <ReactFlowProvider>
          <DiagramCanvas elements={elements} isEmpty={isEmpty} />
        </ReactFlowProvider>

        {isPaused ? (
          <p className={styles.diagramStatus}>Preview paused: invalid DBML</p>
        ) : null}

        {isEmpty ? (
          <p className={styles.diagramEmpty}>No renderable tables</p>
        ) : null}
      </div>
    </section>
  )
}

type DiagramCanvasProps = {
  elements: DbmlDiagramFlowElements
  isEmpty: boolean
}

function DiagramCanvas({ elements, isEmpty }: DiagramCanvasProps) {
  const reactFlow = useReactFlow()

  useEffect(() => {
    if (isEmpty) {
      return
    }

    window.requestAnimationFrame(() => {
      void reactFlow.fitView({ padding: 0.18, duration: 240 })
    })
  }, [isEmpty, elements.nodes, reactFlow])

  return (
    <ReactFlow
      nodes={elements.nodes}
      edges={elements.edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      panActivationKeyCode={null}
      zoomActivationKeyCode={null}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#d7dde6" gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

function getPreviewStateLabel({
  isPending,
  isPaused,
  isEmpty,
}: {
  isPending: boolean
  isPaused: boolean
  isEmpty: boolean
}) {
  if (isPending) {
    return 'Layout'
  }

  if (isPaused) {
    return 'Paused'
  }

  return isEmpty ? 'Empty' : 'Ready'
}
