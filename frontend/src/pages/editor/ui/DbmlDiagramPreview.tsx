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
import { useEffect, useMemo } from 'react'
import {
  mapDbmlDiagramToFlow,
  type DbmlDiagramFlowElements,
} from '../lib/map-dbml-diagram-flow'
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

export function DbmlDiagramPreview({
  diagram,
  isPending,
  isPaused,
}: DbmlDiagramPreviewProps) {
  const elements = useMemo(
    () => (diagram ? mapDbmlDiagramToFlow(diagram) : EMPTY_FLOW_ELEMENTS),
    [diagram],
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
        <span className={styles.documentState}>
          {getPreviewStateLabel({ isPending, isPaused, isEmpty })}
        </span>
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
      elementsSelectable={false}
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
