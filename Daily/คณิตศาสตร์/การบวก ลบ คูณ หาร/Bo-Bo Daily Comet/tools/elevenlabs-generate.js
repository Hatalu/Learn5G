/* สร้างคลิปเสียงที่ยังไม่มีจาก tools/clips.json ด้วย ElevenLabs API (เรียงทีละคลิป ไม่ยิงขนาน เพื่อไม่ให้บัญชีถูกล็อก)
   ใช้:  ELEVENLABS_API_KEY=xxxx node tools/elevenlabs-generate.js <โฟลเดอร์ดิบ>   แล้วรัน  node tools/process-voice.js <โฟลเดอร์ดิบ>
   - ข้ามคลิปที่มีไฟล์ดิบอยู่แล้ว (จึงไม่เสียเครดิตซ้ำ)  - เครดิต ≈ 1 ต่อ 1 ตัวอักษร (รวมแท็กอารมณ์ [..])
   - ถ้าคลิปไหนล้มเหลว ให้แก้คำใน clips.json แล้วรันซ้ำ (จะ gen เฉพาะที่ขาด)
   หมายเหตุ: สคริปต์นี้เขียนตามเอกสาร API แต่ยังไม่ได้รันจริงในสภาพแวดล้อมสร้างเกม (ตอนสร้างใช้ ElevenLabs MCP) */
const fs = require('fs'), path = require('path');
const dir = process.argv[2]; const key = process.env.ELEVENLABS_API_KEY;
if (!dir || !key) { console.error('ต้องระบุโฟลเดอร์ดิบ และตั้ง ELEVENLABS_API_KEY'); process.exit(1); }
fs.mkdirSync(dir, { recursive: true });
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips.json'), 'utf8'));
const todo = cfg.clips.filter(c => !fs.existsSync(path.join(dir, c.id + '.mp3')));
const chars = todo.reduce((n, c) => n + c.text.length, 0);
console.log('ต้อง gen ' + todo.length + ' คลิป ประมาณ ' + chars + ' เครดิต');
(async () => {
  for (const c of todo) {
    const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + cfg.voice + '?output_format=mp3_44100_128', { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: c.text, model_id: cfg.model }) });
    if (!r.ok) { console.error('ล้มเหลว', c.id, r.status, (await r.text()).slice(0, 200)); process.exit(2); }
    fs.writeFileSync(path.join(dir, c.id + '.mp3'), Buffer.from(await r.arrayBuffer()));
    console.log('ok', c.id); await new Promise(res => setTimeout(res, 1500));
  }
})();
