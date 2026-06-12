## Context

The editor page currently has multiple stacked chrome rows: an editor page header, a preview section header, validation/render status pills, edge routing controls, and relation line style controls. The activity sidebars already own editor-local navigation chrome, so the compact editor header should sit beside the sidebars inside the workspace column rather than spanning over them.

The diagram preview remains the primary content area. Status and high-frequency diagram style controls should be presented as lightweight preview overlays rather than full section headers.

## Goals / Non-Goals

**Goals:**

- Collapse editor top chrome to one compact editor header.
- Move preview-specific status and relation style controls into diagram preview overlays.
- Move lower-frequency diagram routing controls into the Settings panel.
- Keep relation line style controls available in both Settings and the preview for quick switching.
- Preserve existing Zustand settings state, theme tokens, sidebar behavior, DBML validation behavior, and diagram rendering behavior.

**Non-Goals:**

- Changing DBML parsing semantics or metadata extraction beyond displaying already parsed Project name, Note, and database type.
- Changing relation line rendering algorithms.
- Redesigning sidebars or settings persistence.
- Adding new layout algorithms or new relation line styles.

## Decisions

### Use a workspace-level compact editor header

The editor header should become the only persistent workspace header for `/editor` and should render inside the central workspace column beside the left and right activity sidebars. This keeps the sidebars full-height and avoids making the activity bars feel subordinate to document metadata.

Alternative considered: render the header above the sidebars as page-level chrome. That makes the metadata globally prominent, but it visually interrupts the full-height activity bars and feels heavier than the intended compact editor chrome.

### Split document metadata between header and footer

The compact header should read Project name and Note from the current DBML document parse result when available. The Project name should be visually uppercased, and the Note should be visually separated from the title so the header reads as title plus description rather than one continuous phrase. If Note is not declared, the header should omit both the separator and Note text. Database type should move to a compact footer aligned to the right, use a database-shaped icon instead of a text label, and be sized to the shared sidebar panel header height. If database type is not declared, the footer database information should be omitted.

Alternative considered: parse metadata separately from the editor text. That would duplicate parsing paths and risks inconsistency with validation.

### Treat validation/rendering status as preview overlays

The old `Valid` and `Ready` pills should be removed from the top toolbar. Invalid DBML should be shown near the preview upper-left area using a red warning icon and the existing validation message. Valid DBML should produce no validation badge. Render readiness can remain visible only when it communicates a non-default state such as pending, paused, or not ready.

Alternative considered: move status into the compact header. That competes with document metadata and makes the header noisy during editing.

### Split routing and style control placement by frequency

Edge routing (`Bezier`, `Step`, `Rounded`) belongs in Settings because it is a diagram preference. Relation line style (`Solid`, `Gradient`, `Dynamic`) remains in Settings for completeness and is duplicated as a compact quick control in the preview upper-right because it is visually experimental and frequently toggled during diagram inspection.

Alternative considered: move all controls only to Settings. That would maximize chrome reduction but make line style experimentation slower.

### Keep compact preview controls token-driven

The preview upper-right relation style control should reuse existing theme tokens and selected-state treatment, but use narrower horizontal dimensions than the current toolbar segmented control. It should remain accessible with labels/tooltips and preserve existing persisted setting behavior.

Alternative considered: use icon-only controls. The three current styles are not obvious enough from icons alone, so compact text labels are preferable.

## Risks / Trade-offs

- Metadata extraction may be unavailable for invalid DBML -> use clear fallback title and omit optional Note/database metadata consistently.
- Removing the preview header can make section boundaries less explicit -> preserve visual separation through spacing and overlay placement.
- Duplicating relation style controls in Settings and preview can drift -> bind both to the same settings store selectors/actions.
- Keeping the editor header inside the workspace means sidebars remain taller than the header area -> preserve alignment through clear borders and test collapsed/expanded sidebars, resized sidebars, and diagram viewport sizing.
- Compact controls may wrap at narrow widths -> use fixed compact dimensions or responsive overflow that does not overlap status overlays.
