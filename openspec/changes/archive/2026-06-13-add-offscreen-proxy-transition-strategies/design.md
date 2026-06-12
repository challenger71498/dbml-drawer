## Context

Offscreen relation proxies are generated for directly connected tables that are outside the current viewport. A legacy proxy layout strategy computes card positions, optionally avoiding active table obstacles, and the editor settings panel controls whether proxies are enabled, how proxy lines connect, how proxy cards are placed, and when originals are considered visible.

The current active-node avoidance treats every active table obstacle equally. Because a proxy card represents an original rendered table, avoiding that same original table makes the proxy feel detached during the viewport handoff. Separately, proxy visibility currently behaves as a hard show/hide decision, so the proxy disappears abruptly when the original table becomes visible enough.

## Goals / Non-Goals

**Goals:**
- Prevent a proxy from avoiding the same original table it represents.
- Keep avoidance behavior for other active tables unchanged.
- Introduce a transition strategy boundary that is separate from proxy layout strategy.
- Add a persisted proxy transition setting with `none`, `opacity`, and `morph` modes.
- Implement `none`, `opacity`, and `morph` transition modes in this change.

**Non-Goals:**
- Do not replace the morph strategy with a separate overlay clone animation in this phase.
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

### Morph Uses Screen-Rect Interpolation

`morph` should remain inside the transition strategy layer, not the proxy layout layer. The strategy should interpolate the proxy card's screen rect toward the represented original table's screen rect as the original closely approaches the viewport. Morph mode should override the regular `any-overlap` / `center` proxy visibility rule and keep the proxy available until the represented original table is about 80% visible. The strategy may also expose handoff progress so relation endpoints can transition from the compact proxy column port to the corresponding column port within the morphing proxy card during the initial morph handoff.

The opacity and morph transition modes should both use the same proxy completion point: the proxy remains available until the represented original table is about 80% visible. The UI should avoid stretching a compact proxy card into the original table shape. During morph handoff, the compact proxy content should fade out while the represented original table content fades in, so the transition feels like the original node is being revealed rather than a small card being distorted. Morph should not fade the whole proxy card. While a non-opacity proxy exists, the represented original React Flow node should remain hidden to prevent duplicate table visuals. Opacity mode is the exception: it should fade the represented original node in while the proxy fades out.

### Use Visibility Progress For Opacity

The opacity strategy should derive a stable visibility progress from the original table's screen rect and the viewport rect. It should fade the proxy as the represented original table becomes sufficiently visible, while still honoring the existing setting that controls when proxies are removed.

The exact thresholds can be implementation constants, but the behavior should avoid flicker:

- Fully offscreen or barely visible: proxy opacity remains `1`.
- Handoff range: proxy opacity transitions toward `0`.
- Once the existing visibility rule says the original is visible enough, the proxy is no longer rendered.

## Risks / Trade-offs

- [Risk] Opacity transition could flicker near threshold boundaries while panning slowly. → Keep thresholds simple and deterministic, and avoid mutating proxy generation visibility semantics in the same pass.
- [Risk] Morphing a compact proxy into a full table can make the card content look compressed near the original. → Keep the behavior scoped to the handoff range and use opacity during the final morph interval.
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
