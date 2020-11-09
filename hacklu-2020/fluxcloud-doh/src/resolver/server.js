const resolverApi = require('./resolver');
const statsApi = require('./stats');
const { Insights } = require('./insights');

const RESOLVER_PORT = process.env.RESOLVER_PORT || '3000';
const RESOLVER_BIND_ADDR = process.env.RESOLVER_BIND_ADDR || '127.0.0.1';
const STATS_PORT = process.env.STATS_PORT || '3080';
const STATS_BIND_ADDR = process.env.STATS_BIND_ADDR || '127.0.0.1';

const insights = new Insights();

resolverApi.set('insights', insights);
resolverApi.listen(RESOLVER_PORT, RESOLVER_BIND_ADDR, () => {
    console.log(`Resolver API listening on ${RESOLVER_BIND_ADDR}:${RESOLVER_PORT}`);
});

statsApi.set('insights', insights);
statsApi.listen(STATS_PORT, STATS_BIND_ADDR, () => {
    console.log(`Stats API listening on ${STATS_BIND_ADDR}:${STATS_PORT}`);
});
