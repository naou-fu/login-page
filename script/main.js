let userdata = null;

fetch('http://localhost:3000/api/data')
    .then(response => response.json())
    .then(data => {

        userdata = data.users;
        console.log("Data successfully loaded!");
    })
    .catch(error => console.error(`An error occurred: ${error}`));

const submitButton = document.getElementById('btn-submit');

submitButton.addEventListener('click', () => {
    if (userdata) {
        console.log(userdata);
    } else {
        console.log("Hold on! Data is still loading...");
    }
});