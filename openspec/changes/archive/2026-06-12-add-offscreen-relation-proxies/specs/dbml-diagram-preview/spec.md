## ADDED Requirements

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
