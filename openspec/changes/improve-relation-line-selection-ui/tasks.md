## 1. Selection Model

- [x] 1.1 Add selection-model helpers that return endpoint role column ids for the active column target.
- [x] 1.2 Expose endpoint role highlight state through the diagram selection view context.
- [x] 1.3 Add model tests for focused and hovered column targets, including relations where the selected column is either source or target.

## 2. Relation Edge Rendering

- [x] 2.1 Add per-relation active gradient rendering to `DbmlRelationEdge`.
- [x] 2.2 Keep inactive and dimmed relation line styles as solid strokes.
- [x] 2.3 Add edge rendering tests for active source-to-target gradient behavior across supported line styles.

## 3. Table And Column Styling

- [x] 3.1 Update focused table styling so selected table borders use the complementary highlight color.
- [x] 3.2 Update column row styling so endpoint role columns use highlight colors for hover and focus contexts.
- [x] 3.3 Preserve existing dimming, layering, and hover-only table behavior.

## 4. Verification

- [x] 4.1 Update diagram preview tests for table border and endpoint role column highlights.
- [x] 4.2 Run targeted editor tests.
- [x] 4.3 Run typecheck and lint.

## 5. Highlight Mode Options

- [x] 5.1 Add solid, gradient, and dynamic relation highlight mode state and controls.
- [x] 5.2 Render solid, gradient, and animated dynamic active relation lines.
- [x] 5.3 Add diagram preview tests for switching relation highlight modes.
- [x] 5.4 Run targeted tests, typecheck, lint, and format check.

## 6. Endpoint Role Color Details

- [x] 6.1 Use the table-title color as the source highlight color.
- [x] 6.2 Use orange for focused table borders without adding connected table border highlights.
- [x] 6.3 Compute active source and reference column id sets from relation endpoints.
- [x] 6.4 Render source column rows in the table-title color and reference column rows in orange for hover and focus contexts.
- [x] 6.5 Change gradient stops to keep source color through 33% before softly transitioning to reference color.
- [x] 6.6 Update tests and run verification.
- [x] 6.7 Rename endpoint state and attributes to source/reference terminology.
- [x] 6.8 Preserve focused column endpoint role highlights while hovering another column.

## 7. Dynamic Flow Dots

- [x] 7.1 Replace dynamic gradient-axis animation with moving dots that follow the relation path.
- [x] 7.2 Space dynamic dots with staggered motion timing instead of manual per-edge count tuning.
- [x] 7.3 Update dynamic mode tests and run verification.
- [x] 7.4 Reverse dynamic dot direction to flow from source to reference.
- [x] 7.5 Derive dynamic dot count and motion duration from rendered path length so dot speed stays consistent across edge lengths.

## 8. Dynamic Flow Marker Detail

- [x] 8.1 Render dynamic flow markers as flattened football-shaped ellipses that rotate along the relation path.
- [x] 8.2 Fill dynamic flow markers with the active relation gradient so marker color follows the visible line color.
- [x] 8.3 Update dynamic mode tests and run verification.
