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

### Requirement: Offscreen relation proxy self-collision handling

The diagram preview SHALL ignore a proxy's represented original table when applying active-node avoidance to that proxy.

#### Scenario: Proxy does not avoid its own original table

- **WHEN** offscreen relation proxies are enabled, active-node avoidance is enabled, and a proxy's represented original table is also in the active table set
- **THEN** the proxy layout MUST NOT treat that represented original table as an avoidance obstacle for that proxy

#### Scenario: Proxy still avoids other active tables

- **WHEN** offscreen relation proxies are enabled, active-node avoidance is enabled, and another active table overlaps a candidate proxy position
- **THEN** the proxy layout MUST continue to avoid that other active table according to the selected proxy layout strategy

### Requirement: Offscreen relation proxy transition strategies

The diagram preview SHALL apply offscreen relation proxy handoff behavior through a transition strategy that is independent from the proxy layout strategy.

#### Scenario: None transition preserves immediate visibility behavior

- **WHEN** the proxy transition mode is `none`
- **THEN** the diagram preview MUST render and remove offscreen relation proxies using the selected proxy visibility mode without applying additional opacity or morph presentation changes

#### Scenario: Opacity transition fades proxy during handoff

- **WHEN** the proxy transition mode is `opacity` and a proxy's represented original table approaches the selected visibility threshold
- **THEN** the diagram preview MUST reduce that proxy's opacity during the handoff range while preserving the proxy's computed layout position
- **AND** the diagram preview SHOULD increase the represented original table node's opacity during the same handoff range

#### Scenario: Opacity transition uses proxy transition completion visibility

- **WHEN** the proxy transition mode is `opacity`
- **THEN** the diagram preview SHOULD keep using transition handoff visibility until the represented original table is about 80% visible

#### Scenario: Proxy hides represented original table node

- **WHEN** an offscreen relation proxy is rendered for a represented original table and the proxy transition mode is not `opacity`
- **THEN** the represented original table node SHOULD remain hidden while that proxy is rendered

#### Scenario: Opacity transition preserves final visibility rule

- **WHEN** the proxy transition mode is `opacity` and the represented original table satisfies the selected proxy visibility mode
- **THEN** the diagram preview MUST stop rendering the proxy for that original table

#### Scenario: Morph transition moves proxy toward original during handoff

- **WHEN** the proxy transition mode is `morph` and a proxy's represented original table approaches the selected visibility threshold
- **THEN** the diagram preview MUST move and size that proxy toward the represented original table during the handoff range
- **AND** the morph handoff SHOULD complete when the represented original table is about 80% visible

#### Scenario: Morph transition overrides regular proxy visibility mode

- **WHEN** the proxy transition mode is `morph`
- **THEN** the diagram preview SHOULD keep using morph visibility handoff even if the regular proxy visibility setting is `center`

#### Scenario: Morph transition reveals original table content

- **WHEN** the proxy transition mode is `morph` and handoff progress is active
- **THEN** the diagram preview SHOULD fade compact proxy content out while fading represented original table content in
- **AND** the diagram preview SHOULD NOT fade the whole proxy card opacity

#### Scenario: Morph transition preserves relation handoff

- **WHEN** a morphing proxy is used as a relation line endpoint
- **THEN** the relation endpoint SHOULD transition from the compact proxy column port to the corresponding column port within the morphing proxy card during the initial morph handoff
- **AND** the transition endpoint MUST remain aligned to the represented column row instead of jumping to the proxy card's top or bottom edge

### Requirement: Preview overlay validation and render status

The diagram preview SHALL display validation and render status as lightweight preview overlays below the compact editor header.

#### Scenario: Valid DBML shows no validation overlay

- **WHEN** the current DBML document is valid
- **THEN** the diagram preview MUST NOT show a validation success pill, valid badge, or other positive validation overlay

#### Scenario: Invalid DBML shows warning overlay

- **WHEN** the current DBML document is invalid
- **THEN** the diagram preview MUST show a warning overlay near the preview upper-left area below the editor header
- **AND** the overlay MUST use a red warning treatment with an icon or equivalent visual warning indicator
- **AND** the overlay MUST include the validation diagnostic message shown by the editor diagnostics flow

#### Scenario: Ready pill is removed from top chrome

- **WHEN** the diagram preview is ready to render the current valid document
- **THEN** the preview MUST NOT show the previous `Ready` pill in the top toolbar area

#### Scenario: Paused render state remains discoverable

