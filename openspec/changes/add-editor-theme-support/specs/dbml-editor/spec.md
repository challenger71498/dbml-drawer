## ADDED Requirements

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

The Monaco-backed DBML code editor SHALL support user-selectable light, dark, and system theme modes independently from the editor workspace theme using matching VS Code Light 2026 and Gruvbox Material dark medium Monaco themes.

#### Scenario: User selects light code editor theme

- **WHEN** a user selects the light code editor theme mode
- **THEN** the DBML code editor MUST render with a VS Code Light 2026 Monaco theme

#### Scenario: User selects dark code editor theme

- **WHEN** a user selects the dark code editor theme mode
- **THEN** the DBML code editor MUST render with a Gruvbox Material dark medium Monaco theme

#### Scenario: User selects system code editor theme

- **WHEN** a user selects the system code editor theme mode
- **THEN** the DBML code editor MUST resolve its Monaco theme from the browser `prefers-color-scheme` preference

#### Scenario: Code editor theme is independent from workspace theme

- **WHEN** the user selects different non-system modes for the workspace theme and the code editor theme
- **THEN** the workspace chrome MUST use the selected workspace theme and the DBML code editor MUST use the selected code editor theme

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
