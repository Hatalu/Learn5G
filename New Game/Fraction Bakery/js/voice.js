// Character voice: ElevenLabs clips first, browser TTS of the same text if a clip is missing or blocked.
import { LINES, LIB } from './lines.js';
import { isMuted } from './audio.js';

let cur = null, curFin = null, token = 0;
const lastLib = {};

export function stopVoice() {
  token++;
  if (cur) { try { cur.pause(); } catch {} cur = null; }
  if (curFin) { const f = curFin; curFin = null; f(true); }
  try { speechSynthesis.cancel(); } catch {}
}

function tts(text) {
  return new Promise((res) => {
    try {
      if (!('speechSynthesis' in window)) return res();
      const u = new SpeechSynthesisUtterance(text.replace(/(\d+)\/(\d+)/g, '$1 ส่วน $2'));
      u.lang = 'th-TH'; u.rate = 1; u.pitch = 1.25;
      const v = speechSynthesis.getVoices().find((x) => x.lang.replace('_', '-').startsWith('th'));
      if (v) u.voice = v;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 600 + text.length * 120); // some browsers never fire onend
    } catch { res(); }
  });
}

function clip(src, text) {
  stopVoice();
  const my = ++token;
  if (isMuted()) return new Promise((r) => setTimeout(r, 500 + text.length * 45));
  return new Promise((res) => {
    const a = new Audio(src);
    cur = a;
    let done = false;
    const fin = (ok) => { if (done) return; done = true; if (!ok && my === token) tts(text).then(res); else res(); };
    curFin = () => fin(true);
    a.onended = () => fin(true); // note: 'pause' fires right before 'ended', so never treat pause as failure
    a.onerror = () => fin(false);
    a.play().catch(() => fin(false));
  });
}

// Plays a line from LINES. Returns { who, text, done }.
export function say(id) {
  const [who, text] = LINES[id];
  return { who, text, done: clip(`audio/voice/${id}.mp3`, text) };
}

const LIB_TEXT = {
  praise1: 'เก่งมาก! ถูกต้องเลย!', praise2: 'สุดยอดไปเลย!', praise3: 'ใช่เลย! แม่นมาก!', praise4: 'เยี่ยมไปเลย! ไปต่อกัน!', praise5: 'ว้าว! ผ่านฉลุย!', praise6: 'ถูกต้องจ้า! เก่งจังเลย!',
  streak: 'ถูกติดกันเลย! ร้อนแรงมาก!', oops1: 'ยังไม่ใช่จ้า ลองอีกทีนะ', oops2: 'เกือบแล้ว! สังเกตอีกนิดนะ', oops3: 'ไม่เป็นไร ลองใหม่ได้เรื่อย ๆ', oops4: 'อุ๊ปส์ ลองดูอีกทีนะ',
  hint1: 'ดูตรงที่กระพริบนะ มีคำใบ้อยู่!', hint3: 'ลองนับดูทีละอันสิ', look: 'สังเกตดี ๆ นะ', stageclear: 'ผ่านด่านนี้แล้ว! รับดาวไปเลย!',
  wrong1: 'ข้าว่าข้อนี้แหละถูก! เชื่อข้าสิ!', wrong2: 'ข้อนี้ชัวร์เลย ไม่ต้องคิดมาก!', wrong3: 'ตามข้ามาเลย ข้าไม่หลอกหรอก!', wrong4: 'คำตอบอยู่ตรงนั้นแหละ ลองเลือกสิ!',
  hit1: 'โอ๊ย! ทำได้อีกแล้ว!', hit2: 'อะไรกัน! ไม่นะ!', surprise: 'เอ๊ะ! รู้ได้ยังไงเนี่ย!', laugh: 'ฮ่า ฮ่า ฮ่า!', gotcha: 'โดนหลอกเข้าให้แล้ว!',
  lose: 'ยอมแล้ว ๆ ข้าแพ้แล้ว', sorry: 'ข้าขอโทษ ข้าจะช่วยแล้วกัน',
};

// Plays a random shared-library clip of a category (no immediate repeats).
export function sayLib(cat) {
  const [voice, ids] = LIB[cat];
  let id = ids[Math.floor(Math.random() * ids.length)];
  if (ids.length > 1 && id === lastLib[cat]) id = ids[(ids.indexOf(id) + 1) % ids.length];
  lastLib[cat] = id;
  const text = LIB_TEXT[id];
  return { who: voice === 'trickster' ? 'j' : 'm', text, done: clip(`audio/lib/${voice}/${id}.mp3`, text) };
}
