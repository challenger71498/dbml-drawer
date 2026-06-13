## ADDED Requirements

### Requirement: Relation port routing setting
The DBML editor workspace SHALL provide a persisted setting for choosing how relation endpoints attach to column side ports.

#### Scenario: Fixed routing is default
- **WHEN** a user has no stored relation port routing preference
- **THEN** the editor MUST use fixed relation port routing

#### Scenario: Relation port routing options are available
- **WHEN** the editor settings controls are shown
- **THEN** the workspace MUST provide relation port routing choices for fixed routing and nearest-port routing

#### Scenario: User selects nearest routing
- **WHEN** a user selects nearest-port relation routing
- **THEN** the editor MUST apply nearest relation port routing to the current valid diagram preview

#### Scenario: User selects fixed routing
- **WHEN** a user selects fixed relation port routing after using nearest-port routing
- **THEN** the editor MUST restore fixed source-right to target-left relation endpoint routing for the current valid diagram preview

#### Scenario: Relation port routing persists locally
- **WHEN** a user selects a relation port routing mode and later reloads the editor workspace
- **THEN** the workspace MUST restore the selected relation port routing mode from local browser storage

#### Scenario: Invalid stored relation port routing falls back
- **WHEN** local browser storage contains an unknown relation port routing mode
- **THEN** the editor MUST fall back to fixed relation port routing

#### Scenario: Relation port routing changes relayout
- **WHEN** the current DBML document is valid and the user changes relation port routing mode
- **THEN** the editor MUST recompute the current diagram layout using the selected relation port routing mode without requiring a DBML text edit

#### Scenario: Relation port routing is independent from line style
- **WHEN** a user changes relation port routing mode
- **THEN** the workspace MUST NOT change the selected relation line style or relation highlight mode
