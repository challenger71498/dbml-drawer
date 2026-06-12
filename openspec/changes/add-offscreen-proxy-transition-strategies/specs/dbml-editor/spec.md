## ADDED Requirements

### Requirement: Offscreen relation proxy transition setting
The DBML editor workspace SHALL provide a Settings preference for selecting the offscreen relation proxy transition mode.

#### Scenario: Settings panel shows proxy transition control
- **WHEN** the user opens the editor settings panel
- **THEN** it MUST provide an offscreen relation proxy transition mode control with `None`, `Opacity`, and `Morph` choices

#### Scenario: Proxy transition setting defaults to none
- **WHEN** no offscreen relation proxy transition preference has been stored for a user
- **THEN** the editor workspace MUST use the `none` proxy transition mode

#### Scenario: User changes proxy transition setting
- **WHEN** a user selects an offscreen relation proxy transition mode
- **THEN** the editor workspace MUST pass that transition mode to the diagram preview while offscreen relation proxies are active

#### Scenario: Proxy transition setting persists locally
- **WHEN** a user changes the offscreen relation proxy transition setting and later reloads the editor workspace
- **THEN** the workspace MUST restore the last selected proxy transition mode from local browser storage

#### Scenario: Unknown proxy transition setting normalizes to default
- **WHEN** a persisted offscreen relation proxy transition setting is missing or unsupported
- **THEN** the editor workspace MUST normalize it to the `none` proxy transition mode
