# Course implementation notes — source mapping

These notes summarize the instructor's **SU CSE 236 Backend Development** numbered video sequence and the accessible Bengali transcripts. The playlist link supplied in chat and the instructor's own course playlist are not the same playlist IDs; the available playlist lookup did not return a complete item list for the link supplied in chat. Therefore, the notes below map the instructor's matching backend series rather than claiming that every item in the supplied playlist was individually watched end-to-end.

## Course source and implementation decisions

| Lesson | Instructor topic | Main idea reflected in Alur Baksho |
|---|---|---|
| Part 1 | Installing XAMPP | XAMPP/phpMyAdmin manages the MySQL database; database tables are planned before backend coding. |
| Part 2 | Installing Express JS | Separate frontend/backend folders; `npm init`, Express, MySQL, CORS, JSON middleware, port 5000, `index.js`, and nodemon. |
| Part 3 | Connecting XAMPP DBMS with Express | `mysql.createConnection`, host/user/password/database configuration, `db.connect`, and connection error handling. |
| Part 4 | Connecting DB and beginning user login | User table fields, public profile image URL, login page, separate login JS, input collection, and a `fetchUserInfo`-style function. |
| Part 5 | Updated backend flow | `fetch`, HTTP methods, JSON headers/body, `JSON.stringify`, `async`/`await`, `try`/`catch`/`finally`. |
| Part 6 | Connecting frontend login request to Express | Express `app.post`, `req.body`, object destructuring, SQL placeholders, and passing values separately to `db.query`. |
| Part 7 | Login error handling and page transition | Return the user data, show a useful message for an empty result, and move to the app after a valid login. |
| Part 8 | Designing the page | Create a reusable post card design first; later insert live database values into the designed structure. |
| Part 9 | Fetching posts from server | Posts table with post ID, author ID, timestamp, text, and image URL; join the users table to obtain author details; order latest first. |
| Part 10 | Showing posts in the frontend | Use `fetch()` and DOM manipulation to create a post element for each row and append it to the post container. |
| Part 11 | Showing posts and comments | Join comments with users to show commenter name/image, filter comments by post ID, and render each post's own comment list. |
| Part 12 | Adding comments in a post | Create the comment input/button for each post and send comment data from the frontend to the backend. |
| Part 13 | Implementing logout | Persist the logged-in user in `localStorage`, show that user's username, clear saved login state on logout, and return to login when no user is saved. |
| Part 14 | Adding a new post | Collect post text/image, get current user ID from saved user data, send a POST request, and insert a row in MySQL. |
| Part 15 | Utility function for time difference | Put a reusable `calculateTimeDifference` function in a utilities folder and show a relative time label. |

## Existing GitHub coursework reference inspected

The connected GitHub account contains `robiul-hassan-omio/lab-api-integration`, a plain-JavaScript Fetch API practice project. Its `js/store.js` uses `fetch()`, `async`/`await`, JSON responses, and DOM rendering with `createElement`/`appendChild`. That matches the instructor's client-side style, so Alur Baksho keeps the same browser-native request and DOM approach. This repository was inspected read-only and was not edited. The separate `FrogSlayer69/web-programming` repository is an unrelated banking/fintech dashboard and was not used.

## The preserved request flow

### Login

```text
login form
  → handleLogin() collects values
  → creates one user object
  → fetchUserInfo(user) sends POST JSON
  → Express /get_user_info receives req.body
  → MySQL query uses placeholders and a values array
  → server returns the public user record
  → frontend saves login_user in localStorage
  → feed.html opens
```

The browser-side sequence and use of separate functions, JSON, `fetch`, and async/await are retained. Two security improvements were added on the server side: passwords are hashed using bcrypt, and a random session token is checked by protected endpoints. These additions do not require a frontend framework or replace the course's fetch/request model.

### Feed and comments

```text
feed page loads
  → GET /get_all_posts
  → Express runs a SELECT with a JOIN between posts and users
  → frontend builds one post card per returned row
  → each post calls GET /get_comments/:postId
  → Express joins comments and users
  → frontend appends each comment inside its parent post
```

### Create, update, delete

The teacher's series demonstrates creating posts and comments. The assignment separately requires a CRUD example, so this project adds `PUT /update_post/:postId` and `DELETE /delete_post/:postId` for a user's own posts. The same parameterized `db.query(sql, values, callback)` approach is retained.

## Database entities

- `users`: account and profile fields.
- `posts`: each post belongs to one user.
- `comments`: each comment belongs to one user and one post.
- `auth_sessions`: database-backed login sessions; this is an added protection layer.

See `../ER_DIAGRAM.md` for keys, field types, and cardinality.

## What could not be independently verified

- The supplied playlist's full item list was not exposed by the accessible playlist lookup.
- Video transcripts do not reveal every visual action or every character of code shown on screen; transcript summaries are not equivalent to frame-by-frame viewing.
- A teacher-owned GitHub repository URL could not be confidently identified from the accessible video descriptions/search. No unrelated repository was assumed to be his.
