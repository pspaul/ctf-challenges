const http = require('http');
const express = require('express');
const morgan = require('morgan');
const socketIo = require('socket.io');
const got = require('got');

const BIND_ADDR = process.env.BIND_ADDR || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const FLAG = process.env.FLAG || 'flag{dummy}';
const AUTH_TOKEN = 'supersecretauthtoken:)';

const app = express();
const server = http.createServer(app);

const io = socketIo(server);
setInterval(() => {
    const data = [Math.random(), Math.random()];
    io.emit('data', data);
}, 1000);

app.use(morgan('dev'));
app.use((req, res, next) => {
    res.set('Connection', 'keep-alive');
    next();
});

app.get('/api/check', async (req, res) => {
    const hostname = req.query.hostname;
    if (typeof hostname !== 'string' || !/^[\w-]+(?:\.[\w-]+)+(?:\:[0-9]+)?$/i.test(hostname)) {
        return res.status(400).send('bad');
    }

    try {
        const url = new URL(`http://${hostname}/health`);
        console.log('[+] Checking', url.toString());
        const r = await got(url.toString(), {
            timeout: 5000,
            throwHttpErrors: false,
            followRedirect: false,
            rejectUnauthorized: false,
            headers: {
                'user-agent': 'FluxCloud/1.0.0',
            }
        });
        res.status(r.statusCode).send('ok');
    } catch (error) {
        console.error('oof', error.message);
        res.status(500).send('oof');
    }
    console.log('done');
});

app.get('/flag', (req, res) => {
    const auth = req.get('authorization');
    if (auth !== AUTH_TOKEN) {
        return res.status(403).send('nope');
    }

    res.send(FLAG);
});

server.listen(PORT, BIND_ADDR, () => {
    console.log(`MetadataService listening on ${BIND_ADDR}:${PORT}...`);
});