- **WHEN** the diagram preview is paused or unable to update because of the current DBML state
- **THEN** the preview MUST show the paused render state in the preview upper-left status area without restoring the removed preview header

### Requirement: Compact preview relation style control

The diagram preview SHALL provide a compact upper-right control for selecting relation line style modes.

#### Scenario: Compact relation style control renders in preview

- **WHEN** the diagram preview renders
- **THEN** it MUST show a compact relation style control near the preview upper-right area below the editor header

#### Scenario: Compact relation style control supports all modes

- **WHEN** the compact relation style control renders
- **THEN** it MUST provide Solid, Gradient, and Dynamic choices

#### Scenario: Compact relation style control is narrower than existing toolbar control

- **WHEN** the compact relation style control renders in the preview overlay
- **THEN** it MUST use a more horizontally compact presentation than the previous top toolbar segmented control while preserving readable labels

#### Scenario: Compact relation style control updates diagram

- **WHEN** a user changes relation line style mode from the compact preview control
- **THEN** active relation lines in the diagram preview MUST use the selected relation line style
- **AND** the Settings panel relation style control MUST reflect the same selected value

#### Scenario: Settings relation style control updates compact control

- **WHEN** a user changes relation line style mode from the Settings panel
- **THEN** the compact preview relation style control MUST reflect the same selected value
- **AND** active relation lines in the diagram preview MUST use the selected relation line style

### Requirement: Diagram flow proxy extension boundary

The diagram preview SHALL apply offscreen relation proxy behavior as a DBML diagram flow extension that composes with the base React Flow rendering model without making proxies normal React Flow table nodes.

#### Scenario: Base flow rendering remains independent from proxy extension

- **WHEN** offscreen relation proxies are disabled
- **THEN** the diagram preview MUST render the base DBML diagram flow without invoking proxy-specific flow element overrides or proxy overlay rendering

#### Scenario: Proxy extension adapts relation endpoints

- **WHEN** offscreen relation proxies are visible and proxy line connection is enabled
- **THEN** the proxy extension MUST adapt the affected relation edge endpoints to the proxy card positions while preserving the base React Flow table nodes

#### Scenario: Proxy overlay is rendered outside React Flow nodes

- **WHEN** offscreen relation proxies are visible
- **THEN** the diagram preview MUST render proxy cards as an overlay above the React Flow canvas instead of adding them to the React Flow node list

#### Scenario: Preview composes proxy extension output

- **WHEN** the proxy extension produces updated flow elements and proxy overlay state
- **THEN** the diagram preview MUST pass the updated flow elements to React Flow and render the proxy overlay from that extension state

### Requirement: Offscreen relation proxy collision strategies

The diagram preview SHALL support selectable offscreen relation proxy collision strategies while preserving the existing proxy placement and transition modes.

#### Scenario: Legacy collision strategy remains selectable

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `legacy`
- **THEN** the diagram preview MUST compute proxy card collision handling using the existing legacy layout behavior

#### Scenario: Iterative collision strategy remains selectable

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST compute proxy card collision handling using the group, intent, lane, and edge-priority iterative layout behavior

#### Scenario: Score collision strategy remains selectable

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `score`
- **THEN** the diagram preview MUST compute proxy card collision handling using deterministic global candidate scoring

#### Scenario: Collision strategy is configurable from editor settings

- **WHEN** offscreen relation proxies are enabled from editor settings
- **THEN** the editor settings MUST allow users to choose between `legacy`, `iterative`, and `score` proxy collision strategies
- **AND** the selected proxy collision strategy MUST be persisted with the other editor settings

#### Scenario: Iterative collision strategy avoids hard obstacles

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST avoid safe-area obstacles and active table obstacles when a collision-free position exists for a proxy card
- **AND** the proxy collision strategy MUST NOT treat the proxy's represented original table as an active table obstacle for that proxy

#### Scenario: Iterative collision strategy resolves proxy overlap after hard obstacles

- **WHEN** multiple offscreen relation proxy cards would overlap and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST resolve proxy-proxy overlap using positions that still satisfy the safe-area and active table obstacle constraints when such positions exist

#### Scenario: Iterative collision strategy stacks lower edge proxies upward

- **WHEN** multiple offscreen relation proxy cards actually overlap near the lower viewport edge and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST keep the lowest proxy card at the lower available position when feasible
- **AND** the remaining overlapping proxy cards MUST stack upward without overlapping that lowest card when feasible

