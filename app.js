import { error } from 'console';
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





app.get('/', (req, res) =>{
    let filePath = path.join(__dirname, './templates/index.html');


    res.sendFile(filePath, (err) => {
        if (err) {

            console.error("Internal Error:", err.message);

            res.status(404).type('text/plain').send('An error occurred');
        }
    });
});


app.get('/about', (req, res) =>{
    let filepath = path.join(__dirname, './templates/about.html');

    res.sendFile(filepath, (err) =>{
        if (err){
            console.error("Internal Error:", err.message);

            res.status(404).type('text/plain').send('An error occurred');
        }
    })
    
});


app.get('/api/data', async (req, res) => {
    try {
        const rawData = await fs.readFile(path.join('C:/Users/ms i/Documents/login-page-web/login-page/data.json'));
        res.json(JSON.parse(rawData));
    } catch (error) {
        res.status(500)
        console.log(error)
    }


});




console.log(__dirname)
console.log(__filename)



app.listen(PORT, (err) => {
    if (err){console.log('an error occured')};
    console.log(`app running on: http://localhost:${PORT}`);
})