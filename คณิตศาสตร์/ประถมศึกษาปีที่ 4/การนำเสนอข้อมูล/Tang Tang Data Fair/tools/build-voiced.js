/* สร้างรายชื่อไฟล์เสียงพากย์ที่มีอยู่จริง → js/voiced.js
   ใช้: node tools/build-voiced.js  (รันใหม่ทุกครั้งที่เพิ่มไฟล์ใน audio/voice) */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'audio', 'voice');
const ids = fs.readdirSync(dir).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)).sort();
fs.writeFileSync(path.join(__dirname, '..', 'js', 'voiced.js'),
  '/* สร้างอัตโนมัติด้วย tools/build-voiced.js — รายชื่อเสียงพากย์ ElevenLabs ที่มีไฟล์ */\nwindow.TT = window.TT || {};\nwindow.TT.VOICED = ' + JSON.stringify(ids) + ';\n');
console.log(ids.length + ' voice files');
