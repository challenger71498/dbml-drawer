import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type EdgeTypes,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  mapDbmlDiagramToFlow,
  type DbmlDiagramFlowElements,
  type DbmlTableNodeData,
} from '../lib/map-dbml-diagram-flow'
import type { DbmlDiagramColumn, DbmlDiagramTable } from '../model/dbml-diagram'
import {
  DEFAULT_DBML_RELATION_HIGHLIGHT_MODE,
  DEFAULT_DBML_RELATION_LINE_STYLE,
  type DbmlRelationHighlightMode,
  type DbmlRelationLineStyle,
} from '../model/dbml-diagram-rendering'
import type { DbmlDiagramSelectionTarget } from '../model/dbml-diagram-selection'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import { DbmlRelationEdge } from './DbmlRelationEdge'
import { DbmlDiagramSelectionViewProvider } from './DbmlDiagramSelectionViewProvider'
import { DbmlTableNode } from './DbmlTableNode'
import styles from './EditorPage.module.css'

type DbmlDiagramPreviewProps = {
  diagram: LayoutedDbmlDiagram | null
  isPending: boolean
  isPaused: boolean
  backgroundColor?: string
  activeRelationIds?: ReadonlySet<string>
  activeTarget?: DbmlDiagramSelectionTarget | null
  focusedRelationIds?: ReadonlySet<string>
  focusedTableIds?: ReadonlySet<string>
  focusedTarget?: DbmlDiagramSelectionTarget | null
  sourceColumnIds?: ReadonlySet<string>
  referenceColumnIds?: ReadonlySet<string>
  onTableFocus?: (table: DbmlDiagramTable) => void
  onTableHover?: (target: DbmlDiagramSelectionTarget | null) => void
  onColumnFocus?: (column: DbmlDiagramColumn) => void
  onColumnHover?: (target: DbmlDiagramSelectionTarget | null) => void
  onFocusClear?: () => void
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

const EMPTY_ACTIVE_RELATION_IDS = new Set<string>()
const EMPTY_ENDPOINT_COLUMN_IDS = new Set<string>()

const NOOP_FOCUS_CLEAR = () => undefined
const NOOP_COLUMN_FOCUS = () => undefined
const NOOP_COLUMN_HOVER = () => undefined

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

const RELATION_HIGHLIGHT_MODE_OPTIONS = [
  {
    value: 'solid',
    label: 'Solid',
  },
  {
    value: 'gradient',
    label: 'Gradient',
  },
  {
    value: 'dynamic',
    label: 'Dynamic',
  },
] satisfies Array<{
  value: DbmlRelationHighlightMode
  label: string
}>

export function DbmlDiagramPreview({
  diagram,
  isPending,
  isPaused,
  backgroundColor = '#d7dde6',
  activeRelationIds = EMPTY_ACTIVE_RELATION_IDS,
  activeTarget = null,
  focusedRelationIds = EMPTY_ACTIVE_RELATION_IDS,
  focusedTableIds = EMPTY_ACTIVE_RELATION_IDS,
  focusedTarget = null,
  sourceColumnIds = EMPTY_ENDPOINT_COLUMN_IDS,
  referenceColumnIds = EMPTY_ENDPOINT_COLUMN_IDS,
  onTableFocus = () => undefined,
  onTableHover = () => undefined,
  onColumnFocus = NOOP_COLUMN_FOCUS,
  onColumnHover = NOOP_COLUMN_HOVER,
  onFocusClear = NOOP_FOCUS_CLEAR,
}: DbmlDiagramPreviewProps) {
  const [relationLineStyle, setRelationLineStyle] =
    useState<DbmlRelationLineStyle>(DEFAULT_DBML_RELATION_LINE_STYLE)
  const [relationHighlightMode, setRelationHighlightMode] =
    useState<DbmlRelationHighlightMode>(DEFAULT_DBML_RELATION_HIGHLIGHT_MODE)
  const elements = useMemo(
    () =>
      diagram
        ? mapDbmlDiagramToFlow(diagram, {
            highlightMode: relationHighlightMode,
            lineStyle: relationLineStyle,
          })
        : EMPTY_FLOW_ELEMENTS,
    [diagram, relationHighlightMode, relationLineStyle],
  )
  const selectionViewState = useMemo(
    () => ({
      activeRelationIds,
      activeTarget,
      focusedRelationIds,
      focusedTableIds,
      focusedTarget,
      sourceColumnIds,
      referenceColumnIds,
      onColumnFocus,
      onColumnHover,
    }),
    [
      activeRelationIds,
      activeTarget,
      focusedRelationIds,
      focusedTableIds,
      focusedTarget,
      sourceColumnIds,
      referenceColumnIds,
      onColumnFocus,
      onColumnHover,
    ],
  )
  const fitViewKey = useMemo(
    () => (diagram ? getDiagramFitViewKey(diagram) : 'empty'),
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
          <div
            className={styles.relationLineStyleControl}
            role="group"
            aria-label="Relation highlight mode"
          >
            {RELATION_HIGHLIGHT_MODE_OPTIONS.map((option) => (
              <button
                aria-pressed={relationHighlightMode === option.value}
                className={[
                  styles.relationLineStyleButton,
                  relationHighlightMode === option.value
                    ? styles.relationLineStyleButtonActive
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={option.value}
                onClick={() => setRelationHighlightMode(option.value)}
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
          <DbmlDiagramSelectionViewProvider value={selectionViewState}>
            <DiagramCanvas
              backgroundColor={backgroundColor}
              elements={elements}
              fitViewKey={fitViewKey}
              isEmpty={isEmpty}
              onFocusClear={onFocusClear}
              onTableFocus={onTableFocus}
              onTableHover={onTableHover}
            />
          </DbmlDiagramSelectionViewProvider>
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
  backgroundColor: string
  elements: DbmlDiagramFlowElements
  fitViewKey: string
  isEmpty: boolean
  onFocusClear: () => void
  onTableFocus: (table: DbmlDiagramTable) => void
  onTableHover: (target: DbmlDiagramSelectionTarget | null) => void
}

type DbmlTableFlowNode = Node<DbmlTableNodeData>

function DiagramCanvas({
  backgroundColor,
  elements,
  fitViewKey,
  isEmpty,
  onFocusClear,
  onTableFocus,
  onTableHover,
}: DiagramCanvasProps) {
  const reactFlow = useReactFlow()

  const handleNodeMouseEnter = useCallback<NodeMouseHandler<DbmlTableFlowNode>>(
    (_, node) => {
      onTableHover({
        type: 'table',
        tableId: node.data.table.id,
      })
    },
    [onTableHover],
  )

  const handleNodeMouseLeave = useCallback<
    NodeMouseHandler<DbmlTableFlowNode>
  >(() => {
    onTableHover(null)
  }, [onTableHover])

  const handleNodeClick = useCallback<NodeMouseHandler<DbmlTableFlowNode>>(
    (_, node) => {
      onTableFocus(node.data.table)
    },
    [onTableFocus],
  )

  const handlePaneClick = useCallback(() => {
    onFocusClear()
  }, [onFocusClear])

  useEffect(() => {
    if (isEmpty) {
      return
    }

    window.requestAnimationFrame(() => {
      void reactFlow.fitView({ padding: 0.18, duration: 240 })
    })
  }, [fitViewKey, isEmpty, reactFlow])

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
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onPaneClick={handlePaneClick}
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      panActivationKeyCode={null}
      zoomActivationKeyCode={null}
      proOptions={{ hideAttribution: true }}
    >
      <Background color={backgroundColor} gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

function getDiagramFitViewKey(diagram: LayoutedDbmlDiagram) {
  return [
    diagram.tables
      .map((table) =>
        [
          table.id,
          table.position.x,
          table.position.y,
          table.columns.map((column) => column.id).join(','),
        ].join(':'),
      )
      .join('|'),
    diagram.relations.map((relation) => relation.id).join('|'),
  ].join('//')
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
