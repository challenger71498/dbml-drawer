## ADDED Requirements

### Requirement: Offscreen relation proxy collision strategies

The diagram preview SHALL support selectable offscreen relation proxy collision strategies while preserving the existing proxy placement and transition modes.

#### Scenario: Legacy collision strategy remains selectable

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `legacy`
- **THEN** the diagram preview MUST compute proxy card collision handling using the existing legacy layout behavior

#### Scenario: Iterative collision strategy remains selectable

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST compute proxy card collision handling using the group, intent, lane, and edge-priority iterative layout behavior

#### Scenario: Score collision strategy remains selectable

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `score`
- **THEN** the diagram preview MUST compute proxy card collision handling using deterministic global candidate scoring

#### Scenario: Collision strategy is configurable from editor settings

- **WHEN** offscreen relation proxies are enabled from editor settings
- **THEN** the editor settings MUST allow users to choose between `legacy`, `iterative`, and `score` proxy collision strategies
- **AND** the selected proxy collision strategy MUST be persisted with the other editor settings

#### Scenario: Iterative collision strategy avoids hard obstacles

- **WHEN** offscreen relation proxies are enabled and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST avoid safe-area obstacles and active table obstacles when a collision-free position exists for a proxy card
- **AND** the proxy collision strategy MUST NOT treat the proxy's represented original table as an active table obstacle for that proxy

#### Scenario: Iterative collision strategy resolves proxy overlap after hard obstacles

- **WHEN** multiple offscreen relation proxy cards would overlap and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST resolve proxy-proxy overlap using positions that still satisfy the safe-area and active table obstacle constraints when such positions exist

#### Scenario: Iterative collision strategy stacks lower edge proxies upward

- **WHEN** multiple offscreen relation proxy cards actually overlap near the lower viewport edge and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST keep the lowest proxy card at the lower available position when feasible
- **AND** the remaining overlapping proxy cards MUST stack upward without overlapping that lowest card when feasible

#### Scenario: Iterative collision strategy preserves exact edge-gap positions

- **WHEN** an offscreen relation proxy card can be placed exactly at the lower viewport edge gap while preserving the required proxy-proxy gap and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST treat that exact edge-gap position as allowed
- **AND** the diagram preview MUST NOT move the proxy card farther inward solely because the allowed position is a single boundary point

#### Scenario: Iterative collision strategy resolves corner overlap vertically

- **WHEN** offscreen relation proxy cards from different sides overlap near a viewport corner and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST keep the proxy cards' horizontal positions unchanged
- **AND** the diagram preview MUST move overlapping proxy cards vertically to avoid the overlap when feasible

#### Scenario: Iterative collision strategy preserves top and bottom proxy priority

- **WHEN** a top-side or bottom-side offscreen relation proxy card overlaps a left-side or right-side proxy card and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST prefer keeping the top-side proxy card in the upper stack slot or the bottom-side proxy card in the lower stack slot when feasible
- **AND** the left-side or right-side proxy card MUST move vertically to avoid the overlap when feasible

#### Scenario: Iterative collision strategy only groups actual proxy collisions

- **WHEN** multiple offscreen relation proxy cards share a horizontal range but their raw rectangles do not overlap and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST NOT group those proxy cards for shared intent, vertical stacking, or secondary horizontal lane fallback
- **AND** the diagram preview MUST preserve each proxy card's independent placement unless it must move to avoid hard obstacles or an actual proxy collision

#### Scenario: Iterative collision strategy uses vertical overflow intent

- **WHEN** any offscreen relation proxy card in an actual collision group has an unclamped vertical target outside the viewport and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST treat the group as intending to stack from the overflow direction with the greater total overflow magnitude
- **AND** the diagram preview MUST preserve edge-anchored stacking for that group when feasible

#### Scenario: Iterative collision strategy splits overflowing stacks into secondary horizontal lanes

- **WHEN** an actual collision group cannot fit within the viewport as a single vertical stack and the proxy collision strategy is `iterative`
- **THEN** the diagram preview MUST move lower-priority proxy cards into secondary horizontal lanes until the vertical stacks fit when horizontal space exists
- **AND** the diagram preview MUST prefer keeping proxy cards with stronger group-direction overflow in the primary lane

#### Scenario: Iterative collision strategy uses deterministic fallback

- **WHEN** the viewport does not contain enough usable space for all proxy cards to avoid every hard obstacle and every other proxy card
- **THEN** the diagram preview MUST choose deterministic proxy card positions that prefer reducing safe-area and active table overlap before reducing proxy-proxy overlap and movement distance
