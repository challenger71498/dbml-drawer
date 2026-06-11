## 1. Style Dictionary Setup

- [x] 1.1 Add Style Dictionary as a frontend dev dependency.
- [x] 1.2 Add `frontend/style-dictionary.config.ts` with platforms for generated CSS variables and TypeScript token artifacts.
- [x] 1.3 Add frontend token scripts for building generated artifacts and checking generated output drift.
- [x] 1.4 Wire frontend build or quality verification to include token generation or token drift checking.

## 2. Token Source

- [x] 2.1 Create `frontend/design-tokens/` with primitive, semantic, and component token source structure.
- [x] 2.2 Define dark primitive color tokens for the selected Gruvbox Material medium/material palette and any required neutral/support colors.
- [x] 2.3 Define light primitive color tokens by reinterpreting the dark theme palette semantics for a light surface rather than copying the current light colors verbatim.
- [x] 2.4 Define light and dark semantic tokens for text, surfaces, borders, controls, source accent, destination accent, relation line, diagnostics, and editor status colors.
- [x] 2.5 Define light and dark component tokens for editor chrome, sidebar shell, DBML diagram tables, relation edges, selection highlights, diagnostics panels, and Monaco theme values.

## 3. Generated Artifacts

- [x] 3.1 Generate CSS token output under `frontend/src/shared/design-tokens/generated/`.
- [x] 3.2 Generate TypeScript token output under `frontend/src/shared/design-tokens/generated/`.
- [x] 3.3 Generate or assemble light and dark Monaco theme values from generated TypeScript tokens.
- [x] 3.4 Mark all generated files with a do-not-edit generated file header.

## 4. Theme Consumption

- [x] 4.1 Import generated token CSS into the frontend app or editor entry path.
- [x] 4.2 Replace light and dark editor workspace CSS custom property values in `EditorPage.module.css` with generated token variables.
- [x] 4.3 Replace diagram table, column, handle, relation, and selection highlight values with generated token values for both themes.
- [x] 4.4 Replace light and dark Monaco theme color definitions in `editor-theme.ts` with generated token values.
- [x] 4.5 Remove duplicated raw palette values from editor CSS modules and TypeScript rendering code.

## 5. Tests and Verification

- [x] 5.1 Add or update tests proving light and dark workspace theme selection still applies the expected theme attributes/classes.
- [x] 5.2 Add or update tests proving light and dark DBML code editor theme selection still registers and uses the generated Monaco themes.
- [x] 5.3 Add or update tests proving relation source, destination, default line, gradient, dynamic dot, and selection highlight colors resolve through tokenized values.
- [x] 5.4 Run the token build and token check scripts from `frontend/`.
- [x] 5.5 Run `pnpm test`, `pnpm typecheck`, `pnpm format:check`, and `pnpm lint` from `frontend/`.
