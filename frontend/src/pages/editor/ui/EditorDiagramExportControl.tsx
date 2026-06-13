import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  buildDbmlDiagramExportSnapshot,
  createDbmlDiagramExportBlob,
  createDbmlDiagramExportFilename,
  downloadDbmlDiagramExportBlob,
  type DbmlDiagramExportFormat,
} from '../lib/dbml-diagram-export'
import type { LayoutedDbmlDiagram } from '../model/dbml-layout'
import type { DbmlDiagramSelectionTarget } from '../model/dbml-diagram-selection'
import type {
  DbmlRelationHighlightMode,
  DbmlRelationLineStyle,
} from '../model/dbml-diagram-rendering'
import type { ResolvedEditorTheme } from '../model/editor-theme'
import { ExportIcon } from './EditorInspectorIcons'
import styles from './EditorPage.module.css'

type EditorDiagramExportControlProps = {
  diagram: LayoutedDbmlDiagram | null
  focusedTarget: DbmlDiagramSelectionTarget | null
  projectName: string
  relationHighlightMode: DbmlRelationHighlightMode
  relationLineStyle: DbmlRelationLineStyle
  resolvedWorkspaceTheme: ResolvedEditorTheme
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error'

export function EditorDiagramExportControl({
  diagram,
  focusedTarget,
  projectName,
  relationHighlightMode,
  relationLineStyle,
  resolvedWorkspaceTheme,
}: EditorDiagramExportControlProps) {
  const panelId = useId()
  const controlRef = useRef<HTMLDivElement>(null)
  const defaultFilenameBase = useMemo(
    () =>
      createDbmlDiagramExportFilename({
        format: 'html',
        projectName,
      }).replace(/\.html$/u, ''),
    [projectName],
  )
  const [isOpen, setOpen] = useState(false)
  const [customFilenameBase, setCustomFilenameBase] = useState<string | null>(
    null,
  )
  const [includeSelectionHighlight, setIncludeSelectionHighlight] =
    useState(true)
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const canExport = diagram !== null && diagram.tables.length > 0
  const filenameBase = customFilenameBase ?? defaultFilenameBase

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (controlRef.current?.contains(target)) {
        return
      }

      setOpen(false)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  }, [isOpen])

  const handleExport = useCallback(
    async (format: DbmlDiagramExportFormat) => {
      const snapshot = buildDbmlDiagramExportSnapshot({
        diagram,
        focusedTarget,
        includeSelectionHighlight,
        relationHighlightMode,
        relationLineStyle,
        theme: resolvedWorkspaceTheme,
      })

      if (!snapshot) {
        setStatus('error')
        setErrorMessage('No rendered diagram is available to export.')
        return
      }

      setStatus('exporting')
      setErrorMessage(null)

      try {
        const blob = await createDbmlDiagramExportBlob({
          format,
          snapshot,
        })

        downloadDbmlDiagramExportBlob({
          blob,
          filename: createDbmlDiagramExportFilename({
            format,
            projectName: filenameBase,
          }),
        })
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Diagram export failed before a file could be downloaded.',
        )
      }
    },
    [
      diagram,
      filenameBase,
      focusedTarget,
      includeSelectionHighlight,
      relationHighlightMode,
      relationLineStyle,
      resolvedWorkspaceTheme,
    ],
  )

  return (
    <div ref={controlRef} className={styles.exportControl}>
      <button
        aria-controls={isOpen ? panelId : undefined}
        aria-expanded={isOpen}
        className={styles.exportTrigger}
        disabled={!canExport}
        type="button"
        onClick={() => {
          setOpen((current) => !current)
          setStatus('idle')
          setErrorMessage(null)
        }}
      >
        <ExportIcon className={styles.exportTriggerIcon} />
        <span>Export</span>
      </button>

      {isOpen ? (
        <div
          className={styles.exportMenu}
          id={panelId}
          role="dialog"
          aria-label="Export diagram"
        >
          <label className={styles.exportFilenameField}>
            <span>File name</span>
            <input
              aria-label="Export file name"
              value={filenameBase}
              onChange={(event) => {
                setCustomFilenameBase(event.currentTarget.value)
              }}
            />
          </label>

          <label className={styles.exportToggleField}>
            <input
              checked={includeSelectionHighlight}
              type="checkbox"
              onChange={(event) =>
                setIncludeSelectionHighlight(event.currentTarget.checked)
              }
            />
            <span>Include focused selection highlight</span>
          </label>

          <div className={styles.exportFormatActions}>
            <button
              className={styles.exportFormatButton}
              disabled={!canExport || status === 'exporting'}
              type="button"
              onClick={() => void handleExport('png')}
            >
              PNG
            </button>
            <button
              className={styles.exportFormatButton}
              disabled={!canExport || status === 'exporting'}
              type="button"
              onClick={() => void handleExport('html')}
            >
              HTML
            </button>
          </div>

          {status === 'exporting' ? (
            <p className={styles.exportStatus} role="status">
              Exporting diagram...
            </p>
          ) : null}
          {status === 'success' ? (
            <p className={styles.exportStatus} role="status">
              Export started.
            </p>
          ) : null}
          {status === 'error' && errorMessage ? (
            <p className={styles.exportError} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
