// Alur Baksho backend — Express + MySQL, following the course's request/handler flow.
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const SESSION_DAYS = Math.max(1, Number(process.env.SESSION_DAYS) || 7);

// Middleware parses JSON request bodies and permits the separate Live Server frontend.
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500'
}));
app.use(express.json({ limit: '1mb' }));

// The instructor uses mysql.createConnection and db.query callbacks; this project keeps that pattern.
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alur_baksho',
  charset: 'utf8mb4'
});

db.connect((error) => {
  if (error) {
    console.error('Something went wrong while connecting to the database:', error.message);
    console.error('Check that MySQL is running and backend/.env matches your local database.');
    return;
  }

  console.log('MySQL server connected.');
});

function sendDatabaseError(res, label, error) {
  console.error(label, error);
  return res.status(500).json({ message: 'A database error occurred. Please try again.' });
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createLoginSession(userId, callback) {
  const token = createToken();
  const tokenHash = hashToken(token);
  const sql = `
    INSERT INTO auth_sessions (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `;
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  db.query(sql, [userId, tokenHash, expiresAt], (error) => {
    callback(error, token);
  });
}

// Protected handlers validate the bearer token against the database before doing CRUD work.
function requireLogin(req, res, next) {
  const authorizationHeader = req.get('Authorization') || '';
  const token = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7).trim()
    : '';

  if (!token) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  const sql = `
    SELECT u.user_id, u.username, u.email, u.user_image_url
    FROM auth_sessions AS s
    INNER JOIN users AS u ON u.user_id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > NOW()
    LIMIT 1
  `;

  db.query(sql, [hashToken(token)], (error, results) => {
    if (error) return sendDatabaseError(res, 'Error validating login session:', error);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }

    req.loggedInUser = results[0];
    req.sessionTokenHash = hashToken(token);
    next();
  });
}

app.get('/', (req, res) => {
  res.json({
    application: 'Alur Baksho API',
    status: 'running',
    message: 'The server is ready to receive requests.'
  });
});

