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

        this.unassignedTeams = this,StatsService.unassignedTeams;

        this.phase = null;

        this.playerStats = this.StatsService.playerStats;
        this.teamStats = this.StatsService.teamStats;
        this.teamFullStats = this.teamFullStats;
        this.playerFullStats = this.playerFullStats;
        this.roundReportStats = this.roundReportStats;

        this.pointScheme = this.StatsService.pointScheme;
        this.tournamentName = this.StatsService.tournamentName;

        this.tab = (() => {
            const setTab = $cookies.get('nfStatsTab') || 'team_standings';
            return setTab; 
        })();

        this.activePhase = this.StatsService.activePhase;

        this.refreshStats = this.StatsService.refreshStats.bind(this.StatsService);
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


