
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('btn-submit');

let userdata = null;

fetch('api/data')
    .then(response => response.json())
    .then(data => {

        userdata = data.users;
        console.log("Data successfully loaded!");
        console.log(userdata)
    })
    .catch(error => console.error(`An error occurred: ${error}`));

submitButton.addEventListener('click', () => {
    
    const newuser = { 
        username: usernameInput.value.trim(), 
        password: passwordInput.value.trim()
    };

    if (!newuser.username || !newuser.password) {
        console.log('Please enter both a username and password');
        return; // Stop the code here
    }


    const userexist = userdata.find(user => user.username === newuser.username);


    if (userexist) {
        console.log('User already exists! Try a different name.');
    } else {

        fetch('/api/user', {
            method: 'POST',
            headers: {'Content-type' : 'application/json'},
            body: JSON.stringify(newuser)
        })
        .then(response => response.json())
        .then(msg => {
            console.log(msg.message);
            console.log('Done!');
            
            userdata.push(newuser); 
        })
        .catch(err => console.error("Error saving user:", err));

        window.open('/', '_parent');
    }
});
