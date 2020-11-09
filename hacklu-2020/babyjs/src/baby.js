const FLAG = process.env.FLAG || 'fakeflag{}';

const no = (m='no') => { console.log(m); process.exit(1); };
const assert = (m, b) => b || no(m);
const is = (o, t) => assert('is', typeof o === t);
const isnt = (o, t) => assert('isnt', typeof o !== t);
const passed = (i) => console.log(`check ${i} passed`);

(async () => {

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
const input = await new Promise(resolve => readline.question('Prove that you are 1337 and not baby: ', resolve));
readline.close();

assert('0', input !== '');
passed('0');

const clean = input.replace(/[\u2028\u2029]/g, '');
const json = JSON.parse(clean);

const { a, b } = json;
is(a, 'number');
is(b, 'number');
assert('1.1', a === b);
assert('1.2', 1337 / a !== 1337 / b);
passed('1');

let { c, d } = json;
isnt(c, 'undefined');
isnt(d, 'undefined');
const cast = (f, ...a) => a.map(f);
[c, d] = cast(Number, c, d);
assert('2.1', c !== d);
[c, d] = cast(String, c, d);
assert('2.2', c === d);
passed('2');

let { e } = json;
is(e, 'number');
const isCorrect = e++<e--&&!++e<!--e&&--e>e++;
assert('3', isCorrect);
passed('3');

const { f } = json;
isnt(f, 'undefined');
assert('4', f == !f);
passed('4');

const { g } = json;
isnt(g, 'undefined');
// what you see:
function check(x) {
    return {
        value: x * x
    };
}
// what the tokenizer sees:
function
        check
             (
              x
               )
                {
                 return
                       {
                        value
                             :
                              x
                               *
                                x
                                 }
                                  ;
                                   }
assert('5', g == check(g));
passed('5');

const { h } = json;
is(h, 'number');
try {
    JSON.parse(String(h));
    no('6');
} catch(e){}
passed('6');

const { i } = json;
isnt(i, 'undefined');
assert('7', i in [,,,...'"',,,Symbol.for("'"),,,]);
passed('7');

const js = eval(`(${clean})`);
assert('8', Object.keys(json).length !== Object.keys(js).length);
passed('8');

const { y, z } = json;
isnt(y, 'undefined');
isnt(z, 'undefined');
y[y][y](z)()(FLAG);

})();
