## Context

The DBML diagram preview currently computes layout in `layout-dbml-diagram.ts` with a fixed ELK `layered` algorithm and layout options tuned for ERD-style left-to-right diagrams. That is the right default for general users, but it prevents developers from quickly comparing how other bundled ELK algorithms behave against complex DBML documents.

The editor already has a development-only inspector activity model for diagnostics and DBML presets. Diagram layout algorithm selection is an editor-specific debugging tool, so it should remain inside `frontend/src/pages/editor/` rather than being extracted to a shared or feature layer.

## Goals / Non-Goals

**Goals:**

- Add a development-only selector for all layout algorithms exposed by the bundled `elkjs` runtime.
- Add curated controls for selected ELK layout options that are useful for algorithm comparison.
- Keep `layered` as the default algorithm and preserve the current layout behavior unless a developer changes the setting.
- Recompute diagram layout when the selected algorithm changes, even if the DBML source text is unchanged.
- Keep algorithm selection state local to the editor page session.
- Keep the implementation local to the editor page slice.
- Create a clear debug-to-product path: experiment with all algorithms first, then later promote only useful choices to user-facing controls.

**Non-Goals:**

- Expose layout algorithm selection to general users in this change.
- Persist layout algorithm preferences.
- Build a fully dynamic editor for every ELK option exposed by `knownLayoutOptions()`.
- Guarantee that every bundled ELK algorithm produces a useful ERD layout.
- Add backend APIs, routing changes, authentication, or saved workspace settings.

## Decisions

### Keep layout settings in the editor document model

The selected algorithm affects `layoutedDiagram`, not just presentation. `useDbmlDocument` should therefore own the selected algorithm state and pass it into `layoutDbmlDiagram`.

The current layout cache skips recomputation when the debounced DBML text is unchanged. The cache key must include both the debounced source text and selected layout algorithm id so changing algorithms triggers a new layout.

Alternative considered: keep algorithm state inside `DbmlDiagramPreview`. That is a poor fit because `DbmlDiagramPreview` receives already-layouted data and cannot change the ELK computation input without pushing callbacks back up.

### Use ELK algorithm ids as the stable setting value

The selector should store ELK algorithm ids such as `org.eclipse.elk.layered`, not display names or short aliases. Full ids avoid ambiguity and match the identifiers returned by `knownLayoutAlgorithms()`.

The implementation can still pass full ids through the existing `elk.algorithm` layout option. If the UI shows labels, those labels should come from algorithm metadata or a local display mapping.

Alternative considered: use local short values like `layered` and `force`. That is concise but creates another mapping layer and makes it easier for the debug UI to drift from the runtime.

### Source debug options from the bundled runtime

The development panel should expose the algorithms available in the installed `elkjs` bundle, not the full official ELK reference list. The browser bundle does not necessarily include every official adapter or algorithm.

The panel can load algorithm metadata lazily through `elk.knownLayoutAlgorithms()` because the control is development-only and already behind the inspector activity. If metadata loading fails, the UI should at least expose the default layered algorithm so the editor remains usable.

Alternative considered: hard-code the current known list. That is simpler and easy to test, but it can become stale when `elkjs` changes.

### Keep debug controls in a new inspector activity

Add a `Diagram settings` or `Layout settings` inspector activity that is registered only when editor dev mode is enabled. This keeps experimental algorithms away from the main diagram header, where controls are more likely to be interpreted as supported product features.

Alternative considered: add the selector next to the existing relation line style buttons in the diagram header. That would be more discoverable, but it would expose unstable/debug behavior in the primary user surface.

### Preserve current default layout options

The default `layered` algorithm should keep the current rightward direction, orthogonal routing, fixed port order, and spacing options.

Other algorithms can initially receive the selected algorithm id plus broadly compatible spacing options. Some layered-specific options may be ignored by non-layered algorithms. If an algorithm cannot produce useful routes for the current ERD data, that is acceptable for the debug phase and should inform later product selection.

Alternative considered: create per-algorithm option profiles immediately. That adds tuning work before the team has observed which algorithms are worth keeping.

### Add curated option controls instead of a fully dynamic option editor

Some algorithms expose many sub-options. `elk.knownLayoutOptions()` provides option ids, names, descriptions, groups, and value types, but it does not provide enum value lists in the bundled runtime metadata. The development UI should therefore start with a curated set of useful options whose enum values are maintained locally from the official ELK reference.

Initial curated controls should focus on:

- Common directional/routing options already relevant to the current ERD layout.
- Layered options that affect layer assignment, cycle breaking, node placement, spacing, and high-degree handling.
- Force and Stress options that tune graph distance and iteration behavior.
- Simple packing controls for Box and Rectangle Packing experiments.

Alternative considered: generate controls for every option from `knownLayoutOptions()`. That would expose many options without valid enum choices or useful defaults, making the debug panel noisy and error-prone.

## Risks / Trade-offs

- [Risk] Some bundled algorithms are not appropriate for DBML graphs with ports and dense directed relations. -> Mitigation: keep the selector development-only and treat poor output as experiment data.
- [Risk] Algorithm metadata loading could increase production bundle work. -> Mitigation: lazy-load the layout settings panel only in editor dev mode.
- [Risk] Changing algorithms while DBML is unchanged could be skipped by the existing cache. -> Mitigation: include the selected algorithm id in the layout cache key.
- [Risk] Non-layered algorithms may omit routed edge sections or ignore port constraints. -> Mitigation: preserve existing empty-route fallback behavior and cover layout invocation with tests.
- [Risk] Locally curated enum values can drift from future ELK releases. -> Mitigation: keep the curated list small and focused, and continue sourcing algorithm metadata from the installed bundle.
- [Risk] The debug selector could be mistaken for a supported user feature. -> Mitigation: keep it in the development-only inspector and avoid adding it to the diagram header in this change.

## Migration Plan

1. Add editor-local layout algorithm setting types and the default layered algorithm id.
2. Update layout computation to accept a selected algorithm id.
3. Update `useDbmlDocument` to own algorithm state and relayout when it changes.
4. Add a development-only inspector activity for layout settings.
5. Add curated option controls and pass their values into layout computation.
6. Add tests for dev-only visibility, algorithm selection, option selection, and layout recomputation.

Rollback is local to the editor page: remove the settings activity, restore the fixed layout options, and remove algorithm id from the layout cache key.

## Open Questions

- Which algorithms, if any, should later become user-facing controls after manual experimentation?
- Should promoted user-facing algorithms get per-algorithm option profiles rather than sharing the current default spacing/routing options?
