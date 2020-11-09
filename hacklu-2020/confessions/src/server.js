const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const uuid = require('uuid/v4');

const registerApi = require('./api');

const PORT = process.env.PORT || '3000';
const BIND_ADDR = process.env.BIND_ADDR || '127.0.0.1';
const SESSION_SECRET = process.env.SESSION_SECRET || uuid();
const TRUST_PROXY = process.env.TRUST_PROXY || false;

const app = express();
app.use(morgan('dev'));
app.set('trust proxy', TRUST_PROXY);
app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader('Server', 'Confessions/1.0.0');

    // set CSP, except for the GQL playground
    if (req.path !== '/graphql' || process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', [
            "default-src 'none'",
            "script-src 'self'",
            "style-src 'self'",
            "img-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'none'",
            "navigate-to 'self'",
        ].join('; '));
    }

    next();
});
app.use(session({
    name: 'session',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
    },
}));

app.use(express.static('./static/'));
registerApi(app);

app.listen(PORT, BIND_ADDR, () => {
    console.log(`Confessions listening on ${BIND_ADDR}:${PORT}!`);
});
