const uuid = require('uuid/v4');
const { createHash } = require('crypto');

const sha256 = data => {
    let hash = createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
};

class Confession {
    constructor(title, message) {
        this.title = title;
        this.message = message;
        this.id = uuid();
        this.hash = sha256(message);
    }
}

class Access {
    constructor(name, args) {
        this.name = name;
        this.args = args || [];
        this.timestamp = String(new Date());
    }
}

module.exports = {
    Confession,
    Access,
};
