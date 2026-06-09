// auth.js contains functions for sanitizing input, validating credentials, and hashing passwords.
import bcrypt from 'bcrypt';
import validator from 'validator';

// sanitizeField converts any value to a safe string and escapes dangerous HTML.
// This helps stop injection or broken input when the value is later used.
export function sanitizeField(value) {
  const text = String(value || '').trim();
  return validator.escape(text);
}

// validateUsernamePassword checks username/password rules and returns an error list.
// allowShortPassword is used for login, where the password can be any non-empty value.
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
    // For registration we require at least one letter and one number.
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.push('Password must contain letters and numbers.');
    }
  }

  return { valid: errors.length === 0, errors };
}

// hashPassword uses bcrypt to securely hash a plaintext password.
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// comparePasswords checks a plaintext password against a stored hash.
export async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}
