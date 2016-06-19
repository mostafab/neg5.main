'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _account = require('../../models/sql-models/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/account').post(function (req, res) {
        var accountCredentials = req.body;
        _account2.default.create(accountCredentials).then(function (user) {
            return res.json({ user: user, success: true });
        }).catch(function (error) {
            return res.status(500).json({ error: error, success: false });
        });
    });

    app.route('/api/authenticate').post(function (req, res) {
        var accountCredentials = req.body;
        _account2.default.findOne(userCredentials).then(function (token) {
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