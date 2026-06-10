export const INITIAL_DBML_DOCUMENT = `Project dbml_drawer {
  database_type: "PostgreSQL"
  Note: "Simple DBML document"
}

Table users {
  id integer [pk, increment]
  email varchar [not null, unique]
  name varchar
  created_at timestamp [default: \`now()\`]
}

Table posts {
  id integer [pk, increment]
  user_id integer [not null]
  title varchar [not null]
  body text
  created_at timestamp [default: \`now()\`]
}

Ref: posts.user_id > users.id
`
