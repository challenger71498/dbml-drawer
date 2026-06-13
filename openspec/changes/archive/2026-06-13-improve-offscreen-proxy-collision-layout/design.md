## Context

Offscreen relation proxy layout is currently implemented by `legacyOffscreenRelationProxyLayoutStrategy`. The strategy starts from either line-based or parallel placement, then applies several greedy passes: obstacle avoidance, same-side proxy stacking, adjacent-side overlap adjustment, and another obstacle/stack pass. This can reintroduce collisions that an earlier pass avoided because safe areas, active nodes, and other proxy cards are not solved as one constraint set.

The proxy flow module already separates proxy candidate selection, layout, obstacle collection, transitions, endpoint overrides, and flow element adaptation. This change can therefore add a new layout strategy without changing proxy generation, visual rendering, or transition behavior.

## Goals / Non-Goals

**Goals:**

- Keep the existing legacy collision behavior available.
- Add an explicit collision layout option that can select legacy, iterative, or score handling.
- Implement iterative and score collision handling without adding a runtime dependency.
- Treat safe areas and other active nodes as hard placement obstacles when feasible.
- Resolve proxy-proxy overlap after obstacle constraints are known, rather than through independent greedy passes.
- Cover the new strategy with focused layout tests.

**Non-Goals:**

- Do not change offscreen proxy candidate selection, visibility modes, placement modes, transitions, line endpoint overrides, or overlay UI rendering.
- Do not introduce a general-purpose physics simulation or graph layout engine.
- Do not guarantee a perfect non-overlapping layout when the viewport does not have enough usable space for all proxies.
- Do not make the iterative strategy the only available strategy in this change.

## Decisions

### Add collision strategy as layout options

Add an `OffscreenRelationProxyCollisionMode` setting with `legacy`, `iterative`, and `score` values. `createDbmlDiagramFlowProxyState` will receive the mode and pass it to the layout strategy. Editor settings will expose the mode next to the existing proxy placement, visibility, and transition controls, while the persisted default remains `legacy`. Existing persisted `constrained` values normalize to `iterative`.

Alternative considered: replace the legacy implementation directly. This was rejected because proxy layout is visual and viewport-sensitive; keeping legacy selectable lowers rollout risk and gives tests a direct compatibility boundary.

### Split collision strategies into legacy, iterative, and score modes

The collision option will expose three strategies:

- `legacy`: the original greedy pass layout.
- `iterative`: the current iterative group/intent/lane based resolver.
- `score`: a global candidate scoring resolver that chooses positions by minimizing hard obstacle overlap, proxy overlap, priority violations, and movement distance.

Existing `constrained` persisted values normalize to `iterative`.

### Implement iterative layout as deterministic intent-aware packing

Each proxy starts from the selected placement mode's raw screen position, clamped into the viewport. The iterative strategy then keeps the horizontal position fixed and resolves collisions by moving proxy cards vertically, regardless of whether the proxy originated from the left, right, top, or bottom side. The iterative algorithm will:

1. compute the raw desired position from the selected placement mode,
2. preserve whether each proxy's unclamped vertical target would overflow above or below the viewport,
3. group proxy cards whose raw rectangles actually overlap, using connected collision components,
4. infer each group intent from the proxies' vertical overflow direction and magnitude,
5. assign vertical stack positions inside each collision group so proxy-proxy gaps are respected where feasible,
6. split lower-priority proxy cards into secondary horizontal lanes when one vertical stack cannot fit within the viewport,
7. use a deterministic fallback when the requested constraints cannot all fit.

Alternative considered: use `d3-force`, WebCola, ELK, or Cassowary. This was rejected for this change because the problem is a small edge-constrained label-placement problem, not a full graph layout or continuous physics simulation. A focused solver is easier to test and avoids dependency cost.

### Implement score layout as global candidate selection

The score strategy will generate a bounded candidate set for each proxy from raw placement, edge-aligned positions, obstacle-adjacent positions, proxy-adjacent positions, and secondary horizontal lane positions. It will then assign proxies in priority order while scoring each candidate against all hard obstacles and all already placed proxies. The score function prioritizes:

1. avoiding safe-area and active-node obstacles,
2. avoiding proxy-proxy overlap,
3. preserving top/bottom edge priority,
4. minimizing movement from the raw placement.

This is not a full combinatorial optimizer. It is a deterministic global scoring pass with bounded candidates so the strategy can be tested and kept runtime-cheap.

### Use hard constraints first, soft distance second

Safe areas and other active nodes are treated as hard obstacles when feasible. Proxy-proxy spacing is then resolved inside those available intervals. If a full solution is impossible, the fallback should minimize hard-obstacle overlap before minimizing proxy-proxy overlap and distance from the desired raw position.

Alternative considered: repeatedly rerun the existing greedy passes until stable. This was rejected because it can still oscillate or converge to a result whose priority is implicit in pass order rather than explicit in scoring.

### Keep transition after layout

Transition modes remain a presentation step after layout. The iterative strategy will improve the source layout for `none` and `opacity`; `morph` can still move cards during handoff because morph intentionally interpolates toward the original table. This change does not try to make morph interpolation globally collision-free.

## Risks / Trade-offs

- Iterative and score layouts can still fail in tiny viewports or with too many proxies -> Use deterministic fallback and tests that define priority rather than promising impossible non-overlap.
- Strategy option plumbing adds settings surface area -> Place it inside the existing offscreen relation proxy settings group so it does not introduce a new settings section.
- New algorithm may differ from existing visual placement -> Preserve raw horizontal placement inputs and adjust only vertically until a stack cannot fit, then use deterministic secondary horizontal lanes.
- Morph transitions can reintroduce overlap after layout -> Document this as out of scope and keep transition behavior independent.

## Migration Plan

1. Add collision mode types and default normalization where editor settings are defined.
2. Expose collision mode in the editor settings panel and persist the selection.
3. Pass the selected/default collision mode into proxy layout creation.
4. Add iterative and score layout implementations alongside the legacy path.
5. Add unit tests for strategy selection and iterative/score collision behavior.
6. Run the proxy and editor test suites affected by the change.

## Open Questions

- Should the iterative or score collision mode become the UI default after tests prove behavior across real diagrams?
- Should impossible layouts hide lower-priority proxies in a future change instead of allowing controlled overlap?
