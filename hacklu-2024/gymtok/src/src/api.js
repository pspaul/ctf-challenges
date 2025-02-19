const Router = require('koa-router');
const { bodyParser } = require("@koa/bodyparser");
const ratelimit = require('koa-ratelimit');
const { secret, assert, passwordEquals } = require('./util');
const bot = require('./bot');
const posts = require('./posts.json');

const FTP_PORT = process.env.FTP_PORT ?? 3021;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? secret(8);
const ADMIN_PASSWORD_FTP = process.env.ADMIN_PASSWORD_FTP ?? secret(8);
const BASE_URL = process.env.BASE_URL ?? 'https://localhost:3443';
const RATELIMIT_DURATION = parseInt(process.env.RATELIMIT_DURATION ?? '60') * 1000;
const RATELIMIT_MAX = parseInt(process.env.MAX ?? '2');

assert(/^[0-9a-f]{16}$/.test(ADMIN_PASSWORD), 'Insecure ADMIN_PASSWORD');
assert(/^[0-9a-f]{16}$/.test(ADMIN_PASSWORD_FTP), 'Insecure ADMIN_PASSWORD_FTP');

const admin = {
    id: 1,
    username: 'admin',
    password: ADMIN_PASSWORD,
    ftp: {
        username: 'admin',
        password: ADMIN_PASSWORD_FTP,
    },
};
const users = [admin];

const router = new Router();

router.get('/feed', async (ctx) => {
    ctx.body = {
        loggedIn: !!ctx.session.user,
        posts,
    };
});

router.post('/login', bodyParser(), async (ctx) => {
    const { username, password } = ctx.request.body;
    const user = users.find(u => u.username === username && passwordEquals(u.password, password));
    if (user) {
        ctx.session.user = user.id;
        ctx.body = { success: true };
    } else {
        ctx.status = 401;
        ctx.body = { error: 'Invalid credentials' };
    }
});

router.get('/upload-config', async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
        ctx.status = 401;
        ctx.body = { error: 'Login required' };
        return;
    }
    const user = users.find(u => u.id === ctx.session.user);

    const { username, password } = user.ftp;
    const { name } = ctx.request.query;
    ctx.body = {
        port: FTP_PORT,
        creds: `${username}:${password}`,
        file: `${name ?? 'video'}.mp4`,
    };
});

const reportLimiter = ratelimit({
    driver: 'memory',
    db: new Map(),
    duration: RATELIMIT_DURATION,
    max: RATELIMIT_MAX,
});

router.post('/report', reportLimiter, bodyParser(), async (ctx) => {
    const { url } = ctx.request.body;
    if (typeof url !== 'string') {
        ctx.status = 400;
        ctx.body = { error: 'Invalid URL' };
        return
    }
    console.log(`Reported: ${url}`);
    ctx.body = { success: true };
    bot.visit(url, admin.username, admin.password);
});

module.exports = { users, router };
