

let userdata = null;

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('btn-submit');



fetch('api/data')
.then(response => response.json())
.then(data => {
    userdata = data.users;
    console.log("Data successfully loaded!");
    console.log(userdata)
})
.catch(error => console.error(`An error occurred: ${error}`));
    

submitButton.addEventListener('click', () => {
    if (!userdata) {
        alert('Data still loading. Please wait.');
        return;
    }
    
    const enteredUsername = usernameInput.value.trim();
    const enteredPassword = passwordInput.value.trim();
    
    // Search through the user ARRAY for a match
    const matchedUser = userdata.find(user => 
        user.username === enteredUsername && user.password === enteredPassword
    );

    if (!matchedUser) {
        document.getElementById('login-message').textContent = `pass or user invalid`
    } 
    alert(`Login successful! Welcome, ${matchedUser.username}.`);
    
});
