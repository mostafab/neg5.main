'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app) {

    app.get('/api/t/:tid', function (req, res) {
        res.json({ name: 'Test' });
    });
};