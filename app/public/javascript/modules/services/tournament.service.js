import angular from 'angular';

export default class TournamentService {
  constructor($http, $q, $cookies) {
    this.$http = $http;
    this.$q = $q;
    this.$cookies = $cookies;

    this.pointScheme = {
      tossupValues: [],
    };
    this.activePhase = {};
    this.rules = {
      bouncebacks: false,
      maxActive: 4,
    };
  }

  getUserTournaments() {
    return this.$q((resolve, reject) => {
      const jwt = this.$cookies.get('nfToken');
      if (!jwt) {
        reject({ message: 'Invalid token' });
      } else {
        this.$http.get(`/api/t?token=${jwt}`)
          .then(({ data }) => resolve(data.data))
          .catch(error => reject(error));
      }
    });
  }

  newTournament(name) {
    return this.$q((resolve, reject) => {
      const body = {
        name,
        jwt: this.$cookies.get('nfToken'),
      };
      this.$http.post('/api/t', body)
        .then(({ data }) => resolve(data.result.tournament))
        .catch(error => reject(error));
    });
  }

  getTournamentContext(tournamentId) {
    return this.$q((resolve, reject) => {
      const jwt = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}?token=${jwt}`)
        .then(({ data }) => {
          const { tournament: info, permissions } = data.data;
          const formattedPointScheme = {
            tossupValues: info.tossup_point_scheme,
            partsPerBonus: info.parts_per_bonus,
            bonusPointValue: info.bonus_point_value,
          };
          const formattedRules = {
            bouncebacks: info.bouncebacks,
            maxActive: info.max_active_players_per_team,
          };
          const formattedActivePhase = {
            id: info.active_phase_id,
            name: info.active_phase_name,
          };
          angular.copy(formattedActivePhase, this.activePhase);
          angular.copy(formattedRules, this.rules);
          angular.copy(formattedPointScheme, this.pointScheme);

          resolve({
            tournamentInfo: {
              name: info.name,
              location: info.location,
              date: new Date(info.tournament_date),
              questionSet: info.question_set,
              comments: info.comments,
              hidden: info.hidden,
            },
            tournamentContext: {
              admin: permissions.is_owner || permissions.is_admin,
              owner: permissions.is_owner || false,
            },
          });
        })
        .catch(error => reject(error));
    });
  }

  edit(tournamentId, newTournamentInfo) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      const body = {
        token,
        location: newTournamentInfo.location,
        name: newTournamentInfo.name,
        date: newTournamentInfo.date,
        questionSet: newTournamentInfo.questionSet,
        comments: newTournamentInfo.comments,
        hidden: newTournamentInfo.hidden,
      };
      this.$http.put(`/api/t/${tournamentId}`, body)
        .then(({ data }) => {
          const {
            name,
            location,
            hidden,
            comments,
            question_set,
            tournament_date,
          } = data.result;
          const result = {
            name,
            location,
            hidden,
            comments,
            questionSet: question_set,
            date: new Date(tournament_date),
          };
          resolve(result);
        })
        .catch(error => reject(error));
    });
  }

  updateRules(tournamentId, { bouncebacks, maxActive }) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      const body = {
        token,
        rules: {
          bouncebacks,
          maxActive,
        },
      };
      this.$http.put(`/api/t/${tournamentId}/rules`, body)
        .then(({ data }) => {
          const formattedRules = {
            bouncebacks: data.result.bouncebacks,
            maxActive: data.result.max_active_players_per_team,
          };
          angular.copy(formattedRules, this.rules);
          resolve(this.rules);
        })
        .catch(error => reject(error));
    });
  }

  addPointValue(tournamentId, { type, value }) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      const body = {
        type,
        value,
        token,
      };
      this.$http.post(`/api/t/${tournamentId}/pointscheme`, body)
          .then(({ data }) => {
            this.pointScheme.tossupValues.push({
              type: data.result.tossup_answer_type,
              value: data.result.tossup_value,
            });
            resolve({ type, value });
          })
          .catch(error => reject(error));
    });
  }

  postPointValues(tournamentId, newPointValues) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      const body = {
        token,
        pointValues: newPointValues,
      };
      this.$http.put(`/api/t/${tournamentId}/pointscheme`, body)
        .then(({ data }) => {
          const sortedTossupValues = data.result.tossupValues
            .map(({ tossup_value: value, tossup_answer_type: type }) => {
              return {
                value,
                type,
              };
            })
            .sort((first, second) => first.value - second.value);
          const pointScheme = {
            tossupValues: sortedTossupValues,
            partsPerBonus: data.result.partsPerBonus,
            bonusPointValue: data.result.bonusPointValue,
          };
          angular.copy(pointScheme, this.pointScheme);
          resolve();
        })
        .catch(error => reject(error));
    });
  }
}

TournamentService.$inject = ['$http', '$q', '$cookies'];
