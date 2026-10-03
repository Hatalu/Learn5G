/**
 * Chrono-Beast Game Application Controller
 * Version 4.0: Pet-Aligned Quests & Dynamic Scene Edition
 * 
 * Features:
 * 1. Single-screen 100vh fit (no vertical scrolling)
 * 2. 10 Cool Pet Companions (All Unlocked with Generated Art)
 * 3. Quests aligned directly with currently selected pet (Default: Dragon)
 * 4. Random quests for the active pet covering 4 Tenses (Past, Present Simple, Continuous, Future)
 * 5. Dynamic Field Scenes & Pet Actions per quest (e.g. dragon attacking castle, breathing fire, tiger roaring)
 * 6. Flying Word Animation into Sentence Blank on Correct Answer
 * 7. Responsive Correct / Wrong Feedback Overlays & Sound
 */

(function () {
  'use strict';

  // 10 Pet Companions Definitions (using cool generated artwork: assets/pets/pet_1.jpg to pet_10.jpg)
  const PET_LIST = [
    { id: 1, nameEn: 'Ignis Drake', nameTh: 'มังกรเพลิงกาลเวลา', element: 'Fire', isUnlocked: true },
    { id: 2, nameEn: 'Frostfang Tiger', nameTh: 'เสือเขี้ยวดาบน้ำแข็ง', element: 'Ice', isUnlocked: true },
    { id: 3, nameEn: 'Storm Gryphon', nameTh: 'กริฟฟอนวายุอัสนี', element: 'Lightning', isUnlocked: true },
    { id: 4, nameEn: 'Solar Phoenix', nameTh: 'นกฟีนิกซ์สุริยะ', element: 'Sun', isUnlocked: true },
    { id: 5, nameEn: 'Shadow Wolf', nameTh: 'หมาป่าเงาทมิฬ', element: 'Shadow', isUnlocked: true },
    { id: 6, nameEn: 'Gaia Earth Bear', nameTh: 'หมีพสุธาโบราณ', element: 'Earth', isUnlocked: true },
    { id: 7, nameEn: 'Mystic Star Fox', nameTh: 'จิ้งจอกดาราเวท', element: 'Astral', isUnlocked: true },
    { id: 8, nameEn: 'Golden Sun Lion', nameTh: 'สิงโตสุริยันสีทอง', element: 'Light', isUnlocked: true },
    { id: 9, nameEn: 'Emerald Forest Stag', nameTh: 'กวางมรกตไพรสณฑ์', element: 'Nature', isUnlocked: true },
    { id: 10, nameEn: 'Celestial Moon Unicorn', nameTh: 'ยูนิคอร์นจันทราสวรรค์', element: 'Cosmos', isUnlocked: true }
  ];

  class ChronoBeastGameApp {
    constructor() {
      this.pixelField = null;
      this.currentPetId = 1; // ค่าเริ่มต้น: มังกร (Ignis Drake)
      this.currentQuest = null;
      this.lastQuestId = null;
      this.score = 0;
      this.streak = 0;
      this.isProcessing = false;

      this.questsByPet = window.CHRONO_QUESTS_BY_PET || {};
    }

    init() {
      // 1. Initialize 2D Pixel Art Canvas Meadow & Dynamic Scene Engine
      try {
        if (typeof PixelFieldRenderer === 'function') {
          this.pixelField = new PixelFieldRenderer('pixel-field-canvas');
          this.pixelField.setPet(this.currentPetId);
        }
      } catch (err) {
        console.error('Error initializing PixelFieldRenderer:', err);
      }

      // 2. Setup DOM Event Listeners
      this.bindEvents();

      // 3. Render 10 Pets in Pets Modal (All Unlocked)
      this.renderPetsModal();

      // 4. Load Random Quest aligned with current pet (Default: Dragon)
      this.loadRandomQuestForCurrentPet();

      // 5. Update UI Stats
      this.updateStatsUI();

      console.log('🐾 Chrono-Beast Pet-Aligned Dynamic Edition Ready!');
    }

    bindEvents() {
      // Pets Modal Open & Close
      const openPetsBtn = document.getElementById('open-pets-btn');
      const closePetsBtn = document.getElementById('close-pets-btn');
      const petsModal = document.getElementById('pets-modal');

      if (openPetsBtn && petsModal) {
        openPetsBtn.addEventListener('click', () => {
          this.renderPetsModal();
          petsModal.style.display = 'flex';
          if (window.soundFX) window.soundFX.playClick();
        });
      }

      if (closePetsBtn && petsModal) {
        closePetsBtn.addEventListener('click', () => {
          petsModal.style.display = 'none';
          if (window.soundFX) window.soundFX.playClick();
        });
      }

      if (petsModal) {
        petsModal.addEventListener('click', (e) => {
          if (e.target === petsModal) {
            petsModal.style.display = 'none';
          }
        });
      }

      // Audio Toggle
      const soundBtn = document.getElementById('sound-toggle');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          if (window.soundFX) {
            const isMuted = window.soundFX.toggleMute();
            soundBtn.textContent = isMuted ? '🔇' : '🔊';
          }
        });
      }

      // Speak Sentence Button
      const speakBtn = document.getElementById('speak-sentence-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => {
          if (this.currentQuest) {
            const quest = this.currentQuest;
            const sentenceToSpeak = `${quest.sentenceParts[0]} ${quest.correctAnswer} ${quest.sentenceParts[2]}`;
            if (window.soundFX) {
              window.soundFX.speakEnglish(sentenceToSpeak);
            }
          }
        });
      }
    }

    /* ========================================================================
       Render Pets Modal (10 Pets, 5 per row, Generated Art, All Unlocked)
       ======================================================================== */
    renderPetsModal() {
      const grid = document.getElementById('pets-grid');
      if (!grid) return;

      grid.innerHTML = '';

      PET_LIST.forEach((pet) => {
        const card = document.createElement('div');
        const isCurrent = (pet.id === this.currentPetId);
        card.className = `pet-card unlocked ${isCurrent ? 'active-equipped' : ''}`;

        // Generated high-quality artwork image path
        const imgPath = `assets/pets/pet_${pet.id}.jpg`;

        card.innerHTML = `
          <div class="pet-img-wrap">
            <img src="${imgPath}" alt="${pet.nameEn}" class="pet-card-img" width="300" height="300" loading="lazy" />
          </div>
          <div class="pet-meta">
            <div class="pet-name-en">${pet.nameEn}</div>
            <div class="pet-name-th">${pet.nameTh}</div>
            ${isCurrent ? `
              <div class="pet-status-pill status-equipped">✓ กำลังใช้งาน</div>
            ` : `
              <div class="pet-status-pill status-unlocked">แตะเพื่อเลือก</div>
            `}
          </div>
        `;

        // Click handler: Equips pet immediately and switches quests to this pet!
        card.addEventListener('click', () => {
          if (this.currentPetId !== pet.id) {
            this.currentPetId = pet.id;
            this.lastQuestId = null;

            // Change pet in 2D pixel field engine
            if (this.pixelField) {
              this.pixelField.setPet(pet.id);
            }

            // Immediately switch questions to match this selected pet!
            this.loadRandomQuestForCurrentPet();

            if (window.soundFX) window.soundFX.playClick();
            this.renderPetsModal(); // Re-render to update equipped badge
            
            // Auto close modal after brief selection feedback
            const petsModal = document.getElementById('pets-modal');
            if (petsModal) {
              setTimeout(() => {
                petsModal.style.display = 'none';
              }, 250);
            }
          }
        });

        grid.appendChild(card);
      });
    }

    /* ========================================================================
       Random Quest aligned with Currently Selected Pet
       ======================================================================== */
    loadRandomQuestForCurrentPet() {
      const petQuests = this.questsByPet[this.currentPetId] || this.questsByPet[1] || [];
      if (petQuests.length === 0) return;

      // Filter to avoid repeating the immediately previous question
      let candidates = petQuests;
      if (petQuests.length > 1 && this.lastQuestId) {
        candidates = petQuests.filter(q => q.id !== this.lastQuestId);
      }

      const randomIdx = Math.floor(Math.random() * candidates.length);
      const quest = candidates[randomIdx];

      this.currentQuest = quest;
      this.lastQuestId = quest.id;
      this.isProcessing = false;

      // 1. Time Clue Pill
      const timeClueText = document.getElementById('time-clue-text');
      if (timeClueText) {
        timeClueText.textContent = `"${quest.timeClue}" (${quest.timeClueTh})`;
      }

      // 2. Top Center Tense Banner on Open Field (e.g. Tense: Past (อดีต))
      this.updateFieldTenseBanner(quest.tense);

      // 3. Dynamic Scene & Pet Action on Field (e.g., dragon attacking castle, breathing fire, tiger roaring)
      if (this.pixelField) {
        this.pixelField.setSceneAndAction(quest.scene || 'meadow', quest.petAction || 'walk');
      }

      // 4. Sentence Hero Box Elements
      const beforeSpan = document.getElementById('sentence-part-before');
      const blankSpan = document.getElementById('sentence-blank');
      const afterSpan = document.getElementById('sentence-part-after');
      const meaningEl = document.getElementById('sentence-meaning');
      const heroBox = document.getElementById('sentence-hero-box');

      if (beforeSpan) beforeSpan.textContent = quest.sentenceParts[0];
      if (afterSpan) afterSpan.textContent = quest.sentenceParts[2];
      if (meaningEl) meaningEl.textContent = `🇹🇭 "${quest.meaningTh}"`;

      if (blankSpan) {
        blankSpan.textContent = '[ _______ ]';
        blankSpan.className = 'sentence-blank';
      }

      if (heroBox) {
        heroBox.classList.remove('correct-aura', 'wrong-aura');
      }

      // 5. Render 4 Big Choices (shuffled)
      this.renderChoices(quest);
    }

    /* ========================================================================
       Top Center Tense Banner Formatter
       Displays prominently e.g. "Tense: Past (อดีต)"
       ======================================================================== */
    updateFieldTenseBanner(tense) {
      const bannerText = document.getElementById('field-tense-text');
      if (!bannerText) return;

      if (tense === 'past_simple') {
        bannerText.textContent = 'Tense: Past (อดีต)';
      } else if (tense === 'present_simple') {
        bannerText.textContent = 'Tense: Present (ปัจจุบัน/กิจวัตร)';
      } else if (tense === 'present_continuous') {
        bannerText.textContent = 'Tense: Present Continuous (กำลังทำอยู่)';
      } else if (tense === 'future_simple') {
        bannerText.textContent = 'Tense: Future (อนาคต)';
      } else {
        bannerText.textContent = 'Tense: English Grade 5';
      }
    }

    /* ========================================================================
       Render 4 Big Prominent Choice Buttons
       ======================================================================== */
    renderChoices(quest) {
      const choicesGrid = document.getElementById('choices-grid');
      if (!choicesGrid) return;

      choicesGrid.innerHTML = '';

      // Shuffle choices so correct answer position varies randomly
      const shuffledCards = [...quest.cards].sort(() => Math.random() - 0.5);

      shuffledCards.forEach((card, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.setAttribute('data-index', idx);

        btn.innerHTML = `
          <span class="choice-text">${card.text}</span>
          <span class="choice-label-th">${card.labelTh}</span>
        `;

        btn.addEventListener('click', () => {
          this.handleChoiceClick(btn, card, quest);
        });

        choicesGrid.appendChild(btn);
      });
    }

    /* ========================================================================
       Handle Choice Answer Selection
       ======================================================================== */
    handleChoiceClick(btn, card, quest) {
      if (this.isProcessing) return;

      const isCorrect = (card.isCorrect === true || card.text === quest.correctAnswer);

      if (isCorrect) {
        this.handleCorrectAnswer(btn, card, quest);
      } else {
        this.handleWrongAnswer(btn, card);
      }
    }

    /* ========================================================================
       CORRECT ANSWER FLOW:
       - Flying Word Animation into Sentence Blank
       - Prominent Correct Title Overlay
       - Speech Synthesis speaks completed sentence
       - Pet Celebratory Cheer Jump
       - Score & Streak Boost
       - Advance to next random quest for this pet
       ======================================================================== */
    handleCorrectAnswer(btn, card, quest) {
      this.isProcessing = true;

      // 1. Audio chime
      if (window.soundFX) window.soundFX.playEvolution();

      // 2. Score & Streak
      this.score += 100;
      this.streak += 1;
      this.updateStatsUI();

      // 3. Mark choice button
      btn.classList.add('correct-choice');

      const heroBox = document.getElementById('sentence-hero-box');
      if (heroBox) heroBox.classList.add('correct-aura');

      // 4. Flying Word Animation into the blank slot
      this.triggerFlyingWordAnimation(btn, card.text, () => {
        // Callback after word lands in blank slot
        const blankSpan = document.getElementById('sentence-blank');
        if (blankSpan) {
          blankSpan.innerHTML = `<strong>${card.text}</strong>`;
          blankSpan.classList.add('filled');
        }

        // 5. Pixel Pet Cheer Jump
        if (this.pixelField) {
          this.pixelField.triggerCheer();
        }

        // 6. Speak full completed sentence in native English
        const fullSentence = `${quest.sentenceParts[0]} ${card.text} ${quest.sentenceParts[2]}`;
        if (window.soundFX) {
          window.soundFX.speakEnglish(fullSentence);
        }
      });

      // 7. Show Prominent Correct Title Overlay
      this.showTitleFeedback(
        true,
        '✨ ถูกต้องยอดเยี่ยม! ✨',
        `ยอดเยี่ยมมาก! เติมคำว่า "${card.text}" ได้ถูกต้องตาม Tense`
      );

      // 8. Progress to next random quest for this pet after 2.3s
      setTimeout(() => {
        this.hideTitleFeedback();
        this.loadRandomQuestForCurrentPet();
      }, 2300);
    }

    /* ========================================================================
       WRONG ANSWER FLOW:
       - Button shakes & flashes red
       - Prominent Wrong Title Overlay
       - Pet shows sweatdrop (💧)
       - Error sound
       - Quick reset for immediate retry
       ======================================================================== */
    handleWrongAnswer(btn, card) {
      if (window.soundFX) window.soundFX.playError();

      this.streak = 0;
      this.updateStatsUI();

      btn.classList.add('wrong-choice');

      const heroBox = document.getElementById('sentence-hero-box');
      if (heroBox) heroBox.classList.add('wrong-aura');

      // Pet shows sweatdrop
      if (this.pixelField) {
        this.pixelField.triggerWrongReaction();
      }

      // Show Wrong Title Overlay
      this.showTitleFeedback(
        false,
        '❌ ยังไม่ถูกต้องนะ!',
        'ลองสังเกตคำบอกเวลาสีทอง แล้วเลือกคำตอบใหม่อีกครั้งนะ'
      );

      // Reset wrong state after 1.1s so kid can try again
      setTimeout(() => {
        btn.classList.remove('wrong-choice');
        if (heroBox) heroBox.classList.remove('wrong-aura');
        this.hideTitleFeedback();
      }, 1100);
    }

    /* ========================================================================
       Flying Word Animation:
       Clones word from choice button and flies it smoothly into blank slot
       ======================================================================== */
    triggerFlyingWordAnimation(sourceBtn, wordText, onComplete) {
      const container = document.getElementById('flying-word-container');
      const blankSpan = document.getElementById('sentence-blank');
      if (!container || !blankSpan) {
        if (onComplete) onComplete();
        return;
      }

      const btnRect = sourceBtn.getBoundingClientRect();
      const blankRect = blankSpan.getBoundingClientRect();

      const flyingEl = document.createElement('div');
      flyingEl.className = 'flying-word-clone';
      flyingEl.textContent = wordText;

      // Initial position (over the clicked button)
      flyingEl.style.left = `${btnRect.left + btnRect.width / 2 - 35}px`;
      flyingEl.style.top = `${btnRect.top + 4}px`;
      flyingEl.style.transform = 'scale(0.85)';
      flyingEl.style.opacity = '0';

      container.appendChild(flyingEl);

      // Animate flight
      requestAnimationFrame(() => {
        flyingEl.style.opacity = '1';
        flyingEl.style.transform = 'scale(1.1)';

        setTimeout(() => {
          flyingEl.style.left = `${blankRect.left + 8}px`;
          flyingEl.style.top = `${blankRect.top - 2}px`;
          flyingEl.style.transform = 'scale(1)';

          setTimeout(() => {
            flyingEl.remove();
            if (onComplete) onComplete();
          }, 500);
        }, 40);
      });
    }

    /* ========================================================================
       Title Overlay Feedback (Correct / Wrong)
       ======================================================================== */
    showTitleFeedback(isCorrect, heading, subtitle) {
      const overlay = document.getElementById('result-title-overlay');
      const card = document.getElementById('result-title-card');
      const icon = document.getElementById('result-title-icon');
      const headingEl = document.getElementById('result-title-heading');
      const subEl = document.getElementById('result-title-sub');

      if (!overlay || !card) return;

      card.className = `result-title-card ${isCorrect ? 'state-correct' : 'state-wrong'}`;
      if (icon) icon.textContent = isCorrect ? '✨' : '❌';
      if (headingEl) headingEl.textContent = heading;
      if (subEl) subEl.textContent = subtitle;

      overlay.style.display = 'block';
    }

    hideTitleFeedback() {
      const overlay = document.getElementById('result-title-overlay');
      if (overlay) overlay.style.display = 'none';
    }

    /* ========================================================================
       Stats UI
       ======================================================================== */
    updateStatsUI() {
      const scoreVal = document.getElementById('score-val');
      const streakVal = document.getElementById('streak-val');
      if (scoreVal) scoreVal.textContent = this.score;
      if (streakVal) streakVal.textContent = this.streak;
    }
  }

  // Auto initialize on DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    window.chronoBeastApp = new ChronoBeastGameApp();
    window.chronoBeastApp.init();
  });

})();
