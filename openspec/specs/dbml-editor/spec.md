## Purpose

Define the frontend DBML editor authoring capability.

## Requirements

### Requirement: DBML editor workspace

The frontend SHALL provide a DBML editor workspace at the `/editor` route as the primary authoring surface with DBML text editing, diagnostics, and diagram preview.

#### Scenario: Editor workspace renders

- **WHEN** a user opens the `/editor` frontend route
- **THEN** the application MUST render a DBML editor workspace

#### Scenario: Editor route is addressable

- **WHEN** a user navigates directly to `/editor`
- **THEN** the frontend MUST show the DBML editor workspace without requiring any prior navigation state

#### Scenario: Sample DBML is available

- **WHEN** the DBML editor workspace first loads
- **THEN** the editor MUST contain an initial DBML sample document

#### Scenario: User can edit DBML text

- **WHEN** a user changes the editor content
- **THEN** the workspace MUST update the current DBML document state

#### Scenario: Diagram preview is available

- **WHEN** the DBML editor workspace renders
- **THEN** the workspace MUST include a DBML diagram preview for the current document

### Requirement: Monaco-based DBML editing

The frontend SHALL use Monaco Editor for DBML text editing.

#### Scenario: Monaco editor is used

- **WHEN** the DBML editor workspace renders
- **THEN** the DBML text input MUST be backed by Monaco Editor

#### Scenario: DBML language is registered

- **WHEN** Monaco initializes for the editor workspace
- **THEN** the frontend MUST register DBML as an editor language

### Requirement: DBML syntax highlighting

The editor SHALL provide syntax highlighting for DBML content.

#### Scenario: DBML keywords are highlighted

- **WHEN** the editor displays DBML content containing DBML keywords
- **THEN** Monaco MUST tokenize those keywords as DBML language tokens

#### Scenario: DBML structural tokens are highlighted

- **WHEN** the editor displays DBML content containing braces, brackets, strings, comments, identifiers, or relationship operators
- **THEN** Monaco MUST tokenize those structures for DBML syntax highlighting

### Requirement: DBML validation

The frontend SHALL validate DBML content in the browser without requiring backend persistence, authentication, or network access.

#### Scenario: Valid DBML clears diagnostics

- **WHEN** the current DBML document is valid
- **THEN** the workspace MUST show no validation errors for that document

#### Scenario: Invalid DBML creates diagnostics

- **WHEN** the current DBML document contains invalid DBML
- **THEN** the workspace MUST create validation diagnostics describing the parsing failure

#### Scenario: Validation follows editor changes

- **WHEN** a user edits the DBML document
- **THEN** validation MUST run after the edit without requiring an explicit submit action

### Requirement: DBML diagnostics display

The frontend SHALL display DBML validation diagnostics in the editor workspace.

#### Scenario: Diagnostics panel shows validation errors

- **WHEN** DBML validation returns errors
- **THEN** the workspace MUST display those errors in a diagnostics panel

#### Scenario: Editor markers show validation errors

- **WHEN** DBML validation returns errors with source positions
- **THEN** Monaco MUST display validation markers at the corresponding editor positions

#### Scenario: Diagnostics handle missing positions

- **WHEN** DBML validation returns an error without a source position
- **THEN** the workspace MUST still display the error message in the diagnostics panel

### Requirement: Responsive editing

The editor workspace SHALL keep editing responsive while DBML validation runs.

#### Scenario: Validation is debounced

- **WHEN** a user types continuously in the editor
- **THEN** validation MUST be delayed or coalesced to avoid validating every keystroke synchronously

#### Scenario: Stale diagnostics are replaced

- **WHEN** a newer validation result is available for the current document
- **THEN** the workspace MUST replace diagnostics from older document states

### Requirement: Editor inspector activity bar

The DBML editor workspace SHALL provide an editor-local inspector activity bar for editor-specific tools.

#### Scenario: Activity bar renders available activities

- **WHEN** the DBML editor workspace has one or more available inspector activities
- **THEN** the workspace MUST render a right-side activity bar with one control per available activity

#### Scenario: Activity controls are icon-only and accessible

- **WHEN** an inspector activity control is rendered
- **THEN** the control MUST be visually icon-only and MUST provide an accessible label describing the activity

#### Scenario: Activity bar is hidden when no activities are available

- **WHEN** the DBML editor workspace has no available inspector activities
- **THEN** the workspace MUST NOT render an empty inspector activity bar

### Requirement: Editor left sidebar

