(() => {
   
   angular.module('statsApp')
        .factory('Stats', ['$http', '$q', function($http, $q) {
            
            let service = this;
            
            service.factory = {
                refreshStats,

                playerStats: [],
                teamStats: [],

                pointScheme: [],
                tournamentName: {}
            }
            
            function getPlayerStats(tournamentId, phaseId = null) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId + '/stats/player' + (phaseId ? '?phase=' + phaseId : ''))
                        .then(({data}) => {

                            data.result.stats.forEach(stat => {
                                stat.pointMap = stat.tossup_totals.reduce((aggr, current) => {
                                    aggr[current.value] = current.total;
                                    return aggr;
                                }, {});
                            })

                            angular.copy(data.result.stats, service.factory.playerStats);
                            angular.copy(data.result.pointScheme, service.factory.pointScheme);
                            angular.copy({name: data.result.tournamentName}, service.factory.tournamentName);

                            resolve(data.result);
                        })
                        .catch(error => reject(error));
                })
            }

            function getTeamStats(tournamentId, phaseId = null) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId + '/stats/team' + (phaseId ? '?phase=' + phaseId : ''))
                        .then(({data}) => {
                            data.result.stats.forEach(stat => {
                                stat.pointMap = stat.tossup_totals.reduce((aggr, current) => {
                                    aggr[current.value] = current.total;
                                    return aggr;
                                }, {});
                            })

                            angular.copy(data.result.stats, service.factory.teamStats);

                            resolve(data.result);
                            
                        })
                        .catch(error => reject(error));
                })
            }

            function refreshStats(tournamentId, phaseId) {
                return $q((resolve, reject) => {

                    $q.all([getPlayerStats(tournamentId, phaseId), getTeamStats(tournamentId, phaseId)])
                        .then(() => resolve())
                        .catch(error => reject(error));
                        
                })
            }

            return service.factory;
            
        }]); 
        
})();