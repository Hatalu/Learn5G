/**
 * Chrono-Express Galaxy: Main Application Controller
 * Handles:
 * - Single-screen experience (no nav tabs)
 * - Left card briefing with Star Map Icon Button
 * - Interactive Pannable Galaxy Star Map Modal (50% transparent background)
 *   * Character avatar situated on current planet
 *   * Inter-planetary distance directly correlated with travel duration
 *   * Flight vector lines and planet selection
 * - Electric Shock & Shake error overlay with 20% blur for 3s
 * - 3, 2, 1 Countdown and high-speed train launch
 */

class ChronoApp {
  constructor() {
    this.currentLevelIndex = 0;
    this.completedLevels = new Set(JSON.parse(localStorage.getItem('chrono_completed') || '[]'));
    this.totalMinutes = 8 * 60; // 08:00
    this.currentHours = 8;
    this.currentMinutes = 0;

    // Clock rotation
    this.isDraggingClock = false;
    this.lastAngle = 0;
    this.minuteAccumulator = 0;

    // Steppers
    this.inputHours = 0;
    this.inputMinutes = 0;

    // Launch & Error states
    this.isLaunching = false;

    // 360° Galaxy Star Map state
    this.selectedMapPlanetId = null;
    this.mapZoom = 0.85;
    this.mapPanX = -500;
    this.mapPanY = -350;
    this.isDraggingMap = false;
    this.mapDragStartX = 0;
    this.mapDragStartY = 0;

    this.initElements();
    this.initClockFace();
    this.initEventListeners();
    this.loadLevel(this.currentLevelIndex);
  }

  initElements() {
    this.skyRenderer = new SkyRenderer('sky-canvas');

    // UI Badges
    this.digitalTimeDisplay = document.getElementById('digital-time-display');
    this.periodPill = document.getElementById('period-pill');
    this.thaiOralDisplay = document.getElementById('thai-oral-display');

    // Clock Elements
    this.hourHand = document.getElementById('hour-hand');
    this.minuteHand = document.getElementById('minute-hand');
    this.clockBezel = document.getElementById('clock-bezel');
    this.timeScrubber = document.getElementById('time-scrubber');

    // Left Card elements
    this.junctionTag = document.getElementById('junction-tag');
    this.missionTitle = document.getElementById('mission-title');
    this.missionStory = document.getElementById('mission-story');
    this.targetTimeVal = document.getElementById('target-time-val');
    this.targetSubDesc = document.getElementById('target-sub-desc');
    this.owlSpeech = document.getElementById('owl-speech');

    // Right Card elements
    this.stationDepartureName = document.getElementById('station-departure-name');
    this.stationDepartureTime = document.getElementById('station-departure-time');
    this.stationArrivalName = document.getElementById('station-arrival-name');
    this.stationArrivalTime = document.getElementById('station-arrival-time');
    this.routeDurationPill = document.getElementById('route-duration-pill');
    this.mathInputArea = document.getElementById('math-input-area');
    this.inputHoursEl = document.getElementById('stepper-hours');
    this.inputMinutesEl = document.getElementById('stepper-minutes');
    this.launchBtn = document.getElementById('launch-btn');

    // Cinematic Overlay
    this.statusOverlay = document.getElementById('status-overlay');
    this.statusTitle = document.getElementById('status-title');
    this.statusSubtitle = document.getElementById('status-subtitle');

    // Galaxy Star Map 360° Modal Elements
    this.galaxyMapModal = document.getElementById('galaxy-map-modal');
    this.galaxyMapViewport = document.getElementById('galaxy-map-viewport');
    this.mapPlane360 = document.getElementById('map-plane-360');
    this.mapPlanetsContainer = document.getElementById('map-planets-container');
    this.mapSvgLines = document.getElementById('map-svg-lines');
    this.mapSelectedCard = document.getElementById('map-selected-card');
    this.mapSelectedName = document.getElementById('map-selected-name');
    this.mapSelectedDuration = document.getElementById('map-selected-duration');
    this.mapPreviewThumb = document.getElementById('map-preview-thumb');
    this.mapSelectedSector = document.getElementById('map-selected-sector');
    this.mapSelectedConcept = document.getElementById('map-selected-concept');
    this.mapConfirmBtn = document.getElementById('map-confirm-btn');

    // Floating Map Controls HUD
    this.mapZoomInBtn = document.getElementById('map-zoom-in-btn');
    this.mapZoomOutBtn = document.getElementById('map-zoom-out-btn');
    this.mapCenterShipBtn = document.getElementById('map-center-ship-btn');
    this.mapResetViewBtn = document.getElementById('map-reset-view-btn');
    this.mapZoomIndicator = document.getElementById('map-zoom-indicator');

    // Celebration Modal
    this.modalBackdrop = document.getElementById('modal-backdrop');
    this.modalBadge = document.getElementById('modal-badge');
    this.modalTitle = document.getElementById('modal-title');
    this.modalDesc = document.getElementById('modal-desc');
    this.modalConcept = document.getElementById('modal-concept');
    this.modalNextBtn = document.getElementById('modal-next-btn');

    // Confetti
    this.confettiCanvas = document.getElementById('confetti-canvas');
    if (this.confettiCanvas) {
      this.confettiCtx = this.confettiCanvas.getContext('2d');
      this.resizeConfetti();
      window.addEventListener('resize', () => this.resizeConfetti());
    }
  }

