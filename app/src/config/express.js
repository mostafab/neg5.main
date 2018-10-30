import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import httpProxy from 'express-http-proxy';

import log from './../helpers/log';

import accountApi from '../routes/api/account';
import tournamentApi from '../routes/api/tournament';
import matchApi from '../routes/api/match';
import teamApi from '../routes/api/team';
import statsApi from '../routes/api/stats';
import playerApi from '../routes/api/player';

import configuration from './configuration';
import passport from './passport/passport';

const indexRoute = require('../routes/index');

const MORGAN_REQUEST_LOGGING_FORMAT = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :currentUser';
const STATS_BASE_URL_PREFIX = 'STATS_BASE_URL_';

const getStatsBaseUrl = () => {
  const env = configuration.OWN_NODE_ENV;
  return configuration[STATS_BASE_URL_PREFIX + env];
}

const NEG5_API_HOST_PROP = 'NEG5_API_HOST';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export default () => {
  const app = express();

  if (configuration.OWN_NODE_ENV === 'PROD') {
      app.locals.pretty = false;
  }

  app.set('STATS_BASE_URL', getStatsBaseUrl());
  app.set(NEG5_API_HOST_PROP, process.env.NEG5_API_BASE_URL);

  log.INFO('STATS_BASE_URL : ' + app.get('STATS_BASE_URL'));
  log.INFO('NEG5_API_HOST: ' + app.get(NEG5_API_HOST_PROP));

  morgan.token('currentUser', (req, res) => {
    return req.currentUser || 'no-user-attached';
  });
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  // app.use(helmet());
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use('/neg5-api', httpProxy(app.get(NEG5_API_HOST_PROP), {
    proxyReqPathResolver: req => `/neg5-api${req.url}`
  }));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(compression());
  app.use(passport.initialize());

  app.set('views', path.join(__dirname, '../../views'));
  app.set('view engine', 'jade');

  const cacheTime = process.env.NODE_ENV === 'production' ? parseInt(configuration.STATIC_ASSETS_CACHE_TIME_MS) || ONE_DAY_MS : 0;
  app.use(express.static(path.join(__dirname, '../../public'), { maxAge: cacheTime }));
  log.INFO('Set static cache time of: ' + cacheTime + 'ms');

  app.use((request, response, next) => {
    if (process.env.NODE_ENV === 'production') {
      if (request.headers['x-forwarded-proto'] !== 'https') {
        return response.redirect(`https://${request.headers.host}${request.url}`);
      }
      return next();
    }
    return next();
  });

  indexRoute(app);
  accountApi(app);
  tournamentApi(app);
  matchApi(app);
  teamApi(app);
  statsApi(app);
  playerApi(app);

  return app;
};
