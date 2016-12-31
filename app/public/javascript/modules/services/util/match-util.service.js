export default class MatchUtilService {
  static pointSum(points) {
    if (!points) {
      return 0;
    }
    const values = Object.keys(points);
    return values.reduce((sum, current) => {
      const product = (points[`${current}`] * current) || 0;
      return sum + product;
    }, 0);
  }

  static teamBonusPoints(team) {
    
  }
}
