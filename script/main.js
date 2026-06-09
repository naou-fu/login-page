// main.js powers the login page in the browser.
// It reads form values, requests a CSRF token, and calls the /auth/login API.
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('btn-submit');
const loginMessage = document.getElementById('login-message');

// Fetch the CSRF token from the server to protect against cross-site request forgery.
async function getCsrfToken() {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.token;
}

// signIn validates the form, sends credentials, and navigates on success.
async function signIn() {
  loginMessage.textContent = '';

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    loginMessage.textContent = 'Please enter both username and password.';
    return;
  }

  const token = await getCsrfToken();
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token,
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    loginMessage.textContent = data.error || (data.errors && data.errors.join(' ')) || 'Login failed.';
    return;
  }

  window.location.assign('/welcome');
}

submitButton.addEventListener('click', signIn);
passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    signIn();
  }
});
