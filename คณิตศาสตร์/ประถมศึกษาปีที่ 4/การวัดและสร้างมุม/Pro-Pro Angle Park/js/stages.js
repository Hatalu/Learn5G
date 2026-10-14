/* ═══════════════════════════════════════════════════════════
   PRO-PRO ANGLE PARK — เนื้อหา 5 เครื่องเล่นของสวนสนุก
   task = { skill, title, say, judSay?, render(el, api), hint(level), answer, solve() }
   level 1–3 (แถบเฟือง) ปรับอัตโนมัติจาก "ความถูกต้อง" ไม่ใช่ความเร็ว
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const AP = window.AP;
  const { M, art, W, ui, audio } = AP;
  const { pick, shuffle } = M;

  const LEAD_WRONG = ['เกือบแล้ว! ลองอีกนิด', 'ไม่เป็นไร ลองใหม่ได้!', 'หืม... ยังเบี้ยวอยู่นิดนึง', 'ยังไม่ใช่ แต่ใกล้แล้ว!'];
  const PRAISE = ['เป๊ะ!', 'ถูกต้อง!', 'เยี่ยมไปเลย!', 'ใช่เลย!', 'สุดยอด!', 'ว้าว เก่งมาก!'];
  const praise = () => pick(PRAISE);
  const rich = s => ui.rich(s, true);
  const D = n => '{d:' + n + '}';

  /* ── ส่วนประกอบหน้าจอที่ใช้ซ้ำ ── */
  const goBtn = (label, ic) => '<div class="act"><button class="btn btn-go act-go">' + art.icon(ic || 'check') + '<span>' + label + '</span></button></div>';
  const storyP = s => s ? '<p class="story">' + rich(s) + '</p>' : '';
  const showCard = (inner, cap) => '<div class="show-card">' + inner + (cap ? '<p class="show-cap">' + rich(cap) + '</p>' : '') + '</div>';
  const refSquare = f => {
    const a = M.vec(f.b, 46), c = M.vec(f.b + 90 * f.dir, 46), V = f.V;
    return '<path d="M' + (V.x + a.x).toFixed(1) + ' ' + (V.y + a.y).toFixed(1) + ' L' + (V.x + a.x + c.x).toFixed(1) + ' ' + (V.y + a.y + c.y).toFixed(1) +
      ' L' + (V.x + c.x).toFixed(1) + ' ' + (V.y + c.y).toFixed(1) + '" fill="none" stroke="#12a05a" stroke-width="3.6" stroke-dasharray="7 6" stroke-linejoin="round"/>';
  };
  const figSvg = (f, o) => {
    o = o || {};
    return '<svg class="fig-svg" viewBox="30 20 400 380" aria-hidden="true"><rect x="32" y="22" width="396" height="376" rx="26" fill="#fffdf6" stroke="' + art.INK + '" stroke-width="4"/>' +
      art.figureMarkup(f, { arcR: 38 }) + (o.ref ? refSquare(f) : '') + '</svg>';
  };
  const sideTxt = sc => sc === 'outer' ? 'ปลายขวาของโพรแทรกเตอร์' : 'ปลายซ้ายของโพรแทรกเตอร์';
  const scaleTok = sc => sc === 'outer' ? '{out}' : '{in}';
  const belowFig = size => { const b = pick([0, 180]); return M.figure({ b, dir: b === 0 ? -1 : 1, size }); };
  /* ซิกแซกอ้างค่าที่ถูกหรือผิด (ผิด 65% ถูก 35%) */
  const claimOf = (kind, size, want) => Math.random() < 0.35 ? { kind, size, claim: size, want: want } : { kind, size, claim: 180 - size, want: want };

  /* ══════════════════════════════════════════════
     ชนิดงาน : รู้จักโพรแทรกเตอร์ (ชั้น 1)
     ══════════════════════════════════════════════ */

  /* แตะส่วนประกอบตามที่โปรโปรบอก */
  function tParts() {
    const seq = [
      { k: 'center', name: 'จุดกึ่งกลาง', ask: 'แตะ **จุดกึ่งกลาง** หรือกากบาทสีแดงตรงกลางให้หน่อย!', teach: 'จุดกึ่งกลางต้องวางทับ **จุดยอดของมุม** เสมอ!',
        hint: ['มองหากากบาทสีแดงที่อยู่ตรงกลางเส้นยาวด้านล่าง'] },
      { k: 'base', name: 'เส้นฐาน', ask: 'ต่อไป แตะ **เส้นฐาน** เส้นตรงยาวด้านล่างของฉัน!', teach: 'เส้นฐานคือเส้น 0 องศา ต้องวางทับ **แขนของมุม** ข้างหนึ่ง!',
        hint: ['เส้นฐานคือเส้นตรงยาวที่ตัดผ่านจุดกึ่งกลาง'] },
      { k: 'outer', name: 'สเกลนอก', ask: 'แตะ {out} แถบตัวเลขสีฟ้าด้านนอกสุด!', teach: '{out} เริ่มนับ 0 จากทาง **ขวา**',
        hint: ['{out} คือแถบเลขสีฟ้าที่อยู่ริมนอกสุดของฉัน'] },
      { k: 'inner', name: 'สเกลใน', ask: 'สุดท้าย แตะ {in} แถบตัวเลขสีส้มด้านใน!', teach: '{in} เริ่มนับ 0 จากทาง **ซ้าย**',
        hint: ['{in} คือแถบเลขสีส้มที่อยู่ถัดเข้ามาด้านใน'] }
    ];
    let pm, idx = 0;
    const cur = () => seq[Math.min(idx, seq.length - 1)];
    return {
      skill: 'parts',
      title: 'แตะส่วนต่าง ๆ ของโปรโปร',
      say: seq[0].ask,
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        pm = W.partsMap(el.querySelector('.w-host'), {
          onPick(part) {
            if (idx >= seq.length) return;
            const s = seq[idx];
            if (part === s.k) {
              audio.sfx('pop', idx + 1);
              pm.show(part, 'done');
              pm.label(part, s.name, ['#ff3b57', '#2d1b4e', '#1d4ed8', '#c2410c'][idx]);
              ui.sparkle(ui.center(pm.svg), 8);
              idx++;
              if (idx >= seq.length) { pm.lock(); api.correct(praise() + ' ' + s.teach + '\nรู้จักครบทุกส่วนแล้ว!', pm.svg); }
              else api.say('ถูกต้อง! ' + s.teach + '\n' + seq[idx].ask, 'cheer');
            } else {
              const nm = { center: 'จุดกึ่งกลาง', base: 'เส้นฐาน', outer: 'สเกลนอก', inner: 'สเกลใน', zeroOut: 'เลข 0 ของสเกลนอก', zeroIn: 'เลข 0 ของสเกลใน' }[part];
              api.wrong('นั่นคือ ' + nm + ' นะ ยังไม่ใช่ที่ขอ', pm.svg);
            }
          },
          onMiss() { api.nudge('แตะบนตัวฉันนะ! ' + cur().ask); }
        });
      },
      hint(l) {
        if (l === 3 && pm) pm.pulse(cur().k, true);
        return [cur().hint[0], 'ดูสีนะ: จุดกึ่งกลางสีแดง · สเกลนอกสีฟ้า · สเกลในสีส้ม', 'ดูส่วนที่กะพริบเหลืองอยู่นะ!'][l - 1];
      },
      answer: 'จุดกึ่งกลาง · เส้นฐาน · {out} · {in}',
      solve() { idx = seq.length; seq.forEach(s => { pm.show(s.k, 'done'); }); pm.lock(); }
    };
  }

  /* ลากแขนมุมให้เปิดตามขนาด (สำรวจองศา) — targets = [{deg, learn}] */
  function tFan(targets, o) {
    o = o || {};
    const f = M.figure({ b: 0, dir: 1, size: 0 });
    let st, idx = 0;
    const T = () => targets[Math.min(idx, targets.length - 1)];
    const askTxt = t => t.ask || ('ลากแขนสีชมพูให้เปิดเป็น ' + D(t.deg) + ' ดูเลขที่ขึ้นข้าง ๆ ได้เลย!');
    return {
      skill: o.skill || 'parts',
      title: o.title || 'ลากแขนมุมให้เปิดตามที่ต้องการ',
      say: askTxt(targets[0]),
      render(el, api) {
        el.innerHTML = storyP(o.story) + '<div class="w-stage"></div>';
        st = W.angleStage(el.querySelector('.w-stage'), {
          mode: 'fan', fig: f, prot: 'ideal', lite: false, startDeg: targets[0].start == null ? 20 : targets[0].start,
          onArm(deg) {
            const t = T();
            const d = Math.abs(deg - t.deg);
            if (d === 0) {
              audio.sfx('snap');
              ui.sparkle(ui.center(st.svg), 10);
              idx++;
              if (idx >= targets.length) { api.correct(praise() + ' ' + (t.learn || ('เปิดมุมได้ ' + D(t.deg) + ' แล้ว!')), st.svg); }
              else api.say(praise() + ' ' + (t.learn || '') + '\nต่อไป ' + askTxt(T()), 'cheer');
            } else if (d <= 10) {
              api.nudge((deg < t.deg ? 'ใกล้แล้ว! เปิดกว้างขึ้นอีกนิด' : 'ใกล้แล้ว! หุบเข้ามาอีกนิด') + ' ตอนนี้ได้ ' + D(deg) + ' ต้องให้ได้ ' + D(t.deg) + ' พอดี', st.svg);
            } else {
              api.wrong('ตอนนี้ได้ ' + D(deg) + ' ยังไม่ใช่ ' + D(t.deg), st.svg);
            }
          }
        });
      },
      hint(l) {
        const t = T();
        if (l === 3 && st) st.setArm(t.deg);
        return [
          'ดูเลขสีฟ้า ที่ขึ้นข้างปลายแขนสีชมพู มันบอกองศาตอนนี้',
          t.deg < 90 ? 'มุมนี้แคบกว่ามุมฉาก ต้องน้อยกว่า ' + D(90) : t.deg > 90 ? 'มุมนี้กว้างกว่ามุมฉาก ต้องมากกว่า ' + D(90) : 'มุมฉากมีกรอบสี่เหลี่ยมสีเขียวโผล่ขึ้นมา',
          'โปรโปรลากให้แล้ว ดูเลขที่ขึ้นนะ'
        ][l - 1];
      },
      answer: targets.map(t => D(t.deg)).join(' และ '),
      solve() { st.setArm(targets[targets.length - 1].deg); }
    };
  }

  /* สเกลไหนเริ่มนับ 0 ที่แขนฐาน */
  function tScalePick(level) {
    const f = M.measureQ(level, level === 1 ? 'up' : 'flat');
    const base = M.ideals(f).filter(i => i.id === 1)[0] || M.ideals(f)[0];
    const sc = base.scale;
    let st, ch;
    return {
      skill: 'parts',
      title: 'แขนฐาน (สีฟ้า) ทับปลายไหนของโปรโปร?',
      say: 'ดูแขนสีฟ้าที่ทับอยู่บนฉัน! เริ่มนับ 0 จากตรงนั้น ต้องอ่านเลขจากสเกลไหน?',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-stage"></div></div><div class="qa-a"><div class="w-host"></div></div></div>';
        st = W.angleStage(el.querySelector('.w-stage'), { mode: 'measure', fig: f, prot: 'ideal', idealId: 1, lite: true, glow: false, zeroCue: false });
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-words',
          options: [{ html: '{out} (สีฟ้า)', value: 'outer' }, { html: '{in} (สีส้ม)', value: 'inner' }].map(o => ({ html: rich(o.html), value: o.value })),
          onPick(v, b) {
            if (v === sc) { b.classList.add('good'); ch.lock(); st.cue('zero', true); api.correct(praise() + ' เลข 0 ของ' + scaleTok(sc) + ' อยู่ตรงแขนฐานพอดี!', b); }
            else { ch.dim(b); api.wrong('เลข 0 ของ' + scaleTok(v) + ' อยู่อีกฝั่งนะ ไม่ได้อยู่ตรงแขนฐาน', b); }
          }
        });
      },
      hint(l) {
        if (l === 3 && st) st.cue('zero', true);
        if (l === 3 && st) st.cue('zero', true);
        return [
          'หาเลข 0 ที่อยู่ใกล้แขนสีฟ้าที่สุด',
          'เลข 0 สีฟ้าอยู่ปลายขวา เลข 0 สีส้มอยู่ปลายซ้าย',
          'ดูวงกลมเหลืองที่กะพริบ แล้วดูว่าเป็นสีอะไร'
        ][l - 1];
      },
      answer: 'แขนฐานทับ' + sideTxt(sc) + ' จึงใช้' + scaleTok(sc),
      solve() { ch.mark(sc, 'good'); st.cue('zero', true); }
    };
  }

  /* เลือกชื่อส่วนที่ไฮไลต์ */
  function tPartPick() {
    const parts = [
      { k: 'center', n: 'จุดกึ่งกลาง' }, { k: 'base', n: 'เส้นฐาน' }, { k: 'outer', n: 'สเกลนอก' }, { k: 'inner', n: 'สเกลใน' }, { k: 'zeroOut', n: 'เลข 0 ของสเกลนอก' }
    ];
    const t = pick(parts);
    const opts = shuffle([t].concat(shuffle(parts.filter(p => p !== t)).slice(0, 2)));
    let pm, ch;
    const useTxt = { center: 'ต้องวางทับจุดยอดของมุม', base: 'ต้องวางทับแขนของมุมข้างหนึ่ง', outer: 'เริ่มนับ 0 จากทางขวา', inner: 'เริ่มนับ 0 จากทางซ้าย', zeroOut: 'ขีดเริ่มต้นของสเกลนอก อยู่ทางขวา' }[t.k];
    return {
      skill: 'parts',
      title: 'ส่วนที่กะพริบเหลืองคืออะไร?',
      say: 'ดูส่วนที่กะพริบสีเหลืองบนตัวฉัน! เรียกว่าอะไรนะ?',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-host pm-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        pm = W.partsMap(el.querySelector('.pm-host'), {});
        pm.lock();
        pm.show(t.k);
        ch = W.choice(el.querySelector('.ch-host'), {
          cls: 'opts-words',
          options: opts.map(o => ({ html: o.n, value: o.k })),
          onPick(v, b) {
            if (v === t.k) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' ' + t.n + ' ' + useTxt, b); }
            else { ch.dim(b); api.wrong('ส่วนนี้ไม่ใช่ ' + b.textContent + ' นะ', b); }
          }
        });
      },
      hint(l) {
        return [
          'จุดกึ่งกลางเป็นกากบาทแดง · เส้นฐานเป็นเส้นตรงยาว · สเกลเป็นแถบตัวเลข',
          useTxt + ' นะ ลองนึกดูว่าใช่ส่วนไหน',
          'ตัดตัวเลือกที่ไม่ใช่ออกไปทีละข้อ'
        ][l - 1];
      },
      answer: t.n + ' · ' + useTxt,
      solve() { ch.mark(t.k, 'good'); }
    };
  }

  /* ประมาณชนิดของมุมก่อนวัด (เปรียบกับมุมฉาก) */
  function tEstimate(level, last) {
    const pools = { 1: [25, 35, 45, 55, 125, 135, 145, 155], 2: [60, 70, 75, 105, 110, 120, 90], 3: [80, 85, 88, 92, 95, 100, 90] };
    let size, tries = 0;
    do { size = pick(pools[level]); tries++; } while (last && last.size === size && tries < 12);
    const b = pick([0, 180, 30, 60, 120, 210, 300]);
    const f = M.figure({ b, dir: pick([1, -1]), size });
    const kind = M.typeOf(size);
    let ch;
    return {
      skill: 'sense',
      size,
      title: 'มุมนี้กว้างหรือแคบกว่ามุมฉาก?',
      say: 'เส้นประสีเขียวคือมุมฉาก! เทียบดูซิ แขนสีชมพูแคบกว่า เท่ากับ หรือกว้างกว่า?',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q">' + showCard(figSvg(f, { ref: true })) + '</div><div class="qa-a"><div class="w-host"></div></div></div>';
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-words',
          options: [
            { html: '<b>มุมแหลม</b><small>แคบกว่ามุมฉาก</small>', value: 'acute' },
            { html: '<b>มุมฉาก</b><small>เท่ากับ ' + D(90) + '</small>', value: 'right' },
            { html: '<b>มุมป้าน</b><small>กว้างกว่ามุมฉาก</small>', value: 'obtuse' }
          ].map(o => ({ html: rich(o.html), value: o.value })),
          onPick(v, b) {
            if (v === kind) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' เป็น' + M.TYPE_NAME[kind] + ' ' + (kind === 'acute' ? 'น้อยกว่า ' + D(90) : kind === 'right' ? 'เท่ากับ ' + D(90) : 'มากกว่า ' + D(90) + ' แต่ไม่ถึง ' + D(180)) + '\nเดาก่อนวัด ช่วยตรวจคำตอบได้นะ!', b); }
            else { ch.dim(b); api.wrong(null, b); }
          }
        });
      },
      hint(l) {
        if (l === 3 && ch) ch.btns.forEach((b, i) => ui.pulse(b, ['acute', 'right', 'obtuse'][i] === kind));
        return [
          'เทียบกับเส้นประสีเขียว (มุมฉาก) ดูว่าแขนสีชมพูอยู่ข้างในหรือข้างนอก',
          'แขนสีชมพูอยู่ข้างในเส้นประ = แคบกว่า · ทับเส้นประ = เท่ากัน · เลยออกไป = กว้างกว่า',
          'ดูปุ่มที่กะพริบนะ!'
        ][l - 1];
      },
      answer: M.TYPE_NAME[kind],
      solve() { ch.mark(kind, 'good'); }
    };
  }

  /* ══════════════════════════════════════════════
     ชนิดงาน : วางโพรแทรกเตอร์ (ชั้น 2)
     ══════════════════════════════════════════════ */
  function tPlace(f, o) {
    o = o || {};
    const level = o.level || 1;
    let st, fails = 0;
    const msgOf = d => {
      if (d.kind === 'flipped') return 'โพรแทรกเตอร์คว่ำอยู่! แขนอีกข้างต้องอยู่ใต้ส่วนโค้ง ลองหมุนกลับครึ่งรอบนะ';
      if (d.kind === 'rot') return 'จุดกึ่งกลางถูกแล้ว! หมุนให้เส้นฐานทับแขนมุมอีกนิด';
      return 'พาจุดกึ่งกลางสีแดงไปทับจุดยอดมุม (จุดเหลือง) ก่อนนะ';
    };
    return {
      skill: 'place',
      title: o.title || 'วางโพรแทรกเตอร์ให้ถูกที่',
      say: o.say || (level === 1 ? 'ลากฉันไปวางที่มุม! จุดกึ่งกลางสีแดงของฉัน ต้องทับจุดยอดสีเหลือง!' : 'ลากโพรแทรกเตอร์ไปวางให้ถูก แล้วหมุนด้วยปุ่มสีเหลืองให้เส้นฐานทับแขนมุม!'),
      render(el, api) {
        el.innerHTML = storyP(o.story) + '<div class="w-stage"></div>';
        st = W.angleStage(el.querySelector('.w-stage'), {
          mode: 'place', fig: f, prot: 'free', ring: level <= 2,
          onRelease(d) {
            fails++;
            if (fails % 3 === 0) api.wrong(msgOf(d), st.svg); else api.nudge(msgOf(d), st.svg);
          },
          onAligned() { api.correct(praise() + ' ' + (o.okText || 'จุดกึ่งกลางทับจุดยอด เส้นฐานทับแขนมุม และแขนอีกข้างอยู่ใต้โค้ง!'), st.svg); }
        });
      },
      hint(l) {
        if (l === 1 && st) st.cue('ring', true);
        if (l === 3 && st) { st.cue('ring', true); st.cue('ghost', true); }
        return [
          'ขั้นแรก ลากโพรแทรกเตอร์ให้จุดกึ่งกลาง (กากบาทแดง) ไปทับจุดยอดมุม (จุดเหลือง)',
          'ขั้นสอง หมุนด้วยปุ่มสีเหลือง ให้เส้นฐานทับแขนมุมข้างหนึ่ง และแขนอีกข้างต้องอยู่ใต้ส่วนโค้ง',
          'ดูเงาประสีเหลือง นั่นคือตำแหน่งที่ถูก ลองวางให้ทับเงานะ'
        ][l - 1];
      },
      answer: 'จุดกึ่งกลางทับจุดยอดมุม เส้นฐานทับแขนมุม แขนอีกข้างอยู่ใต้ส่วนโค้ง',
      solve() { st.solve(); }
    };
  }

  /* ใครวางโพรแทรกเตอร์ถูกต้อง */
  function tDetective(f0) {
    const f = f0;
    const ok = M.nearestIdeal(f, { rot: 0 });
    const s = pick([-1, 1]);
    const bads = shuffle([
      { pr: { x: f.V.x + 54 * s, y: f.V.y + 26, rot: ok.rot }, why: 'จุดกึ่งกลางไม่ได้ทับจุดยอดมุม' },
      { pr: { x: f.V.x, y: f.V.y, rot: ok.rot + 24 * s }, why: 'เส้นฐานไม่ได้ทับแขนมุม เอียงไปนิดหนึ่ง' },
      { pr: { x: f.V.x, y: f.V.y, rot: ok.rot + 180 }, why: 'โพรแทรกเตอร์คว่ำอยู่ แขนอีกข้างไม่อยู่ใต้โค้ง' }
    ]).slice(0, 2);
    const opts = shuffle([{ pr: { x: f.V.x, y: f.V.y, rot: ok.rot }, why: null }].concat(bads));
    const names = ['ก', 'ข', 'ค'];
    let ch;
    return {
      skill: 'place',
      title: 'ใครวางโพรแทรกเตอร์ถูกต้อง?',
      say: 'เพื่อน ๆ ช่วยกันวางโพรแทรกเตอร์ ใครวางถูกต้องที่สุด? ดูให้ละเอียด!',
      render(el, api) {
        el.innerHTML = '<div class="w-host"></div>';
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-thumb',
          options: opts.map((o, i) => ({ html: '<span class="th-tag">' + names[i] + '</span>' + art.miniPlacement(f, o.pr, { nums: false }), value: i })),
          onPick(v, b) {
            if (opts[v].why === null) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' แบบนี้ถูก! จุดกึ่งกลางทับจุดยอด และเส้นฐานทับแขนมุม', b); }
            else { ch.dim(b); api.wrong('แบบ ' + names[v] + ': ' + opts[v].why, b); }
          }
        });
      },
      hint(l) {
        if (l === 3 && ch) ch.btns.forEach((b, i) => ui.pulse(b, opts[i].why === null));
        return [
          'ตรวจสองอย่าง: จุดกึ่งกลางทับจุดยอดไหม และเส้นฐานทับแขนมุมไหม',
          'แขนอีกข้างต้องอยู่ใต้ส่วนโค้งของโพรแทรกเตอร์ด้วย',
          'ดูภาพที่กะพริบนะ'
        ][l - 1];
      },
      answer: 'แบบที่ถูก: จุดกึ่งกลางทับจุดยอด เส้นฐานทับแขนมุม',
      solve() { ch.btns.forEach((b, i) => { if (opts[i].why === null) b.classList.add('good'); }); }
    };
  }

  /* ══════════════════════════════════════════════
     ชนิดงาน : วัดมุม (ชั้น 3, 5)
     o = {how:'choice'|'pad'|'self', level, story, title}
     ══════════════════════════════════════════════ */
  function tMeasure(f, o) {
    o = o || {};
    const how = o.how || 'pad', level = o.level || 1;
    const tolAns = level >= 3 && how !== 'choice' ? 1 : 0;
    let st, np, ch, go;
    const scaleOf = () => { const c = M.checkPlacement(f, st ? st.state() : { x: f.V.x, y: f.V.y, rot: M.ideals(f)[0].rot }, { pos: 20, rot: 8 }); return c.scale || M.ideals(f)[0].scale; };
    const readTxt = () => 'อ่านจาก' + scaleTok(scaleOf());
    return {
      skill: o.skill || 'measure',
      size: f.size,
      title: o.title || 'วัดมุมสีชมพู ได้กี่องศา?',
      say: o.say || (how === 'choice' ? 'โพรแทรกเตอร์วางถูกที่แล้ว! แขนสีชมพูผ่านเลขอะไร เลือกคำตอบเลย!'
        : how === 'pad' ? 'ดูแขนสีชมพูว่าผ่านเลขไหน แล้วกดตัวเลขตอบเลย!'
        : 'ลากโพรแทรกเตอร์ไปวาง แล้วหมุนด้วยปุ่มสีเหลือง จากนั้นอ่านค่ามุม!'),
      render(el, api) {
        el.innerHTML = storyP(o.story) + '<div class="qa"><div class="qa-q"><div class="w-stage"></div></div><div class="qa-a"><div class="w-host"></div></div></div>';
        const self = how === 'self';
        st = W.angleStage(el.querySelector('.w-stage'), {
          mode: 'measure', fig: f, prot: self ? 'free' : 'ideal', ring: self && level <= 2,
          glow: level <= 2 || !self, zeroCue: level === 1 && !self, lite: level <= 2,
          onRelease(d) {
            api.nudge(d.kind === 'flipped' ? 'โพรแทรกเตอร์คว่ำอยู่! แขนอีกข้างต้องอยู่ใต้ส่วนโค้ง ลองหมุนกลับครึ่งรอบ'
              : d.kind === 'rot' ? 'จุดกึ่งกลางถูกแล้ว! หมุนให้เส้นฐานทับแขนมุมอีกนิด'
              : 'พาจุดกึ่งกลางสีแดงไปทับจุดยอดมุม (จุดเหลือง) ก่อนนะ', st.svg);
          },
          onAligned() {
            if (np) { np.host.querySelector('.np').classList.remove('waiting'); }
            api.say('วางถูกแล้ว! ' + (level === 1 ? 'เส้นฐานทับ' + sideTxt(scaleOf()) + ' ใช้' + scaleTok(scaleOf()) + '\n' : '') + 'ตอนนี้อ่านค่ามุมได้เลย!');
          }
        });
        const host = el.querySelector('.qa-a .w-host');
        if (how === 'choice') {
          ch = W.choice(host, {
            cls: 'opts-3',
            options: M.measureChoices(f.size).map(v => ({ html: '<span class="big">' + v + '°</span>', value: v })),
            onPick(v, b) {
              if (v === f.size) { b.classList.add('good'); ch.lock(); api.correct(praise() + ' มุมนี้วัดได้ ' + D(f.size) + ' ' + readTxt(), b); }
              else {
                ch.dim(b);
                api.wrong(v === 180 - f.size ? 'นั่นคือเลขจากสเกลผิดฝั่งนะ! ' + (f.size < 90 ? 'มุมนี้แคบกว่ามุมฉาก ต้องน้อยกว่า ' + D(90) : 'มุมนี้กว้างกว่ามุมฉาก ต้องมากกว่า ' + D(90)) : null, b);
              }
            }
          });
        } else {
          np = W.numpad(host, { max: 3, go: 'ตรวจคำตอบ', onEnter: () => go.click() });
          go = np.go;
          if (self) np.host.querySelector('.np').classList.add('waiting');
          go.addEventListener('click', () => {
            if (self && !st.aligned()) return api.nudge('วางโพรแทรกเตอร์ให้ถูกที่ก่อนนะ!', go);
            if (np.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
            const a = np.get();
            const d = Math.abs(a - f.size);
            if (d <= tolAns) {
              np.lock(); st.cue('glow', true);
              api.correct(praise() + ' มุมนี้วัดได้ ' + D(f.size) + (d ? ' (อ่านได้ ' + a + '° ใกล้เคียงมาก)' : '') + ' ' + readTxt(), go);
              return;
            }
            const dg = M.diagMeasure(f.size, a);
            let msg = null;
            if (dg === 'wrongScale') msg = 'นั่นคือเลขจากสเกลผิดฝั่ง! ' + (f.size < 90 ? 'มุมนี้แคบกว่ามุมฉาก ต้องน้อยกว่า ' + D(90) : 'มุมนี้กว้างกว่ามุมฉาก ต้องมากกว่า ' + D(90));
            else if ((a < 90) !== (f.size < 90) && a !== 90) msg = f.size < 90 ? 'ลองดูอีกที มุมนี้แคบกว่ามุมฉาก ต้องน้อยกว่า ' + D(90) : 'ลองดูอีกที มุมนี้กว้างกว่ามุมฉาก ต้องมากกว่า ' + D(90);
            else if (dg === 'close') msg = 'ใกล้มากแล้ว! ลองนับขีดเล็ก ๆ ให้ละเอียดอีกนิด';
            api.wrong(msg, go);
          });
        }
      },
      hint(l) {
        if (how === 'self' && st && !st.aligned()) {
          if (l === 1) st.cue('ring', true);
          if (l === 3) { st.cue('ring', true); st.cue('ghost', true); }
          return [
            'ขั้นแรก วางโพรแทรกเตอร์ให้จุดกึ่งกลาง (กากบาทแดง) ทับจุดยอดมุม (จุดเหลือง)',
            'แล้วหมุนด้วยปุ่มสีเหลือง ให้เส้นฐานทับแขนมุมข้างหนึ่ง แขนอีกข้างต้องอยู่ใต้ส่วนโค้ง',
            'ดูเงาประสีเหลือง นั่นคือตำแหน่งที่ถูก'
          ][l - 1];
        }
        if (l === 3 && st) { st.cue('zero', true); st.cue('glow', true); }
        const sc = scaleOf();
        return [
          'หาปลายโพรแทรกเตอร์ที่แขนฐานทับอยู่ ตรงนั้นคือเลข 0 · ' + sideTxt(sc) + ' ใช้' + scaleTok(sc),
          'ดูแขนสีชมพูว่าผ่านเลขอะไร ถ้าอยู่ระหว่างเลข ให้นับขีดเล็ก (ขีดกลาง = 5 ขีดยาว = 10)',
          'ดูวงกลมเหลืองที่เรืองแสง อ่านเลขตรงนั้นด้วย' + scaleTok(sc) + ' (สีเดียวกับเลข 0 ที่แขนฐาน)'
        ][l - 1];
      },
      get answer() { return readTxt() + ' ได้ ' + D(f.size); },
      solve() {
        if (how === 'choice') { ch.mark(f.size, 'good'); st.cue('glow', true); return; }
        st.solve(() => { np.set(f.size); np.lock(); st.cue('glow', true); });
      }
    };
  }

  /* ══════════════════════════════════════════════
     ชนิดงาน : สร้างมุม (ชั้น 4, 5)
     q = {size, f}  o = {level, readout, story, title}
     ══════════════════════════════════════════════ */
  function tBuild(q, o) {
    o = o || {};
    const level = o.level || 1, size = q.size, f = q.f;
    const free = level >= 3 || o.free;
    let st, go, busy = false;
    const scaleNow = () => (st && st.scale()) || M.upIdeal(f).scale;
    return {
      skill: o.skill || 'build',
      size,
      title: o.title || 'สร้างมุม ' + D(size),
      say: o.say || (free ? 'วางโพรแทรกเตอร์ให้ถูกที่ก่อน แล้วหาเลข ' + size + ' ลากจุดชมพูไปที่ขีดนั้น จากนั้นกดลากเส้นมุม!'
        : 'โปรโปรวางไว้ให้แล้ว! หาเลข ' + size + ' บนสเกลที่เริ่ม 0 ตรงแขนฐาน แล้วลากจุดชมพูไปที่ขีดนั้น!'),
      render(el, api) {
        el.innerHTML = storyP(o.story) + '<div class="w-stage"></div>' + goBtn('ลากเส้นมุม', 'pencil');
        go = el.querySelector('.act-go');
        st = W.angleStage(el.querySelector('.w-stage'), {
          mode: 'build', fig: f, prot: free ? 'free' : 'ideal', ring: free && level <= 3, readout: !!o.readout, lite: level <= 2,
          onRelease(d) {
            api.nudge(d.kind === 'rot' ? 'จุดกึ่งกลางถูกแล้ว! หมุนให้เส้นฐานทับแขนฐานอีกนิด' : 'พาจุดกึ่งกลางสีแดงไปทับจุดยอด (จุดเหลือง) ก่อนนะ', st.svg);
          },
          onAligned() { api.say('เข้าที่แล้ว! หาเลข ' + size + ' บนสเกล แล้วลากจุดชมพูไปที่ขีดนั้น', 'happy'); }
        });
        go.addEventListener('click', () => {
          if (busy) return;
          if (!st.aligned()) return api.nudge('วางโพรแทรกเตอร์ให้ถูกที่ก่อนนะ!', go);
          const r = st.markReading();
          if (r == null) return api.nudge('ลากจุดชมพูไปที่ขีด ' + size + ' องศา ก่อนนะ', go);
          busy = true; go.disabled = true;
          st.drawRay().then(res => {
            const dg = M.diagBuild(size, res.reading);
            if (dg === 'ok') {
              api.correct(praise() + ' มุมที่สร้างได้ ' + D(res.reading) + (res.reading !== size ? ' ใกล้เคียง ' + D(size) + ' มาก' : ' ตรงตามแบบเป๊ะ!'), go);
              return;
            }
            const msg = dg === 'wrongScale' ? 'มุมที่ได้คือ ' + D(res.reading) + ' ไม่ใช่ ' + D(size) + ' ใช้สเกลผิดฝั่งแล้ว! เริ่มนับ 0 จากแขนฐาน'
              : dg === 'close' ? 'มุมที่ได้คือ ' + D(res.reading) + ' ใกล้ ' + D(size) + ' แล้ว! ขยับจุดชมพูอีกนิด'
              : 'มุมที่ได้คือ ' + D(res.reading) + ' ยังไม่ใช่ ' + D(size);
            api.wrong(msg, go);
            setTimeout(() => { if (!api.isCurrent()) return; st.clearRay(); busy = false; go.disabled = false; }, 900);
          });
        });
      },
      hint(l) {
        if (!st.aligned()) {
          if (l === 1) st.cue('ring', true);
          if (l === 3) { st.cue('ring', true); st.cue('ghost', true); }
          return [
            'ขั้นแรก วางจุดกึ่งกลาง (กากบาทแดง) ทับจุดยอดมุม (จุดเหลือง)',
            'แล้วหมุนให้เส้นฐานทับแขนฐาน (เส้นสีฟ้า) ครึ่งวงกลมจะหันขึ้นหรือหันลงก็ได้',
            'ดูเงาประสีเหลือง นั่นคือตำแหน่งที่ถูก'
          ][l - 1];
        }
        const sc = scaleNow();
        if (l === 3) { st.setMark(size); }
        return [
          'เลข 0 อยู่ตรงแขนฐาน · ' + sideTxt(sc) + ' ใช้' + scaleTok(sc) + ' เริ่มนับ 0 จากตรงนั้น',
          'หาเลข ' + size + ' บน' + scaleTok(sc) + ' (ขีดยาว = ทีละ 10 ขีดกลาง = 5) แล้วลากจุดชมพูไปที่ขีดนั้น',
          'โปรโปรทำเครื่องหมายให้แล้ว ลองกด ลากเส้นมุม ดูนะ!'
        ][l - 1];
      },
      get answer() { return 'ใช้' + scaleTok(scaleNow()) + ' หาเลข ' + size + ' ทำเครื่องหมาย แล้วลากเส้นจากจุดยอด'; },
      solve() { st.solve(() => { st.setMark(size); setTimeout(() => st.drawRay(), 300); }); }
    };
  }

  /* ซิกแซกอ้างว่าวัด/สร้างมุมได้ค่าหนึ่ง จริงหรือไม่ — c = {size, claim, kind:'measure'|'build', story} */
  function tClaim(c) {
    const f = M.measureQ(2, 'flat');
    const fig = M.figure({ b: f.b, dir: f.dir, size: c.size });
    const real = c.claim === c.size;
    let st, ch;
    const sc = M.ideals(fig).filter(i => i.id === 1)[0].scale;
    return {
      skill: 'sense',
      size: c.size,
      title: 'ซิกแซกพูดถูกหรือผิด?',
      say: 'ฟังให้ดี! ซิกแซกอ้างว่ามุมนี้ได้ ' + D(c.claim) + ' ตัดสินเลย ถูกหรือผิด?',
      judSay: c.kind === 'build' ? 'ข้าสร้างมุม ' + c.want + '° เสร็จแล้ว! สวยเป๊ะ ใครจะกล้าเถียง!' : 'ข้าวัดมุมนี้ได้ ' + c.claim + '° แน่นอน! ข้าเก่งที่สุด!',
      render(el, api) {
        el.innerHTML = '<div class="qa"><div class="qa-q"><div class="w-stage"></div></div><div class="qa-a"><div class="ticket claim"><span class="tk-lbl">ซิกแซกบอกว่า</span><span class="tk-val">' +
          rich(c.kind === 'build' ? 'สร้างมุม ' + D(c.want) + ' ได้แล้ว' : 'มุมนี้ ' + D(c.claim)) + '</span></div><div class="w-host"></div></div></div>';
        st = W.angleStage(el.querySelector('.w-stage'), { mode: 'measure', fig, prot: 'ideal', idealId: 1, glow: true, zeroCue: false, lite: true });
        ch = W.choice(el.querySelector('.w-host'), {
          cls: 'opts-2 opts-yn',
          options: [{ html: art.icon('check') + '<span>ถูก</span>', value: true }, { html: art.icon('cross') + '<span>ผิด</span>', value: false }],
          onPick(v, b) {
            if (v === real) {
              b.classList.add('good'); ch.lock(); st.cue('zero', true);
              const why = real ? 'มุมนี้วัดได้ ' + D(c.size) + ' ซิกแซกอ่านถูกแล้ว'
                : (c.kind === 'build' ? 'มุมที่สร้างได้จริงคือ ' + D(c.size) + ' ไม่ใช่ ' + D(c.want) + ' เพราะใช้สเกลผิดฝั่ง'
                  : 'มุมนี้ได้ ' + D(c.size) + ' ซิกแซกอ่านจากสเกลผิดฝั่ง ได้ ' + D(c.claim));
              api.correct(praise() + ' ' + why + '\nเลข 0 ต้องอยู่ที่แขนฐาน ใช้' + scaleTok(sc) + ' นะ!', b);
            } else { ch.dim(b); api.wrong(real ? 'ซิกแซกอ่านถูกนะ ลองตรวจสเกลที่ถูกอีกที' : 'ลองตรวจดูอีกที ซิกแซกอ่านถูกจริงไหม', b); }
          }
        });
      },
      hint(l) {
        if (l === 3 && st) st.cue('zero', true);
        return [
          'มุมนี้แคบหรือกว้างกว่ามุมฉาก? เลขที่ซิกแซกบอกเข้ากับรูปไหม?',
          'หาเลข 0 ที่แขนฐาน (สีฟ้า) ก่อน แล้วอ่านเลขที่แขนสีชมพูผ่านด้วยสเกลเดียวกัน',
          'ดูวงกลมที่เรืองแสง แล้วอ่านเลขตรงนั้นเทียบกับที่ซิกแซกบอก'
        ][l - 1];
      },
      answer: real ? 'ซิกแซกถูก มุมนี้ ' + D(c.size) : 'ซิกแซกอ่านผิด มุมที่ถูกคือ ' + D(c.size) + ' ไม่ใช่ ' + D(c.claim),
      solve() { ch.mark(real, 'good'); st.cue('zero', true); }
    };
  }

  /* คัดลอกมุม : วัดมุมต้นแบบ แล้วสร้างมุมขนาดเดียวกัน (วัด → สร้าง) */
  function tCopy(level) {
    const src = M.measureQ(level, level === 1 ? 'up' : 'flat');
    const dst = M.buildQ(level, 'flat');
    dst.size = src.size;
    let phase = 1, stm, np, stb, go;
    return {
      skill: 'apply',
      size: src.size,
      title: 'คัดลอกมุม : วัดแล้วสร้างให้เท่ากัน',
      say: 'ขั้นแรก วัดมุมของป้ายต้นแบบก่อนว่ากี่องศา!',
      render(el, api) {
        function phase1() {
          el.innerHTML = '<div class="phase-tag">ขั้นที่ 1 วัดมุมต้นแบบ</div><div class="qa"><div class="qa-q"><div class="w-stage"></div></div><div class="qa-a"><div class="w-host"></div></div></div>';
          stm = W.angleStage(el.querySelector('.w-stage'), { mode: 'measure', fig: src, prot: level >= 3 ? 'free' : 'ideal', ring: level < 3, glow: true, lite: true,
            onAligned() { np.host.querySelector('.np').classList.remove('waiting'); } });
          np = W.numpad(el.querySelector('.w-host'), { max: 3, go: 'ตรวจคำตอบ', onEnter: () => go.click() });
          go = np.go;
          if (level >= 3) np.host.querySelector('.np').classList.add('waiting');
          go.addEventListener('click', () => {
            if (level >= 3 && !stm.aligned()) return api.nudge('วางโพรแทรกเตอร์ให้ถูกที่ก่อนนะ!', go);
            if (np.empty()) return api.nudge('ยังไม่ได้กดตัวเลขเลย!', go);
            const a = np.get(), d = Math.abs(a - src.size);
            if (d <= (level >= 3 ? 1 : 0)) {
              np.lock(); audio.sfx('star'); ui.sparkle(go, 10);
              api.say('วัดได้ ' + D(src.size) + '! ขั้นต่อไป สร้างมุมใหม่ให้เท่ากันเลย!', 'cheer');
              phase = 2;
              setTimeout(() => { if (api.isCurrent()) phase2(); }, 1400);
            } else api.wrong(M.diagMeasure(src.size, a) === 'wrongScale' ? 'นั่นคือเลขจากสเกลผิดฝั่งนะ!' : null, go);
          });
        }
        function phase2() {
          el.innerHTML = '<div class="phase-tag p2">ขั้นที่ 2 สร้างมุม ' + rich(D(src.size)) + ' ให้เท่าต้นแบบ</div><div class="w-stage"></div>' + goBtn('ลากเส้นมุม', 'pencil');
          go = el.querySelector('.act-go');
          stb = W.angleStage(el.querySelector('.w-stage'), { mode: 'build', fig: dst.f, prot: level >= 3 ? 'free' : 'ideal', ring: level < 3, lite: true });
          let busy = false;
          go.addEventListener('click', () => {
            if (busy) return;
            if (!stb.aligned()) return api.nudge('วางโพรแทรกเตอร์ให้ถูกที่ก่อนนะ!', go);
            const r = stb.markReading();
            if (r == null) return api.nudge('ลากจุดชมพูไปที่ขีด ' + src.size + ' องศา ก่อนนะ', go);
            busy = true; go.disabled = true;
            stb.drawRay().then(res => {
              const dg = M.diagBuild(src.size, res.reading);
              if (dg === 'ok') api.correct(praise() + ' วัดได้ ' + D(src.size) + ' สร้างได้ ' + D(res.reading) + ' มุมเท่ากันแล้ว!', go);
              else {
                api.wrong(dg === 'wrongScale' ? 'ได้ ' + D(res.reading) + ' ใช้สเกลผิดฝั่งแล้ว เริ่มนับ 0 จากแขนฐาน' : 'ได้ ' + D(res.reading) + ' ยังไม่ใช่ ' + D(src.size), go);
                setTimeout(() => { if (!api.isCurrent()) return; stb.clearRay(); busy = false; go.disabled = false; }, 900);
              }
            });
          });
        }
        phase1();
      },
      hint(l) {
        if (phase === 1) {
          if (l === 3 && stm) { stm.cue('zero', true); stm.cue('glow', true); }
          return ['หาเลข 0 ที่แขนฐาน แล้วอ่านเลขที่แขนสีชมพูผ่าน', 'ขีดกลาง = 5 ขีดยาว = 10 ช่วยนับได้', 'ดูวงกลมเหลืองที่เรืองแสง'][l - 1];
        }
        if (l === 3 && stb) stb.setMark(src.size);
        return ['ใช้สเกลที่เริ่มนับ 0 ตรงแขนฐาน', 'หาเลข ' + src.size + ' แล้วลากจุดชมพูไปที่ขีดนั้น', 'โปรโปรทำเครื่องหมายให้แล้ว กดลากเส้นมุมได้เลย'][l - 1];
      },
      answer: 'วัดได้ ' + D(src.size) + ' แล้วสร้างมุม ' + D(src.size) + ' ให้เท่ากัน',
      solve() {
        if (phase === 1) { stm.solve(() => { np.set(src.size); }); return; }
        stb.solve(() => { stb.setMark(src.size); setTimeout(() => stb.drawRay(), 300); });
      }
    };
  }

  /* ══════════════════════════════════════════════
     SKILLS + STAGES
     ══════════════════════════════════════════════ */
  const SKILLS = {
    parts: { name: 'รู้จักโพรแทรกเตอร์และองศา', rec: 'ทบทวนส่วนต่าง ๆ ของโพรแทรกเตอร์: จุดกึ่งกลาง เส้นฐาน {out} {in}' },
    place: { name: 'วางโพรแทรกเตอร์ให้ถูกที่', rec: 'ฝึกวางโพรแทรกเตอร์: จุดกึ่งกลางทับจุดยอด เส้นฐานทับแขนมุม' },
    measure: { name: 'วัดขนาดของมุม', rec: 'ฝึกอ่านค่ามุมจากสเกลที่เริ่มนับ 0 ที่เส้นฐาน' },
    build: { name: 'สร้างมุมตามขนาดที่กำหนด', rec: 'ฝึกหาขีดของขนาดมุมบนสเกลฝั่งที่ถูก แล้วลากเส้นจากจุดยอด' },
    sense: { name: 'ประมาณและตรวจสอบคำตอบ', rec: 'ลองเดาก่อนว่ามุมแคบหรือกว้างกว่ามุมฉาก แล้วตรวจกับค่าที่อ่านได้' },
    apply: { name: 'นำไปใช้ซ่อมเครื่องเล่น', rec: 'ฝึกวัดมุมแล้วสร้างมุมให้เท่ากัน โดยตรวจสเกลทุกครั้ง' }
  };

  const STAGES = [
    /* ───────── 1 บูธโปรโปร ───────── */
    {
      id: 1, name: 'บูธโปรโปร', topic: 'รู้จักโพรแทรกเตอร์และองศา', color: '#ff5fa2', icon: 'booth',
      intro: [
        { who: 'pro', mood: 'cheer', sfx: 'horn', text: 'ยินดีต้อนรับสู่บูธของฉัน! ฉันคือโพรแทรกเตอร์ เครื่องมือวัดมุม!',
          show: box => { box.innerHTML = showCard(art.protractor({ lite: true })); } },
        { who: 'pro', mood: 'talk', text: 'ขนาดของมุมวัดเป็น **องศา** เขียนว่า {d:45} อ่านว่า สี่สิบห้าองศา',
          show: box => { box.innerHTML = showCard(figSvg(M.figure({ b: 0, dir: 1, size: 45 })), '{d:45}'); } },
        { who: 'pro', mood: 'happy', text: 'มาสำรวจส่วนต่าง ๆ ของฉันกัน!', last: 'ไปเลย' }
      ],
      learn: [() => tParts(), () => tFan([
        { deg: 90, ask: 'ลากแขนสีชมพูให้เปิดเป็น {d:90} ดูกรอบสีเขียวที่โผล่ขึ้นมา!', learn: 'นี่คือ **มุมฉาก** เท่ากับ {d:90} เหมือนมุมกระดาษเลย!' },
        { deg: 180, ask: 'ลองเปิดจนสุดเป็นเส้นตรง {d:180} ซิ!', learn: 'เส้นตรงทั้งเส้นคือ **มุมตรง** เท่ากับ {d:180}' }
      ], { title: 'ลากแขนมุมให้เปิดตามที่ต้องการ' })],
      missions: 4,
      gen(level, i, run) {
        if (i === 0) return tScalePick(level);
        if (i === 1) return tPartPick();
        if (i === 2) { const t = tEstimate(level, run.lastEst); run.lastEst = { size: t.size }; return t; }
        const pool = level === 1 ? [30, 60, 120, 150] : level === 2 ? [45, 75, 105, 135, 165] : [35, 55, 85, 115, 145, 155];
        const d = pick(pool);
        return tFan([{ deg: d, learn: 'ได้ ' + D(d) + ' แล้ว! เลขบนสเกลช่วยบอกองศา' }], { skill: 'parts', title: 'เปิดแขนมุมให้ได้ ' + D(d), story: null });
      },
      recap: ['โพรแทรกเตอร์ใช้วัดมุม หน่วยเป็น **องศา** เขียนแทนด้วย °', 'จุดกึ่งกลางต้องทับจุดยอด เส้นฐานต้องทับแขนมุม', '{out} เริ่ม 0 ทางขวา · {in} เริ่ม 0 ทางซ้าย', 'มุมฉาก = {d:90} · มุมตรง = {d:180}'],
      book: ['โพรแทรกเตอร์ใช้วัดขนาดของมุม หน่วยของมุมคือ **องศา** เขียนว่า °', 'ส่วนสำคัญ: **จุดกึ่งกลาง** (กากบาทแดง) ต้องวางทับจุดยอดมุม · **เส้นฐาน** ต้องวางทับแขนของมุม', 'มีเลขสองแถว: {out} (ฟ้า) เริ่มนับ 0 จากทางขวา · {in} (ส้ม) เริ่มนับ 0 จากทางซ้าย', '**มุมฉาก** = {d:90} · **มุมตรง** = {d:180} · มุมแหลมน้อยกว่า {d:90} · มุมป้านมากกว่า {d:90}'],
      teacher: ['ถามนักเรียน: ทำไมโพรแทรกเตอร์จึงมีตัวเลขสองแถว แล้วเลือกใช้แถวไหน?', 'ให้ยกตัวอย่างสิ่งของในห้องเรียนที่มีมุมฉาก มุมแหลม และมุมป้าน', 'ให้ทดลองเปิดไม้บรรทัดสองอันเป็นมุมต่าง ๆ แล้วเดาองศาก่อนวัด']
    },
    /* ───────── 2 รถไฟเหาะสายรุ้ง ───────── */
    {
      id: 2, name: 'รถไฟเหาะสายรุ้ง', topic: 'วางโพรแทรกเตอร์ให้ถูกที่', color: '#ff9a1f', icon: 'coaster',
      intro: [
        { who: 'pro', mood: 'wow', sfx: 'whoosh', text: 'รถไฟเหาะรางเบี้ยวไปหมด! ต้องวัดมุมของรางก่อนซ่อม!' },
        { who: 'zig', mood: 'laugh', text: 'ฮิ ๆ ข้าบิดรางเอง! วัดให้ถูกสิ ถ้าทำได้!' },
        { who: 'pro', mood: 'think', text: 'วัดให้ถูกต้องต้องวางฉันให้ถูกที่ก่อน! มี 2 อย่างที่ต้องทับ',
          show: box => {
            const f = M.figure({ b: 0, dir: 1, size: 55 });
            box.innerHTML = showCard('<div class="show-fig">' + art.miniPlacement(f, { x: f.V.x, y: f.V.y, rot: 0 }, { nums: true }) + '</div>', 'จุดกึ่งกลางทับ **จุดยอด** · เส้นฐานทับ **แขนมุม**');
          } },
        { who: 'pro', mood: 'cheer', text: 'ลองวางเองเลย! ลากฉันไปวาง แล้วหมุนด้วยปุ่มสีเหลือง!', last: 'ลองเลย' }
      ],
      learn: [() => tPlace(M.figure({ b: 0, dir: 1, size: 55 }), { level: 1, title: 'ลองวางโพรแทรกเตอร์บนมุมนี้', say: 'ลากฉันไปวาง! จุดกึ่งกลางสีแดงต้องทับจุดยอดสีเหลือง แล้วหมุนด้วยปุ่มสีเหลืองให้เส้นฐานทับแขนมุม!' })],
      missions: 4,
      gen(level, i, run) {
        const tilt = level === 1 ? 'up' : level === 2 ? 'flat' : 'any';
        if (i === 3) return tDetective(M.measureQ(level, 'flat'));
        let f = M.measureQ(level, tilt, run.last);
        run.last = f;
        if (i === 2 && level >= 2) f = belowFig(pick(M.SIZES[2]));
        const stories = ['รางที่ 1 ช่วยวางโพรแทรกเตอร์ที่รางนี้', 'รางที่ 2 วางให้ถูกที่อีกครั้ง', 'รางที่ 3 ระวัง! แขนมุมอยู่ใต้เส้น ต้องพลิกโพรแทรกเตอร์'];
        return tPlace(f, { level, story: stories[i], okText: i === 2 && level >= 2 ? 'พลิกโพรแทรกเตอร์ได้ถูกแล้ว แขนอีกข้างอยู่ใต้โค้ง!' : null });
      },
      recap: ['ลากจุดกึ่งกลาง (กากบาทแดง) ไปทับจุดยอดมุมก่อน', 'หมุนให้เส้นฐานทับแขนมุมข้างหนึ่ง', 'แขนอีกข้างต้องอยู่ใต้ส่วนโค้ง ถ้าไม่ใช่ให้พลิกโพรแทรกเตอร์ครึ่งรอบ'],
      book: ['ก่อนวัดทุกครั้ง ต้องวางโพรแทรกเตอร์ให้ถูกที่ก่อน', '1) จุดกึ่งกลางทับ **จุดยอดมุม**', '2) เส้นฐานทับ **แขนมุม** ข้างหนึ่ง', '3) แขนอีกข้างต้องอยู่ใต้ส่วนโค้งของโพรแทรกเตอร์ ถ้าอยู่ด้านล่าง ให้พลิกครึ่งรอบ'],
      teacher: ['ถามนักเรียน: ถ้าจุดกึ่งกลางไม่ทับจุดยอด ค่าที่อ่านจะผิดอย่างไร?', 'ให้นักเรียนจับคู่ ตรวจการวางโพรแทรกเตอร์ของเพื่อนด้วยสองข้อ: จุดยอด และ แขนมุม']
    },
    /* ───────── 3 ชิงช้าหมุนติ้ว ───────── */
    {
      id: 3, name: 'ชิงช้าหมุนติ้ว', topic: 'วัดขนาดของมุม', color: '#20c4b4', icon: 'swing',
      intro: [
        { who: 'pro', mood: 'wow', text: 'ชิงช้าหมุนติ้วหยุดแล้ว! ป้ายบอกมุมของเสาหายหมดเลย!' },
        { who: 'pro', mood: 'talk', text: 'วางฉันให้ถูกที่แล้ว เริ่มนับ 0 ที่แขนฐาน อ่านเลขตรงที่แขนอีกข้างผ่าน',
          show: box => {
            const f = M.figure({ b: 0, dir: 1, size: 50 });
            box.innerHTML = showCard('<div class="show-fig">' + art.miniPlacement(f, { x: f.V.x, y: f.V.y, rot: 0 }) + '</div>', 'แขนสีชมพูผ่านเลข **50** บน{out}');
          } },
        { who: 'pro', mood: 'think', text: 'ระวัง! มีเลขสองแถว ต้องใช้แถวที่มีเลข 0 อยู่ตรงแขนฐาน!' },
        { who: 'zig', mood: 'laugh', text: 'ข้าชอบสลับสเกลให้มั่ว! ใครอ่านพลาดข้ากินเรียบ!', last: 'ท้าได้เลย' }
      ],
      learn: [
        () => tMeasure(M.figure({ b: 0, dir: 1, size: 50 }), { how: 'choice', level: 1, title: 'มุมนี้ได้กี่องศา? (แขนฐานอยู่ทางขวา)' }),
        () => tMeasure(M.figure({ b: 180, dir: -1, size: 130 }), { how: 'choice', level: 1, title: 'มุมนี้ได้กี่องศา? (แขนฐานอยู่ทางซ้าย)' })
      ],
      missions: 5,
      gen(level, i, run) {
        if (i === 4) {
          const f = M.measureQ(2, 'flat');
          return tClaim(claimOf('measure', f.size));
        }
        const how = level === 1 ? (i < 2 ? 'choice' : 'pad') : (i === 0 ? 'pad' : 'self');
        const tilt = level === 1 ? 'up' : level === 2 ? (i === 3 ? 'any' : 'flat') : 'any';
        const f = M.measureQ(level, tilt, run.last);
        run.last = f;
        const stories = ['เสาต้นที่ 1', 'เสาต้นที่ 2', 'เสาต้นที่ 3', 'เสาต้นที่ 4'];
        return tMeasure(f, { how: level === 1 && i === 2 ? 'self' : how, level, story: stories[i] + ' วัดมุมที่เสากับพื้นหน่อย' });
      },
      recap: ['วางโพรแทรกเตอร์ให้ถูกที่ก่อนวัดทุกครั้ง', 'เริ่มนับ 0 ที่แขนฐาน ใช้สเกลที่มีเลข 0 ตรงนั้น', 'อ่านเลขตรงที่แขนอีกข้างผ่าน ขีดกลาง = 5 ขีดยาว = 10', 'เดาก่อนว่าแคบหรือกว้างกว่ามุมฉาก ช่วยตรวจคำตอบได้'],
      book: ['**วิธีวัดมุม**: 1) วางจุดกึ่งกลางทับจุดยอด 2) วางเส้นฐานทับแขนมุมข้างหนึ่ง 3) อ่านเลขตรงที่แขนอีกข้างผ่าน', 'แขนฐานอยู่ทางขวา ใช้ {out} · แขนฐานอยู่ทางซ้าย ใช้ {in}', 'ตัวอย่างตรวจคำตอบ: มุมที่แคบกว่ามุมฉาก ต้องอ่านได้น้อยกว่า {d:90}', 'ถ้าอ่านได้ {d:140} แต่มุมดูแคบ แสดงว่าอ่านผิดสเกล ค่าที่ถูกคือ {d:40}'],
      teacher: ['ถามนักเรียน: ถ้าอ่านได้ 140° แต่มุมดูแคบกว่ามุมฉาก เกิดอะไรขึ้น?', 'ให้นักเรียนวัดมุมของมุมห้องเรียน มุมกระดาน และมุมโต๊ะ แล้วเปรียบเทียบกัน']
    },
    /* ───────── 4 ปราสาทกระจกวิเศษ ───────── */
    {
      id: 4, name: 'ปราสาทกระจกวิเศษ', topic: 'สร้างมุมตามขนาดที่กำหนด', color: '#8b5cf6', icon: 'castle',
      intro: [
        { who: 'pro', mood: 'wow', text: 'ปราสาทกระจกสร้างไม่เสร็จ! ต้องวาดมุมให้ได้ขนาดตามแบบ!' },
        { who: 'pro', mood: 'talk', text: 'มี 3 ขั้น: วางฉันให้ถูกที่ · ทำเครื่องหมายที่ขนาดมุม · ลากเส้น!',
          show: box => {
            box.innerHTML = '<div class="steps3"><div class="s3"><b>1</b><span>วางโพรแทรกเตอร์ให้ทับแขนฐาน</span></div><div class="s3"><b>2</b><span>ทำเครื่องหมายที่เลขขนาดมุม</span></div><div class="s3"><b>3</b><span>ลากเส้นจากจุดยอดผ่านเครื่องหมาย</span></div></div>';
          } },
        { who: 'zig', mood: 'smirk', text: 'ง่ายจะตาย! ข้าลากเส้นมั่ว ๆ ก็ได้ ฮ่า ๆ' },
        { who: 'pro', mood: 'happy', text: 'ไม่ได้นะ ต้องเป๊ะ! ลองสร้างมุมแรกกัน!', last: 'ลองเลย' }
      ],
      learn: [
        () => tBuild({ size: 60, f: M.figure({ b: 0, dir: 1, size: 0 }) }, { level: 1, readout: true, title: 'สร้างมุม {d:60} (แขนฐานอยู่ทางขวา)', say: 'โปรโปรวางไว้ให้แล้ว! ลากจุดชมพูไปที่ขีด 60 บน{out} เลขขึ้นให้ดูข้าง ๆ ด้วย!' }),
        () => tBuild({ size: 130, f: M.figure({ b: 180, dir: 1, size: 0 }) }, { level: 1, readout: true, title: 'สร้างมุม {d:130} (แขนฐานอยู่ทางซ้าย)', say: 'คราวนี้แขนฐานอยู่ทางซ้าย! เริ่มนับ 0 จากทางซ้าย ใช้ {in} ลากจุดชมพูไปที่ 130!' })
      ],
      missions: 5,
      gen(level, i, run) {
        if (i === 4) {
          const q = M.buildQ(2, 'flat', run.last);
          return tClaim(Math.random() < 0.35 ? { kind: 'build', size: q.size, claim: q.size, want: q.size } : { kind: 'build', size: 180 - q.size, claim: q.size, want: q.size });
        }
        const q = M.buildQ(level, level === 3 && i >= 2 ? 'any' : 'flat', run.last);
        run.last = q;
        const stories = ['ประตูปราสาทบานที่ 1', 'หน้าต่างกระจกบานที่ 2', 'หลังคาปราสาททางซ้าย', 'หลังคาปราสาททางขวา'];
        return tBuild(q, { level, readout: level === 1 && i < 3, story: stories[i] + ' ต้องสร้างมุมตามแบบ' });
      },
      recap: ['วางโพรแทรกเตอร์ให้เส้นฐานทับแขนฐาน จุดกึ่งกลางทับจุดยอด', 'หาเลขขนาดมุมบนสเกลที่เริ่ม 0 ตรงแขนฐาน แล้วทำเครื่องหมาย', 'ลากเส้นจากจุดยอดผ่านเครื่องหมาย ได้มุมที่ต้องการ', 'ถ้าได้ 180° ลบขนาดมุม แสดงว่าใช้สเกลผิดฝั่ง'],
      book: ['**วิธีสร้างมุม**: 1) วางโพรแทรกเตอร์ให้จุดกึ่งกลางทับจุดยอด เส้นฐานทับแขนฐาน', '2) หาเลขขนาดมุมบนสเกลที่เริ่มนับ 0 จากแขนฐาน แล้วทำเครื่องหมายที่ขีดนั้น', '3) ใช้ไม้บรรทัดลากเส้นจากจุดยอดผ่านเครื่องหมาย ได้แขนอีกข้าง', 'ตัวอย่าง: สร้าง {d:50} แต่ใช้สเกลผิดฝั่ง จะได้ {d:130}'],
      teacher: ['ถามนักเรียน: ถ้าอยากได้มุม 50° แต่ทำเครื่องหมายที่เลข 130 ของอีกสเกล จะได้มุมกี่องศา เพราะอะไร?', 'ให้นักเรียนสร้างมุม 30° 60° 120° บนกระดาษจริง แล้วแลกกันตรวจ']
    },
    /* ───────── 5 ปราสาทยักษ์สายรุ้ง ───────── */
    {
      id: 5, name: 'ปราสาทยักษ์สายรุ้ง', topic: 'ภารกิจสุดท้าย: ซ่อมเครื่องเล่นทั้งสวน', color: '#ff5a4e', icon: 'grand', final: true,
      intro: [
        { who: 'pro', mood: 'wow', sfx: 'whoosh', text: 'ปราสาทยักษ์สายรุ้งเบี้ยวที่สุด! ซิกแซกเอาแบบซ่อมไปซ่อนด้วย!' },
        { who: 'zig', mood: 'laugh', text: 'ถ้าซ่อมได้ครบ ข้ายอมแพ้เลย! ฮ่า ๆ ๆ' },
        { who: 'pro', mood: 'cheer', text: 'ใช้ทั้งการวัดมุมและสร้างมุมที่เรียนมา! ลุยกัน!', last: 'ลุย!' }
      ],
      learn: [],
      missions: 6,
      gen(level, i, run) {
        run.last = run.last || null;
        if (i === 0) return tMeasure(M.measureQ(level, level === 1 ? 'up' : 'any'), { how: level === 1 ? 'pad' : 'self', level, story: 'ป้ายทางเข้าสวนสนุกเบี้ยว วัดมุมที่ป้ายหน่อย', skill: 'apply' });
        if (i === 1) { const q = M.buildQ(level, 'flat'); return tBuild(q, { level, story: 'สไลเดอร์ต้องเอียงทำมุม ' + D(q.size) + ' กับพื้น สร้างมุมตามแบบ', skill: 'apply' }); }
        if (i === 2) return tDetective(M.measureQ(2, 'any'));
        if (i === 3) return tCopy(level);
        if (i === 4) {
          if (Math.random() < 0.5) { const f = M.measureQ(2, 'flat'); return tClaim(claimOf('measure', f.size)); }
          const q = M.buildQ(2, 'flat'); return tClaim(Math.random() < 0.35 ? { kind: 'build', size: q.size, claim: q.size, want: q.size } : { kind: 'build', size: 180 - q.size, claim: q.size, want: q.size });
        }
        const q = M.buildQ(Math.max(level, 2), level >= 2 ? 'any' : 'flat');
        return tBuild(q, { level: Math.max(level, 2), free: level >= 2, story: 'หลังคายอดปราสาทต้องเอียง ' + D(q.size) + ' สร้างมุมให้เป๊ะ', skill: 'apply' });
      },
      recap: ['วัดมุม: วางโพรแทรกเตอร์ให้ถูกที่ แล้วอ่านเลขจากสเกลที่เริ่ม 0 ที่แขนฐาน', 'สร้างมุม: หาเลขขนาดมุมบนสเกลที่ถูกฝั่ง ทำเครื่องหมาย แล้วลากเส้น', 'ตรวจคำตอบด้วยการเดา: แคบหรือกว้างกว่ามุมฉาก'],
      book: ['สรุปทั้งหมด: **วัดมุม** และ **สร้างมุม** ใช้โพรแทรกเตอร์วางแบบเดียวกัน ต่างกันที่อ่านค่า หรือทำเครื่องหมาย', 'เลข 0 ต้องอยู่ที่แขนฐานเสมอ เลือกสเกลที่เริ่ม 0 ตรงนั้น', 'ตรวจสอบด้วยการเปรียบเทียบกับมุมฉาก {d:90} ทุกครั้ง'],
      teacher: ['ให้นักเรียนออกแบบสไลเดอร์ในกระดาษ กำหนดมุมเอียง แล้วสร้างมุมจริงด้วยโพรแทรกเตอร์', 'ถามนักเรียน: เมื่อเจอข้อผิดพลาดแบบซิกแซก เรามีวิธีตรวจคำตอบอย่างไร?'],
      outro: [
        { who: 'zig', mood: 'shock', text: 'ไม่จริง! มุมทุกอย่างกลับมาเป๊ะหมดเลย!' },
        { who: 'zig', mood: 'happy', text: 'ก็ได้... ข้ายอมแพ้! ขอเรียนวัดมุมด้วยคนได้ไหม?' },
        { who: 'pro', mood: 'cheer', sfx: 'airhorn', text: 'ได้เลย! สวนสนุกเมืองมุมกลับมาเปิดแล้ว! ขอบคุณนักซ่อมมุมทุกคน!', last: 'เย้!' }
      ]
    }
  ];

  AP.STAGES = STAGES;
  AP.SKILLS = SKILLS;
  AP.LEAD_WRONG = LEAD_WRONG;
})();
