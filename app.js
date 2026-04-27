import http from 'http'
import fs from 'fs/promises'
import url from 'url'
import path from 'path'

const PORT = process.env.PORT;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("THIS IS" + __filename);
console.log(__dirname);


const server = http.createServer((req, res) => {
    try {
        if (req.method === 'GET'){
            if (req.url === '/'){
                res.writeHead(200,{'Content-Type' : 'text/html'});
                // Either serve a file or send HTML directly
                res.end('<h1>Home Page</h1>');
                // OR to write to a file:
                // await fs.writeFile('somefile.txt', 'Hello World');
                // res.end('<h1>File written</h1>');
            } else if(req.url === '/about'){
                res.writeHead(200,{'Content-Type' : 'text/html'});
                res.end("about");
            } else {
                res.writeHead(404,{'Content-Type' : 'text/html'});
                res.end("nope");
            }
        } else {
            throw new Error("nope, you aint allowed")
        }
            
    } catch (error) {
        res.writeHead(500,{'Content-Type' : 'text/html'});
        res.end("SERVER CRASHED");
    }

    console.log(req.url);
    console.log(req.method);
});

server.listen(PORT, () =>{
    console.log(`running on: http://localhost:${PORT}`);
});