  initClockFace() {
    const dialFace = document.getElementById('dial-face');
    if (!dialFace) return;
    dialFace.innerHTML = '';

    const tickRadius = 138;
    for (let m = 0; m < 60; m++) {
      const deg = m * 6;
      const rad = (deg * Math.PI) / 180;
      const tx = tickRadius * Math.sin(rad);
      const ty = -tickRadius * Math.cos(rad);

      const tick = document.createElement('div');
      tick.className = (m % 5 === 0) ? 'clock-tick major-tick' : 'clock-tick minor-tick';
      tick.style.left = '50%';
      tick.style.top = '50%';
      tick.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${deg}deg)`;
      dialFace.appendChild(tick);
    }

    const numRadius = 108;
    for (let i = 1; i <= 12; i++) {
      const deg = i * 30;
      const rad = (deg * Math.PI) / 180;
      const nx = numRadius * Math.sin(rad);
      const ny = -numRadius * Math.cos(rad);

      const numEl = document.createElement('div');
      numEl.className = 'dial-num';
      numEl.style.left = '50%';
      numEl.style.top = '50%';
      numEl.style.transform = `translate(-50%, -50%) translate(${nx}px, ${ny}px)`;

      let sub24 = (i === 12) ? '24/0 น.' : `${i + 12} น.`;
      numEl.innerHTML = `
        <span class="num-main">${i}</span>
        <span class="num-24h-sub">${sub24}</span>
      `;
      dialFace.appendChild(numEl);
    }
  }

  initEventListeners() {
    this.initClockContinuousDrag();

    if (this.timeScrubber) {
      this.timeScrubber.addEventListener('input', (e) => {
        const total = parseInt(e.target.value, 10);
        this.setTimeByTotalMinutes(total);
        window.chronoAudio.playClick();
      });
    }

    if (this.launchBtn) {
      this.launchBtn.addEventListener('click', () => this.handleLaunchRun());
    }

    // Left Card Map Button
    document.getElementById('open-galaxy-map-btn')?.addEventListener('click', () => {
      window.chronoAudio.playClick();
      this.openGalaxyMap();
    });

    document.getElementById('close-galaxy-map-btn')?.addEventListener('click', () => {
      window.chronoAudio.playClick();
      this.closeGalaxyMap();
    });

    // Map Select Confirmation Button
    if (this.mapConfirmBtn) {
      this.mapConfirmBtn.addEventListener('click', () => {
        if (this.selectedMapPlanetId !== null) {
          window.chronoAudio.playClick();
          this.loadLevel(this.selectedMapPlanetId - 1);
          this.closeGalaxyMap();
        }
      });
    }

    // 360° Galaxy Map Zoom & Camera HUD Controls
    this.mapZoomInBtn?.addEventListener('click', () => {
      window.chronoAudio.playClick();
      this.zoomMap(1.25);
    });

    this.mapZoomOutBtn?.addEventListener('click', () => {
      window.chronoAudio.playClick();
      this.zoomMap(0.8);
    });

    this.mapCenterShipBtn?.addEventListener('click', () => {
      window.chronoAudio.playClick();
      this.centerOnCurrentShip();
    });

    this.mapResetViewBtn?.addEventListener('click', () => {
      window.chronoAudio.playClick();
      this.resetMapView();
    });

    this.initGalaxyMapPanAndZoom();

    document.getElementById('hint-btn')?.addEventListener('click', () => this.showHint());
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      window.chronoAudio.playClick();
      this.loadLevel(this.currentLevelIndex);
    });

    document.getElementById('sound-toggle')?.addEventListener('click', (e) => {
      const muted = window.chronoAudio.toggleMute();
      e.currentTarget.textContent = muted ? '🔇' : '🔊';
    });

    document.getElementById('bgm-toggle')?.addEventListener('click', (e) => {
      const playing = window.chronoAudio.toggleBgm();
      e.currentTarget.textContent = playing ? '🎵' : '🎶';
    });

    this.initMathSteppers();

    this.modalNextBtn?.addEventListener('click', () => {
      this.closeModal();
      if (this.currentLevelIndex < window.CHRONO_LEVELS.length - 1) {
        this.loadLevel(this.currentLevelIndex + 1);
      }
    });

    this.modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeModal();
    });
  }

  initClockContinuousDrag() {
    if (!this.clockBezel) return;

    const getCenter = () => {
      const rect = this.clockBezel.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    };

    const getAngleFromEvent = (e, center) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - center.x;
      const dy = clientY - center.y;
      return Math.atan2(dy, dx);
    };

    const onPointerDown = (e) => {
      if (this.isLaunching) return;
      this.isDraggingClock = true;
      const center = getCenter();
      this.clockCenter = center;
      this.lastAngle = getAngleFromEvent(e, center);
      this.minuteAccumulator = 0;
      window.chronoAudio.playClick();
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!this.isDraggingClock || this.isLaunching) return;
      const currentAngle = getAngleFromEvent(e, this.clockCenter);

      let dAngle = currentAngle - this.lastAngle;
      while (dAngle > Math.PI) dAngle -= 2 * Math.PI;
      while (dAngle < -Math.PI) dAngle += 2 * Math.PI;

      this.lastAngle = currentAngle;

      const deg = dAngle * (180 / Math.PI);
      const minutesDelta = deg / 6;

      this.minuteAccumulator += minutesDelta;

      if (Math.abs(this.minuteAccumulator) >= 1) {
        const wholeMinutes = Math.trunc(this.minuteAccumulator);
        this.minuteAccumulator -= wholeMinutes;
        this.addMinutes(wholeMinutes);
        window.chronoAudio.playClick();
      }
    };

    const onPointerUp = () => {
      this.isDraggingClock = false;
      this.minuteAccumulator = 0;
    };

    this.clockBezel.addEventListener('mousedown', onPointerDown);
    this.clockBezel.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
  }

  addMinutes(delta) {
    let newTotal = this.totalMinutes + delta;
    newTotal = ((newTotal % 1440) + 1440) % 1440;
    this.setTimeByTotalMinutes(newTotal);
  }

  setTimeByTotalMinutes(totalMin) {
    this.totalMinutes = window.clockEngine.normalizeMinutes(totalMin);
    const timeData = window.clockEngine.minutesToTime(this.totalMinutes);
    this.currentHours = timeData.hours;
    this.currentMinutes = timeData.minutes;
    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    const timeData = window.clockEngine.minutesToTime(this.totalMinutes);

    if (this.digitalTimeDisplay) {
      this.digitalTimeDisplay.textContent = window.clockEngine.format24H(this.currentHours, this.currentMinutes);
    }
    if (this.thaiOralDisplay) {
      this.thaiOralDisplay.textContent = timeData.thaiOralName;
    }
    if (this.periodPill) {
      this.periodPill.className = `period-pill ${timeData.isDay ? 'period-day' : 'period-night'}`;
      this.periodPill.innerHTML = timeData.isDay ? '☀️ กลางวัน (06:00-18:00)' : '🌙 กลางคืน (18:00-06:00)';
    }

    const angles = window.clockEngine.getHandAngles(this.currentHours, this.currentMinutes);
    if (this.hourHand) {
      this.hourHand.style.transform = `rotate(${angles.hourAngle}deg)`;
    }
    if (this.minuteHand) {
      this.minuteHand.style.transform = `rotate(${angles.minuteAngle}deg)`;
    }
    if (this.timeScrubber) {
      this.timeScrubber.value = this.totalMinutes;
    }
    if (this.skyRenderer) {
      this.skyRenderer.setTimeMinutes(this.totalMinutes);
    }
  }

  initMathSteppers() {
    const handleStep = (target, delta, min, max) => {
      window.chronoAudio.playClick();
      if (target === 'h') {
        this.inputHours = Math.max(min, Math.min(max, this.inputHours + delta));
        if (this.inputHoursEl) this.inputHoursEl.textContent = this.inputHours;
      } else {
        this.inputMinutes = Math.max(min, Math.min(max, this.inputMinutes + delta));
        if (this.inputMinutesEl) this.inputMinutesEl.textContent = this.inputMinutes;
      }
    };

    document.getElementById('step-h-plus')?.addEventListener('click', () => handleStep('h', 1, 0, 24));
    document.getElementById('step-h-minus')?.addEventListener('click', () => handleStep('h', -1, 0, 24));
    document.getElementById('step-m-plus')?.addEventListener('click', () => handleStep('m', 5, 0, 59));
    document.getElementById('step-m-minus')?.addEventListener('click', () => handleStep('m', -5, 0, 59));
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    const level = window.CHRONO_LEVELS[index];
    if (!level) return;

    if (this.skyRenderer) {
      this.skyRenderer.resetTrain();
    }

    if (this.junctionTag) this.junctionTag.innerHTML = `🪐 ภารกิจที่ ${level.id}/12 • ${level.junctionName}`;
    if (this.missionTitle) this.missionTitle.textContent = level.title;
    if (this.missionStory) this.missionStory.textContent = level.story;
    if (this.targetTimeVal) this.targetTimeVal.textContent = level.targetDisplay;
    if (this.targetSubDesc) this.targetSubDesc.textContent = level.targetSubText;
    if (this.owlSpeech) this.owlSpeech.textContent = `กัปตัน: ${level.hint}`;

    if (this.stationDepartureName) this.stationDepartureName.textContent = level.departureStation;
    if (this.stationDepartureTime) this.stationDepartureTime.textContent = level.departureTimeText;
    if (this.stationArrivalName) this.stationArrivalName.textContent = level.arrivalStation;
    if (this.stationArrivalTime) this.stationArrivalTime.textContent = level.arrivalTimeText;
    if (this.routeDurationPill) this.routeDurationPill.textContent = `ระยะเวลา: ${level.durationText}`;

    this.inputHours = 0;
    this.inputMinutes = 0;
    if (this.inputHoursEl) this.inputHoursEl.textContent = '0';
    if (this.inputMinutesEl) this.inputMinutesEl.textContent = '0';
    if (this.mathInputArea) {
      this.mathInputArea.style.display = (level.type === 'convert_units' || level.type === 'calculate_duration') ? 'block' : 'none';
    }

    if (level.initialTime) {
      this.setTimeByTotalMinutes(window.clockEngine.timeToMinutes(level.initialTime.hours, level.initialTime.minutes));
    } else if (level.departure) {
      this.setTimeByTotalMinutes(window.clockEngine.timeToMinutes(level.departure.hours, level.departure.minutes));
    } else {
      this.setTimeByTotalMinutes(8 * 60);
    }
  }

  handleLaunchRun() {
    if (this.isLaunching) return;

    const level = window.CHRONO_LEVELS[this.currentLevelIndex];
    let isCorrect = false;

    if (level.type === 'set_time' || level.type === 'calculate_arrival' || level.type === 'calculate_departure') {
      isCorrect = (this.currentHours === level.targetTime.hours && this.currentMinutes === level.targetTime.minutes);
    } else if (level.type === 'convert_units' || level.type === 'calculate_duration') {
      isCorrect = (this.inputHours === level.expectedHours && this.inputMinutes === level.expectedMinutes);
    }

    if (isCorrect) {
      this.triggerSuccessCountdown(level);
    } else {
      this.triggerElectricErrorNotification();
    }
  }

  // Case A: Electric Shock Shake with 20% Blur: Shakes for only the first 0.5s as requested
  triggerElectricErrorNotification() {
    this.isLaunching = true;
    window.chronoAudio.playElectricShock();

    if (this.statusOverlay) {
      this.statusOverlay.className = 'status-overlay active error-mode shaking';
      this.statusTitle.textContent = 'เวลายังตั้งไม่ตรง';
      this.statusSubtitle.textContent = 'รถไฟไม่สามารถเดินทางได้';
    }

    // Shake exclusively for the first 0.5s
    setTimeout(() => {
      if (this.statusOverlay) {
        this.statusOverlay.classList.remove('shaking');
      }
    }, 500);

    // Keep error notification clear and visible for 2.5s total before dismissing
    setTimeout(() => {
      if (this.statusOverlay) {
        this.statusOverlay.classList.remove('active', 'error-mode', 'shaking');
      }
      this.isLaunching = false;
    }, 2500);
  }

  // Case B: Countdown 3, 2, 1 -> Launch Run
  triggerSuccessCountdown(level) {
    this.isLaunching = true;

    if (this.statusOverlay) {
      this.statusOverlay.className = 'status-overlay active countdown-mode';
    }

    let count = 3;
    const stepCountdown = () => {
      if (count > 0) {
        if (this.statusTitle) this.statusTitle.textContent = `ปล่อยตัวในอีก ${count}`;
        if (this.statusSubtitle) this.statusSubtitle.textContent = 'ระบบนำทางกาลเวลาพร้อมเดินทาง...';
        window.chronoAudio.playCountdownBeep(count === 1 ? 587 : 440);
        count--;
        setTimeout(stepCountdown, 1000);
      } else {
        if (this.statusTitle) this.statusTitle.textContent = 'ออกเดินทาง!';
        if (this.statusSubtitle) this.statusSubtitle.textContent = 'ขบวนรถไฟอวกาศกำลังแล่นข้ามมิติ...';
        window.chronoAudio.playTrainWhistle();

        setTimeout(() => {
          if (this.statusOverlay) {
            this.statusOverlay.classList.remove('active');
          }
          this.skyRenderer.startTrainRun(() => {
            this.isLaunching = false;
            window.chronoAudio.playSuccessFanfare();
            this.triggerCelebration(level);
          });
        }, 600);
      }
    };

    stepCountdown();
  }

  showHint() {
    const level = window.CHRONO_LEVELS[this.currentLevelIndex];
    window.chronoAudio.playClick();
    if (this.owlSpeech) {
      this.owlSpeech.innerHTML = `กัปตัน: <strong style="color: #38bdf8;">${level.hint}</strong>`;
    }
  }

  triggerCelebration(level) {
    this.completedLevels.add(level.id);
    localStorage.setItem('chrono_completed', JSON.stringify(Array.from(this.completedLevels)));

    if (this.modalBadge) this.modalBadge.textContent = level.badge.split(' ')[0];
    if (this.modalTitle) this.modalTitle.textContent = `ภารกิจสำเร็จ! ได้รับ ${level.badge}`;
    if (this.modalDesc) this.modalDesc.textContent = `ยอดเยี่ยมมากนายสถานี! รถไฟอวกาศเข้าเทียบท่าตรงเวลาพอดีเป๊ะ`;
    if (this.modalConcept) this.modalConcept.innerHTML = `<strong>สรุปความรู้ สสวท.:</strong><br>${level.concept}`;

    this.openModal();
    this.launchConfetti();
  }

  openModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('active');
  }

  closeModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.remove('active');
    if (this.skyRenderer) {
      this.skyRenderer.resetTrain();
    }
  }

  // =========================================================================
  // GALAXY STAR MAP (360° Deep Space Universe, Infinite Pan/Zoom & 12 Planets)
  // =========================================================================
  openGalaxyMap() {
    if (!this.galaxyMapModal) return;
    this.galaxyMapModal.classList.add('active');
    this.selectedMapPlanetId = this.currentLevelIndex + 1;
    this.renderGalaxyStarMap();
    // Center on current ship smoothly
    setTimeout(() => {
      this.centerOnCurrentShip(true);
    }, 60);
  }

  closeGalaxyMap() {
    if (!this.galaxyMapModal) return;
    this.galaxyMapModal.classList.remove('active');
  }

  initGalaxyMapPanAndZoom() {
    if (!this.galaxyMapViewport || !this.mapPlane360) return;

    // Mouse Drag Pan
    this.galaxyMapViewport.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons or nodes
      if (e.target.closest('.map-planet-node') || e.target.closest('.map-ctrl-btn') || e.target.closest('.map-selected-hud')) return;
      this.isDraggingMap = true;
      this.mapDragStartX = e.clientX - this.mapPanX;
      this.mapDragStartY = e.clientY - this.mapPanY;
      this.galaxyMapViewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDraggingMap) return;
      this.mapPanX = e.clientX - this.mapDragStartX;
      this.mapPanY = e.clientY - this.mapDragStartY;
      this.applyMapTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDraggingMap) {
        this.isDraggingMap = false;
        if (this.galaxyMapViewport) this.galaxyMapViewport.style.cursor = 'grab';
      }
    });

    // Mouse Wheel Zoom centered on cursor
    this.galaxyMapViewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.galaxyMapViewport.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      this.zoomMapAtPoint(factor, cursorX, cursorY);
    }, { passive: false });

    // Touch Support for iPad & Tablets (Single finger pan, dual finger pinch zoom)
    let touchStartDist = 0;
    this.galaxyMapViewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        if (e.target.closest('.map-planet-node') || e.target.closest('.map-ctrl-btn') || e.target.closest('.map-selected-hud')) return;
        this.isDraggingMap = true;
        this.mapDragStartX = e.touches[0].clientX - this.mapPanX;
        this.mapDragStartY = e.touches[0].clientY - this.mapPanY;
      } else if (e.touches.length === 2) {
        this.isDraggingMap = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });

    this.galaxyMapViewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDraggingMap) {
        this.mapPanX = e.touches[0].clientX - this.mapDragStartX;
        this.mapPanY = e.touches[0].clientY - this.mapDragStartY;
        this.applyMapTransform();
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const factor = dist / touchStartDist;
        if (factor > 0.8 && factor < 1.25) {
          const rect = this.galaxyMapViewport.getBoundingClientRect();
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
          this.zoomMapAtPoint(factor, midX, midY);
        }
        touchStartDist = dist;
      }
    }, { passive: true });

    this.galaxyMapViewport.addEventListener('touchend', () => {
      this.isDraggingMap = false;
      touchStartDist = 0;
    });
  }

  applyMapTransform() {
    if (!this.mapPlane360) return;
    this.mapPlane360.style.transform = `translate3d(${this.mapPanX}px, ${this.mapPanY}px, 0) scale(${this.mapZoom})`;
    if (this.mapZoomIndicator) {
      this.mapZoomIndicator.textContent = `${Math.round(this.mapZoom * 100)}%`;
    }
  }

  zoomMap(factor) {
    if (!this.galaxyMapViewport) return;
    const rect = this.galaxyMapViewport.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    this.zoomMapAtPoint(factor, centerX, centerY);
  }

  zoomMapAtPoint(factor, pointX, pointY) {
    const oldZoom = this.mapZoom;
    const newZoom = Math.max(0.42, Math.min(1.85, oldZoom * factor));
    if (Math.abs(newZoom - oldZoom) < 0.005) return;

    // Zoom invariant to cursor / anchor point
    const worldX = (pointX - this.mapPanX) / oldZoom;
    const worldY = (pointY - this.mapPanY) / oldZoom;

    this.mapZoom = newZoom;
    this.mapPanX = pointX - worldX * newZoom;
    this.mapPanY = pointY - worldY * newZoom;

    this.applyMapTransform();
  }

  centerOnCurrentShip(immediate = false) {
    const planets = this.getPlanetCoordinates();
    const currentPlanet = planets[this.currentLevelIndex] || planets[0];
    this.panToWorldPoint(currentPlanet.x, currentPlanet.y, 1.05, immediate);
  }

  resetMapView() {
    // Center at the Galactic Core (1300, 1000) at 0.52x zoom so whole galaxy is visible
    this.panToWorldPoint(1300, 1000, 0.52, false);
  }

  panToWorldPoint(wx, wy, targetZoom = null, immediate = false) {
    if (!this.galaxyMapViewport) return;
    const rect = this.galaxyMapViewport.getBoundingClientRect();
    const z = targetZoom !== null ? targetZoom : this.mapZoom;
    const targetPanX = rect.width / 2 - wx * z;
    const targetPanY = rect.height / 2 - wy * z;

    if (immediate) {
      this.mapZoom = z;
      this.mapPanX = targetPanX;
      this.mapPanY = targetPanY;
      this.applyMapTransform();
    } else {
      // Smooth animated pan
      const startPanX = this.mapPanX;
      const startPanY = this.mapPanY;
      const startZoom = this.mapZoom;
      const startTime = performance.now();
      const duration = 400; // ms

      const stepPan = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = progress * (2 - progress); // easeOut

        this.mapZoom = startZoom + (z - startZoom) * ease;
        this.mapPanX = startPanX + (targetPanX - startPanX) * ease;
        this.mapPanY = startPanY + (targetPanY - startPanY) * ease;
        this.applyMapTransform();

        if (progress < 1) {
          requestAnimationFrame(stepPan);
        }
      };
      requestAnimationFrame(stepPan);
    }
  }

  getPlanetCoordinates() {
    return [
      {
        id: 1, x: 1580, y: 820, size: 58,
        themeClass: 'p-theme-1',
        decorHtml: '',
        previewColor: '#f59e0b',
        sector: 'เนบิวลาแสงแรก (Dawn Nebula)',
        name: 'ท่าอวกาศอรุณรุ่ง',
        worldType: 'ดาวอาทิตย์อัคคี (Solar Flare World)'
      },
      {
        id: 2, x: 1880, y: 560, size: 54,
        themeClass: 'p-theme-2',
        decorHtml: '<div class="planet-mini-moon"></div>',
        previewColor: '#10b981',
        sector: 'เขตมรกตชีวัน (Eden Biosphere)',
        name: 'สถานีสวนสวรรค์',
        worldType: 'ดาวพฤกษามรกต (Verdant Eden)'
      },
      {
        id: 3, x: 1380, y: 380, size: 52,
        themeClass: 'p-theme-3',
        decorHtml: '',
        previewColor: '#cbd5e1',
        sector: 'ทะเลจันทราสีคราม (Lunar Sea)',
        name: 'ท่าอวกาศจันทรา',
        worldType: 'ดวงจันทร์ประกายเงิน (Silver Moon)'
      },
      {
        id: 4, x: 880, y: 460, size: 56,
        themeClass: 'p-theme-4',
        decorHtml: '<div class="planet-gear-ring"></div>',
        previewColor: '#f97316',
        sector: 'หุบเขาฟันเฟืองกาลเวลา (Clockwork Valley)',
        name: 'โรงช่างกลฟันเฟือง',
        worldType: 'ดาวฟันเฟืองทองเหลือง (Chrono-Gears)'
      },
      {
        id: 5, x: 580, y: 760, size: 54,
        themeClass: 'p-theme-5',
        decorHtml: '',
        previewColor: '#c084fc',
        sector: 'เทือกเขาดวงดารดาษ (Amethyst Ridge)',
        name: 'ยอดเขาดวงดาว',
        worldType: 'ดาวผลึกหินผา (Amethyst Peak)'
      },
      {
        id: 6, x: 640, y: 1260, size: 52,
        themeClass: 'p-theme-6',
        decorHtml: '<div class="planet-ice-ring"></div>',
        previewColor: '#38bdf8',
        sector: 'แถบดาวเคราะห์แคระคริสตัล (Diamond Belt)',
        name: 'เหมืองคริสตัล',
        worldType: 'ดาวผลึกเพชรน้ำเงิน (Diamond Ice)'
      },
      {
        id: 7, x: 1020, y: 1540, size: 56,
        themeClass: 'p-theme-7',
        decorHtml: '',
        previewColor: '#ec4899',
        sector: 'วังวนมิติควอนตัม (Quantum Singularity)',
        name: 'ปากอุโมงค์กาลเวลา',
        worldType: 'ดาวเกลียวกาลเวลา (Time Vortex)'
      },
      {
        id: 8, x: 1480, y: 1620, size: 58,
        themeClass: 'p-theme-8',
        decorHtml: '<div class="planet-crown-halo"></div>',
        previewColor: '#facc15',
        sector: 'ราชสำนักดาราจักร (Celestial Sovereign)',
        name: 'พระราชวังดวงดาว',
        worldType: 'ดาวมงกุฎทองคำ (Royal Starlight)'
      },
      {
        id: 9, x: 1880, y: 1380, size: 54,
        themeClass: 'p-theme-9',
        decorHtml: '<div class="planet-dual-rings"></div>',
        previewColor: '#fb923c',
        sector: 'โอเอซิสทรายทอง (Amber Mirage)',
        name: 'โอเอซิสดวงดาว',
        worldType: 'ดาวเนบิวลาทะเลทราย (Amber Mirage)'
      },
      {
        id: 10, x: 2120, y: 940, size: 56,
        themeClass: 'p-theme-10',
        decorHtml: '',
        previewColor: '#0284c7',
        sector: 'กลุ่มดาวเที่ยงคืน (Midnight Star Cluster)',
        name: 'หอคอยราตรี',
        worldType: 'ดาวราตรีออบซิเดียน (Obsidian Constellation)'
      },
      {
        id: 11, x: 1160, y: 1880, size: 54,
        themeClass: 'p-theme-11',
        decorHtml: '<div class="planet-pulsar-jets"></div>',
        previewColor: '#6366f1',
        sector: 'หลุมอวกาศอนันตกาล (Abyssal Rift)',
        name: 'มิติรัตติกาล',
        worldType: 'ดาวพัลซาร์ประภาคาร (Pulsar Beacon)'
      },
      {
        id: 12, x: 2280, y: 1720, size: 68,
        themeClass: 'p-theme-12',
        decorHtml: '<div class="planet-grand-triple-rings"></div>',
        previewColor: '#fde047',
        sector: 'สุดขอบจักรวาล (Infinity Singularity)',
        name: 'สุดขอบกาแล็กซี',
        worldType: 'ดาวมหาจักรพรรดิกาลเวลา (Grand Singularity)'
      }
    ];
  }

  renderGalaxyStarMap() {
    if (!this.mapPlanetsContainer || !this.mapSvgLines) return;
    this.mapPlanetsContainer.innerHTML = '';
    this.mapSvgLines.innerHTML = '';

    const planets = this.getPlanetCoordinates();
    const currentP = planets[this.currentLevelIndex] || planets[0];

    // 1. Draw SVG Connecting Space Lanes
    for (let i = 0; i < planets.length - 1; i++) {
      const p1 = planets[i];
      const p2 = planets[i + 1];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('class', 'space-lane-line');
      this.mapSvgLines.appendChild(line);
    }

    // 2. Render 12 Unique Planet Nodes
    planets.forEach((pos, idx) => {
      const lvl = window.CHRONO_LEVELS[idx];
      const isCurrent = (idx === this.currentLevelIndex);
      const isSelected = (pos.id === this.selectedMapPlanetId);
      const isCompleted = this.completedLevels.has(pos.id);

      const node = document.createElement('div');
      node.className = `map-planet-node ${isCurrent ? 'current-planet' : ''} ${isSelected ? 'selected-planet' : ''}`;
      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;

      // Character Marker on Current Planet
      let characterTag = '';
      if (isCurrent) {
        characterTag = `
          <div class="character-marker">
            <span class="char-owl-avatar">🦉</span>
            <span class="char-badge">ยานของเราอยู่ที่นี่</span>
            <div class="radar-ping-ring"></div>
          </div>
        `;
      }

      node.innerHTML = `
        ${characterTag}
        <div class="planet-sphere ${pos.themeClass}" style="width: ${pos.size}px; height: ${pos.size}px;">
          ${pos.decorHtml}
          ${isCompleted ? '<span class="done-check">✓</span>' : ''}
        </div>
        <div class="planet-label">
          <div class="p-num">ดาวที่ ${pos.id} • ${pos.worldType.split(' ')[0]}</div>
          <div class="p-title">${lvl.arrivalStation}</div>
        </div>
      `;

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        window.chronoAudio.playClick();
        this.selectedMapPlanetId = pos.id;
        this.renderGalaxyStarMap();
        this.updateMapSelectedDetails(pos, currentP, lvl);
      });

      // Double-click to fly directly to this planet
      node.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        window.chronoAudio.playClick();
        this.panToWorldPoint(pos.x, pos.y, 1.2, false);
      });

      this.mapPlanetsContainer.appendChild(node);
    });

    // 3. Draw active vector to selected planet
    if (this.selectedMapPlanetId) {
      const targetPos = planets[this.selectedMapPlanetId - 1];
      if (targetPos && targetPos.id !== currentP.id) {
        const activeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        activeLine.setAttribute('x1', currentP.x);
        activeLine.setAttribute('y1', currentP.y);
        activeLine.setAttribute('x2', targetPos.x);
        activeLine.setAttribute('y2', targetPos.y);
        activeLine.setAttribute('class', 'space-lane-active');
        this.mapSvgLines.appendChild(activeLine);
      }

      const selectedLvl = window.CHRONO_LEVELS[this.selectedMapPlanetId - 1];
      this.updateMapSelectedDetails(targetPos, currentP, selectedLvl);
    }

    this.applyMapTransform();
  }

  updateMapSelectedDetails(targetPos, currentP, lvl) {
    if (!this.mapSelectedCard) return;
    this.mapSelectedCard.style.display = 'flex';

    if (this.mapSelectedName) {
      this.mapSelectedName.textContent = `ดาวที่ ${lvl.id}: ${lvl.arrivalStation}`;
    }

    if (this.mapPreviewThumb) {
      this.mapPreviewThumb.className = `hud-planet-preview ${targetPos.themeClass}`;
    }

    if (this.mapSelectedSector) {
      this.mapSelectedSector.textContent = `🪐 ${targetPos.sector}`;
    }

    if (this.mapSelectedConcept) {
      this.mapSelectedConcept.textContent = `ภารกิจ: ${lvl.title}`;
    }

    // Distance calculation correlating to travel time
    const dx = targetPos.x - currentP.x;
    const dy = targetPos.y - currentP.y;
    const distPx = Math.round(Math.sqrt(dx * dx + dy * dy));

    if (this.mapSelectedDuration) {
      this.mapSelectedDuration.innerHTML = `
        <strong>ระยะห่าง:</strong> ${distPx} ปีแสง &nbsp;|&nbsp; 
        <strong>เวลาเดินทาง:</strong> ${lvl.durationText} &nbsp;|&nbsp; 
        <strong>ถึงสถานี:</strong> ${lvl.arrivalTimeText}
      `;
    }
  }

  resizeConfetti() {
    if (!this.confettiCanvas) return;
    this.confettiCanvas.width = window.innerWidth;
    this.confettiCanvas.height = window.innerHeight;
  }

  launchConfetti() {
    if (!this.confettiCanvas || !this.confettiCtx) return;
    const pieces = [];
    const colors = ['#f472b6', '#38bdf8', '#fde047', '#34d399', '#a78bfa', '#f43f5e'];

    for (let i = 0; i < 110; i++) {
      pieces.push({
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    const animateConfetti = () => {
      this.confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.spin;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          this.confettiCtx.save();
          this.confettiCtx.translate(p.x, p.y);
          this.confettiCtx.rotate((p.rotation * Math.PI) / 180);
          this.confettiCtx.fillStyle = p.color;
          this.confettiCtx.globalAlpha = p.alpha;
          this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          this.confettiCtx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(animateConfetti);
      } else {
        this.confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    requestAnimationFrame(animateConfetti);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.chronoApp = new ChronoApp();
});
