## Why

Large DBML diagrams can place directly related tables far apart, so focusing a table or column may highlight relations whose other endpoint is outside the current viewport. Users then have to pan back and forth to understand nearby dependency context, which makes dense schemas hard to inspect.

## What Changes

- Add an optional offscreen relation proxy feature for focused diagram targets.
- Show compact proxy cards inside the current viewport for directly connected tables that are outside the viewport.
- Render only the connected columns in each proxy and omit unrelated columns.
- Allow proxy interaction to preserve existing relation highlight semantics and provide a way to navigate to the original table.
- Add a Settings panel toggle so the feature is disabled by default and only active when explicitly enabled.
- Add a Settings panel option that can connect represented relation lines to visible proxy cards while proxies are active.
- Add a Settings panel option for choosing line-based or parallel-translated proxy placement.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dbml-diagram-preview`: Add optional offscreen connected-table proxy rendering and interactions for focused diagram targets.
- `dbml-editor`: Add editor Settings preferences for enabling or disabling offscreen relation proxies, proxy line connection, and proxy placement mode.

## Impact

- Affects DBML diagram selection and viewport-aware rendering in `frontend/src/pages/editor`.
- Affects editor settings state, persistence, and Settings panel UI.
- No backend or DBML parser changes are expected.
- No new external dependency is expected.
