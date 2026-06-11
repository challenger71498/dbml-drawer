## Context

`EditorSidebarShell` currently renders one activity bar from a single `activities` array. That works for the current left DBML editor control and right inspector activities, but it cannot represent secondary activity placement such as a settings button anchored at the bottom of a sidebar.

Theme controls currently live in the editor header. They are editor preferences rather than document actions, so they fit better in a settings panel hosted by sidebar chrome.

## Goals / Non-Goals

**Goals:**

- Allow editor sidebars to render top and bottom activity groups with consistent button chrome.
- Keep panel activation mutually exclusive within each sidebar, regardless of whether the selected activity is in the top or bottom group.
- Add a right-bottom Settings activity that hosts workspace and code editor theme preferences.
- Move existing theme controls out of the editor header into the Settings panel.
- Represent code editor theme control as a workspace override toggle plus an explicit override selector.
- Preserve current theme persistence and resolved theme behavior where possible.
- Reintroduce sidebar panel maximum widths while preserving minimum width and resize affordances.

**Non-Goals:**

- Do not introduce a global application settings page.
- Do not move editor sidebar shell code outside `frontend/src/pages/editor/ui/`.
- Do not redesign right inspector content or dev-only activity behavior.
- Do not change the underlying theme token palettes.
- Do not add account-backed or backend-synced preferences.

## Decisions

### Model sidebar activity groups explicitly

Extend the sidebar shell API to accept top and bottom activity groups, for example `topActivities` and `bottomActivities`, or an equivalent grouped structure. Keep the existing activity definition shape for individual items: id, label, icon, panel id, active/expanded state, and select handler.

Rationale: placement is a layout concern of the shell, while selection remains owned by the caller. Explicit groups avoid overloading activity ids or relying on CSS-only ordering.

Alternative considered: pass one flat list with a `placement` field per activity. That is workable, but it pushes grouping logic into the shell and makes rendering empty groups more ambiguous. Two optional groups are simpler for the current top/bottom requirement.

### Keep one active panel per sidebar owner

The shell should not own selection state. `EditorPage` should own the left sidebar active activity, and `EditorInspector` should continue owning the right inspector active activity. The shell should render only the single active panel passed by its owner.

Rationale: the existing left and right sidebars have different activity sets and state transitions. Keeping state outside the shell preserves that flexibility while still enforcing the visible result: one expanded panel per sidebar.

Alternative considered: make `EditorSidebarShell` own active ids. That would reduce caller code but would also force one state model onto left and right sidebars and make persistence or custom transitions harder later.

### Add settings as a right-bottom activity

The left sidebar should keep only the DBML editor activity. The right inspector should keep development-only inspector activities in the top group and add Settings to the bottom group. Selecting Settings opens a right inspector panel using the same shared panel header, close button, resize behavior, and right-side panel placement as other inspector panels.

Rationale: settings are editor-page concerns and are always useful, while dev-only inspector activities remain on the right.

Alternative considered: add Settings to the left sidebar. That keeps settings near the DBML editor, but it makes the authoring sidebar switch away from code editing for a general editor preference panel. Keeping settings on the right lets the DBML editor remain open while preferences are adjusted.

### Move theme controls into a settings panel component

Create an editor-local settings panel component that receives theme values and setters from `EditorPage`. Move `ThemeModeControl` or its reusable pieces out of the header path so the toolbar only keeps document/editor status actions.

Rationale: `EditorPage` should continue owning preference state, while the settings panel owns preference presentation. This keeps storage, resolution, and Monaco propagation unchanged.

Alternative considered: let the settings panel call `useEditorThemePreferences` directly. That would split theme state ownership and make it easier for the page data attributes and Monaco props to drift from the controls.

### Represent code editor override with existing mode semantics

Use the existing `CodeEditorThemeMode` values as the persisted model: `workspace` means override disabled, and `light | light-solarized | dark | system` mean override enabled with that selected theme. In the UI, show a workspace override toggle; when disabled, the code editor follows the resolved workspace theme. When enabled, show or enable the explicit theme selector with Light, Solarized, Dark, and System. The explicit override selector defaults to System for new unset selections.

Rationale: this maps cleanly onto the already implemented workspace-following mode without introducing another persistence key.

Alternative considered: add a separate boolean key for override state. That is more literal but creates additional migration and consistency cases for no functional gain.

### Reintroduce bounded sidebar resizing

Resizable sidebar panels should enforce both minimum and maximum widths. Keep the maximum as an implementation constant or viewport-aware clamp in the sidebar owner, not as a hard-coded behavior inside activity content. The constraint should apply consistently to the left DBML/settings sidebar and right inspector sidebar.

Rationale: removing the maximum made wide panels possible, but it also allows sidebars to consume too much of the editor workspace and make the diagram difficult to use. Bounds belong with resize state because they are layout constraints, not panel content constraints.

Alternative considered: rely only on CSS grid minmax values. That can prevent complete layout collapse, but pointer and keyboard resize state can still drift beyond useful values unless the resize handlers clamp consistently.

## Risks / Trade-offs

- [Risk] Moving theme controls can make theme switching less discoverable. → Mitigation: place Settings in the persistent right-bottom activity area and give the activity an accessible label and recognizable icon.
- [Risk] Sidebar group API can become too specific to left settings. → Mitigation: make both groups optional and reusable for either side.
- [Risk] Existing tests may assume theme controls are in the toolbar. → Mitigation: update tests to open Settings before querying theme controls, and add coverage for toolbar cleanup.
- [Risk] Code editor override UI can be confused with the previous Workspace button. → Mitigation: use explicit copy such as “Override workspace theme” and test the off/on behavior through resolved code editor theme attributes.
- [Risk] Reintroduced max widths can feel too restrictive on large monitors. → Mitigation: make the maximum large enough for practical editing and consider a viewport-aware clamp during implementation.
