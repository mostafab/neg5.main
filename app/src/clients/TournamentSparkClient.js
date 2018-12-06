import SparkClient from './SparkClient';

export class TournamentSparkClient extends SparkClient {
  constructor() {
    super();
  }

  getTournament(tournamentId) {
    return this.get(`/neg5-api/tournaments/${tournamentId}`);
  }

  getTeams(tournamentId) {
    return this.get(`/neg5-api/tournaments/${tournamentId}/teams`);
  }

  getMatches(tournamentId) {
    return this.get(`/neg5-api/tournaments/${tournamentId}/matches`);
  }

  invalidateStats(tournamentId) {
    return this.post(`/neg5-api/tournaments/${tournamentId}/stats/invalidate`);
  }
}

export default new TournamentSparkClient();
