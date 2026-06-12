## ADDED Requirements

### Requirement: Editor-scoped Zustand state ownership
The frontend SHALL use Zustand stores for DBML editor workspace state that is shared across editor components, persisted as an editor preference, or needed by multiple editor panels.

#### Scenario: Shared editor preferences use Zustand
- **WHEN** editor preferences such as workspace theme mode, code editor theme mode, sidebar preferences, relation rendering preferences, or offscreen relation proxy options are read or changed
- **THEN** the editor workspace MUST read and update those preferences through editor-scoped Zustand state

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

### Requirement: Preference persistence through Zustand
The frontend SHALL persist editor preferences through the editor-scoped Zustand store using a store-owned persistence shape.

#### Scenario: Preference store initializes from defaults
- **WHEN** the editor workspace loads and no Zustand editor preference state has been persisted
- **THEN** the preference store MUST initialize from the documented editor defaults

#### Scenario: Persisted Zustand preferences are respected
- **WHEN** the editor workspace loads and valid Zustand editor preference state has been persisted
- **THEN** the preference store MUST initialize from that persisted Zustand state

#### Scenario: Invalid persisted preferences normalize to defaults
- **WHEN** persisted Zustand editor preference state contains invalid values
- **THEN** the preference store MUST normalize those values to documented defaults

#### Scenario: Preference changes persist
- **WHEN** a user changes a persisted editor preference
- **THEN** the updated preference MUST be written through the Zustand persistence mechanism under the preference store key so it applies on a later editor load

### Requirement: Phased migration behavior preservation
The frontend SHALL migrate editor state to Zustand in phases without changing the observable editor workflow.

#### Scenario: Phase 1 preserves preference behavior
- **WHEN** editor preferences are migrated to Zustand
- **THEN** theme selection, code editor theme override, sidebar behavior, relation rendering options, and offscreen relation proxy options MUST continue to behave as before

#### Scenario: Phase 2 preserves diagram interaction behavior
- **WHEN** diagram interaction state is migrated to Zustand
- **THEN** focusing tables or columns, hovering diagram elements, clearing focus, highlighting relations, and revealing source positions MUST continue to behave as before

#### Scenario: Phase 3 preserves DBML document behavior
- **WHEN** DBML document state is migrated to Zustand
- **THEN** editing DBML text, debounced validation, diagnostics, selected layout algorithm/options, stale layout protection, and diagram refresh behavior MUST continue to behave as before

### Requirement: Store test coverage
The frontend SHALL cover Zustand store behavior with focused tests before relying on the stores from editor UI components.

#### Scenario: Preference store behavior is tested
- **WHEN** editor preferences are migrated to Zustand
- **THEN** tests MUST verify default values, persisted values, invalid persisted value normalization, and preference update actions

#### Scenario: Diagram interaction store behavior is tested
- **WHEN** diagram interaction state is migrated to Zustand
- **THEN** tests MUST verify focus, hover handling if stored, focus clearing, and derived selection inputs used by the editor workspace

#### Scenario: DBML document store behavior is tested
- **WHEN** DBML document state is migrated to Zustand
- **THEN** tests MUST verify document updates, layout algorithm/option updates, validation result handling, and stale async layout protection
