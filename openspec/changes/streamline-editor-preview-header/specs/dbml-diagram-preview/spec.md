## ADDED Requirements

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

#### Scenario: Non-ready render state remains discoverable
- **WHEN** the diagram preview is paused, pending, or unable to update because of the current DBML state
- **THEN** the preview MUST show the render state in the preview upper-left status area without restoring the removed preview header

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
