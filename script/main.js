//checking user data

let userData = null;

fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        userData = data.users;
        console.log('Data loaded:', userData);
    })
    .catch(error => console.error('Error loading data:', error));

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('btn-submit');



submitButton.addEventListener('click', () => {
    if (!userData) {
        alert('Data still loading. Please wait.');
        return;
    }
    
    const enteredUsername = usernameInput.value.trim();
    const enteredPassword = passwordInput.value.trim();
    
    // Search through the user ARRAY for a match
    const matchedUser = userData.find(user => 
        user.username === enteredUsername && user.password === enteredPassword
    );
    
    if (matchedUser) {
        alert(`Login successful! Welcome, ${matchedUser.username}.`);
    } else {
        alert('Invalid username or password.');
    }
});

