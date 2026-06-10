## MODIFIED Requirements

### Requirement: Automatic diagram layout

The frontend SHALL use ELK to compute automatic layout for DBML diagrams with the selected diagram layout algorithm.

#### Scenario: Table positions are computed

- **WHEN** a valid DBML diagram is generated
- **THEN** each rendered table node MUST receive a layout position computed from the diagram graph

#### Scenario: Column port order is preserved

- **WHEN** a table has multiple columns
- **THEN** layout computation MUST preserve the diagram column order when assigning layout ports

#### Scenario: Relation routes are computed

- **WHEN** a diagram relation connects two column ports
- **THEN** layout computation MUST produce a route for that relation using the source and target ports

#### Scenario: Default layout uses layered algorithm

- **WHEN** no alternate diagram layout algorithm has been selected
- **THEN** layout computation MUST use the current layered ELK layout algorithm

#### Scenario: Selected layout algorithm is used

- **WHEN** a diagram layout algorithm has been selected
- **THEN** layout computation MUST use that selected ELK layout algorithm for the next valid diagram layout

#### Scenario: Selected layout options are used

- **WHEN** curated diagram layout option values have been selected
- **THEN** layout computation MUST include those option values in the next valid diagram layout

### Requirement: Responsive diagram updates

The diagram preview SHALL preserve editing responsiveness while diagram computation runs.

#### Scenario: Diagram updates follow debounced valid DBML

- **WHEN** a user types continuously in the editor
- **THEN** diagram parsing and layout MUST be delayed or coalesced instead of running for every raw keystroke

#### Scenario: Unchanged documents, layout algorithms, and layout options do not relayout

- **WHEN** the debounced valid DBML document, selected diagram layout algorithm, and selected layout option values have not changed
- **THEN** the frontend MUST NOT recompute the diagram layout for that same document and layout settings state

#### Scenario: Layout settings change relayout same document

- **WHEN** the selected diagram layout algorithm or selected layout option values change and the current debounced DBML document remains valid
- **THEN** the frontend MUST recompute the diagram layout for the current document with the newly selected layout settings
