# login-page

This project is a simple secure login site built with Express, SQLite, and client-side JavaScript.

## What is included

- `app.js`: Express server setup, security middleware, session handling, and authentication routes.
- `auth.js`: Input sanitization, username/password validation, and bcrypt password hashing.
- `db.js`: SQLite database access, table creation, and user queries.
- `templates/*.html`: Static pages for login, registration, welcome, and about.
- `script/*.js`: Client-side logic for sign in, registration, and welcome page interaction.
- `style/style.css`: Shared CSS for layout, form styling, and button interaction.
- `data.db`: SQLite database file created automatically on first run.

## How it works

1. The server initializes the SQLite database and creates the `users` table.
2. Helmet and CSRF middleware add security protections.
3. Session cookies are stored in a local SQLite session store.
4. The login page sends credentials to `/auth/login` using `fetch()`.
5. Registration goes through `/auth/register` and creates a hashed password.
6. Authenticated users are redirected to `/welcome` and can log out.

## Notes for learning

- Look at `app.js` to understand how Express middleware is composed.
- In `auth.js`, notice how input is cleaned and validated before using it.
- `db.js` shows basic SQL query wrappers using promises.
- `main.js`, `sign.js`, and `welcome.js` show how the browser interacts with the API.
- `style.css` demonstrates a small responsive card layout and form controls.

## Run the app

Install dependencies and start the server:

```bash
npm install
npm run start
```

Then open `http://localhost:8080/` in your browser.
