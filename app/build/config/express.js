'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _account = require('../routes/api/account');

var _account2 = _interopRequireDefault(_account);

var _tournament = require('../routes/api/tournament');

var _tournament2 = _interopRequireDefault(_tournament);

var _match = require('../routes/api/match');

var _match2 = _interopRequireDefault(_match);

var _team = require('../routes/api/team');

var _team2 = _interopRequireDefault(_team);

var _stats = require('../routes/api/stats');

var _stats2 = _interopRequireDefault(_stats);

var _player = require('../routes/api/player');

var _player2 = _interopRequireDefault(_player);

var _configuration = require('./configuration');

var _configuration2 = _interopRequireDefault(_configuration);

var _passport = require('./passport/passport');

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var app = (0, _express2.default)();
  var _configuration$minify = _configuration2.default.minifyJs;
  var minifyJs = _configuration$minify === undefined ? false : _configuration$minify;
  var _configuration$env = _configuration2.default.env;
  var env = _configuration$env === undefined ? 'development' : _configuration$env;


  app.set('minifyJs', minifyJs);
  app.set('configEnv', env);
  app.locals.pretty = false;

  app.use(_bodyParser2.default.urlencoded({
    extended: true
  }));
  app.use((0, _helmet2.default)());
  app.use((0, _cookieParser2.default)());
  app.use(_bodyParser2.default.json());
  app.use((0, _compression2.default)());
  app.use(_passport2.default.initialize());

  app.set('views', _path2.default.join(__dirname, '../../views'));
  app.set('view engine', 'jade');

  app.use(_express2.default.static(_path2.default.join(__dirname, '../../public')));

  require('../routes/index.js')(app);
  (0, _account2.default)(app);
  (0, _tournament2.default)(app);
  (0, _match2.default)(app);
  (0, _team2.default)(app);
  (0, _stats2.default)(app);
  (0, _player2.default)(app);

  return app;
};