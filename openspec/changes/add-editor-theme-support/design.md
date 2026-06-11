## Context

The editor page is now a multi-surface workspace with a Monaco DBML editor in the left sidebar, a React Flow diagram preview in the main area, and inspector activities on the right. The visual system is currently encoded mostly in `EditorPage.module.css`, while `DbmlCodeEditor` passes `theme="vs-dark"` directly to Monaco. Users may want the workspace chrome and the code editor to use different themes, so the change needs two related but independent preferences.

The change should remain page-local for now. There is no app-wide navigation shell that needs theme support outside the editor route, and the existing FSD shape keeps editor-specific UI in `frontend/src/pages/editor`.

## Goals / Non-Goals

**Goals:**

- Support light, dark, and system theme modes for the DBML editor workspace.
- Support light, dark, and system theme modes for the DBML code editor independently from the workspace theme.
- Resolve system mode from `prefers-color-scheme` and react to OS theme changes for each preference while that preference is set to system.
- Persist both selected theme modes locally.
- Apply VS Code Light 2026 workspace colors for light mode and Gruvbox Material medium/material colors for dark mode consistently to editor page chrome, sidebars, diagram preview, panels, and controls.
- Apply matching code editor theme selection to Monaco independently from the surrounding workspace theme.
- Keep the theme implementation local enough to avoid premature cross-app abstraction, while making token usage straightforward to expand later.

**Non-Goals:**

- Adding a global app settings page or account-backed preferences.
- Theming routes outside `/editor`.
- Reworking the diagram selection color semantics beyond mapping existing colors into theme-aware tokens where necessary.
- Adding user-customizable theme variants beyond the selected VS Code Light 2026 and Gruvbox Material medium/material palettes.

## Decisions

### Use separate persisted theme modes plus resolved themes

Store the user's selected workspace theme mode and code editor theme mode separately, each as `light | dark | system`. Derive a resolved workspace theme and a resolved code editor theme of `light | dark` from those selected modes and `window.matchMedia('(prefers-color-scheme: dark)')`.

Rationale: the selected mode represents user intent, while the resolved theme is what rendering code needs. Keeping workspace and code editor modes separate supports intentional combinations such as a dark workspace with a light Monaco editor. Keeping selected and resolved values separate prevents system mode from being overwritten when the OS preference changes.

Alternative considered: persist only one editor theme mode and let Monaco inherit it. That would be simpler, but it would not support users who prefer different contrast between the UI chrome and code editing surface.

### Keep theme state in editor page scope for this change

Introduce a small page-local theme model/hook for the editor route. It should expose selected and resolved values for both the workspace theme and code editor theme. Pass the resolved code editor theme to `DbmlCodeEditor`; apply the resolved workspace theme to the editor root.

Rationale: current requirements are editor-only. A global theme provider can be extracted later if other routes need the same behavior, but doing so now would introduce app-wide API surface without a second consumer.

Alternative considered: create a global application theme provider immediately. This would be cleaner if the entire app had themed navigation and settings, but the current product surface does not require it.

### Apply UI colors through CSS custom properties

Set a workspace theme attribute or class on the editor workspace root and define editor-scoped CSS custom properties for backgrounds, borders, text, muted text, panels, controls, diagram surface, relation colors, and selection highlights.

Rationale: CSS variables let existing CSS module selectors keep their structure while changing values by theme. They also reduce prop drilling for pure styling.

Alternative considered: conditional class names for every themed element. That would spread theme branches across many components and make future color tuning harder.

### Use VS Code Light 2026 and Gruvbox Material dark medium palettes

Use VS Code Light 2026 colors for light workspace and code editor tokens. Use Gruvbox Material's `material` foreground palette with `medium` background contrast for dark workspace and code editor tokens. Keep the UI labels as Light, Dark, and System; palette families are implementation details, not extra user-facing theme families.

Rationale: VS Code Light 2026 provides a neutral modern light surface, while Gruvbox Material medium keeps the dark editor comfortable without the previous soft palette feeling too lifted.

Alternative considered: use Gruvbox Material for both light and dark. That is cohesive, but the light variant reads too yellow for the desired editor surface.

### Pass Monaco theme explicitly from resolved code editor theme

`DbmlCodeEditor` should accept the resolved code editor theme and map it to custom Monaco theme ids for VS Code Light 2026 and Gruvbox Material dark medium.

Rationale: Monaco theme is not automatically controlled by surrounding CSS, and it now has its own user preference. Passing the resolved code editor theme explicitly keeps Monaco synchronized with that preference and lets the DBML editor follow the selected light or dark palette.

Alternative considered: built-in `vs` and `vs-dark`. These are reliable defaults, but custom theme ids let us keep light mode aligned with VS Code Light 2026 and dark mode aligned with Gruvbox Material medium.

### Place both theme controls in existing editor chrome or settings

Expose compact controls for both workspace theme mode and code editor theme mode in the editor workspace toolbar or an existing editor settings surface. Each control must clearly offer Light, Dark, and System modes, and the UI must make clear which surface the control affects.

Rationale: theme selection is a workspace preference, not DBML document content. It should live in the editor chrome or settings rather than inside the DBML code editor or diagram canvas. Grouping both controls reduces the chance that users assume Monaco is forced to follow the workspace theme.

Alternative considered: put the control in the right inspector settings activity. That keeps the toolbar lighter but makes the theme switch less discoverable. If the toolbar becomes crowded, the same state model can be moved into settings later.

## Risks / Trade-offs

- [Risk] CSS variables may initially miss some hard-coded colors in deep editor components. → Mitigation: include a task to audit `EditorPage.module.css` and component-level color constants, and add tests for root workspace theme attributes plus Monaco theme propagation.
- [Risk] Two theme controls can be confusing if labels are too similar. → Mitigation: label them by affected surface, such as “Workspace theme” and “Code editor theme”, and test accessible names.
- [Risk] React Flow and Monaco render outside normal DOM expectations in tests. → Mitigation: validate the contract through component props, data attributes, and stable class/root state rather than pixel-level assertions.
- [Risk] System mode can be flaky in tests if `matchMedia` is not controlled. → Mitigation: mock `window.matchMedia` in focused tests and verify listener-driven updates.
- [Risk] localStorage access can fail in constrained browser contexts. → Mitigation: wrap preference reads/writes defensively and fall back to `system`.
