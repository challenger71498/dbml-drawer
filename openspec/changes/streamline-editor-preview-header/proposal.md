## Why

The editor workspace top area has accumulated duplicate section headers and toolbar status controls, which consumes vertical space and makes the diagram preview feel secondary. This change streamlines the workspace chrome so the diagram stays dominant while validation and rendering controls remain available where they are most relevant.

## What Changes

- Replace the current separate editor and preview headers with a single compact editor header.
- Place the editor header beside the sidebars as compact workspace chrome rather than above the sidebars.
- Size the editor header to match the activity sidebar button height.
- Populate the compact editor header with uppercase Project name and visually separated Note on the left when Note is declared in DBML.
- Add a compact editor footer using the shared sidebar panel header height and show a database icon plus Database type on the footer's right side when Database type is declared in DBML.
- Remove the preview header.
- Remove the `Valid` and `Ready` pills from the top toolbar area.
- Show validation/rendering status in the preview overlay area directly below the editor header:
  - show no validation status when DBML is valid;
  - show a red warning icon and validation message when DBML is invalid;
  - show diagram render readiness near the preview's upper-left status area when needed.
- Move edge routing controls (`Bezier`, `Step`, `Rounded`) into the Settings panel.
- Keep relation line style controls (`Solid`, `Gradient`, `Dynamic`) in the Settings panel and also expose a compact duplicate control in the preview upper-right overlay.
- Make the preview upper-right relation style control more compact than the current segmented toolbar control while preserving all three choices.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dbml-editor`: Editor workspace chrome, metadata header, settings panel contents, and sidebar/header positioning behavior change.
- `dbml-diagram-preview`: Preview header removal, preview overlay validation/render status, compact relation style control, and diagram routing/style control placement change.

## Impact

- Affected frontend UI components include the editor page layout, activity sidebar placement, settings panel, DBML code editor metadata extraction path, and diagram preview toolbar/overlay controls.
- Existing editor settings state for edge routing and relation line style should be reused; no storage migration should be needed unless current keys are tied to removed toolbar components.
- Tests should cover header metadata rendering, invalid DBML warning placement, removal of old status/header controls, settings panel controls, and preview compact relation style control behavior.
