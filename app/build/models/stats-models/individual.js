'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PlayerStatsReport = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stats = require('../../data-access/stats');

var _stats2 = _interopRequireDefault(_stats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlayerStatsReport = exports.PlayerStatsReport = function () {
    function PlayerStatsReport(tournamentId, phaseId) {
        _classCallCheck(this, PlayerStatsReport);

        this.tournamentId = tournamentId;
        this.phaseId = phaseId;
    }

    _createClass(PlayerStatsReport, [{
        key: 'getReport',
        value: function getReport() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _stats2.default.individualReport(_this.tournamentId, _this.phaseId).then(function (result) {
                    return resolve(result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }
    }]);

    return PlayerStatsReport;
}();