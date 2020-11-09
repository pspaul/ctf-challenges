const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const doh = require('@sagi.io/dns-over-https');
const { middleware: insightsMiddleware } = require('./insights');

const app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(insightsMiddleware);

app.get('/', (req, res) => {
    res.send('ok');
});
app.post('/query', async (req, res) => {
    const incomingQuery = req.body;
    if (!incomingQuery || typeof incomingQuery !== 'object') {
        return res.status(400).json({
            success: false,
            error: 'invalid request',
        });
    }

    const { name } = incomingQuery;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'invalid name',
        });
    }

    // get resolver hostname via NS entry
    const upstreamResolvers = await standardDnsQuery(name, 'NS');
    if (!upstreamResolvers || upstreamResolvers.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'requested domain cannot be resolved via DoH',
        });
    }

    const resolverHostname = upstreamResolvers.filter(r => r.name === name)[0].data;
    const query = {
        hostname: resolverHostname,
        ...incomingQuery,
    };
    const response = await dnsQuery(query);

    req.insights.onResolve(query, response);

    res.status(200).json(response);
});

async function standardDnsQuery(name, type) {
    const response = await dnsQuery({
        name,
        type,
        method: 'POST',
        hostname: 'cloudflare-dns.com',
        path: '/dns-query',
        port: 443,
        klass: 'IN',
        useHttps: true,
    });
    return response.answers;
}

async function dnsQuery(query) {
    try {
        return await doh.query(query);
    } catch(e) {
        console.error(e);
        return { answers:[] };
    }
}

module.exports = app;
