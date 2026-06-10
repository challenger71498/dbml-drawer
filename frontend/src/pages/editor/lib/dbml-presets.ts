import { INITIAL_DBML_DOCUMENT } from './dbml-default-document'

export type DbmlPresetId = 'simple' | 'complex' | 'very-complex'

export type DbmlPreset = {
  id: DbmlPresetId
  label: string
  description: string
  document: string
}

export const DBML_PRESETS: readonly DbmlPreset[] = [
  {
    id: 'simple',
    label: 'Simple',
    description: 'Small schema for parser and editor checks',
    document: INITIAL_DBML_DOCUMENT,
  },
  {
    id: 'complex',
    label: 'Complex',
    description: 'Multiple related tables for layout and validation checks',
    document: `Project commerce {
  database_type: "PostgreSQL"
  Note: "Complex commerce schema"
}

Table organizations {
  id uuid [pk]
  name varchar [not null]
  slug varchar [not null, unique]
  created_at timestamp [default: \`now()\`]
}

Table users {
  id uuid [pk]
  organization_id uuid [not null]
  email varchar [not null, unique]
  display_name varchar
  role varchar [not null]
  created_at timestamp [default: \`now()\`]
}

Table products {
  id uuid [pk]
  organization_id uuid [not null]
  sku varchar [not null]
  name varchar [not null]
  price_cents integer [not null]
  is_active boolean [default: true]
}

Table orders {
  id uuid [pk]
  organization_id uuid [not null]
  user_id uuid [not null]
  status varchar [not null]
  total_cents integer [not null]
  placed_at timestamp
}

Table order_items {
  id uuid [pk]
  order_id uuid [not null]
  product_id uuid [not null]
  quantity integer [not null]
  unit_price_cents integer [not null]
}

Table payments {
  id uuid [pk]
  order_id uuid [not null]
  provider varchar [not null]
  status varchar [not null]
  amount_cents integer [not null]
  paid_at timestamp
}

Ref: users.organization_id > organizations.id
Ref: products.organization_id > organizations.id
Ref: orders.organization_id > organizations.id
Ref: orders.user_id > users.id
Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id
Ref: payments.order_id > orders.id
`,
  },
  {
    id: 'very-complex',
    label: 'Very complex',
    description: 'Dense schema for column-level edge and ELK stress checks',
    document: `Project operations {
  database_type: "PostgreSQL"
  Note: "Very complex operations schema"
}

Table accounts {
  id uuid [pk]
  legal_name varchar [not null]
  billing_email varchar [not null]
  plan varchar [not null]
  lifecycle_state varchar [not null]
  created_at timestamp [default: \`now()\`]
  updated_at timestamp
}

Table teams {
  id uuid [pk]
  account_id uuid [not null]
  name varchar [not null]
  slug varchar [not null]
  created_at timestamp [default: \`now()\`]
}

Table members {
  id uuid [pk]
  account_id uuid [not null]
  team_id uuid
  email varchar [not null]
  display_name varchar
  role varchar [not null]
  status varchar [not null]
  invited_by_member_id uuid
  created_at timestamp [default: \`now()\`]
}

Table projects {
  id uuid [pk]
  account_id uuid [not null]
  team_id uuid [not null]
  owner_member_id uuid [not null]
  name varchar [not null]
  status varchar [not null]
  visibility varchar [not null]
  created_at timestamp [default: \`now()\`]
}

Table environments {
  id uuid [pk]
  project_id uuid [not null]
  created_by_member_id uuid [not null]
  name varchar [not null]
  kind varchar [not null]
  region varchar [not null]
  is_locked boolean [default: false]
}

Table deployments {
  id uuid [pk]
  project_id uuid [not null]
  environment_id uuid [not null]
  requested_by_member_id uuid [not null]
  approved_by_member_id uuid
  version varchar [not null]
  status varchar [not null]
  started_at timestamp
  finished_at timestamp
}

Table deployment_steps {
  id uuid [pk]
  deployment_id uuid [not null]
  environment_id uuid [not null]
  name varchar [not null]
  status varchar [not null]
  started_at timestamp
  finished_at timestamp
}

Table incidents {
  id uuid [pk]
  account_id uuid [not null]
  project_id uuid [not null]
  environment_id uuid
  opened_by_member_id uuid [not null]
  assigned_member_id uuid
  severity varchar [not null]
  status varchar [not null]
  opened_at timestamp [not null]
  resolved_at timestamp
}

Table audit_events {
  id uuid [pk]
  account_id uuid [not null]
  actor_member_id uuid
  project_id uuid
  deployment_id uuid
  incident_id uuid
  event_type varchar [not null]
  metadata jsonb
  created_at timestamp [default: \`now()\`]
}

Table api_tokens {
  id uuid [pk]
  account_id uuid [not null]
  member_id uuid [not null]
  name varchar [not null]
  token_prefix varchar [not null]
  last_used_at timestamp
  expires_at timestamp
  revoked_at timestamp
}

Ref: teams.account_id > accounts.id
Ref: members.account_id > accounts.id
Ref: members.team_id > teams.id
Ref: members.invited_by_member_id > members.id
Ref: projects.account_id > accounts.id
Ref: projects.team_id > teams.id
Ref: projects.owner_member_id > members.id
Ref: environments.project_id > projects.id
Ref: environments.created_by_member_id > members.id
Ref: deployments.project_id > projects.id
Ref: deployments.environment_id > environments.id
Ref: deployments.requested_by_member_id > members.id
Ref: deployments.approved_by_member_id > members.id
Ref: deployment_steps.deployment_id > deployments.id
Ref: deployment_steps.environment_id > environments.id
Ref: incidents.account_id > accounts.id
Ref: incidents.project_id > projects.id
Ref: incidents.environment_id > environments.id
Ref: incidents.opened_by_member_id > members.id
Ref: incidents.assigned_member_id > members.id
Ref: audit_events.account_id > accounts.id
Ref: audit_events.actor_member_id > members.id
Ref: audit_events.project_id > projects.id
Ref: audit_events.deployment_id > deployments.id
Ref: audit_events.incident_id > incidents.id
Ref: api_tokens.account_id > accounts.id
Ref: api_tokens.member_id > members.id
`,
  },
]

export const DEFAULT_DBML_PRESET = DBML_PRESETS[0]
