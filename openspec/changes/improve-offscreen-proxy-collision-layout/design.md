## Context

Offscreen relation proxy layout is currently implemented by `legacyOffscreenRelationProxyLayoutStrategy`. The strategy starts from either line-based or parallel placement, then applies several greedy passes: obstacle avoidance, same-side proxy stacking, adjacent-side overlap adjustment, and another obstacle/stack pass. This can reintroduce collisions that an earlier pass avoided because safe areas, active nodes, and other proxy cards are not solved as one constraint set.

The proxy flow module already separates proxy candidate selection, layout, obstacle collection, transitions, endpoint overrides, and flow element adaptation. This change can therefore add a new layout strategy without changing proxy generation, visual rendering, or transition behavior.

## Goals / Non-Goals

**Goals:**

- Keep the existing legacy collision behavior available.
- Add an explicit collision layout option that can select legacy or constrained collision handling.
- Implement constrained collision handling without adding a runtime dependency.
- Treat safe areas and other active nodes as hard placement obstacles when feasible.
- Resolve proxy-proxy overlap after obstacle constraints are known, rather than through independent greedy passes.
- Cover the new strategy with focused layout tests.

**Non-Goals:**

- Do not change offscreen proxy candidate selection, visibility modes, placement modes, transitions, line endpoint overrides, or overlay UI rendering.
- Do not introduce a general-purpose physics simulation or graph layout engine.
- Do not guarantee a perfect non-overlapping layout when the viewport does not have enough usable space for all proxies.
- Do not make the constrained strategy the only available strategy in this change.

## Decisions

### Add collision strategy as layout options

Add an `OffscreenRelationProxyCollisionMode` setting with `legacy` and `constrained` values. `createDbmlDiagramFlowProxyState` will receive the mode and pass it to the layout strategy. Editor settings will expose the mode next to the existing proxy placement, visibility, and transition controls, while the persisted default remains `legacy`.

Alternative considered: replace the legacy implementation directly. This was rejected because proxy layout is visual and viewport-sensitive; keeping legacy selectable lowers rollout risk and gives tests a direct compatibility boundary.

### Implement constrained layout as deterministic 1D packing

Each proxy remains tied to its selected side. For left/right proxies, the movable axis is vertical. For top/bottom proxies, the movable axis is horizontal unless parallel placement already chooses vertical stacking behavior for that side. The constrained algorithm will:

1. compute the raw desired position from the selected placement mode,
2. derive per-proxy forbidden intervals from safe areas and active-node obstacles, excluding the proxy's represented original table,
3. convert forbidden intervals to allowed intervals on the movable axis,
4. assign proxy positions in side groups so proxy-proxy gaps are respected within the allowed intervals,
5. use a deterministic fallback when the requested constraints cannot all fit.

Alternative considered: use `d3-force`, WebCola, ELK, or Cassowary. This was rejected for this change because the problem is a small edge-constrained label-placement problem, not a full graph layout or continuous physics simulation. A focused solver is easier to test and avoids dependency cost.

### Use hard constraints first, soft distance second

Safe areas and other active nodes are treated as hard obstacles when feasible. Proxy-proxy spacing is then resolved inside those available intervals. If a full solution is impossible, the fallback should minimize hard-obstacle overlap before minimizing proxy-proxy overlap and distance from the desired raw position.

Alternative considered: repeatedly rerun the existing greedy passes until stable. This was rejected because it can still oscillate or converge to a result whose priority is implicit in pass order rather than explicit in scoring.

### Keep transition after layout

Transition modes remain a presentation step after layout. The constrained strategy will improve the source layout for `none` and `opacity`; `morph` can still move cards during handoff because morph intentionally interpolates toward the original table. This change does not try to make morph interpolation globally collision-free.

## Risks / Trade-offs

- A constrained layout can still fail in tiny viewports or with too many proxies -> Use deterministic fallback and tests that define priority rather than promising impossible non-overlap.
- Strategy option plumbing adds settings surface area -> Place it inside the existing offscreen relation proxy settings group so it does not introduce a new settings section.
- New algorithm may differ from existing visual placement -> Preserve raw placement inputs and only adjust along the movable axis.
- Morph transitions can reintroduce overlap after layout -> Document this as out of scope and keep transition behavior independent.

## Migration Plan

1. Add collision mode types and default normalization where editor settings are defined.
2. Expose collision mode in the editor settings panel and persist the selection.
3. Pass the selected/default collision mode into proxy layout creation.
4. Add constrained collision layout implementation alongside the legacy path.
5. Add unit tests for both strategy selection and constrained collision behavior.
6. Run the proxy and editor test suites affected by the change.

## Open Questions

- Should the constrained collision mode become the UI default after tests prove behavior across real diagrams?
- Should impossible layouts hide lower-priority proxies in a future change instead of allowing controlled overlap?
