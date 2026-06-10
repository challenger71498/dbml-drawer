## Context

The editor page currently renders the DBML code editor and diagram preview inside `editorContent` as a two-column split. Right-side editor tools are hosted by `EditorInspector`, which provides an activity bar plus optional sidebar panel. The requested change introduces a left-side activity bar plus toggleable sidebar panel for authoring content, with the DBML code editor as the first and only content in that sidebar.

The existing `DbmlCodeEditor` owns Monaco integration, diagnostics markers, and `revealSourceRange`; those behaviors should remain unchanged. The layout change should move the editor surface into a sidebar shell rather than replacing editor internals.

## Goals / Non-Goals

**Goals:**

- Add a narrow left activity bar and toggleable left sidebar to the editor workspace.
- Make the left sidebar visually consistent with the existing right inspector sidebar.
- Place the existing DBML code editor inside the left sidebar.
- Keep the diagram preview as the central workspace area.
- Preserve current editor state, validation, diagnostics markers, and diagram-to-source reveal behavior.

**Non-Goals:**

- Add multiple left sidebar activities or a new left activity bar in this change.
- Move diagnostics, presets, or diagram settings from the right inspector.
- Change DBML parsing, validation, Monaco language registration, or diagram layout behavior.
- Add persistence for sidebar width or collapse state.

## Decisions

### Use a dedicated left activity rail and sidebar shell first

Implement a left activity rail and sidebar container in `EditorPage` and CSS rather than generalizing `EditorInspector` immediately.

Rationale: the right inspector is activity-driven and currently dev-tool oriented. The first left sidebar only needs one DBML editor activity, so a dedicated shell keeps the implementation small while preserving a clear future path for extraction if the left side gains multiple activities.

Alternative considered: generalize `EditorInspector` into a side-agnostic sidebar component. That is useful later, but it would increase abstraction and risk before there is more than one left-side activity.

### Keep `DbmlCodeEditor` unchanged

Move the existing `DbmlCodeEditor` instance into the expanded left sidebar body and keep the current ref, value, diagnostics, and `onChange` wiring.

Rationale: Monaco integration and source reveal behavior already work. The change is layout-oriented, so editor behavior should stay stable.

### Make the diagram preview the primary center pane

Change the editor page layout from editor/diagram split to left activity rail, optional editor panel, central editor workspace, and optional right inspector. The central editor workspace should contain the current editor page header and `DbmlDiagramPreview`.

Rationale: the current `Editor` header is page-local chrome, not a global application header. The left sidebar should therefore span the same page height as the right inspector, while the diagram becomes the main canvas inside the central workspace.

### Match right sidebar visual language

Reuse existing color, border, header, and panel sizing conventions from `editorInspectorSidebar`, `editorInspectorHeader`, and related CSS where practical.

Rationale: users should recognize the left panel as part of the same editor shell without introducing a competing visual system.

## Risks / Trade-offs

- Sidebar width can reduce diagram space on smaller viewports -> use responsive CSS so the layout can stack or reduce minimum widths at narrow breakpoints.
- Duplicating some right sidebar CSS can drift over time -> keep class names and styling grouped, and extract shared sidebar shell classes later if left sidebar gains more tools.
- Monaco can be sensitive to container resizing -> ensure the editor container has stable `min-width`, `min-height`, and flex/grid constraints so Monaco can lay out correctly.
