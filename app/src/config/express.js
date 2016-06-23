import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import clientsession from 'client-sessions';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import accountApi from '../routes/api/account';

import configuration from './configuration';

const {cookieName, secret, duration} = configuration.session;

export default () => {
    const app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(helmet());
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(clientsession({
        cookieName : cookieName,
        secret : secret,
        duration : duration,
        activeDuration : duration,
        httpOnly : true,
        secure : true
    }));
    
    app.set("views", path.join(__dirname, '../../views'));
    app.set("view engine", "jade");
    
    app.use(express.static(path.join(__dirname, '../../public')));
    
    require('../routes/index.js')(app);
    require("../routes/user-route.js")(app);
    require("../routes/tournaments-route.js")(app);
    require("../routes/stats-route.js")(app);
    
    accountApi(app);

    return app;
};
