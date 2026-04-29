

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('btn-submit');





submitButton.addEventListener('click' ,() =>{
    
const newuser = { 
    username: usernameInput.value.trim(), 
    password: passwordInput.value.trim()
};


fetch('/api/user', {
    method: 'POST',
    headers: {'Content-type' : 'application/json'},
    body: JSON.stringify(newuser)
})

.then(response => response.json())
.then(msg => console.log(msg.message));

if(newuser){
    console.log('done');
}else{
    console.log('enter user or pass')
}

})