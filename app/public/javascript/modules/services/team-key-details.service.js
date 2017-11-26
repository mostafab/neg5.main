import teamActions from './../actions/team.actions';
import divisionActions from './../actions/divisions.actions';
import phaseActions from './../actions/phase.actions';

import { groupDivisionsByPhase, mapPhaseIdsToPhases, mapTeamsToDivisions, getTotalPlayers } from './../util/tournament-util';

export default class TeamKeyDetailsService {
  constructor(TeamService, DivisionService, PhaseService) {
    this.TeamService = TeamService;
    this.DivisionService = DivisionService;
    this.PhaseService = PhaseService;

    this.bindListeners();

    this.numTeams = 0;
    this.numPlayers = 0;

    this._teams = null;
    this._divisions = null;
    this._phases = null;

    this.keyTeamPhaseDetails = null;
  }

  bindListeners() {
    this.TeamService.on(teamActions.teamsReceived, this._onTeamsReceived.bind(this));
    this.DivisionService.on(divisionActions.divisionsReceived, this._onDivisionsReceived.bind(this));
    this.PhaseService.on(phaseActions.phasesReceived, this._onPhasesReceived.bind(this));
    this.TeamService.on(teamActions.addedPlayer, this._onPlayerAdded.bind(this));
    this.TeamService.on(teamActions.deletedPlayer, this._onPlayerDeleted.bind(this));
  }

  _onTeamsReceived(payload) {
    this._teams = payload.teams;
    this.numTeams = this._teams.length;
    this.numPlayers = getTotalPlayers(this._teams);
    this._regenerateTeamsDivisionsMap();
  }

  _onDivisionsReceived(payload) {
    this._divisions = payload.divisions;
    this._regenerateTeamsDivisionsMap();
  }

  _onPhasesReceived(payload) {
    this._phases = payload.phases;
    this._regenerateTeamsDivisionsMap();
  }

  _onPlayerAdded() {
    this.numPlayers += 1;
  }

  _onPlayerDeleted() {
    this.numPlayers -= 1;
  }

  _regenerateTeamsDivisionsMap() {
    if (this._teams && this._divisions && this._phases) {
      const divisionsByPhase = groupDivisionsByPhase(this._divisions);
      const divisionsToTeams = mapTeamsToDivisions(this._teams);
      const phasesToDivisions = this._phases.map(p => {
        return {
          ...p,
          divisions: (divisionsByPhase[p.id] || []).map(d => {
            return {
              ...d,
              teams: divisionsToTeams[d.id] || [],
            }
          }),
        }
      });
      this.keyTeamPhaseDetails = phasesToDivisions;
    }
  }
}

TeamKeyDetailsService.$inject = ['TeamService', 'DivisionService', 'PhaseService'];
