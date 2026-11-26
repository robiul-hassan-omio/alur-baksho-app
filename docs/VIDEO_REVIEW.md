# Instructor video sequence reviewed

The submitted playlist (`PLEmR0a-KeBpE`) resolves to a playlist titled **Web Programming Final Project** and its first item resolves to the instructor's XAMPP lesson. The instructor's own matching playlist found during lookup is **SU CSE 3100 / CSE 236 Full Stack Development (Backend Focus)** (`PLMA8fp8ifIZ-7_IyJ_j89c5Sdfwxu5kcw`). The full item listing for the submitted third-party playlist was not exposed by the playlist lookup, so the following is the numbered backend series associated with that first video. The item order should be cross-checked against the student's playlist display before treating it as a verified copy of that playlist.

**Viewing limitation:** the analysis used video metadata and available Bengali transcript/caption text. It was not a frame-by-frame watch of all 15 videos; captions cannot reveal every cursor action or code character shown visually. This file does not claim otherwise.

| Part | Video | Duration | Focus captured from the lesson |
|---:|---|---:|---|
| 1 | [Installing XAMPP](https://www.youtube.com/watch?v=FL8L7fGL5Is) | 12:32 | XAMPP control panel, Apache/MySQL, phpMyAdmin, database/table creation, basic SQL testing, and the role of Node versus MySQL. |
| 2 | [Installing Express JS](https://www.youtube.com/watch?v=4VCFVIWKWV8) | 19:23 | Project folders, `npm init`, Express/MySQL/CORS packages, JSON middleware, port 5000, `index.js`, nodemon, and a simple GET route. |
| 3 | [Connecting XAMPP DBMS with Express JS](https://www.youtube.com/watch?v=6sbdy_37ZCk) | 14:54 | Create the sample database and users table; connect Express to MySQL with `mysql.createConnection` and `db.connect`. |
| 4 | [Connecting DB and starting the login page](https://www.youtube.com/watch?v=eNYE8lPygcE) | 37:32 | Sample user data, hosted image URLs, login page HTML, separate `login.js`, DOM input reading, user object, and a separate fetch function (single-responsibility flow). |
| 5 | [Updated fetch/API flow](https://www.youtube.com/watch?v=xzfemmPznhQ) | 13:03 | GET/POST/PUT/DELETE overview, POST method config, JSON headers/body, `JSON.stringify`, `async`/`await`, and `try`/`catch`/`finally`. |
| 6 | [Connecting the login request to Express](https://www.youtube.com/watch?v=3EYcB6tlpXE) | 25:57 | `app.post('/get_user_info')`, `req.body`, object destructuring, parameterized SQL with question-mark placeholders, and sending query results back. |
| 7 | [Login errors and navigation](https://www.youtube.com/watch?v=MFi7XvnH470) | 24:25 | Show a hidden error panel only when login fails, return data from the fetch function, use `await`, and move to the next page after a valid result. |
| 8 | [Designing the page](https://www.youtube.com/watch?v=K5M9ZMWIOpQ) | 52:57 | Build the feed and post-card layout first, including post header, author, timestamp, text, image, comment area, input, and responsive sizing. |
| 9 | [Fetching posts from the server](https://www.youtube.com/watch?v=NCXBOY6Cp7c) | 43:12 | Posts table fields, post/user relationship, seed sample rows for testing, SQL JOIN for author data, and fetching the latest posts. |
| 10 | [Showing posts in the frontend](https://www.youtube.com/watch?v=0I-ms02-aIU) | 19:12 | Loop through the returned post array, create a post element, replace placeholder content with server data, and append each post into the container. |
| 11 | [Showing comments with posts](https://www.youtube.com/watch?v=Fpv7bdPTWk4) | 47:35 | Comments table, JOIN comments to users for name/avatar, filter by post ID, and place each comment list inside the matching post. Also explains why GET query values are visible in a URL and why passwords should be sent in a POST body. |
| 12 | [Adding comments in a post](https://www.youtube.com/watch?v=_Mxj6T1paWU) | 1:06:15 | Create a comment input/button for every post, collect text on click, send it to Express, and refresh the comment list. Emphasizes meaningful variable names, indentation, and reusing the prebuilt HTML template. |
| 13 | [Implementing logout](https://www.youtube.com/watch?v=pTbUMGHqC1k) | 32:06 | Read saved user info from `localStorage`, parse JSON, display the logged-in username, add a logout button, clear stored user data, and redirect to the login page when no user exists. |
| 14 | [Adding a new post](https://www.youtube.com/watch?v=PnuDODmrTzY) | 53:28 | Add text/image inputs, collect current user ID from stored login info, build a post object, send a POST request, insert into the posts table, and reuse existing request logic. |
| 15 | [Utility function for time difference](https://www.youtube.com/watch?v=N02yK_uYZww) | 43:17 | Create a `utils` folder, build a reusable date/time-difference function, compare current and saved timestamps, and show elapsed seconds/minutes/hours/days. |

## Additional related videos found on the same instructor channel

These are useful course resources but were **not confirmed as items in the specific playlist URL provided**:

- Git and GitHub Parts 1–3: [Part 1](https://www.youtube.com/watch?v=wHr4bbay84U), [Part 2](https://www.youtube.com/watch?v=8K9iZMzNDcQ), [Part 3](https://www.youtube.com/watch?v=GibmGyGB7rE).
- How to submit assignments: [SU CSE 236 How to submit assignments](https://www.youtube.com/watch?v=U-wIwqvtsw4). It demonstrates a public repository, `git init`, `git add .`, `git commit`, `git branch -M main`, `git remote add origin`, and `git push -u origin main`, then submitting the repository link.
- Group collaboration: [Working in group projects using Git and GitHub playlist](https://www.youtube.com/playlist?list=PLMA8fp8ifIZ9TAZE4D6c8XIC0eeKFlZDj).

## GitHub repository search

A teacher-owned example repository was not confidently identified from accessible video metadata, descriptions, and search results. No random project was treated as the instructor's repository. If the teacher's GitHub handle is shown visually in a particular video, that detail needs a direct screenshot or confirmed link to verify it.
