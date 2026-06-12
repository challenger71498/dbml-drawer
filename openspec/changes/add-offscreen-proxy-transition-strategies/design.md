## Context

Offscreen relation proxies are generated for directly connected tables that are outside the current viewport. A legacy proxy layout strategy computes card positions, optionally avoiding active table obstacles, and the editor settings panel controls whether proxies are enabled, how proxy lines connect, how proxy cards are placed, and when originals are considered visible.

The current active-node avoidance treats every active table obstacle equally. Because a proxy card represents an original rendered table, avoiding that same original table makes the proxy feel detached during the viewport handoff. Separately, proxy visibility currently behaves as a hard show/hide decision, so the proxy disappears abruptly when the original table becomes visible enough.

## Goals / Non-Goals

**Goals:**
- Prevent a proxy from avoiding the same original table it represents.
- Keep avoidance behavior for other active tables unchanged.
- Introduce a transition strategy boundary that is separate from proxy layout strategy.
- Add a persisted proxy transition setting with `none`, `opacity`, and `morph` modes.
- Implement `none` and `opacity` transition modes in this change.
- Keep `morph` as a deferred phase with a stable option and strategy surface.

**Non-Goals:**
- Do not implement the visual morph overlay in this phase.
- Do not replace the existing legacy proxy layout strategy or collision algorithm.
- Do not change the meaning of the existing proxy visibility mode setting.
- Do not move original React Flow nodes or alter automatic diagram layout.

## Decisions

### Separate Layout Strategy From Transition Strategy

Proxy layout decides where a visible proxy card should be placed. Proxy transition decides how that placed card visually hands off to the original rendered node. These responsibilities should remain separate:

- Layout strategy input: proxies, viewport, layout obstacles, placement options.
- Transition strategy input: proxy layout, original table screen rect, viewport rect, visibility progress.
- Transition strategy output: render decision and presentation adjustments such as opacity.

This avoids adding handoff behavior to the already complex legacy collision pass, and leaves room for future collision solvers or future morph animation without changing the proxy generation model again.

### Exclude Self Obstacles Per Proxy

Active-node avoidance should filter obstacles per proxy:

- If `obstacle.id === proxy.table.id`, that obstacle is ignored for that proxy.
- Other active obstacles still apply.

This keeps the global obstacle list simple while making the semantic exception local to the proxy being placed.

### Treat Morph As A Deferred Strategy

`morph` should be exposed as a mode and represented in types/settings, but the strategy may initially fall back to `none` or be marked as not implemented in task scope. The actual morph phase likely needs overlay clone rendering, animation state, and viewport/node rect coordination, which is larger than the self-collision and opacity handoff fix.

### Use Visibility Progress For Opacity

The opacity strategy should derive a stable visibility progress from the original table's screen rect and the viewport rect. It should fade the proxy as the represented original table becomes sufficiently visible, while still honoring the existing setting that controls when proxies are removed.

The exact thresholds can be implementation constants, but the behavior should avoid flicker:

- Fully offscreen or barely visible: proxy opacity remains `1`.
- Handoff range: proxy opacity transitions toward `0`.
- Once the existing visibility rule says the original is visible enough, the proxy is no longer rendered.

## Risks / Trade-offs

- [Risk] Opacity transition could flicker near threshold boundaries while panning slowly. → Keep thresholds simple and deterministic, and avoid mutating proxy generation visibility semantics in the same pass.
- [Risk] Adding `morph` as a selectable option before full implementation could confuse users. → Scope it as a strategy surface and setting value, but document the implementation phase split; if necessary, hide or disable it until implementation.
- [Risk] The legacy layout strategy is already complex. → Keep self-obstacle filtering local and tested, and do not restructure collision passes in this change.
- [Risk] Persisted settings may contain unknown transition values. → Normalize unknown values to the default transition mode.

## Migration Plan

- Add a new proxy transition setting with a default of `none`.
- Normalize persisted values so existing users retain current behavior.
- Introduce transition strategy utilities without changing proxy layout output contracts more than necessary.
- Add tests for self-obstacle exclusion, setting normalization, and opacity behavior.

## Open Questions

- Should the `morph` option be visible in settings before the implementation phase, or should it exist only in model/types until implemented?
- What exact opacity threshold feels best for the handoff range after testing against dense enterprise diagrams?
