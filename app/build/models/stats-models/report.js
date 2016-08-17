'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StatsReport = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stats = require('../../data-access/stats');

var _stats2 = _interopRequireDefault(_stats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StatsReport = exports.StatsReport = function () {
    function StatsReport(tournamentId) {
        _classCallCheck(this, StatsReport);

        this.tournamentId = tournamentId;
    }

    _createClass(StatsReport, [{
        key: 'getTeamReport',
        value: function getTeamReport(phaseId) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _stats2.default.teamReport(_this.tournamentId, phaseId).then(function (result) {
                    return resolve(result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }
    }, {
        key: 'getIndividualReport',
        value: function getIndividualReport(phaseId) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _stats2.default.individualReport(_this2.tournamentId, phaseId).then(function (result) {
                    return resolve(result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }
    }, {
        key: 'getTeamFullReport',
        value: function getTeamFullReport(phaseId) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _stats2.default.teamFullReport(_this3.tournamentId, phaseId).then(function (result) {
                    return resolve(result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }
    }, {
        key: 'getPlayerFullReport',
        value: function getPlayerFullReport(phaseId) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _stats2.default.playerFullReport(_this4.tournamentId, phaseId).then(function (result) {
                    return resolve(result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }
    }, {
        key: 'getRoundReport',
        value: function getRoundReport(phaseId) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                _stats2.default.roundReport(_this5.tournamentId, phaseId).then(function (result) {
                    return resolve(result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }
    }]);

    return StatsReport;
}();