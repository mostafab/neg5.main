import http from 'http';
import https from 'https';
import fs from 'fs';
import express from './config/express';  

const PORT_NUM = process.env.PORT || 3000;

const app = express();

const init = () => {
    http.createServer(app).listen(PORT_NUM);
        console.log(new Date() + ': Express server running on port ' + PORT_NUM);
    process.on('unhandledRejection', (error, promise) => {
        console.log(error.stack);
    })
}

init();




