## 1. Layout Algorithm Model

- [x] 1.1 Define editor-local layout algorithm setting types, metadata shape, and default layered algorithm id
- [x] 1.2 Add a helper for loading bundled ELK layout algorithm metadata for the development settings UI
- [x] 1.3 Keep layout setting code inside `frontend/src/pages/editor/` without introducing new FSD layers

## 2. Layout Computation

- [x] 2.1 Update `layoutDbmlDiagram` to accept a selected ELK layout algorithm id
- [x] 2.2 Build ELK layout options from the selected algorithm while preserving the current layered default behavior
- [x] 2.3 Update diagram layout cache keys so changing the algorithm recomputes layout even when DBML text is unchanged
- [x] 2.4 Preserve existing fallback behavior for algorithms that omit edge sections or routed bend points

## 3. Editor State Integration

- [x] 3.1 Add selected layout algorithm state to `useDbmlDocument`
- [x] 3.2 Return selected layout algorithm and setter from `useDbmlDocument`
- [x] 3.3 Pass selected layout algorithm into diagram layout computation
- [x] 3.4 Keep selected layout algorithm state local to the current editor page session

## 4. Development Inspector UI

- [x] 4.1 Add a development-only layout settings inspector activity id and icon
- [x] 4.2 Add a layout settings activity panel with an accessible algorithm selector
- [x] 4.3 Populate the selector with every algorithm exposed by bundled `elkjs` metadata, with a default layered fallback
- [x] 4.4 Wire algorithm selection changes to the editor layout algorithm state
- [x] 4.5 Ensure the layout settings activity and panel are hidden when editor dev mode is disabled
- [x] 4.6 Preserve existing diagnostics, presets, diagram preview, and relation line style behavior

## 5. Tests And Verification

- [x] 5.1 Add layout tests proving the selected algorithm id is passed to ELK layout options
- [x] 5.2 Add model tests or hook-level coverage proving algorithm changes trigger relayout for the same valid DBML document
- [x] 5.3 Add editor page tests for development-only layout settings activity visibility
- [x] 5.4 Add editor page tests for selecting a layout algorithm through the inspector panel
- [x] 5.5 Add editor page tests proving layout settings controls are hidden outside editor dev mode
- [x] 5.6 Run frontend format, typecheck, and relevant test suites

## 6. Curated Layout Options

- [x] 6.1 Define curated layout option controls and default values for selected ELK algorithms
- [x] 6.2 Add selected layout option values to editor document state and layout cache keys
- [x] 6.3 Pass selected layout option values into ELK layout options
- [x] 6.4 Render curated layout option controls in the development diagram settings panel
- [x] 6.5 Add tests for changing curated layout options and passing option overrides into layout computation
- [x] 6.6 Run frontend format, typecheck, lint, and test suites
