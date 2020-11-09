const redis = require('./redis');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_PASS = process.env.REDIS_PASS || undefined;
const REDIS_TTL = parseInt(process.env.REDIS_TTL || '3600', 10);
const FLAG = process.env.FLAG || 'fakeflag{}';

const KEY_COUNT = 'count';
const KEY_LAST_ANSWER = 'last-answer';

exports.Insights = class Insights {
    constructor() {
        this.db = redis.createClient({
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASS
        });

        this.db.hset('flag', KEY_LAST_ANSWER, FLAG, (error) => {
            if (error) {
                console.log('Error setting flag:', e);
                process.exit(1);
            }
        });
    }
    async onResolve(query, response) {
        const { name } = query;
        if (/flag/i.test(name)) {
            return;
        }
        const answer = response.answers?.[0]?.data ?? null;
        if (answer === null) {
            return;
        }
        await this.db.multi()
                     .hincrby(name, KEY_COUNT, 1)
                     .hset(name, KEY_LAST_ANSWER, answer)
                     .expire(name, REDIS_TTL)
                     .execAsync();
    }
    async count(name) {
        return parseInt(await this.db.hgetAsync(name, KEY_COUNT), 10);
    }
    async lastAnswer(name) {
        return await this.db.hgetAsync(name, KEY_LAST_ANSWER);
    }
    async wasQueried(name) {
        return Boolean(await this.db.existsAsync(name));
    }
};

exports.middleware = (req, res, next) => {
    req.insights = req.app.get('insights');
    next();
};
