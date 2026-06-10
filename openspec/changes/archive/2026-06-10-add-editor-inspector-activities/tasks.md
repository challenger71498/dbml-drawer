## 1. Inspector Model

- [x] 1.1 Define editor inspector activity id/state/types in the editor page slice
- [x] 1.2 Define diagnostics and presets as dev-only inspector activity definitions
- [x] 1.3 Keep activity definitions local to `pages/editor` and avoid new FSD layers

## 2. Inspector UI

- [x] 2.1 Add an editor inspector shell with right-side activity bar and expandable sidebar
- [x] 2.2 Add icon-only activity controls with accessible labels, selected state, `aria-expanded`, and `aria-controls`
- [x] 2.3 Add sidebar panel rendering for the active activity with a close control
- [x] 2.4 Implement activity behavior for inactive selection, active toggle, panel switching, and cleared collapsed state
- [x] 2.5 Preserve the hidden state when no inspector activities are available

## 3. Dev Activities

- [x] 3.1 Move diagnostics panel access into the diagnostics inspector activity
- [x] 3.2 Move DBML preset selection into the presets inspector activity
- [x] 3.3 Keep diagnostics and presets hidden outside editor dev mode
- [x] 3.4 Preserve Monaco validation markers when the diagnostics activity is hidden or collapsed
- [x] 3.5 Preserve preset selection behavior so choosing a preset replaces the editor document

## 4. Layout And Styling

- [x] 4.1 Update editor page CSS module for no-inspector, rail-only, and expanded-sidebar layouts
- [x] 4.2 Ensure editor and diagram panels keep stable sizing across inspector states
- [x] 4.3 Ensure responsive layouts remain usable on narrow viewports
- [x] 4.4 Use an existing icon solution if available, otherwise keep any new icons scoped to the editor page

## 5. Tests And Verification

- [x] 5.1 Update editor page tests for dev-mode activity controls
- [x] 5.2 Add tests for expanding, collapsing, and switching inspector activities
- [x] 5.3 Add tests for production mode hiding dev-only activities
- [x] 5.4 Add tests that diagnostics and preset behavior still work through inspector panels
- [x] 5.5 Run frontend quality checks
- [x] 5.6 Run full repository quality checks if frontend changes pass
