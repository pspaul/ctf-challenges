const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const https = require('node:https');
const http2 = require('node:http2');
const { Z_SYNC_FLUSH } = require('node:zlib').constants;
const Koa = require('koa');
const logger = require('koa-logger');
const static = require('koa-static');
const session = require('koa-session');
const compress = require('koa-compress');
const { secret, assert } = require('./util');
const ftp = require('./ftp');
const { users, router } = require('./api');

const HTTPS_PORT = process.env.HTTPS_PORT ?? 3443;
const HTTP2_PORT = process.env.HTTP2_PORT ?? (HTTPS_PORT + 1);
const FTP_DOMAIN = process.env.FTP_DOMAIN ?? 'gymtok.social';
const FTP_PORT = process.env.FTP_PORT ?? 3021;
const [FTP_PASV_MIN, FTP_PASV_MAX] = process.env.FTP_PASV_RANGE?.split(',').map(s => parseInt(s.trim())) ?? [1024, 65535];
const tlsConfig = {
    key: readFileSync(process.env.FTP_TLS_KEY ?? join(__dirname, '../certs/gymtok-key.pem')),
    cert: readFileSync(process.env.FTP_TLS_CERT ?? join(__dirname, '../certs/gymtok-cert.pem')),
};
const SESSION_SECRET = process.env.SESSION_SECRET ?? secret(16);
assert(/^[0-9a-f]{32}$/.test(SESSION_SECRET), 'Insecure SESSION_SECRET');

const app = new Koa();
app.keys = [SESSION_SECRET];
app.use(async (ctx, next) => {
    ctx.set('Content-Security-Policy', "default-src 'none'; "
        + "script-src-elem 'sha256-3OlbYLWPW1pFclyvDmerzR+dAAQAiC294FaCIyexP84='; "
        + "style-src-elem 'self'; "
        + "img-src 'self' https://randomuser.me/api/portraits/; "
        + "connect-src 'self'; "
        + "frame-src https://www.tiktok.com/embed/v2/; "
        + "frame-ancestors 'none'; "
        + "form-action 'none'; "
        + "base-uri 'none'"
    );
    if ('cdn' in ctx.request.query && typeof ctx.request.query.cdn === 'string') {
        ctx.set('Alt-Svc', `h2=${JSON.stringify(ctx.request.query.cdn)}`);
    }
    await next();
});
app.use(logger());
app.use(compress({
    deflate: { flush: Z_SYNC_FLUSH },
    gzip: false,
    br: false,
}));
app.use(session(app));
app.use(router.routes());
app.use(static(join(__dirname, 'static'), {
    maxage: 86400_000, // 24h
}));

const appHandler = app.callback();
const httpsServer = https.createServer(tlsConfig, appHandler);
httpsServer.listen(HTTPS_PORT, () => console.log(`HTTPS on :${HTTPS_PORT}`));
const http2Server = http2.createSecureServer(tlsConfig, appHandler);
http2Server.listen(HTTP2_PORT, () => console.log(`HTTP/2 on :${HTTP2_PORT}`));

const ftpServer = ftp.createServer(users, {
    url: `ftp://0.0.0.0:${FTP_PORT}`,
    pasv_min: FTP_PASV_MIN,
    pasv_max: FTP_PASV_MAX,
    pasv_url: FTP_DOMAIN,
    tls: tlsConfig,
});
ftpServer.listen().then(() => console.log(`FTP on :${FTP_PORT}`));
