## ADDED Requirements

### Requirement: Directional relation line highlighting

The diagram preview SHALL render active relation lines with directional color so users can distinguish source endpoints from reference endpoints.

#### Scenario: User selects solid active relation highlight mode

- **WHEN** a user selects the solid relation highlight mode
- **THEN** active relation lines MUST use the existing orange active color as a solid stroke

#### Scenario: Active relation line uses endpoint gradient

- **WHEN** a relation line is active because a connected table or column is hovered or focused and the gradient relation highlight mode is selected
- **THEN** the visible relation line MUST use a soft gradient that keeps the table-title color through 33% of the source endpoint and transitions to the existing orange active color across the remaining reference endpoint 67%

#### Scenario: Active relation line uses dynamic flow

- **WHEN** a relation line is active because a connected table or column is hovered or focused and the dynamic relation highlight mode is selected
- **THEN** the visible relation line MUST render small circular markers that move along the relation path from source to reference at a consistent interval

#### Scenario: Dynamic flow marker follows relation color

- **WHEN** a dynamic flow marker moves along an active gradient relation line
- **THEN** the marker fill MUST animate through the same endpoint colors and timing as the active relation gradient so the marker color visually matches its position on the relation

#### Scenario: Dynamic flow speed is path-length independent

- **WHEN** active relation lines have different rendered path lengths and the dynamic relation highlight mode is selected
- **THEN** dynamic flow markers MUST move at the same visual speed, with longer relation lines showing more markers than shorter relation lines

#### Scenario: Direction follows relation endpoints

- **WHEN** a relation line is rendered with any supported relation line style
- **THEN** the gradient direction MUST follow the relation source endpoint to the relation target endpoint rather than the current screen direction or table position

#### Scenario: Inactive relation line styling is preserved

- **WHEN** a relation line is not active
- **THEN** the preview MUST keep the existing inactive and dimmed relation line styling

### Requirement: Complementary table and column selection highlights

The diagram preview SHALL use endpoint role colors to highlight selected tables and relation columns.

#### Scenario: Focused table border uses active highlight

- **WHEN** a user focuses a rendered table in the diagram preview
- **THEN** the focused table border MUST use the existing orange active color

#### Scenario: Hovered table border does not become focused

- **WHEN** a user hovers a rendered table header without focusing it
- **THEN** the preview MUST keep the existing hover-only behavior and MUST NOT apply focused table border styling

#### Scenario: Focused source column uses table-title highlight

- **WHEN** a user focuses a rendered column that is the source endpoint of one or more relation lines
- **THEN** that rendered column row MUST use the table-title color and every rendered reference endpoint column row for those active relation lines MUST use the existing orange active color

#### Scenario: Focused reference column uses orange highlight

- **WHEN** a user focuses a rendered column that references the source endpoint of one or more relation lines
- **THEN** that rendered column row MUST use the existing orange active color and every rendered source endpoint column row for those active relation lines MUST use the table-title color

#### Scenario: Hovered column previews endpoint role colors

- **WHEN** a user hovers a rendered column that participates in one or more relation lines
- **THEN** the preview MUST highlight source endpoint column rows with the table-title color and reference endpoint column rows with the existing orange active color without changing the focused column target

#### Scenario: Focused column role highlight persists while hovering another column

- **WHEN** a user has focused a rendered source or reference column and then hovers another rendered column
- **THEN** the focused column MUST keep its endpoint role highlight while the hover preview is shown

#### Scenario: Column highlight is removed when selection context changes

- **WHEN** the active hovered or focused diagram target changes away from a column relation context
- **THEN** any endpoint role column highlight from the previous column context MUST be removed
