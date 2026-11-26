CREATE DATABASE IF NOT EXISTS alur_baksho
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE alur_baksho;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_image_url VARCHAR(2048) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  post_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  posted_user_id INT UNSIGNED NOT NULL,
  posted_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  posted_text TEXT NOT NULL,
  posted_image_url VARCHAR(2048) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id),
  KEY idx_posts_posted_time (posted_time),
  KEY idx_posts_posted_user_id (posted_user_id),
  CONSTRAINT fk_posts_user
    FOREIGN KEY (posted_user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comments (
  comment_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  comments_of_post_id INT UNSIGNED NOT NULL,
  commented_user_id INT UNSIGNED NOT NULL,
  comment_text VARCHAR(1000) NOT NULL,
  commented_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  KEY idx_comments_post_id (comments_of_post_id),
  KEY idx_comments_user_id (commented_user_id),
  CONSTRAINT fk_comments_post
    FOREIGN KEY (comments_of_post_id) REFERENCES posts(post_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (commented_user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_sessions (
  session_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id),
  UNIQUE KEY uq_auth_sessions_token_hash (token_hash),
  KEY idx_auth_sessions_user_id (user_id),
  CONSTRAINT fk_auth_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Optional sample post rows can be inserted after creating a user through the app.
-- The application does not require any manually seeded credentials.
