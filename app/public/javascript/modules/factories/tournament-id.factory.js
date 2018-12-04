export default () => {
  if (typeof __NF_TOURNAMENT_ID__ === 'undefined') {
    return null;
  }
  return __NF_TOURNAMENT_ID__;
};

export const KEY = 'tournamentIdFactory';

