
import express from 'express';
import fs from 'fs/promises';
import http from 'http';
import url from 'url';
import path from 'path';


const PORT = process.env.PORT;
const app = express();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());


app.get('/style/style.css', (req, res) =>{
    res.sendFile(path.join(__dirname, './style/style.css'))
});
app.get('/script/main.js', (req, res) =>{
    res.sendFile(path.join(__dirname, './script/main.js'))
});
app.get('/script/sign.js', (req, res) =>{
    res.sendFile(path.join(__dirname, './script/sign.js'))
});




app.get('/', (req, res) =>{
    let filePath = path.join(__dirname, './templates/index.html');


    res.sendFile(filePath, (err) => {
        if (err) {

            console.error("Internal Error:", err.message);

            res.status(404).type('text/plain').send('An error occurred: home');
        }
    });
});



app.get('/sign-in', (req, res) =>{
    let filepath = path.join(__dirname, './templates/sign.html');

    res.sendFile(filepath, (err) =>{
        if (err){
            console.error("Internal Error:", err.message);

            res.status(404).type('text/plain').send('An error occurred: sign');
        }
    })
    
});

app.get('/about', (req, res) =>{
    let filepath = path.join(__dirname, './templates/about.html');

    res.sendFile(filepath, (err) =>{
        if (err){
            console.error("Internal Error:", err.message);

            res.status(404).type('text/plain').send('An error occurred: about');
        }
    })
    
});

app.post('/api/user', async (req, res) =>{

try {
    let filepath = path.join(__dirname, '/data.json');
    const rawData = await fs.readFile(filepath);
    const data = JSON.parse(rawData);

    const newuser = req.body;



    data.users.push(newuser);
    
    const write = await fs.writeFile(filepath, JSON.stringify(data, null, 2));

    
    res.status(200);

} catch (error) {
    res.status(500).send('server crashed')
}
})






app.get('/api/data', async (req, res) => {
    
    try {
        const rawData = await fs.readFile(path.join(__dirname, '/data.json'));
        res.json(JSON.parse(rawData));

    } catch (error) {
        res.status(500);
        console.log(error);
    }



});





console.log(__dirname)
console.log(__filename)



app.listen(PORT, (err) => {
    if (err){console.log('an error occured: listen')};
    console.log(`app running on: http://localhost:${PORT}`);
})