The DBML editor workspace SHALL provide a left-side sidebar for DBML authoring content.

#### Scenario: Left sidebar renders in editor workspace

- **WHEN** a user opens the `/editor` frontend route
- **THEN** the workspace MUST render a narrow left-side activity bar using visual styling consistent with the right-side editor inspector activity bar

#### Scenario: Left sidebar spans editor page chrome

- **WHEN** the editor page header is rendered
- **THEN** the left-side activity bar and expanded DBML editor sidebar panel MUST align with the full editor page height like the right-side inspector rather than starting below the editor page header

#### Scenario: Editor activity toggles left sidebar

- **WHEN** a user activates the DBML editor control in the left-side activity bar
- **THEN** the workspace MUST toggle the DBML editor sidebar panel between expanded and collapsed states

#### Scenario: DBML editor is hosted in left sidebar

- **WHEN** the DBML editor sidebar panel is expanded
- **THEN** the panel MUST contain the DBML code editor as its initial content

#### Scenario: Diagram remains primary workspace content

- **WHEN** the left activity bar is rendered and the DBML editor panel is expanded or collapsed
- **THEN** the DBML diagram preview MUST remain visible in the main workspace area outside the left activity bar and panel

#### Scenario: DBML editor sidebar width is resizable

- **WHEN** the DBML editor sidebar panel is expanded
- **THEN** the workspace MUST provide a control for resizing the sidebar width while preserving the diagram preview in the remaining main workspace

#### Scenario: DBML editing behavior is preserved

- **WHEN** a user edits DBML text in the left sidebar editor
- **THEN** the workspace MUST update the current DBML document state, validation diagnostics, Monaco markers, and diagram preview as before

#### Scenario: Diagram source reveal targets left sidebar editor

- **WHEN** a user focuses a table or column in the diagram preview
- **THEN** the workspace MUST reveal the corresponding DBML source range in the left sidebar code editor

#### Scenario: Right inspector remains independent

- **WHEN** right-side editor inspector activities are available
- **THEN** the left sidebar MUST NOT replace, hide, or change the behavior of the right-side inspector activity bar and panels

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

### Requirement: Editor inspector sidebar

The DBML editor workspace SHALL provide an expandable right-side inspector sidebar that displays the active inspector activity panel.

#### Scenario: Selecting an inactive activity expands sidebar

- **WHEN** a user activates an inspector activity that is not currently active
- **THEN** the workspace MUST select that activity and expand the inspector sidebar with that activity panel

#### Scenario: Selecting active activity toggles sidebar

- **WHEN** a user activates the currently active inspector activity
- **THEN** the workspace MUST toggle the inspector sidebar between expanded and collapsed states

#### Scenario: Switching activity preserves expanded sidebar

- **WHEN** the inspector sidebar is expanded and a user activates a different inspector activity
- **THEN** the workspace MUST keep the sidebar expanded and replace the panel content with the newly selected activity panel

### Requirement: Editor theme selection

The DBML editor workspace SHALL support user-selectable light, dark, and system theme modes for the editor workspace chrome using VS Code Light 2026 for light mode and Gruvbox Material medium/material for dark mode.

#### Scenario: User selects light theme

- **WHEN** a user selects the light theme mode in the editor workspace
- **THEN** the workspace MUST render editor chrome, sidebars, panels, controls, and diagram surfaces using the light theme

#### Scenario: User selects dark theme

- **WHEN** a user selects the dark theme mode in the editor workspace
- **THEN** the workspace MUST render editor chrome, sidebars, panels, controls, and diagram surfaces using the dark theme

#### Scenario: User selects system theme

- **WHEN** a user selects the system theme mode in the editor workspace
- **THEN** the workspace MUST resolve the active visual theme from the browser `prefers-color-scheme` preference

#### Scenario: System theme follows OS changes

- **WHEN** the selected theme mode is system and the browser color scheme preference changes
- **THEN** the workspace MUST update the resolved visual theme without requiring a page reload

#### Scenario: Theme mode persists locally

- **WHEN** a user selects a theme mode and later reloads the editor workspace
- **THEN** the workspace MUST restore the last selected workspace theme mode from local browser storage

### Requirement: DBML code editor theme selection

The Monaco-backed DBML code editor SHALL support user-selectable light, dark, and system theme modes independently from the editor workspace theme, and SHALL support a workspace-following mode that resolves from the editor workspace theme.

#### Scenario: User selects light code editor theme

- **WHEN** a user selects the light code editor theme mode
- **THEN** the DBML code editor MUST render with a VS Code Light 2026 Monaco theme

