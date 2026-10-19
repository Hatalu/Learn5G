/* ═══════════════════════════════════════════════════════════
   MOON-MOON SKY STATION — ตัวช่วยสร้างภารกิจ (task builders)
   task = { skill, title, say, judSay?, render(el, api), hint(level), answer, solve() }
   api  = { correct(explain, at), wrong(lead?, at), nudge(text, at), say(), tub() }  (อยู่ใน main.js)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const SK = window.SK;
  const { art, ui, audio } = SK;
  const { pick } = SK;
  const V = () => window.VOICED || {};

  /* คำชม/ให้กำลังใจ = คลิปเสียงผู้หญิงจากคลัง (มูนมูน = Jessica) ข้อความบนจอตรงกับเสียงเสมอ */
  const lineOf = id => ({ clip: id, text: (V()[id] || '') });
  const PRAISE_IDS = ['guide_f/praise1', 'guide_f/praise2', 'guide_f/praise3', 'guide_f/praise4', 'guide_f/praise5', 'guide_f/praise6'];
  const OOPS_IDS = ['guide_f/oops1', 'guide_f/oops2', 'guide_f/oops3', 'guide_f/oops4'];
  let lastP = '', lastO = '';
  function fresh(ids, last) { const ok = ids.filter(x => x !== last); return pick(ok); }
  const praiseLine = () => { lastP = fresh(PRAISE_IDS, lastP); return lineOf(lastP); };
  const oopsLine = () => { lastO = fresh(OOPS_IDS, lastO); return lineOf(lastO); };
  const FALL_PRAISE = ['เก่งมาก!', 'ถูกต้อง!', 'เยี่ยมไปเลย!', 'ใช่เลย!'];
  const FALL_OOPS = ['เกือบแล้ว! ลองอีกนิด', 'ไม่เป็นไร ลองใหม่ได้!', 'ยังไม่ใช่ แต่ใกล้แล้ว!'];

  const rich = s => ui.rich(s, true);
  const storyP = s => s ? '<p class="story">' + rich(s) + '</p>' : '';
  const txt = (v, a) => typeof v === 'function' ? v(a) : (v || '');
  const yn = (a, b) => [
    { html: art.icon('check') + '<span>' + (a || 'จริง') + '</span>', value: true },
    { html: art.icon('cross') + '<span>' + (b || 'ไม่จริง') + '</span>', value: false }
  ];
  const textOpt = (label, sub) => '<span class="otxt">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span>';
  const moonOpt = (idx, name) => '<span class="omoon">' + art.moon(SK.epsOfIdx(idx)) + (name ? '<b>' + SK.PHASES[idx].n + '</b>' : '') + '</span>';
  const planetOpt = id => '<span class="oplanet">' + art.planetSvg(id, 44) + '<b>' + SK.plName(id) + '</b></span>';
  const rchip = (t, c) => '<span class="rchip ' + (c || '') + '">' + t + '</span>';

  /* ลำดับ 1,2,3 โดยแตะการ์ด · cards = [{id, html}] */
  function tapOrder(host, o) {
    host.innerHTML = '<div class="ord"><p class="ord-ask">' + (o.ask || 'แตะเรียงตามลำดับ') + '</p><div class="ord-cards">' +
      o.cards.map(c => '<button class="icard-btn ord-c" data-id="' + c.id + '">' + c.html + '<i class="ord-n"></i></button>').join('') +
      '</div><button class="btn btn-soft btn-sm ord-reset">' + art.icon('undo') + '<span>เรียงใหม่</span></button></div>';
    const cards = Array.from(host.querySelectorAll('.ord-c')), order = [];
    function paint() {
      cards.forEach(c => {
        const i = order.indexOf(c.dataset.id);
        c.classList.toggle('picked', i >= 0);
        c.querySelector('.ord-n').textContent = i >= 0 ? (o.labels ? o.labels[i] : i + 1) : '';
      });
    }
    cards.forEach(c => c.addEventListener('click', () => {
      if (order.indexOf(c.dataset.id) >= 0 || order.length >= o.cards.length) return;
      audio.unlock(); order.push(c.dataset.id); audio.sfx('pop', order.length); paint();
      if (order.length === o.cards.length) o.onComplete(order.slice());
    }));
    host.querySelector('.ord-reset').addEventListener('click', () => { order.length = 0; audio.sfx('tick'); paint(); });
    return {
      order, cards,
      reset() { order.length = 0; paint(); },
      set(list) { order.length = 0; list.forEach(x => order.push(x)); paint(); }
    };
  }

  /* ภารกิจเลือกตอบแบบทั่วไป
     o = {skill,title,say,judSay,story, fig(q,api,task)→bench | html, options:[{html,value}], answer, cls,
          explain, wrongMsg(v), hints:[h1,h2,h3], answerText, fx3(bench,task), onRight(bench,api,v), solveFx(bench)} */
  function taskChoice(o) {
    let ch = null, bench = null;
    const t = {
      skill: o.skill, title: o.title, say: o.say, judSay: o.judSay, answer: o.answerText || '',
      render(el, api) {
        el.innerHTML = storyP(o.story) + '<div class="qa' + (o.fig ? '' : ' solo') + '"><div class="qa-q"><div class="w-host q-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const q = el.querySelector('.q-host');
        if (o.fig) { if (typeof o.fig === 'function') bench = o.fig(q, api, t) || null; else q.innerHTML = o.fig; }
        ch = SK.W.choice(el.querySelector('.ch-host'), {
          cls: o.cls || 'opts-words',
          options: o.options,
          onPick(v, b) {
            if (v === o.answer) {
              b.classList.add('good'); ch.lock();
              if (o.onRight) o.onRight(bench, api, v);
              api.correct(txt(o.explain), b);
            } else {
              ch.dim(b);
              api.wrong(o.wrongMsg ? txt(o.wrongMsg, v) : null, b);
            }
          }
        });
        t.ch = ch;
      },
      hint(l) {
        const h = o.hints || [];
        if (l === 3) {
          if (o.fx3) o.fx3(bench, t);
          if (ch && o.options.length >= 3 && !o.noDim) {
            let n = 0;
            ch.btns.forEach((b, i) => { if (o.options[i].value !== o.answer && !b.disabled && n < o.options.length - 2) { ch.dim(b); n++; } });
          }
        }
        const v = h[l - 1];
        return txt(v, bench) || ['ลองสังเกตให้ดี แล้วนึกถึงสิ่งที่เราทดลองมาแล้ว', 'ตัดตัวเลือกที่ไม่น่าจะใช่ออกไปทีละข้อ', 'ดูตัวเลือกที่เหลืออยู่ แล้วเลือกอันที่คิดว่าใช่ที่สุด'][l - 1];
      },
      solve() { if (ch) ch.mark(o.answer, 'good'); if (o.solveFx) o.solveFx(bench); }
    };
    return t;
  }

  SK.lib = { praiseLine, oopsLine, FALL_PRAISE, FALL_OOPS, rich, storyP, txt, yn, textOpt, moonOpt, planetOpt, rchip, tapOrder, taskChoice };
  SK.LEAD_WRONG = FALL_OOPS;
})();
