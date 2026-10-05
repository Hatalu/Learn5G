/* ==========================================================================
   SHAPE DETECTIVE — App controller
   State · navigation · tools · hints · adaptive · rewards · 3 modes
   ========================================================================== */
(function () {
  'use strict';
  const SD = window.SD;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const SAVE_KEY = 'shapeDetective_v1';
  const PANEL_TYPES = ['sort', 'arrange', 'stretch', 'compare', 'draw', 'combine', 'deduce', 'countlab'];
  const KEY_ORDER = ['triangle', 'square', 'circle', 'ellipse', 'pentagon', 'hexagon'];

  const ICONS = {
    map: '<svg viewBox="0 0 48 48"><polygon points="4,10 16,6 32,12 44,8 44,38 32,42 16,36 4,40" fill="#a5d6a7" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/><path d="M16 6v30M32 12v30" stroke="#3b2a20" stroke-width="2.5"/><circle cx="24" cy="22" r="4.5" fill="#e53935" stroke="#3b2a20" stroke-width="2"/></svg>',
    notebook: '<svg viewBox="0 0 48 48"><rect x="9" y="5" width="32" height="38" rx="4" fill="#a1764a" stroke="#3b2a20" stroke-width="3"/><rect x="14" y="10" width="22" height="28" fill="#fff8e1" stroke="#3b2a20" stroke-width="2"/><path d="M18 17h14M18 23h14M18 29h9" stroke="#8d6e63" stroke-width="2.5" stroke-linecap="round"/><rect x="5" y="12" width="7" height="4" rx="2" fill="#3b2a20"/><rect x="5" y="30" width="7" height="4" rx="2" fill="#3b2a20"/></svg>',
    lens: '<svg viewBox="0 0 48 48"><rect x="28" y="28" width="9" height="18" rx="4" transform="rotate(-45 32 37)" fill="#6d4c41" stroke="#3b2a20" stroke-width="2.5"/><circle cx="20" cy="20" r="14" fill="#bbdefb" stroke="#c9a227" stroke-width="5"/><path d="M13 16 a8 8 0 0 1 7 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    scanner: '<svg viewBox="0 0 48 48"><rect x="12" y="18" width="24" height="26" rx="5" fill="#4dd0e1" stroke="#3b2a20" stroke-width="3"/><circle cx="24" cy="30" r="5" fill="#fff59d" stroke="#3b2a20" stroke-width="2"/><path d="M14 12 Q24 2 34 12M18 15 Q24 9 30 15" fill="none" stroke="#00838f" stroke-width="3" stroke-linecap="round"/></svg>',
    pen: '<svg viewBox="0 0 48 48"><polygon points="10,38 14,28 34,8 40,14 20,34" fill="#ffca28" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/><polygon points="10,38 14,28 20,34" fill="#ffe0b2" stroke="#3b2a20" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 12l6 6" stroke="#3b2a20" stroke-width="2.5"/><circle cx="8" cy="42" r="3" fill="#3b2a20"/></svg>',
    bag: '<svg viewBox="0 0 48 48"><path d="M17 16 Q17 6 24 6 Q31 6 31 16" fill="none" stroke="#3b2a20" stroke-width="3.5"/><rect x="8" y="15" width="32" height="27" rx="6" fill="#8d6e63" stroke="#3b2a20" stroke-width="3"/><rect x="8" y="21" width="32" height="6" fill="#6d4c41"/><rect x="20" y="19" width="8" height="10" rx="2" fill="#ffd54f" stroke="#3b2a20" stroke-width="2"/></svg>',
    hint: '<svg viewBox="0 0 48 48"><circle cx="24" cy="19" r="13" fill="#fff59d" stroke="#3b2a20" stroke-width="3"/><rect x="18" y="31" width="12" height="9" rx="2" fill="#bdbdbd" stroke="#3b2a20" stroke-width="2.5"/><path d="M20 20 l4 5 l4 -5" fill="none" stroke="#ff8f00" stroke-width="2.5"/></svg>'
  };

  function defState() {
    return {
      name: '', introSeen: false, done: {}, stepIdx: {}, keys: [], clues: [], badges: [], discoveries: {}, learned: {},
      evidence: [], secrets: {}, creations: {}, gallery: [], finished: false,
      stats: { obj: {}, mis: { circleEllipse: 0, sides: 0, rotation: 0, general: 0 }, streak: 0, hints: 0, log: [] }
    };
  }

  const App = {
    state: null, mode: 'story', district: null, queue: [], pos: 0, activity: null, step: null,
    hintLevel: 0, lensOn: false, scannerOn: false, sceneHandler: null, lensCb: null, single: null,
    remediated: {}, sessionMis: {}, mc: {}, panelActivity: false, checkTally: null,

    /* ---------------- persistence ---------------- */
    load() {
      // ทุกครั้งที่เปิดเล่นจะเริ่มใหม่ทั้งหมดตามความต้องการ
      this.state = defState();
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    },
    save() {
      // In-session save during gameplay
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch (e) { /* ignore */ }
    },

    setUser(profile) {
      if (profile && profile.username) {
        if (!this.state.name || this.state.name === 'นักสืบ') {
          this.state.name = profile.username;
        }
        const nameInput = $('#det-name');
        if (nameInput) nameInput.value = this.state.name;
      }
    },

    resetGame() {
      this.cleanup();
      this.closePanel(true);
      this.hideReward();
      this.state = defState();
      if (window.ShapeAuth) {
        const p = window.ShapeAuth.getCurrentProfile();
        if (p && p.username) this.state.name = p.username;
      }
      const nameInput = $('#det-name');
      if (nameInput) nameInput.value = this.state.name || '';
      this.renderKeyring();
      this.showTitle();
    },

    /* ---------------- boot ---------------- */
    init() {
      this.load();
      $$('[data-icon]').forEach(s => s.innerHTML = ICONS[s.dataset.icon]);
      $('#title-owl').innerHTML = SD.owlSVG('happy');
      $('#title-det').innerHTML = SD.detectiveSVG('cheer');
      $('#mentor-owl').innerHTML = SD.owlSVG('happy');
      $('#say-owl').innerHTML = SD.owlSVG('happy');
      $('#det-name').value = this.state.name || '';
      const first = () => { SD.Audio.unlock(); if (SD.Audio.musicOn) SD.Audio.startMusic(); document.removeEventListener('pointerdown', first); };
      document.addEventListener('pointerdown', first);

      $('#btn-story').onclick = () => { this.saveName(); this.mode = 'story'; SD.Audio.play('click'); this.state.introSeen ? this.showMap() : this.playIntro(() => this.showMap()); };
      $('#btn-explore').onclick = () => { this.saveName(); this.mode = 'explore'; SD.Audio.play('click'); this.showMap(); };
      $('#btn-teacher').onclick = () => { this.mode = 'teacher'; SD.Audio.play('click'); this.showTeacher(); };
      $('#btn-reset').onclick = () => {
        if (confirm('ต้องการเริ่มคดีใหม่ทั้งหมดใช่ไหม? ความก้าวหน้าจะถูกลบและเริ่มใหม่ทันที')) {
          this.resetGame();
          this.toast('เริ่มคดีใหม่แล้ว!');
        }
      };
      $('#btn-home').onclick = () => { SD.Audio.play('click'); this.mode === 'teacher' ? this.showTeacher() : this.showTitle(); };
      $('#btn-music').onclick = () => { const on = SD.Audio.toggleMusic(); $('#btn-music').classList.toggle('off', !on); };
      $('#mentor-speak').onclick = () => SD.Audio.speak($('#mentor-text').textContent);
      $('#say-speak').onclick = () => SD.Audio.speak($('#say-text').textContent);
      $('#panel-close').onclick = () => this.panelCloseClicked();
      $('#panel-hint').onclick = () => this.useHint();
      $$('.tool').forEach(b => b.addEventListener('click', () => this.useTool(b.dataset.tool)));
      $('#tb-home').onclick = () => this.showTitle();
      $('#tb-report').onclick = () => this.showReport();
      $('#scene-svg').addEventListener('click', e => this.sceneClick(e));
      document.addEventListener('pointerdown', e => { if (!e.target.closest('#scan-card') && !e.target.closest('.obj')) this.hideScanCard(); });
      this.renderKeyring();
    },
    saveName() { this.state.name = ($('#det-name').value || '').trim(); this.save(); },
    detName() { return this.state.name || 'นักสืบ'; },

    /* ---------------- screens ---------------- */
    show(id) {
      $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
      const inWorld = id === 'scr-map' || id === 'scr-district';
      $('#hud').classList.toggle('hidden', !inWorld);
      $('#toolbelt').classList.toggle('hidden', !inWorld);
      $('#mentor').classList.toggle('hidden', !inWorld);
      this.hideScanCard();
      $$('.tool').forEach(t => {
        const dOnly = ['lens', 'scanner'].includes(t.dataset.tool);
        t.classList.toggle('disabled', id === 'scr-map' && (dOnly || t.dataset.tool === 'map'));
      });
    },
    showTitle() { this.cleanup(); this.closePanel(true); this.single = null; this.show('scr-title'); },

    /* ---------------- story intro ---------------- */
    playIntro(done) {
      const pages = [
        { art: this.townArt(), text: 'ยินดีต้อนรับสู่ <b>Shape Town</b> เมืองที่ทุกสิ่งสร้างจากรูปเรขาคณิต ทั้งบ้าน หอนาฬิกา รถไฟ และต้นไม้!' },
        { art: `<svg viewBox="0 0 800 400"><rect width="800" height="400" fill="#3f2b6b"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 137) % 800}" cy="${(i * 71) % 250}" r="2" fill="#fff"/>`).join('')}<g transform="translate(230 90) scale(1.2)">${SD.scribbleSVG().replace('<svg', '<svg width="200" height="200"')}</g>${KEY_ORDER.map((k, i) => `<g transform="translate(${470 + (i % 3) * 90} ${120 + Math.floor(i / 3) * 110})">${this.keySVG(k, 80)}</g>`).join('')}</svg>`, text: 'คืนหนึ่ง <b>เจ้าขยุกขยิก</b> แอบขโมย <b>กุญแจรูปทรง 6 ดอก</b> ไป! สถานที่สำคัญในเมืองถูกล็อกทั้งหมด เหลือไว้แค่เบาะแสรูปทรง...' },
        { art: `<svg viewBox="0 0 800 400"><rect width="800" height="400" fill="#fff3d6"/><g transform="translate(170 70)">${SD.owlSVG('happy').replace('<svg', '<svg width="220" height="240"')}</g><g transform="translate(430 60)">${SD.detectiveSVG('cheer').replace('<svg', '<svg width="220" height="290"')}</g></svg>`, text: `ลุงฮูกจึงเรียก <b>SHAPE DETECTIVE</b> มาช่วย... ก็คือ <b>${this.detName()}</b> นั่นเอง! ใช้แว่น Shape Lens นับด้านและมุมเพื่อพิสูจน์เบาะแส แล้วตามหากุญแจคืนมา` }
      ];
      let i = 0;
      this.show('scr-intro');
      const render = () => {
        $('#story-art').innerHTML = pages[i].art;
        $('#story-text').innerHTML = pages[i].text;
        $('#story-text').style.animation = 'none'; void $('#story-text').offsetWidth; $('#story-text').style.animation = '';
        $('#story-dots').innerHTML = pages.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('');
        $('#story-next').textContent = i === pages.length - 1 ? 'ออกสืบเลย! 🔍' : 'ต่อไป ▶';
      };
      $('#story-next').onclick = () => { SD.Audio.play('pop'); i++; if (i >= pages.length) { this.state.introSeen = true; this.save(); done(); } else render(); };
      render();
    },
    townArt() {
      const sc = SD.SCENES.square;
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${sc.bg()}${sc.objects.filter(o => !o.secret).map(o => SD.shapeEl(o)).join('')}</svg>`;
    },
    keySVG(shape, size) {
      const w = shape === 'ellipse' ? 46 : 38, h = shape === 'ellipse' ? 30 : 38;
      return `<svg viewBox="0 0 60 90" width="${size * .66}" height="${size}" class="key-svg"><rect x="26" y="40" width="8" height="44" rx="3" fill="#ffca28" stroke="#3b2a20" stroke-width="3"/><rect x="34" y="66" width="12" height="6" fill="#ffca28" stroke="#3b2a20" stroke-width="2.5"/><rect x="34" y="76" width="9" height="6" fill="#ffca28" stroke="#3b2a20" stroke-width="2.5"/>${SD.shapeEl({ shape, x: 30, y: 24, w, h, fill: '#ffd54f', sw: 3.5 })}</svg>`;
    },

    /* ---------------- unlock logic ---------------- */
    isUnlocked(d) {
      if (this.mode === 'teacher') return true;
      if (this.mode === 'explore') return d.id !== 'secret' || this.state.keys.length >= 6;
      return d.requires.every(r => {
        if (r.startsWith('@2of:')) return r.slice(5).split(',').filter(x => this.state.done[x]).length >= 2;
        return !!this.state.done[r];
      });
    },
    lockReason(d) {
      if (d.id === 'secret') return 'ห้องลับจะเปิดเมื่อได้กุญแจครบทั้ง 6 ดอก';
      const r = d.requires[0] || '';
      if (r.startsWith('@2of:')) return 'ไขคดีที่ ตลาด สถานี หรือสวน ให้ได้ 2 แห่งก่อน แล้วที่นี่จะเปิด';
      return 'ไขคดีที่จัตุรัสกลางเมืองก่อนนะ';
    },
    suggested() {
      if (this.mode !== 'story') return [];
      return SD.DISTRICTS.filter(d => this.isUnlocked(d) && !this.state.done[d.id]);
    },

    /* ---------------- MAP ---------------- */
    showMap(newly) {
      this.cleanup(); this.closePanel(true); this.district = null; this.step = null;
      this.show('scr-map');
      const svg = $('#map-svg'), S = this.state;
      const sug = this.suggested();
      let h = `<defs><pattern id="pp" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#f3e1b5"/><circle cx="8" cy="8" r="1.5" fill="#e0c48f"/></pattern></defs>
        <rect width="1600" height="900" fill="url(#pp)"/>
        <path d="M0 560 C300 520 380 620 600 600 S1000 520 1200 590 S1500 640 1600 600 L1600 640 C1500 680 1300 640 1200 630 S900 560 620 640 S300 570 0 600 Z" fill="#81d4fa" stroke="#3b2a20" stroke-width="3" opacity=".9"/>
        ${Array.from({ length: 18 }, (_, i) => { const x = (i * 263 + 90) % 1560, y = (i * 157 + 60) % 820; return `<circle cx="${x}" cy="${y}" r="${18 + (i % 3) * 6}" fill="#a5d6a7" stroke="#3b2a20" stroke-width="2.5"/>`; }).join('')}
        <rect x="16" y="16" width="1568" height="868" rx="30" fill="none" stroke="#a0784a" stroke-width="10" stroke-dasharray="40 14"/>`;
      const c = SD.DISTRICTS[0].map;
      SD.DISTRICTS.slice(1).forEach(d => { h += `<path d="M${c.x} ${c.y} Q${(c.x + d.map.x) / 2 + 60} ${(c.y + d.map.y) / 2 - 40} ${d.map.x} ${d.map.y}" fill="none" stroke="#c49a63" stroke-width="22" stroke-linecap="round"/><path d="M${c.x} ${c.y} Q${(c.x + d.map.x) / 2 + 60} ${(c.y + d.map.y) / 2 - 40} ${d.map.x} ${d.map.y}" fill="none" stroke="#f7e3b8" stroke-width="4" stroke-dasharray="14 12"/>`; });
      SD.DISTRICTS.forEach(d => {
        const un = this.isUnlocked(d), done = S.done[d.id], cls = !un ? 'locked' : (sug.includes(d) ? 'available' : '');
        h += `<g class="map-node ${cls}" data-id="${d.id}" transform="translate(${d.map.x} ${d.map.y})">
          <g class="node-body"><g class="node-art">${this.nodeArt(d.id)}</g>
          <rect x="-125" y="12" width="250" height="50" rx="16" fill="${done ? '#c8e6c9' : '#fdf3dc'}" stroke="#3b2a20" stroke-width="4"/>
          <text y="45" text-anchor="middle" font-family="Mali" font-weight="700" font-size="25" fill="#3b2a20">${d.name}</text>
          ${!un ? '<g transform="translate(0 -70)"><path d="M-18 -8 v-12 a18 18 0 0 1 36 0 v12" fill="none" stroke="#3b2a20" stroke-width="8"/><rect x="-28" y="-10" width="56" height="44" rx="8" fill="#ffb300" stroke="#3b2a20" stroke-width="5"/><circle cy="10" r="6" fill="#3b2a20"/></g>' : ''}
          ${done ? `<g transform="translate(105 -90)"><circle r="30" fill="#66bb6a" stroke="#3b2a20" stroke-width="4"/><text y="12" text-anchor="middle" font-size="34" fill="#fff">✓</text></g>` : ''}
          ${S.secrets[d.id] ? '<text x="-110" y="-80" font-size="34">🗺️</text>' : ''}</g>
        </g>`;
      });
      if (sug.length) { const d = sug[0]; h += `<g class="map-arrow" transform="translate(${d.map.x} ${d.map.y - 190})"><polygon points="-30,0 30,0 0,44" fill="#ff7043" stroke="#3b2a20" stroke-width="5" stroke-linejoin="round"/><text y="-12" text-anchor="middle" font-family="Mali" font-weight="700" font-size="26" fill="#3b2a20">ไปที่นี่!</text></g>`; }
      (newly || []).forEach(id => { const d = SD.DISTRICTS.find(x => x.id === id); h += `<circle class="map-unlock-burst" cx="${d.map.x}" cy="${d.map.y - 40}" r="120" fill="none" stroke="#ffeb3b" stroke-width="16"/>`; });
      svg.innerHTML = h;
      if (newly && newly.length) SD.Audio.play('unlock');
      svg.querySelectorAll('.map-node').forEach(n => n.addEventListener('click', () => {
        const d = SD.DISTRICTS.find(x => x.id === n.dataset.id);
        if (!this.isUnlocked(d)) { SD.Audio.play('soft'); this.say('🔒 ' + this.lockReason(d), 'soft'); return; }
        SD.Audio.play('whoosh'); this.enterDistrict(d);
      }));
      this.renderMission();
      if (this.mode === 'story') {
        if (!sug.length && S.finished) this.say(`${this.detName()}ไขคดีครบแล้ว! กลับไปสำรวจเมือง หรือหาชิ้นแผนที่ลับด้วย Clue Scanner ได้นะ`, 'happy');
        else if (sug.length > 1) this.say(`มีหลายที่ให้สืบ เลือกได้เลยว่าจะไปที่ไหนก่อน: ${sug.map(d => d.name).join(' / ')}`, 'happy');
        else if (sug.length) this.say(`ไปที่ “${sug[0].name}” กันเถอะ แตะที่ลูกศรได้เลย`, 'happy');
      } else if (this.mode === 'explore') this.say('โหมดสำรวจ! เลือกสถานที่ไหนก็ได้ แตะสิ่งของเพื่อสแกนรูปทรง และใช้ Clue Scanner หาชิ้นแผนที่ลับนะ', 'happy');
      else this.say('โหมดครู: ทุกพื้นที่เปิดแล้ว เลือกสถานที่เพื่อสำรวจร่วมกับนักเรียนได้เลย', 'happy');
    },
    nodeArt(id) {
      const st = 'stroke="#3b2a20" stroke-width="4" stroke-linejoin="round"';
      switch (id) {
        case 'square': return `<rect x="-30" y="-130" width="60" height="130" fill="#ffe082" ${st}/><polygon points="-42,-130 0,-185 42,-130" fill="#7986cb" ${st}/><circle cy="-95" r="20" fill="#fff" ${st}/><rect x="-90" y="-60" width="50" height="60" fill="#ffab91" ${st}/><polygon points="-98,-60 -65,-90 -32,-60" fill="#e57373" ${st}/><circle cx="70" cy="-50" r="34" fill="#66bb6a" ${st}/>`;
        case 'market': return `<rect x="-80" y="-50" width="160" height="50" fill="#a1887f" ${st}/>${[-60, -20, 20, 60].map((x, i) => `<polygon points="${x - 20},-110 ${x + 20},-110 ${x},-80" fill="${i % 2 ? '#fff' : '#ef5350'}" ${st}/>`).join('')}<rect x="-84" y="-118" width="168" height="10" fill="#6d4c41"/><circle cx="-40" cy="-62" r="12" fill="#ffa726" ${st}/><circle cx="-12" cy="-62" r="12" fill="#ffa726" ${st}/><ellipse cx="30" cy="-62" rx="10" ry="14" fill="#fff8e1" ${st}/>`;
        case 'station': return `<rect x="-90" y="-80" width="140" height="56" fill="#ef5350" ${st}/><rect x="10" y="-125" width="50" height="50" fill="#e57373" ${st}/><rect x="-75" y="-118" width="18" height="38" fill="#5d4037" ${st}/>${[-60, -10, 40].map(x => `<circle cx="${x}" cy="-18" r="18" fill="#424242" ${st}/>`).join('')}<polygon points="50,-80 80,-52 50,-24" fill="#ffb300" ${st}/>`;
        case 'park': return `<rect x="-10" y="-80" width="20" height="80" fill="#8d6e63" ${st}/><circle cy="-120" r="55" fill="#66bb6a" ${st}/><ellipse cx="70" cy="-14" rx="50" ry="16" fill="#4fc3f7" ${st}/><circle cx="-70" cy="-16" r="16" fill="#ff7043" ${st}/>`;
        case 'factory': return `<rect x="-90" y="-90" width="180" height="90" fill="#90a4ae" ${st}/><rect x="40" y="-160" width="30" height="72" fill="#78909c" ${st}/><circle cx="-40" cy="-45" r="26" fill="#ffb300" ${st}/><polygon points="20,-70 50,-70 35,-44" fill="#ffeb3b" ${st}/><ellipse cx="62" cy="-176" rx="24" ry="12" fill="#eceff1" ${st}/>`;
        case 'museum': return `<rect x="-90" y="-20" width="180" height="20" fill="#efdcc0" ${st}/>${[-60, -20, 20, 60].map(x => `<rect x="${x - 10}" y="-100" width="20" height="80" fill="#fff8e1" ${st}/>`).join('')}<polygon points="-100,-100 0,-160 100,-100" fill="#ffcc80" ${st}/><circle cy="-122" r="12" fill="#ffca28" ${st}/>`;
        case 'secret': return `<ellipse cy="-6" rx="110" ry="26" fill="#5e4a8b" ${st}/>${SD.shapeEl({ shape: 'hexagon', x: 0, y: -70, w: 120, h: 104, fill: '#7e57c2', sw: 4 })}<text y="-58" text-anchor="middle" font-size="40">❓</text>`;
      }
      return '';
    },

    /* ---------------- DISTRICT ---------------- */
    enterDistrict(d, opts) {
      opts = opts || {};
      this.cleanup(); this.district = d; this.step = null; this.lensOn = false; this.scannerOn = false;
      this.show('scr-district'); this.renderScene(d);
      $$('.tool').forEach(t => t.classList.remove('active'));
      if (this.mode === 'teacher' && !opts.single) { this.toggleLens(true, true); }
      if (opts.single) return;
      if (this.mode === 'story' && !this.state.done[d.id]) this.openCase(d);
      else this.exploreDistrict();
    },
    renderScene(d) {
      const sc = SD.SCENES[d.id], svg = $('#scene-svg');
      this.objects = sc.objects.map((o, i) => Object.assign({ id: d.id + '-' + i, i }, o));
      svg.setAttribute('class', '');
      svg.innerHTML = `<g class="scene-bg">${sc.bg()}</g><g class="scene-objs">${this.objects.map(o => {
        if (o.secret && this.state.secrets[d.id]) return '';
        return `<g class="obj${o.secret ? ' secret' : ''}" data-i="${o.i}" data-curved="${SD.SHAPES[o.shape].curved ? 1 : 0}" style="--d:${(o.i * .06).toFixed(2)}s">${SD.shapeEl(o)}</g>`;
      }).join('')}</g>`;
      $('#lens-legend').classList.remove('show');
    },
    sceneClick(e) {
      const g = e.target.closest && e.target.closest('.obj'); if (!g) return;
      const o = this.objects[+g.dataset.i];
      if (o.secret) { this.foundSecret(o, g); return; }
      SD.Audio.play('click');
      if (this.sceneHandler) this.sceneHandler(o, g); else this.scanCard(o, g);
    },
    exploreDistrict() {
      const d = this.district;
      this.step = null; this.sceneHandler = null; this.mc = {};
      this.renderMission();
      const total = this.objects.filter(o => !o.secret).length;
      if (this.mode === 'teacher') this.say(`ถามนักเรียน: “ใน${d.name} เห็นรูปอะไรบ้าง? รู้ได้อย่างไร?” แล้วแตะสิ่งของเพื่อพิสูจน์ร่วมกัน`, 'think');
      else this.say(`สำรวจ${d.name}ได้อิสระ! แตะสิ่งของเพื่อสแกนรูปทรง (พบแล้ว ${this.countDisc(d.id)}/${total}) และลองใช้ Clue Scanner หาชิ้นแผนที่ลับนะ`, 'happy');
    },
    countDisc(did) { return Object.keys(this.state.discoveries).filter(k => k.startsWith(did + '|')).length; },

    /* ---------------- CASE FLOW ---------------- */
    openCase(d, replay) {
      const startAt = replay ? 0 : (this.state.stepIdx[d.id] || 0);
      this.queue = d.steps.map((s, i) => Object.assign({ _idx: i }, s));
      this.pos = Math.min(startAt, this.queue.length - 1); this.replay = !!replay;
      this.showReward(`
        <div class="title-kicker">${d.en}</div><h2>🔍 ${d.caseTitle}</h2>
        <div style="display:flex;gap:1rem;align-items:center;justify-content:center;margin:.6rem 0"><div style="width:120px">${SD.owlSVG('think')}</div><div class="explain-box" style="flex:1;background:#fff">${d.story}</div><div style="width:110px">${SD.scribbleSVG()}</div></div>
        <p class="muted">${startAt > 0 && !replay ? `สืบต่อจากภารกิจที่ ${startAt + 1}/${d.steps.length}` : `คดีนี้มี ${d.steps.length} ภารกิจ`}</p>
        <button class="btn btn-orange btn-big" data-go>เริ่มสืบ! 🔍</button>`, () => this.startStep());
    },
    startStep() {
      this.cleanup();
      const step = this.step = this.queue[this.pos];
      this.hintLevel = 0; this.mc = {}; this.sceneHandler = (o, g) => this.scanCard(o, g); this.lensCb = null;
      this.renderMission();
      this.say(step.say, 'happy');
      if (PANEL_TYPES.includes(step.type)) setTimeout(() => { if (this.step === step && !this.activity) this.launch(); }, 1300);
      else this.launch();
    },
    launch() {
      const step = this.step; if (!step) return;
      this.panelActivity = PANEL_TYPES.includes(step.type);
      this.activity = SD.Activities[step.type](step, this.api());
      this.renderMission();
    },
    cleanup() {
      if (this.activity && this.activity.destroy) this.activity.destroy();
      this.activity = null; this.lensCb = null;
      $$('#scene-svg .hint-glow').forEach(e => e.classList.remove('hint-glow'));
      $$('.tool.pulse').forEach(t => t.classList.remove('pulse'));
    },
    completeStep(text, shape) {
      const step = this.step; if (!step) return;
      this.cleanup(); this.sceneHandler = (o, g) => this.scanCard(o, g);
      this.logStep(step, true);
      // adaptive: insert remedial mission when a misconception repeats
      const insert = [];
      if (!this.single) ['circleEllipse', 'sides', 'rotation'].forEach(c => {
        if ((this.sessionMis[c] || 0) >= 2 && !this.remediated[c]) { this.remediated[c] = true; insert.push(Object.assign({ _remedial: c }, SD.REMEDIAL[c])); }
      });
      this.queue.splice(this.pos + 1, 0, ...insert);
      SD.Audio.play('success'); this.fx('confetti');
      this.showReward(`
        <div class="stamp" style="position:relative;left:auto;top:auto;transform:rotate(-8deg);display:inline-block;margin:.4rem 0 1rem">ไขได้แล้ว!</div>
        <div style="display:flex;gap:1rem;align-items:center"><div style="width:130px;flex:none">${SD.detectiveSVG('cheer')}</div>
        <div class="explain-box" style="flex:1">${shape ? SD.shapeIcon(shape, 44) : '💡'} ${text}</div></div>
        ${insert.length ? `<p class="muted">🦉 ลุงฮูกเตรียม “${insert[0].title}” ไว้ให้ฝึกเพิ่ม เพื่อให้เธอเป็นนักสืบที่เก่งขึ้นอีก!</p>` : ''}
        <button class="btn btn-green btn-big" data-go style="margin-top:.6rem">ต่อไป ▶</button>`, () => {
        this.pos++;
        if (!this.replay && this.mode === 'story' && step._idx != null) { this.state.stepIdx[this.district.id] = Math.max(this.state.stepIdx[this.district.id] || 0, step._idx + 1); this.save(); }
        if (this.pos < this.queue.length) this.startStep(); else this.finishCase();
      });
      this.say(text, 'happy');
    },
    finishCase() {
      const d = this.district, S = this.state;
      this.step = null;
      if (this.single) { const cb = this.single; this.single = null; cb(); return; }
      if (this.mode !== 'story' || S.done[d.id] || this.replay) {
        this.showReward(`<h2>🎉 ไขคดีซ้ำสำเร็จ!</h2><p>${this.detName()}เก่งขึ้นอีกแล้ว!</p><button class="btn btn-green btn-big" data-go>สำรวจต่อ</button>`, () => this.exploreDistrict());
        return;
      }
      const before = SD.DISTRICTS.filter(x => this.isUnlocked(x)).map(x => x.id);
      S.done[d.id] = true; S.stepIdx[d.id] = d.steps.length;
      if (d.key && !S.keys.includes(d.key)) S.keys.push(d.key);
      if (d.clueCard && !S.clues.find(c => c.id === d.clueCard.id)) S.clues.push(d.clueCard);
      if (d.badge && !S.badges.find(b => b.id === d.badge.id)) S.badges.push(d.badge);
      this.save(); this.renderKeyring();
      const newly = SD.DISTRICTS.filter(x => this.isUnlocked(x) && !before.includes(x.id)).map(x => x.id);
      if (d.id === 'secret') { S.finished = true; this.save(); this.finale(); return; }
      SD.Audio.play('unlock'); this.fx('confetti');
      this.showReward(`
        <div class="title-kicker">${d.caseTitle}</div><h2>🏆 ไขคดีสำเร็จ!</h2>
        <div class="reward-items">
          <div class="reward-item"><div class="big">${this.keySVG(d.key, 100)}</div><b>กุญแจ${SD.SHAPES[d.key].th}</b><span>ปลดล็อกพื้นที่ใหม่</span></div>
          ${d.clueCard ? `<div class="reward-item"><div class="big" style="font-size:3.4rem">🃏</div><b>การ์ดเบาะแส</b><span>“${d.clueCard.text}”</span></div>` : ''}
          <div class="reward-item"><div class="big" style="font-size:3.4rem">🏅</div><b>ตรา: ${d.badge.name}</b><span>เก็บในสมุดนักสืบ</span></div>
        </div>
        <p class="muted">กุญแจ ${S.keys.length}/6 ดอก ${newly.length ? '· 🔓 มีสถานที่ใหม่เปิดแล้ว!' : ''}</p>
        <button class="btn btn-orange btn-big" data-go>🗺️ กลับไปที่แผนที่</button>`, () => this.showMap(newly));
    },
    finale() {
      SD.Audio.play('unlock'); this.fx('confetti'); setTimeout(() => this.fx('confetti'), 700);
      this.showReward(`
        <div class="title-kicker">คดีปริศนาเมืองรูปทรง · ปิดคดี</div>
        <h2>🌟 ${this.detName()} ไขคดีได้ด้วยตัวเอง!</h2>
        <p>เจ้าขยุกขยิกคืนกุญแจทั้งหมด และสัญญาว่าจะฝึกวาดรูปเรขาคณิตกับเธอ 🏅 <b>นักสืบรูปทรงระดับตำนาน</b></p>
        <div class="summary-board" style="text-align:left">
          <div class="nb-card">${SD.shapeIcon('pentagon', 54)}<h4>รูปหลายเหลี่ยม</h4><p>มีเส้นตรงล้อมรอบ มีด้านและมุม จำนวนด้าน = จำนวนมุม (3 สามเหลี่ยม, 4 สี่เหลี่ยม, 5 ห้าเหลี่ยม, 6 หกเหลี่ยม)</p></div>
          <div class="nb-card">${SD.shapeIcon('circle', 54)}<h4>วงกลม</h4><p>เส้นโค้งปิด ไม่มีมุม กว้างเท่ากับสูง กลมเท่ากันทุกทาง</p></div>
          <div class="nb-card">${SD.shapeIcon('ellipse', 54)}<h4>วงรี</h4><p>เส้นโค้งปิด ไม่มีมุม แต่ยาวกับกว้างไม่เท่ากัน</p></div>
        </div>
        <div class="explain-box">✏️ ฉันวาดรูปได้: ลากเส้นตรงต่อกันจนเป็นรูปปิดเพื่อสร้างรูปหลายเหลี่ยม และวาดเส้นโค้งวนกลับมาจุดเดิมเพื่อสร้างวงกลมหรือวงรี · สี ขนาด และการหมุน ไม่ทำให้ชนิดของรูปเปลี่ยน</div>
        <div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap"><button class="btn btn-teal btn-big" data-go>🗺️ สำรวจเมืองต่อ</button><button class="btn btn-big" data-home>🏠 หน้าแรก</button></div>`, () => { this.mode = 'explore'; this.showMap(); });
      const h = $('#reward [data-home]'); if (h) h.onclick = () => { this.hideReward(); this.showTitle(); };
    },

    /* ---------------- single-step runner (teacher) ---------------- */
    runSingle(did, idx, after) {
      const d = SD.DISTRICTS.find(x => x.id === did);
      this.enterDistrict(d, { single: true });
      this.queue = [Object.assign({}, d.steps[idx])]; this.pos = 0; this.replay = true;
      this.single = after || (() => this.showTeacher());
      this.startStep();
    },

    /* ---------------- mission card ---------------- */
    renderMission(extra) {
      Object.assign(this.mc, extra || {});
      const card = $('#mission-card'), d = this.district, st = this.step;
      if (!d) {
        const sug = this.suggested();
        const head = this.mode === 'teacher' ? 'โหมดครู · สำรวจร่วมกัน' : this.mode === 'explore' ? 'โหมดสำรวจเมือง' : 'ภารกิจตอนนี้';
        const body = this.mode === 'story'
          ? (sug.length ? `ไปสืบที่: <b>${sug.map(x => x.name).join(' / ')}</b>` : 'ไขคดีครบแล้ว! สำรวจเมืองต่อได้')
          : this.mode === 'explore' ? 'เลือกสถานที่ แตะสิ่งของเพื่อสแกน และหาชิ้นแผนที่ลับ' : 'เลือกสถานที่ แล้วถามนักเรียนว่าเห็นรูปอะไร';
        card.innerHTML = `<div class="mc-case">🗺️ แผนที่ Shape Town</div><div class="mc-title">${head}</div><div class="mc-goal">${body}</div><div class="mc-progress">🔑 กุญแจ ${this.state.keys.length}/6 · 🗺️ แผนที่ลับ ${Object.keys(this.state.secrets).length}/${SD.SECRET_TOTAL}</div>`;
        return;
      }
      if (!st) {
        const total = this.objects.filter(o => !o.secret).length;
        const canCase = this.mode !== 'explore' || this.state.done[d.id] || true;
        card.innerHTML = `<div class="mc-case">${d.en}</div><div class="mc-title">สำรวจ${d.name}</div>
          <div class="mc-goal">แตะสิ่งของเพื่อสแกนรูปทรง · ใช้ Clue Scanner หาชิ้นแผนที่ลับ</div>
          <div class="mc-progress">🔎 ค้นพบ ${this.countDisc(d.id)}/${total} · 🗺️ ${this.state.secrets[d.id] ? 'พบแผนที่ลับแล้ว' : 'ยังไม่พบแผนที่ลับ'}</div>
          <div class="mc-actions">${canCase ? `<button class="btn btn-small btn-orange" data-mc="case">${this.state.done[d.id] ? '🔁 เล่นคดีนี้อีกครั้ง' : '🔍 เปิดคดีนี้'}</button>` : ''}</div>`;
        const b = card.querySelector('[data-mc="case"]');
        if (b) b.onclick = () => { SD.Audio.play('click'); this.openCase(d, true); };
        return;
      }
      const real = this.queue.filter(s => !s._remedial), idxReal = real.indexOf(st);
      const dots = real.map((s, i) => `<i class="${i < idxReal || (idxReal < 0 && i <= (this.queue[this.pos - 1] ? real.indexOf(this.queue[this.pos - 1]) : -1)) ? 'done' : i === idxReal ? 'cur' : ''}"></i>`).join('');
      const goal = st.goal || (st.type === 'find' ? 'หาสิ่งของในเมืองที่ตรงกับคำให้การ แล้วพิสูจน์ด้วย Shape Lens' : PANEL_TYPES.includes(st.type) ? 'ทำภารกิจในสมุดคดีให้สำเร็จ' : '');
      const needBtn = PANEL_TYPES.includes(st.type) && !$('#panel').classList.contains('hidden') === false;
      card.innerHTML = `<div class="mc-case">${st._remedial ? '🦉 ภารกิจฝึกพิเศษ' : (this.single ? 'กิจกรรมในห้องเรียน' : d.caseTitle)}</div>
        <div class="mc-title">${st.title}</div><div class="mc-goal">${goal}</div>
        ${this.mc.witness ? `<div class="mc-witness">${this.mc.witness}</div>` : ''}
        <div class="mc-progress">${this.single || st._remedial ? '' : dots} ${this.mc.progress ? `<span>${this.mc.progress}</span>` : ''}</div>
        ${needBtn ? '<div class="mc-actions"><button class="btn btn-small btn-orange" data-mc="open">▶ เปิดภารกิจ</button></div>' : ''}`;
      const ob = card.querySelector('[data-mc="open"]');
      if (ob) ob.onclick = () => { SD.Audio.play('click'); if (!this.activity) this.launch(); };
    },

    /* ---------------- tools ---------------- */
    useTool(t) {
      SD.Audio.play('click');
      switch (t) {
        case 'map': this.showMap(); break;
        case 'notebook': this.openNotebook(); break;
        case 'lens': this.toggleLens(); break;
        case 'scanner': this.toggleScanner(); break;
        case 'pen': this.openStudio(); break;
        case 'bag': this.openBag(); break;
        case 'hint': this.useHint(); break;
      }
    },
    toggleLens(force, quiet) {
      if (!this.district) return;
      this.lensOn = force != null ? force : !this.lensOn;
      const svg = $('#scene-svg');
      svg.classList.toggle('lens-on', this.lensOn);
      $('.tool[data-tool="lens"]').classList.toggle('active', this.lensOn);
      $('#lens-legend').classList.toggle('show', this.lensOn);
      if (this.lensOn) {
        if (!quiet) SD.Audio.play('lens');
        const r = document.createElement('div'); r.className = 'lens-ripple';
        r.style.left = '50%'; r.style.top = '50%'; r.style.transform = 'translate(-50%,-50%)';
        $('#scene-wrap').appendChild(r); setTimeout(() => r.remove(), 1100);
        // restart stagger animation
        svg.querySelectorAll('.obj > *').forEach(n => { n.style.animation = 'none'; void n.getBBox; n.style.animation = ''; });
        if (!this.step && !quiet) this.say('Shape Lens เปิดแล้ว! เส้นตรงเรืองแสงสีฟ้า เส้นโค้งเรืองแสงสีส้ม', 'happy');
      }
      this.lensCb && this.lensCb(this.lensOn);
    },
    toggleScanner() {
      if (!this.district) return;
      if (this.step && this.step.type === 'scan') { this.say('ตอนนี้ Clue Scanner กำลังทำงานอยู่ ลากนิ้วส่องไปรอบๆ ได้เลย', 'think'); return; }
      this.scannerOn = !this.scannerOn;
      $('#scene-svg').classList.toggle('scanner-on', this.scannerOn);
      $('.tool[data-tool="scanner"]').classList.toggle('active', this.scannerOn);
      if (this.scannerOn) {
        SD.Audio.play('scan');
        const has = this.objects.some(o => o.secret) && !this.state.secrets[this.district.id];
        this.say(has ? 'Clue Scanner เปิดแล้ว! มีบางอย่างเล็กๆ กระพริบซ่อนอยู่ในฉากนี้ หาให้เจอนะ' : 'Clue Scanner ไม่พบสิ่งซ่อนเร้นเพิ่มในฉากนี้แล้ว', 'think');
      }
    },
    foundSecret(o, g) {
      const d = this.district, S = this.state;
      if (S.secrets[d.id]) return;
      S.secrets[d.id] = true; this.save(); g.remove();
      SD.Audio.play('unlock'); this.fx('sparkle');
      const n = Object.keys(S.secrets).length;
      this.toast(`🗺️ พบชิ้นแผนที่ลับ! (${n}/${SD.SECRET_TOTAL})`);
      this.say(`เจอชิ้นแผนที่ลับรูป${SD.SHAPES[o.shape].short}! ${SD.describe(o.shape)}`, 'happy');
      if (n >= SD.SECRET_TOTAL && !S.badges.find(b => b.id === 'b8')) {
        S.badges.push({ id: 'b8', name: 'นักล่าแผนที่ลับ', icon: 'hexagon' }); this.save();
        setTimeout(() => this.showReward(`<h2>🗺️ แผนที่ลับครบแล้ว!</h2><div class="reward-items"><div class="reward-item"><div class="big" style="font-size:4rem">🗺️</div><b>แผนที่ลับของ Shape Town</b><span>ชิ้นส่วนรูปทรง 6 ชิ้นต่อกันเป็นแผนที่</span></div><div class="reward-item"><div class="big" style="font-size:4rem">🏅</div><b>ตรา: นักล่าแผนที่ลับ</b><span>สำหรับนักสืบช่างสังเกต</span></div></div><button class="btn btn-orange btn-big" data-go>เยี่ยมไปเลย!</button>`, () => { }), 900);
      }
      this.renderMission();
    },
    scanCard(o, node) {
      const S = SD.SHAPES[o.shape], st = this.state, key = `${this.district.id}|${o.label}`;
      const isNew = !st.discoveries[key];
      if (isNew) { st.discoveries[key] = o.shape; this.save(); SD.Audio.play('discover'); }
      this.learn(o.shape);
      const card = $('#scan-card');
      const props = S.curved
        ? ['เป็นเส้นโค้ง ไม่มีเส้นตรง', 'ไม่มีมุม', S.round ? 'กว้างเท่ากับสูง' : 'ยาวกับกว้างไม่เท่ากัน']
        : ['มีแต่เส้นตรง', `มี ${S.sides} ด้าน`, `มี ${S.corners} มุม`];
      card.innerHTML = `<div class="sc-head">${SD.shapeIcon(o.shape, 56, o.fill, o.shape === 'triangle' ? o.rot : 0)}<div><div class="sc-name">${S.th}</div><div class="sc-label">${o.label}${S.sub ? ' · ' + S.sub : ''}</div></div></div>
        <ul class="sc-props">${props.map(p => `<li>${p}</li>`).join('')}</ul>${isNew ? '<div class="sc-new">✓ บันทึกลงสมุดนักสืบแล้ว</div>' : ''}`;
      card.classList.remove('hidden');
      const r = node.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
      let x = r.right + 12, y = r.top + r.height / 2 - 90;
      if (x + 280 > W) x = r.left - 290;
      if (x < 8) x = Math.min(W - 290, Math.max(8, r.left));
      y = Math.max(80, Math.min(H - 330, y));
      card.style.left = x + 'px'; card.style.top = y + 'px';
      clearTimeout(this._scT); this._scT = setTimeout(() => this.hideScanCard(), 5000);
      if (!this.step) this.renderMission();
    },
    hideScanCard() { $('#scan-card').classList.add('hidden'); },
    highlight(fn, n) {
      const objs = this.objects.filter(o => !o.secret && fn(o)).slice(0, n || 2);
      objs.forEach(o => { const g = $(`#scene-svg .obj[data-i="${o.i}"]`); if (g) { g.classList.add('hint-glow'); setTimeout(() => g.classList.remove('hint-glow'), 4000); } });
    },
    pulseTool(name, on) { const t = $(`.tool[data-tool="${name}"]`); t && t.classList.toggle('pulse', on); },

    /* ---------------- hints (3 levels) ---------------- */
    useHint() {
      const st = this.step;
      if (!st || !st.hints) { this.say(this.district ? 'ตอนนี้สำรวจได้อิสระ ลองแตะสิ่งของ หรือเปิด Shape Lens ดูสิ' : 'เลือกสถานที่บนแผนที่ที่มีลูกศรชี้ได้เลย', 'think'); return; }
      this.hintLevel = Math.min(3, this.hintLevel + 1);
      this.state.stats.hints++; this.save();
      SD.Audio.play('pop');
      this.say(`💡 คำใบ้ ${this.hintLevel}/3: ${st.hints[this.hintLevel - 1]}`, 'think');
      if (this.activity && this.activity.hint) this.activity.hint(this.hintLevel);
    },

    /* ---------------- learning records ---------------- */
    record(ok) {
      const s = this.state.stats, objs = (this.step && this.step.obj) || [];
      objs.forEach(o => { s.obj[o] = s.obj[o] || { a: 0, c: 0 }; s.obj[o].a++; if (ok) s.obj[o].c++; });
      s.streak = ok ? s.streak + 1 : 0;
      if (this.checkTally) { this.checkTally.a++; if (ok) this.checkTally.c++; }
      this.save();
    },
    mistake(cat) {
      this.state.stats.mis[cat] = (this.state.stats.mis[cat] || 0) + 1;
      this.sessionMis[cat] = (this.sessionMis[cat] || 0) + 1; this.save();
    },
    logStep(step, ok) {
      const L = this.state.stats.log;
      L.push({ t: new Date().toISOString(), d: this.district ? this.district.name : '', s: step.title, type: step.type, ok, hints: this.hintLevel });
      if (L.length > 300) L.shift();
      this.save();
    },
    learn(shape) { if (!this.state.learned[shape]) { this.state.learned[shape] = true; this.save(); } },
    addEvidence(o) {
      const ev = this.state.evidence;
      if (!ev.find(e => e.label === o.label && e.d === this.district.id)) { ev.push({ shape: o.shape, label: o.label, fill: o.fill, d: this.district.id }); this.save(); }
    },

    /* ---------------- API given to activities ---------------- */
    api() {
      const app = this;
      return {
        get scene() { return $('#scene-svg'); },
        say: (t, m) => app.say(t, m), toast: t => app.toast(t),
        openPanel: (title, o) => app.openPanel(title, o), closePanel: () => app.closePanel(),
        setSceneHandler: fn => { app.sceneHandler = fn; },
        setWitness: w => app.renderMission({ witness: w }), progress: t => app.renderMission({ progress: t }),
        pulseTool: (n, on) => app.pulseTool(n, on), lensOn: () => app.lensOn, onLens: cb => { app.lensCb = cb; },
        scanCard: (o, n) => app.scanCard(o, n), highlight: (fn, n) => app.highlight(fn, n),
        record: ok => app.record(ok), mistake: c => app.mistake(c),
        mis: c => app.sessionMis[c] || 0, isStrong: () => app.state.stats.streak >= 4,
        addEvidence: o => app.addEvidence(o), learn: t => app.learn(t),
        saveCreation: (k, d, t) => { app.state.creations[k] = { d, t }; app.save(); },
        complete: (text, shape) => app.completeStep(text, shape), fx: n => app.fx(n)
      };
    },

    /* ---------------- speech: mentor bubble or panel footer ---------------- */
    say(text, mood) {
      if (!text) return;
      const inPanel = !$('#panel').classList.contains('hidden');
      const cls = mood === 'good' || mood === 'happy' ? 'good' : mood === 'soft' ? 'soft' : '';
      if (inPanel) {
        const t = $('#say-text'); t.innerHTML = text; t.className = 'say-text ' + cls;
        $('#say-owl').innerHTML = SD.owlSVG(mood === 'soft' || mood === 'think' ? 'think' : 'happy');
      }
      const b = $('#mentor .mentor-bubble');
      $('#mentor-text').innerHTML = text;
      b.className = 'mentor-bubble ' + (cls === 'good' ? 'mood-good' : cls === 'soft' ? 'mood-soft' : '');
      b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
      $('#mentor-owl').innerHTML = SD.owlSVG(mood === 'soft' || mood === 'think' ? 'think' : 'happy');
    },
    toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(this._tt); this._tt = setTimeout(() => e.classList.remove('show'), 2400); },
    fx(kind) {
      const L = $('#fx-layer');
      if (kind === 'confetti') {
        const colors = ['#ff8a65', '#4fc3f7', '#ffd54f', '#81c784', '#f06292', '#ba68c8'];
        const shapes = ['triangle', 'square', 'circle', 'pentagon', 'hexagon', 'ellipse'];
        for (let i = 0; i < 46; i++) {
          const c = document.createElement('div'); c.className = 'confetti';
          c.innerHTML = SD.shapeIcon(shapes[i % 6], 22, colors[i % 6]);
          c.style.left = '50%'; c.style.top = '45%'; c.style.width = c.style.height = '22px';
          c.style.setProperty('--dx', (Math.random() * 2 - 1) * 55 + 'vw'); c.style.setProperty('--dy', (Math.random() * 2 - .6) * 50 + 'vh');
          c.style.animationDelay = Math.random() * .2 + 's';
          L.appendChild(c); setTimeout(() => c.remove(), 1900);
        }
      } else {
        for (let i = 0; i < 10; i++) {
          const s = document.createElement('div'); s.className = 'sparkle'; s.textContent = '✨';
          s.style.left = 35 + Math.random() * 30 + '%'; s.style.top = 30 + Math.random() * 30 + '%'; s.style.animationDelay = i * .07 + 's';
          L.appendChild(s); setTimeout(() => s.remove(), 1500);
        }
      }
    },

    /* ---------------- panel & reward overlays ---------------- */
    openPanel(title, o) {
      o = o || {};
      $('#panel-title').innerHTML = title;
      $('#panel .panel-book').classList.toggle('single', !!o.single);
      $('#panel-close').style.display = o.closable === false ? 'none' : '';
      $('#panel-hint').style.display = o.noHint ? 'none' : '';
      $('#panel-say').style.display = o.noSay ? 'none' : '';
      $('#say-text').innerHTML = ''; this.panelTool = !!o.tool;
      $('#panel').classList.remove('hidden');
      this.hideScanCard();
      const b = $('#panel-body'); b.innerHTML = ''; return b;
    },
    closePanel(silent) {
      $('#panel').classList.add('hidden'); $('#panel-body').innerHTML = '';
      if (!silent && this.step) this.renderMission();
    },
    panelCloseClicked() {
      SD.Audio.play('click');
      const wasTool = this.panelTool;
      this.closePanel(true);
      if (!wasTool && this.step && PANEL_TYPES.includes(this.step.type)) {
        this.cleanup();
        this.say('พักก่อนได้นะ เมื่อพร้อมแล้ว กดปุ่ม “▶ เปิดภารกิจ” บนการ์ดคดีได้เลย', 'think');
      }
      if (this.step) this.renderMission();
    },
    showReward(html, onGo) {
      const r = $('#reward');
      r.innerHTML = `<div class="reward-box paper">${html}</div>`;
      r.classList.remove('hidden');
      const go = r.querySelector('[data-go]');
      if (go) go.onclick = () => { SD.Audio.play('click'); this.hideReward(); onGo && onGo(); };
    },
    hideReward() { $('#reward').classList.add('hidden'); $('#reward').innerHTML = ''; },

    renderKeyring() {
      $('#keyring').innerHTML = KEY_ORDER.map(k => `<div class="key-slot ${this.state.keys.includes(k) ? 'got' : ''}" title="กุญแจ${SD.SHAPES[k].th}">${this.keySVG(k, 38)}</div>`).join('');
    },

    /* ---------------- NOTEBOOK ---------------- */
    openNotebook(tab) {
      const body = this.openPanel('📓 สมุดนักสืบของ ' + this.detName(), { tool: true, noHint: true, noSay: true });
      const tabs = [['case', '📁 คดี'], ['know', '📐 ความรู้รูปทรง'], ['clue', '🃏 เบาะแส'], ['collect', '🏅 ตราและของสะสม'], ['art', '🎨 ผลงานของฉัน']];
      tab = tab || 'case';
      const S = this.state;
      let page = '';
      if (tab === 'case') {
        page = SD.DISTRICTS.map(d => {
          const n = Math.min(S.stepIdx[d.id] || 0, d.steps.length), un = this.isUnlocked(d);
          return `<div class="case-row">${d.key ? this.keySVG(d.key, 44) : '❓'}<div><b>${d.caseTitle}</b><div class="muted">${d.name} · ภารกิจ ${S.done[d.id] ? d.steps.length : n}/${d.steps.length}</div></div><div class="st">${S.done[d.id] ? '✅ ไขแล้ว' : un ? '🔍 กำลังสืบ' : '🔒 ยังล็อก'}</div></div>`;
        }).join('');
      } else if (tab === 'know') {
        const types = ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'circle', 'ellipse'];
        page = `<div class="nb-grid">${types.map(t => {
          const L = S.learned[t], Sh = SD.SHAPES[t];
          const ex = Object.entries(S.discoveries).filter(([, v]) => v === t).map(([k]) => k.split('|')[1]);
          return L ? `<div class="nb-card">${SD.shapeIcon(t, 60)}<h4>${Sh.th}${Sh.sub ? ` <small>(${Sh.sub})</small>` : ''}</h4><p>${SD.describe(t)}</p><p class="ex">พบในเมือง: ${[...new Set(ex)].slice(0, 5).join(', ') || '-'}</p></div>`
            : `<div class="nb-card locked"><div style="font-size:3rem">❔</div><h4>ยังไม่ค้นพบ</h4><p>สแกนสิ่งของในเมืองเพื่อปลดล็อกหน้านี้</p></div>`;
        }).join('')}</div>`;
      } else if (tab === 'clue') {
        page = S.clues.length ? `<div class="nb-grid">${S.clues.map(c => `<div class="clue-card">${SD.shapeIcon(c.icon, 34)} ${c.text}</div>`).join('')}</div>` : '<p class="muted">ยังไม่มีการ์ดเบาะแส ไขคดีเพื่อเก็บการ์ดนะ</p>';
      } else if (tab === 'collect') {
        const disc = Object.keys(S.discoveries).length;
        page = `<div class="nb-grid">
          <div class="nb-card"><h4>🔑 กุญแจรูปทรง ${S.keys.length}/6</h4><div>${KEY_ORDER.map(k => `<span style="opacity:${S.keys.includes(k) ? 1 : .25}">${this.keySVG(k, 46)}</span>`).join('')}</div></div>
          <div class="nb-card"><h4>🔎 Discovery Collection</h4><p>สแกนสิ่งของแล้ว <b>${disc}</b> ชิ้น</p></div>
          <div class="nb-card"><h4>🗺️ แผนที่ลับ ${Object.keys(S.secrets).length}/${SD.SECRET_TOTAL}</h4><p>ใช้ Clue Scanner หาชิ้นส่วนเล็กๆ ที่ซ่อนอยู่ในแต่ละสถานที่</p></div>
          ${S.badges.map(b => `<div class="nb-card"><h4>🏅 ${b.name}</h4>${SD.shapeIcon(b.icon, 40)}</div>`).join('')}</div>`;
      } else {
        const cr = Object.entries(S.creations);
        page = (cr.length || S.gallery.length) ? `<div class="nb-grid">${cr.map(([k, v]) => `<div class="nb-card"><svg viewBox="0 0 560 420" style="width:100%;height:120px"><path d="${v.d}" fill="${SD.SHAPES[v.t].color}" stroke="#3b2a20" stroke-width="6"/></svg><h4>${SD.SHAPES[v.t].th}</h4><p class="ex">ใช้ซ่อมนิทรรศการ</p></div>`).join('')}
          ${S.gallery.slice(-12).map(g => `<div class="nb-card"><svg viewBox="0 0 560 420" style="width:100%;height:120px"><path d="${g.d}" fill="${g.t ? SD.SHAPES[g.t].color : '#eee'}" stroke="#3b2a20" stroke-width="6"/></svg><h4>${g.t ? SD.SHAPES[g.t].th : 'ภาพวาดอิสระ'}</h4></div>`).join('')}</div>` : '<p class="muted">ยังไม่มีผลงาน ลองใช้ Shape Pen วาดรูปดูสิ</p>';
      }
      body.innerHTML = `<div class="nb-tabs">${tabs.map(([k, n]) => `<button class="nb-tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div><div class="nb-page">${page}</div>`;
      body.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { SD.Audio.play('click'); this.openNotebook(b.dataset.tab); });
    },

    openBag() {
      const body = this.openPanel('💼 ถุงหลักฐาน', { tool: true, noHint: true, noSay: true });
      const ev = this.state.evidence;
      body.innerHTML = ev.length ? `<p class="muted">หลักฐานที่พิสูจน์ด้วย Shape Lens แล้ว ${ev.length} ชิ้น</p><div class="nb-grid">${ev.map(e => `<div class="nb-card">${SD.shapeIcon(e.shape, 52, e.fill)}<h4>${e.label}</h4><p>${SD.SHAPES[e.shape].th}</p><p class="ex">${SD.describe(e.shape)}</p></div>`).join('')}</div>`
        : '<p class="muted" style="font-size:1.2rem">ถุงยังว่างอยู่ เมื่อพิสูจน์คำให้การพยานสำเร็จ หลักฐานจะถูกเก็บไว้ที่นี่</p>';
    },

    /* ---------------- SHAPE PEN STUDIO (free draw, recognise anything) ---------------- */
    openStudio() {
      const body = this.openPanel('✏️ Shape Pen · ห้องวาดภาพนักสืบ', { tool: true, noHint: true });
      body.innerHTML = `<div class="draw-wrap"><div class="draw-left"><div class="draw-goal">วาดรูปเรขาคณิตอะไรก็ได้ แล้วให้ลุงฮูกตรวจว่าเป็นรูปอะไร</div>
        <div class="canvas-box"><canvas></canvas></div>
        <div class="draw-btns"><button class="btn btn-small" data-a="clear">🧽 ลบ</button><button class="btn btn-orange" data-a="check">🔍 ตรวจรูป</button></div></div>
        <div class="exhibit-card"><h4>ผลการตรวจ</h4><div class="stage grid-bg" id="studio-res" style="display:grid;place-items:center;padding:1rem;text-align:center;font-weight:700;font-size:1.1rem">ยังไม่ได้ตรวจ</div></div></div>`;
      this.say('วาดรูปที่มีเส้นตรงต่อกันเป็นรูปปิด หรือวาดเส้นโค้งวนรอบก็ได้นะ', 'happy');
      const canvas = body.querySelector('canvas'), box = body.querySelector('.canvas-box'), ctx = canvas.getContext('2d');
      let strokes = [], cur = null, scale = 1;
      const LW = 560;
      const size = () => { const r = box.getBoundingClientRect(), dpr = devicePixelRatio || 1; canvas.width = r.width * dpr; canvas.height = r.height * dpr; scale = r.width / LW; ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0); draw(); };
      const draw = () => { ctx.clearRect(0, 0, 4000, 4000); ctx.lineWidth = 8; ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = '#3b2a20'; strokes.forEach(s => { ctx.beginPath(); s.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }); };
      const pt = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; };
      canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); cur = [pt(e)]; strokes.push(cur); });
      canvas.addEventListener('pointermove', e => { if (!cur) return; cur.push(pt(e)); if (cur.length % 6 === 0) SD.Audio.play('draw'); draw(); });
      canvas.addEventListener('pointerup', () => { cur = null; });
      setTimeout(size, 30);
      body.querySelector('[data-a="clear"]').onclick = () => { strokes = []; draw(); };
      body.querySelector('[data-a="check"]').onclick = () => {
        const all = strokes.filter(s => s.length > 1); if (!all.length) return;
        const r = SD.recognize(all), res = body.querySelector('#studio-res');
        let t = null, msg;
        if (r.kind === 'open') msg = 'เส้นยังไม่ปิด รูปเรขาคณิตต้องเป็นรูปปิด ลองลากกลับมาที่จุดเริ่มต้นนะ';
        else if (r.kind === 'tiny') msg = 'วาดใหญ่ขึ้นอีกนิดนะ';
        else if (r.kind === 'circle') { t = 'circle'; msg = 'เส้นโค้งปิด ไม่มีมุม กว้างพอๆ กับสูง'; }
        else if (r.kind === 'ellipse') { t = 'ellipse'; msg = 'เส้นโค้งปิด ไม่มีมุม แต่ยาวกับกว้างไม่เท่ากัน'; }
        else { t = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon' }[r.sides]; msg = t ? `มีเส้นตรง ${r.sides} ด้าน ${r.sides} มุม` : `ลุงฮูกนับได้ ${r.sides} มุม เป็นรูปหลายเหลี่ยม`; }
        res.innerHTML = t ? `${SD.shapeIcon(t, 90)}<div style="font-size:1.5rem">${SD.SHAPES[t].th}</div><div>${msg}</div>` : `<div style="font-size:3rem">🤔</div><div>${msg}</div>`;
        SD.Audio.play(t ? 'success' : 'soft');
        this.say(t ? `ลุงฮูกคิดว่าเป็น${SD.SHAPES[t].th}! ${msg}` : msg, t ? 'good' : 'soft');
        if (t) { this.learn(t); const d = all.map(s => 'M' + s.map(p => p.map(v => v.toFixed(0)).join(' ')).join(' L')).join(' ') + ' Z'; this.state.gallery.push({ d, t }); if (this.state.gallery.length > 30) this.state.gallery.shift(); this.save(); }
      };
    },

    /* ======================= TEACHER MODE ======================= */
    showTeacher() {
      this.cleanup(); this.closePanel(true); this.hideReward(); this.mode = 'teacher'; this.single = null; this.district = null; this.step = null;
      this.show('scr-teacher');
      const cards = [
        ['intro', '📖', 'Teacher Introduction', 'เล่าเรื่องเปิดคดี + กระดานรู้จักรูปทรง ให้นักเรียนออกมานับด้าน-มุมบนจอ', '5–7 นาที'],
        ['guided', '🗺️', 'Guided Exploration', 'เปิดเมืองพร้อม Shape Lens ถามนักเรียน “เห็นรูปอะไร? รู้ได้อย่างไร?”', '8–10 นาที'],
        ['challenge', '🎯', 'Classroom Challenge', 'เลือกกิจกรรมเดี่ยวจากทุกคดีมาเล่นทั้งห้อง (พยาน, จัดลัง, ประกอบรถไฟ, วาด ฯลฯ)', 'ยืดหยุ่น'],
        ['discuss', '💬', 'Discussion Moment', 'คำถามชวนคิดพร้อมภาพเคลื่อนไหว และแนวคำตอบสำหรับครู', '5 นาที'],
        ['check', '✅', 'Learning Check', 'ภารกิจตรวจความเข้าใจ 3 ขั้น: จำแนก → พิสูจน์ → วาด พร้อมสรุปผล', '7–10 นาที'],
        ['wrap', '🏁', 'Wrap-up', 'สรุปความรู้รูปหลายเหลี่ยม วงกลม วงรี และคำถามสะท้อนคิด', '3–5 นาที']
      ];
      $('#tb-grid').innerHTML = cards.map(([k, ic, h, p, tm], i) => `<div class="tb-card" data-k="${k}"><div class="n">${i + 1}</div><div class="ic">${ic}</div><h3>${h}</h3><p>${p}</p><div class="tm">⏱ ${tm}</div></div>`).join('');
      $$('.tb-card').forEach(c => c.onclick = () => { SD.Audio.play('click'); this.teacherAction(c.dataset.k); });
    },
    teacherAction(k) {
      if (k === 'intro') this.playIntro(() => { this.show('scr-teacher'); this.shapeBoard(); });
      else if (k === 'guided') this.showMap();
      else if (k === 'challenge') this.challengeList();
      else if (k === 'discuss') this.discussion(0);
      else if (k === 'check') this.learningCheck();
      else if (k === 'wrap') this.wrapUp();
    },
    shapeBoard() {
      const body = this.openPanel('📐 กระดานรู้จักรูปทรง — แตะรูปเพื่อนับด้านและมุมร่วมกัน', { tool: true, noHint: true });
      const types = ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'circle', 'ellipse'];
      body.innerHTML = `<div class="nb-grid" style="grid-template-columns:repeat(4,1fr)">${types.map(t => `<button class="nb-card" data-t="${t}" style="cursor:pointer">${SD.shapeIcon(t, 90)}<h4>${SD.SHAPES[t].th}</h4><p class="ex">${SD.SHAPES[t].sub || ''}</p></button>`).join('')}</div>`;
      this.say('ให้นักเรียนทายก่อนว่ารูปนี้มีกี่ด้าน กี่มุม แล้วแตะเพื่อพิสูจน์ด้วย Shape Lens', 'think');
      body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
        const t = b.dataset.t, S = SD.SHAPES[t];
        const w = t === 'rectangle' ? 260 : t === 'ellipse' ? 260 : 220, h = t === 'rectangle' ? 150 : t === 'ellipse' ? 150 : 200;
        SD.Proof(body, { shape: t, w, h, rot: 0, fill: S.color, label: S.th }, { api: this.api(), practice: true, onDone: () => this.shapeBoard() });
      });
    },
    challengeList() {
      const body = this.openPanel('🎯 Classroom Challenge — เลือกกิจกรรม', { tool: true, noHint: true, noSay: true });
      const typeName = { lens: 'Shape Lens', find: 'พยาน + พิสูจน์', sort: 'จัดลังหลักฐาน', scan: 'สแกนในความมืด', arrange: 'ประกอบจากแบบ', stretch: 'ทดลองวงกลม-วงรี', compare: 'เปรียบเทียบรูป', draw: 'วาดรูป', combine: 'จับคู่กุญแจ', deduce: 'สืบหาคนร้าย' };
      let h = '<div class="challenge-list">';
      SD.DISTRICTS.forEach(d => d.steps.forEach((s, i) => {
        h += `<button class="challenge-item" data-d="${d.id}" data-i="${i}"><b>${s.title}</b><small>${d.name} · ${typeName[s.type] || s.type} · ${s.obj.map(o => o).join(', ')}</small></button>`;
      }));
      h += '</div>';
      body.innerHTML = `<p class="muted" style="margin-top:0">O1 เรียกชื่อ · O2 บอกลักษณะ · O3 จำแนก · O4 เปรียบเทียบ · O5 วาด/สังเกตจากแบบ</p>` + h;
      body.querySelector('.challenge-list').style.height = 'calc(100% - 2rem)';
      body.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { this.closePanel(true); this.runSingle(b.dataset.d, +b.dataset.i, () => { this.showTeacher(); this.challengeList(); }); });
    },
    discussion(i) {
      const D = SD.DISCUSSIONS, q = D[i];
      const body = this.openPanel(`💬 Discussion Moment ${i + 1}/${D.length}`, { tool: true, noHint: true, noSay: true });
      const vis = {
        rotSquare: `<svg viewBox="0 0 400 300"><g style="transform-origin:200px 150px;animation:spin 6s linear infinite">${SD.shapeEl({ shape: 'square', x: 200, y: 150, w: 150, h: 150, fill: '#4fc3f7', sw: 6 })}</g></svg>`,
        circleEllipse: `<svg viewBox="0 0 400 300">${SD.shapeEl({ shape: 'circle', x: 120, y: 150, w: 150, fill: '#81c784', sw: 6 })}${SD.shapeEl({ shape: 'ellipse', x: 290, y: 150, w: 180, h: 110, fill: '#f06292', sw: 6 })}</svg>`,
        openTriangle: `<svg viewBox="0 0 400 300"><polyline points="120,240 200,70 280,240 150,240" fill="none" stroke="#3b2a20" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="150" cy="240" r="10" fill="#e53935"/><circle cx="120" cy="240" r="10" fill="#e53935"/></svg>`,
        classroom: `<svg viewBox="0 0 400 300"><rect x="40" y="40" width="200" height="120" fill="#2e7d32" stroke="#3b2a20" stroke-width="6"/>${SD.shapeEl({ shape: 'circle', x: 320, y: 80, w: 80, fill: '#fff', sw: 5 })}<rect x="280" y="150" width="70" height="130" fill="#a1887f" stroke="#3b2a20" stroke-width="5"/>${SD.shapeEl({ shape: 'ellipse', x: 140, y: 240, w: 120, h: 60, fill: '#ffe0b2', sw: 5 })}</svg>`,
        pentaHexa: `<svg viewBox="0 0 400 300">${SD.shapeEl({ shape: 'pentagon', x: 120, y: 150, w: 150, h: 144, fill: '#ba68c8', sw: 6 })}${SD.shapeEl({ shape: 'hexagon', x: 290, y: 150, w: 160, h: 140, fill: '#ffd54f', sw: 6 })}</svg>`
      };
      body.innerHTML = `<div class="discuss"><div style="display:flex;flex-direction:column;gap:1rem"><div class="q">${q.q}</div><div id="ans"></div>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:auto"><button class="btn btn-teal" data-a="show">👀 เผยแนวคำตอบ</button>${i > 0 ? '<button class="btn" data-a="prev">◀ ก่อนหน้า</button>' : ''}${i < D.length - 1 ? '<button class="btn btn-orange" data-a="next">ถัดไป ▶</button>' : ''}</div></div>
        <div class="stage grid-bg">${vis[q.vis]}</div></div>`;
      body.querySelector('[data-a="show"]').onclick = () => { body.querySelector('#ans').innerHTML = `<div class="a">${q.a}</div>`; SD.Audio.play('discover'); };
      const p = body.querySelector('[data-a="prev"]'), n = body.querySelector('[data-a="next"]');
      if (p) p.onclick = () => this.discussion(i - 1); if (n) n.onclick = () => this.discussion(i + 1);
    },
    learningCheck() {
      const seq = [['market', 1], ['square', 1], ['museum', 2]];
      this.checkTally = { a: 0, c: 0 };
      let k = 0;
      const next = () => {
        if (k >= seq.length) {
          const t = this.checkTally; this.checkTally = null;
          const pct = t.a ? Math.round(t.c / t.a * 100) : 0;
          this.showTeacher();
          this.showReward(`<h2>✅ ผล Learning Check</h2><p>ภารกิจ 3 ขั้น: จำแนกรูป → พิสูจน์คำให้การ → วาดตามเงื่อนไข</p>
            <div class="explain-box" style="text-align:center;font-size:1.4rem">ความแม่นยำของทั้งห้อง: <b>${pct}%</b> (${t.c}/${t.a} ครั้ง)</div>
            <p class="muted">${pct >= 80 ? 'นักเรียนเข้าใจดีมาก ลองใช้ Discussion Moment ต่อยอดได้' : 'แนะนำ: ทบทวน Discussion Moment ข้อ 1–2 และกิจกรรม “ห้องทดลองยืดวงกลม”'}</p>
            <button class="btn btn-green btn-big" data-go>กลับสู่แผนการสอน</button>`, () => { });
          return;
        }
        const [d, i] = seq[k++];
        this.runSingle(d, i, next);
      };
      next();
    },
    wrapUp() {
      const body = this.openPanel('🏁 Wrap-up — สรุปสิ่งที่นักสืบค้นพบ', { tool: true, noHint: true, noSay: true });
      body.innerHTML = `<div class="summary-board">
        <div class="nb-card">${SD.shapeIcon('triangle', 60)}${SD.shapeIcon('square', 60)}${SD.shapeIcon('hexagon', 60)}<h4>รูปหลายเหลี่ยม</h4><p>มีเส้นตรงล้อมรอบเป็นรูปปิด มีด้านและมุม จำนวนด้านเท่ากับจำนวนมุม</p></div>
        <div class="nb-card">${SD.shapeIcon('circle', 80)}<h4>วงกลม</h4><p>เส้นโค้งปิด ไม่มีมุม กว้างเท่ากับสูง</p></div>
        <div class="nb-card">${SD.shapeIcon('ellipse', 80)}<h4>วงรี</h4><p>เส้นโค้งปิด ไม่มีมุม ยาวกับกว้างไม่เท่ากัน</p></div></div>
        <div class="explain-box" style="background:#fff8e1">🔁 สี ขนาด และการหมุน ไม่ทำให้ชนิดของรูปเปลี่ยน · ✏️ วาดรูปหลายเหลี่ยมด้วยเส้นตรงที่ปลายมาบรรจบกัน · วาดวงกลม/วงรีด้วยเส้นโค้งปิด</div>
        <div class="explain-box" style="background:#fff">💭 คำถามสะท้อนคิด: 1) วันนี้เธอใช้หลักฐานอะไรพิสูจน์ว่าเป็นรูปสามเหลี่ยม? 2) จะบอกเพื่อนอย่างไรว่าวงกลมกับวงรีต่างกัน? 3) ที่บ้านมีอะไรเป็นรูปหกเหลี่ยมบ้าง?</div>`;
    },
    showReport() {
      const S = this.state.stats;
      const body = this.openPanel('📊 รายงานผลการเรียนรู้ (เก็บในเครื่องนี้)', { tool: true, noHint: true, noSay: true });
      const rows = Object.entries(SD.OBJECTIVES).map(([k, n]) => { const o = S.obj[k] || { a: 0, c: 0 }, p = o.a ? Math.round(o.c / o.a * 100) : 0; return `<tr><td><b>${k}</b> ${n}</td><td>${o.c}/${o.a}</td><td><div class="bar"><i style="width:${p}%"></i></div></td><td>${o.a ? p + '%' : '-'}</td></tr>`; }).join('');
      const misName = { circleEllipse: 'สับสนวงกลม/วงรี', sides: 'นับด้าน/มุมคลาดเคลื่อน', rotation: 'คิดว่าหมุน/ย่อแล้วเป็นรูปใหม่', general: 'อื่นๆ (เส้นตรง/โค้ง)' };
      const log = S.log.slice(-8).reverse().map(l => `<tr><td>${new Date(l.t).toLocaleString('th-TH')}</td><td>${l.d}</td><td>${l.s}</td><td>${l.hints}</td></tr>`).join('');
      body.innerHTML = `<div style="height:100%;overflow-y:auto;display:grid;gap:.8rem">
        <table class="report-table"><tr><th>จุดประสงค์การเรียนรู้</th><th>ถูก/ครั้ง</th><th colspan="2">ความแม่นยำ</th></tr>${rows}</table>
        <table class="report-table"><tr><th>ความเข้าใจคลาดเคลื่อนที่พบ</th><th>จำนวนครั้ง</th><th>ข้อเสนอแนะ</th></tr>
        ${Object.entries(misName).map(([k, n]) => `<tr><td>${n}</td><td>${S.mis[k] || 0}</td><td>${{ circleEllipse: 'ใช้ “ห้องทดลองยืดวงกลม” + Discussion ข้อ 2', sides: 'ให้แตะนับด้านด้วย Shape Lens + Discussion ข้อ 5', rotation: 'ใช้กิจกรรมโรงงาน (หมุน/ย่อ) + Discussion ข้อ 1', general: 'ใช้ Shape Lens ดูสีฟ้า(ตรง)/ส้ม(โค้ง)' }[k]}</td></tr>`).join('')}</table>
        <table class="report-table"><tr><th>เวลา</th><th>สถานที่</th><th>ภารกิจที่สำเร็จล่าสุด</th><th>คำใบ้ที่ใช้</th></tr>${log || '<tr><td colspan="4">ยังไม่มีข้อมูล</td></tr>'}</table>
        <p class="muted">คำใบ้ที่ใช้ทั้งหมด: ${S.hints} ครั้ง · สแกนสิ่งของ: ${Object.keys(this.state.discoveries).length} ชิ้น · กุญแจ: ${this.state.keys.length}/6</p>
        <div style="display:flex;gap:.6rem"><button class="btn btn-small btn-teal" data-a="csv">⬇️ Export CSV</button><button class="btn btn-small btn-red" data-a="reset">🗑️ ล้างข้อมูลรายงาน</button></div></div>`;
      body.querySelector('[data-a="csv"]').onclick = () => {
        const lines = [['objective', 'name', 'correct', 'attempts']].concat(Object.entries(SD.OBJECTIVES).map(([k, n]) => [k, n, (S.obj[k] || {}).c || 0, (S.obj[k] || {}).a || 0]));
        lines.push([]); lines.push(['misconception', 'count']); Object.entries(S.mis).forEach(([k, v]) => lines.push([k, v]));
        lines.push([]); lines.push(['time', 'place', 'mission', 'hints']); S.log.forEach(l => lines.push([l.t, l.d, l.s, l.hints]));
        const blob = new Blob(['\ufeff' + lines.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'shape-detective-report.csv'; a.click();
      };
      body.querySelector('[data-a="reset"]').onclick = () => { if (confirm('ล้างข้อมูลรายงานทั้งหมด?')) { this.state.stats = defState().stats; this.save(); this.showReport(); } };
    }
  };

  window.SD.App = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
