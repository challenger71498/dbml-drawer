## Purpose

Define how the frontend DBML editor workspace owns shared, persisted, and cross-panel state with Zustand while keeping local-only UI state inside React components.

## Requirements

### Requirement: Editor-scoped Zustand state ownership
The frontend SHALL use Zustand stores for DBML editor workspace state that is shared across editor components, persisted as an editor preference, or needed by multiple editor panels.

#### Scenario: Shared editor settings use Zustand
- **WHEN** editor settings such as workspace theme mode, code editor theme mode, sidebar preferences, relation rendering preferences, layout options, or offscreen relation proxy options are read or changed
- **THEN** the editor workspace MUST read and update those settings through editor-scoped Zustand state

#### Scenario: Store modules remain editor-scoped
- **WHEN** a developer inspects the Zustand store modules introduced by this change
- **THEN** those stores MUST live under the editor page model boundary unless a non-editor consumer exists

### Requirement: Local state boundary
The frontend SHALL keep component-only, high-frequency transient, third-party integration, ref-based, and purely derived state out of Zustand unless a concrete cross-component ownership need exists.

#### Scenario: Component-only state remains local
- **WHEN** a state value is only used by one component and does not need persistence or cross-component coordination
- **THEN** that state MUST remain local to that component rather than being moved into a Zustand store

#### Scenario: Derived state is not duplicated
- **WHEN** active relation ids, focused table ids, endpoint column ids, resolved theme values, or similar values can be computed from source state
- **THEN** the frontend MUST derive those values with selectors or pure helpers rather than storing duplicated source-of-truth copies

#### Scenario: High-frequency transient state is isolated
- **WHEN** a state value changes frequently due to hover, pointer movement, React Flow viewport updates, or DOM interaction mechanics
- **THEN** the frontend MUST keep it local or subscribe to it narrowly enough that unrelated editor panels do not rerender from those updates

### Requirement: Settings persistence through Zustand
The frontend SHALL persist editor settings through the editor-scoped Zustand store using a store-owned persistence shape.

#### Scenario: Settings store initializes from defaults
- **WHEN** the editor workspace loads and no Zustand editor settings state has been persisted
- **THEN** the settings store MUST initialize from the documented editor defaults

#### Scenario: Persisted Zustand settings are respected
- **WHEN** the editor workspace loads and valid Zustand editor settings state has been persisted
- **THEN** the settings store MUST initialize from that persisted Zustand state

#### Scenario: Invalid persisted settings normalize to defaults
- **WHEN** persisted Zustand editor settings state contains invalid values
- **THEN** the settings store MUST normalize those values to documented defaults

#### Scenario: Setting changes persist
- **WHEN** a user changes a persisted editor setting
- **THEN** the updated setting MUST be written through the Zustand persistence mechanism under the settings store key so it applies on a later editor load

### Requirement: Phased migration behavior preservation
The frontend SHALL migrate editor state to Zustand in phases without changing the observable editor workflow.

#### Scenario: Phase 1 preserves settings behavior
- **WHEN** editor settings are migrated to Zustand
- **THEN** theme selection, code editor theme override, sidebar behavior, relation rendering options, and offscreen relation proxy options MUST continue to behave as before

#### Scenario: Phase 2 preserves diagram interaction behavior
- **WHEN** diagram interaction state is migrated to Zustand
- **THEN** focusing tables or columns, hovering diagram elements, clearing focus, highlighting relations, and revealing source positions MUST continue to behave as before

#### Scenario: Phase 3 preserves DBML document behavior
- **WHEN** DBML document state is migrated to Zustand
- **THEN** editing DBML text, debounced validation, diagnostics, selected layout algorithm/options, stale layout protection, and diagram refresh behavior MUST continue to behave as before

#### Scenario: Phase 4 refines source-state boundaries
- **WHEN** Phase 3 store boundaries are refined
- **THEN** DBML code text MUST be owned by a DBML editor/code store, user-controlled layout settings MUST be owned by editor settings state, and DBML validation/layout orchestration MUST remain available through the `useDbmlDocument` composition hook

### Requirement: Store boundary cohesion
The frontend SHALL keep independent source-state domains in separate editor-scoped stores and compose them through hooks when a UI workflow needs a combined view.

#### Scenario: DBML code state is separate from settings
- **WHEN** a developer inspects DBML source editing state
- **THEN** DBML code text MUST be managed separately from layout algorithm and layout option settings

#### Scenario: Layout options are editor settings
- **WHEN** a user changes layout algorithm or layout option values
- **THEN** those values MUST be treated as user-controlled editor settings rather than DBML source content

#### Scenario: Diagram result state remains distinct
- **WHEN** layouted diagram results, node positions, or future manual node position overrides need store ownership
- **THEN** that state MUST belong to a diagram-focused store rather than the DBML editor/code store or editor settings store

### Requirement: Store test coverage
The frontend SHALL cover Zustand store behavior with focused tests before relying on the stores from editor UI components.

#### Scenario: Settings store behavior is tested
- **WHEN** editor settings are migrated to Zustand
- **THEN** tests MUST verify default values, persisted values, invalid persisted value normalization, layout setting updates, and settings update actions

#### Scenario: Diagram interaction store behavior is tested
- **WHEN** diagram interaction state is migrated to Zustand
- **THEN** tests MUST verify focus, hover handling if stored, focus clearing, and derived selection inputs used by the editor workspace

#### Scenario: DBML editor and document composition behavior is tested
- **WHEN** DBML document workflow state is refined into source stores and a composition hook
- **THEN** tests MUST verify DBML editor text updates, layout setting updates, validation/layout cache behavior, and unchanged editor workflow behavior
