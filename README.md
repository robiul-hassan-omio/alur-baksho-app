# Alur Baksho

A social storytelling app built with **HTML, CSS and vanilla JavaScript**. The hosted version is a static GitHub Pages site backed by **Supabase Auth + PostgreSQL**. The original Express + MariaDB implementation is retained as a separate local/coursework backend.

## What runs where?

| Part | Cloud version | Local/coursework version |
|---|---|---|
| Website | GitHub Pages (static HTML/CSS/JS) | Python HTTP server or Live Server |
| Authentication | Supabase Auth | Express session endpoints |
| Database | Supabase PostgreSQL (`supabase/schema.sql`) | MariaDB (`database/alur_baksho.sql`) |
| Authorization | PostgreSQL Row Level Security | Express middleware + parameterized MySQL queries |

The Supabase and MariaDB databases are **separate databases**. Creating the Supabase schema does not delete or modify your local MariaDB database.

## Features

- Email/password registration and sign-in through Supabase Auth
- Publicly readable feed and comments; signed-in members can create posts/comments
- Edit/delete only your own posts and delete only your own comments
- Profile names and optional avatar URL
- Relative timestamps and a personal-story filter
- Responsive layout, aligned SVG icons, CSS-only Light/Dark/Ocean/Lavender theme presets
- GitHub Actions workflow to publish the `frontend/` folder to GitHub Pages

## Cloud database: Supabase

1. Create a Supabase project and open **SQL Editor**.
2. Copy and run [`supabase/schema.sql`](supabase/schema.sql). It creates `profiles`, `posts` and `comments`, enables RLS, installs ownership policies, and creates a profile automatically when Supabase Auth registers a user.
3. In **Project Settings → API**, copy the Project URL and the **publishable** key (`sb_publishable_...`; older projects may show the `anon` key).
4. For local browser testing, place those values in `frontend/js/config.js`:

   ```js
   window.ALUR_BAKSHO_CONFIG = Object.freeze({
     supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
     supabasePublishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY'
   });
   ```

5. In **Authentication → URL Configuration**, set the Site URL to `https://robiul-hassan-omio.github.io/alur-baksho-app` and add these Redirect URLs:
   - `https://robiul-hassan-omio.github.io/alur-baksho-app/**`
   - `http://127.0.0.1:5500/**`
   - `http://localhost:5500/**`

   Email confirmation can remain enabled. New users then receive a confirmation email before their first sign-in.

### Important Supabase key safety

The browser uses only the project's **publishable key**. It is expected to be visible in a public static website; Row Level Security (RLS) is what protects the data. **Never use or publish a `service_role` key, secret key, database password, or personal access token in frontend code or GitHub.**

## Run the cloud-connected website locally

After configuring `frontend/js/config.js`, open two terminals or use any static web server.

```bash
cd frontend
python -m http.server 5500
```

Open `http://127.0.0.1:5500`. The Supabase cloud database is used directly, so you do not need to start Node.js or MariaDB for this version.

## GitHub Pages deployment

This repository includes `.github/workflows/deploy-pages.yml`. It deploys only `frontend/`, so the Express backend, MariaDB files and local dependencies are not placed on the public website.

1. On GitHub, open **Settings → Secrets and variables → Actions → Variables** for this repository.
2. Add these repository variables:
   - `SUPABASE_URL` — the Supabase Project URL.
   - `SUPABASE_PUBLISHABLE_KEY` — the Supabase publishable key (or legacy anon key if that is what your project provides).
3. Open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
4. Push to `main` or run **Actions → Deploy Alur Baksho to GitHub Pages → Run workflow**.
5. When the workflow completes, the public site will be at `https://robiul-hassan-omio.github.io/alur-baksho-app/`.

The workflow fails safely if either public Supabase variable is missing. It injects them into the build artifact and does not commit credentials into the repository.

## Local MariaDB / Express version (retained)

The original course backend is still available in `backend/` and the original MySQL-compatible schema remains at `database/alur_baksho.sql`.

On Arch Linux, if MariaDB is already initialized, do **not** run `mariadb-install-db` again. Start the service:

```bash
sudo systemctl enable --now mariadb
```

Import the local schema from the project root:

```bash
sudo mariadb < database/alur_baksho.sql
```

Create or reset a local application account as needed:

```sql
CREATE USER 'alur_app'@'localhost' IDENTIFIED BY 'YOUR_LOCAL_PASSWORD';
GRANT ALL PRIVILEGES ON alur_baksho.* TO 'alur_app'@'localhost';
FLUSH PRIVILEGES;
```

Copy `backend/.env.example` to `backend/.env`, set the MariaDB credentials, and run:

```bash
cd backend
npm install
npm run dev
```

The local Express backend is a retained coursework/demo path. The new GitHub Pages frontend talks directly to Supabase and does not use this Express server.

## Theme controls

The Appearance panel is implemented with HTML radio inputs and CSS `:has()` selectors. It offers Light, Dark, Ocean and Lavender presets without adding theme JavaScript. Because the selector is intentionally CSS-only, the selected theme applies to the current page and resets when you navigate/reload.

## Project layout

```text
alur-baksho-app/
├── .github/workflows/deploy-pages.yml
├── backend/                  # retained local Express + MySQL version
├── database/alur_baksho.sql  # local MariaDB schema
├── supabase/schema.sql       # cloud PostgreSQL schema + RLS policies
├── docs/                     # course notes, presentation and contribution log
├── frontend/                 # static site deployed to GitHub Pages
│   ├── assets/css/styles.css
│   ├── js/config.js          # public URL/key placeholders; local config only
│   ├── js/utils/supabase.js
│   └── ...
└── README.md
```

## Validation checklist

- [ ] Apply `supabase/schema.sql` in the intended Supabase project.
- [ ] Add the Supabase URL and publishable key to local config / GitHub repository variables.
- [ ] Set Supabase Auth Site URL and Redirect URLs.
- [ ] Register two test accounts and confirm email if enabled.
- [ ] Create a post, add a comment, edit/delete your own post and delete your own comment.
- [ ] Verify a second account cannot edit or delete the first account's content.
- [ ] Verify a logged-out visitor cannot write data.
- [ ] Verify the GitHub Pages Actions workflow finishes successfully.

## Original coursework documentation

See `docs/COURSE_IMPLEMENTATION_NOTES.md`, `docs/PRESENTATION_AND_VIVA.md`, `docs/TEAM_CONTRIBUTION_LOG.md`, `docs/VIDEO_REVIEW.md`, and `ER_DIAGRAM.md` for the original course-specific documentation. The ER diagram describes the local MySQL model; the cloud model is described in `supabase/schema.sql`.
