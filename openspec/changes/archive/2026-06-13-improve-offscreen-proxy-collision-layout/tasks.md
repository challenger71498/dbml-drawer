## 1. Collision Strategy Wiring

- [x] 1.1 Add an offscreen relation proxy collision mode type with `legacy`, `iterative`, and `score` values.
- [x] 1.2 Pass the selected collision mode through editor proxy state creation into the layout strategy while preserving the current legacy default.

## 2. Iterative Layout Implementation

- [x] 2.1 Implement iterative proxy layout selection alongside the existing legacy layout path.
- [x] 2.2 Convert safe-area and active-node obstacles into per-proxy forbidden intervals on the movable axis.
- [x] 2.3 Resolve proxy-proxy overlap inside available intervals with deterministic fallback behavior.

## 3. Verification

- [x] 3.1 Add focused unit tests for strategy selection, hard obstacle avoidance, proxy-proxy overlap resolution, and impossible-space fallback.
- [x] 3.2 Run the affected frontend proxy test suite and OpenSpec validation for the change.

## 4. Settings Exposure

- [x] 4.1 Expose the proxy collision strategy in persisted editor settings and the settings panel.
- [x] 4.2 Pass the persisted collision strategy from the editor page into the diagram preview.
- [x] 4.3 Add settings persistence and settings panel tests for the proxy collision strategy.

## 5. Unified Vertical Collision Packing

- [x] 5.1 Update iterative handling to group proxy cards by horizontal overlap instead of side.
- [x] 5.2 Resolve iterative proxy-proxy overlap by moving cards vertically while keeping horizontal positions unchanged.
- [x] 5.3 Add regression tests for lower-edge upward stacking and corner overlap vertical stacking.

## 6. Vertical Overflow Intent

- [x] 6.1 Preserve each proxy card's unclamped vertical target and overflow magnitude in iterative layout.
- [x] 6.2 Infer horizontal-overlap group stack intent from top/bottom overflow and use edge-anchored stacking when feasible.
- [x] 6.3 Add regression tests for bottom overflow intent preserving bottom-anchored stacking.

## 7. Secondary Horizontal Lane Fallback

- [x] 7.1 Split an iterative horizontal-overlap group into secondary horizontal lanes when one vertical stack cannot fit in the viewport.
- [x] 7.2 Keep stronger group-direction overflow proxy cards in the primary lane before moving lower-priority cards.
- [x] 7.3 Add regression tests for overflowing vertical stacks using secondary horizontal lanes.

## 8. Actual Collision Grouping

- [x] 8.1 Update iterative initial grouping to use actual raw rectangle overlap connected components instead of horizontal-range overlap alone.
- [x] 8.2 Keep non-colliding proxy cards independent even when they share the same horizontal range.
- [x] 8.3 Add regression tests for same-horizontal-range proxy cards that do not actually overlap.

## 9. Boundary Position Handling

- [x] 9.1 Treat single-point allowed intervals at viewport bounds as valid iterative positions.
- [x] 9.2 Add a regression test for bottom-intent proxy stacks preserving the exact lower edge-gap position.

## 10. Edge-Side Stack Priority

- [x] 10.1 Update iterative stack ordering so top-side proxies prefer upper stack slots and bottom-side proxies prefer lower stack slots.
- [x] 10.2 Add regression tests for left/bottom corner overlap preserving bottom-side proxy priority.

## 11. Iterative and Score Strategy Split

- [x] 11.1 Rename the constrained legacy alias mode to `iterative` while normalizing existing `constrained` values to `iterative`.
- [x] 11.2 Add `score` as a selectable collision mode in settings, persistence, and preview layout options.
- [x] 11.3 Add focused tests for iterative mode selection and legacy constrained-value normalization.

## 12. Score-Based Collision Strategy

- [x] 12.1 Implement a score collision layout path with bounded per-proxy candidate positions.
- [x] 12.2 Score hard obstacle overlap, proxy overlap, top/bottom priority, and movement distance deterministically.
- [x] 12.3 Add regression tests for score mode avoiding proxy collisions and hard obstacles.
