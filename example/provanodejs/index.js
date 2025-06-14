
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

        server.listen(conf.port, () => {
            console.log("---> server running on http://localhost:" + conf.porta);
        });
    
    }catch(error){
        console.error(error);
    }
})();

