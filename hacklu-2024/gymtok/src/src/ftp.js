const { FtpSrv } = require('ftp-srv');
const VirtualFS = require('./vfs');
const { passwordEquals } = require('./util');

function auth(users, username, password) {
    return users.find(u => u.ftp.username === username && passwordEquals(u.ftp.password, password));
}

function createServer(users, opts) {
    const ftpServer = new FtpSrv(opts);

    const fileSystems = new Map();
    ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
        if (!auth(users, username, password)) {
            return reject(new Error('Invalid username or password'));
        }
        const tmpFs = new VirtualFS();
        fileSystems.set(connection.id, tmpFs);
        return resolve({
            fs: tmpFs,
            whitelist: ['STOR', 'RETR', 'LIST', 'QUIT', 'PASV', 'FEAT', 'AUTH', 'PWD', 'TYPE'],
        });    
    });
    ftpServer.on('disconnect', ({ connection }) => {
        fileSystems.delete(connection.id);
    });

    return ftpServer;
}

module.exports = { createServer };
