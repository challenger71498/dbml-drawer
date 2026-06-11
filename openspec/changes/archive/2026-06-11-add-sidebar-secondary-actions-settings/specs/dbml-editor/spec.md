## ADDED Requirements

### Requirement: Sidebar top and bottom activity groups

The DBML editor workspace SHALL allow editor sidebars to render activity controls in optional top and bottom groups while preserving shared sidebar chrome and caller-owned activity behavior.

#### Scenario: Sidebar renders top activity group

- **WHEN** a sidebar is configured with one or more top activities
- **THEN** the sidebar MUST render those activity controls in the top-aligned area of the activity bar

#### Scenario: Sidebar renders bottom activity group

- **WHEN** a sidebar is configured with one or more bottom activities
- **THEN** the sidebar MUST render those activity controls in the bottom-aligned area of the activity bar

#### Scenario: Empty activity group is omitted

- **WHEN** a sidebar has no activities for a top or bottom group
- **THEN** the sidebar MUST NOT render empty interactive controls for that group

#### Scenario: Activity group controls preserve shared styling

- **WHEN** activity controls render in either the top group or bottom group
- **THEN** they MUST use the same icon-only button styling, active state treatment, and accessible labeling behavior as existing sidebar activity controls

#### Scenario: One panel active per sidebar

- **WHEN** a user activates a sidebar activity from either the top group or the bottom group
- **THEN** that sidebar MUST display at most one expanded panel for the active activity

#### Scenario: Switching groups replaces panel content

- **WHEN** a sidebar panel is expanded for one activity and the user activates another activity in the other group
- **THEN** the sidebar MUST keep the sidebar expanded and replace the panel content with the newly selected activity panel

### Requirement: Editor settings sidebar activity

The DBML editor workspace SHALL provide a Settings activity in the bottom group of the right sidebar for editor preference controls.

#### Scenario: Settings activity appears at bottom of right sidebar

- **WHEN** a user opens the `/editor` frontend route
- **THEN** the right sidebar MUST render a Settings activity control in its bottom activity group

#### Scenario: Settings activity opens settings panel

- **WHEN** a user activates the right sidebar Settings activity
- **THEN** the right sidebar MUST expand a Settings panel using the shared sidebar panel header, close affordance, resize behavior, and right sidebar panel placement

#### Scenario: Settings panel preserves DBML editor panel

- **WHEN** the DBML editor panel is expanded and the user activates the Settings activity
- **THEN** the workspace MUST keep the DBML editor panel expanded while rendering the Settings panel in the right sidebar

#### Scenario: Settings panel replaces right inspector panel

- **WHEN** a right inspector panel is expanded and the user activates the Settings activity
- **THEN** the right sidebar MUST replace the active inspector panel with the Settings panel rather than rendering both right sidebar panels

#### Scenario: Toolbar no longer hosts theme controls

- **WHEN** the editor workspace header and toolbar render
- **THEN** workspace theme and code editor theme controls MUST NOT be rendered in the editor toolbar

### Requirement: Theme controls in settings panel

The DBML editor workspace SHALL host workspace theme and code editor theme preferences inside the Settings sidebar panel.

#### Scenario: Settings panel shows workspace theme modes

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide workspace theme choices for Light, Solarized, Dark, and System

#### Scenario: Workspace theme defaults to system

- **WHEN** no workspace theme preference has been stored for a user
- **THEN** the workspace theme mode MUST default to System

#### Scenario: User changes workspace theme from settings

- **WHEN** a user selects a workspace theme mode in the Settings panel
- **THEN** the editor workspace MUST apply and persist that workspace theme mode using the existing workspace theme behavior

#### Scenario: Settings panel shows code editor override toggle

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide a code editor workspace theme override toggle

#### Scenario: Code editor follows workspace when override is disabled

- **WHEN** the code editor workspace theme override toggle is disabled
- **THEN** the DBML code editor MUST resolve its theme from the currently resolved workspace theme

#### Scenario: Code editor override selector is available when enabled

- **WHEN** the code editor workspace theme override toggle is enabled
- **THEN** the Settings panel MUST provide code editor theme choices for Light, Solarized, Dark, and System

#### Scenario: Code editor override selection defaults to system

- **WHEN** the code editor workspace theme override is enabled and no explicit override theme has been selected
- **THEN** the code editor override theme mode MUST default to System

#### Scenario: User changes code editor override from settings

- **WHEN** a user selects a code editor override theme mode in the Settings panel
- **THEN** the DBML code editor MUST apply and persist that code editor theme mode using the existing code editor theme behavior

#### Scenario: Disabling override preserves explicit selection

- **WHEN** a user disables the code editor workspace theme override after selecting an explicit code editor theme
- **THEN** the DBML code editor MUST follow the workspace theme while preserving the explicit code editor theme selection for the next time override is enabled in the same browser storage context

## MODIFIED Requirements

### Requirement: Editor sidebar shell consistency

The DBML editor workspace SHALL render editor sidebars with a shared page-local shell for common activity bar and panel chrome while preserving activity-specific content and behavior.

#### Scenario: Shared activity button chrome

- **WHEN** the left DBML editor activity control and right inspector activity controls are rendered
- **THEN** they MUST use consistent icon-only button styling and accessible activity labels

#### Scenario: Shared expanded panel chrome

- **WHEN** a left or right editor sidebar panel is expanded
- **THEN** the panel MUST use consistent sidebar frame, header, background, border, and panel content treatment

#### Scenario: Shared panel header ownership

- **WHEN** a sidebar panel renders activity-specific content
- **THEN** the shared shell MUST own the panel header and the activity-specific content MUST NOT render a duplicate panel title header

#### Scenario: Shared panel close affordance

- **WHEN** a sidebar panel header is rendered
- **THEN** the header MUST provide a shared icon-only close button using the same visual treatment as sidebar activity buttons

#### Scenario: Activity content remains caller-owned

- **WHEN** a sidebar panel renders DBML editor, diagnostics, presets, diagram settings, or editor settings content
- **THEN** the shared shell MUST render that content without taking ownership of its DBML document, diagnostics, preset, layout setting, theme preference, or diagram selection logic

#### Scenario: Left sidebar behavior is preserved

- **WHEN** the DBML editor activity is toggled or the DBML editor sidebar is resized
- **THEN** the left sidebar MUST preserve its current expanded/collapsed behavior, resize control semantics, and diagram workspace sizing

#### Scenario: Sidebar side does not determine panel behavior

- **WHEN** the shared shell renders a sidebar
- **THEN** the shell MUST keep sidebar side and expanded panel placement as separate inputs so position alone does not determine unrelated behavior

#### Scenario: Right inspector panel opens toward workspace

- **WHEN** a right-side inspector activity panel is expanded
- **THEN** the panel MUST render to the left of the right-side activity bar

#### Scenario: Sidebar resize enforces bounded width

- **WHEN** a user resizes the left DBML editor sidebar or right inspector sidebar
- **THEN** the sidebar MUST enforce both minimum and maximum width constraints while preserving usable diagram workspace area

#### Scenario: Right inspector sidebar is resizable

- **WHEN** a right-side inspector activity panel is expanded
- **THEN** the workspace MUST provide a control for resizing the inspector sidebar while preserving the diagram preview in the remaining main workspace

#### Scenario: Right inspector behavior is preserved

- **WHEN** right-side inspector activities are selected, switched, collapsed, or closed
- **THEN** the right inspector MUST preserve its current activity selection, expanded/collapsed behavior, and panel rendering behavior
