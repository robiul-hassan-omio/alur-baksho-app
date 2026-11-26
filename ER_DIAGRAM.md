# Alur Baksho — ER diagram

```mermaid
erDiagram
    USERS ||--o{ POSTS : creates
    USERS ||--o{ COMMENTS : writes
    POSTS ||--o{ COMMENTS : receives
    USERS ||--o{ AUTH_SESSIONS : owns

    USERS {
        INT user_id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR user_image_url
        TIMESTAMP created_at
    }
    POSTS {
        INT post_id PK
        INT posted_user_id FK
        DATETIME posted_time
        TEXT posted_text
        VARCHAR posted_image_url
        TIMESTAMP updated_at
    }
    COMMENTS {
        INT comment_id PK
        INT comments_of_post_id FK
        INT commented_user_id FK
        VARCHAR comment_text
        DATETIME commented_time
    }
    AUTH_SESSIONS {
        BIGINT session_id PK
        INT user_id FK
        CHAR token_hash UK
        DATETIME expires_at
        TIMESTAMP created_at
    }
```

## Keys, data types and cardinality

| Relationship | Cardinality | Meaning |
|---|---|---|
| `users.user_id` → `posts.posted_user_id` | One-to-many (1:M) | One user can create many posts; each post has one author. |
| `users.user_id` → `comments.commented_user_id` | One-to-many (1:M) | One user can write many comments; each comment has one author. |
| `posts.post_id` → `comments.comments_of_post_id` | One-to-many (1:M) | One post can receive many comments; each comment belongs to one post. |
| `users.user_id` → `auth_sessions.user_id` | One-to-many (1:M) | One user can have multiple active sessions/devices. |

`user_id`, `post_id`, `comment_id`, and `session_id` are primary keys. The `posted_user_id`, `commented_user_id`, `comments_of_post_id`, and `auth_sessions.user_id` columns are foreign keys. `username`, `email`, and `token_hash` have unique constraints. Posts and comments use `ON DELETE CASCADE` so child rows do not become orphaned when their parent is deleted.
