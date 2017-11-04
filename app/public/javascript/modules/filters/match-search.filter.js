export default () =>
  (matches, query) => matches.filter((match) => {
    if (query === null) {
      return false;
    }
    const normalizedQuery = query.toLowerCase();
    const { round, teams } = match;
    const teamOneName = teams.one.name.toLowerCase();
    const teamTwoName = teams.two.name.toLowerCase();

    return round == normalizedQuery
        || teamOneName.indexOf(normalizedQuery) !== -1
        || teamTwoName.indexOf(normalizedQuery) !== -1;
  });