// REGISTER — creates a user and signs them in after successful registration.
app.post('/register_user', (req, res) => {
  const { username, email, password, user_image_url } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }
  if (String(username).trim().length < 3 || String(username).trim().length > 60) {
    return res.status(400).json({ message: 'Username must be between 3 and 60 characters.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (user_image_url && !/^https?:\/\//i.test(String(user_image_url).trim())) {
    return res.status(400).json({ message: 'Profile image URL must start with http:// or https://.' });
  }

  bcrypt.hash(String(password), 12, (hashError, passwordHash) => {
    if (hashError) {
      console.error('Error hashing password:', hashError);
      return res.status(500).json({ message: 'Could not create your account.' });
    }

    const sql = `
      INSERT INTO users (username, email, password_hash, user_image_url)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      String(username).trim(),
      String(email).trim().toLowerCase(),
      passwordHash,
      user_image_url ? String(user_image_url).trim() : null
    ];

    db.query(sql, values, (error, result) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'That username or email is already registered.' });
        }
        return sendDatabaseError(res, 'Error creating user:', error);
      }

      const user = {
        user_id: result.insertId,
        username: values[0],
        email: values[1],
        user_image_url: values[3],
        created_at: new Date().toISOString()
      };

      createLoginSession(user.user_id, (sessionError, token) => {
        if (sessionError) return sendDatabaseError(res, 'Error creating login session:', sessionError);
        return res.status(201).json({ message: 'Your account is ready.', user, token });
      });
    });
  });
});

// LOGIN — the frontend still sends one user object through fetch() as in the lesson.
// Password verification is performed on the server; raw passwords are never stored in MySQL.
app.post('/get_user_info', (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Enter your username/email and password.' });
  }

  const sql = `
    SELECT user_id, username, email, password_hash, user_image_url, created_at
    FROM users
    WHERE email = ? OR username = ?
    LIMIT 1
  `;

  db.query(sql, [String(identifier).trim().toLowerCase(), String(identifier).trim()], (error, results) => {
    if (error) return sendDatabaseError(res, 'Error getting user info:', error);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Account not found or password is incorrect.' });
    }

    const databaseUser = results[0];
    bcrypt.compare(String(password), databaseUser.password_hash, (compareError, passwordMatches) => {
      if (compareError) {
        console.error('Error checking password:', compareError);
        return res.status(500).json({ message: 'Could not verify your login.' });
      }
      if (!passwordMatches) {
        return res.status(401).json({ message: 'Account not found or password is incorrect.' });
      }

      createLoginSession(databaseUser.user_id, (sessionError, token) => {
        if (sessionError) return sendDatabaseError(res, 'Error creating login session:', sessionError);

        const user = {
          user_id: databaseUser.user_id,
          username: databaseUser.username,
          email: databaseUser.email,
          user_image_url: databaseUser.user_image_url,
          created_at: databaseUser.created_at
        };
        return res.json({ message: 'Welcome back.', user, token });
      });
    });
  });
});

// READ — the INNER JOIN gives each post its author's name and profile image.
app.get('/get_all_posts', requireLogin, (req, res) => {
  const sql = `
    SELECT
      p.post_id,
      p.posted_user_id,
      p.posted_time,
      p.posted_text,
      p.posted_image_url,
      p.updated_at,
      u.username AS posted_username,
      u.user_image_url AS posted_user_image
    FROM posts AS p
    INNER JOIN users AS u ON u.user_id = p.posted_user_id
    ORDER BY p.posted_time DESC, p.post_id DESC
  `;

  db.query(sql, (error, results) => {
    if (error) return sendDatabaseError(res, 'Error fetching posts:', error);
    return res.json(results);
  });
});

// READ — comments are filtered by post and joined with their author records.
app.get('/get_comments/:postId', requireLogin, (req, res) => {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ message: 'Invalid post ID.' });
  }

  const sql = `
    SELECT
      c.comment_id,
      c.comments_of_post_id,
      c.commented_user_id,
      c.comment_text,
      c.commented_time,
      u.username AS commented_username,
      u.user_image_url AS commented_user_image
    FROM comments AS c
    INNER JOIN users AS u ON u.user_id = c.commented_user_id
    WHERE c.comments_of_post_id = ?
    ORDER BY c.commented_time ASC, c.comment_id ASC
  `;

  db.query(sql, [postId], (error, results) => {
    if (error) return sendDatabaseError(res, 'Error fetching comments:', error);
    return res.json(results);
  });
});

// CREATE — the author ID comes from the verified session, not from a client-supplied ID.
app.post('/add_post', requireLogin, (req, res) => {
  const { posted_text, posted_image_url } = req.body || {};
  const cleanText = String(posted_text || '').trim();
  const cleanImageUrl = posted_image_url ? String(posted_image_url).trim() : null;

  if (!cleanText) return res.status(400).json({ message: 'Write something before posting.' });
  if (cleanText.length > 5000) return res.status(400).json({ message: 'Post text is too long.' });
  if (cleanImageUrl && !/^https?:\/\//i.test(cleanImageUrl)) {
    return res.status(400).json({ message: 'Image URL must start with http:// or https://.' });
  }

  const sql = `
    INSERT INTO posts (posted_user_id, posted_time, posted_text, posted_image_url)
    VALUES (?, NOW(), ?, ?)
  `;

  db.query(sql, [req.loggedInUser.user_id, cleanText, cleanImageUrl], (error, result) => {
    if (error) return sendDatabaseError(res, 'Error creating post:', error);
    return res.status(201).json({ message: 'Your story has been posted.', post_id: result.insertId });
  });
});

// UPDATE — only the original author can update their own post.
app.put('/update_post/:postId', requireLogin, (req, res) => {
  const postId = Number(req.params.postId);
  const { posted_text, posted_image_url } = req.body || {};
  const cleanText = String(posted_text || '').trim();
  const cleanImageUrl = posted_image_url ? String(posted_image_url).trim() : null;

  if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ message: 'Invalid post ID.' });
  if (!cleanText) return res.status(400).json({ message: 'Post text cannot be empty.' });
  if (cleanText.length > 5000) return res.status(400).json({ message: 'Post text is too long.' });
  if (cleanImageUrl && !/^https?:\/\//i.test(cleanImageUrl)) {
    return res.status(400).json({ message: 'Image URL must start with http:// or https://.' });
  }

  const sql = `
    UPDATE posts
    SET posted_text = ?, posted_image_url = ?
    WHERE post_id = ? AND posted_user_id = ?
  `;

  db.query(sql, [cleanText, cleanImageUrl, postId, req.loggedInUser.user_id], (error, result) => {
    if (error) return sendDatabaseError(res, 'Error updating post:', error);
    if (result.affectedRows === 0) {
      // MySQL may report zero changed rows when the submitted values are identical.
      db.query('SELECT post_id FROM posts WHERE post_id = ? AND posted_user_id = ?', [postId, req.loggedInUser.user_id], (checkError, ownedPosts) => {
        if (checkError) return sendDatabaseError(res, 'Error verifying post ownership:', checkError);
        if (ownedPosts.length === 0) {
          return res.status(404).json({ message: 'Post not found or you do not have permission to edit it.' });
        }
        return res.json({ message: 'Your post is unchanged.' });
      });
      return;
    }
    return res.json({ message: 'Your post has been updated.' });
  });
});

// DELETE — deleting a post also deletes its comments through the foreign-key cascade.
app.delete('/delete_post/:postId', requireLogin, (req, res) => {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ message: 'Invalid post ID.' });

  const sql = 'DELETE FROM posts WHERE post_id = ? AND posted_user_id = ?';
  db.query(sql, [postId, req.loggedInUser.user_id], (error, result) => {
    if (error) return sendDatabaseError(res, 'Error deleting post:', error);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Post not found or you do not have permission to delete it.' });
    }
    return res.json({ message: 'Your post has been deleted.' });
  });
});

// CREATE — a comment belongs to one post and one verified user.
app.post('/add_comment', requireLogin, (req, res) => {
  const postId = Number(req.body && req.body.post_id);
  const commentText = String((req.body && req.body.comment_text) || '').trim();

  if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ message: 'Invalid post ID.' });
  if (!commentText) return res.status(400).json({ message: 'Write a comment first.' });
  if (commentText.length > 1000) return res.status(400).json({ message: 'Comment is too long.' });

  const sql = `
    INSERT INTO comments (comments_of_post_id, commented_user_id, comment_text, commented_time)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [postId, req.loggedInUser.user_id, commentText], (error, result) => {
    if (error) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ message: 'That post no longer exists.' });
      }
      return sendDatabaseError(res, 'Error creating comment:', error);
    }
    return res.status(201).json({ message: 'Comment added.', comment_id: result.insertId });
  });
});

// DELETE — users may remove their own comments.
app.delete('/delete_comment/:commentId', requireLogin, (req, res) => {
  const commentId = Number(req.params.commentId);
  if (!Number.isInteger(commentId) || commentId <= 0) {
    return res.status(400).json({ message: 'Invalid comment ID.' });
  }

  const sql = 'DELETE FROM comments WHERE comment_id = ? AND commented_user_id = ?';
  db.query(sql, [commentId, req.loggedInUser.user_id], (error, result) => {
    if (error) return sendDatabaseError(res, 'Error deleting comment:', error);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found or you do not have permission to remove it.' });
    }
    return res.json({ message: 'Comment removed.' });
  });
});

// LOGOUT — revoke the database session and then let the frontend clear localStorage.
app.post('/logout', requireLogin, (req, res) => {
  db.query('DELETE FROM auth_sessions WHERE token_hash = ?', [req.sessionTokenHash], (error) => {
    if (error) return sendDatabaseError(res, 'Error logging out:', error);
    return res.json({ message: 'You have been logged out.' });
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'The requested API endpoint was not found.' });
});

app.listen(PORT, () => {
  console.log(`Alur Baksho server is running on port ${PORT}.`);
});
