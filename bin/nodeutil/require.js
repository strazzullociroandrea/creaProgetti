/**
 * Funzione per creare il main index.js contenente gli import di librerie con require .
 * @returns file
 */
const mainRequire = () =>{
    const fileMain = `
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const conf = JSON.parse(fs.readFileSync('./assets/conf.json'));

(()=>{
    try{
        app.use(bodyParser.json());

        app.use(
            bodyParser.urlencoded({
                extended: true,
            })
        );

        app.use("/", express.static(path.join(__dirname, "public")));

        server.listen(conf.porta, () => {
            console.log("---> server running on http://localhost:" + conf.porta);
        });
    
    }catch(error){
        console.error(error);
    }
})();

`;
return fileMain;
}

module.exports = mainRequire;