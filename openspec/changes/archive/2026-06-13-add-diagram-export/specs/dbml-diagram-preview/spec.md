## ADDED Requirements

### Requirement: Exportable diagram render snapshot

The diagram preview SHALL provide the rendered diagram state needed to export a static diagram artifact without mutating the live preview.

#### Scenario: Snapshot includes layouted diagram

- **WHEN** a rendered diagram is available for export
- **THEN** the export snapshot MUST include the current layouted DBML diagram tables and routed relations

#### Scenario: Snapshot includes rendering settings

- **WHEN** a rendered diagram is available for export
- **THEN** the export snapshot MUST include the current relation line style, relation highlight mode, resolved workspace theme, and focused diagram target

#### Scenario: Snapshot excludes preview overlays

- **WHEN** a diagram export snapshot is created
- **THEN** it MUST exclude editor sidebars, preview status overlays, preview relation style controls, development controls, and offscreen relation proxy overlays

#### Scenario: Export does not mutate live preview

- **WHEN** a diagram export snapshot is created or rendered
- **THEN** the live diagram preview MUST keep its current viewport, focused target, relation rendering settings, proxy settings, and interaction behavior

### Requirement: Static diagram export rendering

The diagram preview SHALL support rendering a static export view from a diagram export snapshot.

#### Scenario: Static export renders full bounds

- **WHEN** the static export view is rendered
- **THEN** it MUST render all tables and routed relation lines within deterministic padded diagram bounds

#### Scenario: Static export applies optional focus

- **WHEN** the static export view is rendered with a focused target included in the export snapshot
- **THEN** it MUST apply the same focused table or column highlight semantics as the live preview

#### Scenario: Static export omits optional focus

- **WHEN** the static export view is rendered without a focused target in the export snapshot
- **THEN** it MUST render without focused target highlighting or active relation dimming

#### Scenario: Static export normalizes dynamic highlighting

- **WHEN** the static export view is rendered from a snapshot whose relation highlight mode is `dynamic`
- **THEN** it MUST use `gradient` as the effective static relation highlight mode
