
// this the in-memory DB :)
const globalConfessions = [];
const globalAccessLog = [];

// confession stuff
const getConfessions = session => [...globalConfessions, ...(session.confessions || [])];
const getConfessionByHash = (session, hash) => getConfessions(session).reduce((lastFound, c) => c.hash === hash ? c : lastFound, null);
const getConfessionById = (session, id) => getConfessions(session).reduce((lastFound, c) => c.id === id ? c : lastFound, null);
const addConfession = (session, confession) => session.confessions.push(confession);

// access stuff
const getAccessLog = session => [...globalAccessLog, ...(session.accessLog || [])];
const addAccess = (session, access) => session.accessLog.push(access);

exports.globalAccessLog = globalAccessLog;
exports.globalConfessions = globalConfessions;

exports.getConfessions = getConfessions;
exports.getConfessionByHash = getConfessionByHash;
exports.getConfessionById = getConfessionById;
exports.addConfession = addConfession;

exports.getAccessLog = getAccessLog;
exports.addAccess = addAccess;
