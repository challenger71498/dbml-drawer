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

#### Scenario: Morph transition moves proxy toward original during handoff
- **WHEN** the proxy transition mode is `morph` and a proxy's represented original table approaches the selected visibility threshold
- **THEN** the diagram preview MUST move and size that proxy toward the represented original table during the handoff range
- **AND** the morph handoff SHOULD complete when the represented original table is about 80% visible

#### Scenario: Morph transition overrides regular proxy visibility mode
- **WHEN** the proxy transition mode is `morph`
- **THEN** the diagram preview SHOULD keep using morph visibility handoff even if the regular proxy visibility setting is `center`

#### Scenario: Morph transition reveals original table content
- **WHEN** the proxy transition mode is `morph` and handoff progress is active
- **THEN** the diagram preview SHOULD fade compact proxy content out while fading represented original table content in

#### Scenario: Morph transition preserves relation handoff
- **WHEN** a morphing proxy is used as a relation line endpoint
- **THEN** the relation endpoint SHOULD follow the connected column port within the morphing proxy card
- **AND** the relation endpoint SHOULD transition from the compact proxy column port during the initial morph interval
