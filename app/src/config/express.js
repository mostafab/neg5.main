import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

import accountApi from '../routes/api/account';
import tournamentApi from '../routes/api/tournament';
import matchApi from '../routes/api/match';
import teamApi from '../routes/api/team';
import statsApi from '../routes/api/stats';
import playerApi from '../routes/api/player';

import configuration from './configuration';
import passport from './passport/passport';

export default () => {
    const app = express();
    const {minifyJs = false} = configuration

    app.set('minifyJs', minifyJs)
    app.locals.pretty = false;

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(helmet());
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(compression());    
    app.use(passport.initialize());
    
    app.set("views", path.join(__dirname, '../../views'));
    app.set("view engine", "jade");
    
    app.use(express.static(path.join(__dirname, '../../public')));
    
    require('../routes/index.js')(app);
    
    accountApi(app);
    tournamentApi(app);
    matchApi(app);
    teamApi(app);
    statsApi(app);
    playerApi(app);

    return app;
};
