// Two clients join the same room code and exchange one broadcast each way.
// node "New Game/Knowledge Arena/tools/nettest.mjs"
import { connect, makeCode } from '../js/net.js';

const code = makeCode();
const got = [];
const a = await connect(code, (e, p) => got.push(['a', e, p]));
const b = await connect(code, (e, p) => got.push(['b', e, p]));
a.send('hello', { from: 'a' });
b.send('hello', { from: 'b' });
await new Promise((r) => setTimeout(r, 2500));
console.log(code, JSON.stringify(got));
a.close(); b.close();
const ok = got.some((g) => g[0] === 'b' && g[2].from === 'a') && got.some((g) => g[0] === 'a' && g[2].from === 'b');
console.log(ok ? 'ok' : 'FAILED');
process.exit(ok ? 0 : 1);