#### Scenario: User selects dark code editor theme

- **WHEN** a user selects the dark code editor theme mode
- **THEN** the DBML code editor MUST render with a Gruvbox Material dark medium Monaco theme

#### Scenario: User selects system code editor theme

- **WHEN** a user selects the system code editor theme mode
- **THEN** the DBML code editor MUST resolve its Monaco theme from the browser `prefers-color-scheme` preference

#### Scenario: User selects workspace-following code editor theme

- **WHEN** a user selects the workspace code editor theme mode
- **THEN** the DBML code editor MUST resolve its Monaco theme from the currently resolved editor workspace theme

#### Scenario: Code editor theme is independent from workspace theme

- **WHEN** the user selects different non-system modes for the workspace theme and the code editor theme
- **THEN** the workspace chrome MUST use the selected workspace theme and the DBML code editor MUST use the selected code editor theme

#### Scenario: Workspace-following mode updates code editor theme

- **WHEN** the selected code editor theme mode is workspace and the resolved workspace theme changes
- **THEN** the DBML code editor MUST update to the corresponding Monaco theme without losing the current DBML document state

#### Scenario: Code editor uses light Monaco theme

- **WHEN** the resolved code editor theme is light
- **THEN** the DBML code editor MUST render with a VS Code Light 2026 Monaco theme

#### Scenario: Code editor uses dark Monaco theme

- **WHEN** the resolved code editor theme is dark
- **THEN** the DBML code editor MUST render with a Gruvbox Material dark medium Monaco theme

#### Scenario: System mode updates code editor theme

- **WHEN** the selected code editor theme mode is system and the resolved browser color scheme changes
- **THEN** the DBML code editor MUST update to the corresponding Monaco theme without losing the current DBML document state

#### Scenario: Code editor theme mode persists locally

- **WHEN** a user selects a code editor theme mode and later reloads the editor workspace
- **THEN** the workspace MUST restore the last selected code editor theme mode from local browser storage

#### Scenario: Collapsed inspector clears selected activity

- **WHEN** the inspector sidebar is collapsed
- **THEN** the workspace MUST NOT keep any activity visibly selected in the activity bar

#### Scenario: Sidebar can be closed from panel

- **WHEN** the inspector sidebar is expanded and a user activates the sidebar close control
- **THEN** the workspace MUST collapse the inspector sidebar while preserving access to the activity bar

### Requirement: Extensible editor inspector activities

The DBML editor workspace SHALL define inspector activities as composable activity definitions so future editor tools can be added without rewriting the main editor layout.

#### Scenario: Activity definition provides metadata

- **WHEN** an inspector activity is registered
- **THEN** it MUST provide a stable identifier, accessible label, and panel renderer

#### Scenario: Activity definition renders panel content

- **WHEN** an inspector activity becomes active and the sidebar is expanded
- **THEN** the workspace MUST render the panel content provided by that activity definition

#### Scenario: Editor page layout remains activity-agnostic

- **WHEN** a new inspector activity is added
- **THEN** the editor workspace grid and primary editor layout MUST remain unchanged by that activity addition

### Requirement: Development-only editor diagnostics sidebar

The frontend SHALL expose DBML diagnostics as a development-only editor inspector activity when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Diagnostics activity appears in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render a diagnostics activity control in the editor inspector activity bar

#### Scenario: Diagnostics activity is hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render the diagnostics activity control or diagnostics inspector panel

#### Scenario: Diagnostics panel shows validation errors

- **WHEN** DBML validation returns diagnostics and the diagnostics activity panel is expanded
- **THEN** the workspace MUST display those diagnostics in the diagnostics inspector panel

#### Scenario: Monaco markers remain available

- **WHEN** DBML validation returns diagnostics outside frontend development mode
- **THEN** Monaco validation markers MUST still be available for diagnostics that include source positions

### Requirement: Collapsible diagnostics sidebar

The frontend SHALL allow developers to collapse and expand the editor inspector sidebar that hosts the diagnostics activity panel.

#### Scenario: Developer collapses diagnostics activity

- **WHEN** the diagnostics activity is active and the inspector sidebar is expanded
- **THEN** activating the diagnostics activity control or sidebar close control MUST collapse the inspector sidebar while preserving the diagnostics activity control

#### Scenario: Developer expands diagnostics activity

- **WHEN** the diagnostics activity is active and the inspector sidebar is collapsed
- **THEN** activating the diagnostics activity control MUST expand the inspector sidebar and show the diagnostics panel content

