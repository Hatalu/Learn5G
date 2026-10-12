/* ═══════════════════════════════════════════════════════════
   สร้างเสียงพากย์ที่ยังขาด ด้วย ElevenLabs API (สร้างทีละประโยค ไม่ยิงพร้อมกัน)
   ใช้:
     set ELEVENLABS_API_KEY=xxxxxxxx        (PowerShell: $env:ELEVENLABS_API_KEY="xxxx")
     node tools/elevenlabs-generate.js       สร้างเฉพาะไฟล์ที่ยังไม่มี
     node tools/elevenlabs-generate.js t41   สร้าง/สร้างใหม่ เฉพาะ id ที่ระบุ
   เสียง: ปิ๊ง = Jessica (cgSgspJ2msm6clMCkdW9), ลบลบ = Laura (FGY2WhTYpPnrIDTdsKH5)
   โมเดล eleven_v3 (รองรับแท็กอารมณ์ [excited] ฯลฯ)
   ═══════════════════════════════════════════════════════════ */
const fs = require('fs'), path = require('path'), vm = require('vm');

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('ตั้งค่า ELEVENLABS_API_KEY ก่อนนะ'); process.exit(1); }
const VOICE = { p: 'cgSgspJ2msm6clMCkdW9', l: 'FGY2WhTYpPnrIDTdsKH5' };
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'audio', 'voice');

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'lines.js'), 'utf8'), sandbox);
const LINES = sandbox.window.GB.LINES;

const only = process.argv.slice(2);
const todo = Object.keys(LINES).filter(id => only.length ? only.includes(id) : !fs.existsSync(path.join(OUT, id + '.mp3')));
console.log('ต้องสร้าง ' + todo.length + ' ประโยค');

const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  for (const id of todo) {
    const [who, text, say] = LINES[id];
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + VOICE[who] + '?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: say || text, model_id: 'eleven_v3' })
    });
    if (!res.ok) { console.log('FAIL', id, res.status, (await res.text()).slice(0, 200)); await sleep(3000); continue; }
    fs.writeFileSync(path.join(OUT, id + '.mp3'), Buffer.from(await res.arrayBuffer()));
    console.log('OK', id);
    await sleep(1200);
  }
  require('./build-voiced.js');
})();
