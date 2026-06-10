## Why

The editor workspace currently places the DBML code editor directly in the main split layout, while editor tools live in a right-side inspector shell. Moving the DBML editor behind a left-side activity control creates a clearer, extensible workspace structure where authoring tools can be toggled independently from the diagram canvas.

## What Changes

- Add a narrow left-side activity bar with a DBML editor control to the DBML editor workspace.
- Match the left sidebar's interaction and visual structure to the existing right inspector sidebar patterns.
- Place the existing DBML code editor inside the left sidebar as the initial and only left sidebar content.
- Keep the diagram preview as the primary central workspace content.
- Preserve existing DBML editing, diagnostics, validation markers, source reveal behavior, and document state behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dbml-editor`: Add left sidebar workspace requirements and move the DBML code editor into that sidebar.

## Impact

- Affected frontend components: `EditorPage`, DBML editor layout components, editor sidebar styling, and related tests.
- No backend, persistence, routing, or dependency changes are expected.
- Existing editor state and Monaco editor integration should be reused rather than replaced.
