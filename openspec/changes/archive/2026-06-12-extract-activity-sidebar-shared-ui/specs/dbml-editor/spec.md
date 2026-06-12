## MODIFIED Requirements

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
