## 1. Proxy Collision Semantics

- [x] 1.1 Add tests that reproduce a proxy avoiding its own represented original table when active-node avoidance is enabled
- [x] 1.2 Update the legacy proxy layout strategy so each proxy ignores obstacles whose id matches `proxy.table.id`
- [x] 1.3 Verify proxies still avoid other active table obstacles

## 2. Transition Strategy Model

- [x] 2.1 Add proxy transition mode types and normalization for `none`, `opacity`, and `morph`
- [x] 2.2 Add a transition strategy interface that consumes proxy layout, viewport, and original table visibility data separately from proxy layout strategy
- [x] 2.3 Implement the `none` transition strategy as current immediate proxy visibility behavior
- [x] 2.4 Implement the `opacity` transition strategy using original table visibility progress while preserving computed proxy layout
- [x] 2.5 Route `morph` mode through the transition strategy surface with a fallback to `none` until the later morph implementation phase

## 3. Editor Settings Integration

- [x] 3.1 Add proxy transition mode to editor settings store defaults, persisted state, and normalization
- [x] 3.2 Add a Settings panel control for `None`, `Opacity`, and `Morph`
- [x] 3.3 Pass the selected proxy transition mode from the editor workspace to the diagram preview

## 4. Verification

- [x] 4.1 Add or update unit tests for proxy transition mode normalization and persistence behavior
- [x] 4.2 Add or update diagram preview tests for `none`, `opacity`, and `morph` fallback behavior
- [x] 4.3 Run targeted proxy/settings tests, frontend typecheck, lint, and format checks

## 5. Deferred Morph Phase

- [x] 5.1 Leave morph overlay animation implementation for a later OpenSpec change
