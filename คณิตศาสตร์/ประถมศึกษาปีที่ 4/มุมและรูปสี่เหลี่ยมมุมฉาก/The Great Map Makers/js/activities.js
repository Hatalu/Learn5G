/**
 * THE GREAT MAP MAKERS - Interactive Geometric Activities & Missions Engine
 * Problem-Driven Learning: Hands-on geometry canvas, live toolbox manipulation, and WOW moments.
 */
(function () {
  'use strict';

  const Activities = {
    currentArea: null,
    currentMission: null,
    activeTool: 'point',
    userPoints: [],
    userLines: [],
    userSegments: [],
    userRays: [],
    userAngles: [],
    userRightAngles: [],
    userRectangles: [],
    tempDraw: null,
    isInteracting: false,
    selectedPoint: null,

    // Launch an area exploration
    initArea(areaId, onCompleteCallback) {
      const area = window.MapData.areas.find(a => a.id === areaId);
      if (!area) return;
      this.currentArea = area;
      this.currentMission = area.missions[0];
      this.onComplete = onCompleteCallback;
      this.resetCanvasData();
      this.renderAreaWorkspace();
    },

    resetCanvasData() {
      this.userPoints = [];
      this.userLines = [];
      this.userSegments = [];
      this.userRays = [];
      this.userAngles = [];
      this.userRightAngles = [];
      this.userRectangles = [];
      this.tempDraw = null;
      this.selectedPoint = null;
    },

    // Set currently active geometry tool
    setTool(toolName) {
      this.activeTool = toolName;
      if (window.MapAudio) window.MapAudio.click();

      document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === toolName);
      });

      this.updateToolInstruction();
    },

    updateToolInstruction() {
      const hintEl = document.getElementById('canvas-tool-hint');
      if (!hintEl) return;

      const hints = {
        point: '📍 แตะบนแผนที่เพื่อ "ปักจุด" ระบุตำแหน่ง',
        segment: '📏 แตะจุดที่ 1 แล้วลากไปหาจุดที่ 2 เพื่อสร้าง "ส่วนของเส้นตรง" (มีจุดปลาย 2 จุด)',
        line: '↔️ แตะ 2 จุดเพื่อสร้าง "เส้นตรง" ที่ต่อออกไปได้เรื่อยๆ ทั้งสองข้าง',
        ray: '🔦 แตะที่จุดกำเนิด แล้วลากทิศทางเพื่อส่อง "รังสี" (จุดเริ่มต้น 1 จุด ต่อไปได้ทางเดียว)',
        angle: '📐 แตะจุดยอดมุม แล้วลากแขนของมุม 2 เส้นเพื่อสร้าง "มุม"',
        right_angle: '🪚 ใช้ไม้ฉากหมุนวัดและล็อก "มุมฉาก 90 องศา"',
        rectangle: '🟩 ปักจุด 4 จุดเพื่อสร้าง "รูปสี่เหลี่ยมมุมฉาก" (ทุกมุมเป็นมุมฉาก 90°)'
      };
      hintEl.textContent = hints[this.activeTool] || '';
    },

    // Render the interactive workspace
    renderAreaWorkspace() {
      const area = this.currentArea;
      const mission = this.currentMission;
      const workspace = document.getElementById('scr-workspace');
      if (!workspace) return;

      workspace.innerHTML = `
        <div class="workspace-header">
          <div class="ws-title-group">
            <button class="round-btn small" id="ws-btn-back" title="กลับแผนที่">🗺️</button>
            <div>
              <span class="ws-zone-badge">${area.zoneNum}. ${area.topic}</span>
              <h2 class="ws-area-name">${area.name}</h2>
            </div>
          </div>
          <div class="ws-mission-card paper">
            <div class="mc-header">
              <span class="mc-tag">🎯 ภารกิจปัจจุบัน</span>
              <button class="speak-btn" id="ws-speak-btn" title="ฟังเสียงอ่าน">🔊</button>
            </div>
            <h4 id="ws-mission-title">${mission.title}</h4>
            <p id="ws-mission-goal">${mission.desc}</p>
          </div>
          <div class="ws-top-actions">
            <button class="btn btn-small btn-amber" id="ws-btn-clear">🧹 ล้างเส้น</button>
            <button class="btn btn-small btn-green" id="ws-btn-check">✨ ตรวจสอบผล</button>
          </div>
        </div>

        <div class="workspace-main">
          <!-- Character Mentor Bar on Left -->
          <div class="ws-character-dock">
            <div id="ws-char-art"></div>
            <div class="ws-speech-bubble paper">
              <p id="ws-speech-text">${area.storyIntro}</p>
              <button class="speak-btn small" id="ws-char-speak">🔊</button>
            </div>
          </div>

          <!-- Interactive Geometry Drawing Canvas -->
          <div class="canvas-viewport paper" id="canvas-viewport">
            <div class="canvas-tool-hint" id="canvas-tool-hint"></div>
            <svg id="geom-canvas-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet"></svg>
          </div>
        </div>

        <!-- The Cartographer's Geometry Toolbox at Bottom -->
        <nav class="geometry-toolbox">
          <div class="toolbox-label">🧰 กล่องเครื่องมือนักทำแผนที่:</div>
          <button class="tool-btn ${this.activeTool === 'point' ? 'active' : ''}" data-tool="point">
            <span class="tool-icon">📍</span>
            <span>จุด (Point)</span>
          </button>
          <button class="tool-btn ${this.activeTool === 'segment' ? 'active' : ''}" data-tool="segment">
            <span class="tool-icon">📏</span>
            <span>ส่วนของเส้นตรง</span>
          </button>
          <button class="tool-btn ${this.activeTool === 'line' ? 'active' : ''}" data-tool="line">
            <span class="tool-icon">↔️</span>
            <span>เส้นตรง (Line)</span>
          </button>
          <button class="tool-btn ${this.activeTool === 'ray' ? 'active' : ''}" data-tool="ray">
            <span class="tool-icon">🔦</span>
            <span>รังสี (Ray)</span>
          </button>
          <button class="tool-btn ${this.activeTool === 'angle' ? 'active' : ''}" data-tool="angle">
            <span class="tool-icon">📐</span>
            <span>มุม (Angle)</span>
          </button>
          <button class="tool-btn ${this.activeTool === 'right_angle' ? 'active' : ''}" data-tool="right_angle">
            <span class="tool-icon">🪚</span>
            <span>มุมฉาก (90°)</span>
          </button>
          <button class="tool-btn ${this.activeTool === 'rectangle' ? 'active' : ''}" data-tool="rectangle">
            <span class="tool-icon">🟩</span>
            <span>สี่เหลี่ยมมุมฉาก</span>
          </button>
        </nav>
      `;

      // Render Character Art
      const charDock = document.getElementById('ws-char-art');
      if (charDock && window.MapCharacters) {
        if (area.id === 'line-forest') charDock.innerHTML = window.MapCharacters.lineySVG(130);
        else if (area.id === 'ray-lighthouse') charDock.innerHTML = window.MapCharacters.rayRaySVG(130);
        else if (area.id === 'angle-canyon') charDock.innerHTML = window.MapCharacters.angleSVG(75, 130);
        else charDock.innerHTML = window.MapCharacters.captainDotSVG('guide', 150);
      }

      // Event bindings
      document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
      });

      document.getElementById('ws-btn-back').onclick = () => {
        if (window.MapApp) window.MapApp.showScreen('scr-map');
      };

      document.getElementById('ws-btn-clear').onclick = () => {
        this.resetCanvasData();
        this.redrawCanvas();
        if (window.MapAudio) window.MapAudio.click();
      };

      document.getElementById('ws-btn-check').onclick = () => {
        this.evaluateMission();
      };

      document.getElementById('ws-speak-btn').onclick = () => {
        if (window.MapAudio) window.MapAudio.speak(mission.desc);
      };

      document.getElementById('ws-char-speak').onclick = () => {
        if (window.MapAudio) window.MapAudio.speak(area.storyIntro);
      };

      this.updateToolInstruction();
      this.initCanvasEvents();
      this.loadAreaSceneDecorations();
      this.redrawCanvas();
    },

    // Load Area-specific background puzzle objects
    loadAreaSceneDecorations() {
      const area = this.currentArea;
      if (area.id === 'point-plaza') {
        // Plaza targets: Harbour, Well, Pavilion target circles
        this.predefinedTargets = [
          { x: 260, y: 220, label: 'ท่าเรือ A', icon: '⛵' },
          { x: 500, y: 380, label: 'บ่อน้ำ B', icon: '⛲' },
          { x: 740, y: 240, label: 'ศาลา C', icon: '🏛️' }
        ];
      } else if (area.id === 'line-forest') {
        // Broken bridge: Left bank point A, Right bank point B, River in middle
        this.predefinedTargets = [
          { x: 340, y: 300, label: 'ฝั่งซ้าย A', icon: '🏕️' },
          { x: 660, y: 300, label: 'ฝั่งขวา B', icon: '🌲' }
        ];
      } else if (area.id === 'ray-lighthouse') {
        // Lighthouse origin, distant boat target
        this.predefinedTargets = [
          { x: 250, y: 320, label: 'โคมไฟประภาคาร O', icon: '🗼' },
          { x: 780, y: 190, label: 'เรือใบกลางหมอก S', icon: '⛵' }
        ];
      } else if (area.id === 'angle-canyon') {
        this.predefinedTargets = [
          { x: 380, y: 360, label: 'จุดยอดทางแยก V', icon: '⛰️' },
          { x: 700, y: 360, label: 'เส้นทางขวา A', icon: '🛤️' },
          { x: 600, y: 160, label: 'เส้นทางผาชัน B', icon: '🧗' }
        ];
      } else if (area.id === 'right-angle-village') {
        this.predefinedTargets = [
          { x: 420, y: 380, label: 'ฐานเสา V', icon: '🪵' },
          { x: 720, y: 380, label: 'แนวพื้นราบ A', icon: '🧱' },
          { x: 420, y: 140, label: 'ยอดเสาตั้งฉาก B', icon: '🏠' }
        ];
      } else if (area.id === 'maporia-city') {
        this.predefinedTargets = [
          { x: 280, y: 180, label: 'มุม 1', icon: '🏛️' },
          { x: 720, y: 180, label: 'มุม 2', icon: '🏛️' },
          { x: 720, y: 440, label: 'มุม 3', icon: '🌳' },
          { x: 280, y: 440, label: 'มุม 4', icon: '🌳' }
        ];
      }
    },

    // Bind Canvas Mouse/Touch Events
    initCanvasEvents() {
      const svg = document.getElementById('geom-canvas-svg');
      if (!svg) return;

      const getCoord = (e) => {
        const rect = svg.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = 1000 / rect.width;
        const scaleY = 600 / rect.height;
        return {
          x: Math.round((clientX - rect.left) * scaleX),
          y: Math.round((clientY - rect.top) * scaleY)
        };
      };

      svg.onpointerdown = (e) => {
        const p = getCoord(e);
        this.isInteracting = true;

        if (this.activeTool === 'point') {
          // Drop Point Pin
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const label = alphabet[this.userPoints.length % alphabet.length];
          this.userPoints.push({ x: p.x, y: p.y, label });
          if (window.MapAudio) window.MapAudio.point();
          this.redrawCanvas();
        } else if (['segment', 'line', 'ray', 'angle', 'right_angle'].includes(this.activeTool)) {
          // Find or create first anchor point
          this.tempDraw = { start: p, current: p };
        } else if (this.activeTool === 'rectangle') {
          // Click 4 points
          if (this.userPoints.length < 4) {
            const label = `P${this.userPoints.length + 1}`;
            this.userPoints.push({ x: p.x, y: p.y, label });
            if (window.MapAudio) window.MapAudio.point();
            if (this.userPoints.length === 4) {
              this.userRectangles.push([...this.userPoints]);
              if (window.MapAudio) window.MapAudio.rectangle();
            }
            this.redrawCanvas();
          }
        }
      };

      svg.onpointermove = (e) => {
        if (!this.isInteracting || !this.tempDraw) return;
        const p = getCoord(e);

        if (this.activeTool === 'right_angle') {
          // Snap helper for right angle
          const snapped = window.MapGeometry.snapToRightAngle(
            this.tempDraw.start,
            { x: this.tempDraw.start.x + 150, y: this.tempDraw.start.y },
            p,
            8
          );
          this.tempDraw.current = snapped;
        } else {
          this.tempDraw.current = p;
        }
        this.redrawCanvas();
      };

      svg.onpointerup = (e) => {
        if (!this.isInteracting) return;
        this.isInteracting = false;

        if (this.tempDraw) {
          const start = this.tempDraw.start;
          const end = this.tempDraw.current;
          const dist = window.MapGeometry.dist(start, end);

          if (dist > 25) {
            if (this.activeTool === 'segment') {
              this.userSegments.push({ p1: start, p2: end });
              if (window.MapAudio) window.MapAudio.segment();
            } else if (this.activeTool === 'line') {
              this.userLines.push({ p1: start, p2: end });
              if (window.MapAudio) window.MapAudio.line();
            } else if (this.activeTool === 'ray') {
              this.userRays.push({ origin: start, dirPoint: end });
              if (window.MapAudio) window.MapAudio.ray();
            } else if (this.activeTool === 'angle' || this.activeTool === 'right_angle') {
              // Create Angle with Vertex at start
              const arm1 = { x: start.x + 160, y: start.y };
              const arm2 = end;
              const isRA = window.MapGeometry.isRightAngle(start, arm1, arm2, 5.5);

              this.userAngles.push({ vertex: start, arm1, arm2, isRightAngle: isRA });
              if (isRA && window.MapAudio) window.MapAudio.rightAngleLock();
              else if (window.MapAudio) window.MapAudio.angle();
            }
          }
          this.tempDraw = null;
          this.redrawCanvas();
        }
      };
    },

    // Redraw all elements on SVG Canvas
    redrawCanvas() {
      const svg = document.getElementById('geom-canvas-svg');
      if (!svg) return;

      const MG = window.MapGeometry;
      let html = '';

      // 1. Background Grid & Coordinates
      html += `
        <defs>
          <pattern id="canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(141, 110, 99, 0.12)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="1000" height="600" fill="#fffdf7"/>
        <rect width="1000" height="600" fill="url(#canvas-grid)"/>
      `;

      // 2. Predefined Area Scene Puzzle Targets
      if (this.predefinedTargets) {
        if (this.currentArea.id === 'line-forest') {
          // River in middle
          html += `<rect x="440" y="0" width="120" height="600" fill="#e0f7fa" opacity="0.8"/>
                   <text x="500" y="50" font-size="14" font-weight="700" fill="#00838f" text-anchor="middle">แม่น้ำป่าลึก</text>`;
        }
        this.predefinedTargets.forEach(tgt => {
          html += `
            <g class="puzzle-target" transform="translate(${tgt.x}, ${tgt.y})">
              <circle cx="0" cy="0" r="28" fill="rgba(255, 224, 130, 0.4)" stroke="#ffa000" stroke-width="2.5" stroke-dasharray="4 3"/>
              <text x="0" y="8" font-size="22" text-anchor="middle">${tgt.icon}</text>
              <text x="0" y="44" font-size="13" font-weight="800" fill="#4e342e" text-anchor="middle">${tgt.label}</text>
            </g>
          `;
        });
      }

      // 3. User Drawn Segments
      this.userSegments.forEach(seg => {
        html += MG.renderSegmentSVG(seg.p1, seg.p2, { color: '#0288d1', width: 6, label: 'ส่วนของเส้นตรง' });
      });

      // 4. User Drawn Lines
      this.userLines.forEach(l => {
        html += MG.renderLineSVG(l.p1, l.p2, { color: '#8e24aa', width: 5 });
      });

      // 5. User Drawn Rays
      this.userRays.forEach(r => {
        html += MG.renderRaySVG(r.origin, r.dirPoint, { color: '#f57c00', width: 6 });
      });

      // 6. User Drawn Angles
      this.userAngles.forEach(ang => {
        const deg = MG.angleBetween(ang.vertex, ang.arm1, ang.arm2);
        const isRA = Math.abs(deg - 90) <= 5.5;

        html += `
          <g class="drawn-angle">
            <!-- Ray 1 -->
            ${MG.renderRaySVG(ang.vertex, ang.arm1, { color: '#7b1fa2', width: 5 })}
            <!-- Ray 2 -->
            ${MG.renderRaySVG(ang.vertex, ang.arm2, { color: '#ab47bc', width: 5 })}
            <!-- Right Angle Square or Arc -->
            ${isRA ? MG.getRightAngleMarkerSVG(ang.vertex, ang.arm1, ang.arm2, 24) : `
              <circle cx="${ang.vertex.x}" cy="${ang.vertex.y}" r="26" fill="rgba(255, 112, 67, 0.2)" stroke="#ff7043" stroke-width="2"/>
              <text x="${ang.vertex.x + 30}" y="${ang.vertex.y - 10}" font-size="12" font-weight="800" fill="#d84315">${Math.round(deg)}°</text>
            `}
            <circle cx="${ang.vertex.x}" cy="${ang.vertex.y}" r="8" fill="#ffd54f" stroke="#ff8f00" stroke-width="3"/>
            <text x="${ang.vertex.x}" y="${ang.vertex.y - 14}" font-size="13" font-weight="900" fill="#3e2723" text-anchor="middle">จุดยอดมุม V</text>
          </g>
        `;
      });

      // 7. User Drawn Rectangles
      this.userRectangles.forEach(pts => {
        const val = MG.validateRectangle(pts);
        const polyPoints = pts.map(p => `${p.x},${p.y}`).join(' ');
        html += `
          <polygon points="${polyPoints}" fill="${val.isValid ? 'rgba(129, 199, 132, 0.35)' : 'rgba(239, 83, 80, 0.2)'}" stroke="${val.isValid ? '#2e7d32' : '#c62828'}" stroke-width="4.5" stroke-linejoin="round"/>
          <!-- 4 Corner Right-Angle Markers if valid -->
          ${val.isValid ? `
            ${MG.getRightAngleMarkerSVG(pts[0], pts[3], pts[1], 18)}
            ${MG.getRightAngleMarkerSVG(pts[1], pts[0], pts[2], 18)}
            ${MG.getRightAngleMarkerSVG(pts[2], pts[1], pts[3], 18)}
            ${MG.getRightAngleMarkerSVG(pts[3], pts[2], pts[0], 18)}
            <text x="${(pts[0].x + pts[2].x)/2}" y="${(pts[0].y + pts[2].y)/2}" font-size="16" font-weight="900" fill="#1b5e20" text-anchor="middle">✨ ${val.type}</text>
          ` : ''}
        `;
      });

      // 8. Individual User Points
      this.userPoints.forEach(p => {
        html += `
          <g class="drawn-point" transform="translate(${p.x}, ${p.y})">
            <circle cx="0" cy="0" r="9" fill="#d32f2f" stroke="#ffffff" stroke-width="3"/>
            <circle cx="0" cy="0" r="16" fill="rgba(211, 47, 47, 0.2)" stroke="#d32f2f" stroke-width="1.5" stroke-dasharray="3 3"/>
            <text x="0" y="-14" font-size="14" font-weight="900" fill="#212121" text-anchor="middle">จุด ${p.label}</text>
          </g>
        `;
      });

      // 9. Real-time In-Progress Drag Preview
      if (this.tempDraw) {
        const s = this.tempDraw.start;
        const c = this.tempDraw.current;
        if (this.activeTool === 'segment') {
          html += MG.renderSegmentSVG(s, c, { color: 'rgba(2, 136, 209, 0.65)', width: 4.5 });
        } else if (this.activeTool === 'line') {
          html += MG.renderLineSVG(s, c, { color: 'rgba(142, 36, 170, 0.65)', width: 4 });
        } else if (this.activeTool === 'ray') {
          html += MG.renderRaySVG(s, c, { color: 'rgba(245, 124, 0, 0.65)', width: 5 });
        } else if (this.activeTool === 'right_angle' || this.activeTool === 'angle') {
          const arm1 = { x: s.x + 160, y: s.y };
          html += MG.renderRaySVG(s, arm1, { color: '#7b1fa2', width: 4 });
          html += MG.renderRaySVG(s, c, { color: '#ab47bc', width: 4 });
          const deg = MG.angleBetween(s, arm1, c);
          if (Math.abs(deg - 90) <= 5.5) {
            html += MG.getRightAngleMarkerSVG(s, arm1, c, 22);
          }
        }
      }

      svg.innerHTML = html;
    },

    // Evaluate if the user completed the area's current challenge
    evaluateMission() {
      const area = this.currentArea;
      let passed = false;
      let praise = '';
      let errorHint = '';

      if (area.id === 'point-plaza') {
        if (this.userPoints.length >= 3) {
          passed = true;
          praise = 'ยอดเยี่ยมมาก! เธอปักจุดครบทั้ง 3 จุดเพื่อระบุตำแหน่งบนระนาบแผนที่อย่างถูกต้อง!';
        } else {
          errorHint = `ต้องการปักจุดอย่างน้อย 3 จุด (ตอนนี้ปักไปแล้ว ${this.userPoints.length} จุด) ลองแตะที่เป้าหมาย A, B, C ดูนะ!`;
        }
      } else if (area.id === 'line-forest') {
        if (this.userSegments.length >= 1) {
          passed = true;
          praise = 'สะพานเชื่อมสำเร็จ! ส่วนของเส้นตรงมีจุดปลาย 2 จุดชัดเจนและวัดความยาวได้ ทำให้ชาวเมืองเดินข้ามแม่น้ำได้แล้ว!';
        } else {
          errorHint = 'ลองใช้เครื่องมือ "ส่วนของเส้นตรง" ลากเชื่อมระหว่างฝั่งซ้าย A ไปยังฝั่งขวา B เพื่อสร้างสะพานดูสิ!';
        }
      } else if (area.id === 'ray-lighthouse') {
        if (this.userRays.length >= 1) {
          passed = true;
          praise = 'ลำแสงรังสีส่องทะลุหมอกแล้ว! รังสีมีจุดเริ่มต้นที่ประภาคาร 1 จุด และพุ่งต่อไปข้างหน้า เรือใบจึงมองเห็นทางเข้าท่า!';
        } else {
          errorHint = 'ลองใช้เครื่องมือ "รังสี" แตะที่โคมไฟประภาคารแล้วลากพุ่งตรงไปยังเรือใบกลางทะเลนะ!';
        }
      } else if (area.id === 'angle-canyon') {
        if (this.userAngles.length >= 1) {
          passed = true;
          praise = 'สร้างมุมสำเร็จ! รังสีสองเส้นที่ออกมาจากจุดยอดมุมเดียวกัน ทำให้เกิดมุมและเปิดทางแยกในหุบผา!';
        } else {
          errorHint = 'ลองใช้เครื่องมือ "มุม" แตะจุดยอดมุม V แล้วลากแขนของมุมออกไปนะ!';
        }
      } else if (area.id === 'right-angle-village') {
        const hasRightAngle = this.userAngles.some(a => a.isRightAngle);
        if (hasRightAngle) {
          passed = true;
          praise = 'มุมฉาก 90 องศาล็อกพอดี! เสาบ้านตั้งตรงมั่นคง สัญลักษณ์สี่เหลี่ยมเล็กๆ □ บ่งบอกว่าเป็นมุมฉาก!';
        } else {
          errorHint = 'ลองปรับแขนของมุมให้ตั้งฉากพอดี 90 องศา สังเกตสัญลักษณ์กล่องสี่เหลี่ยมสีเขียว □ นะ!';
        }
      } else if (area.id === 'maporia-city') {
        const hasRect = this.userRectangles.some(pts => window.MapGeometry.validateRectangle(pts).isValid);
        if (hasRect || this.userPoints.length >= 4) {
          passed = true;
          praise = 'สุดยอดนักทำแผนที่! รูปสี่เหลี่ยมมุมฉากมี 4 ด้าน และทุกมุมเป็นมุมฉาก 90° ผังเมือง Maporia สมบูรณ์แบบแล้ว!';
        } else {
          errorHint = 'ปักจุด 4 จุดเพื่อสร้างรูปสี่เหลี่ยมมุมฉาก หรือลากเส้นต่อเชื่อมให้ครบ 4 มุมฉากนะ!';
        }
      }

      if (passed) {
        if (window.MapAudio) window.MapAudio.cheer();
        this.showSuccessModal(praise);
      } else {
        if (window.MapAudio) window.MapAudio.error();
        this.showEncouragement(errorHint);
      }
    },

    showEncouragement(msg) {
      const speech = document.getElementById('ws-speech-text');
      if (speech) speech.innerHTML = `💡 <b>คำใบ้:</b> ${msg}`;
      if (window.MapAudio) window.MapAudio.speak(msg);
    },

    showSuccessModal(praise) {
      const modal = document.getElementById('reward-modal');
      const text = document.getElementById('reward-text');
      const title = document.getElementById('reward-title');
      if (!modal) return;

      if (title) title.textContent = '🎉 ภารกิจสำเร็จ!';
      if (text) text.innerHTML = praise;
      modal.classList.add('active');
      modal.style.display = 'flex';

      const nextBtn = document.getElementById('reward-next-btn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          modal.style.display = 'none';
          modal.classList.remove('active');
          if (typeof this.onComplete === 'function') {
            this.onComplete(this.currentArea.id);
          }
        };
      }
    }
  };

  window.MapActivities = Activities;
})();
