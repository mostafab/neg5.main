import angular from 'angular';

export default class StatsDisplayController {

    constructor($scope, $window, $timeout, $cookies, PhaseService, StatsService) {
        this.$scope = $scope;
        this.$window = $window;
        this.$timeout = $timeout;
        this.$cookies = $cookies;
        
        this.PhaseService = PhaseService;
        this.StatsService = StatsService;

        this.phases = this.PhaseService.phases;
        this.divisions = this.StatsService.divisions;

        this.HASH_TIMEOUT = 50;

        this.unassignedTeams = this.StatsService.unassignedTeams;

        this.phase = null;

        this.toastMessage = null;

        this.playerStats = this.StatsService.playerStats;
        this.teamStats = this.StatsService.teamStats;
        this.teamFullStats = this.StatsService.teamFullStats;
        this.playerFullStats = this.StatsService.playerFullStats;
        this.roundReportStats = this.StatsService.roundReportStats;

        this.pointScheme = this.StatsService.pointScheme;
        this.tournamentName = this.StatsService.tournamentName;

        this.tab = (() => {
            const setTab = localStorage.getItem('nfStatsTab') || 'team_standings';
            return setTab; 
        })();

        this.tournamentId = this.getTournamentIdFromUrl();

        this.activePhase = this.StatsService.activePhase;

        this.init();
    }

    init() {
        this.PhaseService.getPhases(this.tournamentId)
            .then(this.refreshStats);
        
        this.$scope.$watch(angular.bind(this, () => this.tab), newVal =>
            localStorage.setItem('nfStatsTab', newVal)
        );

        this.$scope.$watch(angular.bind(this, () => this.phase), newVal =>
            this.StatsService.refreshStats(this.tournamentId, this.phase ? this.phase.id : null)
        );
    }

    getTournamentIdFromUrl() {
        return this.$window.location.pathname.split('/')[2];
    }

    setHashLocation(hash) {
        this.$timeout(() => this.$window.location = `#${hash}`, this.HASH_TIMEOUT);
    }
};

StatsDisplayController.$inject = [
    '$scope',
    '$window',
    '$timeout',
    '$cookies',
    'PhaseService',
    'StatsService',
];


