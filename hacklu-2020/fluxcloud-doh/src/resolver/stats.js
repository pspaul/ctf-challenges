const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const { middleware: insightsMiddleware } = require('./insights');
const { ApiResults } = require('./api_pb');

const app = express();
app.use(insightsMiddleware);
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('ok');
});

app.get('/api', async (req, res) => {
    const queries = Array.isArray(req.query.query) ? req.query.query : [req.query.query];

    const results = new ApiResults();
    for (const query of queries) {
        // parse the complex query language
        const [ key, name ] = query.split(':');

        if (typeof req.insights[key] === 'function') {
            try {
                const data = await req.insights[key](name);
                const result = new ApiResults.ApiResult();
                const setterName = 'set' + key.substring(0, 1).toUpperCase() + key.substring(1);
                result[setterName](data);
                results.addApiResult(result);
            } catch(e) {
                results.addApiResult(new ApiResults.ApiResult());
            }
        } else {
            results.addApiResult(new ApiResults.ApiResult());
        }
    }

    res.set('content-type', 'application/protobuf');
    res.write(Buffer.from(results.serializeBinary()));
    res.end();
});

module.exports = app;
