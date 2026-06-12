## Context

The editor page currently owns a reusable-looking sidebar shell in `pages/editor/ui/EditorSidebarShell.tsx`. The same shell is used for the left DBML editor activity and the right inspector activities, while `EditorInspector.tsx` owns generic activity sidebar behavior such as active activity state, expansion, close behavior, width, pointer resize, and keyboard resize.

This creates two blurred boundaries:

- UI infrastructure such as activity bars, panel chrome, and resize handles lives under an editor page slice even though it has no DBML-specific behavior.
- `EditorInspector` mixes editor-specific activity wiring with reusable sidebar controller behavior.

FSD allows shared UI components and headless UI controllers in `shared/ui` when they are domain-free. The activity sidebar fits that boundary if it does not import editor, DBML, diagnostics, layout, or settings modules.

## Goals / Non-Goals

**Goals:**

- Introduce `frontend/src/shared/ui/activity-sidebar/` as a domain-free reusable activity sidebar package.
- Split the reusable sidebar into a dumb visual component and a generic UI interaction controller hook.
- Keep editor-specific activity definitions and panel content in `pages/editor`.
- Make the left DBML editor sidebar and right editor inspector consume the same shared sidebar primitives.
- Move activity sidebar styles out of `EditorPage.module.css`.
- Preserve current editor sidebar behavior, accessibility labels, top/bottom activity grouping, close behavior, resizing, keyboard resize, and width bounds.

**Non-Goals:**

- Do not move DBML editor, diagnostics, presets, diagram settings, editor settings, or diagram rendering content to `shared`.
- Do not introduce new sidebar capabilities beyond the current activity-sidebar interaction pattern.
- Do not convert this into a navigation sidebar abstraction.
- Do not change editor settings persistence or activity availability rules.

## Decisions

### Decision: Use `activity-sidebar` instead of generic `sidebar`

The reusable package SHALL be named `activity-sidebar` because the component opens local tool panels rather than navigating between routes or pages.

Alternative considered: `shared/ui/sidebar`. This is shorter, but it would blur the distinction between activity sidebars and future navigation sidebars.

### Decision: Keep a dumb component and a controller hook together in `shared/ui`

The shared package SHALL expose:

- `ActivitySidebar`: visual shell for activity bar, grouped activity buttons, panel header, content slot, close button, and resize handle.
- `useActivitySidebar`: generic controller for active activity id, expanded state, close/toggle behavior, panel width, pointer resize, and keyboard resize.
- Domain-free types for activity ids, activity groups, side, panel placement, and resize constraints.

The hook belongs in `shared/ui` because it controls UI-only interaction state. It MUST NOT own editor settings, DBML document state, diagnostics, diagram state, or domain-derived state.

Alternative considered: keep the hook in `pages/editor`. That would leave future pages with the same controller duplication and keep reusable behavior tied to editor naming.

### Decision: Keep `EditorInspector` as an editor adapter

`EditorInspector` SHALL remain in `pages/editor/ui` as the boundary between editor activity definitions and the shared sidebar contract. It should become thinner, but it still has a useful role:

- map editor-specific activities to shared sidebar items;
- choose right-side inspector placement;
- connect active editor panels to the shared content slot;
- notify `EditorPage` when the inspector is expanded.

Alternative considered: remove `EditorInspector` and wire `ActivitySidebar` directly in `EditorPage`. This would reduce one file but would make `EditorPage` absorb more orchestration code.

### Decision: Keep activity content caller-owned

The shared sidebar SHALL render the active panel content as children or a render slot. It MUST NOT know what the content represents. Editor panels remain responsible for DBML editing, diagnostics, presets, layout settings, theme settings, and diagram settings.

### Decision: Sidebar styles move with the shared package

Activity sidebar-specific CSS SHALL move from `EditorPage.module.css` into the shared package CSS module. Page CSS should keep page layout responsibilities such as editor grid columns and workspace sizing, while shared sidebar CSS owns sidebar chrome and interaction states.

## Risks / Trade-offs

- **Risk: Shared UI accidentally imports editor domain modules** -> Keep `shared/ui/activity-sidebar` props generic and verify imports only point to React, shared styling, and shared UI-local files.
- **Risk: Left and right sidebars diverge during migration** -> Migrate both left DBML editor sidebar and right inspector sidebar to the shared package in the same change.
- **Risk: `EditorPage` grows while adapting both sidebars** -> Keep `EditorInspector` as the right-side adapter and consider a small left-side adapter only if direct wiring makes `EditorPage` harder to read.
- **Risk: CSS extraction changes visual details** -> Preserve existing class behavior and cover the editor page with targeted tests for sidebar rendering, top/bottom activities, close, and resize semantics.
