import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
    throw err;
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

export async function initDb() {
  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );
}

export async function findUserByUsername(username) {
  return get('SELECT id, username, metadata FROM users WHERE username = ?', [username]);
}

export async function getUserWithPassword(username) {
  return get('SELECT * FROM users WHERE username = ?', [username]);
}

export async function getUserById(id) {
  return get('SELECT id, username, metadata FROM users WHERE id = ?', [id]);
}

export async function createUser(username, passwordHash) {
  const metadata = JSON.stringify({ registeredAt: new Date().toISOString(), role: 'user' });
  return run('INSERT INTO users (username, password_hash, metadata) VALUES (?, ?, ?)', [username, passwordHash, metadata]);
}
