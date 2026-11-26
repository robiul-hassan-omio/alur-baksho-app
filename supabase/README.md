# Supabase database

Run [`schema.sql`](schema.sql) in the Supabase SQL Editor. This PostgreSQL schema is separate from the local MariaDB schema under `database/`.

The schema uses Supabase Auth for identity, `profiles` for public display data, and `posts` / `comments` for social content. All public tables have Row Level Security enabled. The browser uses a publishable key only; never add a service-role key to the frontend.
