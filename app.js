import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import {
  initDb,
  getUserById,
  findUserByUsername,
  getUserWithPassword,
  createUser,
} from './db.js';
import {
  hashPassword,
  comparePasswords,
  sanitizeField,
  validateUsernamePassword,
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8080;
const app = express();
const SQLiteStore = SQLiteStoreFactory(session);

await initDb();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());
const trustProxy = process.env.NODE_ENV === 'production';
app.set('trust proxy', trustProxy);

app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: __dirname,
      table: 'sessions',
      concurrentDB: true,
    }),
    secret: process.env.SESSION_SECRET || 'replace-this-with-a-secure-value',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    },
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many failed auth attempts, try again later.' },
});

app.use(apiLimiter);
app.use(csurf());

app.use(express.static(path.join(__dirname, 'script')));
app.use(express.static(path.join(__dirname, 'style')));

app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function sendHtml(fileName, res) {
  res.sendFile(path.join(__dirname, 'templates', fileName), (err) => {
    if (err) {
      console.error('File error:', err.message);
      res.status(404).type('text/plain').send('Page not found');
    }
  });
}

app.get('/', (req, res) => sendHtml('index.html', res));
app.get('/sign-in', (req, res) => sendHtml('sign.html', res));
app.get('/welcome', requireAuth, (req, res) => sendHtml('welcome.html', res));
app.get('/about', (req, res) => sendHtml('about.html', res));

app.get('/api/csrf-token', (req, res) => {
  res.json({ token: req.csrfToken() });
});

app.get('/auth/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: 'Session expired' });
    }
    res.json({ username: user.username, metadata: JSON.parse(user.metadata) });
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register', authLimiter, async (req, res, next) => {
  try {
    const username = sanitizeField(req.body.username);
    const password = String(req.body.password || '');

    const { valid, errors } = validateUsernamePassword(username, password);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await hashPassword(password);
    const result = await createUser(username, passwordHash);

    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          reject(err);
          return;
        }
        req.session.userId = result.id;
        resolve();
      });
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login', authLimiter, async (req, res, next) => {
  try {
    const username = sanitizeField(req.body.username);
    const password = String(req.body.password || '');

    const { valid, errors } = validateUsernamePassword(username, password, true);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const user = await getUserWithPassword(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatches = await comparePasswords(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          reject(err);
          return;
        }
        req.session.userId = user.id;
        resolve();
      });
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout', requireAuth, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.use((err, req, res, next) => {
  if (err?.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  console.error('Server error:', err?.message || err);
  res.status(500).json({ error: 'Unexpected server error' });
});

const MAX_PORT_RETRIES = 5;

function startServer(port, retriesLeft) {
  const server = app.listen(port, () => {
    console.log(`app running on: http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE' && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, trying ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    console.error('Listen error:', err);
    process.exit(1);
  });
}

startServer(PORT, MAX_PORT_RETRIES);
