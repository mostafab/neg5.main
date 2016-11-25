import http from 'http';
import https from 'https';
import fs from 'fs';
import config from './config/configuration';
import express from './config/express';  

const {https : usingHttps = false, httpsDir, keyName, certName, httpsPort} = config;

const PORT_NUM = config.port;

const app = express();

const startServer = () => {
    if (usingHttps) {
        const options = {
            key: fs.readFileSync(httpsDir + keyName, 'utf8'),
            cert: fs.readFileSync(httpsDir + certName, 'utf8')
        }
        console.log(options.key);
        console.log(options.cert);
        https.createServer(options, app).listen(httpsPort);
        console.log('Https server running on port ' + httpsPort);
    } else {
        http.createServer(app).listen(PORT_NUM);
        console.log('Express server running on port ' + PORT_NUM);
    }
}

startServer();




