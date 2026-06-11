## Purpose

Define the frontend design token pipeline and token consumption boundaries for editor theme styling.

## Requirements

### Requirement: Design token source structure

The frontend SHALL define human-authored design token source files under `frontend/design-tokens/` using primitive, semantic, and component layers.

#### Scenario: Token source lives outside runtime source

- **WHEN** a developer inspects the frontend project structure
- **THEN** the human-authored Style Dictionary token source files MUST live under `frontend/design-tokens/` rather than under `frontend/src/`

#### Scenario: Token source uses layered folders

- **WHEN** a developer inspects `frontend/design-tokens/`
- **THEN** the token source MUST separate primitive, semantic, and component token definitions into explicit layer folders or files

#### Scenario: Component tokens reference semantic intent

- **WHEN** component-level tokens define editor, sidebar, diagram, relation edge, or Monaco values
- **THEN** those component tokens MUST be traceable to semantic tokens rather than requiring consumers to depend directly on raw primitive palette names

### Requirement: Theme tokenization

The frontend SHALL use Style Dictionary tokens as the source of truth for light, light-solarized, and dark editor theme values.

#### Scenario: Dark theme values are token-authored

- **WHEN** the editor workspace resolves to the dark workspace theme
- **THEN** editor chrome, sidebars, diagram surfaces, DBML table styling, relation colors, selection highlights, and relevant control colors MUST use values generated from `frontend/design-tokens/`

#### Scenario: Light theme values are token-authored

- **WHEN** the editor workspace resolves to the light workspace theme
- **THEN** editor chrome, sidebars, diagram surfaces, DBML table styling, relation colors, selection highlights, and relevant control colors MUST use values generated from `frontend/design-tokens/`

#### Scenario: Light-solarized theme values are token-authored

- **WHEN** the editor workspace resolves to the light-solarized workspace theme
- **THEN** editor chrome, sidebars, diagram surfaces, DBML table styling, relation colors, selection highlights, and relevant control colors MUST use values generated from `frontend/design-tokens/`

#### Scenario: Dark Monaco theme values are token-authored

- **WHEN** the DBML code editor resolves to the dark code editor theme
- **THEN** its Monaco theme colors and token color rules MUST use values generated from `frontend/design-tokens/`

#### Scenario: Light Monaco theme values are token-authored

- **WHEN** the DBML code editor resolves to the light code editor theme
- **THEN** its Monaco theme colors and token color rules MUST use values generated from `frontend/design-tokens/`

#### Scenario: Light-solarized Monaco theme values are token-authored

- **WHEN** the DBML code editor resolves to the light-solarized code editor theme
- **THEN** its Monaco theme colors and token color rules MUST use values generated from `frontend/design-tokens/`

#### Scenario: Light theme reinterprets dark semantic roles

- **WHEN** a developer inspects the light theme token source
- **THEN** the light token definitions MUST express the same semantic roles as the dark theme using pure white light-compatible values rather than preserving the previous yellow-tinted light palette verbatim

#### Scenario: Light-solarized theme preserves the yellow-tinted light variant

- **WHEN** a developer inspects the light-solarized theme token source
- **THEN** the light-solarized token definitions MUST provide a named yellow-tinted light variant separate from the default pure white light theme

### Requirement: Generated design token artifacts

The frontend SHALL generate app-consumable CSS and TypeScript artifacts from the design token source.

#### Scenario: Generated artifacts live in shared source

- **WHEN** Style Dictionary builds frontend design tokens
- **THEN** generated artifacts MUST be written under `frontend/src/shared/design-tokens/generated/`

#### Scenario: CSS variables are generated for styling

- **WHEN** Style Dictionary builds frontend design tokens
- **THEN** it MUST generate CSS custom properties consumable by the editor CSS modules

#### Scenario: TypeScript tokens are generated for runtime integrations

- **WHEN** Style Dictionary builds frontend design tokens
- **THEN** it MUST generate TypeScript-consumable token values for non-CSS integrations such as Monaco theme registration and diagram rendering constants

#### Scenario: Generated files are marked as generated

- **WHEN** a developer opens any generated design token artifact
- **THEN** the file MUST clearly indicate that it is generated and must not be edited manually

### Requirement: Token consumption boundaries

The frontend SHALL consume generated token artifacts instead of hard-coding tokenized theme design values in editor UI and rendering code.

#### Scenario: CSS modules consume generated variables

- **WHEN** editor CSS modules style a tokenized themed surface
- **THEN** they MUST reference generated CSS custom properties rather than raw hex, rgb, hsl, or named color literals for design values

#### Scenario: TypeScript rendering code consumes generated tokens

- **WHEN** TypeScript rendering code needs a tokenized relation, diagram, highlight, or Monaco color
- **THEN** it MUST import or reference generated token artifacts rather than defining duplicated raw color values

#### Scenario: CSS modules keep structural ownership

- **WHEN** editor CSS modules define layout, selectors, interaction states, or responsive structure
- **THEN** they MUST continue to own those structural styles while using generated token values for tokenized design decisions

### Requirement: Token verification workflow

The frontend SHALL provide verification scripts that prevent generated design token artifacts from drifting from the token source.

#### Scenario: Tokens can be built locally

- **WHEN** a developer runs the frontend token build script
- **THEN** Style Dictionary MUST generate the current design token artifacts without requiring the backend service

#### Scenario: Token drift is detected

- **WHEN** generated design token artifacts do not match the current token source
- **THEN** the frontend token check script MUST fail

#### Scenario: Frontend verification includes token checks

- **WHEN** a developer runs the frontend quality or build verification flow
- **THEN** that flow MUST include token generation or token drift checking before reporting success
