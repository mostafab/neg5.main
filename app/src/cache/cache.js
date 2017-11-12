import NodeCache from 'node-cache';
import log from './../helpers/log';
import config from './../config/configuration';

const ttl = parseInt(config.STATS_CACHE_TTL) || 0;

const StatsCacheSingleton = new NodeCache({ stdTTL: ttl });

log.INFO(`Created stats cache with config ttl: ${ttl}s.`);

export default StatsCacheSingleton;
