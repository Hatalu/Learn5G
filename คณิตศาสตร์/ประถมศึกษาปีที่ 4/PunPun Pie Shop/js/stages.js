/* ═══════════════════════════════════════════════════════════
   PUNPUN PIE SHOP — เนื้อหา 5 ด่าน
   แต่ละ task = { skill, title, say, mixSay?, render(el, api), hint(level, api), answer }
   level ความยาก 1–3 ปรับอัตโนมัติจากความถูกต้อง (ไม่ใช่ความเร็ว)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP;
  const F = PP.F, art = PP.art, W = PP.W, ui = PP.ui;
  const tok = F.tok, R = F.rand, pick = F.pick;
  const sym = c => c > 0 ? '>' : c < 0 ? '<' : '=';
  const relWord = c => c > 0 ? 'มากกว่า' : c < 0 ? 'น้อยกว่า' : 'เท่ากับ';

  function goBtn(label) {
    return '<div class="act"><button class="btn btn-go act-go">' + art.icon('check') + '<span>' + label + '</span></button></div>';
  }
  function ticket(html, unit, cls) {
    return '<div class="ticket ' + (cls || '') + '"><span class="tk-lbl">ออเดอร์</span><span class="tk-val">' + html + '</span>' +
      (unit ? '<span class="tk-unit">' + unit + '</span>' : '') + '</div>';
  }
  function coverable(n, d, covered, flavor) {
    return '<div class="q-pies ' + (covered ? 'covered' : '') + '">' + art.pies(n, d, { flavor }) +
      '<div class="cloth"><span>ผ้าคลุมพาย</span></div></div>';
  }
  function uncover(el) {
    const c = el.querySelector('.q-pies.covered');
    if (c) { c.classList.remove('covered'); ui.puff(c); PP.audio.sfx('puff'); }
  }
  /* สุ่มเศษส่วนอย่างต่ำ a/b (a<b) */
  function simpleProper(maxB) {
    let a, b;
    do { b = R(2, maxB); a = R(1, b - 1); } while (F.gcd(a, b) !== 1);
    return { n: a, d: b };
  }
  function distinctBy(list, keyFn) {
    const seen = {};
    return list.filter(x => { const k = keyFn(x); if (seen[k]) return false; seen[k] = 1; return true; });
  }

  /* ════════════════════════════════════════════════
     STAGE 1 : ครัวตัดพาย — เศษส่วนแท้ / เศษเกิน
     ════════════════════════════════════════════════ */
  function tFill(n, d, pies, o) {
    o = o || {};
    let w = null;
    return {
      skill: 'proper',
      title: 'เติมพายให้ได้ ' + tok({ n, d }) + ' ถาด',
      say: o.say || 'แตะชิ้นพายเพื่อเติมไส้ได้เลย',
      render(el, api) {
        el.innerHTML = '<div class="row-center">' + ticket(F.frHTML(n, d), 'ถาด') + '</div><div class="w-host"></div>' + goBtn('ส่งพาย');
        w = W.filler(el.querySelector('.w-host'), {
          d, pies, flavor: 'berry',
          onLocked: () => api.say('เติมถาดแรกให้เต็มก่อนนะ แล้วค่อยไปถาดต่อไป', 'think')
        });
        if (o.guide) setTimeout(() => w.pulseFirst(), 400);
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const f = w.get();
          if (f === n) { w.lock(); api.correct(o.ok || ('ถูกต้อง! ได้ ' + tok({ n, d }) + ' ถาดพอดี'), go); }
          else if (f === 0) api.wrong('ยังไม่ได้เติมเลยนะ', go);
          else api.wrong('ตอนนี้ได้ ' + tok({ n: f, d }) + ' ถาด ' + (f < n ? 'ยังไม่ครบ' : 'เกินไปนิด'), go);
        });
      },
      hint(l) {
        return [
          'ตัวส่วน ' + d + ' แปลว่า 1 ถาดแบ่งเป็น ' + d + ' ชิ้นเท่ากัน',
          'ตัวเศษ ' + n + ' แปลว่า ต้องเติมไส้ ' + n + ' ชิ้น',
          'ดูตัวเลขใต้พาย ต้องให้เป็น ' + tok({ n, d }) + ' นะ'
        ][l - 1];
      },
      answer: 'ต้องเติมไส้ ' + n + ' ชิ้น ชิ้นละ ' + tok({ n: 1, d }) + ' ถาด'
    };
  }

  function explainProper(f) {
    if (f.n < f.d) return 'ตัวเศษ ' + f.n + ' น้อยกว่าตัวส่วน ' + f.d + ' ไม่ถึง 1 ถาด จึงเป็น **เศษส่วนแท้**';
    if (f.n === f.d) return 'ตัวเศษเท่ากับตัวส่วน ได้ 1 ถาดพอดี จึงเป็น **เศษเกิน**';
    return 'ตัวเศษ ' + f.n + ' มากกว่าตัวส่วน ' + f.d + ' เกิน 1 ถาด จึงเป็น **เศษเกิน**';
  }

  function tSort(f, level) {
    let el0 = null;
    const showPies = level === 1;
    return {
      skill: 'proper',
      title: 'ส่งพายเข้ากล่องให้ถูกต้อง',
      say: level === 1 ? 'พายนี้ควรเข้ากล่องไหนนะ? ดูภาพช่วยได้' : 'พายนี้ควรเข้ากล่องไหน? ดูที่ตัวเลขนะ',
      render(el, api) {
        el0 = el;
        el.innerHTML = '<div class="sort">' +
          '<div class="sort-item">' + ticket(F.frHTML(f.n, f.d), 'ถาด', 'big') + coverable(f.n, f.d, !showPies, 'berry') + '</div>' +
          '<div class="sort-boxes">' +
            '<button class="box box-p" data-k="p"><span class="box-lid"></span><b>เศษส่วนแท้</b><small>ไม่ถึง 1 ถาด</small></button>' +
            '<button class="box box-i" data-k="i"><span class="box-lid"></span><b>เศษเกิน</b><small>ตั้งแต่ 1 ถาดขึ้นไป</small></button>' +
          '</div></div>';
        const want = f.n < f.d ? 'p' : 'i';
        el.querySelector('.sort-boxes').addEventListener('click', e => {
          const b = e.target.closest('.box');
          if (!b || api.isDone()) return;
          if (b.dataset.k === want) {
            uncover(el);
            const tk = el.querySelector('.ticket');
            W.fly(tk, b, tk.outerHTML);
            tk.classList.add('sent');
            b.classList.add('got');
            api.correct(explainProper(f), b);
          } else {
            api.wrong('', b);
          }
        });
      },
      hint(l) {
        if (l >= 2) uncover(el0);
        return [
          'เทียบตัวเศษ (ตัวบน) กับตัวส่วน (ตัวล่าง) อันไหนมากกว่า?',
          'ดูภาพพายสิ เต็ม 1 ถาดแล้วหรือยัง?',
          'ตัวเศษ ' + f.n + ' ' + relWord(F.cmp({ n: f.n, d: 1 }, { n: f.d, d: 1 })) + 'ตัวส่วน ' + f.d
        ][l - 1];
      },
      answer: explainProper(f)
    };
  }

  const STAGE1 = {
    id: 1, name: 'ครัวตัดพาย', topic: 'เศษส่วนแท้ และ เศษเกิน', color: '#ff8fa3', flavor: 'berry',
    intro: [
      { who: 'pp', text: 'ยินดีต้อนรับสู่ครัวตัดพาย! ที่นี่ตัดพายเป็นชิ้นเท่า ๆ กัน', mood: 'cheer' },
      { who: 'pp', text: '{3/4} แปลว่า ตัดพาย 1 ถาดเป็น 4 ชิ้นเท่ากัน แล้วเอามา 3 ชิ้น', show: '[PIE 3/4]<div class="illus-lbl">{3/4} ถาด</div>' },
      { who: 'pp', text: 'ตัวบนเรียกว่า **ตัวเศษ** ตัวล่างเรียกว่า **ตัวส่วน**', show: '<div class="parts"><div class="parts-fr">{3/4}</div><div class="parts-tags"><span>ตัวเศษ = ชิ้นที่เอามา</span><span>ตัวส่วน = แบ่ง 1 ถาดเป็นกี่ชิ้น</span></div></div>' },
      { who: 'mix', text: 'แฮ่! ข้าสลับป้ายออเดอร์ไว้หมดแล้ว ทำให้ถูกได้ก็ลองดูสิ', last: 'เริ่มเลย' }
    ],
    learn: [
      () => tFill(3, 4, 2, { guide: true, say: 'ลูกค้าสั่ง {3/4} ถาด แตะชิ้นพายเพื่อเติมไส้นะ',
        ok: 'เยี่ยม! ตัวเศษ 3 น้อยกว่าตัวส่วน 4 ไม่ถึง 1 ถาด เรียกว่า **เศษส่วนแท้**' }),
      () => tFill(5, 4, 2, { say: 'ออเดอร์นี้ {5/4} ถาด... ถาดเดียวพอไหมนะ?',
        ok: 'ต้องใช้ถาดที่ 2 ด้วย! ตัวเศษมากกว่าตัวส่วน เรียกว่า **เศษเกิน**' }),
      () => tFill(4, 4, 2, { say: 'แล้วถ้าสั่ง {4/4} ถาดล่ะ?',
        ok: 'เต็มพอดี 1 ถาด! ตัวเศษเท่ากับตัวส่วน ก็เป็น **เศษเกิน** นะ' })
    ],
    missions: 5,
    gen(level, i, run) {
      if (level >= 2 && i === 2) {
        const d = pick([3, 4]);
        const n = R(d + 1, 3 * d - 1);
        return tFill(n, d, 3, { say: 'ออเดอร์ใหญ่! สั่ง ' + tok({ n, d }) + ' ถาด เติมให้ครบนะ',
          ok: 'ครบแล้ว! ' + tok({ n, d }) + ' ถาด มากกว่า 1 ถาด เป็นเศษเกิน' });
      }
      let f, guard = 0;
      do {
        if (level === 1) { const d = R(2, 4); f = { n: R(1, 2 * d), d }; }
        else if (level === 2) { const d = R(3, 8); f = { n: R(1, 2 * d), d }; }
        else { const d = R(6, 12); f = { n: d + pick([-1, 0, 0, 1]), d }; }
        guard++;
      } while (guard < 20 && run.last1 && run.last1.n === f.n && run.last1.d === f.d);
      run.last1 = f;
      return tSort(f, level);
    },
    recap: [
      '**เศษส่วนแท้** ตัวเศษน้อยกว่าตัวส่วน เช่น {3/4} (ไม่ถึง 1 ถาด)',
      '**เศษเกิน** ตัวเศษมากกว่าหรือเท่ากับตัวส่วน เช่น {5/4} และ {4/4}'
    ],
    book: [
      '**ส่วนประกอบของเศษส่วน** [pie 3/4]',
      '{3/4} ตัวบน 3 = ตัวเศษ (จำนวนชิ้นที่เอามา) ตัวล่าง 4 = ตัวส่วน (แบ่ง 1 ถาดเป็นกี่ชิ้น)',
      '**เศษส่วนแท้** ตัวเศษ < ตัวส่วน เช่น {1/2} {3/4} {5/8}',
      '**เศษเกิน** ตัวเศษ ≥ ตัวส่วน เช่น {4/4} {5/4} {9/2}'
    ],
    teacher: [
      'ทำไม {4/4} จึงเป็นเศษเกิน ทั้งที่ไม่ได้ "เกิน" 1 ถาด?',
      'ให้นักเรียนยกตัวอย่างเศษส่วนแท้ที่ตัวส่วนเป็น 10 มา 3 จำนวน'
    ]
  };

  /* ════════════════════════════════════════════════
     STAGE 2 : โต๊ะแพ็กกล่อง — จำนวนคละ / เศษเกิน
     ════════════════════════════════════════════════ */
  function tPack(n, d) {
    let pk = null, packed = false;
    const m = F.toMixed({ n, d });
    return {
      skill: 'mixed',
      title: 'แพ็กชิ้นพาย ' + tok({ n, d }) + ' ถาด ลงถาด',
      say: 'แตะชิ้นพายทีละชิ้น ใส่ลงถาด ถาดละ ' + d + ' ชิ้น',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div><div class="label-row hidden"><div class="sign-lbl">' + F.frHTML(n, d) + '<span class="eq">=</span></div><div class="fi-host"></div></div>' + goBtn('ติดป้าย');
        const go = el.querySelector('.act-go');
        go.parentNode.classList.add('hidden');
        pk = W.packer(el.querySelector('.w-host'), {
          n, d, flavor: 'lemon',
          onDone: () => {
            packed = true;
            el.querySelector('.label-row').classList.remove('hidden');
            go.parentNode.classList.remove('hidden');
            api.say('ได้กี่ถาดเต็ม? เหลือกี่ชิ้น? เขียนป้ายเป็นจำนวนคละเลย');
          }
        });
        setTimeout(() => pk.pulse(), 400);
        const fi = ui.fracInput({ whole: { value: 0 }, n: { value: 0 }, d: { value: d, fixed: true } });
        el.querySelector('.fi-host').appendChild(fi.el);
        go.addEventListener('click', () => {
          const v = fi.get();
          if (v.w === m.w && v.n === m.n) api.correct(tok({ n, d }) + ' = ' + tok({ n, d }, true) + ' ได้ ' + m.w + ' ถาดเต็ม กับอีก ' + tok({ n: m.n, d }) + ' ถาด\nอ่านว่า "' + F.readMixed(m.w, m.n, d) + '"', go);
          else if (v.w !== m.w) api.wrong('จำนวนถาดเต็มยังไม่ใช่นะ ลองนับถาดที่มีป้าย "เต็ม 1 ถาด"', go);
          else api.wrong('ถาดเต็มถูกแล้ว! แต่ชิ้นที่เหลือยังไม่ใช่', go);
        });
      },
      hint(l) {
        if (!packed) { pk.pulse(); return 'แตะชิ้นพายให้ครบทุกชิ้นก่อนนะ'; }
        return [
          'นับถาดที่มีป้าย "เต็ม 1 ถาด" ใส่ช่องซ้าย',
          'ถาดสุดท้ายมีกี่ชิ้น ใส่ไว้ที่ตัวเศษ',
          'ได้ ' + m.w + ' ถาดเต็ม เหลือ ' + m.n + ' ชิ้น'
        ][l - 1];
      },
      answer: tok({ n, d }) + ' = ' + tok({ n, d }, true)
    };
  }

  function tCut(w, n, d) {
    let ct = null, cut = false;
    const total = w * d + n;
    return {
      skill: 'mixed',
      title: 'ผ่าพาย ' + tok({ n: total, d }, true) + ' ถาด ให้เป็นชิ้น',
      say: 'แตะพายเต็มถาด เพื่อผ่าเป็น ' + d + ' ชิ้นเท่ากัน',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div><div class="label-row hidden"><div class="sign-lbl">' + F.mxHTML(w, n, d) + '<span class="eq">=</span></div><div class="fi-host"></div></div>' + goBtn('ติดป้าย') + '<div class="rule-host"></div>';
        const go = el.querySelector('.act-go');
        go.parentNode.classList.add('hidden');
        ct = W.cutter(el.querySelector('.w-host'), {
          w, n, d, flavor: 'lemon',
          onDone: () => {
            cut = true;
            el.querySelector('.label-row').classList.remove('hidden');
            go.parentNode.classList.remove('hidden');
            api.say('นับชิ้นทั้งหมดดูนะ ได้กี่ชิ้น ชิ้นละ ' + tok({ n: 1, d }) + ' ถาด');
          }
        });
        setTimeout(() => ct.pulse(), 400);
        const fi = ui.fracInput({ n: { value: 0 }, d: { value: d, fixed: true } });
        el.querySelector('.fi-host').appendChild(fi.el);
        go.addEventListener('click', () => {
          const v = fi.get();
          if (v.n === total) {
            el.querySelector('.rule-host').innerHTML = '<div class="rule-card"><b>ทางลัด</b> จำนวนเต็ม × ตัวส่วน + ตัวเศษ<div class="rule-eq">' + w + ' × ' + d + ' + ' + n + ' = ' + total + '</div></div>';
            api.correct(tok({ n: total, d }, true) + ' = ' + tok({ n: total, d }) + ' ทางลัดคือ ' + w + ' × ' + d + ' + ' + n + ' = ' + total, go);
          } else api.wrong('ได้ ' + tok({ n: v.n, d }) + ' ยังไม่ตรงนะ ลองนับชิ้นอีกครั้ง', go);
        });
      },
      hint(l) {
        if (!cut) { ct.pulse(); return 'แตะพายเต็มถาดให้ครบทุกถาดก่อนนะ'; }
        return [
          'นับชิ้นพายทั้งหมด ทั้งถาดที่ผ่าแล้วและถาดเดิม',
          '1 ถาดเต็มมี ' + d + ' ชิ้น ' + w + ' ถาดมี ' + (w * d) + ' ชิ้น',
          (w * d) + ' ชิ้น บวกอีก ' + n + ' ชิ้น ได้กี่ชิ้น?'
        ][l - 1];
      },
      answer: tok({ n: total, d }, true) + ' = ' + tok({ n: total, d })
    };
  }

  function tToMixed(f, level) {
    let el0 = null;
    const m = F.toMixed(f);
    return {
      skill: 'mixed',
      title: 'เปลี่ยนป้าย ' + tok(f) + ' เป็นจำนวนคละ',
      say: level === 1 ? 'ดูภาพพายช่วยได้ ได้กี่ถาดเต็ม เหลือเท่าไร?' : 'พายถูกคลุมผ้าไว้ คิดจากตัวเลขดูนะ',
      render(el, api) {
        el0 = el;
        el.innerHTML = coverable(f.n, f.d, level >= 2, 'lemon') +
          '<div class="label-row"><div class="sign-lbl">' + F.frHTML(f.n, f.d) + '<span class="eq">=</span></div><div class="fi-host"></div></div>' + goBtn('ติดป้าย');
        const fi = ui.fracInput({ whole: { value: 0 }, n: { value: 0 }, d: level >= 3 ? { value: 1 } : { value: f.d, fixed: true } });
        el.querySelector('.fi-host').appendChild(fi.el);
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const v = fi.get();
          const ok = v.n > 0 && v.n < v.d && F.eq(F.mixed(v.w, v.n, v.d), f);
          if (ok) { uncover(el); api.correct(tok(f) + ' = ' + tok(f, true) + ' ได้ ' + m.w + ' ถาดเต็ม เหลือ ' + tok({ n: m.n, d: f.d }) + ' ถาด', go); }
          else if (v.n >= v.d && v.d > 0) api.wrong('ส่วนที่เป็นเศษส่วน ต้องไม่ถึง 1 ถาดนะ', go);
          else api.wrong('', go);
        });
      },
      hint(l) {
        if (l >= 2) uncover(el0);
        return [
          '1 ถาดมี ' + f.d + ' ชิ้น ลองจับกลุ่ม กลุ่มละ ' + f.d + ' ชิ้น',
          'ดูพายสิ มีกี่ถาดเต็ม? เหลือกี่ชิ้น?',
          f.n + ' ÷ ' + f.d + ' = ' + m.w + ' เศษ ' + m.n + ' ลองเขียนเป็นจำนวนคละ'
        ][l - 1];
      },
      answer: tok(f) + ' = ' + tok(f, true) + ' เพราะ ' + f.n + ' ÷ ' + f.d + ' = ' + m.w + ' เศษ ' + m.n
    };
  }

  function tToImproper(f, level) {
    let el0 = null;
    const m = F.toMixed(f);
    return {
      skill: 'mixed',
      title: 'เปลี่ยนป้าย ' + tok(f, true) + ' เป็นเศษเกิน',
      say: level === 1 ? 'นับชิ้นพายทั้งหมดดูนะ' : 'ลองใช้ทางลัด: จำนวนเต็ม × ตัวส่วน + ตัวเศษ',
      render(el, api) {
        el0 = el;
        el.innerHTML = coverable(f.n, f.d, level >= 2, 'lemon') +
          '<div class="label-row"><div class="sign-lbl">' + F.mxHTML(m.w, m.n, m.d) + '<span class="eq">=</span></div><div class="fi-host"></div></div>' + goBtn('ติดป้าย');
        const fi = ui.fracInput({ n: { value: 0, max: 60 }, d: level >= 3 ? { value: 1 } : { value: f.d, fixed: true } });
        el.querySelector('.fi-host').appendChild(fi.el);
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const v = fi.get();
          if (v.n >= v.d && F.eq({ n: v.n, d: v.d }, f)) { uncover(el); api.correct(tok(f, true) + ' = ' + tok(f) + ' เพราะ ' + m.w + ' × ' + f.d + ' + ' + m.n + ' = ' + f.n, go); }
          else api.wrong('', go);
        });
      },
      hint(l) {
        if (l >= 2) uncover(el0);
        return [
          '1 ถาดเต็ม = ' + f.d + ' ชิ้น แล้ว ' + m.w + ' ถาดเต็มมีกี่ชิ้น?',
          'นับชิ้นทั้งหมดในภาพ ชิ้นละ ' + tok({ n: 1, d: f.d }) + ' ถาด',
          m.w + ' × ' + f.d + ' + ' + m.n + ' = ? ใส่ไว้ที่ตัวเศษ'
        ][l - 1];
      },
      answer: tok(f, true) + ' = ' + tok(f) + ' เพราะ ' + m.w + ' × ' + f.d + ' + ' + m.n + ' = ' + f.n
    };
  }

  function genMixed(level) {
    let d, w;
    if (level === 1) { d = R(2, 4); w = R(1, 2); }
    else if (level === 2) { d = R(3, 6); w = R(1, 3); }
    else { d = R(4, 9); w = R(2, 5); }
    return F.mixed(w, coprimeTo(d), d);
  }
  /* ตัวเศษที่ทำให้ r/d เป็นอย่างต่ำ */
  function coprimeTo(d) {
    let r;
    do { r = R(1, d - 1); } while (F.gcd(r, d) !== 1);
    return r;
  }

  const STAGE2 = {
    id: 2, name: 'โต๊ะแพ็กกล่อง', topic: 'จำนวนคละ และความสัมพันธ์กับเศษเกิน', color: '#ffc94d', flavor: 'lemon',
    intro: [
      { who: 'pp', text: 'มาถึงโต๊ะแพ็กกล่องแล้ว! ที่นี่แพ็กพายที่เกิน 1 ถาด', mood: 'cheer' },
      { who: 'pp', text: 'พาย 1 ถาดเต็ม กับอีกครึ่งถาด เขียนว่า {1 1/2}', show: '[PIE 3/2 lemon]<div class="illus-lbl">{1 1/2} ถาด</div>' },
      { who: 'pp', text: 'แบบนี้เรียกว่า **จำนวนคละ** อ่านว่า "หนึ่งเศษหนึ่งส่วนสอง"', show: '<div class="illus-lbl big">{1 1/2} = {3/2}</div><div class="illus-sub">จำนวนคละ เขียนเป็นเศษเกินได้</div>' },
      { who: 'mix', text: 'ข้าแกะชิ้นพายออกจากถาดหมดแล้ว แพ็กใหม่ไม่ทันหรอก!', last: 'แพ็กเลย' }
    ],
    learn: [() => tPack(7, 3), () => tCut(1, 3, 4)],
    missions: 5,
    gen(level, i) {
      const f = genMixed(level);
      return i % 2 === 0 ? tToMixed(f, level) : tToImproper(f, level);
    },
    recap: [
      '**จำนวนคละ** = จำนวนเต็มกับเศษส่วนแท้ เช่น {2 1/3}',
      'เศษเกิน เป็นจำนวนคละ: ตัวเศษ ÷ ตัวส่วน เช่น {7/3} = {2 1/3}',
      'จำนวนคละ เป็นเศษเกิน: จำนวนเต็ม × ตัวส่วน + ตัวเศษ เช่น {1 3/4} = {7/4}'
    ],
    book: [
      '**จำนวนคละ** คือ จำนวนเต็มกับเศษส่วนแท้ เช่น {1 1/2} [pie 3/2]',
      '**เศษเกิน เป็น จำนวนคละ** {7/3}: 7 ÷ 3 = 2 เศษ 1 จึงได้ {2 1/3}',
      '**จำนวนคละ เป็น เศษเกิน** {1 3/4}: 1 × 4 + 3 = 7 จึงได้ {7/4}',
      'ตัวส่วนไม่เปลี่ยน เพราะขนาดชิ้นพายยังเท่าเดิม'
    ],
    teacher: [
      'ทำไมตัวส่วนจึงไม่เปลี่ยน เมื่อเปลี่ยนเศษเกินเป็นจำนวนคละ?',
      'ถ้ามีพาย {12/5} ถาด จะแบ่งให้เพื่อนได้กี่ถาดเต็ม?'
    ]
  };

  /* ════════════════════════════════════════════════
     STAGE 3 : เครื่องตัดวิเศษ — เท่ากัน / อย่างต่ำ / จำนวนนับ
     ════════════════════════════════════════════════ */
  function tTargetDen(a, b, target, ops, o) {
    o = o || {};
    let mc = null;
    return {
      skill: 'equiv',
      title: 'ทำพาย ' + tok({ n: a, d: b }) + ' ให้ตัวส่วนเป็น ' + target,
      say: o.say || 'ใช้ปุ่มตัดชิ้น จนตัวส่วนเป็น ' + target + ' แล้วกดส่งพาย',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>' + goBtn('ส่งพาย');
        mc = W.machine(el.querySelector('.w-host'), {
          n: a, d: b, ops, flavor: 'blue',
          onInvalid: msg => api.say(msg, 'think')
        });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const v = mc.get();
          if (v.d === target) {
            mc.lock();
            api.correct(o.ok || (tok({ n: a, d: b }) + ' = ' + tok(v) + ' พายเท่าเดิม! เป็น **เศษส่วนที่เท่ากัน**'), go);
          } else api.wrong('ตอนนี้ตัวส่วนเป็น ' + v.d + ' ยังไม่ใช่ ' + target + ' นะ', go);
        });
      },
      hint(l) {
        if (l === 2) mc.pulse();
        const k = target / b;
        return [
          b + ' คูณด้วยเท่าไร ถึงได้ ' + target + '?',
          'ลองกดปุ่มตัดชิ้น ถ้าเกินก็กดเริ่มใหม่ได้',
          b + ' × ' + k + ' = ' + target + ' ลองหาปุ่มที่ทำให้ได้ × ' + k
        ][l - 1];
      },
      answer: tok({ n: a, d: b }) + ' = ' + tok({ n: a * target / b, d: target }) + ' (คูณทั้งตัวเศษและตัวส่วนด้วย ' + (target / b) + ')'
    };
  }

  function tSimplest(n, d, ops, o) {
    o = o || {};
    let mc = null;
    const s = F.simplify({ n, d });
    const g = F.gcd(n, d);
    return {
      skill: 'simplest',
      title: 'รวมชิ้นพาย ' + tok({ n, d }) + ' ให้เป็น **อย่างต่ำ**',
      say: o.say || 'กดรวมชิ้น จนรวมต่อไม่ได้ แล้วกดส่งพาย',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>' + goBtn('ส่งพาย');
        mc = W.machine(el.querySelector('.w-host'), {
          n, d, ops, flavor: 'blue',
          onInvalid: msg => api.say(msg, 'think')
        });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const v = mc.get();
          if (F.isSimplest(v)) {
            mc.lock();
            api.correct(o.ok || (tok({ n, d }) + ' = ' + tok(v) + ' รวมต่อไม่ได้แล้ว เรียกว่า **เศษส่วนอย่างต่ำ**'), go);
          } else {
            const k = [2, 3, 5, 7].find(p => v.n % p === 0 && v.d % p === 0);
            api.wrong('ยังรวมต่อได้อีกนะ ' + v.n + ' กับ ' + v.d + ' หารด้วย ' + k + ' ลงตัวทั้งคู่', go);
          }
        });
      },
      hint(l) {
        if (l === 2) mc.pulse();
        return [
          'มีจำนวนไหนที่หารทั้ง ' + n + ' และ ' + d + ' ลงตัวบ้าง?',
          'ลองกดปุ่มรวมชิ้น ถ้ารวมไม่ได้ เครื่องจะสั่นบอก',
          n + ' และ ' + d + ' หารด้วย ' + g + ' ลงตัวทั้งคู่'
        ][l - 1];
      },
      answer: tok({ n, d }) + ' = ' + tok(s) + ' (หารทั้งตัวเศษและตัวส่วนด้วย ' + g + ')'
    };
  }

  function tWhole(n, d, level, reverse) {
    let el0 = null;
    const k = n / d;
    return {
      skill: 'whole',
      title: reverse ? 'จำนวนนับ ' + k + ' เขียนเป็นเศษส่วนที่ตัวส่วนเป็น ' + d : 'พาย ' + tok({ n, d }) + ' เท่ากับกี่ถาดเต็ม?',
      say: reverse ? 'พายเต็ม ' + k + ' ถาด ถ้าตัดถาดละ ' + d + ' ชิ้น จะได้กี่ชิ้น?' : 'ดูว่าได้พายเต็มกี่ถาด ใส่ตัวเลขเลย',
      render(el, api) {
        el0 = el;
        let inner;
        let stp;
        if (reverse) {
          inner = coverable(n, d, level >= 3, 'blue') + '<div class="label-row"><div class="sign-lbl"><span class="num-whole">' + k + '</span><span class="eq">=</span></div><div class="fi-host"></div></div>';
        } else {
          inner = coverable(n, d, level >= 2, 'blue') + '<div class="label-row"><div class="sign-lbl">' + F.frHTML(n, d) + '<span class="eq">=</span></div><div class="fi-host"></div><span class="unit-lbl">ถาด</span></div>';
        }
        el.innerHTML = inner + goBtn('ติดป้าย');
        if (reverse) stp = ui.fracInput({ n: { value: 0, max: 60 }, d: { value: d, fixed: true } });
        else { stp = ui.stepper({ value: 0, max: 12, cls: 'big' }); }
        el.querySelector('.fi-host').appendChild(stp.el);
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const v = reverse ? stp.get().n : stp.get();
          if (v === (reverse ? n : k)) {
            uncover(el);
            api.correct(tok({ n, d }) + ' = ' + k + ' เพราะ ' + n + ' ÷ ' + d + ' = ' + k + ' เป็น **เศษส่วนที่เท่ากับจำนวนนับ**', go);
          } else api.wrong('', go);
        });
      },
      hint(l) {
        if (l >= 2) uncover(el0);
        return reverse ? [
          '1 ถาดเต็ม ตัดเป็น ' + d + ' ชิ้น',
          k + ' ถาด ถาดละ ' + d + ' ชิ้น',
          k + ' × ' + d + ' = ?'
        ][l - 1] : [
          '1 ถาดเต็มมี ' + d + ' ชิ้น',
          'ดูภาพพายสิ มีพายเต็มกี่ถาด?',
          n + ' ÷ ' + d + ' = ?'
        ][l - 1];
      },
      answer: tok({ n, d }) + ' = ' + k + ' เพราะ ' + n + ' ÷ ' + d + ' = ' + k
    };
  }

  function tEquivNumeric(a, b, target) {
    let mc = null;
    const ans = a * target / b;
    return {
      skill: 'equiv',
      title: tok({ n: a, d: b }) + ' เท่ากับเศษส่วนใด ที่ตัวส่วนเป็น ' + target,
      say: 'คิดตัวเศษแล้วใส่ป้าย ใช้เครื่องตัดตรวจคำตอบได้นะ',
      render(el, api) {
        el.innerHTML = '<div class="label-row"><div class="sign-lbl">' + F.frHTML(a, b) + '<span class="eq">=</span></div><div class="fi-host"></div></div>' + goBtn('ติดป้าย') + '<div class="w-host tool-box"></div>';
        const fi = ui.fracInput({ n: { value: 0, max: 60 }, d: { value: target, fixed: true } });
        el.querySelector('.fi-host').appendChild(fi.el);
        mc = W.machine(el.querySelector('.w-host'), { n: a, d: b, ops: ['x2', 'x3', 'x4'], flavor: 'blue', maxD: 36, onInvalid: msg => api.say(msg, 'think') });
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          if (fi.get().n === ans) {
            mc.set(ans, target, '×' + (target / b));
            mc.lock();
            api.correct(tok({ n: a, d: b }) + ' = ' + tok({ n: ans, d: target }) + ' คูณทั้งตัวเศษและตัวส่วนด้วย ' + (target / b), go);
          } else api.wrong('', go);
        });
      },
      hint(l) {
        if (l === 2) mc.pulse();
        return [
          'ตัวส่วน ' + b + ' กลายเป็น ' + target + ' คูณด้วยเท่าไร?',
          'ลองใช้เครื่องตัดด้านล่าง ทำตัวส่วนให้เป็น ' + target,
          'ตัวส่วน × ' + (target / b) + ' ตัวเศษก็ต้อง × ' + (target / b) + ' ด้วย'
        ][l - 1];
      },
      answer: tok({ n: a, d: b }) + ' = ' + tok({ n: ans, d: target })
    };
  }

  const STAGE3 = {
    id: 3, name: 'เครื่องตัดวิเศษ', topic: 'เศษส่วนที่เท่ากัน อย่างต่ำ และเท่ากับจำนวนนับ', color: '#8fb8ff', flavor: 'blue',
    intro: [
      { who: 'pp', text: 'นี่คือเครื่องตัดวิเศษ! ตัดชิ้นให้เล็กลง หรือรวมชิ้นให้ใหญ่ขึ้นได้', mood: 'cheer' },
      { who: 'pp', text: 'แต่ปริมาณพายจะเท่าเดิมเสมอ ลองดูกันเลย', show: '<div class="illus-row"><div>[PIE 1/2 blue]<div class="illus-lbl">{1/2}</div></div><div class="illus-eq">=</div><div>[PIE 2/4 blue]<div class="illus-lbl">{2/4}</div></div></div>' },
      { who: 'mix', text: 'ฮึ่ม! ลูกค้าอยากได้ชิ้นแบบใหม่ เครื่องนี้ใช้ยากนะจะบอกให้', last: 'ลองใช้เครื่อง' }
    ],
    learn: [
      () => tTargetDen(1, 2, 6, ['x2', 'x3'], {
        say: 'ลูกค้าอยากได้ชิ้นเล็กลง ทำ {1/2} ให้ตัวส่วนเป็น 6',
        ok: '{1/2} = {3/6} พายเท่าเดิม! คูณทั้งตัวเศษและตัวส่วนด้วย 3 ได้ **เศษส่วนที่เท่ากัน**'
      }),
      () => tSimplest(6, 8, ['d2', 'd3'], {
        say: 'ทีนี้รวมชิ้นให้ใหญ่ที่สุด กดรวมชิ้นดูนะ',
        ok: '{6/8} = {3/4} รวมต่อไม่ได้แล้ว เรียกว่า **เศษส่วนอย่างต่ำ**'
      }),
      () => tWhole(8, 4, 1, false)
    ],
    missions: 5,
    gen(level, i) {
      const type = ['equiv', 'simplest', 'whole', 'equiv', 'simplest'][i];
      if (type === 'equiv') {
        if (level === 3) {
          const f = simpleProper(6), k = R(2, 5);
          return tEquivNumeric(f.n, f.d, f.d * k);
        }
        const f = level === 1 ? pick([{ n: 1, d: 2 }, { n: 1, d: 3 }, { n: 2, d: 3 }, { n: 1, d: 4 }, { n: 3, d: 4 }]) : simpleProper(5);
        const k = level === 1 ? pick([2, 3]) : pick([2, 3, 4]);
        return tTargetDen(f.n, f.d, f.d * k, level === 1 ? ['x2', 'x3'] : ['x2', 'x3', 'x4']);
      }
      if (type === 'simplest') {
        const f = simpleProper(level === 3 ? 7 : 5);
        const k = level === 1 ? 2 : level === 2 ? pick([3, 4]) : pick([4, 6, 9, 10]);
        return tSimplest(f.n * k, f.d * k, level === 3 ? ['d2', 'd3', 'd5'] : ['d2', 'd3']);
      }
      const d = level === 1 ? R(2, 4) : R(3, 6);
      const k = level === 1 ? R(1, 3) : R(2, 4);
      return tWhole(k * d, d, level, level === 3);
    },
    recap: [
      '**เศษส่วนที่เท่ากัน** คูณหรือหารทั้งตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน เช่น {1/2} = {3/6}',
      '**เศษส่วนอย่างต่ำ** ไม่มีจำนวนใด (นอกจาก 1) หารทั้งตัวเศษและตัวส่วนลงตัว เช่น {3/4}',
      '**เท่ากับจำนวนนับ** เมื่อตัวเศษหารด้วยตัวส่วนลงตัว เช่น {8/4} = 2'
    ],
    book: [
      '**เศษส่วนที่เท่ากัน** {1/2} = {2/4} = {3/6} [pie 1/2] [pie 2/4]',
      'คูณ (ตัดชิ้น) หรือ หาร (รวมชิ้น) ทั้งตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน',
      '**อย่างต่ำ** {6/8} หารด้วย 2 ได้ {3/4} หารต่อไม่ได้แล้ว',
      '**เท่ากับจำนวนนับ** {8/4} = 2 เพราะ 8 ÷ 4 = 2'
    ],
    teacher: [
      'ทำไมการตัดชิ้นพายให้เล็กลง จึงไม่ทำให้พายมากขึ้น?',
      'มีเศษส่วนกี่จำนวนที่เท่ากับ {1/2}? นักเรียนคิดว่ามีจำกัดไหม'
    ]
  };

  /* ════════════════════════════════════════════════
     STAGE 4 : ตาชั่งขนม — เปรียบเทียบ / เรียงลำดับ
     ════════════════════════════════════════════════ */
  function compareKind(a, b, amix, bmix) {
    if (amix || bmix || a.n >= a.d || b.n >= b.d) return 'mixed';
    if (a.d === b.d) return 'sameDen';
    if (a.n === b.n) return 'sameNum';
    return 'diff';
  }
  function explainCompare(a, b, amix, bmix) {
    const c = F.cmp(a, b);
    const A = tok(a, amix), B = tok(b, bmix);
    const kind = compareKind(a, b, amix, bmix);
    const tail = ' ดังนั้น ' + A + ' ' + sym(c) + ' ' + B;
    if (kind === 'sameDen') return 'ตัวส่วนเท่ากัน ดูตัวเศษ ' + a.n + ' ' + relWord(c) + ' ' + b.n + tail;
    if (kind === 'sameNum') return 'ตัวเศษเท่ากัน ตัวส่วนยิ่งมาก ชิ้นยิ่งเล็ก' + tail;
    if (kind === 'diff') {
      const L = F.lcm(a.d, b.d);
      return 'ทำส่วนให้เท่ากัน ' + tok({ n: a.n * L / a.d, d: L }) + ' กับ ' + tok({ n: b.n * L / b.d, d: L }) + tail;
    }
    const ma = F.toMixed(a), mb = F.toMixed(b);
    if (ma.w !== mb.w) return 'ดูจำนวนเต็มก่อน ' + ma.w + ' ถาด ' + relWord(Math.sign(ma.w - mb.w)) + ' ' + mb.w + ' ถาด' + tail;
    return 'จำนวนเต็มเท่ากัน จึงดูเศษส่วนที่เหลือ' + tail;
  }

  function tCompare(a, b, o) {
    o = o || {};
    let sc = null;
    const kind = compareKind(a, b, o.amix, o.bmix);
    const truth = F.cmp(a, b);
    const L = F.lcm(a.d, b.d);
    return {
      skill: 'compare',
      title: o.title || (tok(a, o.amix) + ' กับ ' + tok(b, o.bmix) + ' อันไหนมากกว่า?'),
      say: o.say || (o.showPies ? 'ดูพายแล้วเลือกเครื่องหมาย ตาชั่งจะพิสูจน์ให้ดู' : 'พายถูกปิดฝาไว้ ลองคิดจากตัวเลข แล้วเลือกเครื่องหมาย'),
      mixSay: o.mixSay,
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        sc = W.scale(el.querySelector('.w-host'), {
          a, b, amix: o.amix, bmix: o.bmix, showPies: o.showPies, slicers: kind === 'diff' && o.slicers !== false,
          whoA: o.whoA, whoB: o.whoB, flavorA: 'choco', flavorB: 'blue',
          onSameDen: (x, y) => api.say('ตัวส่วนเท่ากันแล้ว! ' + tok(x) + ' กับ ' + tok(y) + ' ทีนี้เทียบง่ายแล้ว'),
          onPick: (s, btn) => {
            if (s === truth) {
              sc.markPick(btn, true);
              sc.reveal();
              setTimeout(() => sc.tilt(truth), 250);
              sc.lock();
              api.correct(o.ok || explainCompare(a, b, o.amix, o.bmix), btn);
              if (o.afterOk) setTimeout(() => { if (api.isCurrent()) o.afterOk(api); }, 2600);
            } else {
              sc.markPick(btn, false);
              api.wrong('', btn);
            }
          }
        });
      },
      hint(l) {
        if (l >= 2) sc.reveal();
        const A = tok(a, o.amix), B = tok(b, o.bmix);
        if (kind === 'sameDen') return ['ตัวส่วนเท่ากัน ชิ้นขนาดเท่ากัน ลองดูที่ตัวเศษ', 'ดูพายสิ จานไหนมีชิ้นมากกว่า?', a.n + ' ชิ้น กับ ' + b.n + ' ชิ้น อันไหนมากกว่า?'][l - 1];
        if (kind === 'sameNum') return ['ตัวเศษเท่ากัน ลองดูขนาดของชิ้น', 'ตัวส่วนยิ่งมาก พายยิ่งถูกตัดเป็นชิ้นเล็ก', 'ชิ้น ' + tok({ n: 1, d: a.d }) + ' กับ ' + tok({ n: 1, d: b.d }) + ' ชิ้นไหนใหญ่กว่า?'][l - 1];
        if (kind === 'diff') {
          if (l === 1) sc.pulseTools();
          return ['ตัวส่วนไม่เท่ากัน ลองกดปุ่มตัดใต้จาน ทำให้ตัวส่วนเท่ากันก่อน', 'ลองทำให้ตัวส่วนเป็น ' + L + ' ทั้งสองจาน',
            A + ' = ' + tok({ n: a.n * L / a.d, d: L }) + ' และ ' + B + ' = ' + tok({ n: b.n * L / b.d, d: L })][l - 1];
        }
        const ma = F.toMixed(a), mb = F.toMixed(b);
        return [
          'ถ้ามีเศษเกิน ลองเปลี่ยนเป็นจำนวนคละก่อน แล้วดูจำนวนเต็ม',
          A + ' = ' + tok(a, true) + ' และ ' + B + ' = ' + tok(b, true),
          ma.w === mb.w ? 'จำนวนเต็มเท่ากัน ลองเทียบ ' + tok({ n: ma.n, d: ma.d }) + ' กับ ' + tok({ n: mb.n, d: mb.d }) : 'จำนวนเต็ม ' + ma.w + ' กับ ' + mb.w + ' อันไหนมากกว่า?'
        ][l - 1];
      },
      answer: explainCompare(a, b, o.amix, o.bmix)
    };
  }

  function tOrder(items, dir, o) {
    o = o || {};
    let sh = null, el0 = null;
    const asc = dir !== 'desc';
    const sorted = items.slice().sort((x, y) => F.cmp(x.f, y.f) * (asc ? 1 : -1));
    const L = items.reduce((acc, it) => F.lcm(acc, it.f.d), 1);
    return {
      skill: 'order',
      title: o.title || ('เรียงพายจาก' + (asc ? 'น้อยไปมาก' : 'มากไปน้อย')),
      say: o.say || 'แตะการ์ดเพื่อวางบนชั้นตามลำดับ แตะซ้ำเพื่อเอาออก',
      render(el, api) {
        el0 = el;
        el.innerHTML = '<div class="w-host"></div>' + goBtn('ตรวจลำดับ');
        const go = el.querySelector('.act-go');
        go.disabled = true;
        sh = W.shelf(el.querySelector('.w-host'), { items, dir, pies: !!o.pies, onChange: full => { go.disabled = !full; } });
        go.addEventListener('click', () => {
          if (!sh.full()) return;
          if (sh.check()) {
            sh.lock();
            sh.proof();
            api.correct('เส้นจำนวนยืนยันแล้ว! ยิ่งอยู่ทางขวา ยิ่งมาก', go);
          } else api.wrong('ช่องที่กระพริบ ยังสลับกันอยู่นะ', go);
        });
      },
      hint(l) {
        if (l === 1) return asc ? 'หาตัวที่น้อยที่สุดก่อน แล้วค่อยหาตัวถัดไป' : 'หาตัวที่มากที่สุดก่อน แล้วค่อยหาตัวถัดไป';
        if (l === 2) return 'ลองเปลี่ยนเศษเกินเป็นจำนวนคละ หรือทำตัวส่วนให้เท่ากันก่อน';
        return 'ทำส่วนเป็น ' + L + ': ' + items.map(it => tok(it.f, it.mixed) + ' = ' + tok({ n: it.f.n * L / it.f.d, d: L })).join('  ');
      },
      solve() { sh.solve(); sh.lock(); sh.proof(); },
      answer: 'เรียงได้ ' + sorted.map(it => tok(it.f, it.mixed)).join(asc ? ' < ' : ' > ')
    };
  }

  function genCompare(level) {
    let a, b, amix = false, bmix = false, guard = 0;
    do {
      if (level === 1) {
        if (Math.random() < 0.5) { const d = R(3, 8); a = { n: R(1, d - 1), d }; b = { n: R(1, d - 1), d }; }
        else { const n = R(1, 3); a = { n, d: R(n + 1, 8) }; b = { n, d: R(n + 1, 8) }; }
      } else if (level === 2) {
        if (Math.random() < 0.6) {
          a = simpleProper(6); b = simpleProper(6);
          if (Math.random() < 0.25) { const k = pick([2, 3]); b = { n: a.n * k, d: a.d * k }; }
        } else {
          const d = R(3, 6);
          a = F.mixed(R(1, 3), coprimeTo(d), d); b = F.mixed(R(1, 3), coprimeTo(d), d);
          amix = bmix = true;
        }
      } else {
        const d1 = R(2, 6), d2 = R(2, 6);
        const w = R(1, 2);
        a = F.mixed(w, coprimeTo(d1), d1);
        b = { n: w * d2 + coprimeTo(d2), d: d2 };
        amix = true;
      }
      guard++;
    } while (guard < 30 && (a.n === b.n && a.d === b.d || F.lcm(a.d, b.d) > 30));
    if (Math.random() < 0.5) return { a: b, b: a, amix: bmix, bmix: amix };
    return { a, b, amix, bmix };
  }

  function genOrder(level) {
    let items, guard = 0;
    do {
      if (level === 1) {
        const d = R(4, 8);
        items = F.shuffle([1, 2, 3, 4, 5, 6, 7].filter(x => x < d)).slice(0, 3).map(n => ({ f: { n, d } }));
      } else if (level === 2) {
        if (Math.random() < 0.5) {
          const n = R(1, 3);
          items = F.shuffle([2, 3, 4, 5, 6, 8, 10].filter(d => d > n)).slice(0, 3).map(d => ({ f: { n, d } }));
        } else {
          items = F.shuffle([{ n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 3, d: 8 }, { n: 5, d: 8 }, { n: 7, d: 8 }, { n: 1, d: 8 }]).slice(0, 4).map(f => ({ f }));
        }
      } else {
        const pool = [];
        for (let k = 0; k < 6; k++) {
          const d = pick([2, 3, 4, 6]);
          const f = { n: R(1, 3 * d - 1), d };
          if (f.n % f.d === 0 || !F.isSimplest(f)) continue;
          pool.push({ f, mixed: f.n > f.d && Math.random() < 0.5 });
        }
        items = F.shuffle(distinctBy(pool, it => F.value(it.f).toFixed(4))).slice(0, 4);
      }
      items = distinctBy(items, it => F.value(it.f).toFixed(4));
      guard++;
    } while (guard < 30 && items.length < (level === 1 ? 3 : level === 2 ? 3 : 4));
    return items;
  }

  const STAGE4 = {
    id: 4, name: 'ตาชั่งขนม', topic: 'การเปรียบเทียบ และเรียงลำดับเศษส่วน จำนวนคละ', color: '#c79a6b', flavor: 'choco',
    intro: [
      { who: 'pp', text: 'ตาชั่งวิเศษนี้ บอกได้ว่าพายจานไหนมากกว่า', mood: 'cheer' },
      { who: 'pp', text: 'แต่เราต้องเลือกเครื่องหมายก่อน แล้วตาชั่งจะพิสูจน์ให้ดู!' },
      { who: 'pp', text: 'เครื่องหมาย 3 แบบ: มากกว่า เท่ากับ น้อยกว่า', show: '<div class="illus-signs"><span><b>&gt;</b>มากกว่า</span><span><b>=</b>เท่ากับ</span><span><b>&lt;</b>น้อยกว่า</span></div>' },
      { who: 'mix', text: 'ข้าชั่งเองก็ได้ ตัวเลขใหญ่กว่าก็ชนะสิ ง่ายจะตาย!', last: 'มาพิสูจน์กัน' }
    ],
    learn: [
      () => tCompare({ n: 3, d: 5 }, { n: 2, d: 5 }, { showPies: true, say: 'พายสองจานนี้ จานไหนมากกว่า? เลือกเครื่องหมายเลย' }),
      () => tCompare({ n: 1, d: 5 }, { n: 1, d: 3 }, {
        showPies: true,
        mixSay: '{1/5} ต้องมากกว่า {1/3} แน่นอน เพราะ 5 มากกว่า 3!',
        say: 'มิกซ์พูดถูกไหมนะ? ดูขนาดชิ้นพาย แล้วเลือกเครื่องหมาย',
        ok: 'ตัวเศษเท่ากัน ตัวส่วนยิ่งมาก ชิ้นยิ่งเล็ก! {1/5} < {1/3}',
        afterOk: api => api.mix('อ๊ะ! ชิ้นส่วนห้า เล็กกว่าจริงด้วย...', 'oops')
      }),
      () => tCompare({ n: 2, d: 3 }, { n: 3, d: 4 }, {
        showPies: true,
        say: 'ตัวส่วนไม่เท่ากัน! กดปุ่มตัดใต้จาน ทำให้ตัวส่วนเท่ากันก่อนนะ'
      }),
      () => tCompare(F.mixed(2, 1, 4), F.mixed(1, 3, 4), { amix: true, bmix: true, showPies: true, say: 'จำนวนคละ ดูจำนวนเต็มก่อนนะ' }),
      () => tOrder([{ f: { n: 2, d: 4 } }, { f: { n: 1, d: 4 } }, { f: { n: 3, d: 4 } }], 'asc', { pies: true })
    ],
    missions: 5,
    gen(level, i) {
      if (i === 2 || i === 4) {
        const dir = level === 1 ? 'asc' : pick(['asc', 'desc']);
        return tOrder(genOrder(level), dir, { pies: level === 1 });
      }
      const c = genCompare(level);
      return tCompare(c.a, c.b, { amix: c.amix, bmix: c.bmix, showPies: level === 1 });
    },
    recap: [
      'ตัวส่วนเท่ากัน ดูตัวเศษ: {3/5} > {2/5}',
      'ตัวเศษเท่ากัน ตัวส่วนยิ่งมาก ชิ้นยิ่งเล็ก: {1/5} < {1/3}',
      'ตัวส่วนไม่เท่ากัน ทำส่วนให้เท่ากันก่อน / จำนวนคละ ดูจำนวนเต็มก่อน'
    ],
    book: [
      '**ตัวส่วนเท่ากัน** ดูตัวเศษ {3/5} > {2/5}',
      '**ตัวเศษเท่ากัน** ตัวส่วนมาก ชิ้นเล็ก {1/5} < {1/3} [pie 1/5] [pie 1/3]',
      '**ตัวส่วนไม่เท่ากัน** ทำให้เท่ากันก่อน {2/3} = {8/12} และ {3/4} = {9/12}',
      '**จำนวนคละ** ดูจำนวนเต็มก่อน {2 1/4} > {1 3/4}',
      '**เรียงลำดับ** ยิ่งอยู่ทางขวาของเส้นจำนวน ยิ่งมาก'
    ],
    teacher: [
      'ทำไม {1/5} จึงน้อยกว่า {1/3} ทั้งที่ 5 มากกว่า 3?',
      'มีวิธีเปรียบเทียบ {5/4} กับ {1 1/2} ได้กี่วิธี?'
    ]
  };

  /* ════════════════════════════════════════════════
     STAGE 5 : เทศกาลแบ่งพาย — ภารกิจสุดท้าย (ประยุกต์ทุกเรื่อง)
     ════════════════════════════════════════════════ */
  const fv = (n, d) => ({ n, d });
  const CLAIMS = {
    1: [
      { t: '{7/7} เป็นเศษส่วนแท้', truth: false, skill: 'proper', show: [{ f: fv(7, 7) }], ex: 'ตัวเศษเท่ากับตัวส่วน ได้ 1 ถาดพอดี จึงเป็น **เศษเกิน**', h: 'เศษส่วนแท้ ตัวเศษต้องน้อยกว่าตัวส่วน' },
      { t: '{10/5} เท่ากับจำนวนนับ 2', truth: true, skill: 'whole', show: [{ f: fv(10, 5) }], ex: '10 ÷ 5 = 2 ได้พายเต็ม 2 ถาดพอดี', h: '1 ถาดมี 5 ชิ้น 10 ชิ้นได้กี่ถาด?' },
      { t: '{1/8} มากกว่า {1/6} เพราะ 8 มากกว่า 6', truth: false, skill: 'compare', show: [{ f: fv(1, 8) }, { f: fv(1, 6) }], ex: 'ตัวเศษเท่ากัน ตัวส่วนยิ่งมาก ชิ้นยิ่งเล็ก {1/8} < {1/6}', h: 'นึกภาพพายตัด 8 ชิ้น กับตัด 6 ชิ้น ชิ้นไหนใหญ่กว่า?' },
      { t: '{3/5} เป็นเศษส่วนแท้', truth: true, skill: 'proper', show: [{ f: fv(3, 5) }], ex: 'ตัวเศษ 3 น้อยกว่าตัวส่วน 5 ไม่ถึง 1 ถาด', h: 'เทียบตัวเศษกับตัวส่วนดูนะ' }
    ],
    2: [
      { t: '{2/6} กับ {1/3} ไม่เท่ากัน เพราะตัวเลขไม่เหมือนกัน', truth: false, skill: 'equiv', show: [{ f: fv(2, 6) }, { f: fv(1, 3) }], ex: '{1/3} คูณทั้งเศษและส่วนด้วย 2 ได้ {2/6} พายเท่ากันพอดี', h: 'ลองคูณ {1/3} ทั้งตัวเศษและตัวส่วนด้วย 2' },
      { t: '{9/4} เท่ากับ {2 1/4}', truth: true, skill: 'mixed', show: [{ f: fv(9, 4) }], ex: '9 ÷ 4 = 2 เศษ 1 ได้ 2 ถาดเต็ม กับอีก {1/4} ถาด', h: '9 ÷ 4 ได้เท่าไร เหลือเศษเท่าไร?' },
      { t: '{4/6} เป็นเศษส่วนอย่างต่ำแล้ว', truth: false, skill: 'simplest', show: [{ f: fv(4, 6) }, { f: fv(2, 3) }], ex: '4 และ 6 หารด้วย 2 ลงตัว ได้ {2/3} จึงยังไม่ใช่อย่างต่ำ', h: 'มีจำนวนไหนหารทั้ง 4 และ 6 ลงตัวไหม?' },
      { t: '{1 2/5} เท่ากับ {7/5}', truth: true, skill: 'mixed', show: [{ f: fv(7, 5), mixed: true }], ex: '1 × 5 + 2 = 7 จึงได้ {7/5}', h: 'ใช้ทางลัด จำนวนเต็ม × ตัวส่วน + ตัวเศษ' }
    ],
    3: [
      { t: '{2 1/3} น้อยกว่า {5/3}', truth: false, skill: 'compare', show: [{ f: fv(7, 3), mixed: true }, { f: fv(5, 3) }], ex: '{2 1/3} = {7/3} ซึ่งมากกว่า {5/3}', h: 'ลองเปลี่ยน {2 1/3} เป็นเศษเกินก่อน' },
      { t: '{3/4} มากกว่า {2/3}', truth: true, skill: 'compare', show: [{ f: fv(3, 4) }, { f: fv(2, 3) }], ex: '{3/4} = {9/12} และ {2/3} = {8/12} ดังนั้น {3/4} > {2/3}', h: 'ทำตัวส่วนให้เท่ากันเป็น 12 ก่อน' },
      { t: '{12/18} เขียนเป็นอย่างต่ำได้ {2/3}', truth: true, skill: 'simplest', show: [{ f: fv(12, 18) }, { f: fv(2, 3) }], ex: '12 และ 18 หารด้วย 6 ลงตัว ได้ {2/3}', h: 'ลองหารทั้ง 12 และ 18 ด้วย 6' },
      { t: '{15/4} เท่ากับ {3 1/4}', truth: false, skill: 'mixed', show: [{ f: fv(15, 4) }], ex: '15 ÷ 4 = 3 เศษ 3 จึงได้ {3 3/4} ไม่ใช่ {3 1/4}', h: '15 ÷ 4 เหลือเศษเท่าไร?' }
    ]
  };

  function tJudge(c) {
    let el0 = null;
    const proofHTML = () => '<div class="judge-proof">' + c.show.map(it =>
      '<div class="jp-item">' + art.pies(it.f.n, it.f.d, { flavor: 'berry', cls: 'small' }) + '<div class="jp-lbl">' + F.html(it.f, it.mixed) + '</div></div>').join('') + '</div>';
    return {
      skill: c.skill,
      title: 'มิกซ์พูดถูกหรือไม่?',
      mixSay: c.t,
      say: 'ป้ายของมิกซ์ถูกต้องไหม? เลือกแล้วพิสูจน์กัน',
      render(el, api) {
        el0 = el;
        el.innerHTML = '<div class="claim-card"><div class="claim-from">ป้ายของมิกซ์</div><div class="claim-text">' + ui.rich(c.t) + '</div></div>' +
          '<div class="judge-btns">' +
            '<button class="btn judge-yes" data-v="1">' + art.icon('check') + '<span>ถูกต้อง</span></button>' +
            '<button class="btn judge-no" data-v="0">' + art.icon('cross') + '<span>ไม่ถูกต้อง</span></button>' +
          '</div><div class="proof-host"></div>';
        el.querySelector('.judge-btns').addEventListener('click', e => {
          const b = e.target.closest('.btn');
          if (!b || api.isDone()) return;
          const pickTrue = b.dataset.v === '1';
          if (pickTrue === c.truth) {
            b.classList.add('right');
            el.querySelector('.proof-host').innerHTML = proofHTML();
            el.querySelector('.claim-card').classList.add(c.truth ? 'stamp-ok' : 'stamp-no');
            api.correct((c.truth ? 'ถูกต้อง! ' : 'ป้ายนี้ผิดจริง ๆ! ') + c.ex, b);
            setTimeout(() => api.mixMood(c.truth ? 'happy' : 'oops'), 300);
          } else api.wrong('', b);
        });
      },
      hint(l) {
        if (l >= 2 && !el0.querySelector('.judge-proof')) el0.querySelector('.proof-host').innerHTML = proofHTML();
        return [c.h, 'ดูภาพพายด้านล่างช่วยคิดนะ', c.h + ' แล้วเทียบกับป้ายของมิกซ์ทีละส่วน'][l - 1];
      },
      answer: (c.truth ? 'ป้ายนี้ถูกต้อง: ' : 'ป้ายนี้ไม่ถูกต้อง: ') + c.ex
    };
  }

  function tSign(f, level) {
    const m = F.toMixed(f);
    const r = F.simplify({ n: m.n, d: m.d });
    const g = F.gcd(m.n, m.d);
    return {
      skill: g > 1 ? 'simplest' : 'mixed',
      title: 'เหลือพาย ' + tok(f) + ' ถาด เขียนป้ายเป็นจำนวนคละ',
      say: 'ป้ายต้องเป็นจำนวนคละ และเศษส่วนต้องเป็น**อย่างต่ำ**ด้วยนะ',
      render(el, api) {
        el.innerHTML = coverable(f.n, f.d, level >= 2, 'berry') +
          '<div class="label-row"><div class="sign-lbl">' + F.frHTML(f.n, f.d) + '<span class="eq">=</span></div><div class="fi-host"></div></div>' + goBtn('ติดป้าย');
        const fi = ui.fracInput({ whole: { value: 0 }, n: { value: 0 }, d: { value: 1 } });
        el.querySelector('.fi-host').appendChild(fi.el);
        const go = el.querySelector('.act-go');
        go.addEventListener('click', () => {
          const v = fi.get();
          const equal = v.n > 0 && v.n < v.d && F.eq(F.mixed(v.w, v.n, v.d), f);
          if (equal && F.isSimplest({ n: v.n, d: v.d })) {
            uncover(el);
            api.correct(tok(f) + ' = ' + (g > 1 ? tok({ n: f.n, d: f.d }, true) + ' = ' : '') + '{' + m.w + ' ' + r.n + '/' + r.d + '} ป้ายสวยถูกต้อง!', go);
          } else if (equal) api.wrong('ค่าถูกแล้ว! แต่เศษส่วนยังไม่เป็นอย่างต่ำนะ', go);
          else api.wrong('', go);
        });
      },
      hint(l) {
        return [
          f.n + ' ÷ ' + f.d + ' ได้เท่าไร เหลือเศษเท่าไร?',
          'ได้ ' + m.w + ' ถาดเต็ม เหลือ ' + tok({ n: m.n, d: m.d }) + ' ถาด',
          g > 1 ? tok({ n: m.n, d: m.d }) + ' หารทั้งเศษและส่วนด้วย ' + g + ' ได้อย่างต่ำ' : tok({ n: m.n, d: m.d }) + ' เป็นอย่างต่ำแล้ว'
        ][l - 1];
      },
      answer: tok(f) + ' = {' + m.w + ' ' + r.n + '/' + r.d + '}'
    };
  }

  const PEOPLE = ['พี่แพร', 'น้องฟ้า', 'ต้นกล้า', 'ใบเตย', 'ภูผา', 'น้ำหวาน'];
  function tWho(level) {
    const [p1, p2] = F.shuffle(PEOPLE).slice(0, 2);
    let a, b, amix = false, bmix = false;
    if (level === 1) { const d = R(3, 6); a = { n: R(1, 2 * d - 1), d }; do { b = { n: R(1, 2 * d - 1), d }; } while (b.n === a.n); }
    else if (level === 2) { a = { n: pick([5, 7]), d: 4 }; b = F.mixed(1, 1, 2); bmix = true; if (Math.random() < 0.5) { a = { n: pick([4, 5]), d: 3 }; b = F.mixed(1, pick([1, 2]), 3); } }
    else { a = F.mixed(2, 1, 3); amix = true; b = { n: pick([9, 11]), d: 4 }; if (Math.random() < 0.5) { a = { n: 11, d: 6 }; amix = false; b = F.mixed(1, 3, 4); bmix = true; } }
    return tCompare(a, b, {
      amix, bmix, whoA: p1, whoB: p2, showPies: false,
      title: 'ใครได้พายมากกว่ากัน?',
      say: p1 + ' ได้พาย ' + tok(a, amix) + ' ถาด ' + p2 + ' ได้ ' + tok(b, bmix) + ' ถาด เลือกเครื่องหมาย'
    });
  }

  const STAGE5 = {
    id: 5, name: 'เทศกาลแบ่งพาย', topic: 'ภารกิจสุดท้าย: ใช้ความรู้เศษส่วนทุกเรื่อง', color: '#c9a7ff', flavor: 'berry', final: true,
    intro: [
      { who: 'pp', text: 'ถึงวันเทศกาลแล้ว! ลูกค้าเต็มร้านเลย', mood: 'cheer' },
      { who: 'mix', text: 'ฮ่า ๆ ข้าแอบเขียนป้ายใหม่ไว้เพียบ ดูซิว่าจะจับผิดข้าได้ไหม!' },
      { who: 'pp', text: 'ใช้ทุกอย่างที่เรียนมา จับผิดป้ายของมิกซ์ แล้วช่วยลูกค้ากันเถอะ', last: 'ลุยเลย' }
    ],
    learn: [],
    missions: 6,
    gen(level, i, run) {
      const type = ['judge', 'who', 'sign', 'judge', 'queue', 'judge'][i];
      if (type === 'judge') {
        run.usedClaims = run.usedClaims || [];
        const pool = CLAIMS[level].filter(c => run.usedClaims.indexOf(c.t) < 0);
        const c = pick(pool.length ? pool : CLAIMS[level]);
        run.usedClaims.push(c.t);
        return tJudge(c);
      }
      if (type === 'who') return tWho(level);
      if (type === 'sign') {
        let f;
        if (level === 1) { const d = pick([3, 5]); f = { n: R(d + 1, 3 * d - 1), d }; if (f.n % d === 0) f.n++; }
        else if (level === 2) { const d = pick([4, 6]); const w = R(1, 3); f = { n: w * d + d / 2, d }; }
        else { const d = pick([6, 8, 9, 10, 12]); const w = R(1, 3); const g = pick([2, 3].filter(x => d % x === 0)); f = { n: w * d + g * R(1, d / g - 1), d }; }
        return tSign(f, level);
      }
      const items = genOrder(Math.max(2, level));
      return tOrder(items, 'desc', {
        title: 'จัดคิวรับพาย จากคนที่สั่งมากที่สุด',
        say: 'ลูกค้าที่สั่งพายมากที่สุด ได้รับก่อน เรียงจากมากไปน้อยนะ'
      });
    },
    recap: [
      'จับผิดป้ายได้ด้วยการพิสูจน์ ไม่ใช่เดา',
      'ใช้ได้ทั้ง แท้/เกิน จำนวนคละ อย่างต่ำ และการเปรียบเทียบ'
    ],
    book: [
      '**สรุปทั้งหมด**',
      'เศษส่วนแท้ {3/4}  เศษเกิน {5/4}  จำนวนคละ {1 1/4}',
      'เท่ากัน {1/2} = {2/4}  อย่างต่ำ {6/8} = {3/4}  จำนวนนับ {8/4} = 2',
      'เปรียบเทียบ: ทำส่วนให้เท่ากัน หรือดูจำนวนเต็มก่อน'
    ],
    teacher: [
      'ให้นักเรียนแต่งป้ายผิด ๆ แบบมิกซ์ แล้วให้เพื่อนจับผิด',
      'ในชีวิตจริง เราใช้เศษส่วนตอนไหนบ้าง?'
    ],
    outro: [
      { who: 'mix', text: 'ยอมแล้ว ๆ! เจ้าจับผิดป้ายข้าได้หมดเลย', mood: 'oops' },
      { who: 'mix', text: 'ขอโทษนะปันปัน ต่อไปข้าจะช่วยแบ่งพายให้ถูกต้อง', mood: 'happy' },
      { who: 'pp', text: 'ขอบคุณมากนะ! เทศกาลปีนี้สำเร็จเพราะเธอเลย', mood: 'cheer', keepMix: true }
    ]
  };

  PP.STAGES = [STAGE1, STAGE2, STAGE3, STAGE4, STAGE5];

  PP.SKILLS = {
    proper: { name: 'เศษส่วนแท้ และเศษเกิน', rec: 'ทบทวน: ตัวเศษน้อยกว่าตัวส่วน = เศษส่วนแท้ (ด่าน 1)' },
    mixed: { name: 'จำนวนคละ กับเศษเกิน', rec: 'ฝึกแพ็กพาย: ตัวเศษ ÷ ตัวส่วน และ จำนวนเต็ม × ตัวส่วน + ตัวเศษ (ด่าน 2)' },
    equiv: { name: 'เศษส่วนที่เท่ากัน', rec: 'ฝึกใช้เครื่องตัด: คูณตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน (ด่าน 3)' },
    simplest: { name: 'เศษส่วนอย่างต่ำ', rec: 'ฝึกหาจำนวนที่หารทั้งตัวเศษและตัวส่วนลงตัว (ด่าน 3)' },
    whole: { name: 'เศษส่วนที่เท่ากับจำนวนนับ', rec: 'ฝึกดูว่าตัวเศษหารด้วยตัวส่วนได้เท่าไร (ด่าน 3)' },
    compare: { name: 'การเปรียบเทียบ', rec: 'ฝึกทำตัวส่วนให้เท่ากันก่อนเปรียบเทียบ (ด่าน 4)' },
    order: { name: 'การเรียงลำดับ', rec: 'ฝึกเรียงลำดับและดูเส้นจำนวน (ด่าน 4)' }
  };
})();
