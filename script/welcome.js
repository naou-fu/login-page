const welcomeText = document.getElementById('welcome-text');
const statusMessage = document.getElementById('status-message');
const logoutButton = document.getElementById('logout-button');

async function getCsrfToken() {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.token;
}

async function fetchProfile() {
  const response = await fetch('/auth/me', { method: 'GET', credentials: 'same-origin' });
  if (!response.ok) {
    window.location.assign('/');
    return;
  }
  const user = await response.json();
  welcomeText.textContent = `Welcome, ${user.username}!`;
}

async function logout() {
  try {
    const token = await getCsrfToken();
    const response = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token,
      },
    });

    if (response.ok) {
      window.location.assign('/');
      return;
    }

    const data = await response.json();
    statusMessage.textContent = data.error || 'Unable to log out. Please try again.';
  } catch (err) {
    statusMessage.textContent = 'Unexpected logout error.';
    console.error(err);
  }
}

window.addEventListener('DOMContentLoaded', fetchProfile);
logoutButton.addEventListener('click', logout);
