const { randomBytes, timingSafeEqual } = require('node:crypto');

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function secret(len=8) {
    return randomBytes(len).toString('hex');
}

function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
};

function passwordEquals(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

module.exports = {
    sleep,
    secret,
    assert,
    passwordEquals,
};
