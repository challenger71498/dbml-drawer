## 1. Collision Strategy Wiring

- [x] 1.1 Add an offscreen relation proxy collision mode type with `legacy` and `constrained` values.
- [x] 1.2 Pass the selected collision mode through editor proxy state creation into the layout strategy while preserving the current legacy default.

## 2. Constrained Layout Implementation

- [x] 2.1 Implement constrained proxy layout selection alongside the existing legacy layout path.
- [x] 2.2 Convert safe-area and active-node obstacles into per-proxy forbidden intervals on the movable axis.
- [x] 2.3 Resolve proxy-proxy overlap inside available intervals with deterministic fallback behavior.

## 3. Verification

- [x] 3.1 Add focused unit tests for strategy selection, hard obstacle avoidance, proxy-proxy overlap resolution, and impossible-space fallback.
- [x] 3.2 Run the affected frontend proxy test suite and OpenSpec validation for the change.

## 4. Settings Exposure

- [x] 4.1 Expose the proxy collision strategy in persisted editor settings and the settings panel.
- [x] 4.2 Pass the persisted collision strategy from the editor page into the diagram preview.
- [x] 4.3 Add settings persistence and settings panel tests for the proxy collision strategy.
