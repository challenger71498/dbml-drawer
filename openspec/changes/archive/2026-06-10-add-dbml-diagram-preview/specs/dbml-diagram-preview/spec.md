## ADDED Requirements

### Requirement: DBML diagram preview

The frontend SHALL render a diagram preview for the current valid DBML document in the editor workspace.

#### Scenario: Valid DBML renders a diagram

- **WHEN** the current editor document contains valid DBML with tables
- **THEN** the diagram preview MUST render those tables as diagram nodes

#### Scenario: Editor changes refresh the diagram

- **WHEN** a user changes the DBML document and the changed document validates successfully
- **THEN** the diagram preview MUST update to represent the changed document

#### Scenario: Empty diagram state

- **WHEN** the current valid DBML document contains no renderable tables
- **THEN** the diagram preview MUST show an empty diagram state

### Requirement: Parsed DBML entity boundary

The frontend SHALL distinguish parsed DBML entities from diagram rendering entities.

#### Scenario: Parser model types are reused

- **WHEN** DBML is parsed successfully
- **THEN** parsed DBML entities such as tables, columns, refs, and endpoints MUST reuse `@dbml/core` model types where those types are available

#### Scenario: Parsed entities remain renderer-independent

- **WHEN** parsed DBML entities are used to build a diagram
- **THEN** the frontend MUST NOT mutate parsed entities with diagram ids, layout coordinates, React Flow fields, or ELK fields

### Requirement: DBML diagram entities

The frontend SHALL build renderer-independent DBML diagram entities from parsed DBML entities.

#### Scenario: Diagram wraps parsed tables

- **WHEN** a parsed DBML table is included in the preview
- **THEN** the corresponding diagram table MUST reference the parsed table and include diagram metadata needed for rendering

#### Scenario: Diagram wraps parsed columns

- **WHEN** a parsed DBML column is included in a diagram table
- **THEN** the corresponding diagram column MUST reference the parsed column and include stable diagram column and port identifiers

#### Scenario: Diagram represents refs as column relations

- **WHEN** a parsed DBML ref connects table columns
- **THEN** the corresponding diagram relation MUST identify source and target tables, columns, and ports

### Requirement: Column-level diagram ports

The diagram preview SHALL connect relation edges to column-level ports.

#### Scenario: Column ports are stable

- **WHEN** the same DBML document is converted to a diagram more than once
- **THEN** each table column MUST receive stable port identifiers for relation attachment

#### Scenario: Relation edge attaches to columns

- **WHEN** a DBML ref connects `posts.user_id` to `users.id`
- **THEN** the relation edge MUST attach to the diagram ports for `posts.user_id` and `users.id`

#### Scenario: Multiple refs on one table are supported

- **WHEN** a table has multiple columns that participate in refs
- **THEN** each relation edge MUST attach to the correct column-level port instead of a single shared table-level point

### Requirement: Automatic diagram layout

The frontend SHALL use ELK to compute automatic layout for DBML diagrams.

#### Scenario: Table positions are computed

- **WHEN** a valid DBML diagram is generated
- **THEN** each rendered table node MUST receive a layout position computed from the diagram graph

#### Scenario: Column port order is preserved

- **WHEN** a table has multiple columns
- **THEN** layout computation MUST preserve the diagram column order when assigning layout ports

#### Scenario: Relation routes are computed

- **WHEN** a diagram relation connects two column ports
- **THEN** layout computation MUST produce a route for that relation using the source and target ports

### Requirement: Routed relation rendering

The diagram preview SHALL render relation edges using routed layout data.

#### Scenario: Routed edge path is rendered

- **WHEN** layout computation returns a relation route with start point, bend points, and end point
- **THEN** the diagram preview MUST render the relation edge along that route

#### Scenario: Relation path remains column-aligned

- **WHEN** a relation is rendered between two columns
- **THEN** the visible edge MUST start and end at the corresponding column rows

### Requirement: Interactive diagram viewport

The diagram preview SHALL provide viewport interactions for navigating the rendered diagram.

#### Scenario: User can pan and zoom

- **WHEN** a diagram is rendered
- **THEN** the preview MUST allow the user to pan and zoom the diagram viewport

#### Scenario: Diagram fits the viewport

- **WHEN** a new valid diagram is rendered
- **THEN** the preview MUST provide a way to fit the rendered diagram into the viewport

### Requirement: Invalid DBML preview handling

The diagram preview SHALL avoid generating a new diagram from invalid DBML.

#### Scenario: Invalid DBML blocks preview refresh

- **WHEN** the current editor document contains validation diagnostics
- **THEN** the diagram preview MUST NOT generate a new diagram from that invalid document

#### Scenario: Last valid diagram remains visible

- **WHEN** a valid diagram has already been rendered and the current editor document becomes invalid
- **THEN** the preview MUST keep the last valid diagram visible

#### Scenario: Preview paused state is shown

- **WHEN** the current editor document is invalid and the last valid diagram remains visible
- **THEN** the preview MUST show that diagram updates are paused because the DBML is invalid

### Requirement: Responsive diagram updates

The diagram preview SHALL preserve editing responsiveness while diagram computation runs.

#### Scenario: Diagram updates follow debounced valid DBML

- **WHEN** a user types continuously in the editor
- **THEN** diagram parsing and layout MUST be delayed or coalesced instead of running for every raw keystroke

#### Scenario: Unchanged documents do not relayout

- **WHEN** the debounced valid DBML document has not changed
- **THEN** the frontend MUST NOT recompute the diagram layout for that same document state
