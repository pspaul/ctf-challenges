const { Writable, Readable } = require('node:stream');

function toStat(opts) {
    return {
        atimeMs: Date.now(),
        mtimeMs: Date.now(),
        ctimeMs: Date.now(),
        ...opts,
        isDirectory() {
            return this.type === 'd';
        },
        isFile() {
            return this.type === 'f';
        },
    };
}

class VirtualFS {
    constructor(maxFileSize = 1024) {
        this.storage = new Map();
        this.maxFileSize = maxFileSize;
    }
    currentDirectory() { return '/' }
    chdir(_path) { throw new Error('Not implemented') }
    mkdir(_path) { throw new Error('Not implemented') }
    list(_path) {
        return Array.from(this.storage.entries()).map(([name, content]) => toStat({
            name,
            type: 'f',
            size: content.length,
        }));
    }
    get(name) {
        if (name === '.') name = this.currentDirectory();
        if (name === '/') {
            return toStat({
                name,
                type: 'd',
            });
        }
        if (!this.storage.has(name)) throw new Error(`File not found: ${name}`);
        return toStat({
            name,
            type: 'f',
            size: this.storage.get(name).length,
        });
    }
    read(name) {
        if (!this.storage.has(name)) throw new Error(`File not found: ${name}`);
        const stream = new Readable({
            read: () => {
                stream.push(this.storage.get(name));
                stream.push(null);
            },
        });
        return stream;
    }
    write(name, _opts) {
        const bufs = [];
        let size = 0;
        return new Writable({
            write: (chunk, _encoding, callback) => {
                if (size + chunk.length > this.maxFileSize) {
                    return callback(new Error('File too large'));
                }
                bufs.push(chunk);
                size += chunk.length;
                callback();
            },
            final: (callback) => {
                this.storage.set(name, Buffer.concat(bufs));
                callback();
                // TODO: implement adding the file to the feed (can wait until
                // we have paying users)
            },
        });
    }
    delete(name) {
        if (!this.storage.has(oldName)) {
            throw new Error(`File not found: ${name}`);
        }
        this.storage.delete(name);
    }
    rename(oldName, newName) {
        if (!this.storage.has(oldName)) {
            throw new Error(`File not found: ${oldName}`);
        }
        const content = this.storage.get(oldName);
        this.storage.delete(oldName);
        this.storage.set(newName, content);
    }
    chmod(_path, _mode) { throw new Error('Not implemented') }
    getUniqueName(_name) { throw new Error('Not implemented') }
}

module.exports = VirtualFS;
