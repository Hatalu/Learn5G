/* ═══════════════════════════════════════════════════════════
   LEARN5G SHARED VOICE LIBRARY — ตัวช่วยเล่นเสียงจากคลังกลาง
   (ไฟล์นี้สร้างอัตโนมัติจาก manifest.json ด้วย build-lib.js อย่าแก้ตรง ๆ)

     const V = Learn5GVoice.create({ base: 'audio/lib/' });
     V.play('guide_m', 'praise');                 // สุ่มคำชมไม่ซ้ำรอบก่อน
     const ln = V.choose('guide_m', 'oops');      // {v, id, cat, text} เอา text ไปแสดงบนจอให้ตรงกับเสียง
     V.playLine(ln).then(ok => ...);              // เล่นแล้วรู้ว่าจบ/ล้มเหลว

   หมวด (cat): praise, oops, hint, flow, intro, wrong, taunt, hit, lose
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const LINES = [{"v":"guide_f","id":"praise1","cat":"praise","text":"เก่งมาก! ถูกต้องเลย!"},{"v":"guide_f","id":"praise2","cat":"praise","text":"สุดยอดไปเลย!"},{"v":"guide_f","id":"praise3","cat":"praise","text":"ใช่เลย! แม่นมาก!"},{"v":"guide_f","id":"praise4","cat":"praise","text":"เยี่ยมไปเลย! ไปต่อกัน!"},{"v":"guide_f","id":"praise5","cat":"praise","text":"ว้าว! ผ่านฉลุย!"},{"v":"guide_f","id":"praise6","cat":"praise","text":"ถูกต้องจ้า! เก่งจังเลย!"},{"v":"guide_f","id":"streak","cat":"praise","text":"ถูกติดกันเลย! ร้อนแรงมาก!"},{"v":"guide_f","id":"oops1","cat":"oops","text":"ยังไม่ใช่จ้า ลองอีกทีนะ"},{"v":"guide_f","id":"oops2","cat":"oops","text":"เกือบแล้ว! สังเกตอีกนิดนะ"},{"v":"guide_f","id":"oops3","cat":"oops","text":"ไม่เป็นไร ลองใหม่ได้เรื่อย ๆ"},{"v":"guide_f","id":"oops4","cat":"oops","text":"อุ๊ปส์ ลองดูอีกทีนะ"},{"v":"guide_f","id":"retry","cat":"oops","text":"ลองอีกทีนะ"},{"v":"guide_f","id":"hint1","cat":"hint","text":"ดูตรงที่กระพริบนะ มีคำใบ้อยู่!"},{"v":"guide_f","id":"hint2","cat":"hint","text":"เราช่วยชี้ให้แล้ว ลองอีกครั้งนะ"},{"v":"guide_f","id":"hint3","cat":"hint","text":"ลองนับดูทีละอันสิ"},{"v":"guide_f","id":"look","cat":"hint","text":"สังเกตดี ๆ นะ"},{"v":"guide_f","id":"hello","cat":"flow","text":"สวัสดีจ้า! พร้อมผจญภัยกันหรือยัง?"},{"v":"guide_f","id":"go","cat":"flow","text":"ไปลุยกันเลย!"},{"v":"guide_f","id":"countdown","cat":"flow","text":"สาม สอง หนึ่ง ลุย!"},{"v":"guide_f","id":"stageclear","cat":"flow","text":"ผ่านด่านนี้แล้ว! รับดาวไปเลย!"},{"v":"guide_f","id":"bonus","cat":"flow","text":"เก่งขนาดนี้! ลองภารกิจพิเศษไหม?"},{"v":"guide_f","id":"easy","cat":"flow","text":"ซ้อมอีกข้อสบาย ๆ ก่อนไหม?"},{"v":"guide_f","id":"map","cat":"flow","text":"แตะที่เรืองแสงเพื่อเริ่มได้เลย!"},{"v":"guide_f","id":"lock","cat":"flow","text":"ด่านนี้ยังปิดอยู่ เล่นด่านก่อนหน้าก่อนนะ"},{"v":"guide_f","id":"alldone","cat":"flow","text":"ครบทุกด่านแล้ว! เก่งที่สุดเลย!"},{"v":"guide_f","id":"thanks","cat":"flow","text":"ขอบคุณที่ช่วยนะ เจอกันใหม่!"},{"v":"guide_f","id":"timeup","cat":"flow","text":"เวลาใกล้หมดแล้วนะ"},{"v":"guide_m","id":"praise1","cat":"praise","text":"เยี่ยมเลย! ตอบถูกแล้ว!"},{"v":"guide_m","id":"praise2","cat":"praise","text":"โห เก่งสุด ๆ!"},{"v":"guide_m","id":"praise3","cat":"praise","text":"แม่นจริง ๆ ไปต่อเลย!"},{"v":"guide_m","id":"praise4","cat":"praise","text":"ยอดเยี่ยม! ผ่านเลย!"},{"v":"guide_m","id":"oops1","cat":"oops","text":"ยังไม่ใช่นะ ลองอีกที"},{"v":"guide_m","id":"oops2","cat":"oops","text":"ใกล้แล้ว! ลองดูใหม่นะ"},{"v":"guide_m","id":"oops3","cat":"oops","text":"ไม่เป็นไร ผิดได้ ลองใหม่ได้"},{"v":"guide_m","id":"hint1","cat":"hint","text":"ใบ้ให้นิดนึงนะ ดูตรงที่เรืองแสง"},{"v":"guide_m","id":"hint2","cat":"hint","text":"ค่อย ๆ คิดนะ ไม่ต้องรีบ"},{"v":"guide_m","id":"think","cat":"hint","text":"อืม ลองคิดดูนะ"},{"v":"guide_m","id":"hello","cat":"flow","text":"สวัสดีจ้า! วันนี้มีอะไรสนุก ๆ รออยู่เพียบ!"},{"v":"guide_m","id":"go","cat":"flow","text":"ลุยกันเลย!"},{"v":"guide_m","id":"stageclear","cat":"flow","text":"ด่านนี้ผ่านแล้ว! เก็บดาวเลย!"},{"v":"guide_m","id":"bonus","cat":"flow","text":"เก่งขนาดนี้! ลองด่านท้าทายไหม?"},{"v":"guide_m","id":"alldone","cat":"flow","text":"ครบทุกด่านแล้ว! สุดยอดไปเลย!"},{"v":"trickster","id":"intro1","cat":"intro","text":"ฮิฮิ! ข้ามาป่วนอีกแล้วนะ!"},{"v":"trickster","id":"intro2","cat":"intro","text":"ใครจะหยุดข้าได้ล่ะ?"},{"v":"trickster","id":"final","cat":"intro","text":"ถึงด่านสุดท้ายแล้ว! เจอข้าหน่อย!"},{"v":"trickster","id":"wrong1","cat":"wrong","text":"ข้าว่าข้อนี้แหละถูก! เชื่อข้าสิ!"},{"v":"trickster","id":"wrong2","cat":"wrong","text":"ข้อนี้ชัวร์เลย ไม่ต้องคิดมาก!"},{"v":"trickster","id":"wrong3","cat":"wrong","text":"ตามข้ามาเลย ข้าไม่หลอกหรอก!"},{"v":"trickster","id":"wrong4","cat":"wrong","text":"คำตอบอยู่ตรงนั้นแหละ ลองเลือกสิ!"},{"v":"trickster","id":"trick1","cat":"taunt","text":"ลองดูสิ ถ้าตาไวพอ!"},{"v":"trickster","id":"taunt1","cat":"taunt","text":"ทำไม่ได้หรอก ฮิฮิ!"},{"v":"trickster","id":"taunt2","cat":"taunt","text":"ยากไปไหม? ยอมแพ้ซะเถอะ!"},{"v":"trickster","id":"gotcha","cat":"taunt","text":"โดนหลอกเข้าให้แล้ว!"},{"v":"trickster","id":"laugh","cat":"taunt","text":"ฮ่า ฮ่า ฮ่า!"},{"v":"trickster","id":"hit1","cat":"hit","text":"โอ๊ย! ทำได้อีกแล้ว!"},{"v":"trickster","id":"hit2","cat":"hit","text":"อะไรกัน! ไม่นะ!"},{"v":"trickster","id":"hit3","cat":"hit","text":"ข้ายังไม่ยอมแพ้!"},{"v":"trickster","id":"surprise","cat":"hit","text":"เอ๊ะ! รู้ได้ยังไงเนี่ย!"},{"v":"trickster","id":"lose","cat":"lose","text":"ยอมแล้ว ๆ ข้าแพ้แล้ว"},{"v":"trickster","id":"sorry","cat":"lose","text":"ข้าขอโทษ ข้าจะช่วยแล้วกัน"},{"v":"villain","id":"intro","cat":"intro","text":"ฮึ ฮึ ฮึ... ข้ายึดที่นี่ไว้แล้ว!"},{"v":"villain","id":"final","cat":"intro","text":"ด่านสุดท้าย... ข้าไม่ปล่อยเจ้าไปง่าย ๆ!"},{"v":"villain","id":"taunt1","cat":"taunt","text":"เจ้าตัวเล็ก ผ่านข้าไปไม่ได้หรอก"},{"v":"villain","id":"taunt2","cat":"taunt","text":"คิดว่าตัวเองฉลาดนักหรือ?"},{"v":"villain","id":"dare","cat":"taunt","text":"มาสิ ถ้ากล้า!"},{"v":"villain","id":"wrong1","cat":"wrong","text":"คำตอบนี้แหละ ถูกที่สุด!"},{"v":"villain","id":"wrong2","cat":"wrong","text":"เลือกสิ เลือกผิดก็ไม่เป็นไร ฮ่า ๆ"},{"v":"villain","id":"wrongagain","cat":"wrong","text":"ผิดอีกแล้วสินะ!"},{"v":"villain","id":"laugh","cat":"taunt","text":"ฮ่า ฮ่า ฮ่า!"},{"v":"villain","id":"hit1","cat":"hit","text":"อึก! ไม่จริงน่า!"},{"v":"villain","id":"hit2","cat":"hit","text":"เจ้าเด็กนี่... เก่งกว่าที่คิด!"},{"v":"villain","id":"lose","cat":"lose","text":"ข้าแพ้แล้ว... ยอมแล้ว"},{"v":"villain","id":"redeem","cat":"lose","text":"ก็ได้ ข้าจะช่วยก็ได้"}];

  function create(opts) {
    opts = opts || {};
    const base = opts.base || 'audio/';
    const last = {};
    let current = null, currentFin = null;
    let volume = opts.volume == null ? 1 : opts.volume;

    function choose(voice, cat, id) {
      if (id) return LINES.find(l => l.v === voice && l.id === id) || null;
      const pool = LINES.filter(l => l.v === voice && l.cat === cat);
      if (!pool.length) return null;
      const key = voice + '/' + cat;
      let c = pool[Math.floor(Math.random() * pool.length)];
      if (pool.length > 1 && last[key] === c.id) c = pool[(pool.indexOf(c) + 1) % pool.length];
      last[key] = c.id;
      return c;
    }

    function stop() {
      const f = currentFin; currentFin = null;
      if (current) { try { current.pause(); } catch (e) {} current = null; }
      if (f) f(false);
    }

    /* เล่นคลิปที่เลือกแล้ว → Promise<boolean> (true = เล่นจนจบ, false = เล่นไม่ได้/ถูกหยุด) */
    function playLine(line) {
      if (!line) return Promise.resolve(false);
      stop();
      const a = new Audio(base + line.v + '/' + line.id + '.mp3');
      a.volume = Math.max(0, Math.min(1, volume));
      current = a;
      return new Promise(function (resolve) {
        let done = false;
        const fin = function (ok) { if (done) return; done = true; if (current === a) { current = null; currentFin = null; } resolve(ok); };
        currentFin = fin;
        a.addEventListener('ended', function () { fin(true); });
        a.addEventListener('error', function () { fin(false); });
        const p = a.play();
        if (p && p.catch) p.catch(function () { fin(false); });
      });
    }

    function play(voice, cat, o) {
      o = o || {};
      const line = choose(voice, cat, o.id);
      return playLine(line).then(function (ok) { if (!ok && o.fallback) o.fallback(); return ok; });
    }

    return {
      choose: choose, playLine: playLine, play: play, stop: stop,
      setVolume: function (v) { volume = v; if (current) current.volume = Math.max(0, Math.min(1, v)); },
      lines: LINES.slice()
    };
  }

  root.Learn5GVoice = { create: create, LINES: LINES };
})(typeof window !== 'undefined' ? window : this);
