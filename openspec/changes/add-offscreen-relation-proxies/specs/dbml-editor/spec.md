## ADDED Requirements

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

#### Scenario: Proxy setting defaults disabled

- **WHEN** no offscreen relation proxy preference has been stored for a user
- **THEN** the editor workspace MUST keep offscreen relation proxies disabled

#### Scenario: Proxy line connection setting defaults disabled

- **WHEN** no offscreen relation proxy line connection preference has been stored for a user
- **THEN** the editor workspace MUST keep relation lines connected to original rendered table nodes

#### Scenario: Proxy placement setting defaults line-based

- **WHEN** no offscreen relation proxy placement preference has been stored for a user
- **THEN** the editor workspace MUST use line-based offscreen relation proxy placement

#### Scenario: User enables proxy setting

- **WHEN** a user enables the offscreen relation proxy setting
- **THEN** the editor workspace MUST allow the diagram preview to render offscreen relation proxies for focused diagram targets

#### Scenario: User enables proxy line connection setting

- **WHEN** a user enables the offscreen relation proxy line connection setting
- **THEN** the editor workspace MUST allow the diagram preview to connect represented relation lines to visible proxy cards while offscreen relation proxies are active

#### Scenario: User changes proxy placement setting

- **WHEN** a user selects an offscreen relation proxy placement mode
- **THEN** the editor workspace MUST pass that placement mode to the diagram preview while offscreen relation proxies are active

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
