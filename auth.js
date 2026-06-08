import bcrypt from 'bcrypt';
import validator from 'validator';

export function sanitizeField(value) {
  const text = String(value || '').trim();
  return validator.escape(text);
}

export function validateUsernamePassword(username, password, allowShortPassword = false) {
  const errors = [];
  const normalizedUsername = String(username || '');
  const minPasswordLength = allowShortPassword ? 1 : 8;

  if (!normalizedUsername || normalizedUsername.length < 3) {
    errors.push('Username must be at least 3 characters.');
  }

  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(normalizedUsername)) {
    errors.push('Username may only contain letters, numbers, underscores, and dashes.');
  }

  if (!password || password.length < minPasswordLength) {
    if (allowShortPassword) {
      errors.push('Please enter a password.');
    } else {
      errors.push('Password must be at least 8 characters.');
    }
  } else if (!allowShortPassword) {
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.push('Password must contain letters and numbers.');
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}
