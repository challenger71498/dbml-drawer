## Why

Relation edges currently attach to a fixed source-right and target-left port pair regardless of table positions. This can make dense diagrams less readable when related tables are arranged above, below, or on the opposite side of the default direction.

## What Changes

- Add a diagram relation port routing option that controls how relation endpoints choose column ports.
- Preserve the current fixed routing behavior as the default so existing diagrams remain stable.
- Add a nearest-port routing mode that connects each relation endpoint to the side port facing the related table based on the current layouted table positions.
- When nearest-port routing is enabled, route self-reference column relations from the column's right port back to its right port so the loop stays on one side of the table.
- Expose the option in editor diagram/settings controls as a persisted editor preference.
- Ensure relation rendering, offscreen proxy relation overrides, export rendering, and relation highlight direction continue to use the selected relation endpoint geometry consistently.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-diagram-preview`: Adds selectable relation endpoint port routing behavior for fixed and nearest-port relation attachment.
- `dbml-editor`: Adds editor controls and persistence for the relation port routing option.

## Impact

- Affected frontend code is expected under `frontend/src/pages/editor`.
- Relation endpoint selection will affect diagram entity creation, layout inputs, React Flow edge handles, routed relation paths, offscreen proxy line endpoints, and diagram export relation paths.
- No backend, DBML parser, authentication, storage service, or dependency changes are planned.
