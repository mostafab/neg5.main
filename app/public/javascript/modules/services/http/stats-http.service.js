export default class StatsHttpService {

    constructor($q, $http) {
        this.$q = $q;
        this.$http = $http;
    }

    getPlayerStats(tournamentId, phaseId = null) {
        return this.$q((resolve, reject) => {
            this.$http.get(`/api/t/${tournamentId}/stats/player${
                phaseId ? `?phase=${phaseId}` : ''
            }`)
            .then(( { data }) => resolve(data))
            .catch(err => reject(err));
        });
    }

    getTeamStats(tournamentId, phaseId = null) {
        return this.$q((resolve, reject) => {
            this.$http.get(`/api/t/${tournamentId}/stats/team${
                phaseId ? `?phase=${phaseId}` : ''
            }`)
            .then(( { data }) => resolve(data))
            .catch(err => reject(err));
        });
    }

    getTeamFullStats(tournamentId, phaseId = null) {
        return this.$q((resolve, reject) => {
            this.$http.get(`/api/t/${tournamentId}/stats/teamfull${
                phaseId ? `?phase=${phaseId}` : ''
            }`)
            .then(( { data }) => resolve(data))
            .catch(err => reject(err));
        });
    }

    getPlayerFullStats(tournamentId, phaseId = null) {
        return this.$q((resolve, reject) => {
            this.$http.get(`/api/t/${tournamentId}/stats/playerfull${
                phaseId ? `?phase=${phaseId}` : ''
            }`)
            .then(( { data }) => resolve(data))
            .catch(err => reject(err));
        });
    }

    getRoundReport(tournamentId, phaseId = null) {
        return this.$q((resolve, reject) => {
            this.$http.get(`/api/t/${tournamentId}/stats/roundreport${
                phaseId ? `?phase=${phaseId}` : ''
            }`)
            .then(( { data }) => resolve(data))
            .catch(err => reject(err));
        });
    }

}

StatsHttpService.$inject = ['$q', '$http'];