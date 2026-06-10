## ADDED Requirements

### Requirement: Diagram table interaction

The diagram preview SHALL allow users to hover and focus rendered DBML tables.

#### Scenario: Hovering table highlights connected relations

- **WHEN** a user hovers a rendered table header in the diagram preview
- **THEN** the preview MUST visually highlight every relation line connected to that table without changing table focus styling

#### Scenario: Leaving hovered table restores previous focus state

- **WHEN** a user stops hovering a rendered table header
- **THEN** the preview MUST remove the transient table hover highlight and MUST restore any existing focused table or column highlight

#### Scenario: Clicking table focuses table

- **WHEN** a user clicks a rendered table header in the diagram preview
- **THEN** the preview MUST set that table as the focused diagram target, MUST visually distinguish the focused table, and MUST keep its connected relation lines highlighted

#### Scenario: Focused table is replaced by another target

- **WHEN** a table is focused and a user clicks another rendered table header or column row
- **THEN** the preview MUST replace the previous focused target with the newly clicked diagram target

### Requirement: Diagram column interaction

The diagram preview SHALL allow users to hover and focus rendered DBML columns.

#### Scenario: Hovering column highlights connected relations

- **WHEN** a user hovers a rendered column row in the diagram preview
- **THEN** the preview MUST visually highlight every relation line connected to that column without changing column focus styling

#### Scenario: Leaving hovered column restores previous focus state

- **WHEN** a user stops hovering a rendered column row
- **THEN** the preview MUST remove the transient column hover highlight and MUST restore any existing focused table or column highlight

#### Scenario: Clicking column focuses column

- **WHEN** a user clicks a rendered column row in the diagram preview
- **THEN** the preview MUST set that column as the focused diagram target, MUST visually distinguish the focused column, and MUST keep its connected relation lines highlighted

#### Scenario: Focused column is replaced by another target

- **WHEN** a column is focused and a user clicks another rendered table header or column row
- **THEN** the preview MUST replace the previous focused target with the newly clicked diagram target

### Requirement: Focused diagram layering

The diagram preview SHALL layer focused and dimmed diagram elements so focused context remains readable in dense diagrams.

#### Scenario: Focused table appears above dimmed tables

- **WHEN** a table is focused
- **THEN** that rendered table MUST appear above dimmed rendered tables

#### Scenario: Focused column appears above inactive content within table

- **WHEN** a column is focused
- **THEN** that rendered column row MUST be visually emphasized above inactive rows in the same table

#### Scenario: Active relation appears above dimmed tables

- **WHEN** a relation line is connected to the active table or column target
- **THEN** that relation line MUST appear above dimmed rendered tables and below non-dimmed rendered tables

#### Scenario: Dimmed relation appears behind dimmed tables

- **WHEN** a relation line is unrelated to the active table or column target
- **THEN** that relation line MUST appear behind dimmed rendered tables

### Requirement: Diagram interaction preserves rendering settings

The diagram preview SHALL preserve existing diagram rendering settings while users hover or focus tables and columns.

#### Scenario: Relation line style is preserved while focusing target

- **WHEN** a user has selected a relation line style and clicks a table header or column row
- **THEN** the preview MUST keep using the selected relation line style while applying focus highlights

#### Scenario: Relation line style is preserved while hovering target

- **WHEN** a user has selected a relation line style and hovers a table header or column row
- **THEN** the preview MUST keep using the selected relation line style while applying hover highlights
