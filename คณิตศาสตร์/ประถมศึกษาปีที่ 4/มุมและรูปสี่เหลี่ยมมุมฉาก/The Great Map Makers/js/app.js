/**
 * THE GREAT MAP MAKERS - Master Application Controller
 * Handles state, Tri-Mode (Self-Learning, Explore, Teacher Mode), Fog-of-War, and fresh session reset.
 */
(function () {
  'use strict';

  function createInitialState() {
    return {
      studentName: 'นักทำแผนที่รุ่นเยาว์',
      mode: 'self', // 'self' | 'teacher' | 'explore'
      unlockedAreas: ['point-plaza'],
      completedMissions: [],
      discoveries: ['disc_point'],
      mapProgress: 16, // %
      storySeen: false,
      isPaused: false
    };
  }

  const App = {
    state: null,

    init() {
      // 1. Fresh Session Reset Every Time
      this.resetSession();

      // 2. Render initial characters & UI
      this.renderTitleCharacters();

      // 3. Bind Main Global UI Events
      this.bindEvents();

      // 4. Default to Title Screen
      this.showScreen('scr-title');
    },

    resetSession() {
      this.state = createInitialState();
      try {
        localStorage.removeItem('mapMakers_state');
      } catch (e) { /* ignore */ }
    },

    setUser(profile) {
      if (profile && profile.username) {
        this.state.studentName = profile.username;
        const nameInput = document.getElementById('student-name-input');
        if (nameInput) nameInput.value = profile.username;
      }
    },

    renderTitleCharacters() {
      const charSlot = document.getElementById('title-char-slot');
      if (charSlot && window.MapCharacters) {
        charSlot.innerHTML = window.MapCharacters.captainDotSVG('cheer', 210);
      }
      const compassSlot = document.getElementById('title-compass-slot');
      if (compassSlot && window.MapCharacters) {
        compassSlot.innerHTML = window.MapCharacters.compassSVG(35, 110);
      }
    },

    bindEvents() {
      // Title Buttons
      const btnStart = document.getElementById('btn-start-adventure');
      if (btnStart) {
        btnStart.onclick = () => {
          if (window.MapAudio) window.MapAudio.click();
          this.showScreen('scr-mode');
        };
      }

      // Mode Selection Buttons
      const btnSelf = document.getElementById('mode-btn-self');
      if (btnSelf) {
        btnSelf.onclick = () => {
          this.state.mode = 'self';
          if (window.MapAudio) window.MapAudio.click();
          this.saveStudentName();
          if (!this.state.storySeen) this.playStoryIntro();
          else this.openWorldMap();
        };
      }

      const btnTeacher = document.getElementById('mode-btn-teacher');
      if (btnTeacher) {
        btnTeacher.onclick = () => {
          this.state.mode = 'teacher';
          // In Teacher Mode, all 6 areas unlocked for instant teaching
          this.state.unlockedAreas = ['point-plaza', 'line-forest', 'ray-lighthouse', 'angle-canyon', 'right-angle-village', 'maporia-city'];
          if (window.MapAudio) window.MapAudio.click();
          this.showTeacherBoard();
        };
      }

      // Story Next Button
      const storyNext = document.getElementById('story-next-btn');
      if (storyNext) {
        storyNext.onclick = () => {
          if (window.MapAudio) window.MapAudio.click();
          this.state.storySeen = true;
          this.openWorldMap();
        };
      }

      // HUD Buttons
      const btnMapHome = document.getElementById('btn-hud-map');
      if (btnMapHome) {
        btnMapHome.onclick = () => {
          if (window.MapAudio) window.MapAudio.click();
          this.openWorldMap();
        };
      }

      const btnSound = document.getElementById('btn-hud-sound');
      if (btnSound) {
        btnSound.onclick = () => {
          const on = window.MapAudio ? window.MapAudio.toggleSound() : true;
          btnSound.textContent = on ? '🔊' : '🔇';
        };
      }

      const btnDisc = document.getElementById('btn-hud-discovery');
      if (btnDisc) {
        btnDisc.onclick = () => {
          if (window.MapAudio) window.MapAudio.click();
          this.showDiscoveryBook();
        };
      }

      const btnTeacherHUD = document.getElementById('btn-hud-teacher');
      if (btnTeacherHUD) {
        btnTeacherHUD.onclick = () => {
          if (window.MapAudio) window.MapAudio.click();
          this.showTeacherBoard();
        };
      }

      // Discovery Modal Close
      const discClose = document.getElementById('disc-modal-close');
      if (discClose) {
        discClose.onclick = () => {
          document.getElementById('discovery-modal').style.display = 'none';
        };
      }
    },

    saveStudentName() {
      const nameInput = document.getElementById('student-name-input');
      if (nameInput && nameInput.value.trim()) {
        this.state.studentName = nameInput.value.trim();
      }
    },

    showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(scr => {
        scr.classList.toggle('active', scr.id === screenId);
      });

      const inGame = ['scr-map', 'scr-workspace', 'scr-teacher'].includes(screenId);
      const hud = document.getElementById('main-hud');
      if (hud) hud.classList.toggle('hidden', !inGame);

      if (screenId === 'scr-map') {
        this.renderWorldMap();
      }
    },

    playStoryIntro() {
      this.showScreen('scr-intro');
      const art = document.getElementById('story-char-art');
      if (art && window.MapCharacters) {
        art.innerHTML = window.MapCharacters.captainDotSVG('cheer', 220);
      }
      const introText = 'ยินดีต้อนรับสู่ Maporia! ดินแดนลึกลับที่หมอกหนาบดบังจนไม่มีใครรู้ว่าเมืองอยู่ที่ใด... เราคือนักทำแผนที่รุ่นเยาว์ ที่จะใช้ความรู้เรื่อง "จุด เส้นตรง รังสี มุม และสี่เหลี่ยมมุมฉาก" เพื่อสร้างแผนที่ของเราขึ้นมา!';
      const txt = document.getElementById('story-caption');
      if (txt) txt.textContent = introText;
      if (window.MapAudio) window.MapAudio.speak(introText);
    },

    openWorldMap() {
      this.showScreen('scr-map');
      this.updateProgressHUD();
    },

    renderWorldMap() {
      if (!window.MapWorldRenderer) return;
      window.MapWorldRenderer.renderMap('world-map-viewport', this.state.unlockedAreas, (areaId) => {
        this.onSelectArea(areaId);
      });
    },

    onSelectArea(areaId) {
      if (!this.state.unlockedAreas.includes(areaId) && this.state.mode !== 'teacher') {
        this.showToast('🔒 พื้นที่นี้ยังถูกหมอกปกคลุม ทำภารกิจก่อนหน้าเพื่อเปิดทาง!');
        if (window.MapAudio) window.MapAudio.error();
        return;
      }

      if (window.MapAudio) window.MapAudio.click();
      this.showScreen('scr-workspace');
      window.MapActivities.initArea(areaId, (completedAreaId) => {
        this.handleAreaCompleted(completedAreaId);
      });
    },

    handleAreaCompleted(areaId) {
      // Unlock next area in sequence
      const order = ['point-plaza', 'line-forest', 'ray-lighthouse', 'angle-canyon', 'right-angle-village', 'maporia-city'];
      const currentIndex = order.indexOf(areaId);

      if (currentIndex !== -1 && currentIndex + 1 < order.length) {
        const nextAreaId = order[currentIndex + 1];
        if (!this.state.unlockedAreas.includes(nextAreaId)) {
          this.state.unlockedAreas.push(nextAreaId);
          if (window.MapAudio) window.MapAudio.unlock();
          this.showToast(`✨ ปลดล็อกพื้นที่ใหม่: ${nextAreaId}! หมอกจางลงแล้ว!`);
        }
      }

      // Add discoveries
      const area = window.MapData.areas.find(a => a.id === areaId);
      if (area) {
        this.state.completedMissions.push(area.id);
      }

      this.state.mapProgress = Math.min(100, Math.round((this.state.unlockedAreas.length / order.length) * 100));
      this.updateProgressHUD();
      this.openWorldMap();

      if (this.state.unlockedAreas.length === order.length) {
        this.triggerCelebration();
      }
    },

    updateProgressHUD() {
      const pText = document.getElementById('hud-progress-text');
      const pFill = document.getElementById('hud-progress-fill');
      if (pText) pText.textContent = `${this.state.mapProgress}%`;
      if (pFill) pFill.style.width = `${this.state.mapProgress}%`;
    },

    showDiscoveryBook() {
      const modal = document.getElementById('discovery-modal');
      const list = document.getElementById('disc-items-grid');
      if (!modal || !list || !window.MapData) return;

      list.innerHTML = window.MapData.discoveryBook.map(item => `
        <div class="disc-card paper">
          <div class="disc-sym">${item.symbol}</div>
          <span class="disc-tag">${item.tag}</span>
          <h3 class="disc-title">${item.title}</h3>
          <p class="disc-desc">${item.desc}</p>
          <div class="disc-real"><b>🌍 ในโลกจริง:</b> ${item.realWorld}</div>
          <div class="disc-prop"><b>📐 คุณสมบัติ:</b> ${item.property}</div>
          <button class="speak-btn small" onclick="window.MapAudio && window.MapAudio.speak('${item.title}. ${item.desc}')">🔊 ฟังเสียง</button>
        </div>
      `).join('');

      modal.style.display = 'flex';
    },

    showTeacherBoard() {
      this.showScreen('scr-teacher');
      const grid = document.getElementById('teacher-grid');
      const kit = window.MapData ? window.MapData.teacherKit : null;
      if (!grid || !kit) return;

      grid.innerHTML = `
        <div class="tb-section">
          <h3>🎯 คำถามชวนคิดหน้าชั้นเรียน (Classroom Discussion)</h3>
          <div class="tb-cards-list">
            ${kit.discussionPrompts.map(p => `
              <div class="tb-prompt-card paper">
                <span class="tb-phase">${p.phase}</span>
                <p class="tb-q"><b>❓ คำถาม:</b> ${p.question}</p>
                <p class="tb-a"><b>💡 แนวคำตอบ:</b> ${p.answer}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tb-section">
          <h3>🤝 กิจกรรมกลุ่ม & การประยุกต์ใช้ (Classroom Challenges)</h3>
          <div class="tb-cards-list">
            ${kit.classroomChallenges.map(c => `
              <div class="tb-challenge-card paper">
                <h4>${c.title}</h4>
                <p>${c.instruction}</p>
                <button class="btn btn-small btn-teal" onclick="window.MapApp.onSelectArea('point-plaza')">เริ่มกิจกรรมนี้</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Back to map button in teacher header
      const btnHome = document.getElementById('tb-btn-home');
      if (btnHome) btnHome.onclick = () => this.openWorldMap();
    },

    showToast(msg) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3200);
    },

    triggerCelebration() {
      this.showToast('🏆 ยินดีด้วย! เธอคือ The Great Map Maker ผู้สร้างแผนที่ Maporia!');
    }
  };

  window.MapApp = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
