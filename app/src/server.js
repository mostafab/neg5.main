import http from 'http';
import https from 'https';
import fs from 'fs';
import config from './config/configuration';
import express from './config/express';  

const {https : usingHttps = false, httpsDir, keyName, certName, caName, httpsPort} = config;

const PORT_NUM = process.env.PORT || config.port || 3000;

const app = express();

const init = () => {
    if (usingHttps) {
        const options = {
            key: fs.readFileSync(httpsDir + keyName, 'utf8'),
            cert: fs.readFileSync(httpsDir + certName, 'utf8'),
            ca: fs.readFileSync(httpsDir + caName, 'utf8')
        }
        https.createServer(options, app).listen(httpsPort);
        console.log('Https server running on port ' + httpsPort);
    } else {
        http.createServer(app).listen(PORT_NUM);
        console.log(new Date() + ': Express server running on port ' + PORT_NUM);
    }

    process.on('unhandledRejection', (error, promise) => {
        console.log(error.stack);
    })
}

init();




