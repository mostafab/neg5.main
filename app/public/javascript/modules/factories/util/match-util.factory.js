import { gcd } from 'mathjs';

/*
The MatchUtilFactory takes in an optional MatchController instance.
If given to the factory and optional parameters are not passed in,
properties of that instance will be used in functions instead of
function parameters. Because the passed in instance
is the same object (same reference) as a MatchController, updates to the
instance outside of this factory will be reflected in later function calls.
@param MatchControllerInstance
@return Utility functions wrapped in an object
*/
const MatchUtilFactory = (MatchControllerInstance) => {
  function pointSum(points) {
    if (!points) {
      return 0;
    }
    const values = Object.keys(points);
    return values.reduce((sum, current) => {
      const product = (points[`${current}`] * current) || 0;
      return sum + product;
    }, 0);
  }

  function totalTeamTossupGets(team) {
    if (!team || !team.players) return 0;
    const totalTossups = team.players.map((player) => {
      let sum = 0;
      for (const pv in player.points) {
        if (player.points.hasOwnProperty(pv) && pv > 0) {
          sum += player.points[pv];
        }
      }
      return sum;
    })
    .reduce((sum, current) => sum + current, 0);
    return totalTossups;
  }

  function teamBonusPoints(team) {
    if (!team) {
      return 0;
    }
    const tossupSum =
        team.players
          .map(player => pointSum(player.points))
          .reduce((sum, current) => sum + current, 0);
    return (team.score || 0) - tossupSum - (team.bouncebacks || 0);
  }

  function teamPPB(team) {
    if (!team || !team.players || team.players.length === 0) {
      return 0;
    }
    const totalTossupsWithoutOT = totalTeamTossupGets(team) - (team.overtime || 0);
    const totalBonusPoints = teamBonusPoints(team);
    return (totalBonusPoints / totalTossupsWithoutOT) || 0;
  }

  function isValidPPB(givenPPB,
    partsPerBonus = MatchControllerInstance.partsPerBonus,
    bonusPointValue = MatchControllerInstance.bonusPointValue) {
    return givenPPB >= 0 && givenPPB <= (partsPerBonus * bonusPointValue);
  }

  function isValidScore(score = 0,
    tossupValues = MatchControllerInstance.pointScheme.tossupValues,
    bonusPointValue = MatchControllerInstance.pointScheme.bonusPointValue) {
    const divisors = [...tossupValues.map(tv => tv.value),
      bonusPointValue].filter(num => num !== undefined)
      .map(num => Math.abs(num));
    if (divisors.length === 0) {
      return true;
    }
    const thisGcd = gcd(...divisors);
    return Math.abs(score) % thisGcd === 0;
  }

  function numPlayerAnswers(player, onlyCorrectAnswers = false) {
    let sum = 0;
    for (const point in player.points) {
      if (player.points.hasOwnProperty(point) && (point >= 0 || !onlyCorrectAnswers)) {
        sum += (player.points[point] || 0);
      }
    }
    return sum;
  }

  function minPossibleTossupsHeard(match) {
    const totalCorrectAnswers = match.teams ? match.teams.reduce((sum, currentTeam) => {
      const tossupsGotten = currentTeam.players.reduce((t, curr) =>
        t + numPlayerAnswers(curr, true), 0);
      return sum + tossupsGotten;
    }, 0) : 0;
    const totalWrongAnswers = match.teams ? match.teams.reduce((sum, currentTeam) => {
      const totalNegs = currentTeam.players.reduce((t, curr) => {
        let total = 0;
        for (const point in curr.points) {
          if (curr.points.hasOwnProperty(point) && point < 0) {
            total += curr.points[point]
          }
        }
        return t + total;
      }, 0)
      return sum + totalNegs;
    }, 0) : 0;
    if (totalWrongAnswers > totalCorrectAnswers) {
      const extraNegs = totalWrongAnswers - totalCorrectAnswers;
      return extraNegs + totalCorrectAnswers;
    }
    return totalCorrectAnswers;
  }

  return {
    pointSum,
    teamBonusPoints,
    teamPPB,
    isValidPPB,
    isValidScore,
    totalTeamTossupGets,
    numPlayerAnswers,
    minPossibleTossupsHeard,
  };
};

export default () =>
  MatchControllerInstance =>
    MatchUtilFactory(MatchControllerInstance);

