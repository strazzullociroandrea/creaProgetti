/**
 * Funzione per creare il main index.js contenente gli import di librerie con import . 
 * @returns file
 */
const mainImport = () =>{
    const fileMain = `
import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = http.createServer(app);


(()=>{
    try{
        app.use(bodyParser.json());

        app.use(
            bodyParser.urlencoded({
                extended: true,
            })
        );

        app.use("/", express.static(path.join(__dirname, "public")));

        server.listen(conf.port, () => {
            console.log("---> server running on http://localhost:" + conf.port);
        });
    
    }catch(error){
        console.error(error);
    }
})();

    `;
}

module.exports = mainImport;