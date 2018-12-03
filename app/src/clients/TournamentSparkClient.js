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
}

export default new TournamentSparkClient();
