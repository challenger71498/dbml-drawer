## Purpose

Define the frontend DBML diagram preview capability for visualizing valid DBML documents.

## Requirements

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

#### Scenario: Unchanged documents, layout algorithms, and layout options do not relayout

- **WHEN** the debounced valid DBML document, selected diagram layout algorithm, and selected layout option values have not changed
- **THEN** the frontend MUST NOT recompute the diagram layout for that same document and layout settings state

#### Scenario: Layout settings change relayout same document

- **WHEN** the selected diagram layout algorithm or selected layout option values change and the current debounced DBML document remains valid
- **THEN** the frontend MUST recompute the diagram layout for the current document with the newly selected layout settings

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

### Requirement: Offscreen relation proxies

The diagram preview SHALL optionally render compact proxies for directly connected tables that are outside the current viewport when a diagram target is focused.

#### Scenario: Disabled setting hides proxies

- **WHEN** offscreen relation proxies are disabled
- **THEN** the diagram preview MUST NOT render offscreen relation proxies for focused diagram targets

#### Scenario: Focused table shows offscreen connected table proxy

- **WHEN** offscreen relation proxies are enabled and a rendered table is focused
- **THEN** the diagram preview MUST render a proxy for each directly connected table whose original rendered node is outside the current viewport

#### Scenario: Focused column shows offscreen connected table proxy

- **WHEN** offscreen relation proxies are enabled and a rendered relation column is focused
- **THEN** the diagram preview MUST render a proxy for each directly connected opposite endpoint table whose original rendered node is outside the current viewport

#### Scenario: Visible connected table does not get proxy

- **WHEN** offscreen relation proxies are enabled and a directly connected table's original rendered node intersects the current viewport
- **THEN** the diagram preview MUST NOT render a proxy for that table

#### Scenario: Proxy preserves original diagram layout

- **WHEN** an offscreen relation proxy is rendered
- **THEN** the diagram preview MUST NOT move, resize, relayout, or replace the original rendered table node

#### Scenario: Proxy summarizes connected columns

- **WHEN** an offscreen relation proxy is rendered for a connected table
- **THEN** the proxy MUST show the connected table name and only the columns from that table that participate in the focused direct relation context

#### Scenario: Proxy uses table node visual structure

- **WHEN** an offscreen relation proxy is rendered
- **THEN** the proxy MUST use the same table card, column row, and typography structure as normal rendered table nodes while visually muting the header to distinguish it from the original node

#### Scenario: Proxy omits unrelated columns

- **WHEN** an offscreen relation proxy omits one or more columns from the original table
- **THEN** the proxy MUST NOT show an ellipsis row or unrelated column count

#### Scenario: Proxy cards avoid each other

- **WHEN** multiple offscreen relation proxies are rendered near the same viewport area
- **THEN** the proxies MUST be spaced so their cards do not overlap each other

#### Scenario: Proxy card scales with diagram zoom

- **WHEN** an offscreen relation proxy is rendered while the diagram viewport is zoomed
- **THEN** the proxy card MUST visually scale with the current diagram viewport zoom level

#### Scenario: Proxy is placed on focused-to-original direction

- **WHEN** an offscreen relation proxy is rendered
- **THEN** the proxy MUST be positioned on the viewport-side intersection of the line from the focused rendered table to the proxy's original rendered table

#### Scenario: Proxy supports parallel-translated placement

- **WHEN** offscreen relation proxies are enabled and proxy placement is set to parallel
- **THEN** the diagram preview MUST translate left/right offscreen originals horizontally into the viewport while preserving their vertical screen position
- **AND** the diagram preview MUST translate top/bottom offscreen originals vertically into the viewport while preserving their horizontal center position

#### Scenario: Parallel placement resolves overlap vertically

- **WHEN** multiple parallel-placed proxy cards would overlap
- **THEN** the diagram preview MUST separate them vertically

#### Scenario: Proxy click navigates to original table

- **WHEN** a user activates an offscreen relation proxy
- **THEN** the diagram preview MUST pan or center the viewport on the proxy's original rendered table

#### Scenario: Proxy hover highlights represented relations

- **WHEN** a user hovers an offscreen relation proxy
- **THEN** the diagram preview MUST highlight the direct relations represented by that proxy without replacing the current focused diagram target

#### Scenario: Proxy line connection option reroutes represented relations

- **WHEN** offscreen relation proxies are visible and proxy line connection is enabled
- **THEN** the diagram preview MUST render each represented relation line so the offscreen endpoint connects to the visible proxy card instead of the original offscreen table

#### Scenario: Proxy line connection uses column ports

- **WHEN** a represented relation line is connected to a visible proxy card
- **THEN** the line MUST connect to the row position for the represented column instead of the proxy card's top or bottom edge

#### Scenario: Proxy line connection preserves original layout

- **WHEN** proxy line connection reroutes a represented relation line
- **THEN** the diagram preview MUST NOT move, resize, relayout, or replace the original rendered table nodes

#### Scenario: Proxies update with viewport movement

- **WHEN** the user pans or zooms the diagram viewport
- **THEN** the diagram preview MUST update offscreen relation proxy visibility based on the new viewport bounds
