## 1. Settings State

- [x] 1.1 Add an editor preference model for the offscreen relation proxy enabled state with local storage persistence and disabled default.
- [x] 1.2 Add the offscreen relation proxy toggle to the Settings panel using existing themed form control patterns.
- [x] 1.3 Pass the resolved offscreen proxy setting from the editor page into the diagram preview.
- [x] 1.4 Add a persisted editor preference for connecting represented relation lines to visible proxy cards.
- [x] 1.5 Add a persisted editor preference for choosing offscreen relation proxy placement mode.

## 2. Proxy Derivation

- [x] 2.1 Add helpers that derive focused direct relation context, connected offscreen tables, represented relation ids, and connected columns per proxy.
- [x] 2.2 Track diagram viewport bounds from React Flow pan/zoom changes without resetting the user's viewport.
- [x] 2.3 Determine whether each connected table intersects the current viewport using rendered node bounds and zoom-aware viewport conversion.
- [x] 2.4 Deduplicate multiple relations to the same offscreen table and aggregate connected columns for a single proxy card.

## 3. Proxy Rendering and Interaction

- [x] 3.1 Render compact proxy cards as overlay UI inside the diagram surface only when the feature is enabled and a focused target exists.
- [x] 3.2 Position proxy cards on the focused-to-original table line inside the viewport and stack multiple proxies without overlapping the activity controls.
- [x] 3.3 Render table name and connected columns while omitting unrelated column summaries.
- [x] 3.4 Wire proxy hover to highlight represented relations without replacing the focused target.
- [x] 3.5 Wire proxy activation to pan or center the viewport on the original rendered table.
- [x] 3.6 Scale proxy cards with the current diagram viewport zoom level.
- [x] 3.7 Reroute represented relation edge endpoints to visible proxy cards when the proxy line connection setting is enabled.
- [x] 3.8 Connect proxy-rerouted relation lines to represented column row port positions.
- [x] 3.9 Support line-based and parallel-translated proxy placement modes with vertical overlap resolution for parallel mode.

## 4. Verification

- [x] 4.1 Add unit tests for proxy derivation, offscreen detection, and column aggregation.
- [x] 4.2 Add component tests for Settings toggle default/persistence and diagram preview proxy visibility.
- [x] 4.3 Add component tests for proxy hover relation highlighting and proxy click navigation.
- [x] 4.4 Run OpenSpec validation, frontend typecheck, lint, format check, and targeted tests.
