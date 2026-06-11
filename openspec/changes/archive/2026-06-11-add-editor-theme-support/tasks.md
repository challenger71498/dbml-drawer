## 1. Theme Model

- [x] 1.1 Add editor theme mode and resolved theme types for `light`, `dark`, and `system`.
- [x] 1.2 Implement page-local workspace theme state that reads and writes the selected workspace mode from local browser storage with a safe fallback to `system`.
- [x] 1.3 Implement page-local code editor theme state that reads and writes the selected code editor mode, including workspace-following mode, from local browser storage with a safe fallback to `system`.
- [x] 1.4 Resolve system mode through `prefers-color-scheme` for both theme preferences and update each resolved theme when the media query changes.

## 2. Editor Workspace UI

- [x] 2.1 Add an accessible Light/Dark/System workspace theme mode control to the editor workspace chrome or settings surface.
- [x] 2.2 Add an accessible code editor theme mode control with Workspace/Light/Dark/System options near the workspace theme control.
- [x] 2.3 Apply the selected workspace mode and resolved workspace theme to the editor workspace root through stable attributes or classes.
- [x] 2.4 Keep existing editor layout, sidebar toggle, resize, diagram preview, and inspector behavior unchanged while adding the theme controls.

## 3. Theme Styling

- [x] 3.1 Convert editor workspace, toolbar, sidebars, panels, controls, diagram surface, and empty/status states from hard-coded colors to editor-scoped CSS custom properties.
- [x] 3.2 Define VS Code Light 2026 light token values and Gruvbox Material medium/material dark token values for backgrounds, surfaces, borders, text, muted text, control states, diagram canvas, relation lines, and selection highlights.
- [x] 3.3 Audit remaining editor UI color constants and keep any intentional semantic colors documented in code or colocated rendering constants.

## 4. Monaco Integration

- [x] 4.1 Extend `DbmlCodeEditor` to accept the resolved code editor theme.
- [x] 4.2 Define VS Code Light 2026 and Gruvbox Material dark medium Monaco themes and map resolved code editor theme to those theme ids.
- [x] 4.3 Verify changing the workspace theme does not force Monaco to change unless the code editor theme setting resolves differently.
- [x] 4.4 Verify workspace-following code editor mode updates Monaco when the resolved workspace theme changes.
- [x] 4.5 Verify changing the code editor theme does not recreate or lose the current DBML document state, diagnostics markers, or source reveal ref behavior.

## 5. Tests and Verification

- [x] 5.1 Add unit tests for workspace and code editor theme mode persistence, fallback behavior, and system media query updates.
- [x] 5.2 Add editor page tests for selecting Light, Dark, and System workspace modes and applying the resolved workspace theme to the workspace root.
- [x] 5.3 Add editor page tests verifying the workspace theme and code editor theme can be selected independently.
- [x] 5.4 Add editor page tests verifying the code editor theme can follow the resolved workspace theme.
- [x] 5.5 Add DBML code editor tests verifying Monaco receives VS Code Light 2026 and Gruvbox Material dark medium theme ids for resolved light and dark.
- [x] 5.6 Run `pnpm test`, `pnpm typecheck`, `pnpm format:check`, and `pnpm lint` from `frontend/`.
