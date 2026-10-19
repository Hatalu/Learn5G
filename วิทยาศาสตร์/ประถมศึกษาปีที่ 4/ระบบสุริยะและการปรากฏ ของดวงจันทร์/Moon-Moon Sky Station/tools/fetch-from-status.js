/* ดาวน์โหลดเสียงดิบจากไฟล์ผลลัพธ์ของ creative_get_flow_run_status (JSON) โดยจับคู่จากข้อความ prompt = say ใน clips.json
   ใช้: node tools/fetch-from-status.js <status.json> <โฟลเดอร์ดิบ>   แล้วรัน tools/process-voice.js <โฟลเดอร์ดิบ> */
const fs = require('fs'), path = require('path');
const [, , statusFile, rawDir] = process.argv;
const clips = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips.json'), 'utf8')).clips;
const st = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
fs.mkdirSync(rawDir, { recursive: true });
(async () => {
  for (const g of st.generations || []) {
    const c = clips.find(x => x.say === g.prompt);
    if (!c) { console.log('ไม่พบคลิปที่ตรงกับ prompt:', g.prompt); continue; }
    if (g.status !== 'completed') { console.log('ยังไม่เสร็จ', c.id, g.status); continue; }
    const r = await fetch(g.content_url);
    if (!r.ok) { console.log('ดาวน์โหลดไม่ได้', c.id, r.status); continue; }
    fs.writeFileSync(path.join(rawDir, c.id + '.mp3'), Buffer.from(await r.arrayBuffer()));
    console.log('ok', c.id, g.duration_secs + 's');
  }
})();
