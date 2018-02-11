import InternalClient from './internal/client';

import config from './../config/configuration';

export default class StatsInternalClient extends InternalClient {

  static get PLAYER_FULL_URL() {
    return '/api/{tournamentId}/individual-full';
  }

  constructor() {
    super();
    this._setBaseUrl();
  }

  async getFullIndividualStats(tournamentId, payload) {
    const url = StatsInternalClient.PLAYER_FULL_URL.replace('{tournamentId}', tournamentId);
    return await this.post(url, payload);
  }
  
  getHost() {
    return this.baseUrl;
  }

  _setBaseUrl() {
    const env = config.OWN_NODE_ENV;
    const key = `STATS_API_BASE_URL_${env}`;
    this.baseUrl = config[key];
  }
}