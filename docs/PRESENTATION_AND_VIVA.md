# Presentation and viva preparation

The assignment specifies a 4–6 minute presentation and explicitly says **do not show code**. Demonstrate the running app, database/ER diagram if asked, and each member's actual contribution. The sample script below is approximately 4 minutes 45 seconds at a calm speaking pace.

## 4–6 minute demo script

### 0:00–0:25 — Introduction

“Assalamu Alaikum. Our project is **Alur Baksho**, a small social storytelling platform. The idea is to give users a place to share short thoughts, moments, and images, and to interact through comments. We built it using HTML, CSS, JavaScript, Node.js, Express, and MySQL.”

### 0:25–1:05 — Account flow

“First, a new user can create an account with a username, email, and password. The application validates the information and then takes the user to the feed. Existing users can sign in with their username or email. An incorrect password or unknown account produces an error message. The feed is protected, so a visitor without a valid login is sent back to the sign-in page.”

**Live demo:** show the registration page, create a test account, sign out, and sign back in. Do not use a personal password in the presentation.

### 1:05–2:00 — Feed and comments

“After signing in, the user sees the latest stories. Each post shows its author, time, text, and optional image. The author can create a new post, and other signed-in users can leave comments. The page also allows a user to filter their own posts.”

**Live demo:** create one short post, add an image URL only if the internet is available, then add a comment from a second test account.

### 2:00–2:45 — CRUD demonstration

“We demonstrate all four CRUD operations. Create is shown when a user publishes a post. Read is shown when the feed loads posts and comments. Update is shown when the author edits their own post. Delete is shown when the author removes their own post. A user cannot edit or delete someone else's post.”

**Live demo:** edit a post, save it, then delete a different test post. Do not delete the only useful sample post.

### 2:45–3:25 — Database design

“Our database has four entities: users, posts, comments, and login sessions. One user can create many posts. One post can receive many comments. One user can also write many comments. We use primary keys and foreign keys to keep the relationships consistent. The ER diagram documents the data types and cardinalities.”

**Show:** `ER_DIAGRAM.md` rendered in a Markdown viewer, or phpMyAdmin's table structure. Do not show source code.

### 3:25–4:10 — Security and implementation

“The browser sends JSON requests using the Fetch API. Express handles the requests and communicates with MySQL. We use parameterized SQL queries, so input values are passed separately from the SQL statement. Passwords are hashed, and protected API requests must present a valid session token. Error handling is included so a failed request produces a useful message rather than silently breaking the page.”

### 4:10–4:45 — Challenge, contribution, close

“One challenge was connecting the frontend, backend, and database while keeping the data structure consistent. We solved this by planning the ER diagram first, testing the queries, and then connecting the frontend through separate request functions. Our team divided work across interface, API/database, and testing. Each member's specific contribution is recorded in our repository. Thank you.”

Replace the team-work sentence with the true names and contributions of your members. Do not claim a contribution that a member did not make.

## Demo checklist

- [ ] Start MySQL and import the SQL file before the presentation.
- [ ] Start the Express server and frontend server.
- [ ] Create at least two demo accounts in advance.
- [ ] Have one sample post and one sample comment ready.
- [ ] Demonstrate invalid login once, then successful login.
- [ ] Demonstrate create, read, update, and delete.
- [ ] Show that logging out blocks access to the feed.
- [ ] Keep `ER_DIAGRAM.md` ready to show.
- [ ] Do not display code during the presentation.
- [ ] Mention every member's real contribution.

## Viva practice questions

**1. What is the frontend?**  
The part users interact with in the browser. In this project it is HTML, CSS, and JavaScript.

**2. What is the backend?**  
The server-side part. Express receives browser requests, validates them, communicates with MySQL, and sends responses.

**3. What is Node.js?**  
A JavaScript runtime that lets JavaScript run outside the browser, including on a server.

**4. What is Express?**  
A Node.js web framework used here to define API routes such as `GET /get_all_posts` and `POST /add_post`.

**5. What is an API?**  
A defined interface that lets one program request data or an action from another program. The browser calls the Express API in this project.

**6. What is the difference between GET and POST?**  
GET is used to retrieve data. POST sends data to the server, commonly to create a resource or submit a form. Sensitive values should not be put in a URL.

**7. What are PUT and DELETE used for?**  
PUT updates an existing resource. DELETE removes a resource. Alur Baksho uses them for a user's own posts.

**8. What does `async`/`await` do?**  
It lets asynchronous work such as `fetch()` be written in a readable sequence. `await` pauses that async function until the Promise settles.

**9. Why use `try`/`catch`?**  
To handle possible failures, such as a failed request or database operation, and return a controlled error instead of leaving the operation unhandled.

**10. What is MySQL?**  
A relational database management system that stores structured data in tables.

**11. What is a primary key?**  
A column (or set of columns) that uniquely identifies each row in a table. For example, `users.user_id`.

**12. What is a foreign key?**  
A column that references a key in another table. `posts.posted_user_id` references `users.user_id`.

**13. What is a one-to-many relationship in this project?**  
One user can create many posts, but each post has one author.

**14. What is SQL injection and how is it prevented here?**  
It is an attack where malicious input changes the meaning of an SQL statement. We use parameterized queries with `?` placeholders and pass values separately to `db.query`.

**15. Why hash passwords?**  
A password hash is not the original password. If the database is exposed, hashing makes it harder for someone to recover users' passwords. We use bcryptjs for password hashing and comparison.

**16. Why use `localStorage`?**  
It keeps a small amount of browser data across page navigation and reloads. Here it stores the public profile and token so the app can remember the signed-in user. The server still validates the token for protected operations.

**17. Why have an ER diagram before creating tables?**  
It helps plan entities, attributes, keys, and relationships before coding, reducing inconsistent or duplicated data.

**18. What is CRUD?**  
Create, Read, Update, and Delete—the four basic operations for managing stored data.

**19. Why separate utility functions?**  
To reuse common logic and follow DRY (Don't Repeat Yourself). The time-difference function is a shared utility.

**20. What is Git and what is GitHub?**  
Git is a version-control system that records project history. GitHub hosts Git repositories online and supports collaboration through branches and pull requests.
