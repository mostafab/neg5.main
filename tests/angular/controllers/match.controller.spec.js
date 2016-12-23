/* global describe it expect beforeEach inject */

describe('MatchController | ', () => {
  let controller;
  let $scope;
  let MatchController;

  beforeEach(module('tournamentApp'));

  beforeEach(inject(($rootScope, $controller) => {
    controller = $controller;
    $scope = $rootScope.$new();
    MatchController = controller('GameCtrl', { $scope });
  }));

  describe('MatchController() | Controller should be initialized properly', () => {
    it('and it should be defined', () => {
      expect(MatchController).toBeDefined();
    });

    it('and its properties should be initialized properly', () => {
      expect(MatchController.currentGame).toBeDefined();
      expect(MatchController.currentGame.teams.length).toEqual(2);
      expect(MatchController.teams).toBeDefined();
      expect(MatchController.games).toBeDefined();
      expect(MatchController.phases).toBeDefined();
      expect(MatchController.pointScheme).toBeDefined();

      expect(MatchController.currentGame.teams.length).toBe(2);
    });
  });

  describe('MatchController.pointSum | Individual player point values should be summed correctly', () => {
    let playerPoint;

    beforeEach(() => {
      playerPoint = {};
    });

    it('and it should return 0 if parameter is undefined or null', () => {
      playerPoint = null;
      expect(MatchController.pointSum(playerPoint)).toEqual(0);
      playerPoint = undefined;
      expect(MatchController.pointSum(playerPoint)).toEqual(0);
    });

    it('and it should be 0 when the player has no points available', () => {
      const sum = MatchController.pointSum(playerPoint);
      expect(sum).toEqual(0);
    });

    it('and it should sum normally when the player has all positive point values', () => {
      playerPoint = { 10: 2, 15: 4 };
      expect(MatchController.pointSum(playerPoint)).toEqual(80);
    });

    it('and non-numeric values should be ignored in summation', () => {
      playerPoint = { 10: null, 15: 4 };
      expect(MatchController.pointSum(playerPoint)).toEqual(60);
      playerPoint = { 10: 5, 15: NaN };
      expect(MatchController.pointSum(playerPoint)).toEqual(50);
      playerPoint = { 10: undefined, 15: undefined };
      expect(MatchController.pointSum(playerPoint)).toEqual(0);
    });
  });

  describe('MatchController.teamBonusPoints | A team\'s bonus points should be calculated correctly', () => {
    let team;

    beforeEach(() => {
      team = {
        players: [
          {
            points: {
              10: 2,
              15: 4,
            },
          },
          {
            points: {
              10: 0,
              15: 1,
            },
          },
        ],
        score: 400,
        bouncebacks: 0,
      };
    });

    it('and it should return 0 if team is null or undefined', () => {
      expect(MatchController.teamBonusPoints(null)).toEqual(0);
      expect(MatchController.teamBonusPoints(undefined)).toEqual(0);
    });

    it('and should correctly calculate bonus points when a team has no bounceback points', () => {
      expect(MatchController.teamBonusPoints(team)).toEqual(305);
      team.bouncebacks = null;
      expect(MatchController.teamBonusPoints(team)).toEqual(305);
    });

    it('and should correctly calculate bonus points when a team has bouncebacks', () => {
      team.bouncebacks = 50;
      expect(MatchController.teamBonusPoints(team)).toEqual(255);
    });
  });

  describe('MatchController.teamPPB | A team\'s PPB should be calculated correctly', () => {
    let team;
    beforeEach(() => {
      team = {
        players: [
          {
            points: {
              10: 2,
              15: 4,
            },
          },
          {
            points: {
              10: 0,
              15: 1,
            },
          },
        ],
        score: 400,
        bouncebacks: 0,
      };
    });

    it('and should return 0 PPB when a team has no players', () => {
      team.players = [];
      expect(MatchController.teamPPB(team)).toEqual(0);
    });

    it(' and it should return Infinity if a team has no non-overtime tossups', () => {
      team.players = [{ points: {} }];
      expect(MatchController.teamPPB(team)).toEqual(Infinity);
    });

    it('and should correctly calculate PPB when a team has no bounceback points', () => {
      expect(MatchController.teamPPB(team).toFixed(2)).toEqual('43.57');
    });

    it('and should correctly calculate PPB when a team has bounceback points', () => {
      team.bouncebacks = 50;
      expect(MatchController.teamPPB(team).toFixed(2)).toEqual('36.43');
    });

    it('and should not include overtime tossups when calculating PPB', () => {
      team.overtime = 1;
      expect(MatchController.teamPPB(team).toFixed(2)).toEqual('50.83');

      team.overtime = null;
      expect(MatchController.teamPPB(team).toFixed(2)).toEqual('43.57');
    });
  });

  describe('MatchController.totalTeamTossupGets | A team\'s total gets should be calculated correctly', () => {
    let team;
    beforeEach(() => {
      team = {
        players: [
          {
            points: {
              10: 2,
              15: 4,
            },
          },
          {
            points: {
              10: 0,
              15: 1,
            },
          },
        ],
        score: 400,
        bouncebacks: 0,
      };
    });

    it('and should return 0 when team is null or undefined', () => {
      expect(MatchController.totalTeamTossupGets(null)).toBe(0);
      expect(MatchController.totalTeamTossupGets()).toBe(0);
    });

    it('and it should correctly sum all tossups when there are no negs', () => {
      expect(MatchController.totalTeamTossupGets(team)).toBe(7);
    });

    it('and it should ignore a tossup value in the sum when it is a neg', () => {
      team.players[0].points['-5'] = 2;
      expect(MatchController.totalTeamTossupGets(team)).toBe(7);
    });

    it('and it should ignore a tossup value in the sum when it is worth 0', () => {
      team.players[0].points['0'] = 2;
      expect(MatchController.totalTeamTossupGets(team)).toBe(7);
    });

    it('and it should return 0 when a team.players.length is 0 or team.players is null or undefined', () => {
      team.players = [];
      expect(MatchController.totalTeamTossupGets(team)).toBe(0);
      team.players = null;
      expect(MatchController.totalTeamTossupGets(team)).toBe(0);
      team.players = undefined;
      expect(MatchController.totalTeamTossupGets(team)).toBe(0);
    });
  });

  describe('MatchController.numPlayerAnswers | A player\'s total answers should be calculated correctly', () => {
    let team;
    beforeEach(() => {
      team = {
        players: [
          {
            points: {
              10: 2,
              15: 4,
            },
          },
          {
            points: {
              10: 0,
              15: 1,
            },
          },
        ],
        score: 400,
        bouncebacks: 0,
      };
    });

    it('should return the sum of all answers if onlyCorrectAnswers is not provided or is false', () => {
      expect(MatchController.numPlayerAnswers(team.players[0])).toBe(6);
      expect(MatchController.numPlayerAnswers(team.players[0], false)).toBe(6);
      expect(MatchController.numPlayerAnswers(team.players[1])).toBe(1);
      expect(MatchController.numPlayerAnswers(team.players[1], false)).toBe(1);

      team.players[0].points['-5'] = 3;
      expect(MatchController.numPlayerAnswers(team.players[0])).toBe(9);
      expect(MatchController.numPlayerAnswers(team.players[0], false)).toBe(9);
    });

    it('should return the sum of only correct answers if onlyCorrectAnswers is set to true', () => {
      team.players[0].points = {
        10: 2,
        15: 2,
        '-5': 2,
      };
      expect(MatchController.numPlayerAnswers(team.players[0], false)).toBe(6);
      expect(MatchController.numPlayerAnswers(team.players[0])).toBe(6);
      expect(MatchController.numPlayerAnswers(team.players[0], true)).toBe(4);
    });

    it('should treat a point value worth 0 as a correct answer', () => {
      team.players[0].points = {
        10: 2,
        15: 2,
        0: 1,
        '-5': 1,
      };
      expect(MatchController.numPlayerAnswers(team.players[0])).toBe(6);
      expect(MatchController.numPlayerAnswers(team.players[0], false)).toBe(6);
      expect(MatchController.numPlayerAnswers(team.players[0], true)).toBe(5);
    });
  });

  describe('MatchController.minPossibleTossupsHeard | ', () => {
    let match;

    beforeEach(() => {
      match = {
        teams: [
          {
            players: [
              {
                points: {

                },
              },
              {
                points: {

                },
              },
            ],
          },
          {
            players: [
              {
                points: {

                },
              },
              {
                points: {

                },
              },
            ],
          },
        ],
      };
    });
  });
});
