## Why

Offscreen relation proxies improve navigation in dense diagrams, but proxy cards can currently avoid the same active node they represent, which makes their placement feel detached from the original table. As proxy cards approach their original rendered nodes during viewport movement, the abrupt proxy removal also lacks a clear visual handoff.

## What Changes

- Exclude a proxy's own original table from active-node collision avoidance while preserving avoidance for other active tables.
- Add an offscreen proxy transition setting with `none`, `opacity`, and `morph` modes.
- Implement the transition behavior through a dedicated strategy interface that is separate from proxy layout strategies.
- Implement `none` and `opacity` transition strategies in this change.
- Defer `morph` transition implementation to a later phase while keeping the setting and strategy surface ready for it.
- Expose the proxy transition mode in editor settings and persist the selected value locally.

## Capabilities

### New Capabilities

### Modified Capabilities
- `dbml-diagram-preview`: offscreen relation proxies must ignore self-collision against their represented original table and support transition strategies for proxy-to-original handoff.
- `dbml-editor`: editor settings must expose and persist the offscreen relation proxy transition mode.

## Impact

- Affected frontend model code:
  - `frontend/src/pages/editor/model/dbml-offscreen-relation-proxies.ts`
  - `frontend/src/pages/editor/model/dbml-offscreen-relation-proxy-layout.ts`
  - new or updated offscreen proxy transition model utilities
- Affected frontend UI code:
  - `frontend/src/pages/editor/ui/DbmlDiagramPreview.tsx`
  - `frontend/src/pages/editor/ui/EditorSettingsPanel.tsx`
- Affected editor settings state:
  - `frontend/src/pages/editor/model/editor-settings-store.ts`
  - theme/settings option normalization helpers
- No backend or external dependency changes are expected.
