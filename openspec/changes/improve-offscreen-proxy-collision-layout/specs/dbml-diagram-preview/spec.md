## ADDED Requirements

### Requirement: Offscreen relation proxy collision strategies

The diagram preview SHALL support selectable offscreen relation proxy collision strategies while preserving the existing proxy placement and transition modes.

#### Scenario: Legacy collision strategy remains selectable

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `legacy`
- **THEN** the diagram preview MUST compute proxy card collision handling using the existing legacy layout behavior

#### Scenario: Collision strategy is configurable from editor settings

- **WHEN** offscreen relation proxies are enabled from editor settings
- **THEN** the editor settings MUST allow users to choose between `legacy` and `constrained` proxy collision strategies
- **AND** the selected proxy collision strategy MUST be persisted with the other editor settings

#### Scenario: Constrained collision strategy avoids hard obstacles

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `constrained`
- **THEN** the diagram preview MUST avoid safe-area obstacles and active table obstacles when a collision-free position exists for a proxy card
- **AND** the proxy collision strategy MUST NOT treat the proxy's represented original table as an active table obstacle for that proxy

#### Scenario: Constrained collision strategy resolves proxy overlap after hard obstacles

- **WHEN** multiple offscreen relation proxy cards would overlap and the proxy collision strategy is `constrained`
- **THEN** the diagram preview MUST resolve proxy-proxy overlap using positions that still satisfy the safe-area and active table obstacle constraints when such positions exist

#### Scenario: Constrained collision strategy uses deterministic fallback

- **WHEN** the viewport does not contain enough usable space for all proxy cards to avoid every hard obstacle and every other proxy card
- **THEN** the diagram preview MUST choose deterministic proxy card positions that prefer reducing safe-area and active table overlap before reducing proxy-proxy overlap and movement distance
