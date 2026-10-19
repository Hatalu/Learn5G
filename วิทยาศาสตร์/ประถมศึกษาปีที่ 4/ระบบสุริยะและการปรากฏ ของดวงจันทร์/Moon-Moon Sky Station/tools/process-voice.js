/* ตัดความเงียบหัว-ท้าย + ปรับความดังให้เท่ากันของคลิปเสียงดิบจาก ElevenLabs
   ใช้: node tools/process-voice.js <โฟลเดอร์ดิบ>   (ต้องมี ffmpeg ใน PATH)
   ผลลัพธ์ที่ audio/voice/<id>.mp3 (mono 44.1k 96kbps)   */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rawDir = process.argv[2];
if (!rawDir) { console.error('ใส่โฟลเดอร์ไฟล์ดิบ'); process.exit(1); }
const out = path.join(__dirname, '..', 'audio', 'voice');
fs.mkdirSync(out, { recursive: true });

const TRIM = 'silenceremove=start_periods=1:start_threshold=-52dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-52dB:start_silence=0.05,areverse';
const TARGET_PEAK = -2.5; // dB

function run(args) { return spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { encoding: 'utf8' }); }

for (const f of fs.readdirSync(rawDir).filter(n => n.endsWith('.mp3'))) {
  const src = path.join(rawDir, f);
  const det = run(['-i', src, '-af', TRIM + ',volumedetect', '-f', 'null', '-']);
  const m = /max_volume:\s*(-?[\d.]+) dB/.exec(det.stderr || '');
  const gain = m ? Math.max(-6, Math.min(12, TARGET_PEAK - parseFloat(m[1]))) : 0;
  const dst = path.join(out, f);
  const r = run(['-y', '-i', src, '-af', TRIM + ',volume=' + gain.toFixed(2) + 'dB', '-ac', '1', '-ar', '44100', '-b:a', '96k', dst]);
  const dur = /time=(\d+:\d+:[\d.]+)/g;
  let last = ''; let mm; while ((mm = dur.exec(r.stderr || ''))) last = mm[1];
  console.log(f.padEnd(18), 'gain', gain.toFixed(1).padStart(5), 'dB', 'dur', last, r.status === 0 ? '' : 'FAILED');
}
