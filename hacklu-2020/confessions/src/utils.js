const { Access } = require('./models');
const db = require('./db');

// wrap all properties in resolvers with func
const wrapper = func => resolvers => Object.entries(resolvers).reduce((wrapped, [name, original]) => {
    wrapped[name] = (...args) => func(name, original, args);
    return wrapped;
}, Object.create(null));

// log args of the GraphQL query/mutation, serialized with argumentsSerializer
const logger = argumentsSerializer => wrapper((name, original, args) => {
    let actualArgs = args[1] || {};
    let ctx = args[2];
    console.log('[resolver]', name, actualArgs);
    db.addAccess(ctx.session, new Access(name, argumentsSerializer(actualArgs)));
    return original(...args);
});

// log the plain args as JSON
exports.log = logger(JSON.stringify);

// log the args as JSON, but redact the values
exports.logRedacted = logger(args => JSON.stringify(args, (key, value) => value instanceof Object ? value : '<redacted>'));
