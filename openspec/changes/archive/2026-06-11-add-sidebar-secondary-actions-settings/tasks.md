## 1. Sidebar Activity Grouping

- [x] 1.1 Extend `EditorSidebarShell` to accept optional top and bottom activity groups while preserving existing activity button styling and accessibility attributes.
- [x] 1.2 Update left sidebar usage so DBML editor remains in the top group using its existing expanded/collapsed state.
- [x] 1.3 Ensure switching between top and bottom right activities displays only one right sidebar panel at a time and preserves existing resize behavior.
- [x] 1.4 Reintroduce maximum width clamping for left and right resizable sidebar panels while preserving existing minimum width behavior.
- [x] 1.5 Keep right inspector behavior unchanged while adapting it to the new grouped sidebar shell API.

## 2. Settings Panel

- [x] 2.1 Add a right-bottom Settings sidebar activity with an accessible icon-only button and shared sidebar panel chrome.
- [x] 2.2 Create an editor-local Settings panel component for workspace and code editor theme preferences.
- [x] 2.3 Move workspace and code editor theme controls out of the editor toolbar into the Settings panel.
- [x] 2.4 Keep editor toolbar document state behavior intact after removing theme controls.

## 3. Theme Preference UI

- [x] 3.1 Render workspace theme choices as Light, Solarized, Dark, and System in the Settings panel.
- [x] 3.2 Replace the code editor theme "Workspace" button UI with an override toggle where disabled maps to workspace-following mode.
- [x] 3.3 Render Light, Solarized, Dark, and System code editor override choices only when override is enabled or disabled-but-visible according to the final UI treatment.
- [x] 3.4 Preserve existing theme persistence and resolution behavior, including system resolution and Monaco theme updates.
- [x] 3.5 Preserve the last explicit code editor override selection when the override toggle is disabled and later re-enabled.

## 4. Tests and Validation

- [x] 4.1 Add or update sidebar shell tests for top and bottom activity group rendering and one-active-panel behavior.
- [x] 4.2 Add or update resize tests for left and right sidebar maximum width clamping.
- [x] 4.3 Update editor page tests to open Settings before changing workspace and code editor theme preferences.
- [x] 4.4 Add tests for code editor override toggle behavior, including disabled follow-workspace mode and preserved explicit override selection.
- [x] 4.5 Run focused editor tests, typecheck, lint, format check, and OpenSpec validation.
