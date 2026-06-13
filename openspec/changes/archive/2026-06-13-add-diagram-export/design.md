## Context

The editor page already owns the current DBML document, validation state, layouted diagram, relation rendering settings, resolved workspace theme, and focused diagram target. The live preview renders through React Flow with HTML table nodes, SVG relation edges, optional offscreen relation proxy overlays, and animated dynamic relation highlights.

Export crosses several boundaries: it needs the current diagram data and visual settings from the editor, a stable render target from the diagram preview layer, and browser download behavior for PNG and HTML files. The exported artifact must be static enough to work outside the interactive editor while still matching the current diagram's visual state where requested.

## Goals / Non-Goals

**Goals:**

- Export the currently rendered DBML diagram as PNG.
- Export the currently rendered DBML diagram as standalone static HTML.
- Export the full diagram bounds rather than only the visible viewport.
- Let users choose whether the currently focused table or column highlight appears in the export.
- Render `dynamic` relation highlighting as static `gradient` highlighting in all export formats.
- Keep export browser-local and testable through small rendering and serialization boundaries.

**Non-Goals:**

- Do not add backend export jobs, persistence, authentication, or file storage.
- Do not export the DBML source text, diagnostics, editor sidebars, or settings panels.
- Do not make exported HTML an interactive editor or a React Flow instance.
- Do not preserve transient hover state, pan position, offscreen proxy overlays, or animated dynamic markers in exported output.
- Do not solve PDF, SVG, JPEG, or clipboard export in this change.

## Decisions

### Add an explicit export model

Add small page-local export types such as `DbmlDiagramExportFormat`, `DbmlDiagramExportOptions`, and `DbmlDiagramExportSnapshot`. The snapshot should include the current layouted diagram, resolved theme, relation line style, effective relation highlight mode, and optional focused target.

The effective export highlight mode should normalize `dynamic` to `gradient`. Selection highlight inclusion should be modeled as an option rather than derived from the current UI state alone:

- include focused highlight: pass the focused diagram target into the export snapshot.
- omit focused highlight: pass no active target into the export snapshot.

Alternative considered: capture the live React Flow viewport DOM directly. That is simpler initially, but it risks exporting only the visible viewport, editor overlays, proxy overlays, transient hover state, and React Flow implementation details.

### Render exports from the layouted diagram, not from the visible viewport

Create an export renderer that consumes the same layouted diagram and rendering settings as the preview but renders a static full-bounds representation. The export bounds should be derived from all table nodes and routed relation points, padded with a deterministic margin, then rendered at a fit-to-content origin.

This keeps large diagrams complete even when the user has panned or zoomed the live preview. It also lets tests assert output size, included table names, relation paths, and highlight mode without depending on browser viewport state.

Alternative considered: use React Flow's current viewport transform. That would better match the exact visible screen but would make "current diagram export" behave like a screenshot, excluding offscreen content and making the output unstable across viewport sizes.

### Keep HTML export static and self-contained

HTML export should produce a standalone document with inline markup and styles for the diagram surface, table cards, columns, relation paths, and active highlight styling. It should not require the app bundle, React, React Flow, or network access to view the exported file.

The HTML serializer can reuse export renderer primitives, but the output contract should be static HTML plus CSS. If later interactivity is needed, it should be introduced as a separate capability.

### Isolate PNG capture behind an adapter

PNG export should render the static export document into an offscreen DOM container and capture that container to a PNG blob. The implementation can use a focused browser-side DOM-to-image helper or a small dependency if needed, but that dependency should be isolated behind an adapter such as `captureDiagramExportAsPng`.

The adapter boundary keeps the rest of the export flow independent from the capture mechanism and makes unit tests possible without relying on real canvas rasterization.

### Add editor controls without making export a settings preference

The editor workspace should expose export as a command surface rather than a persisted editor setting. The export trigger should live in the editor header's right-side action area because export applies to the current workspace output and should be reachable without opening Settings or a development-only panel.

The trigger can open a compact popover or menu that contains a file name field, format choices, and the selection-highlight option. The file name should default to the same generated name used by the automatic export filename path, without requiring a persisted preference. Format, filename, and highlight inclusion are per-export choices, and changing them should not change relation rendering settings in the live preview.

Alternative considered: place export in the Settings sidebar. This was rejected because export is an immediate command, not a durable editor preference, and hiding it in Settings would make the primary sharing workflow harder to discover.

### Preserve live preview behavior

Export must not mutate the live focused target, relation highlight mode, viewport, proxy settings, or preview controls. The export renderer receives normalized snapshot inputs and produces artifacts without causing React Flow relayout or interaction state changes.

## Risks / Trade-offs

- PNG capture fidelity can vary across browsers -> Keep the capture mechanism behind one adapter and verify table styling, edge styling, and gradient fallback with focused tests.
- Very large diagrams can produce large PNGs or hit canvas limits -> Compute export bounds before capture and surface a controlled failure if rasterization cannot complete.
- Static HTML may drift from live preview styles -> Reuse shared tokens/classes where feasible and add tests for representative table, column, relation, and active states.
- Dynamic highlight fallback may surprise users expecting animation -> Label the behavior in export logic and make the exported result deterministic by always using gradient for `dynamic`.
- Browser download APIs can fail in restricted contexts -> Build download helpers with blob URL cleanup and error handling.

## Migration Plan

1. Add export types, snapshot normalization, and filename helpers.
2. Add static diagram export rendering and HTML serialization.
3. Add PNG capture adapter and browser download helpers.
4. Add editor export controls and wire them to the current layouted diagram, settings, theme, and focused target.
5. Add focused tests for export availability, option handling, HTML output, dynamic-to-gradient fallback, and download command wiring.

## Open Questions

- Should PNG export expose a scale option in a later change for high-resolution documentation output?
- Should exported HTML include lightweight pan/zoom behavior in a future capability, or remain intentionally static?
