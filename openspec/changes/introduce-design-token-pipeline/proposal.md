## Why

The editor theme now spans CSS modules, React Flow rendering constants, and Monaco theme definitions, so visual decisions are duplicated across CSS and TypeScript. Introducing a strict design token pipeline while the frontend is still small will give the project a single source of truth before more theme variants and UI surfaces are added.

## What Changes

- Add Style Dictionary as the frontend design token build pipeline.
- Add `frontend/design-tokens/` as the human-authored source for primitive, semantic, and component design tokens.
- Generate app-consumable CSS and TypeScript token artifacts under `frontend/src/shared/design-tokens/generated/`.
- Convert both light and dark editor workspace, diagram, relation, sidebar, and Monaco theme values to generated design tokens.
- Define the light theme as a light reinterpretation of the dark theme's semantic roles rather than preserving the current light colors verbatim.
- Require frontend verification to build or check generated token artifacts so generated files cannot drift from token JSON.
- Establish a no-hard-coded-design-values rule for tokenized theme surfaces.

## Capabilities

### New Capabilities

- `frontend-design-tokens`: Defines the frontend design token source structure, generated artifacts, verification workflow, and strict usage rules for tokenized theme values.

### Modified Capabilities

- None.

## Impact

- Adds a frontend Style Dictionary dependency and project-local token build configuration.
- Adds `frontend/design-tokens/` source files for light and dark primitive, semantic, and component tokens.
- Adds generated CSS/TypeScript token outputs consumed by editor CSS modules, diagram rendering constants, and Monaco theme setup.
- Updates frontend package scripts and verification flow to include token generation or token drift checks.
- Refactors existing editor theme values into a strict token pipeline and intentionally refreshes the light palette to align with the dark theme's semantic design language.
