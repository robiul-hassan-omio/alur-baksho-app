# Moving local MariaDB data to Supabase

The Supabase schema is a separate database; running it does not automatically copy local MariaDB records.

## Accounts

Do not copy the MariaDB `users.password_hash` values into `auth.users`. Supabase Auth owns password storage and uses its own password hashing/session system. Each person should create a new account through the Alur Baksho registration page. The new Supabase Auth UUID is then used as `profiles.id`, `posts.user_id`, and `comments.user_id`.

## Posts and comments

If the local MariaDB database contains posts/comments worth keeping, first export them from MariaDB. Create a mapping from each old `users.user_id` to the corresponding new Supabase Auth UUID after the person has registered. Then insert the posts/comments using that UUID mapping. Do not import the old integer IDs as Supabase Auth IDs. The tables and field names differ intentionally: `posts.post_id` maps to `posts.id`, `posted_user_id` maps to `user_id`, `posted_text` maps to `content`, and corresponding `comments` fields map to `id`, `post_id`, `user_id`, and `content`.

The project currently creates an empty Supabase cloud database and leaves the original MariaDB database intact. No local records are migrated automatically.
