## Context

The DBML diagram preview already tracks focused and hovered diagram targets and derives connected relation/table/column context for highlighting. In dense diagrams, ELK can place directly related tables far outside the visible viewport. Current highlights still identify the relation path, but the user must pan away from the focused table to inspect the offscreen endpoint.

The desired UX is not to move the original diagram node. The layout and user's spatial memory should remain stable. Instead, the preview should render compact, viewport-local proxies for offscreen connected tables when the user has explicitly enabled the feature in Settings.

## Goals / Non-Goals

**Goals:**

- Preserve the existing diagram layout and viewport unless the user explicitly navigates to a proxy's original table.
- Show compact proxy cards for directly connected offscreen tables while a table or column is focused.
- Include only relation-connected columns in each proxy.
- Keep proxy hover/click behavior aligned with existing relation highlight and focus semantics.
- Keep the feature disabled by default and controlled from the Settings sidebar panel.
- Allow users to opt into drawing represented relation lines toward proxy cards while proxies are visible.
- Allow users to choose between line-based proxy placement and parallel-translated proxy placement.

**Non-Goals:**

- Re-layout the diagram around the focused node.
- Move or duplicate real React Flow nodes in the graph data.
- Render full table clones with all columns.
- Show proxies for transient hover-only targets.
- Add minimap, global search, or multi-hop dependency exploration in this change.

## Decisions

### Render proxies as viewport overlay UI

Offscreen relation proxies will be rendered as overlay UI anchored to the diagram surface, not as additional React Flow nodes.

Rationale:

- The proxy is a navigation and context affordance, not a diagram entity.
- Keeping it out of `nodes` avoids ELK/layout interaction, edge routing changes, selection confusion, and graph data churn.
- Overlay positioning can be based on current viewport bounds and can stay stable as the user pans or zooms.

Alternative considered: add proxy nodes and temporary edges to React Flow. This would reuse node rendering and edge interactions, but it would make proxies look and behave too much like real schema nodes and would require filtering them out of layout, selection, source reveal, tests, and any future export logic.

### Derive proxies only from focused direct relations

Proxy candidates will be derived from the current `focusedTarget`, not from hover-only state. For each direct relation connected to the focused table or column, the opposite endpoint table is a candidate. A candidate becomes visible only when the original table bounds are outside the current viewport.

Rationale:

- Focus is a deliberate user action and can safely introduce extra UI.
- Hover-based proxies would flicker and compete with existing hover highlight behavior.
- Direct relation scope keeps the first version predictable and avoids overwhelming dense schemas.

### Use compact table summaries

Each proxy card will show:

- table name,
- only the columns that participate in the focused relation context.

Rationale:

- The user needs endpoint context, not a full table inspection surface.
- Showing only connected columns keeps proxies small enough for edge placement and stacking.
- Matching the normal table node structure keeps scanning consistent, while a muted header distinguishes the proxy from the original node.

### Place proxies on the focused-to-original line

Each proxy will be positioned at the point where the line from the focused table center to the offscreen original table center reaches the current viewport boundary. The card is then offset inward from that boundary while preserving the visual direction toward the original table.

Rationale:

- The proxy should feel like the offscreen table has been pulled into the viewport along its real spatial direction.
- This gives a stronger relation cue than simply stacking cards by viewport edge.
- It preserves the original layout while reducing the need to pan back and forth.

### Support parallel-translated placement

When the placement mode is set to parallel, the proxy will be translated into the viewport while preserving one axis of the original table's screen position:

- left/right originals keep their vertical screen position and move horizontally to the nearest viewport side,
- top/bottom originals keep their horizontal center position and move vertically to the nearest viewport side,
- overlap avoidance separates proxy cards vertically.

Rationale:

- Parallel translation keeps the proxy closer to the original table's projected screen coordinate.
- Vertical overlap resolution keeps the stack behavior consistent across all sides.
- Keeping line-based placement as the default preserves the current behavior for existing users.

### Navigate explicitly to originals

Clicking a proxy will pan or center the viewport on the original table. Rendering the proxy itself MUST NOT change the viewport. The existing DBML source reveal behavior should remain tied to focusing real rendered table/column nodes, not merely seeing a proxy.

Rationale:

- This matches the recent viewport preservation behavior: automatic renderer updates should not reset user position.
- Proxy navigation is an explicit user action.

### Connect relation lines to proxies as an optional rendering override

When enabled, relation edges represented by visible proxies will replace the offscreen endpoint coordinates with a proxy-card edge point. This affects only edge rendering data; it does not add proxy nodes to React Flow, move real nodes, or change the underlying layout.

Rationale:

- The user can visually trace the active relation to the in-viewport proxy without panning to the original table.
- Keeping it optional preserves the original global relation path for users who prefer full-layout spatial continuity.
- Reusing proxy layout coordinates avoids a mismatch between the card position and the line endpoint.

### Store the setting with editor preferences

The settings will live in the existing Settings sidebar panel and persist locally like theme preferences. The proxy feature and proxy-line connection default to disabled, and proxy placement defaults to line-based placement. The line connection and placement options only have visible effects while proxy rendering is enabled.

Rationale:

- The feature is useful for complex diagrams but may be visually noisy for small diagrams.
- Settings is already the place for editor-local behavior preferences.

## Risks / Trade-offs

- Proxy placement can overlap important diagram content -> Place cards on the focused-to-original direction, clamp them inside the viewport, and leave explicit spacing between nearby proxies.
- Multiple proxies can overlap each other near the same relation direction -> Resolve card positions per side with minimum spacing before rendering.
- Viewport coordinate math can drift under zoom/pan -> Keep conversion logic isolated and test pure helper functions for viewport/table bounds decisions and focused-to-original line placement.
- Proxy cards may be mistaken for real nodes -> Reuse normal table node structure for readability, but mute the header and include an offscreen/navigation affordance.
- Many direct relations can create too many proxies -> Deduplicate by table and aggregate connected columns without displaying unrelated column summaries.
- Proxy line rerouting can obscure the original offscreen endpoint direction -> Keep it behind a separate setting and derive endpoint overrides from visible proxy card layouts only.
- Placement modes can change the user's spatial cue -> Preserve line-based placement as the default and expose parallel placement as an explicit setting.
