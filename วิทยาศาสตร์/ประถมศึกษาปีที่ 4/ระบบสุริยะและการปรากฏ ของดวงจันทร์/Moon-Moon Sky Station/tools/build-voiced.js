/* สร้าง js/voiced.js = รายการคลิปเสียงทั้งหมด + ข้อความ (ใช้เป็นคำบรรยายบนจอและเสียงสำรอง)
   รวมจาก tools/clips.json (คลิปเฉพาะเกมนี้) และคลังกลาง AI Voice (เฉพาะเสียงผู้หญิง guide_f=Jessica, trickster=Laura)
   ใช้: node tools/build-voiced.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const strip = t => t.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
const mine = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips.json'), 'utf8')).clips;
const lib = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib-manifest.json'), 'utf8')).lines;
const out = {};
for (const c of mine) out[c.id] = c.text;
for (const l of lib) if (l.voice === 'guide_f' || l.voice === 'trickster') out[l.voice + '/' + l.id] = strip(l.text);
let miss = [];
for (const id of Object.keys(out)) {
  const f = id.includes('/') ? path.join(root, 'audio', 'lib', id + '.mp3') : path.join(root, 'audio', 'voice', id + '.mp3');
  if (!fs.existsSync(f)) miss.push(id);
}
fs.writeFileSync(path.join(root, 'js', 'voiced.js'), '/* สร้างอัตโนมัติด้วย tools/build-voiced.js */\nwindow.VOICED = ' + JSON.stringify(out) + ';\n');
console.log('คลิปทั้งหมด', Object.keys(out).length, '· ยังไม่มีไฟล์เสียง', miss.length, miss.length ? '→ ' + miss.join(' ') : '');
