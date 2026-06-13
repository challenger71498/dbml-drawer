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

The DBML editor workspace SHALL render editor sidebars through the shared activity sidebar UI package for common activity bar, panel chrome, controller behavior, and resize interactions while preserving activity-specific content and behavior.

#### Scenario: Editor sidebars consume shared activity sidebar

- **WHEN** the editor workspace renders the left DBML editor sidebar or right inspector sidebar
- **THEN** each sidebar MUST be built from the shared activity sidebar UI and controller primitives rather than a page-local sidebar shell implementation

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

### Requirement: Offscreen relation proxy setting

The DBML editor workspace SHALL provide a Settings preference for enabling or disabling offscreen relation proxies in the diagram preview.

#### Scenario: Settings panel shows proxy toggle

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide an offscreen relation proxy toggle

#### Scenario: Settings panel shows proxy line connection toggle

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide an option for connecting represented relation lines to offscreen relation proxies

#### Scenario: Settings panel shows proxy placement control

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide a choice between line-based and parallel-translated offscreen relation proxy placement

#### Scenario: Settings panel shows proxy transition control

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide an offscreen relation proxy transition mode control with `None`, `Opacity`, and `Morph` choices

#### Scenario: Proxy setting defaults disabled

- **WHEN** no offscreen relation proxy preference has been stored for a user
- **THEN** the editor workspace MUST keep offscreen relation proxies disabled

#### Scenario: Proxy line connection setting defaults disabled

- **WHEN** no offscreen relation proxy line connection preference has been stored for a user
- **THEN** the editor workspace MUST keep relation lines connected to original rendered table nodes

#### Scenario: Proxy placement setting defaults line-based

- **WHEN** no offscreen relation proxy placement preference has been stored for a user
- **THEN** the editor workspace MUST use line-based offscreen relation proxy placement

#### Scenario: Proxy transition setting defaults none

- **WHEN** no offscreen relation proxy transition preference has been stored for a user
- **THEN** the editor workspace MUST use the `none` proxy transition mode

#### Scenario: User enables proxy setting

- **WHEN** a user enables the offscreen relation proxy setting
- **THEN** the editor workspace MUST allow the diagram preview to render offscreen relation proxies for focused diagram targets

#### Scenario: User enables proxy line connection setting

- **WHEN** a user enables the offscreen relation proxy line connection setting
- **THEN** the editor workspace MUST allow the diagram preview to connect represented relation lines to visible proxy cards while offscreen relation proxies are active

#### Scenario: User changes proxy placement setting

- **WHEN** a user selects an offscreen relation proxy placement mode
- **THEN** the editor workspace MUST pass that placement mode to the diagram preview while offscreen relation proxies are active

#### Scenario: User changes proxy transition setting

- **WHEN** a user selects an offscreen relation proxy transition mode
- **THEN** the editor workspace MUST pass that transition mode to the diagram preview while offscreen relation proxies are active

#### Scenario: User disables proxy setting

- **WHEN** a user disables the offscreen relation proxy setting
- **THEN** the editor workspace MUST prevent the diagram preview from rendering offscreen relation proxies

#### Scenario: Proxy setting persists locally

- **WHEN** a user changes the offscreen relation proxy setting and later reloads the editor workspace
- **THEN** the workspace MUST restore the last selected proxy setting from local browser storage

#### Scenario: Proxy line connection setting persists locally

- **WHEN** a user changes the offscreen relation proxy line connection setting and later reloads the editor workspace
- **THEN** the workspace MUST restore the last selected proxy line connection setting from local browser storage

#### Scenario: Proxy placement setting persists locally

- **WHEN** a user changes the offscreen relation proxy placement setting and later reloads the editor workspace
- **THEN** the workspace MUST restore the last selected proxy placement setting from local browser storage

#### Scenario: Proxy transition setting persists locally

- **WHEN** a user changes the offscreen relation proxy transition setting and later reloads the editor workspace
- **THEN** the workspace MUST restore the last selected proxy transition mode from local browser storage

#### Scenario: Unknown proxy transition setting normalizes to default

- **WHEN** a persisted offscreen relation proxy transition setting is missing or unsupported
- **THEN** the editor workspace MUST normalize it to the `none` proxy transition mode

### Requirement: Compact editor page header

The DBML editor workspace SHALL render one compact editor workspace header beside the editor sidebars and above the main workspace content.

#### Scenario: Editor header is the only page header

- **WHEN** the `/editor` workspace renders
- **THEN** the workspace MUST render a single editor page header
- **AND** the workspace MUST NOT render a separate preview section header

#### Scenario: Editor header sits beside sidebars

- **WHEN** the editor page header is rendered with left and right activity sidebars
- **THEN** the editor header MUST render inside the central workspace column beside the activity sidebars
- **AND** the left and right activity sidebars MUST remain full-height beside the workspace column

#### Scenario: Editor header uses compact activity-relative height

- **WHEN** the editor page header is rendered
- **THEN** its visual height MUST be four thirds of the current activity sidebar button height

#### Scenario: Editor header shows DBML title and note

- **WHEN** the current DBML document metadata contains a project name and note
- **THEN** the editor page header MUST show the project name in uppercase styling
- **AND** it MUST show the note below the project name with visual separation from the title

#### Scenario: Editor header omits missing note

- **WHEN** the current DBML document metadata does not contain a note
- **THEN** the editor page header MUST NOT show note fallback text
- **AND** it MUST NOT reserve visible note spacing

#### Scenario: Editor footer shows database type

- **WHEN** the current DBML document metadata contains a database type
- **THEN** the editor workspace MUST render a footer using the same visual height as the shared sidebar panel header
- **AND** the footer MUST show a database-shaped icon and the database type on the right side

