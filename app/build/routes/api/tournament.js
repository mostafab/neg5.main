'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app) {

    app.route('/api/t').get(function (req, res) {}).post(function (req, res) {});

    app.route('/api/t/:tid').get(function (req, res) {
        res.json({ name: 'Test' });
    }).put(function (req, res) {}).delete(function (req, res) {});

    app.route('/api/t/:tid/pointscheme').get(function (req, res) {}).post(function (req, res) {});

    app.route('/api/t/:tid/divisions').get(function (req, res) {}).post(function (req, res) {});
};