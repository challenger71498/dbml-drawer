## 1. Routing Model

- [x] 1.1 Add a relation port routing mode type with `fixed` and `nearest` values plus a fixed default.
- [x] 1.2 Add normalization for persisted relation port routing values, falling back to `fixed` for missing or unknown values.
- [x] 1.3 Add editor settings store state, setter, selectors, persistence, and tests for relation port routing mode.

## 2. Layout Pipeline

- [x] 2.1 Pass the selected relation port routing mode through the DBML document layout pipeline.
- [x] 2.2 Include relation port routing mode in the DBML layout cache key so changing it relayouts the current valid document.
- [x] 2.3 Implement nearest side-port pair selection from layouted source and target table positions.
- [x] 2.4 Preserve fixed source-right to target-left routing as the default relation endpoint selection.
- [x] 2.5 Add the nearest-mode same-table self-reference special case that selects right-to-right endpoints.
- [x] 2.6 Recompute routed relation paths after applying nearest endpoint port ids so routes start and end at the selected ports.

## 3. Rendering Integration

- [x] 3.1 Ensure React Flow edge `sourceHandle`, `targetHandle`, and edge data use the selected relation port ids and routed start/end points.
- [x] 3.2 Update relation path helpers and edge rendering so endpoint side positions come from selected route geometry instead of assuming source right and target left.
- [x] 3.3 Ensure active relation gradient and dynamic flow direction still follow DBML source-to-target semantics.
- [x] 3.4 Ensure offscreen proxy relation endpoint overrides continue to work with relations whose original endpoints may use either side.
- [x] 3.5 Ensure PNG and HTML diagram export use the selected routed relation geometry.

## 4. Editor UI

- [x] 4.1 Add relation port routing controls to editor settings using fixed and nearest choices.
- [x] 4.2 Wire the control to the persisted editor setting without changing relation line style or highlight mode.
- [x] 4.3 Ensure the current valid diagram preview recomputes when the user changes relation port routing mode.

## 5. Verification

- [x] 5.1 Add unit tests for fixed routing, nearest routing, deterministic horizontal alignment behavior, same-table self-reference right-to-right routing, and different-table nearest routing.
- [x] 5.2 Add tests proving relation direction semantics and endpoint role highlights are preserved when nearest routing changes physical port sides.
- [x] 5.3 Add editor settings tests for default value, persistence, invalid stored fallback, UI control wiring, and relayout on setting changes.
- [x] 5.4 Add focused rendering/export/proxy tests for selected endpoint side behavior where existing tests assume right-to-left endpoints.
- [x] 5.5 Run `openspec validate add-relation-port-routing-option --strict`.
- [x] 5.6 Run the affected frontend test suite and project quality checks.
