## ADDED Requirements

### Requirement: Offscreen relation proxy self-collision handling
The diagram preview SHALL ignore a proxy's represented original table when applying active-node avoidance to that proxy.

#### Scenario: Proxy does not avoid its own original table
- **WHEN** offscreen relation proxies are enabled, active-node avoidance is enabled, and a proxy's represented original table is also in the active table set
- **THEN** the proxy layout MUST NOT treat that represented original table as an avoidance obstacle for that proxy

#### Scenario: Proxy still avoids other active tables
- **WHEN** offscreen relation proxies are enabled, active-node avoidance is enabled, and another active table overlaps a candidate proxy position
- **THEN** the proxy layout MUST continue to avoid that other active table according to the selected proxy layout strategy

### Requirement: Offscreen relation proxy transition strategies
The diagram preview SHALL apply offscreen relation proxy handoff behavior through a transition strategy that is independent from the proxy layout strategy.

#### Scenario: None transition preserves immediate visibility behavior
- **WHEN** the proxy transition mode is `none`
- **THEN** the diagram preview MUST render and remove offscreen relation proxies using the selected proxy visibility mode without applying additional opacity or morph presentation changes

#### Scenario: Opacity transition fades proxy during handoff
- **WHEN** the proxy transition mode is `opacity` and a proxy's represented original table approaches the selected visibility threshold
- **THEN** the diagram preview MUST reduce that proxy's opacity during the handoff range while preserving the proxy's computed layout position

#### Scenario: Opacity transition preserves final visibility rule
- **WHEN** the proxy transition mode is `opacity` and the represented original table satisfies the selected proxy visibility mode
- **THEN** the diagram preview MUST stop rendering the proxy for that original table

#### Scenario: Morph transition is reserved for a later implementation phase
- **WHEN** the proxy transition mode is `morph` before morph rendering is implemented
- **THEN** the diagram preview MUST accept the mode and MUST fall back to the `none` transition behavior
