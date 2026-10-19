/* ตรวจว่าไม่มีอิโมจิในไฟล์ของเกม (กฎเหล็ก NO EMOJI): node tools/scan-emoji.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const re = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F000}-\u{1FAFF}\u200D\uFE0F]/u;
let bad = 0, files = 0;
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== 'audio' && f !== 'node_modules') walk(p); continue; }
    if (!/\.(html|css|js|json|md)$/.test(f)) continue;
    files++;
    fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => { const m = re.exec(line); if (m) { bad++; console.log(path.relative(root, p) + ':' + (i + 1) + ' U+' + m[0].codePointAt(0).toString(16) + ' ' + line.trim().slice(0, 80)); } });
  }
})(root);
console.log('ตรวจ ' + files + ' ไฟล์ พบอิโมจิ ' + bad + ' จุด');
process.exit(bad ? 1 : 0);
