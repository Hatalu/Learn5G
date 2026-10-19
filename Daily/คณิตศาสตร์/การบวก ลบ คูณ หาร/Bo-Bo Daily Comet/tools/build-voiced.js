/* สร้าง js/voiced.js = รายการคลิปเสียงทั้งหมด + ข้อความ (ใช้เป็นคำบรรยายและเสียงสำรอง)
   รวมจาก tools/clips.json (คลิปของเกมนี้) และ AI Voice/manifest.json (คลังกลาง: guide_m, trickster) */
const fs = require('fs'), path = require('path');
const strip = t => t.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
const mine = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips.json'), 'utf8')).clips;
const lib = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib-manifest.json'), 'utf8')).lines;
const out = {};
for (const c of mine) out[c.id] = strip(c.text);
for (const l of lib) if (l.voice === 'guide_m' || l.voice === 'trickster') out[l.voice + '/' + l.id] = strip(l.text);
// ตรวจว่ามีไฟล์จริงครบ
let miss = 0;
for (const id of Object.keys(out)) {
  const f = id.includes('/') ? path.join(__dirname, '..', 'audio', 'lib', id + '.mp3') : path.join(__dirname, '..', 'audio', 'voice', id + '.mp3');
  if (!fs.existsSync(f)) { console.log('ไม่มีไฟล์:', id); miss++; }
}
fs.writeFileSync(path.join(__dirname, '..', 'js', 'voiced.js'), '/* สร้างอัตโนมัติด้วย tools/build-voiced.js */\nwindow.VOICED = ' + JSON.stringify(out, null, 0) + ';\n');
console.log('คลิป', Object.keys(out).length, 'ไม่มีไฟล์', miss);