#### Scenario: Iterative collision strategy preserves exact edge-gap positions

- **WHEN** an offscreen relation proxy card can be placed exactly at the lower viewport edge gap while preserving the required proxy-proxy gap and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST treat that exact edge-gap position as allowed
- **AND** the diagram preview MUST NOT move the proxy card farther inward solely because the allowed position is a single boundary point

#### Scenario: Iterative collision strategy resolves corner overlap vertically

- **WHEN** offscreen relation proxy cards from different sides overlap near a viewport corner and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST keep the proxy cards' horizontal positions unchanged
- **AND** the diagram preview MUST move overlapping proxy cards vertically to avoid the overlap when feasible

#### Scenario: Iterative collision strategy preserves top and bottom proxy priority

- **WHEN** a top-side or bottom-side offscreen relation proxy card overlaps a left-side or right-side proxy card and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST prefer keeping the top-side proxy card in the upper stack slot or the bottom-side proxy card in the lower stack slot when feasible
- **AND** the left-side or right-side proxy card MUST move vertically to avoid the overlap when feasible

#### Scenario: Iterative collision strategy only groups actual proxy collisions

- **WHEN** multiple offscreen relation proxy cards share a horizontal range but their raw rectangles do not overlap and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST NOT group those proxy cards for shared intent, vertical stacking, or secondary horizontal lane fallback
- **AND** the diagram preview MUST preserve each proxy card's independent placement unless it must move to avoid hard obstacles or an actual proxy collision

#### Scenario: Iterative collision strategy uses vertical overflow intent

- **WHEN** any offscreen relation proxy card in an actual collision group has an unclamped vertical target outside the viewport and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST treat the group as intending to stack from the overflow direction with the greater total overflow magnitude
- **AND** the diagram preview MUST preserve edge-anchored stacking for that group when feasible

#### Scenario: Iterative collision strategy splits overflowing stacks into secondary horizontal lanes

- **WHEN** an actual collision group cannot fit within the viewport as a single vertical stack and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST move lower-priority proxy cards into secondary horizontal lanes until the vertical stacks fit when horizontal space exists
- **AND** the diagram preview MUST prefer keeping proxy cards with stronger group-direction overflow in the primary lane

#### Scenario: Iterative collision strategy uses deterministic fallback

- **WHEN** the viewport does not contain enough usable space for all proxy cards to avoid every hard obstacle and every other proxy card
- **THEN** the diagram preview MUST choose deterministic proxy card positions that prefer reducing safe-area and active table overlap before reducing proxy-proxy overlap and movement distance

### Requirement: Exportable diagram render snapshot

The diagram preview SHALL provide the rendered diagram state needed to export a static diagram artifact without mutating the live preview.

#### Scenario: Snapshot includes layouted diagram

- **WHEN** a rendered diagram is available for export
- **THEN** the export snapshot MUST include the current layouted DBML diagram tables and routed relations

#### Scenario: Snapshot includes rendering settings

- **WHEN** a rendered diagram is available for export
- **THEN** the export snapshot MUST include the current relation line style, relation highlight mode, resolved workspace theme, and focused diagram target

#### Scenario: Snapshot excludes preview overlays

- **WHEN** a diagram export snapshot is created
- **THEN** it MUST exclude editor sidebars, preview status overlays, preview relation style controls, development controls, and offscreen relation proxy overlays

#### Scenario: Export does not mutate live preview

- **WHEN** a diagram export snapshot is created or rendered
- **THEN** the live diagram preview MUST keep its current viewport, focused target, relation rendering settings, proxy settings, and interaction behavior

### Requirement: Static diagram export rendering

The diagram preview SHALL support rendering a static export view from a diagram export snapshot.

#### Scenario: Static export renders full bounds

- **WHEN** the static export view is rendered
- **THEN** it MUST render all tables and routed relation lines within deterministic padded diagram bounds

#### Scenario: Static export applies optional focus

- **WHEN** the static export view is rendered with a focused target included in the export snapshot
- **THEN** it MUST apply the same focused table or column highlight semantics as the live preview

#### Scenario: Static export omits optional focus

- **WHEN** the static export view is rendered without a focused target in the export snapshot
- **THEN** it MUST render without focused target highlighting or active relation dimming

#### Scenario: Static export normalizes dynamic highlighting

- **WHEN** the static export view is rendered from a snapshot whose relation highlight mode is `dynamic`
- **THEN** it MUST use `gradient` as the effective static relation highlight mode

