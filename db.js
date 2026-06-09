// db.js manages the SQLite database and simple user queries.
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data.db');

// Open a SQLite file-based database. The file will be created on disk if it does not exist.
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
    throw err;
  }
});

// Helper wrapper for SQL statements that write data.
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

// Helper wrapper for SQL statements that read a single row.
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

// Create the users table if it does not already exist.
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

// Find a user by username without returning the password hash.
export async function findUserByUsername(username) {
  return get('SELECT id, username, metadata FROM users WHERE username = ?', [username]);
}

// Find a user by username and include the password hash for login checks.
export async function getUserWithPassword(username) {
  return get('SELECT * FROM users WHERE username = ?', [username]);
}

// Find a user by their numeric id.
export async function getUserById(id) {
  return get('SELECT id, username, metadata FROM users WHERE id = ?', [id]);
}

// Insert a new user record with hashed password and starter metadata.
export async function createUser(username, passwordHash) {
  const metadata = JSON.stringify({ registeredAt: new Date().toISOString(), role: 'user' });
  return run('INSERT INTO users (username, password_hash, metadata) VALUES (?, ?, ?)', [username, passwordHash, metadata]);
}
