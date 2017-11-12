import statsCache from './../cache';
import log from './../../helpers/log';

const buildPrefix = (req, statsType) => {
  const tournamentId = req.params.tid;
  const phaseId = req.query.phase || '';
  const prefix = `${tournamentId}_${phaseId}_${statsType}`;

  return prefix;
}

export const checkStatsCache = statsType => {
  return (req, res, next) => {
    const prefix = buildPrefix(req, statsType);
    const entry = statsCache.get(prefix);
    if (entry) {
      res.setHeader('x-neg5-from-cache', true);
      return res.json({result: entry, success: true});
    }
    return next();
  }
}

export const addStatsToCache = (request, statsType, payload) => {
  const prefix = buildPrefix(request, statsType);
  statsCache.set(prefix, payload);
}