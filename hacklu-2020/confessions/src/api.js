const { ApolloServer, gql } = require('apollo-server-express');

const { Confession } = require('./models');
const db = require('./db');
const { log, logRedacted } = require('./utils');

const FLAG = process.env.FLAG || 'flag{fake}';

// the GraphQL schema
const typeDefs = gql`
    type Confession {
        id: String
        title: String
        hash: String
        message: String
    }

    type Access {
        timestamp: String
        name: String
        args: String
    }

    type Query {
        "Show the resolver access log. TODO: remove before production release"
        accessLog: [Access]

        "Get a confession by its hash. Does not contain confidential data."
        confession(hash: String): Confession
    }

    type Mutation {
        "Create a new confession."
        addConfession(title: String, message: String): Confession

        "Get a confession by its id."
        confessionWithMessage(id: String): Confession
    }
`;

const resolvers = {
    Query: log({
        accessLog: (_, __, { session }) => db.getAccessLog(session),
        confession: (_, { hash }, { session }) => {
            let confession = db.getConfessionByHash(session, hash);
            if (confession == null) {
                return null;
            }

            // remove confidential properies
            delete confession.id;
            delete confession.message;
            return confession;
        },
    }),
    Mutation: logRedacted({
        addConfession: (_, { title, message }, { session }) => {
            let confession = new Confession(title, message);
            db.addConfession(session, confession);
            return confession;
        },
        confessionWithMessage: (_, { id }, { session }) => {
            return db.getConfessionById(session, id);
        }
    }),
};

// insert the flag by using the actual resolvers and faking the timestamps
Array.prototype.reduce.call(FLAG, (acc, char) => {
    let current = acc + char;

    let fakeContext = {
        session: {
            accessLog: db.globalAccessLog,
            confessions: db.globalConfessions,
        }
    };

    let confession = resolvers.Mutation.addConfession(null, {
        title: 'Flag',
        message: current,
    }, fakeContext, null);
    db.globalAccessLog[db.globalAccessLog.length - 1].timestamp = String(new Date(Date.now() + 1000 * current.length));

    resolvers.Query.confession(null, { hash: confession.hash }, fakeContext, null);
    db.globalAccessLog[db.globalAccessLog.length - 1].timestamp = String(new Date(Date.now() + 1000 * current.length + 100));

    return current;
}, '');

module.exports = app => {
    let server = new ApolloServer({
        typeDefs,
        resolvers,
        playground: process.env.NODE_ENV !== 'production',
        introspection: true,
        context: ({ req }) => {
            // initialize the session if neccessary
            if (!req.session.accessLog) {
                req.session.accessLog = [];
            }
            if (!req.session.confessions) {
                req.session.confessions = [];
            }

            return { session: req.session };
        },
    });
    server.applyMiddleware({ app });
    return server;
};
