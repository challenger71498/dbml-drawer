## 1. Layout Structure

- [x] 1.1 Add a left activity bar and sidebar shell to `EditorPage` around the existing `DbmlCodeEditor`.
- [x] 1.2 Move the diagram preview into the remaining main workspace area outside the left sidebar.
- [x] 1.3 Keep the existing `DbmlCodeEditor` ref, value, diagnostics, and `onChange` wiring unchanged.
- [x] 1.4 Add a DBML editor activity control that toggles the left sidebar panel.
- [x] 1.5 Place the left activity bar and sidebar at the editor page grid level so they span the editor page header like the right inspector.

## 2. Sidebar Styling

- [x] 2.1 Add left sidebar CSS classes that match the right inspector sidebar's border, header, background, and panel treatment.
- [x] 2.2 Update the editor workspace grid so left sidebar, diagram preview, and optional right inspector can coexist without overflow.
- [x] 2.3 Add responsive layout behavior for narrow viewports.
- [x] 2.4 Style the left activity bar consistently with the right inspector activity bar.
- [x] 2.5 Ensure the central diagram pane expands to fill the remaining workspace after the left sidebar is rendered.
- [x] 2.6 Add a resizable DBML editor sidebar width control.

## 3. Behavior Preservation

- [x] 3.1 Preserve DBML document editing, validation diagnostics, and Monaco marker behavior after moving the editor.
- [x] 3.2 Preserve diagram-to-source reveal behavior for focused tables and columns.
- [x] 3.3 Preserve right inspector activity bar and panel behavior independently from the left sidebar.

## 4. Verification

- [x] 4.1 Update editor page tests for left sidebar rendering and DBML editor placement.
- [x] 4.2 Update or add tests covering diagram preview remaining visible with the left sidebar.
- [x] 4.3 Run targeted editor tests.
- [x] 4.4 Run typecheck, lint, and format check.
- [x] 4.5 Update tests for left editor activity toggle behavior.
- [x] 4.6 Run full frontend test suite after the layout sizing fix.
- [x] 4.7 Add tests for DBML editor sidebar resizing.
