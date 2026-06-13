## Context

The diagram model creates two stable ports for every column: left and right. Relations currently choose endpoints during diagram creation with a fixed policy: the first DBML ref endpoint uses the source column's right port and the second endpoint uses the target column's left port. ELK then routes edges from those fixed ports, and React Flow, offscreen proxy line overrides, selection highlighting, and export rendering consume the routed relation geometry.

This works well for left-to-right layered layouts, but it produces avoidable cross-table wrapping when the layout algorithm places the related table on the same side as the fixed port, or when non-layered algorithms arrange tables more freely. Self-reference relations also need explicit handling because a nearest-side policy can otherwise collapse into ambiguous left/right choices on the same column.

## Goals / Non-Goals

**Goals:**

- Add a persisted editor setting for relation port routing mode.
- Keep the current fixed source-right to target-left behavior as the default.
- Add a nearest-port routing mode that uses the side ports facing the related table after table positions are known.
- Route same-table self-reference relations as right-to-right when nearest-port routing is enabled.
- Ensure relation edge handles, route start/end points, active relation direction, proxy line overrides, and export paths use the selected endpoint geometry consistently.
- Trigger relayout/rebuild when the port routing setting changes for the same valid DBML document.

**Non-Goals:**

- Do not change DBML parsing, endpoint cardinality, relation source/target semantics, or source/reference highlight colors.
- Do not add top/bottom column ports in this change.
- Do not change the default layout algorithm or existing fixed routing behavior.
- Do not add per-relation manual endpoint selection.
- Do not introduce a new graph layout dependency.

## Decisions

### Add an explicit relation port routing mode

Add a small rendering/layout setting type such as `DbmlRelationPortRoutingMode = 'fixed' | 'nearest'`. `fixed` preserves the existing behavior and remains the default for new and existing users. `nearest` enables layout-position-aware endpoint selection.

Alternative considered: add a boolean such as `useNearestPorts`. A named mode is clearer in settings, easier to normalize from persisted storage, and leaves room for future modes such as manual or orthogonal-only routing.

### Apply nearest routing after initial table layout

Nearest-port routing needs table positions. The implementation should first produce the normal diagram and layout result, then adjust relation endpoint port ids and route endpoints based on the layouted table and column port positions, then re-run ELK with the selected ports so routed bend points match the new endpoints.

The nearest policy should compare the source and target table center X positions. If the target table is left of the source table, the source endpoint should use the source column's left port and the target endpoint should use the target column's right port. Otherwise, including exact horizontal alignment, the source endpoint should use the source column's right port and the target endpoint should use the target column's left port.

Alternative considered: choose ports before layout from DBML endpoint roles alone. That cannot know which side is closer once the chosen layout algorithm positions tables.

### Special-case self-reference relations

When `nearest` is enabled and a relation connects columns within the same table, force both endpoints to the participating columns' right ports. This produces a stable right-side loop for self-referential table relations such as `parent_id > id` and avoids nearest-side choices that would cross through the table card.

For relations between different tables, use the regular nearest pair selection.

### Preserve relation direction semantics

Changing ports must not change relation source/target identity. The relation source column and target column ids, cardinality metadata, active relation gradient direction, dynamic marker direction, and endpoint role column highlights should continue to use the original DBML relation endpoint semantics. Only the chosen physical port ids and route geometry change.

### Persist the option with editor settings

The option belongs with diagram rendering preferences because it changes visual routing rather than DBML content. Add it to the existing editor settings store, persisted settings normalization, and settings UI. Changing it should update the current preview for the current valid DBML document and should survive reload through local browser storage.

The diagram layout cache key must include the selected routing mode. Otherwise switching the setting would not recompute a route for unchanged DBML text and layout algorithm settings.

### Keep downstream consumers geometry-driven

React Flow edges should use the relation's selected port ids for `sourceHandle` and `targetHandle`. Static export rendering should continue to draw from the routed relation start/end points. Offscreen proxy line overrides should preserve their existing override behavior while treating the selected original endpoint geometry as the baseline.

## Risks / Trade-offs

- Nearest routing may require an additional ELK pass after table positions are known -> Keep the pass scoped to `nearest` mode and avoid it for the default fixed mode.
- Non-layered algorithms may move tables between passes -> Use the first pass only to select ports, then trust the second pass as the rendered layout; tests should focus on selected endpoint ids and visible route endpoints rather than pixel-perfect positions.
- Exact horizontal alignment can otherwise be ambiguous -> Use the fixed right-to-left pair for deterministic behavior.
- Existing persisted settings will not include the new mode -> Normalize missing or invalid values to `fixed`.
- Export and proxy line code may assume right-to-left endpoints -> Add targeted tests around export path generation and proxy endpoint overrides where endpoint side matters.

## Migration Plan

1. Add the routing mode type, default, normalization helper, and persisted editor setting.
2. Pass the selected routing mode into the DBML document layout pipeline and include it in the layout cache key.
3. Add relation endpoint selection helpers and apply them during layout.
4. Update React Flow mapping and any path helpers that currently assume source right and target left.
5. Add settings UI controls and tests for persistence and relayout behavior.
6. Add focused diagram/export/proxy tests for nearest routing and same-table self-reference right-to-right routing.
