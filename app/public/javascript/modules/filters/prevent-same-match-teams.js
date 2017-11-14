export default () =>
  (items, otherTeamId) =>
    items.filter(item => item.id !== otherTeamId);
