## 1. Setup And Boundaries

- [x] 1.1 Add `zustand` to the frontend dependencies.
- [x] 1.2 Document the editor state classification in the implementation through store module boundaries and focused tests.
- [x] 1.3 Confirm local-only state candidates before migration, including pointer refs, React Flow viewport mechanics, suspense fallback state, and rendering-local hover state.

## 2. Phase 1: Editor Preferences Store

- [x] 2.1 Create an editor-scoped preferences store under `frontend/src/pages/editor/model/`.
- [x] 2.2 Migrate workspace theme mode, code editor theme mode, code editor override behavior, and resolved theme derivation to the preferences store or store selectors.
- [x] 2.3 Migrate offscreen relation proxy preferences to the preferences store.
- [x] 2.4 Migrate sidebar width/expanded preferences and relation rendering preferences when they satisfy the shared or persisted state criteria.
- [x] 2.5 Use a single Zustand persist key with stable defaults and invalid value normalization rather than legacy localStorage adapters.
- [x] 2.6 Update settings, sidebar, code editor, and diagram preview wiring to read preference state through Zustand selectors.
- [x] 2.7 Add or update tests for preference defaults, persistence, invalid persisted values, and preference update actions.

## 3. Phase 2: Diagram Interaction Store

- [x] 3.1 Create an editor-scoped diagram interaction store under `frontend/src/pages/editor/model/`.
- [x] 3.2 Migrate focused diagram target state to the diagram interaction store.
- [x] 3.3 Decide whether hovered diagram target remains local or moves to the store with narrow subscriptions, then implement the chosen boundary.
- [x] 3.4 Keep active relation ids, focused table ids, and endpoint column ids as derived selectors or pure helper outputs rather than duplicated store state.
- [x] 3.5 Update diagram preview, selection view, and source reveal wiring to use the interaction store without changing behavior.
- [x] 3.6 Add or update tests for focus, hover if stored, focus clearing, derived selection inputs, and source reveal behavior.

## 4. Phase 3: DBML Document Store

- [x] 4.1 Create an editor-scoped DBML document store under `frontend/src/pages/editor/model/`.
- [x] 4.2 Migrate DBML document text, selected layout algorithm, and selected layout option values to the document store.
- [x] 4.3 Migrate validation and diagnostics while preserving debounce behavior.
- [x] 4.4 Migrate async parse/layout lifecycle while preserving stale-result protection.
- [x] 4.5 Keep parser, diagram creation, layout, and validation helpers as pure library functions outside the store.
- [x] 4.6 Update editor, diagnostics, presets, layout settings, and diagram preview wiring to consume document state through Zustand selectors.
- [x] 4.7 Add or update tests for document updates, layout algorithm/option updates, diagnostics, layout refresh, and stale async layout protection.

## 5. Verification

- [x] 5.1 Run targeted editor store and UI tests after each phase.
- [x] 5.2 Run `pnpm --dir frontend typecheck`.
- [x] 5.3 Run `pnpm --dir frontend lint`.
- [x] 5.4 Run relevant frontend tests for editor page, editor theme/preferences, DBML document, and diagram preview behavior.
- [x] 5.5 Run OpenSpec validation for the completed change.
