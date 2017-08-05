import angular from 'angular';

export default class StatsService {

    constructor($q, StatsHttpService) {
        this.$q = $q;
        this.StatsHttpService = StatsHttpService;

        this.playerStats = [];
        this.teamStats = [];
        this.teamFullStats = [];
        this.playerFullStats = [];
        this.roundReportStats = [];

        this.divisions = [];

        this.unassignedTeams = [];

        this.pointScheme = [];
        this.tournamentName = {};
        this.activePhase = {};
    }

    getPlayerStats(tournamentId, phaseId) {
        return this.$q((resolve, reject) => {
            this.StatsHttpService.getPlayerStats(tournamentId, phaseId)
                .then(data => {
                    this.handlePlayerStats(data.result);
                    resolve();
                })
                .catch(err => reject(err));
        });
    }

    getTeamStats(tournamentId, phaseId) {
        return this.$q((resolve, reject) => {
            this.StatsHttpService.getTeamStats(tournamentId, phaseId)
                .then(data => {
                    this.handleTeamStats(data.result);
                    resolve(data.result);
                })
                .catch(err => reject(err));
        });
    }

    getTeamFullStats(tournamentId, phaseId) {
        return this.$q((resolve, reject) => {
            this.StatsHttpService.getTeamFullStats(tournamentId, phaseId)
                .then(data => {
                    this.handleTeamFullStats(data.result);
                    resolve();
                })
                .catch(err => reject(err));
        })
    }

    getPlayerFullStats(tournamentId, phaseId) {
        return this.$q((resolve, reject) => {
            this.StatsHttpService.getPlayerFullStats(tournamentId, phaseId)
                .then(data => {
                    this.handlePlayerFullStats(data.result);
                    resolve();
                })
                .catch(err => reject(err));
        });
    }

    getRoundReport(tournamentId, phaseId) {
        return this.$q((resolve, reject) => {
            this.StatsHttpService.getRoundReport(tournamentId, phaseId)
                .then(data => {
                    this.handleRoundReportStats(data.result);
                    resolve();
                })
                .catch(err => reject(err));
        });
    }

    refreshStats(tournamentId, phaseId) {
        return this.$q((resolve, reject) => {
            this.$q.all([
                this.getPlayerStats(tournamentId, phaseId),
                this.getTeamStats(tournamentId, phaseId),
                this.getTeamFullStats(tournamentId, phaseId),
                this.getPlayerFullStats(tournamentId, phaseId),
                this.getRoundReport(tournamentId, phaseId)
            ])
            .then(() => resolve())
            .catch(err => reject(err));
        });
    }

    handlePlayerStats(stats) {
        const copyOfStats = Object.assign({}, stats);
        copyOfStats.stats.forEach(stat => {
            stat.pointMap = stat.tossup_totals.reduce((aggr, current) => {
                aggr[current.value] = current.total;
                return aggr;
            }, {});
        });
        angular.copy( { id: copyOfStats.activePhaseId }, this.activePhase);
        angular.copy(copyOfStats.stats, this.playerStats);
        angular.copy(copyOfStats.pointScheme, this.pointScheme);
        angular.copy( { name: copyOfStats.tournamentName }, this.tournamentName);
    }

    handleTeamStats(stats) {
        const copyOfStats = Object.assign({}, stats);
        copyOfStats.stats.forEach(stat => {
            stat.pointMap = stat.tossup_totals.reduce((aggr, current) => {
                aggr[current.value] = current.total;
                return aggr;
            }, {});
        });
        angular.copy(copyOfStats.divisions, this.divisions);
        angular.copy(copyOfStats.stats, this.teamStats);

        this.setUnassignedTeams(copyOfStats.stats, copyOfStats.divisions);
    }

    handleTeamFullStats(stats) {
        const copyOfStats = Object.assign({}, stats);
        copyOfStats.stats.forEach(stat => {
            stat.matches.forEach(match => {
                match.pointMap = match.tossup_totals.reduce((aggr, current) => {
                    aggr[current.value] = current.total;
                    return aggr;
                }, {});
            });
        });
        angular.copy(copyOfStats, this.teamFullStats);
    }

    handlePlayerFullStats(stats) {
        const copyOfStats = Object.assign({}, stats);
        copyOfStats.stats.forEach(stat => {
            stat.matches.forEach(match => {
                match.pointMap = match.tossup_totals.reduce((aggr, current) => {
                    aggr[current.value] = current.total;
                    return aggr;
                }, {});
            });
        });
        angular.copy(copyOfStats.stats, this.playerFullStats);
    }

    handleRoundReportStats(stats) {
        angular.copy(stats.stats, this.roundReportStats);
    }

    setUnassignedTeams(teams, divisions) {
        let toCopy = [];
        if (divisions.length > 0) {
            toCopy = teams.filter(team => team.division_id === null);
        }
        angular.copy(toCopy, this.unassignedTeams);
    }
}

StatsService.$inject = ['$q', 'StatsHttpService'];
