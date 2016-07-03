'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app) {

    app.route('/t/:tid/teams').get(function (req, res) {}).post(function (req, res) {});

    app.route('/t/:tid/teams/:teamId').get(function (req, res) {}).put(function (req, res) {}).delete(function (req, res) {});
};