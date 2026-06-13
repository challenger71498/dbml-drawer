## ADDED Requirements

### Requirement: Diagram flow proxy extension boundary

The diagram preview SHALL apply offscreen relation proxy behavior as a DBML diagram flow extension that composes with the base React Flow rendering model without making proxies normal React Flow table nodes.

#### Scenario: Base flow rendering remains independent from proxy extension

- **WHEN** offscreen relation proxies are disabled
- **THEN** the diagram preview MUST render the base DBML diagram flow without invoking proxy-specific flow element overrides or proxy overlay rendering

#### Scenario: Proxy extension adapts relation endpoints

- **WHEN** offscreen relation proxies are visible and proxy line connection is enabled
- **THEN** the proxy extension MUST adapt the affected relation edge endpoints to the proxy card positions while preserving the base React Flow table nodes

#### Scenario: Proxy overlay is rendered outside React Flow nodes

- **WHEN** offscreen relation proxies are visible
- **THEN** the diagram preview MUST render proxy cards as an overlay above the React Flow canvas instead of adding them to the React Flow node list

#### Scenario: Preview composes proxy extension output

- **WHEN** the proxy extension produces updated flow elements and proxy overlay state
- **THEN** the diagram preview MUST pass the updated flow elements to React Flow and render the proxy overlay from that extension state
