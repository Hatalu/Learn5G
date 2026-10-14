/* ═══════════════════════════════════════════════════════════
   MAT-MAT MAKER ISLAND — ตัวช่วยสร้างภารกิจ (task builders)
   task = { skill, title, say, judSay?, render(el, api), hint(level), answer, solve() }
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const MM = window.MM;
  const { art, ui, audio, W } = MM;
  const { pick, shuffle } = MM;

  const LEAD_WRONG = ['เกือบแล้ว! ลองอีกนิด', 'ไม่เป็นไร ลองใหม่ได้!', 'หืม... ยังไม่ใช่นะ', 'ยังไม่ใช่ แต่ใกล้แล้ว!'];
  const PRAISE = ['เป๊ะ!', 'ถูกต้อง!', 'เยี่ยมไปเลย!', 'ใช่เลย!', 'สุดยอด!', 'ว้าว เก่งมาก!'];
  const praise = () => pick(PRAISE);
  const rich = s => ui.rich(s, true);
  const itemOpt = (id, extra) => '<span class="oi" data-id="' + id + '">' + art.item(id) + '<b>' + MM.nm(id) + '</b>' + (extra || '') + '</span>';
  const yn = (a, b) => [
    { html: art.icon('check') + '<span>' + (a || 'จริง') + '</span>', value: true },
    { html: art.icon('cross') + '<span>' + (b || 'ไม่จริง') + '</span>', value: false }
  ];
  const storyP = s => s ? '<p class="story">' + rich(s) + '</p>' : '';
  const txt = (v, a) => typeof v === 'function' ? v(a) : (v || '');
  const rchip = (t, c) => W.chip(t, c);

  /* ลำดับ 1,2,3 โดยแตะการ์ด */
  function tapOrder(host, o) {
    host.innerHTML = '<div class="ord"><p class="ord-ask">' + (o.ask || 'แตะเรียงตามลำดับ') + '</p><div class="ord-cards">' +
      o.ids.map(id => '<button class="icard-btn ord-c" data-id="' + id + '">' + art.item(id) + '<b>' + MM.nm(id) + '</b><i class="ord-n"></i></button>').join('') +
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
      if (order.indexOf(c.dataset.id) >= 0 || order.length >= o.ids.length) return;
      audio.unlock(); order.push(c.dataset.id); audio.sfx('pop', order.length); paint();
      if (order.length === o.ids.length) o.onComplete(order.slice());
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
        el.innerHTML = storyP(o.story) + '<div class="qa"><div class="qa-q"><div class="w-host q-host"></div></div><div class="qa-a"><div class="w-host ch-host"></div></div></div>';
        const q = el.querySelector('.q-host');
        if (o.fig) { if (typeof o.fig === 'function') bench = o.fig(q, api, t) || null; else q.innerHTML = o.fig; }
        ch = W.choice(el.querySelector('.ch-host'), {
          cls: o.cls || 'opts-words',
          options: o.options,
          onPick(v, b) {
            if (v === o.answer) {
              b.classList.add('good'); ch.lock();
              if (o.onRight) o.onRight(bench, api, v);
              api.correct(praise() + ' ' + txt(o.explain), b);
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

  /* โชว์ป้ายคุณสมบัติบนปุ่มตัวเลือก (คำใบ้ระดับ 3 ของภารกิจเลือกใช้วัสดุ) valueOf(id)→true/false/null */
  function badgeOptions(ch, prop, valueOf) {
    ch.btns.forEach(b => {
      const oi = b.querySelector('.oi');
      if (!oi || oi.querySelector('.pbadge')) return;
      oi.insertAdjacentHTML('beforeend', art.propBadge(prop, valueOf(oi.dataset.id), true));
    });
  }

  Object.assign(MM, { lib: { LEAD_WRONG, PRAISE, praise, rich, itemOpt, yn, storyP, txt, rchip, tapOrder, taskChoice, badgeOptions } });
  MM.LEAD_WRONG = LEAD_WRONG;
})();