#### Scenario: Editor footer omits missing database type

- **WHEN** the current DBML document metadata does not contain a database type
- **THEN** the editor workspace MUST NOT show database fallback text or database metadata in the footer

#### Scenario: Editor header handles missing metadata

- **WHEN** the current DBML document metadata is unavailable or incomplete
- **THEN** the editor page header and footer MUST render without breaking editor layout or diagram rendering

#### Scenario: Editor metadata persists through invalid DBML

- **GIVEN** the current DBML document previously parsed successfully with metadata
- **WHEN** the DBML document becomes invalid
- **THEN** the editor page header and footer MUST continue showing the last successfully parsed project name, note, and database type
- **AND** the invalid DBML warning MUST still be shown in the preview overlay

### Requirement: Settings-hosted diagram display controls

The DBML editor workspace SHALL host diagram routing controls and relation line style controls in the Settings panel.

#### Scenario: Routing controls move to settings

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide controls for Bezier, Step, and Rounded diagram edge routing modes

#### Scenario: Routing controls are removed from top chrome

- **WHEN** the editor workspace top chrome and preview overlays render
- **THEN** the Bezier, Step, and Rounded controls MUST NOT render in the former preview header or top toolbar location

#### Scenario: Relation style controls exist in settings

- **WHEN** the Settings panel is expanded
- **THEN** it MUST provide controls for Solid, Gradient, and Dynamic relation line style modes

#### Scenario: Settings controls use shared setting state

- **WHEN** a user changes diagram routing mode or relation line style mode in the Settings panel
- **THEN** the diagram preview MUST update using the same persisted settings state as existing diagram controls

#### Scenario: Dynamic relation style warns about battery life

- **WHEN** the Dynamic relation style mode is selected
- **THEN** the Dynamic control MUST use warning-colored active styling
- **AND** the Settings panel MUST show a warning that this option may impact battery life
- **AND** the preview compact relation style control MUST show the same warning as plain normal text below the control

### Requirement: Editor diagram export controls

The DBML editor workspace SHALL provide controls for exporting the current rendered diagram.

#### Scenario: Export control is available

- **WHEN** a rendered DBML diagram is available in the editor workspace
- **THEN** the workspace MUST provide an export control for the current diagram in the editor header's right-side action area

#### Scenario: Export control remains header-level

- **WHEN** the editor workspace renders sidebars, inspector panels, settings panels, or preview overlays
- **THEN** the diagram export control MUST remain a header-level workspace action rather than being hosted inside those panels or overlays

#### Scenario: Export formats are selectable

- **WHEN** the user opens the diagram export control
- **THEN** the workspace MUST provide PNG and HTML export format choices

#### Scenario: Selection highlight option is available

- **WHEN** the user opens the diagram export control
- **THEN** the workspace MUST provide an option for including the currently focused table or column highlight in the exported output

#### Scenario: File name input is available

- **WHEN** the user opens the diagram export control
- **THEN** the workspace MUST provide a file name input
- **AND** the default file name MUST match the generated diagram export file name used when the user does not customize it

#### Scenario: Export control blocks missing diagram

- **WHEN** no rendered DBML diagram is available in the editor workspace
- **THEN** the workspace MUST disable or otherwise block PNG and HTML export actions

#### Scenario: Export options are per action

- **WHEN** a user changes the export format, file name, or selection highlight option
- **THEN** the workspace MUST NOT persist those choices as editor settings or change the live diagram rendering settings

### Requirement: Editor export downloads

The DBML editor workspace SHALL start a browser download for successful diagram export actions.

#### Scenario: PNG export downloads file

- **WHEN** a user confirms PNG export for a rendered DBML diagram
- **THEN** the workspace MUST start a browser download for a `.png` file

#### Scenario: HTML export downloads file

- **WHEN** a user confirms HTML export for a rendered DBML diagram
- **THEN** the workspace MUST start a browser download for a `.html` file

#### Scenario: Export failure is surfaced

- **WHEN** diagram export fails before a file can be downloaded
- **THEN** the workspace MUST surface a non-success export state without clearing the current diagram or editor document

### Requirement: Relation port routing setting

The DBML editor workspace SHALL provide a persisted setting for choosing how relation endpoints attach to column side ports.

#### Scenario: Fixed routing is default

- **WHEN** a user has no stored relation port routing preference
- **THEN** the editor MUST use fixed relation port routing

#### Scenario: Relation port routing options are available

- **WHEN** the editor settings controls are shown
- **THEN** the workspace MUST provide relation port routing choices for fixed routing and nearest-port routing

#### Scenario: User selects nearest routing

- **WHEN** a user selects nearest-port relation routing
- **THEN** the editor MUST apply nearest relation port routing to the current valid diagram preview

#### Scenario: User selects fixed routing

- **WHEN** a user selects fixed relation port routing after using nearest-port routing
- **THEN** the editor MUST restore fixed source-right to target-left relation endpoint routing for the current valid diagram preview

#### Scenario: Relation port routing persists locally

- **WHEN** a user selects a relation port routing mode and later reloads the editor workspace
- **THEN** the workspace MUST restore the selected relation port routing mode from local browser storage

#### Scenario: Invalid stored relation port routing falls back

- **WHEN** local browser storage contains an unknown relation port routing mode
- **THEN** the editor MUST fall back to fixed relation port routing

#### Scenario: Relation port routing changes relayout

- **WHEN** the current DBML document is valid and the user changes relation port routing mode
- **THEN** the editor MUST recompute the current diagram layout using the selected relation port routing mode without requiring a DBML text edit

#### Scenario: Relation port routing is independent from line style

- **WHEN** a user changes relation port routing mode
- **THEN** the workspace MUST NOT change the selected relation line style or relation highlight mode
