/* ═══════════════════════════════════════════════════════════
   DOTTY GRAND PRIX — เนื้อหา 5 สนาม
   task = { skill, title, say, judSay?, render(el, api), hint(level), answer, solve() }
   level 1–3 ปรับอัตโนมัติจาก "ความถูกต้อง" ไม่ใช่ความเร็ว
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const DG = window.DG;
  const { D, art, W, ui, audio } = DG;
  const { R, pick, shuffle, uniq } = D;
  const PL = D.PLACE;
  const tok = s => '{' + s + '}';
  const ctok = s => '{c:' + s + '}';
  const FRAC = ['t1', 't2', 't3'];

  /* ── ส่วนประกอบหน้าจอที่ใช้ซ้ำ ── */
  function goBtn(label) {
    return '<div class="act"><button class="btn btn-go act-go">' + art.icon('check') + '<span>' + label + '</span></button></div>';
  }
  function ticket(lbl, html, unit, cls) {
    return '<div class="ticket ' + (cls || '') + '"><span class="tk-lbl">' + lbl + '</span><span class="tk-val">' + html + '</span>' +
      (unit ? '<span class="tk-unit">' + unit + '</span>' : '') + '</div>';
  }
  function sayBtn(text) {
    return '<button class="icon-btn say-btn" data-say="' + ui.esc(text) + '" aria-label="ฟังเสียง">' + art.icon('speaker') + '</button>';
  }
  function wireSay(el) {
    el.querySelectorAll('.say-btn').forEach(b => b.addEventListener('click', () => audio.speak(b.dataset.say, { emo: 'hype' })));
  }
  /* "แผ่นเต็ม 1 แผ่น 2 แถว 5 ชิ้นจิ๋ว" */
  function pieceWords(s) {
    const v = D.val(s);
    const one = Math.floor(v / 1000), t1 = Math.floor(v / 100) % 10, t2 = Math.floor(v / 10) % 10, t3 = v % 10;
    const out = [];
    if (one) out.push('แผ่นเต็ม ' + one + ' แผ่น');
    if (t1) out.push(t1 + ' แถว');
    if (t2) out.push(t2 + ' ช่อง');
    if (t3) out.push(t3 + ' ชิ้นจิ๋ว');
    return out.join(' ') || 'ไม่มีพลังเลย';
  }
  /* "หน่วย 1 · ส่วนสิบ 2 · ส่วนร้อย 0" */
  const placeList = s => D.digits(s).map(x => PL[x.k].short + ' ' + x.d).join(' · ');
  function diag(s, target) {
    const a = D.digits(s).map(x => x.d).join(''), b = D.digits(target).map(x => x.d).join('');
    if (a === b) return 'ตัวเลขถูกแล้ว แต่จุดทศนิยมอยู่ผิดที่!';
    if (a.replace(/0/g, '') === b.replace(/0/g, '')) return 'ตัวเลขครบ แต่เลข 0 หายไปหรืออยู่ผิดที่ หลักไหนไม่มี ต้องเขียน 0 ไว้นะ';
    return '';
  }
  const LEAD_WRONG = ['เกือบแล้ว! ลองอีกนิด', 'ไม่เป็นไร ลองใหม่ได้!', 'หืม... คิดอีกทีนะ', 'ยังไม่ใช่ แต่ใกล้แล้ว!'];

  /* ══════════════════════════════════════════════
     สนาม 1 : อู่เติมพลัง — อ่านและเขียนทศนิยมจากปริมาณ
     ══════════════════════════════════════════════ */
  function tBuild(target, o) {
    o = o || {};
    let w = null;
    return {
      skill: o.skill || 'read',
      title: o.title || (o.word ? 'เติมพลังตามคำอ่าน' : 'เติมพลังให้ได้ ' + tok(target) + ' หน่วย'),
      say: o.say || (o.word ? 'อ่านใบสั่งให้ดี แล้วเติมพลังให้ตรงเป๊ะ!' : 'แตะปุ่มบวกเติมพลัง ให้ได้พอดีเลย!'),
      judSay: o.judSay,
      render(el, api) {
        const val = o.word ? '<span class="word">' + D.read(target) + '</span>' + sayBtn(D.read(target)) : D.html(target, { color: api.level < 2 || !!o.live });
        el.innerHTML = '<div class="row-center">' + ticket(o.word ? 'วิทยุทีมช่าง' : 'ใบสั่งเติมพลัง', val, o.unit || 'หน่วย') + '</div><div class="w-host"></div>' + goBtn(o.go || 'เติมพลัง!');
        wireSay(el);
        w = W.builder(el.querySelector('.w-host'), { live: !!o.live, keys: o.keys });
        if (o.guide) setTimeout(() => w.pulse(o.guide), 400);
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const v = w.get(), t = D.val(target);
          if (o.guide) w.pulse(o.guide, false);
          if (v === t) { w.lock(); api.correct(o.ok || ('เป๊ะ! ' + pieceWords(target) + ' ได้ ' + tok(target) + ' อ่านว่า ' + D.read(target)), go); }
          else if (v === 0) api.nudge('ยังไม่ได้เติมพลังเลย! แตะปุ่มบวกก่อนนะ', go);
          else api.wrong('ตอนนี้ได้ ' + tok(D.fromVal(v)) + ' ' + (v < t ? 'ยังน้อยไปนิด' : 'มากไปหน่อย'), go);
        });
      },
      hint(l) {
        return [
          'แผ่นเต็ม = 1 · แถว = 0.1 · ช่อง = 0.01 · ชิ้นจิ๋ว = 0.001',
          'ดูทีละหลักนะ ' + placeList(target),
          'ต้องเติม ' + pieceWords(target)
        ][l - 1];
      },
      answer: tok(target) + ' คือ ' + pieceWords(target),
      solve() { w.set(target); }
    };
  }

  function tWrite(target, o) {
    o = o || {};
    let kp = null;
    return {
      skill: 'read',
      title: o.title || 'พลังในถังนี้เท่าไร? เขียนเป็นทศนิยม',
      say: o.say || 'นับแผ่น แถว ช่อง และชิ้นจิ๋ว แล้วกดตัวเลขให้ถูก!',
      render(el, api) {
        el.innerHTML = '<div class="split"><div class="tank"><div class="tank-tag">' + art.icon('fuel') + 'ถังพลัง</div>' +
          art.qty(D.val(target), { zoom: D.places(target) >= 3 ? true : undefined }) + '</div><div class="w-host"></div></div>' + goBtn('ตรวจคำตอบ');
        const go = el.querySelector('.act-go');
        kp = W.keypad(el.querySelector('.w-host'), { onEnter: () => go.click() });
        go.addEventListener('click', () => {
          const s = kp.get();
          if (!s) return api.nudge('ยังไม่ได้กดตัวเลขเลย', go);
          if (D.val(s) === D.val(target)) { kp.lock(); api.correct('ถูกต้อง! ' + pieceWords(target) + ' คือ ' + tok(target) + ' อ่านว่า ' + D.read(target), go); }
          else if (s.indexOf('.') < 0 && D.places(target) > 0) api.wrong('อย่าลืมจุดทศนิยมนะ!', go);
          else api.wrong(diag(s, target) || 'ตอนนี้กด ' + tok(s) + ' ลองนับใหม่อีกทีนะ', go);
        });
      },
      hint(l) {
        return [
          'แผ่นสีแดงเต็มแผ่น มีกี่แผ่น = ตัวเลขหน้าจุด',
          'แถวสีส้ม = ส่วนสิบ · ช่องสีเขียว = ส่วนร้อย · ชิ้นจิ๋วสีม่วงในแว่นขยาย = ส่วนพัน',
          'นับได้ ' + pieceWords(target) + ' เรียงเป็นตัวเลขดูนะ'
        ][l - 1];
      },
      answer: pieceWords(target) + ' เขียนว่า ' + tok(target),
      solve() { kp.set(target); }
    };
  }

  function readOptions(target) {
    const ok = D.read(target);
    const p = D.parts(target);
    const c = [D.misread(target), D.dropZeroRead(target)];
    if (p.f.length >= 2) c.push(D.read(p.i + '.' + p.f.split('').reverse().join('')));
    if (p.f.length >= 1) {
      const ni = String(+p.i) + p.f[0], nf = p.f.slice(1);
      c.push(D.read(nf ? (+ni) + '.' + nf : ni));
    }
    c.push(D.read((+p.i + 1) + '.' + p.f));
    if (p.f.length < 3) c.push(D.read(p.i + '.0' + p.f));
    const list = uniq([ok].concat(c.filter(x => x && x !== ok))).slice(0, 4);
    return shuffle(list);
  }
  function tWord(target, o) {
    o = o || {};
    let ch = null;
    const ok = D.read(target);
    return {
      skill: 'read',
      title: o.title || 'ป้ายนี้อ่านว่าอะไร?',
      say: o.say || 'ผู้บรรยายต้องอ่านป้ายให้ถูก! ช่วยเลือกคำอ่านหน่อย!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('ป้ายสนาม', D.html(target, { cls: 'xl' }), '') + '</div><div class="w-host"></div>';
        const opts = o.options || readOptions(target);
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-words',
          options: opts.map(t => ({ html: t, value: t })),
          onPick(v, b) {
            if (v === ok) { b.classList.add('good'); ch.lock(); api.correct('ถูกต้อง! อ่านว่า ' + ok + ' หลังจุดอ่านทีละตัว', b); }
            else {
              ch.dim(b);
              const mis = v === D.misread(target);
              api.wrong(mis ? 'ตัวเลขหลังจุด ไม่อ่านแบบจำนวนนับนะ ต้องอ่านทีละตัว' : v === D.dropZeroRead(target) ? 'เลข 0 หลังจุดก็ต้องอ่านด้วยนะ' : '', b);
            }
          }
        });
      },
      hint(l) {
        return [
          'หน้าจุดอ่านเหมือนจำนวนนับ แล้วอ่านคำว่า จุด',
          'หลังจุดอ่านทีละตัว เช่น 0.25 อ่านว่า ศูนย์จุดสองห้า',
          'หลังจุดของป้ายนี้มี ' + D.parts(target).f.split('').join(' ') + ' อ่านทีละตัวนะ'
        ][l - 1];
      },
      answer: tok(target) + ' อ่านว่า ' + ok,
      solve() { ch.mark(ok, 'good'); }
    };
  }

  function tListen(target, o) {
    o = o || {};
    let kp = null;
    const word = D.read(target);
    return {
      skill: 'read',
      title: o.title || 'เขียนตัวเลขจากคำอ่าน',
      say: o.say || ('วิทยุจากทีมช่าง! ' + word + ' กดตัวเลขให้ถูกนะ!'),
      render(el, api) {
        el.innerHTML = '<div class="split"><div class="radio"><div class="radio-top">' + art.icon('mic') + '<small>วิทยุจากทีมช่าง</small></div>' +
          '<b class="word big">' + word + '</b>' + sayBtn(word) + '</div><div class="w-host"></div></div>' + goBtn(o.go || 'ส่งรหัส');
        wireSay(el);
        const go = el.querySelector('.act-go');
        kp = W.keypad(el.querySelector('.w-host'), { onEnter: () => go.click() });
        go.addEventListener('click', () => {
          const s = kp.get();
          if (!s) return api.nudge('ยังไม่ได้กดตัวเลขเลย', go);
          if (D.val(s) === D.val(target)) { kp.lock(); api.correct('ใช่เลย! ' + word + ' เขียนว่า ' + tok(target), go); }
          else if (s.indexOf('.') < 0) api.wrong('ได้ยินคำว่า จุด ไหม? ต้องมีจุดทศนิยมนะ', go);
          else api.wrong(diag(s, target), go);
        });
      },
      hint(l) {
        return [
          'คำที่อยู่หน้าคำว่า จุด คือจำนวนเต็ม',
          'หลังคำว่า จุด แต่ละคำคือเลขหนึ่งหลัก ได้ยินศูนย์ก็ต้องกด 0',
          'เขียนทีละหลัก ' + placeList(target)
        ][l - 1];
      },
      answer: word + ' เขียนว่า ' + tok(target),
      solve() { kp.set(target); }
    };
  }

  function tLine(target, from, step, o) {
    o = o || {};
    let w = null;
    const to = D.fromVal(D.val(from) + 10 * D.val(step));
    return {
      skill: 'read',
      title: o.title || 'ดอตตี้กระโดดได้ ' + tok(target) + ' เมตร พาไปจอดให้ตรงจุด!',
      say: o.say || 'ลากรถดอตตี้ไปจอดบนขีดที่ถูกต้อง แล้วกดจอด!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>' + goBtn('จอดตรงนี้!');
        w = W.numline(el.querySelector('.w-host'), { from, to, step, labelMid: api.level === 1, unit: 'เมตร' });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = w.get();
          if (g == null) return api.nudge('แตะหรือลากบนถนนเพื่อย้ายรถก่อนนะ', go);
          const c = D.cmp(g, target);
          if (c === 0) { w.lock(); api.correct('จอดเป๊ะ! ตรงนี้คือ ' + tok(target) + ' เมตร', go); }
          else api.wrong('ตอนนี้จอดที่ ' + tok(g) + ' ' + (c < 0 ? 'ยังไปไม่ถึง' : 'เลยไปนิด'), go);
        });
      },
      hint(l) {
        if (l === 3 && w) w.flashTick(target);
        return [
          'ช่องเล็กแต่ละช่องห่างกัน ' + tok(step),
          'เริ่มจาก ' + tok(from) + ' นับไปทีละ ' + tok(step) + ' ต้องนับ ' + (w ? w.steps(target) : '') + ' ช่อง',
          'ดูขีดที่กะพริบนะ!'
        ][l - 1];
      },
      answer: 'นับจาก ' + tok(from) + ' ไปทีละ ' + tok(step) + ' จะถึง ' + tok(target),
      solve() { w.set(target); }
    };
  }

  /* ══════════════════════════════════════════════
     สนาม 2 : หอเกียร์ — หลัก ค่าประจำหลัก ค่าของเลขโดด รูปกระจาย
     ══════════════════════════════════════════════ */
  function keysOf(num) { return D.digits(num).map(x => x.k); }
  function clueText(x, style) {
    const P = PL[x.k];
    if (style === 'value' && x.d !== '0') return 'เลข ' + x.d + ' มีค่า ' + tok(D.digitValue(x.d, x.k));
    if (style === 'pv') return 'หลักที่มีค่าประจำหลัก ' + tok(P.value) + ' คือเลข ' + x.d;
    return P.name + 'เป็นเลข ' + x.d;
  }
  function tSlots(num, o) {
    o = o || {};
    let w = null;
    const ds = D.digits(num);
    const keys = keysOf(num);
    return {
      skill: 'place',
      title: o.title || (o.clue ? 'ประกอบรหัสเกียร์จากคำใบ้' : 'ใส่ตัวเลขลงช่องเกียร์ให้ตรงหลัก'),
      say: o.say || (o.clue ? 'อ่านคำใบ้ทีละข้อ แล้ววางตัวเลขให้ตรงหลัก!' : 'แตะตัวเลข แล้วแตะช่องเกียร์ หรือจะลากไปวางก็ได้!'),
      judSay: o.judSay,
      render(el, api) {
        let chips = ds.map(x => x.d);
        if (o.extra) {
          const pool = '0123456789'.split('').filter(d => chips.indexOf(d) < 0);
          chips = chips.concat(shuffle(pool).slice(0, o.extra));
        }
        chips = shuffle(chips);
        let top;
        if (o.clue) {
          const styles = o.styles || ['name'];
          const clues = shuffle(ds.map(x => clueText(x, pick(styles))));
          top = '<ul class="clues">' + clues.map((c, i) => '<li><span class="cl-n">' + (i + 1) + '</span>' + ui.rich(c) + '</li>').join('') + '</ul>';
        } else {
          top = '<div class="row-center">' + ticket('จอเกียร์', D.html(num, { cls: 'xl' }), '') + '</div>';
        }
        el.innerHTML = '<div class="' + (o.clue ? 'clue-split' : 'stack') + '">' + top + '<div class="w-host"></div></div>' + goBtn('เข้าเกียร์!');
        w = W.slots(el.querySelector('.w-host'), { keys, chips, hideVal: !!o.hideVal });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          if (!w.full()) return api.nudge('ใส่ตัวเลขให้ครบทุกช่องก่อนนะ', go);
          const g = w.get();
          const bad = ds.filter(x => g[x.k] !== x.d);
          if (!bad.length) { w.lock(); api.correct('เข้าเกียร์! ได้ ' + ctok(num) + ' อ่านว่า ' + D.read(num), go); }
          else {
            bad.forEach(x => w.mark(x.k, 'bad'));
            api.wrong('ช่อง' + bad.map(x => PL[x.k].short).join(' ') + ' ยังไม่ตรงนะ', go);
          }
        });
      },
      hint(l) {
        return [
          'หลักหน่วยอยู่หน้าจุด · หลังจุดเรียงเป็น ส่วนสิบ ส่วนร้อย ส่วนพัน',
          o.clue ? 'ค่า 0.1 อยู่หลักส่วนสิบ · 0.01 หลักส่วนร้อย · 0.001 หลักส่วนพัน' : 'ดูตัวเลขบนจอ แล้ววางเรียงจากซ้ายไปขวา',
          'คำตอบคือ ' + placeList(num)
        ][l - 1];
      },
      answer: ctok(num) + ' คือ ' + placeList(num),
      solve() { const m = {}; ds.forEach(x => { m[x.k] = x.d; }); w.solve(m); }
    };
  }

  function tPick(num, k, mode) {
    let w = null;
    const d = D.digitAt(num, k), v = D.digitValue(d, k);
    return {
      skill: 'place',
      title: mode === 'value' ? 'แตะเลขโดดที่มีค่า ' + tok(v) : 'แตะเลขโดดที่อยู่' + PL[k].name,
      say: mode === 'value' ? 'เลขตัวไหนมีค่าเท่านี้? แตะเลย!' : 'เลขตัวไหนอยู่' + PL[k].name + '? แตะเลย!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div><div class="legend"></div>';
        w = W.pickDigit(el.querySelector('.w-host'), {
          num,
          onPick(kk, b) {
            if (kk === k) { b.classList.add('good'); w.lock(); w.colorAll(); api.correct('ใช่เลย! ' + d + ' อยู่' + PL[k].name + ' มีค่า ' + tok(v), b); }
            else {
              const dd = D.digitAt(num, kk);
              api.wrong('ตัวนั้นคือ ' + dd + ' อยู่' + PL[kk].name + ' มีค่า ' + tok(D.digitValue(dd, kk)), b);
            }
          }
        });
      },
      hint(l) {
        if (l === 3 && w) {
          w.colorAll();
          const lg = document.querySelector('#work .legend');
          if (lg) lg.innerHTML = D.digits(num).map(x => '<span class="lg k-' + x.k + '">' + PL[x.k].short + '</span>').join('');
        }
        return [
          'นับจากจุดไปทางขวา: ตัวที่ 1 ส่วนสิบ · ตัวที่ 2 ส่วนร้อย · ตัวที่ 3 ส่วนพัน',
          'ค่าประจำหลัก: ส่วนสิบ {0.1} · ส่วนร้อย {0.01} · ส่วนพัน {0.001}',
          'ระบายสีตามหลักให้แล้ว ดูป้ายสีด้านล่างนะ'
        ][l - 1];
      },
      answer: 'เลข ' + d + ' ใน ' + tok(num) + ' อยู่' + PL[k].name + ' มีค่า ' + tok(v),
      solve() { w.mark(k, 'good'); w.colorAll(); }
    };
  }

  function tValue(num, k) {
    let ch = null;
    const d = D.digitAt(num, k), v = D.digitValue(d, k);
    const opts = shuffle(uniq(['one', 't1', 't2', 't3', 'ten'].map(kk => D.digitValue(d, kk))).filter(x => x !== v).slice(0, 3).concat([v]));
    return {
      skill: 'place',
      title: 'ใน ' + tok(num) + ' เลข ' + d + ' มีค่าเท่าไร?',
      say: 'เลขตัวนี้มีค่าเท่าไร? ดูให้ดีว่าอยู่หลักไหน!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('จอเกียร์', D.html(num, { cls: 'xl', mark: [k] }), '') + '</div><div class="w-host"></div>';
        ch = W.choice(el.querySelector('.w-host'), {
          options: opts.map(x => ({ html: D.html(x), value: x })),
          onPick(x, b) {
            if (x === v) { b.classList.add('good'); ch.lock(); api.correct(d + ' อยู่' + PL[k].name + ' จึงมีค่า ' + tok(v) + ' ถูกต้อง!', b); }
            else { ch.dim(b); api.wrong(tok(x) + ' คือค่าของ ' + d + ' ตอนอยู่หลักอื่นนะ', b); }
          }
        });
      },
      hint(l) {
        return [
          'ตัวที่ขีดเส้นใต้ อยู่หลักไหน? นับจากจุดทศนิยม',
          d + ' อยู่' + PL[k].name + ' ค่าประจำหลักคือ ' + tok(PL[k].value),
          d + ' ' + PL[k].short + ' เขียนเป็นทศนิยมได้ ' + tok(v)
        ][l - 1];
      },
      answer: d + ' อยู่' + PL[k].name + ' มีค่า ' + tok(v),
      solve() { ch.mark(v, 'good'); }
    };
  }

  function tPV(k) {
    let ch = null;
    const v = PL[k].value;
    return {
      skill: 'place',
      title: 'ค่าประจำหลักของ' + PL[k].name + 'คือเท่าไร?',
      say: 'ตอบให้ไว! หลักนี้มีค่าประจำหลักเท่าไร?',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('หลักลับ', '<span class="word">' + PL[k].name + '</span>', '') + '</div><div class="w-host"></div>';
        ch = W.choice(el.querySelector('.w-host'), {
          options: shuffle(['1', '0.1', '0.01', '0.001']).map(x => ({ html: D.html(x), value: x })),
          onPick(x, b) {
            if (x === v) { b.classList.add('good'); ch.lock(); api.correct(PL[k].name + ' มีค่าประจำหลัก ' + tok(v) + ' เป๊ะ!', b); }
            else { ch.dim(b); api.wrong('', b); }
          }
        });
      },
      hint(l) {
        return ['หลักหน่วย = 1 แล้วไปทางขวาทีละหลัก ค่าจะเล็กลง 10 เท่า', 'ส่วนสิบ {0.1} · ส่วนร้อย {0.01} · ส่วนพัน {0.001}', PL[k].name + ' = ' + tok(v)][l - 1];
      },
      answer: PL[k].name + ' มีค่าประจำหลัก ' + tok(v),
      solve() { ch.mark(v, 'good'); }
    };
  }

  function expandChips(num, extra) {
    const parts = D.expanded(num);
    const wrong = [];
    D.digits(num).filter(x => x.d !== '0').forEach(x => {
      const i = D.ORDER.indexOf(x.k);
      [D.ORDER[i - 1], D.ORDER[i + 1]].forEach(kk => { if (kk && kk !== 'hun') wrong.push(D.digitValue(x.d, kk)); });
    });
    const pool = shuffle(uniq(wrong).filter(w => parts.indexOf(w) < 0 && w !== '0'));
    return shuffle(parts.concat(pool.slice(0, extra)));
  }
  function tExpand(num, o) {
    o = o || {};
    let w = null;
    const parts = D.expanded(num);
    return {
      skill: 'expand',
      title: o.title || 'แยกพลังของ ' + tok(num) + ' เป็นรูปกระจาย',
      say: o.say || 'เลือกค่าของเลขโดดแต่ละตัว มาเติมให้ครบทุกช่อง!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>' + goBtn('ตรวจคำตอบ');
        w = W.expand(el.querySelector('.w-host'), { num, count: parts.length, chips: expandChips(num, o.extra == null ? 3 : o.extra), color: api.level < 3 });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = w.get();
          if (g.indexOf(null) >= 0) return api.nudge('เติมให้ครบทุกช่องก่อนนะ', go);
          const bad = g.filter(x => parts.indexOf(x) < 0);
          if (!bad.length && uniq(g).length === parts.length) {
            w.lock();
            api.correct(tok(num) + ' = ' + parts.map(tok).join(' + ') + ' เยี่ยมมาก!', go);
          } else api.wrong(bad.length ? tok(bad[0]) + ' ไม่ใช่ค่าของเลขโดดใน ' + tok(num) + ' นะ' : 'มีค่าซ้ำกันอยู่ ลองดูใหม่นะ', go);
        });
      },
      hint(l) {
        const x = D.digits(num).filter(y => FRAC.indexOf(y.k) >= 0 && y.d !== '0')[0];
        return [
          'แยกเลขโดดทีละตัว แล้วเขียนค่าของแต่ละตัว (หลักที่เป็น 0 ไม่ต้องเขียน)',
          x ? 'เช่น เลข ' + x.d + ' อยู่' + PL[x.k].name + ' มีค่า ' + tok(D.digitValue(x.d, x.k)) : 'ดูทีละหลักจากซ้ายไปขวา',
          'ค่าที่ต้องใช้คือ ' + parts.map(tok).join(' , ')
        ][l - 1];
      },
      answer: tok(num) + ' = ' + parts.map(tok).join(' + '),
      solve() { w.solve(parts); }
    };
  }

  function tUnexpand(num, o) {
    o = o || {};
    let kp = null;
    const parts = o.shuffled ? shuffle(D.expanded(num)) : D.expanded(num);
    return {
      skill: 'expand',
      title: o.title || 'รวมพลังจากรูปกระจาย เขียนเป็นทศนิยม',
      say: o.say || 'รวมค่าทุกตัวเข้าด้วยกัน แล้วกดตัวเลขเลย!',
      render(el, api) {
        el.innerHTML = '<div class="split"><div class="code-card"><small>' + (o.label || 'รหัสพลัง') + '</small><div class="code-eq">' +
          parts.map(p => D.html(p)).join('<b>+</b>') + '</div></div><div class="w-host"></div></div>' + goBtn(o.go || 'ตรวจคำตอบ');
        const go = el.querySelector('.act-go');
        kp = W.keypad(el.querySelector('.w-host'), { onEnter: () => go.click() });
        go.addEventListener('click', () => {
          const s = kp.get();
          if (!s) return api.nudge('ยังไม่ได้กดตัวเลขเลย', go);
          if (D.val(s) === D.val(num)) { kp.lock(); api.correct(parts.map(tok).join(' + ') + ' = ' + ctok(num) + ' ถูกต้อง!', go); }
          else api.wrong(diag(s, num) || 'ยังไม่ใช่ จัดค่าแต่ละตัวลงหลักของมันก่อนนะ', go);
        });
      },
      hint(l) {
        return [
          'ดูว่าแต่ละค่าอยู่หลักไหน แล้วเรียงจากหลักใหญ่ไปหลักเล็ก',
          'หลักไหนไม่มีค่า ให้เขียน 0 เก็บหลักไว้',
          'ได้ ' + placeList(num)
        ][l - 1];
      },
      answer: parts.map(tok).join(' + ') + ' = ' + tok(num),
      solve() { kp.set(num); }
    };
  }

  /* ══════════════════════════════════════════════
     สนาม 3 : อุโมงค์กระจกแฝด — ทศนิยมที่เท่ากัน
     ══════════════════════════════════════════════ */
  function tZero(start, want, o) {
    o = o || {};
    let w = null;
    const goal = D.fromVal(D.val(start), want);
    return {
      skill: 'equal',
      title: 'ทำ ' + tok(start) + ' ให้เป็นทศนิยม ' + want + ' ตำแหน่ง ที่ค่าเท่าเดิม',
      say: o.say || 'แตะปุ่มบวกศูนย์เพื่อเติม 0 ลองดูว่าเติมตรงไหน ค่ายังเท่าเดิม!',
      judSay: o.judSay,
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>' + goBtn('ส่องกระจก!');
        w = W.zeroIns(el.querySelector('.w-host'), { start, compare: true });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const cur = w.get();
          const same = D.val(cur) === D.val(start);
          if (cur === start) return api.nudge('ยังไม่ได้เติม 0 เลย แตะปุ่มบวกศูนย์ดูนะ', go);
          if (same && D.places(cur) === want) { w.lock(); api.correct('เยี่ยม! ' + tok(start) + ' = ' + tok(cur) + ' เติม 0 ท้ายทศนิยม ค่าไม่เปลี่ยน', go); }
          else if (!same) api.wrong('ค่าเปลี่ยนไปแล้ว! ดูแผ่นพลังสิ ไม่เท่ากัน กดย้อนกลับแล้วลองตำแหน่งอื่นนะ', go);
          else api.wrong('ค่ายังเท่าเดิมดีมาก แต่ต้องมีทศนิยม ' + want + ' ตำแหน่งนะ', go);
        });
      },
      hint(l) {
        return [
          'เติม 0 แล้วดูแผ่นพลังสองแผ่นด้านล่าง ว่ายังเท่ากันไหม',
          'เติม 0 ตรงไหนแล้วค่าไม่เปลี่ยน? ลองที่ท้ายสุด',
          'ต้องได้ ' + tok(goal)
        ][l - 1];
      },
      answer: tok(start) + ' = ' + tok(goal) + ' เพราะเติม 0 ท้ายทศนิยม',
      solve() { w.set(goal); }
    };
  }

  function equalCards(t) {
    const v = D.val(t), sh = D.shortest(t), p0 = D.places(sh);
    let eq = [];
    for (let p = p0; p <= 3; p++) eq.push(D.fromVal(v, p));
    if (p0 === 0) eq = eq.map(x => x.indexOf('.') < 0 ? x : x);
    eq = eq.filter(x => x !== t);
    const ne = [];
    const P = D.parts(sh), I = String(+P.i);
    if (P.f) {
      if (P.f.length < 3) ne.push(I + '.0' + P.f);
      const shifted = (+(I + P.f[0])) + '.' + (P.f.slice(1) || '0');
      ne.push(shifted);
      if (P.f.length < 3) ne.push(I + '.' + P.f + P.f.slice(-1));
      if (P.f.length === 2) ne.push(I + '.' + P.f[0] + '0' + P.f[1]);
      if (P.f.length === 1 && +I > 0) ne.push('0.' + I + P.f);
      if (P.f.length < 3) ne.push(I + '.' + P.f + '1');
    } else {
      ne.push('0.' + I, I + '.01', I + '0', '0.0' + I);
    }
    const neOk = uniq(ne.filter(x => D.places(x) <= 3 && D.val(x) !== v));
    const eqPick = shuffle(eq).slice(0, Math.min(eq.length, R(2, 3)));
    const nePick = shuffle(neOk).slice(0, 5 - eqPick.length);
    return { cards: shuffle(eqPick.concat(nePick)), eq: eqPick };
  }
  function tPickEq(target, o) {
    o = o || {};
    let w = null;
    const set = equalCards(target);
    return {
      skill: 'equal',
      title: o.title || 'เลือกทุกป้ายที่มีค่าเท่ากับ ' + tok(target),
      say: o.say || 'ประตูกระจกจะเปิด เมื่อเลือกป้ายที่เท่ากันครบทุกป้าย!',
      judSay: o.judSay,
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket(o.label || 'ป้ายต้นแบบ', D.html(target, { cls: 'xl' }), o.unit || '') + '</div><div class="w-host"></div><div class="proof"></div>' + goBtn('เปิดประตู!');
        w = W.pickMany(el.querySelector('.w-host'), { cards: set.cards.map(c => ({ html: D.html(c), value: c })) });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = w.get();
          if (!g.length) return api.nudge('แตะเลือกป้ายก่อนนะ เลือกได้หลายป้าย', go);
          const extra = g.filter(x => set.eq.indexOf(x) < 0), miss = set.eq.filter(x => g.indexOf(x) < 0);
          if (!extra.length && !miss.length) {
            w.lock();
            el.querySelector('.proof').innerHTML = W.gridPair(target, set.eq[0]);
            api.correct([target].concat(set.eq).map(tok).join(' = ') + ' เติมหรือตัด 0 ท้ายทศนิยม ค่ายังเท่าเดิม!', go);
          } else {
            w.mark((v, on) => on && set.eq.indexOf(v) < 0 ? 'bad' : null);
            if (extra.length) el.querySelector('.proof').innerHTML = W.gridPair(target, extra[0], { ne: true });
            api.wrong(extra.length ? tok(extra[0]) + ' ไม่เท่ากับ ' + tok(target) + ' ดูแผ่นพลังสิ' : 'ยังมีป้ายที่เท่ากันซ่อนอยู่อีกนะ', go);
          }
        });
      },
      hint(l) {
        return [
          'ลองตัด 0 ที่อยู่ท้ายสุดของแต่ละป้ายออก แล้วดูว่าเหมือน ' + tok(D.shortest(target)) + ' ไหม',
          '0 ที่แทรกอยู่ระหว่างจุดกับตัวเลข ทำให้ค่าเปลี่ยนนะ',
          'ป้ายที่เท่ากันคือ ' + set.eq.map(tok).join(' และ ')
        ][l - 1];
      },
      answer: tok(target) + ' = ' + set.eq.map(tok).join(' = '),
      solve() { w.set(set.eq); }
    };
  }

  function gatePair(level) {
    const eq = Math.random() < 0.5;
    let a;
    if (level === 1) a = D.randDec(1, 0, 0);
    else if (level === 2) a = D.randDec(R(1, 2), 1, 9);
    else a = pick([String(R(2, 9)), D.randDec(2, 1, 20, { zeroMid: Math.random() < 0.5 })]);
    const P = D.parts(a), I = String(+P.i);
    let b;
    if (eq) b = D.fromVal(D.val(a), Math.min(3, D.places(a) + R(1, 3 - D.places(a) > 1 ? 2 : 1)));
    else if (!P.f) b = I + '.0' + R(1, 9);
    else b = P.f.length < 3 ? I + '.0' + P.f : I + '.' + P.f.split('').reverse().join('');
    if (D.val(a) === D.val(b) && !eq) b = I + '.' + (P.f || '') + '1';
    return Math.random() < 0.5 ? [a, b] : [b, a];
  }
  function tGate(a, b, o) {
    o = o || {};
    let ch = null;
    const same = D.val(a) === D.val(b);
    const k = W.firstDiff(a, b);
    const why = same ? 'ตัด 0 ท้ายทศนิยมแล้วเหมือนกันเป๊ะ'
      : PL[k].name + ' ' + (D.digitAt(a, k) || '0') + ' กับ ' + (D.digitAt(b, k) || '0') + ' ไม่เท่ากัน';
    return {
      skill: 'equal',
      title: o.title || 'ประตูกระจก: ' + tok(a) + ' กับ ' + tok(b) + ' เท่ากันไหม?',
      say: o.say || 'สองฝั่งกระจกมีค่าเท่ากันไหม? ตัดสินเลย!',
      judSay: o.judSay,
      render(el, api) {
        el.innerHTML = '<div class="mirror"><div class="mr-side">' + D.html(a, { cls: 'xl' }) + '</div><div class="mr-glass"></div><div class="mr-side">' + D.html(b, { cls: 'xl' }) + '</div></div>' +
          '<div class="w-host"></div><div class="proof"></div>';
        const opts = o.judClaim
          ? [{ html: 'จุดซนพูดถูก', value: o.judClaim === 'eq' ? 'eq' : 'ne' }, { html: 'จุดซนพูดผิด', value: o.judClaim === 'eq' ? 'ne' : 'eq' }]
          : [{ html: 'เท่ากัน', value: 'eq' }, { html: 'ไม่เท่ากัน', value: 'ne' }];
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-2',
          options: opts,
          onPick(v, btn) {
            const right = (v === 'eq') === same;
            el.querySelector('.proof').innerHTML = W.gridPair(a, b, { ne: true });
            if (right) { btn.classList.add('good'); ch.lock(); api.correct((same ? 'เท่ากัน! ' : 'ไม่เท่ากัน! ') + why, btn); }
            else { ch.dim(btn); api.wrong('ดูแผ่นพลังสองแผ่นนี้สิ', btn); }
          }
        });
      },
      hint(l) {
        return [
          'ลองตัด 0 ท้ายทศนิยมของทั้งสองตัวออกก่อน',
          'เติม 0 ท้ายให้มีทศนิยมเท่ากัน แล้วเทียบทีละหลัก',
          same ? 'สองตัวนี้เท่ากัน' : 'สองตัวนี้ไม่เท่ากัน เพราะ' + why
        ][l - 1];
      },
      answer: same ? tok(a) + ' = ' + tok(b) : tok(a) + ' ไม่เท่ากับ ' + tok(b),
      solve() { ch.mark(same ? 'eq' : 'ne', 'good'); }
    };
  }

  function tShort(s) {
    let kp = null;
    const sh = D.shortest(s);
    return {
      skill: 'equal',
      title: 'เขียน ' + tok(s) + ' ให้สั้นที่สุด โดยค่าเท่าเดิม',
      say: 'ตัด 0 ที่ไม่จำเป็นออก ให้ป้ายสั้นที่สุด!',
      render(el, api) {
        el.innerHTML = '<div class="split"><div class="code-card"><small>ป้ายยาวเกินไป</small><div class="code-eq">' + D.html(s, { cls: 'xl' }) + '</div></div><div class="w-host"></div></div>' + goBtn('ตรวจคำตอบ');
        const go = el.querySelector('.act-go');
        kp = W.keypad(el.querySelector('.w-host'), { onEnter: () => go.click() });
        go.addEventListener('click', () => {
          const g = kp.get();
          if (!g) return api.nudge('ยังไม่ได้กดตัวเลขเลย', go);
          if (g === sh) { kp.lock(); api.correct(tok(s) + ' = ' + tok(sh) + ' ตัด 0 ท้ายทศนิยมได้ ค่าเท่าเดิม!', go); }
          else if (D.val(g) === D.val(s)) api.wrong('ค่าเท่ากันแล้ว! แต่ยังตัด 0 ท้ายออกได้อีกนะ', go);
          else api.wrong('ค่าเปลี่ยนไปแล้ว ตัดได้เฉพาะ 0 ที่อยู่ท้ายสุดนะ', go);
        });
      },
      hint(l) {
        return ['0 ที่อยู่ท้ายสุดหลังจุด ตัดออกได้ ค่าไม่เปลี่ยน', '0 ที่อยู่ระหว่างตัวเลข ห้ามตัดนะ', 'คำตอบคือ ' + tok(sh)][l - 1];
      },
      answer: tok(s) + ' = ' + tok(sh),
      solve() { kp.set(sh); }
    };
  }

  /* ══════════════════════════════════════════════
     สนาม 4 : ทางตรงประลองระยะ — เปรียบเทียบและเรียงลำดับ
     ══════════════════════════════════════════════ */
  function cmpReason(a, b) {
    const k = W.firstDiff(a, b);
    if (!k) return 'เติม 0 ท้ายแล้วเหมือนกันทุกหลัก จึงเท่ากัน';
    const x = D.digitAt(a, k) || '0', y = D.digitAt(b, k) || '0';
    return 'หลักแรกที่ต่างกันคือ' + PL[k].name + ' ' + x + ' ' + (+x > +y ? 'มากกว่า' : 'น้อยกว่า') + ' ' + y;
  }
  function comparePair(level) {
    const t = R(1, 4);
    const two = () => { const a = R(1, 9); let b; do { b = R(1, 9); } while (b === a); return [a, b]; };
    if (level === 1) {
      const i = R(0, 5);
      if (t <= 2) { const x = R(3, 9), y = R(1, x - 1); return shuffle([i + '.' + x, i + '.' + y + R(1, 9)]); }
      const [x, y] = two();
      return [i + '.' + x, i + '.' + y];
    }
    if (level === 2) {
      const i = R(1, 9), [a, b] = two();
      if (t === 1) return shuffle([i + '.0' + a, i + '.' + a]);
      if (t === 2) { const s = i + '.' + a + b; return shuffle([s, s + '0']); }
      if (t === 3) return shuffle([i + '.' + a + '0' + R(1, 9), i + '.' + a + R(1, 9)]);
      return shuffle([i + '.' + a + b, i + '.' + b + a]);
    }
    if (t === 1) { const i = R(2, 9); return shuffle([(i - 1) + '.99', i + '.1']); }
    if (t === 2) { const i = R(10, 30), a = R(1, 9), b = R(1, 9); return shuffle([i + '.' + a + b, i + '.' + a + '0' + b]); }
    if (t === 3) { const s = D.randDec(2, 1, 20); return shuffle([s, s + '0']); }
    const i = R(0, 9), a = R(1, 8);
    return shuffle([i + '.' + a + '0' + R(1, 9), i + '.' + a + R(1, 9)]);
  }
  function tCompare(a, b, o) {
    o = o || {};
    let w = null;
    const c = D.cmp(a, b), right = D.sym(c);
    return {
      skill: 'compare',
      title: o.title || 'ใครพุ่งไกลกว่า? เลือกเครื่องหมาย',
      say: o.say || 'ซ้ายหรือขวาไกลกว่า? เลือกเครื่องหมายมากกว่า น้อยกว่า หรือเท่ากับ!',
      judSay: o.judSay,
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        w = W.versus(el.querySelector('.w-host'), {
          a, b, unit: o.unit || 'เมตร', nameA: o.nameA, nameB: o.nameB,
          onPick(s, btn) {
            if (s === right) {
              btn.classList.add('good'); w.lock(); w.proof();
              api.correct(tok(a) + ' ' + right + ' ' + tok(b) + '\n' + cmpReason(a, b), btn);
            } else {
              ui.shake(btn);
              const longer = D.places(a) !== D.places(b) && c !== 0 && ((D.places(a) > D.places(b)) === (s === '>'));
              api.wrong(longer ? 'ตัวเลขยาวกว่า ไม่ได้แปลว่ามากกว่านะ!' : '', btn);
            }
          }
        });
        if (o.showProof) setTimeout(() => w.proof(), 500);
      },
      hint(l) {
        if (l >= 2 && w) w.proof(l === 2);
        return [
          'ตั้งจุดทศนิยมให้ตรงกันก่อน แล้วเทียบจากหลักซ้ายสุด',
          'ดูตารางเทียบหลัก ช่องสีเขียวคือหลักที่เท่ากัน ไปต่อจนเจอหลักที่ต่างกัน',
          cmpReason(a, b)
        ][l - 1];
      },
      answer: tok(a) + ' ' + right + ' ' + tok(b) + ' เพราะ' + cmpReason(a, b),
      solve() { w.mark(right, 'good'); w.proof(false); }
    };
  }

  function orderSet(level, base) {
    const n = level === 1 ? 3 : level === 2 ? 4 : 5;
    for (let tries = 0; tries < 200; tries++) {
      const i = base != null ? base : R(0, 9), a = R(1, 9);
      let pool;
      if (level === 1) pool = [i + '.' + a, i + '.' + R(1, 9) + R(1, 9), i + '.' + R(1, 9), i + '.' + R(1, 9) + R(1, 9)];
      else if (level === 2) pool = [i + '.' + a, i + '.0' + a, i + '.' + a + '0' + R(1, 9), i + '.' + a + R(1, 9), i + '.' + R(1, 9) + R(0, 9) + R(1, 9)];
      else pool = [i + '.' + a, i + '.0' + a, (i + 1) + '.0' + R(1, 9), i + '.' + a + '0' + R(1, 9), i + '.' + R(1, 9) + R(1, 9) + R(1, 9), (i + 1) + '.' + R(1, 9)];
      pool = uniq(pool, D.val);
      if (pool.length >= n) return shuffle(shuffle(pool).slice(0, n));
    }
    return ['1.5', '1.25', '1.05'];
  }
  function tOrder(items, dir, o) {
    o = o || {};
    let w = null;
    const sorted = items.slice().sort((x, y) => dir === 'desc' ? D.cmp(y, x) : D.cmp(x, y));
    const maxP = Math.max.apply(null, items.map(D.places));
    const pad = s => D.fromVal(D.val(s), maxP);
    const labels = o.labels || items.map((x, i) => 'อันดับ ' + (i + 1));
    return {
      skill: 'order',
      title: o.title || (dir === 'desc' ? 'เรียงระยะพุ่งจาก มากไปน้อย' : 'เรียงจาก น้อยไปมาก'),
      say: o.say || (dir === 'desc' ? 'ใครไกลที่สุดได้อันดับ 1! เรียงจากมากไปน้อยเลย!' : 'เรียงจากน้อยไปมากเลย!'),
      judSay: o.judSay,
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>' + goBtn(o.go || 'ประกาศผล!');
        w = W.order(el.querySelector('.w-host'), {
          items, labels,
          leftLabel: o.leftLabel || (dir === 'desc' ? 'มากที่สุด' : 'น้อยที่สุด'),
          rightLabel: o.rightLabel || (dir === 'desc' ? 'น้อยที่สุด' : 'มากที่สุด'),
          cardHTML: o.cardHTML
        });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = w.get();
          if (g.indexOf(null) >= 0) return api.nudge('วางให้ครบทุกช่องก่อนนะ', go);
          const bad = [];
          g.forEach((x, i) => { if (D.val(x) !== D.val(sorted[i])) bad.push(i); });
          if (!bad.length) { w.lock(); api.correct(o.ok || (sorted.map(tok).join(dir === 'desc' ? ' > ' : ' < ') + ' เรียงถูกต้อง!'), go); }
          else { bad.forEach(i => w.mark(i, 'bad')); api.wrong('ช่องที่มีกรอบแดงยังไม่ถูกนะ', go); }
        });
      },
      hint(l) {
        return [
          'เทียบหลักหน่วยก่อน ถ้าเท่ากันค่อยดูหลักส่วนสิบ ส่วนร้อย ส่วนพัน',
          'เติม 0 ท้ายให้มีทศนิยมเท่ากันก่อน จะเทียบง่ายขึ้น: ' + items.map(x => tok(pad(x))).join(' '),
          (dir === 'desc' ? 'มากที่สุด' : 'น้อยที่สุด') + 'คือ ' + tok(sorted[0]) + ' ตามด้วย ' + tok(sorted[1])
        ][l - 1];
      },
      answer: sorted.map(tok).join(dir === 'desc' ? ' > ' : ' < '),
      solve() { w.solve(sorted); }
    };
  }

  const RIVAL_COLORS = ['#3ba8ff', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];
  function tExtreme(items, max, o) {
    o = o || {};
    let ch = null;
    const best = items.slice().sort((x, y) => max ? D.cmp(y, x) : D.cmp(x, y))[0];
    return {
      skill: 'compare',
      title: o.title || (max ? 'รถคันไหนพุ่งไกลที่สุด?' : 'รถคันไหนพุ่งได้ระยะน้อยที่สุด?'),
      say: o.say || 'ดูระยะของทุกคัน แล้วแตะคันที่ชนะ!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-cars',
          options: items.map((x, i) => ({ html: art.rival(RIVAL_COLORS[i % 5], i + 1) + '<span class="oc-num">' + D.html(x) + '</span><small>' + (o.unit || 'เมตร') + '</small>', value: x })),
          onPick(x, b) {
            if (x === best) { b.classList.add('good'); ch.lock(); api.correct(tok(best) + ' ' + (max ? 'มากที่สุด' : 'น้อยที่สุด') + ' คันนี้ชนะ!', b); }
            else { ch.dim(b); api.wrong(tok(x) + ' ยังไม่ใช่ ลองเทียบทีละหลักนะ', b); }
          }
        });
      },
      hint(l) {
        const maxP = Math.max.apply(null, items.map(D.places));
        return [
          'เทียบหลักหน่วยของทุกคันก่อน',
          'เติม 0 ให้ทศนิยมยาวเท่ากัน: ' + items.map(x => tok(D.fromVal(D.val(x), maxP))).join(' '),
          'คำตอบคือ ' + tok(best)
        ][l - 1];
      },
      answer: tok(best) + ' ' + (max ? 'มากที่สุด' : 'น้อยที่สุด'),
      solve() { ch.mark(best, 'good'); }
    };
  }

  /* ══════════════════════════════════════════════
     สนาม 5 : แกรนด์ปรีซ์ชิงแชมป์ — นำความรู้ไปใช้จริง
     ══════════════════════════════════════════════ */
  function tQualify(limit, level) {
    let w = null;
    const lv = D.val(limit);
    const offs = level === 1 ? [-100, 100, -10, 50, -400] : level === 2 ? [-10, 10, -200, 5, -5] : [-1, 5, -310, 100, -10];
    let cards = offs.map(d => D.fromVal(lv + d)).filter(x => D.val(x) > 0);
    cards.push(D.fromVal(lv, Math.min(3, D.places(limit) + 1)));
    cards = shuffle(uniq(cards, D.val));
    const pass = cards.filter(x => D.val(x) < lv);
    return {
      skill: 'compare',
      title: 'ผ่านเข้ารอบต้องใช้เวลา น้อยกว่า ' + tok(limit) + ' นาที เลือกทุกคันที่ผ่าน!',
      say: 'ใช้เวลาน้อยกว่าเกณฑ์ถึงจะผ่าน! เท่ากับเกณฑ์ยังไม่ผ่านนะ!',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket('เกณฑ์ผ่านเข้ารอบ', '<span class="lt">&lt;</span>' + D.html(limit, { cls: 'xl' }), 'นาที') + '</div><div class="w-host"></div>' + goBtn('ส่งรายชื่อ!');
        w = W.pickMany(el.querySelector('.w-host'), { cls: 'pm-cars', cards: cards.map((x, i) => ({ html: art.carMini(RIVAL_COLORS[i % 5]) + D.html(x), value: x })) });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const g = w.get();
          if (!g.length) return api.nudge('แตะเลือกรถที่ผ่านก่อนนะ', go);
          const extra = g.filter(x => pass.indexOf(x) < 0), miss = pass.filter(x => g.indexOf(x) < 0);
          if (!extra.length && !miss.length) { w.lock(); api.correct('ผ่านเข้ารอบ: ' + pass.map(tok).join(' ') + ' ทุกคันน้อยกว่า ' + tok(limit) + '!', go); }
          else {
            w.mark((v, on) => on && pass.indexOf(v) < 0 ? 'bad' : null);
            const eqc = extra.find(x => D.val(x) === lv);
            api.wrong(eqc ? tok(eqc) + ' เท่ากับเกณฑ์พอดี ยังไม่น้อยกว่านะ' : extra.length ? tok(extra[0]) + ' ไม่น้อยกว่า ' + tok(limit) : 'ยังมีรถที่ผ่านอีกคันนะ', go);
          }
        });
      },
      hint(l) {
        const maxP = Math.max.apply(null, cards.concat([limit]).map(D.places));
        return [
          'เทียบแต่ละคันกับ ' + tok(limit) + ' ทีละหลักจากซ้าย',
          'เติม 0 ให้ยาวเท่ากัน: เกณฑ์ ' + tok(D.fromVal(lv, maxP)),
          'คันที่ผ่านคือ ' + pass.map(tok).join(' ')
        ][l - 1];
      },
      answer: 'คันที่น้อยกว่า ' + tok(limit) + ' คือ ' + pass.map(tok).join(' '),
      solve() { w.set(pass); }
    };
  }

  /* ภารกิจสุดท้าย 2 จังหวะ: ประกอบเวลาดอตตี้จากคำใบ้ → ตัดสินว่าใครชนะ */
  function tShowdown(level) {
    const num = D.randDistinct(3, 50, 69, { noZero: true });
    const ds = D.digits(num);
    const rivalT = (() => {
      const v = D.val(num);
      const delta = pick(level === 1 ? [-100, 100, -10, 10] : [-10, 10, -1, 1, -9, 9]);
      return D.fromVal(v + delta, 3);
    })();
    const dottyWins = D.val(num) < D.val(rivalT);
    const styles = level === 1 ? ['name'] : level === 2 ? ['name', 'value'] : ['name', 'value', 'pv'];
    let phase = 1, w = null, ch = null;
    return {
      skill: 'place',
      title: 'รอบชิง! ป้ายเวลาของดอตตี้ถูกป่วน ประกอบเวลาจากคำใบ้',
      say: 'เจ้าจุดซนป่วนป้ายเวลา! ประกอบเวลาของดอตตี้จากคำใบ้ แล้วดูว่าใครชนะ!',
      judSay: 'ฮิ ๆ ข้าซ่อนตัวเลขเวลาของดอตตี้ไว้หมดแล้ว! หาให้เจอสิ!',
      render(el, api) {
        const clues = shuffle(ds.map(x => clueText(x, pick(styles))));
        el.innerHTML = '<div class="clue-split"><ul class="clues">' + clues.map((c, i) => '<li><span class="cl-n">' + (i + 1) + '</span>' + ui.rich(c) + '</li>').join('') + '</ul>' +
          '<div class="w-host"></div></div>' + goBtn('เปิดป้ายเวลา!');
        w = W.slots(el.querySelector('.w-host'), { keys: ds.map(x => x.k), chips: shuffle(ds.map(x => x.d)), hideVal: level === 3 });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          if (!w.full()) return api.nudge('ใส่ตัวเลขให้ครบทุกช่องก่อนนะ', go);
          const g = w.get();
          const bad = ds.filter(x => g[x.k] !== x.d);
          if (bad.length) { bad.forEach(x => w.mark(x.k, 'bad')); return api.wrong('ช่อง' + bad.map(x => PL[x.k].short).join(' ') + ' ยังไม่ตรงคำใบ้', go); }
          w.lock();
          audio.sfx('drumroll');
          phase = 2;
          setTimeout(() => {
            el.innerHTML = '<div class="board"><div class="bd-row me">' + art.carMini('#ff5a4e') + '<b>ดอตตี้</b>' + D.html(num, { cls: 'xl' }) + '<small>วินาที</small></div>' +
              '<div class="bd-row">' + art.carMini('#3ba8ff') + '<b>สายฟ้าฟ้า</b>' + D.html(rivalT, { cls: 'xl' }) + '<small>วินาที</small></div></div>' +
              '<div class="w-host"></div><div class="proof"></div>';
            ch = W.choice(el.querySelector('.w-host'), {
              cls: 'opts-2',
              options: [{ html: 'ดอตตี้ชนะ', value: true }, { html: 'สายฟ้าฟ้าชนะ', value: false }],
              onPick(v, b) {
                el.querySelector('.proof').innerHTML = W.alignBoard([num, rivalT], { names: ['ดอตตี้', 'สายฟ้าฟ้า'] });
                W.animateAlign(el.querySelector('.proof'), num, rivalT);
                if (v === dottyWins) {
                  b.classList.add('good'); ch.lock();
                  api.correct((dottyWins ? 'ดอตตี้ใช้เวลาน้อยกว่า ชนะแล้ว!' : 'สายฟ้าฟ้าใช้เวลาน้อยกว่า คราวนี้เขาชนะ!') + '\n' + cmpReason(num, rivalT), b);
                } else { ch.dim(b); api.wrong('ดูตารางเทียบหลักด้านล่างสิ!', b); }
              }
            });
            api.say('ป้ายเวลาเปิดแล้ว! ' + tok(num) + ' วินาที แล้วใครชนะ? จับเวลานะ ใช้เวลาน้อยกว่าชนะ!', 'wow');
          }, 900);
        });
      },
      hint(l) {
        if (phase === 1) return ['หลักสิบและหลักหน่วยอยู่หน้าจุด', 'ค่า 0.1 อยู่หลักส่วนสิบ · 0.01 หลักส่วนร้อย · 0.001 หลักส่วนพัน', 'เวลาคือ ' + placeList(num)][l - 1];
        return ['จับเวลา: ใช้เวลาน้อยกว่า = เร็วกว่า', 'เทียบทีละหลักจากซ้าย', cmpReason(num, rivalT)][l - 1];
      },
      answer: 'เวลาดอตตี้ ' + tok(num) + ' วินาที ' + (dottyWins ? 'น้อยกว่า' : 'มากกว่า') + ' ' + tok(rivalT) + ' จึง' + (dottyWins ? 'ดอตตี้ชนะ' : 'สายฟ้าฟ้าชนะ'),
      solve() { if (phase === 1) { const m = {}; ds.forEach(x => { m[x.k] = x.d; }); w.solve(m); } else if (ch) ch.mark(dottyWins, 'good'); }
    };
  }

  /* ── สุ่มตัวเลขตามระดับ ── */
  const lvDec = {
    s1(level) {
      if (level === 1) return D.randDec(R(1, 2), 0, 0);
      if (level === 2) return D.randDec(R(2, 3), 0, 9, { zeroMid: Math.random() < 0.3 });
      return D.randDec(3, 1, 9, { zeroMid: Math.random() < 0.6 });
    },
    s2(level) {
      if (level === 1) return D.randDistinct(2, 1, 9);
      if (level === 2) return D.randDistinct(3, 1, 9);
      return D.randDistinct(3, 10, 98, { zeroMid: true });
    }
  };

  /* ════════════════════════════ ข้อมูลสนาม ════════════════════════════ */
  const show = (body, cap) => '<div class="show-card">' + body + (cap ? '<p class="show-cap">' + cap + '</p>' : '') + '</div>';

  const STAGES = [
    {
      id: 1, name: 'อู่เติมพลัง', topic: 'อ่านและเขียนทศนิยมจากปริมาณ', icon: 'fuel', color: '#ff7a45',
      intro: [
        { who: 'zing', mood: 'cheer', sfx: 'rev', text: 'ยินดีต้อนรับสู่อู่เติมพลัง! ก่อนออกสตาร์ต ดอตตี้ต้องเติมพลังให้พอดีเป๊ะ!', show: show(art.dotty('happy', 'drive'), '') },
        { who: 'zing', mood: 'talk', text: 'นี่คือแผ่นพลัง 1 แผ่นเต็ม มีค่าเท่ากับ 1', show: show(art.fullGrid(), '1 แผ่นเต็ม = {c:1}') },
        { who: 'zing', mood: 'wow', text: 'แบ่งแผ่นเป็น 10 แถวเท่า ๆ กัน! 1 แถวคือ 1 ส่วนสิบ เขียนว่า {0.1}', show: show(art.grid(100), '1 แถว = 1 ส่วนสิบ = {c:0.1}') },
        { who: 'zing', mood: 'talk', text: 'แบ่งแผ่นเป็น 100 ช่อง! 1 ช่องคือ 1 ส่วนร้อย เขียนว่า {0.01}', show: show(art.grid(10), '1 ช่อง = 1 ส่วนร้อย = {c:0.01}') },
        { who: 'zing', mood: 'wow', text: 'ส่องแว่นขยาย! แบ่ง 1 ช่องเป็น 10 ชิ้นจิ๋ว 1 ชิ้นคือ 1 ส่วนพัน เขียนว่า {0.001}', show: show(art.grid(1, { zoom: true }), '1 ชิ้นจิ๋ว = 1 ส่วนพัน = {c:0.001}') },
        { who: 'jud', mood: 'smirk', text: 'ฮิ ๆ จุดเล็ก ๆ ตรงกลางนั่นน่ะ ข้าจะขโมยไปให้หมด!', show: show('<div class="show-num">' + D.html('0.001', { cls: 'xxl' }) + '</div>', 'จุดนี้คือ จุดทศนิยม อ่านว่า จุด') },
        { who: 'zing', mood: 'cheer', text: 'ไม่ยอมหรอก! จุดทศนิยมแบ่งจำนวนเต็มกับส่วนที่ไม่เต็มหนึ่ง มาเติมพลังกันเลย!', last: 'เติมพลัง!' }
      ],
      learn: [
        () => tBuild('0.3', { live: true, keys: ['one', 't1'], guide: 't1', say: 'แตะปุ่มบวกของแถวพลัง 3 ครั้งเลย!', ok: 'เป๊ะ! 3 แถว คือ 3 ส่วนสิบ เขียนว่า {0.3} อ่านว่า ศูนย์จุดสาม' }),
        () => tBuild('0.45', { live: true, keys: ['one', 't1', 't2'], say: '4 แถวกับ 5 ช่อง! ลองเติมดู!', ok: 'สุดยอด! 4 แถว 5 ช่อง คือ {0.45} อ่านว่า ศูนย์จุดสี่ห้า' }),
        () => tBuild('1.205', { live: true, say: 'ระวังนะ! หลักส่วนร้อยเป็น 0 แปลว่าไม่ต้องเติมช่องเลย!', ok: 'เยี่ยม! ไม่มีช่องเลย จึงเขียน 0 ไว้ที่หลักส่วนร้อย ได้ {1.205} อ่านว่า หนึ่งจุดสองศูนย์ห้า' }),
        () => tWord('0.25', { options: shuffle(['ศูนย์จุดสองห้า', 'ศูนย์จุดยี่สิบห้า', 'สองจุดห้า']), say: 'เจ้าจุดซนอ่านป้ายนี้ผิดแน่ ๆ ช่วยเลือกคำอ่านที่ถูกหน่อย!' })
      ],
      missions: 5,
      gen(level, i) {
        const type = ['build', 'write', 'word', 'line', 'listen'][i % 5];
        const n = lvDec.s1(level);
        if (type === 'build') return tBuild(level === 1 ? D.randDec(R(1, 2), 0, 2) : n, { live: level === 1 });
        if (type === 'write') return tWrite(n);
        if (type === 'word') return tWord(level === 1 ? D.randDec(2, 0, 3) : n);
        if (type === 'listen') return tListen(level === 3 ? D.randDec(3, 10, 99, { zeroMid: true }) : n);
        if (level === 1) { const f = String(R(0, 4)); return tLine(D.fromVal(D.val(f) + R(1, 9) * 100), f, '0.1'); }
        if (level === 2) { const f = D.randDec(1, 0, 5); return tLine(D.fromVal(D.val(f) + R(1, 9) * 10), f, '0.01'); }
        const f = D.randDec(2, 0, 5); return tLine(D.fromVal(D.val(f) + R(1, 9)), f, '0.001');
      },
      recap: [
        '1 แผ่นเต็ม = {1} · 1 แถว = {0.1} · 1 ช่อง = {0.01} · 1 ชิ้นจิ๋ว = {0.001}',
        'หน้าจุดอ่านแบบจำนวนนับ หลังจุดอ่านทีละตัว เช่น {12.408} อ่านว่า สิบสองจุดสี่ศูนย์แปด',
        'หลักไหนไม่มี ต้องเขียน 0 ไว้ เช่น {1.205}'
      ],
      book: [
        '**ทศนิยม** ใช้บอกปริมาณที่ไม่เต็มหนึ่ง',
        'แบ่ง 1 ออกเป็น 10 ส่วนเท่ากัน 1 ส่วนคือ **ส่วนสิบ** = {c:0.1}',
        'แบ่ง 1 ออกเป็น 100 ส่วนเท่ากัน 1 ส่วนคือ **ส่วนร้อย** = {c:0.01}',
        'แบ่ง 1 ออกเป็น 1000 ส่วนเท่ากัน 1 ส่วนคือ **ส่วนพัน** = {c:0.001}',
        'การอ่าน: {c:3.25} อ่านว่า สามจุดสองห้า (ไม่อ่านว่า สามจุดยี่สิบห้า)',
        '{c:0.07} อ่านว่า ศูนย์จุดศูนย์เจ็ด · {c:15.304} อ่านว่า สิบห้าจุดสามศูนย์สี่'
      ],
      teacher: [
        'ทำไม 0.25 จึงไม่อ่านว่า ศูนย์จุดยี่สิบห้า?',
        'ถ้าระบาย 7 ช่องในตาราง 100 ช่อง จะเขียนเป็นทศนิยมอย่างไร แล้วต่างจากระบาย 7 แถวอย่างไร?',
        'ในชีวิตจริงเห็นทศนิยมที่ไหนบ้าง (ระยะทาง น้ำหนัก เวลาแข่งขัน)?'
      ]
    },
    {
      id: 2, name: 'หอเกียร์', topic: 'หลัก ค่าประจำหลัก ค่าของเลขโดด และรูปกระจาย', icon: 'gear', color: '#14b8a6',
      intro: [
        { who: 'zing', mood: 'cheer', sfx: 'airhorn', text: 'มาถึงหอเกียร์แล้ว! ที่นี่ตัวเลขทุกตัวต้องเข้าช่องเกียร์ให้ถูกหลัก!', show: show(W.alignBoard(['3.725']), 'ตารางหลักของ {3.725}') },
        { who: 'zing', mood: 'talk', text: 'หลักหน่วยมีค่าประจำหลัก 1 ไปทางขวาทีละหลัก ค่าจะเล็กลงทีละ 10 เท่า', show: show('<div class="pv-legend">' + ['one', 't1', 't2', 't3'].map(k => '<div class="pvl" style="--pc:' + art.COL[k] + '"><b>' + PL[k].short + '</b>' + D.html(PL[k].value) + '</div>').join('') + '</div>', 'ค่าประจำหลัก') },
        { who: 'jud', mood: 'laugh', text: 'ฮ่า ๆ ข้าสลับเลขในเกียร์ไปหมดแล้ว! เลข 4 อยู่ตรงไหนก็มีค่าเท่ากันแหละ!' },
        { who: 'zing', mood: 'wow', text: 'ผิดแล้ว! เลข 4 ในหลักส่วนสิบมีค่า {0.4} แต่เลข 4 ในหลักส่วนร้อยมีค่าแค่ {0.04}', show: show('<div class="show-row">' + D.html('0.4', { cls: 'xl', color: true }) + '<span class="vs-t">ไม่เท่ากับ</span>' + D.html('0.04', { cls: 'xl', color: true }) + '</div>', 'อยู่คนละหลัก ค่าไม่เท่ากัน') },
        { who: 'zing', mood: 'cheer', text: 'มาจัดเกียร์ให้ถูกหลัก แล้วซิ่งต่อกันเลย!', last: 'ลุยหอเกียร์!' }
      ],
      learn: [
        () => tSlots('2.47', { say: 'แตะตัวเลข แล้วแตะช่องเกียร์ หรือลากไปวางก็ได้! ดูจอเกียร์เป็นตัวอย่างนะ' }),
        () => tValue('5.386', 't2'),
        () => tExpand('4.275', { extra: 2, say: 'รูปกระจายคือการแยกค่าของเลขโดดแต่ละตัวมาบวกกัน เลือกให้ครบเลย!' })
      ],
      missions: 5,
      gen(level, i) {
        const type = ['clue', 'pick', 'value', 'expand', 'unexpand'][i % 5];
        const n = lvDec.s2(level);
        const fk = D.digits(n).filter(x => FRAC.indexOf(x.k) >= 0 && x.d !== '0').map(x => x.k);
        if (type === 'clue') return tSlots(n, { clue: true, extra: level - 1, styles: level === 1 ? ['name'] : level === 2 ? ['name', 'value'] : ['name', 'value', 'pv'], hideVal: level === 3 });
        if (type === 'pick') return level === 1 && Math.random() < 0.4 ? tPV(pick(FRAC)) : tPick(n, pick(fk), level === 1 ? 'place' : pick(['place', 'value']));
        if (type === 'value') return tValue(n, pick(fk));
        if (type === 'expand') return tExpand(level === 3 ? D.randDec(3, 1, 9, { zeroMid: true }) : n, { extra: level + 1 });
        return tUnexpand(level === 1 ? D.randDec(2, 1, 9) : D.randDec(3, 1, level === 3 ? 30 : 9, { zeroMid: true }), { shuffled: level === 3 });
      },
      recap: [
        'หลักหลังจุด: ส่วนสิบ {0.1} · ส่วนร้อย {0.01} · ส่วนพัน {0.001}',
        'ค่าของเลขโดดขึ้นกับหลักที่อยู่ เช่น ใน {5.386} เลข 8 มีค่า {0.08}',
        'รูปกระจาย: {4.275} = {4} + {0.2} + {0.07} + {0.005}'
      ],
      book: [
        '**หลัก** ของทศนิยม: หลักหน่วย · หลักส่วนสิบ · หลักส่วนร้อย · หลักส่วนพัน',
        '**ค่าประจำหลัก**: หน่วย {1} · ส่วนสิบ {0.1} · ส่วนร้อย {0.01} · ส่วนพัน {0.001}',
        '**ค่าของเลขโดด** = เลขโดดนั้นในหลักของมัน เช่น {c:2.583} เลข 5 มีค่า {0.5} เลข 8 มีค่า {0.08} เลข 3 มีค่า {0.003}',
        '**รูปกระจาย**: {c:2.583} = {2} + {0.5} + {0.08} + {0.003}',
        'หลักที่เป็น 0 ไม่ต้องเขียนในรูปกระจาย เช่น {c:6.049} = {6} + {0.04} + {0.009}'
      ],
      teacher: [
        'เลข 7 ใน 0.7 กับ 0.07 ต่างกันอย่างไร ใช้แผ่นพลังอธิบายได้ไหม?',
        'ทำไมเวลาเขียน 6 + 0.04 + 0.009 กลับเป็นทศนิยม จึงต้องมี 0 ที่หลักส่วนสิบ?',
        'ค่าประจำหลักที่อยู่ติดกัน ต่างกันกี่เท่า?'
      ]
    },
    {
      id: 3, name: 'อุโมงค์กระจกแฝด', topic: 'ทศนิยมที่เท่ากัน', icon: 'mirror', color: '#7c5cff',
      intro: [
        { who: 'zing', mood: 'cheer', sfx: 'whoosh', text: 'อุโมงค์กระจกแฝด! ประตูจะเปิด ก็ต่อเมื่อตัวเลขสองฝั่งมีค่าเท่ากัน!' },
        { who: 'zing', mood: 'wow', text: 'ดูนะ! {0.5} คือ 5 แถว ส่วน {0.50} คือ 50 ช่อง ระบายได้เท่ากันเป๊ะ!', show: show(W.gridPair('0.5', '0.50'), '{0.5} = {0.50}') },
        { who: 'jud', mood: 'smirk', text: 'งั้น {0.05} ก็เท่ากับ {0.5} สิ มีเลข 0 กับ 5 เหมือนกันนี่ ฮิ ๆ' },
        { who: 'zing', mood: 'wow', text: 'ไม่ใช่! {0.05} มีแค่ 5 ช่องเท่านั้น!', show: show(W.gridPair('0.5', '0.05', { ne: true }), '{0.5} ไม่เท่ากับ {0.05}') },
        { who: 'zing', mood: 'cheer', text: 'จำไว้! เติม 0 ท้ายทศนิยม ค่าเท่าเดิม แต่เติม 0 แทรกหลังจุด ค่าเปลี่ยนเลย!', last: 'เข้าอุโมงค์!' }
      ],
      learn: [
        () => tZero('0.7', 2, { say: 'ลองแตะปุ่มบวกศูนย์ตรงจุดต่าง ๆ ดูสิ! ดูแผ่นพลังด้านล่างว่ายังเท่ากันไหม' }),
        () => tPickEq('0.4'),
        () => tZero('2.5', 3)
      ],
      missions: 5,
      gen(level, i) {
        const type = ['pick', 'zero', 'gate', 'short', 'jud'][i % 5];
        if (type === 'pick') return tPickEq(level === 1 ? D.randDec(1, 0, 0) : level === 2 ? D.randDec(R(1, 2), 1, 9) : pick([String(R(2, 9)), D.randDec(2, 1, 20, { zeroMid: true })]));
        if (type === 'zero') {
          const s = level === 1 ? D.randDec(1, 0, 3) : level === 2 ? D.randDec(R(1, 2), 1, 9) : pick([String(R(1, 9)), D.randDec(1, 10, 30)]);
          const want = Math.min(3, D.places(s) + (level === 1 ? 1 : R(1, 2)));
          return tZero(s, Math.max(want, D.places(s) + 1));
        }
        if (type === 'short') {
          const b = level === 1 ? D.randDec(1, 0, 5) : level === 2 ? D.randDec(R(1, 2), 1, 9) : pick([String(R(1, 9)), D.randDec(1, 10, 40, {})]);
          const s = D.fromVal(D.val(b), Math.min(3, Math.max(D.places(b) + 1, level === 1 ? 2 : 3)));
          return tShort(s);
        }
        const [a, b] = gatePair(level);
        if (type === 'jud') {
          const claim = Math.random() < 0.5 ? 'eq' : 'ne';
          return tGate(a, b, {
            judClaim: claim,
            title: 'เจ้าจุดซนบอกว่า ' + tok(a) + (claim === 'eq' ? ' เท่ากับ ' : ' ไม่เท่ากับ ') + tok(b),
            judSay: 'ข้าว่า ' + tok(a) + (claim === 'eq' ? ' เท่ากับ ' : ' ไม่เท่ากับ ') + tok(b) + ' แน่นอน! ใครจะกล้าเถียง!',
            say: 'เจ้าจุดซนพูดถูกหรือผิด? ตัดสินเลย!'
          });
        }
        return tGate(a, b);
      },
      recap: [
        'เติม 0 หรือตัด 0 ที่อยู่ท้ายทศนิยม ค่าไม่เปลี่ยน: {0.5} = {0.50} = {0.500}',
        'แต่ {0.5} ไม่เท่ากับ {0.05} เพราะ 0 แทรกหลังจุดทำให้หลักเปลี่ยน',
        'จำนวนนับก็เขียนเป็นทศนิยมได้: {4} = {4.0} = {4.00}'
      ],
      book: [
        '**ทศนิยมที่เท่ากัน** คือทศนิยมที่มีค่าเท่ากัน แม้จะเขียนต่างกัน',
        'เติม 0 ท้ายทศนิยมได้ ค่าไม่เปลี่ยน: {c:0.3} = {c:0.30} = {c:0.300}',
        'ตัด 0 ท้ายทศนิยมได้ ค่าไม่เปลี่ยน: {c:2.500} = {c:2.5}',
        'ระวัง! 0 ที่แทรกหลังจุดหรือระหว่างตัวเลข ตัดหรือเติมไม่ได้: {c:2.5} ไม่เท่ากับ {c:2.05}',
        'จำนวนนับ: {c:6} = {c:6.0} = {c:6.00}'
      ],
      teacher: [
        'ใช้ตาราง 100 ช่องอธิบายว่าทำไม 0.3 = 0.30',
        'ถ้าเพื่อนบอกว่า 0.5 = 0.05 จะอธิบายให้เพื่อนเข้าใจอย่างไร?',
        'การเติม 0 ท้ายทศนิยมช่วยให้เปรียบเทียบทศนิยมง่ายขึ้นอย่างไร?'
      ]
    },
    {
      id: 4, name: 'ทางตรงประลองระยะ', topic: 'การเปรียบเทียบและเรียงลำดับทศนิยม', icon: 'gauge', color: '#3ba8ff',
      intro: [
        { who: 'zing', mood: 'cheer', sfx: 'crowd', text: 'ทางตรงประลองระยะ! รถคันไหนพุ่งไปได้ไกลกว่า คนนั้นชนะ!' },
        { who: 'zing', mood: 'talk', text: 'วิธีเทียบ! ตั้งจุดทศนิยมให้ตรงกัน แล้วเทียบทีละหลักจากซ้ายไปขวา', show: show(W.alignBoard(['2.45', '2.5']), '') },
        { who: 'zing', mood: 'wow', text: 'หลักหน่วย 2 กับ 2 เท่ากัน ไปต่อ! หลักส่วนสิบ 4 กับ 5 ... 5 มากกว่า! ดังนั้น {2.5} มากกว่า {2.45}', show: show('<div class="al-anim">' + W.alignBoard(['2.45', '2.5']) + '</div>', '{2.5} &gt; {2.45}') },
        { who: 'jud', mood: 'laugh', text: 'ไม่จริง! {2.45} ตัวเลขยาวกว่า ต้องมากกว่าสิ!' },
        { who: 'zing', mood: 'cheer', text: 'ตัวเลขยาวกว่าไม่ได้แปลว่ามากกว่า! ต้องเทียบทีละหลักเสมอ พิสูจน์กันเลย!', last: 'ออกตัว!' }
      ],
      learn: [
        () => tCompare('0.8', '0.75', { showProof: true, say: 'ดูตารางเทียบหลักด้านล่างช่วยได้นะ! แล้วเลือกเครื่องหมาย!' }),
        () => tCompare('3.06', '3.6', { judSay: 'ฮิ ๆ {3.06} มีเลข 6 เหมือนกัน แถมยาวกว่าอีก ต้องชนะแน่!' }),
        () => tOrder(['2.5', '2.45', '2.405'], 'desc', { say: 'แตะป้ายตัวเลขเพื่อวางลงอันดับ 1, 2, 3 ใครไกลที่สุดได้อันดับ 1!' })
      ],
      missions: 5,
      gen(level, i) {
        const type = ['compare', 'order', 'compare', 'extreme', 'order'][i % 5];
        if (type === 'compare') { const [a, b] = comparePair(level); return tCompare(a, b); }
        if (type === 'extreme') return tExtreme(orderSet(Math.min(3, level + 1)), Math.random() < 0.6);
        return tOrder(orderSet(level), Math.random() < 0.5 ? 'desc' : 'asc');
      },
      recap: [
        'ตั้งจุดทศนิยมให้ตรงกัน แล้วเทียบทีละหลักจากซ้ายไปขวา',
        'ตัวเลขยาวกว่าไม่ได้แปลว่ามากกว่า: {2.5} > {2.45}',
        'เติม 0 ท้ายให้ทศนิยมยาวเท่ากันจะเทียบง่ายขึ้น: {2.50} กับ {2.45}'
      ],
      book: [
        '**ขั้นตอนเปรียบเทียบทศนิยม**',
        '1. ตั้งจุดทศนิยมให้ตรงกัน',
        '2. เทียบหลักซ้ายสุดก่อน (หลักหน่วยหรือหลักสิบ)',
        '3. ถ้าเท่ากัน ให้เทียบหลักถัดไปทางขวา จนเจอหลักที่ต่างกัน',
        'ตัวอย่าง {c:3.6} กับ {c:3.06}: หลักหน่วยเท่ากัน หลักส่วนสิบ 6 > 0 ดังนั้น {3.6} > {3.06}',
        '**เรียงลำดับ**: หาค่ามากที่สุด (หรือน้อยที่สุด) ทีละตัว เช่น {2.5} > {2.45} > {2.405}'
      ],
      teacher: [
        'ทำไม 2.5 จึงมากกว่า 2.45 ทั้งที่ 45 มากกว่า 5?',
        'ให้นักเรียนยกตัวอย่างทศนิยม 2 จำนวนที่มีเลขโดดเหมือนกันแต่ค่าต่างกัน',
        'ถ้าแข่งวิ่งแล้วจับเวลา คนชนะคือคนที่เวลามากหรือน้อยกว่า?'
      ]
    },
    {
      id: 5, name: 'แกรนด์ปรีซ์ชิงแชมป์', topic: 'ภารกิจสุดท้าย: ใช้ทศนิยมคว้าแชมป์', icon: 'trophy', color: '#ffb020', final: true,
      intro: [
        { who: 'zing', mood: 'cheer', sfx: 'airhorn', text: 'นี่แหละ! รอบชิงแชมป์แกรนด์ปรีซ์ทศนิยม! เสียงเชียร์ดังสนั่นสนาม!', show: show(art.trophy('bounce'), '') },
        { who: 'zing', mood: 'talk', text: 'รอบนี้จับเวลา! ใครใช้เวลาน้อยที่สุด คนนั้นคือแชมป์!' },
        { who: 'jud', mood: 'laugh', text: 'ฮ่า ๆ ข้าจะป่วนทั้งวิทยุ ป้ายเวลา และกระดานคะแนนให้สุด ๆ ไปเลย!' },
        { who: 'zing', mood: 'cheer', sfx: 'crowd', text: 'ใช้ทุกอย่างที่เรียนมา พาดอตตี้คว้าแชมป์กันเลย! 3 2 1 ไป!', last: 'ออกสตาร์ต!' }
      ],
      learn: [],
      missions: 6,
      gen(level, i, run) {
        const base = R(50, 65);
        switch (i % 6) {
          case 0: return tBuild(level === 1 ? D.randDec(2, 1, 3) : D.randDec(3, 1, 5, { zeroMid: level === 3 }), {
            word: true, unit: 'ลิตร', title: 'เติมเชื้อเพลิงตามวิทยุ', go: 'เติมน้ำมัน!',
            say: 'วิทยุจากทีมช่าง! ฟังให้ดี แล้วเติมเชื้อเพลิงให้เป๊ะ!',
            judSay: 'ข้าลบตัวเลขในใบสั่งไปแล้ว เหลือแต่คำอ่าน ฮิ ๆ!'
          });
          case 1: return tUnexpand(D.randDec(3, 1, level === 3 ? 30 : 9, { zeroMid: true }), {
            shuffled: true, label: 'รหัสประตูพิท', title: 'ถอดรหัสประตูพิท', go: 'เปิดประตู!',
            say: 'รหัสประตูถูกสลับลำดับ! รวมค่าให้เป็นทศนิยมแล้วกดรหัส!'
          });
          case 2: {
            const t = level === 1 ? base + '.' + R(1, 9) : D.randDec(2, base, base);
            return tPickEq(t, {
              title: 'ป้ายเวลาไหนตรงกับจอใหญ่ ' + tok(t) + ' วินาที?', label: 'จอใหญ่', unit: 'วินาที',
              say: 'ป้ายเวลารอบสนามเขียนไม่เหมือนกัน! เลือกทุกป้ายที่เป็นเวลาเดียวกับจอใหญ่!',
              judSay: 'ข้าแอบเติมเลข 0 ไว้ในป้ายหลายอัน ดูออกไหมล่ะ!'
            });
          }
          case 3: {
            const times = orderSet(level, base);
            return tOrder(times, 'asc', {
              title: 'ภาพเส้นชัย! เรียงอันดับจากเวลา (วินาที)',
              say: 'ใช้เวลาน้อยที่สุดคืออันดับ 1! เรียงอันดับให้ถูกเลย!',
              labels: times.map((x, k) => 'ที่ ' + (k + 1)), leftLabel: 'เร็วที่สุด (เวลาน้อย)', rightLabel: 'ช้าที่สุด (เวลามาก)',
              cardHTML: (s, k) => art.carMini(RIVAL_COLORS[k % 5]) + D.html(s),
              ok: 'เวลาน้อยที่สุด = เร็วที่สุด! ' + times.slice().sort(D.cmp).map(tok).join(' < ')
            });
          }
          case 4: return tQualify(level === 1 ? '1.' + R(3, 7) : level === 2 ? '1.' + R(1, 8) + R(1, 9) : '2.' + R(2, 8), level);
          default: return tShowdown(level);
        }
      },
      recap: [
        'อ่านคำอ่านแล้วเขียน/สร้างปริมาณทศนิยมได้',
        'ใช้รูปกระจายและค่าประจำหลักถอดรหัสตัวเลข',
        'ใช้ทศนิยมที่เท่ากัน การเปรียบเทียบ และการเรียงลำดับ ตัดสินผลการแข่งขันได้'
      ],
      book: [
        '**สรุปทั้งหมด**',
        'อ่าน: {c:58.407} อ่านว่า ห้าสิบแปดจุดสี่ศูนย์เจ็ด',
        'รูปกระจาย: {c:58.407} = {50} + {8} + {0.4} + {0.007}',
        'เท่ากัน: {58.4} = {58.40} = {58.400}',
        'เปรียบเทียบ: {58.407} < {58.47} เพราะหลักส่วนร้อย 0 < 7',
        'การจับเวลา: เวลาน้อยกว่า = เร็วกว่า'
      ],
      teacher: [
        'ในการแข่งขันจับเวลา ทำไมเวลาที่น้อยกว่าจึงชนะ ต่างจากการแข่งระยะอย่างไร?',
        'ถ้าป้ายเวลาแสดง 58.4 และ 58.400 ควรประกาศว่าเสมอกันหรือไม่ เพราะอะไร?',
        'ให้นักเรียนสร้างโจทย์ "ผ่านเข้ารอบ" ของตัวเองให้เพื่อนทาย'
      ],
      outro: [
        { who: 'jud', mood: 'shock', text: 'โอ้โห! เจ้าแก้ทุกอย่างที่ข้าป่วนได้หมดเลย!' },
        { who: 'jud', mood: 'happy', text: 'ข้ายอมแล้ว... ขอเข้าทีมช่างของดอตตี้ด้วยได้ไหม? ข้าจะคืนจุดทศนิยมให้ทุกตัวเลย!' },
        { who: 'zing', mood: 'cheer', sfx: 'airhorn', keepJud: true, text: 'ได้เลย! และแชมป์แกรนด์ปรีซ์ทศนิยมปีนี้คือ... ดอตตี้กับเพื่อนนักซิ่งของเรา!' },
        { who: 'zing', mood: 'happy', keepJud: true, text: 'อ่าน เขียน แยกหลัก หาค่าที่เท่ากัน เปรียบเทียบ และเรียงลำดับทศนิยมได้ครบ เก่งที่สุด!', last: 'เย้!' }
      ]
    }
  ];

  const SKILLS = {
    read: { name: 'อ่านและเขียนทศนิยมจากปริมาณ', rec: 'กลับไปที่ **อู่เติมพลัง** ฝึกนับแถว ช่อง ชิ้นจิ๋ว แล้วเขียนเป็นทศนิยม' },
    place: { name: 'หลัก ค่าประจำหลัก ค่าของเลขโดด', rec: 'ฝึกที่ **หอเกียร์** จำให้ได้ว่าหลังจุดคือ ส่วนสิบ ส่วนร้อย ส่วนพัน' },
    expand: { name: 'รูปกระจาย', rec: 'ฝึกแยกเลขโดดทีละตัว แล้วเขียนค่าของมัน เช่น {4.275} = {4} + {0.2} + {0.07} + {0.005}' },
    equal: { name: 'ทศนิยมที่เท่ากัน', rec: 'ฝึกที่ **อุโมงค์กระจก** จำว่าเติม/ตัด 0 ได้เฉพาะท้ายทศนิยม' },
    compare: { name: 'การเปรียบเทียบทศนิยม', rec: 'ฝึกตั้งจุดให้ตรงกัน แล้วเทียบทีละหลักจากซ้าย' },
    order: { name: 'การเรียงลำดับทศนิยม', rec: 'ฝึกเติม 0 ท้ายให้ยาวเท่ากัน แล้วเรียงทีละตัว' }
  };

  DG.STAGES = STAGES;
  DG.SKILLS = SKILLS;
  DG.LEAD_WRONG = LEAD_WRONG;
  DG.T = { tBuild, tWrite, tWord, tListen, tLine, tSlots, tPick, tValue, tPV, tExpand, tUnexpand, tZero, tPickEq, tGate, tShort, tCompare, tOrder, tExtreme, tQualify, tShowdown, comparePair, orderSet, gatePair, equalCards, readOptions };
})();