#### Scenario: Collapse state is local to the page session

- **WHEN** the editor workspace is reloaded
- **THEN** the inspector sidebar MUST use its default state for the new page session

### Requirement: Development DBML presets

The frontend SHALL expose DBML test presets as a development-only editor inspector activity when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Presets activity appears in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render a presets activity control in the editor inspector activity bar

#### Scenario: Presets activity is hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render the presets activity control or presets inspector panel

#### Scenario: Simple preset is available

- **WHEN** the DBML presets activity panel is expanded
- **THEN** a simple DBML preset MUST be available for testing a small schema

#### Scenario: Complex preset is available

- **WHEN** the DBML presets activity panel is expanded
- **THEN** a complex DBML preset MUST be available for testing multiple related tables

#### Scenario: Very complex preset is available

- **WHEN** the DBML presets activity panel is expanded
- **THEN** a very complex DBML preset MUST be available for testing many tables, many columns, and dense relation rendering

#### Scenario: Developer applies a preset

- **WHEN** a developer selects a DBML test preset from the presets activity panel
- **THEN** the editor workspace MUST replace the current editor document with that preset document

### Requirement: Development diagram layout settings

The frontend SHALL expose diagram layout algorithm settings as a development-only editor inspector activity when frontend editor dev mode is enabled by environment configuration.

#### Scenario: Layout settings activity appears in development

- **WHEN** a developer opens the `/editor` route with frontend editor dev mode enabled
- **THEN** the editor workspace MUST render a layout settings activity control in the editor inspector activity bar

#### Scenario: Layout settings activity is hidden outside development

- **WHEN** a user opens the `/editor` route without frontend editor dev mode enabled
- **THEN** the editor workspace MUST NOT render the layout settings activity control or layout settings inspector panel

#### Scenario: Bundled ELK algorithms are available

- **WHEN** the layout settings activity panel is expanded and bundled ELK algorithm metadata is available
- **THEN** the panel MUST provide every layout algorithm exposed by the bundled `elkjs` runtime as a selectable option

#### Scenario: Layered algorithm is the default

- **WHEN** the editor workspace first renders
- **THEN** the selected diagram layout algorithm MUST be the current layered ELK layout algorithm

#### Scenario: Developer selects layout algorithm

- **WHEN** a developer selects a layout algorithm from the layout settings activity panel
- **THEN** the editor workspace MUST update the selected diagram layout algorithm for the current page session

#### Scenario: Curated layout options are available

- **WHEN** the selected layout algorithm has curated layout options
- **THEN** the layout settings activity panel MUST provide controls for those curated layout options

#### Scenario: Developer changes curated layout option

- **WHEN** a developer changes a curated layout option in the layout settings activity panel
- **THEN** the editor workspace MUST update that layout option for the current page session

#### Scenario: Layout algorithm setting is session-local

- **WHEN** the editor workspace is reloaded
- **THEN** the selected diagram layout algorithm and curated layout options MUST return to their default values

### Requirement: Editor dev mode environment documentation

The frontend SHALL document the environment configuration required to enable editor dev mode.

#### Scenario: Dev mode flag is documented

- **WHEN** a developer reads `frontend/.env.example`
- **THEN** the example environment file MUST include the frontend editor dev mode flag and an example value

### Requirement: Diagram-driven editor source navigation

The DBML editor workspace SHALL move the Monaco editor cursor to the DBML source definition for diagram targets that users focus from the diagram preview.

#### Scenario: Clicking table moves cursor to table definition

- **WHEN** a user clicks a rendered table header in the diagram preview
- **THEN** the Monaco editor cursor MUST move to the corresponding DBML table definition

#### Scenario: Clicking column moves cursor to column definition

- **WHEN** a user clicks a rendered column row in the diagram preview
- **THEN** the Monaco editor cursor MUST move to the corresponding DBML column definition

#### Scenario: Editor reveals focused source position

- **WHEN** the Monaco editor cursor is moved because of a diagram table or column focus
- **THEN** the Monaco editor MUST reveal the cursor position within the editor viewport

#### Scenario: Editor receives focus after diagram source navigation

- **WHEN** the Monaco editor cursor is moved because of a diagram table or column focus
- **THEN** the Monaco editor MUST receive input focus

#### Scenario: Missing source token does not block diagram focus

- **WHEN** a user clicks a rendered table header or column row whose DBML source token is unavailable
- **THEN** the diagram preview MUST still focus the clicked diagram target and the editor cursor movement MUST be skipped
