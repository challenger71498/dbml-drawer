import { INITIAL_DBML_DOCUMENT } from './dbml-default-document'

export type DbmlPresetId = 'simple' | 'complex' | 'very-complex' | 'enterprise'

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
  {
    id: 'enterprise',
    label: 'Enterprise',
    description:
      'Enterprise-scale schema spanning HR, IAM, sales, billing, and support',
    document: `Project enterprise_suite {
  database_type: "PostgreSQL"
  Note: "Enterprise-grade operating model for large layout stress checks"
}

Table companies {
  id uuid [pk]
  legal_name varchar [not null]
  trade_name varchar
  tax_identifier varchar [not null, unique]
  headquarters_location_id uuid
  lifecycle_state varchar [not null]
  created_at timestamp [default: \`now()\`]
  updated_at timestamp
}

Table locations {
  id uuid [pk]
  company_id uuid [not null]
  name varchar [not null]
  country_code varchar [not null]
  region varchar
  city varchar [not null]
  timezone varchar [not null]
  is_active boolean [default: true]
}

Table business_units {
  id uuid [pk]
  company_id uuid [not null]
  parent_business_unit_id uuid
  name varchar [not null]
  code varchar [not null]
  executive_employee_id uuid
  created_at timestamp [default: \`now()\`]
}

Table cost_centers {
  id uuid [pk]
  business_unit_id uuid [not null]
  parent_cost_center_id uuid
  code varchar [not null]
  name varchar [not null]
  annual_budget_cents bigint [not null]
  currency_code varchar [not null]
}

Table departments {
  id uuid [pk]
  business_unit_id uuid [not null]
  cost_center_id uuid [not null]
  name varchar [not null]
  head_employee_id uuid
  created_at timestamp [default: \`now()\`]
}

Table employees {
  id uuid [pk]
  company_id uuid [not null]
  department_id uuid [not null]
  location_id uuid
  manager_employee_id uuid
  work_email varchar [not null, unique]
  display_name varchar [not null]
  employment_status varchar [not null]
  hired_at date [not null]
  terminated_at date
}

Table identity_providers {
  id uuid [pk]
  company_id uuid [not null]
  name varchar [not null]
  issuer_url varchar [not null]
  protocol varchar [not null]
  enabled boolean [default: true]
  created_at timestamp [default: \`now()\`]
}

Table user_accounts {
  id uuid [pk]
  company_id uuid [not null]
  employee_id uuid
  identity_provider_id uuid
  email varchar [not null, unique]
  status varchar [not null]
  last_login_at timestamp
  locked_at timestamp
}

Table roles {
  id uuid [pk]
  company_id uuid [not null]
  name varchar [not null]
  scope varchar [not null]
  is_system_role boolean [default: false]
  created_at timestamp [default: \`now()\`]
}

Table permissions {
  id uuid [pk]
  resource varchar [not null]
  action varchar [not null]
  description text
}

Table role_permissions {
  id uuid [pk]
  role_id uuid [not null]
  permission_id uuid [not null]
  granted_by_user_account_id uuid
  granted_at timestamp [default: \`now()\`]
}

Table user_role_assignments {
  id uuid [pk]
  user_account_id uuid [not null]
  role_id uuid [not null]
  business_unit_id uuid
  assigned_by_user_account_id uuid
  starts_at timestamp [not null]
  ends_at timestamp
}

Table customers {
  id uuid [pk]
  company_id uuid [not null]
  owner_employee_id uuid [not null]
  legal_name varchar [not null]
  segment varchar [not null]
  lifecycle_stage varchar [not null]
  billing_currency_code varchar [not null]
  created_at timestamp [default: \`now()\`]
}

Table customer_contacts {
  id uuid [pk]
  customer_id uuid [not null]
  owner_employee_id uuid
  email varchar [not null]
  full_name varchar [not null]
  title varchar
  phone varchar
  is_primary boolean [default: false]
}

Table products {
  id uuid [pk]
  company_id uuid [not null]
  sku varchar [not null]
  name varchar [not null]
  product_family varchar [not null]
  revenue_type varchar [not null]
  active boolean [default: true]
}

Table price_books {
  id uuid [pk]
  company_id uuid [not null]
  name varchar [not null]
  currency_code varchar [not null]
  market_segment varchar [not null]
  effective_from date [not null]
  effective_to date
}

Table price_book_entries {
  id uuid [pk]
  price_book_id uuid [not null]
  product_id uuid [not null]
  unit_price_cents bigint [not null]
  billing_period varchar [not null]
  minimum_quantity integer [default: 1]
}

Table sales_opportunities {
  id uuid [pk]
  customer_id uuid [not null]
  owner_employee_id uuid [not null]
  primary_contact_id uuid
  stage varchar [not null]
  forecast_category varchar [not null]
  expected_close_date date
  estimated_value_cents bigint [not null]
}

Table quotes {
  id uuid [pk]
  opportunity_id uuid [not null]
  price_book_id uuid [not null]
  prepared_by_employee_id uuid [not null]
  quote_number varchar [not null, unique]
  status varchar [not null]
  valid_until date
  total_cents bigint [not null]
}

Table quote_line_items {
  id uuid [pk]
  quote_id uuid [not null]
  product_id uuid [not null]
  price_book_entry_id uuid [not null]
  quantity integer [not null]
  unit_price_cents bigint [not null]
  discount_bps integer [default: 0]
}

Table contracts {
  id uuid [pk]
  customer_id uuid [not null]
  opportunity_id uuid
  quote_id uuid
  account_manager_employee_id uuid [not null]
  contract_number varchar [not null, unique]
  status varchar [not null]
  signed_at timestamp
}

Table contract_versions {
  id uuid [pk]
  contract_id uuid [not null]
  created_by_employee_id uuid [not null]
  version_number integer [not null]
  effective_from date [not null]
  effective_to date
  terms_snapshot jsonb
}

Table subscriptions {
  id uuid [pk]
  contract_id uuid [not null]
  product_id uuid [not null]
  current_contract_version_id uuid [not null]
  status varchar [not null]
  started_at date [not null]
  renews_at date
  seats integer [not null]
}

Table invoices {
  id uuid [pk]
  customer_id uuid [not null]
  contract_id uuid
  issued_by_company_id uuid [not null]
  invoice_number varchar [not null, unique]
  status varchar [not null]
  issued_at date [not null]
  due_at date [not null]
  total_cents bigint [not null]
}

Table invoice_line_items {
  id uuid [pk]
  invoice_id uuid [not null]
  subscription_id uuid
  product_id uuid
  description varchar [not null]
  quantity integer [not null]
  amount_cents bigint [not null]
}

Table payments {
  id uuid [pk]
  invoice_id uuid [not null]
  customer_id uuid [not null]
  provider varchar [not null]
  provider_reference varchar [not null]
  status varchar [not null]
  amount_cents bigint [not null]
  paid_at timestamp
}

Table support_cases {
  id uuid [pk]
  customer_id uuid [not null]
  contact_id uuid
  assigned_employee_id uuid
  related_subscription_id uuid
  priority varchar [not null]
  status varchar [not null]
  subject varchar [not null]
  opened_at timestamp [default: \`now()\`]
  resolved_at timestamp
}

Table case_comments {
  id uuid [pk]
  support_case_id uuid [not null]
  author_employee_id uuid
  author_contact_id uuid
  body text [not null]
  visibility varchar [not null]
  created_at timestamp [default: \`now()\`]
}

Table audit_events {
  id uuid [pk]
  company_id uuid [not null]
  actor_user_account_id uuid
  customer_id uuid
  contract_id uuid
  invoice_id uuid
  support_case_id uuid
  event_type varchar [not null]
  event_payload jsonb
  created_at timestamp [default: \`now()\`]
}

Ref: companies.headquarters_location_id > locations.id
Ref: locations.company_id > companies.id
Ref: business_units.company_id > companies.id
Ref: business_units.parent_business_unit_id > business_units.id
Ref: business_units.executive_employee_id > employees.id
Ref: cost_centers.business_unit_id > business_units.id
Ref: cost_centers.parent_cost_center_id > cost_centers.id
Ref: departments.business_unit_id > business_units.id
Ref: departments.cost_center_id > cost_centers.id
Ref: departments.head_employee_id > employees.id
Ref: employees.company_id > companies.id
Ref: employees.department_id > departments.id
Ref: employees.location_id > locations.id
Ref: employees.manager_employee_id > employees.id
Ref: identity_providers.company_id > companies.id
Ref: user_accounts.company_id > companies.id
Ref: user_accounts.employee_id > employees.id
Ref: user_accounts.identity_provider_id > identity_providers.id
Ref: roles.company_id > companies.id
Ref: role_permissions.role_id > roles.id
Ref: role_permissions.permission_id > permissions.id
Ref: role_permissions.granted_by_user_account_id > user_accounts.id
Ref: user_role_assignments.user_account_id > user_accounts.id
Ref: user_role_assignments.role_id > roles.id
Ref: user_role_assignments.business_unit_id > business_units.id
Ref: user_role_assignments.assigned_by_user_account_id > user_accounts.id
Ref: customers.company_id > companies.id
Ref: customers.owner_employee_id > employees.id
Ref: customer_contacts.customer_id > customers.id
Ref: customer_contacts.owner_employee_id > employees.id
Ref: products.company_id > companies.id
Ref: price_books.company_id > companies.id
Ref: price_book_entries.price_book_id > price_books.id
Ref: price_book_entries.product_id > products.id
Ref: sales_opportunities.customer_id > customers.id
Ref: sales_opportunities.owner_employee_id > employees.id
Ref: sales_opportunities.primary_contact_id > customer_contacts.id
Ref: quotes.opportunity_id > sales_opportunities.id
Ref: quotes.price_book_id > price_books.id
Ref: quotes.prepared_by_employee_id > employees.id
Ref: quote_line_items.quote_id > quotes.id
Ref: quote_line_items.product_id > products.id
Ref: quote_line_items.price_book_entry_id > price_book_entries.id
Ref: contracts.customer_id > customers.id
Ref: contracts.opportunity_id > sales_opportunities.id
Ref: contracts.quote_id > quotes.id
Ref: contracts.account_manager_employee_id > employees.id
Ref: contract_versions.contract_id > contracts.id
Ref: contract_versions.created_by_employee_id > employees.id
Ref: subscriptions.contract_id > contracts.id
Ref: subscriptions.product_id > products.id
Ref: subscriptions.current_contract_version_id > contract_versions.id
Ref: invoices.customer_id > customers.id
Ref: invoices.contract_id > contracts.id
Ref: invoices.issued_by_company_id > companies.id
Ref: invoice_line_items.invoice_id > invoices.id
Ref: invoice_line_items.subscription_id > subscriptions.id
Ref: invoice_line_items.product_id > products.id
Ref: payments.invoice_id > invoices.id
Ref: payments.customer_id > customers.id
Ref: support_cases.customer_id > customers.id
Ref: support_cases.contact_id > customer_contacts.id
Ref: support_cases.assigned_employee_id > employees.id
Ref: support_cases.related_subscription_id > subscriptions.id
Ref: case_comments.support_case_id > support_cases.id
Ref: case_comments.author_employee_id > employees.id
Ref: case_comments.author_contact_id > customer_contacts.id
Ref: audit_events.company_id > companies.id
Ref: audit_events.actor_user_account_id > user_accounts.id
Ref: audit_events.customer_id > customers.id
Ref: audit_events.contract_id > contracts.id
Ref: audit_events.invoice_id > invoices.id
Ref: audit_events.support_case_id > support_cases.id
`,
  },
]

export const DEFAULT_DBML_PRESET = DBML_PRESETS[0]
