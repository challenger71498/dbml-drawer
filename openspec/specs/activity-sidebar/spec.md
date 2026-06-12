## Purpose

Define the shared, domain-free activity sidebar UI pattern used to render local tool panels with reusable sidebar chrome and UI-only controller behavior.

## Requirements

### Requirement: Domain-free activity sidebar UI

The frontend SHALL provide a shared activity sidebar UI package that renders local tool activities and an optional expanded panel without depending on editor or DBML domain modules.

#### Scenario: Sidebar renders activity groups

- **WHEN** a caller provides top and bottom activity groups
- **THEN** the activity sidebar MUST render each non-empty group in the requested top or bottom activity bar position

#### Scenario: Empty groups are omitted

- **WHEN** a caller provides no activities for a group
- **THEN** the activity sidebar MUST omit empty interactive controls for that group

#### Scenario: Activity controls are accessible

- **WHEN** an activity control is rendered
- **THEN** the control MUST be icon-only visually and MUST expose its label, pressed state, expanded state, and controlled panel relationship through accessible attributes

#### Scenario: Expanded panel renders caller content

- **WHEN** the activity sidebar is expanded with an active panel id, label, and content
- **THEN** the sidebar MUST render shared panel chrome with the caller-owned content inside the panel body

#### Scenario: Domain modules are not imported

- **WHEN** a developer inspects the shared activity sidebar package
- **THEN** it MUST NOT import DBML, editor page, diagnostics, layout, theme settings, or diagram domain modules

### Requirement: Activity sidebar controller

The frontend SHALL provide a reusable activity sidebar controller for UI-only sidebar state and interactions.

#### Scenario: Activity selection opens panel

- **WHEN** a caller selects an inactive activity
- **THEN** the controller MUST mark that activity active and expand the sidebar panel

#### Scenario: Active activity toggles panel

- **WHEN** a caller selects the currently active activity
- **THEN** the controller MUST toggle the sidebar between expanded and collapsed states

#### Scenario: Closing clears active panel

- **WHEN** a caller closes the sidebar panel
- **THEN** the controller MUST collapse the panel and clear the active activity

#### Scenario: One panel is active across all groups

- **WHEN** activities exist in both top and bottom groups
- **THEN** the controller MUST allow only one activity panel to be active at a time across all groups

#### Scenario: Width is resized within bounds

- **WHEN** a caller resizes the sidebar with pointer or keyboard interactions
- **THEN** the controller MUST update the sidebar width while enforcing configured minimum and maximum width constraints

### Requirement: Activity sidebar placement

The frontend SHALL allow callers to configure sidebar side and panel placement independently.

#### Scenario: Side and panel placement are independent

- **WHEN** a caller renders an activity sidebar
- **THEN** the caller MUST be able to choose the sidebar side and whether the panel renders before or after the activity bar as separate inputs

#### Scenario: Close affordance is shared

- **WHEN** an expanded panel has a close handler and close label
- **THEN** the activity sidebar MUST render a shared icon-only close control in the panel header

#### Scenario: Resize handle is optional

- **WHEN** a caller does not provide resize handle behavior
- **THEN** the activity sidebar MUST render without a resize separator control
