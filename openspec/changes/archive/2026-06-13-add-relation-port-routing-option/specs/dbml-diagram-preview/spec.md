## ADDED Requirements

### Requirement: Selectable relation port routing
The diagram preview SHALL support selectable relation endpoint port routing while preserving relation source and target semantics.

#### Scenario: Fixed routing preserves existing endpoints
- **WHEN** relation port routing mode is fixed and a parsed DBML ref connects two table columns
- **THEN** the diagram relation MUST attach its source endpoint to the source column's right port
- **AND** it MUST attach its target endpoint to the target column's left port

#### Scenario: Nearest routing chooses ports facing related tables
- **WHEN** relation port routing mode is nearest and a layouted DBML relation connects columns on different tables
- **THEN** the diagram relation MUST attach each endpoint to the column port side facing the related table in the current layout

#### Scenario: Nearest routing is deterministic for horizontal alignment
- **WHEN** nearest relation port routing finds the source and target table centers horizontally aligned
- **THEN** the diagram relation MUST choose a deterministic port pair for the same diagram layout
- **AND** it MUST prefer the fixed source-right to target-left pair

#### Scenario: Same-table self-reference uses right-side loop
- **WHEN** relation port routing mode is nearest and a relation connects columns within the same table
- **THEN** the diagram relation MUST attach both source and target endpoints to the right ports for their respective columns
- **AND** the rendered relation path MUST curve outside the table instead of hugging the table edge

#### Scenario: Different-table relations use nearest routing
- **WHEN** relation port routing mode is nearest and a relation connects columns in different tables
- **THEN** the diagram relation MUST use nearest side-port selection rather than the same-table right-to-right special case

#### Scenario: Relation direction semantics are preserved
- **WHEN** relation port routing mode changes a relation's physical source or target port side
- **THEN** source and target column ids, relation cardinality, endpoint role highlighting, gradient direction, and dynamic marker direction MUST continue to follow the original DBML relation endpoints

#### Scenario: Routed edge uses selected ports
- **WHEN** layout computation produces a route for a relation after applying the selected relation port routing mode
- **THEN** the rendered relation edge MUST start and end at the selected source and target column ports

#### Scenario: Export uses selected relation ports
- **WHEN** a diagram is exported after nearest relation port routing has been applied
- **THEN** the exported relation path MUST use the same routed start and end points as the current rendered diagram
