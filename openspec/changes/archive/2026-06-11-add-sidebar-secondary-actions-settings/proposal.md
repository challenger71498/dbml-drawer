## Why

The editor sidebar shell currently models one activity group per side, with all activity buttons placed in a single top-aligned bar. As the editor grows, settings should live in sidebar chrome rather than consuming the main editor header, and the shell needs a way to host secondary actions without duplicating sidebar behavior.

## What Changes

- Extend the editor sidebar shell so each sidebar can render optional top and bottom activity groups.
- Preserve a single active expanded panel per sidebar, regardless of whether the active activity lives in the top or bottom group.
- Add a Settings activity to the bottom of the right sidebar.
- Move workspace theme and code editor theme controls from the editor header into the new Settings panel.
- Change code editor theme settings so the editor can either follow the workspace theme or override it with light, solarized, dark, or system.
- Keep the workspace theme options as light, solarized, dark, and system, with system as the default.
- Reintroduce a maximum width constraint for resizable sidebar panels so the diagram workspace cannot be squeezed indefinitely.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-editor`: Sidebar shell activity placement and editor theme settings behavior change.

## Impact

- Affected frontend code:
  - `frontend/src/pages/editor/ui/EditorSidebarShell.tsx`
  - `frontend/src/pages/editor/ui/EditorPage.tsx`
  - related editor inspector/settings panel components and tests
  - editor theme model and persistence tests if the settings data shape changes
- No backend or API changes.
- No new runtime dependencies expected.
