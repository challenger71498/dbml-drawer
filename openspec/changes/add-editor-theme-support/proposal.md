## Why

The editor currently presents a fixed visual appearance, and the DBML Monaco editor is hard-coded to a dark theme. Users should be able to choose light, dark, or OS-matched system behavior for both the editor workspace and the code editor, including cases where those two preferences intentionally differ.

## What Changes

- Add editor workspace theme selection with three modes: light, dark, and system.
- Add DBML code editor theme selection with the same three modes, configured independently from the workspace theme.
- Resolve each system mode from the browser `prefers-color-scheme` media query.
- Apply the resolved theme to the editor page chrome, sidebars, diagram surface, panels, and controls using VS Code Light 2026 for light mode and Gruvbox Material medium/material for dark mode.
- Make `DbmlCodeEditor` follow the resolved code editor theme with matching Monaco themes instead of using a fixed Monaco theme.
- Persist the selected workspace theme mode and code editor theme mode locally so the editor restores both preferences on reload.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dbml-editor`: Add editor workspace theme selection and independently configurable DBML code editor theme requirements.

## Impact

- `frontend/src/pages/editor/ui/EditorPage.tsx` and related editor UI components.
- `frontend/src/pages/editor/ui/DbmlCodeEditor.tsx` Monaco theme configuration.
- Editor CSS modules and global CSS variables/tokens used by the editor workspace.
- React tests for independent theme mode selection, persistence, system resolution, and Monaco theme propagation.
