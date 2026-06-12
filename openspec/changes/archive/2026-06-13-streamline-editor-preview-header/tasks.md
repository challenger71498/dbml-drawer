## 1. Header Layout

- [x] 1.1 Place the editor page header inside the workspace column beside the sidebars.
- [x] 1.2 Reduce the editor page header height to match the activity sidebar button height.
- [x] 1.3 Replace the current header content with uppercase project name and visually separated note on the left.
- [x] 1.4 Add stable fallback metadata rendering for invalid or incomplete DBML documents.
- [x] 1.5 Remove the preview section header from the main workspace.
- [x] 1.6 Add a compact editor footer with database type aligned to the right.
- [x] 1.7 Hide missing Note metadata and missing database metadata instead of showing fallback text.
- [x] 1.8 Replace the footer Database text label with a database-shaped icon.

## 2. Settings Controls

- [x] 2.1 Move Bezier, Step, and Rounded edge routing controls into the Settings panel.
- [x] 2.2 Add Solid, Gradient, and Dynamic relation line style controls to the Settings panel.
- [x] 2.3 Remove edge routing controls from the old preview toolbar/top chrome.
- [x] 2.4 Ensure Settings panel controls read from and write to the existing persisted editor settings store.

## 3. Preview Overlays

- [x] 3.1 Remove the `Valid` and `Ready` pills from the editor top toolbar area.
- [x] 3.2 Add an upper-left preview validation overlay that renders only for invalid DBML.
- [x] 3.3 Reuse the editor validation diagnostic message in the invalid preview overlay.
- [x] 3.4 Add an upper-left preview render status treatment for paused states without restoring the preview header.
- [x] 3.5 Add a compact upper-right preview relation line style control for Solid, Gradient, and Dynamic.
- [x] 3.6 Keep the compact preview relation style control and Settings panel relation style control synchronized through the same state.

## 4. Styling And Responsiveness

- [x] 4.1 Apply existing design tokens to the compact header, preview overlays, warning treatment, and compact relation style control.
- [x] 4.2 Ensure compact preview controls do not overlap validation/render status overlays at supported viewport widths.
- [x] 4.3 Verify left and right sidebars still expand, collapse, resize, and align correctly beside the workspace header.
- [x] 4.4 Verify the diagram viewport sizing remains stable when sidebars are expanded or collapsed.

## 5. Tests And Validation

- [x] 5.1 Update or add unit/component tests for compact header metadata and fallback rendering.
- [x] 5.2 Update or add tests confirming the preview header and old `Valid`/`Ready` pills are removed.
- [x] 5.3 Update or add tests for invalid DBML warning overlay placement and message content.
- [x] 5.4 Update or add tests for Settings-hosted routing and relation style controls.
- [x] 5.5 Update or add tests for compact preview relation style control synchronization.
- [x] 5.6 Run frontend typecheck, lint, format check, and relevant Vitest suites.
- [x] 5.7 Run `openspec validate --all`.
