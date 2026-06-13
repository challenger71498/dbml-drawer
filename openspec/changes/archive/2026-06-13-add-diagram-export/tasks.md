## 1. Export Model

- [x] 1.1 Add page-local export format, option, snapshot, and result types for DBML diagram export.
- [x] 1.2 Add helper logic to build an export snapshot from the current layouted diagram, resolved theme, relation rendering settings, and focused target.
- [x] 1.3 Normalize export relation highlight mode so `dynamic` becomes `gradient` while `solid` and `gradient` are preserved.
- [x] 1.4 Add filename and download helper utilities for PNG and HTML export artifacts.

## 2. Static Export Rendering

- [x] 2.1 Add full-diagram bounds calculation that includes all table nodes and routed relation points with deterministic padding.
- [x] 2.2 Implement a static diagram export renderer for table cards, column rows, relation lines, and active focus styling.
- [x] 2.3 Ensure the static renderer can omit focused target highlighting when the export option disables it.
- [x] 2.4 Ensure export rendering excludes editor sidebars, preview overlays, relation style controls, dev controls, and offscreen relation proxy overlays.

## 3. Export Formats

- [x] 3.1 Implement standalone HTML serialization with inline static styles and no dependency on the app bundle, React Flow, backend access, or network access.
- [x] 3.2 Implement PNG capture through an isolated adapter that renders the static export view to an offscreen target and returns a PNG blob.
- [x] 3.3 Add controlled error handling for failed HTML generation, PNG capture, or browser download setup.

## 4. Editor Integration

- [x] 4.1 Add an editor header right-side export control with PNG and HTML choices.
- [x] 4.2 Add a per-export option for including or omitting the current focused table or column highlight.
- [x] 4.3 Disable or block export actions when no rendered diagram is available.
- [x] 4.4 Wire export commands to the current rendered diagram, relation settings, resolved theme, and focused diagram target without mutating live preview state.
- [x] 4.5 Surface export failure state without clearing the current diagram or editor document.
- [x] 4.6 Add a compact export file name input that defaults to the generated diagram export file name.

## 5. Verification

- [x] 5.1 Add unit tests for export snapshot normalization, full-bounds calculation, and dynamic-to-gradient fallback.
- [x] 5.2 Add tests for HTML serialization including table, column, relation, theme, and optional focus highlight output.
- [x] 5.3 Add tests for editor export controls, disabled state, format selection, selection highlight option, and download command wiring.
- [x] 5.4 Add tests proving export does not mutate live preview focus, relation settings, proxy settings, or viewport-related state.
- [x] 5.5 Run `openspec validate add-diagram-export --strict`.
- [ ] 5.6 Run the affected frontend test suite and `mise run quality`.
