## 1. Proxy Collision Semantics

- [x] 1.1 Add tests that reproduce a proxy avoiding its own represented original table when active-node avoidance is enabled
- [x] 1.2 Update the legacy proxy layout strategy so each proxy ignores obstacles whose id matches `proxy.table.id`
- [x] 1.3 Verify proxies still avoid other active table obstacles

## 2. Transition Strategy Model

- [x] 2.1 Add proxy transition mode types and normalization for `none`, `opacity`, and `morph`
- [x] 2.2 Add a transition strategy interface that consumes proxy layout, viewport, and original table visibility data separately from proxy layout strategy
- [x] 2.3 Implement the `none` transition strategy as current immediate proxy visibility behavior
- [x] 2.4 Implement the `opacity` transition strategy using original table visibility progress while preserving computed proxy layout
- [x] 2.5 Route `morph` mode through the transition strategy surface

## 3. Editor Settings Integration

- [x] 3.1 Add proxy transition mode to editor settings store defaults, persisted state, and normalization
- [x] 3.2 Add a Settings panel control for `None`, `Opacity`, and `Morph`
- [x] 3.3 Pass the selected proxy transition mode from the editor workspace to the diagram preview

## 4. Verification

- [x] 4.1 Add or update unit tests for proxy transition mode normalization and persistence behavior
- [x] 4.2 Add or update diagram preview tests for `none`, `opacity`, and `morph` behavior
- [x] 4.3 Run targeted proxy/settings tests, frontend typecheck, lint, and format checks

## 5. Morph Transition

- [x] 5.1 Implement morph transition layout interpolation toward the original table screen rect
- [x] 5.2 Interpolate proxy relation endpoints toward morphing proxy column ports during morph handoff
- [x] 5.3 Crossfade compact proxy content into represented original table content during morph handoff
- [x] 5.4 Keep morph proxies visible until represented original tables are about 80% visible
- [x] 5.5 Smooth relation endpoints from compact proxy ports to morphing proxy column ports during the initial morph interval
- [x] 5.6 Hide represented original nodes while proxies are rendered
- [x] 5.7 Fade represented original nodes in while opacity proxies fade out
- [x] 5.8 Align opacity transition completion visibility with morph
- [x] 5.9 Add or update tests for transition behavior
