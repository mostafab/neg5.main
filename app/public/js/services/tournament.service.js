'use strict';

(function () {

    angular.module('tournamentApp').factory('Tournament', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var pointScheme = [];

        service.tournamentFactory = {
            pointScheme: pointScheme,
            getTournamentContext: getTournamentContext,
            edit: edit,
            addPointValue: addPointValue,
            postPointValues: postPointValues
        };

        function getTournamentContext(tournamentId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '?token=' + token).then(function (_ref) {
                    var data = _ref.data;

                    var info = data.data;
                    angular.copy(info.tossup_point_scheme, service.tournamentFactory.pointScheme);
                    resolve({
                        tournamentInfo: {
                            name: info.name,
                            location: info.location,
                            date: new Date(info.tournament_date),
                            questionSet: info.question_set,
                            comments: info.comments,
                            hidden: info.hidden,
                            pointScheme: info.tossup_point_scheme || []
                        },
                        tournamentContext: {
                            admin: true,
                            owner: true
                        }
                    });
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        function edit(tournamentId, newTournamentInfo) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                var body = {
                    token: token,
                    location: newTournamentInfo.location,
                    name: newTournamentInfo.name,
                    date: newTournamentInfo.date,
                    questionSet: newTournamentInfo.questionSet,
                    comments: newTournamentInfo.comments,
                    hidden: newTournamentInfo.hidden
                };
                $http.put('/api/t/' + tournamentId, body).then(function (_ref2) {
                    var data = _ref2.data;
                    var _data$result = data.result;
                    var name = _data$result.name;
                    var location = _data$result.location;
                    var hidden = _data$result.hidden;
                    var comments = _data$result.comments;
                    var question_set = _data$result.question_set;
                    var tournament_date = _data$result.tournament_date;

                    var result = {
                        name: name,
                        location: location,
                        hidden: hidden,
                        comments: comments,
                        questionSet: question_set,
                        date: new Date(tournament_date)
                    };
                    resolve(result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function addPointValue(tournamentId, _ref3) {
            var type = _ref3.type;
            var value = _ref3.value;

            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                var body = {
                    type: type,
                    value: value
                };
                $http.post('/api/t/' + tournamentId + '/pointscheme', body).then(function (_ref4) {
                    var data = _ref4.data;

                    service.tournamentFactory.pointScheme.push({
                        type: data.result.tossup_answer_type,
                        value: data.result.tossup_value
                    });
                    resolve({ type: type, value: value });
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function postPointValues(tournamentId, newPointValues) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                var body = {
                    token: token,
                    pointValues: newPointValues
                };
                $http.put('/api/t/' + tournamentId + '/pointscheme', body).then(function (_ref5) {
                    var data = _ref5.data;

                    var sortedValues = data.result.map(function (_ref6) {
                        var value = _ref6.tossup_value;
                        var type = _ref6.tossup_answer_type;

                        return {
                            value: value,
                            type: type
                        };
                    }).sort(function (first, second) {
                        return first.value - second.value;
                    });

                    angular.copy(sortedValues, service.tournamentFactory.pointScheme);
                    resolve(sortedValues);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        return service.tournamentFactory;
    }]);
})();