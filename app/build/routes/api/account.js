'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _account = require('../../models/sql-models/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/register').post(function (req, res) {
        var _req$body = req.body;
        var username = _req$body.username;
        var password = _req$body.password;

        _account2.default.createAccount(username, password).then(function (user) {
            return res.json({ user: user, success: true });
        }).catch(function (error) {
            return res.status(500).json({ error: error, success: false });
        });
    });

    app.route('/api/authenticate').post(function (req, res) {
        var _req$body2 = req.body;
        var username = _req$body2.username;
        var password = _req$body2.password;

        _account2.default.getAccount(username, password).then(function (token) {
            res.json({ success: true, token: token });
        }).catch(function (errorMessage) {
            if (errorMessage.error) {
                return res.status(500).json({ success: false, error: errorMessage });
            } else if (!errorMessage.authenticated) {
                return res.status(403).json({ success: false, authenticated: false });
            }
        });
    });
};