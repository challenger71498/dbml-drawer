## Context

The frontend currently renders a simple two-panel application shell. The next product step is a usable DBML authoring surface, not diagram rendering. The editor must support DBML-specific syntax highlighting and grammar feedback while staying local to the browser and independent from backend persistence.

The project uses Vite, React, TypeScript, service-local package management, and mise orchestration. Frontend implementation should follow the repository-local Feature-Sliced Design skill added to `.codex/skills/feature-sliced-design/SKILL.md` and the React performance guidance in `.codex/skills/react-best-practices/SKILL.md`.

## Goals / Non-Goals

**Goals:**

- Provide a Monaco Editor based DBML editing workspace.
- Expose the DBML editor workspace at the `/editor` frontend route.
- Register DBML as a Monaco language with initial syntax highlighting.
- Validate DBML in the browser and display diagnostics in both Monaco and a companion diagnostics panel.
- Seed the editor with a useful DBML sample document.
- Introduce an FSD-compatible frontend source structure without over-slicing early code.
- Keep the Monaco integration responsive and avoid avoidable React re-renders.
- Preserve existing frontend quality gates.

**Non-Goals:**

- Render ER diagrams from DBML.
- Import or export `.dbml` files.
- Persist editor content to the backend, local storage, or user accounts.
- Add advanced language intelligence such as autocomplete, hover docs, formatting, symbol navigation, or LSP integration.
- Add backend API behavior.

## Decisions

### Use Monaco Editor for the DBML editor

The editor will use Monaco Editor, integrated through a React-compatible wrapper if it keeps Vite integration simpler. Monaco is heavier than CodeMirror, but it gives a stronger foundation for later language-service features such as completion, markers, hover, commands, and symbol navigation.

Alternative considered: CodeMirror 6. CodeMirror is lighter and strong for custom embedded editors, but the project preference is Monaco because future editor expansion is expected to benefit from Monaco's broader IDE-like surface.

### Register DBML with Monaco language APIs

The frontend will register a `dbml` language id with Monaco. Initial syntax highlighting will use a Monarch tokenizer that covers common DBML constructs such as `Table`, `Ref`, `Enum`, `Project`, braces, brackets, comments, strings, identifiers, column types, and relationship operators.

This is intentionally lexical highlighting, not a full grammar implementation. Grammar correctness will come from validation, not from the tokenizer.

### Validate DBML through an adapter around `@dbml/core`

Validation will be implemented behind a small frontend adapter so Monaco UI code does not depend directly on parser details. The adapter will parse the editor text with `@dbml/core` and return normalized diagnostics containing message, severity, line, and column when available.

The first implementation should prefer the parser mode that provides the most useful editor diagnostics. If parser errors do not expose precise positions, diagnostics should still show a clear message in the diagnostics panel and use a coarse Monaco marker.

### Debounce validation on editor changes

Validation will run after editor changes with a short debounce. This keeps typing responsive while still giving near-real-time feedback. The editor should clear stale diagnostics when the current document validates successfully.

Validation updates should follow React performance guidance:

- Keep the current document text as the source of truth and derive simple display state during render when practical.
- Use functional state updates where callbacks depend on previous state.
- Keep transient Monaco editor instances and disposal handles in refs instead of React state.
- Keep dependencies in effects primitive and intentional.
- Avoid defining React components inside other components.
- Consider `useDeferredValue` or `startTransition` if diagnostics rendering becomes visibly expensive.

### Start with minimal FSD layers

Frontend structure will move toward FSD v2.1 conservatively:

```text
frontend/src/
  app/                  # app initialization, global styles, providers
    router.tsx          # route configuration including /editor
  pages/
    editor/             # /editor page owning editor workspace behavior
      ui/
      model/
      lib/
      index.ts
  shared/               # reusable infrastructure only
    ui/
    lib/
```

The DBML editor is initially used in one page, exposed through the `/editor` route, so editor-specific state, validation orchestration, and UI composition should stay inside `pages/editor`. Do not create `features/`, `entities/`, or `widgets/` until there is real reuse. Shared code must not contain DBML business workflow logic; only generic UI or infrastructure belongs there.

Imports should follow FSD direction: `app -> pages -> shared`. Page internals should be consumed through the page slice public API.

If the editor later becomes used by multiple pages with a stable boundary, extract it to `widgets/editor`. This change should not create that widget preemptively.

### Configure path aliases for FSD

The frontend should add TypeScript and Vite aliases for FSD layers, at least:

- `@/app/*`
- `@/pages/*`
- `@/shared/*`

Aliases for `widgets`, `features`, and `entities` can be omitted until those layers exist, or added if the implementation creates empty-free future-compatible config. Empty layer directories should not be created just for convention.

### Isolate Monaco bundle and lifecycle costs

Monaco is a heavy dependency. The implementation should avoid importing Monaco into unrelated application modules. Monaco-specific registration, tokenizer setup, marker publishing, and editor lifecycle logic should stay inside the DBML editor page slice. Static Monaco options and initial sample content should be hoisted outside React render paths.

If the first direct integration causes unacceptable initial bundle or startup cost, the implementation may lazy-load the Monaco-backed editor while keeping the visible editor workspace stable.

### Test editor behavior at the boundary

Tests should cover:

- initial editor page rendering,
- sample DBML presence,
- validation adapter success and failure behavior,
- diagnostics display for invalid DBML,
- quality gates through existing mise tasks.

Monaco itself does not need exhaustive unit tests. It is acceptable to mock the Monaco React wrapper in component tests and test the integration boundaries owned by the application.

## Risks / Trade-offs

- Monaco increases bundle weight -> Accept for this product direction; revisit lazy loading if startup becomes a problem.
- Monaco can require worker/bundler configuration in Vite -> Keep integration isolated and verify production build during implementation.
- `@dbml/core` error shapes may not map cleanly to line/column markers -> Normalize diagnostics best-effort and keep panel messages useful even without exact positions.
- FSD migration can create unnecessary structure -> Start with `app`, `pages`, and `shared`; avoid speculative `features`, `entities`, and `widgets`.
- Parser validation on each edit can become expensive -> Debounce validation, avoid synchronous validation on every keystroke, and isolate parsing behind an adapter that can later move to a worker.
- React state updates from editor changes can cause excessive re-renders -> Keep transient editor objects in refs, memoize expensive derived data only when needed, and test the editor through stable user-facing behavior.
