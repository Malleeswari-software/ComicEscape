/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * UI & HUD Controller: Manages Character Creation, HUD, Comic Journal,
 * 3-Tier Hints, Pause Settings, Mobile Controls, Dramatic Twist Cutscene, and Victory Screens.
 */
import { gameState } from './state.js';
import { sound } from './audio.js';
import { COMIC_DATA } from './comicData.js';

export class UIController {
  constructor(game) {
    this.game = game;
    this.state = gameState;

    this.timerInterval = null;
    this.popTimeout = null;

    this.initElements();
    this.bindEvents();
    this.updateHUDFromState();
  }

  initElements() {
    // Top HUD Elements
    this.hud = document.getElementById('hud');
    this.hudAvatarImg = document.getElementById('hud-avatar-img');
    this.hudPlayerName = document.getElementById('hud-player-name');
    this.hudChamber = document.getElementById('hud-chamber');
    this.hudKeys = document.getElementById('hud-keys');
    this.timerEl = document.getElementById('timer');
    this.batteryFill = document.getElementById('battery-fill');

    // Action buttons
    this.btnAntigrav = document.getElementById('btn-toggle-antigrav');
    this.antigravBtnText = document.getElementById('antigrav-btn-text');
    this.btnHints = document.getElementById('btn-toggle-hints');
    this.btnJournal = document.getElementById('btn-toggle-journal');
    this.btnMusic = document.getElementById('btn-toggle-music');
    this.btnPause = document.getElementById('btn-pause-menu');

    // Reticle & Prompts
    this.promptHint = document.getElementById('prompt-hint');
    this.popupBanner = document.getElementById('comic-popup-banner');
    this.zeroGVignette = document.getElementById('zero-g-vignette');

    // Modals
    this.setupModal = document.getElementById('setup-modal');
    this.comicModal = document.getElementById('comic-modal');
    this.hintModal = document.getElementById('hint-dossier-box');
    this.pauseModal = document.getElementById('pause-modal');
    this.twistModal = document.getElementById('twist-modal');
    this.victoryModal = document.getElementById('victory-modal');
    this.endModal = document.getElementById('end-modal');
  }

  bindEvents() {
    // 1. Character Creation & Game Start
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStartGame());
    }

    // Gender radio change updates avatar preview
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    genderInputs.forEach(input => {
      input.addEventListener('change', e => {
        const val = e.target.value;
        const previewImg = document.getElementById('char-preview-img');
        if (previewImg) {
          previewImg.src = val === 'female' ? 'assets/maya_explorer_trans.png?v=5' : 'assets/leo_explorer_trans.png?v=5';
        }
      });
    });

    // Game Mode Selection Cards
    const modeCards = document.querySelectorAll('.mode-choice-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        if (mode === 'multiplayer') {
          this.showBanner("CO-OP PROTOCOL", "Classified Network Sync: Multiplayer available in future deployment!");
          return;
        }
        modeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    // 2. HUD Buttons
    if (this.btnAntigrav) {
      this.btnAntigrav.addEventListener('click', () => {
        sound.ensureContext();
        this.game.toggleAntigravity();
      });
    }
    if (this.btnHints) this.btnHints.addEventListener('click', () => this.toggleHintModal());
    if (this.btnJournal) this.btnJournal.addEventListener('click', () => this.openJournal());
    if (this.btnMusic) {
      this.btnMusic.addEventListener('click', () => {
        const on = sound.toggleMusic();
        this.btnMusic.innerHTML = on ? '<span>🎵 MUSIC: ON</span>' : '<span>🔇 MUSIC: OFF</span>';
        this.btnMusic.classList.toggle('active', on);
      });
    }
    if (this.btnPause) this.btnPause.addEventListener('click', () => this.togglePauseMenu());

    // Close Hint button
    const closeHintBtn = document.getElementById('btn-close-hint');
    if (closeHintBtn) closeHintBtn.addEventListener('click', () => this.toggleHintModal(false));

    // Next Hint Tier button
    const nextHintBtn = document.getElementById('btn-next-hint-tier');
    if (nextHintBtn) {
      nextHintBtn.addEventListener('click', () => this.unlockNextHintTier());
    }

    // Close Comic Modal button
    const closeComicBtn = document.getElementById('close-comic');
    if (closeComicBtn) {
      closeComicBtn.addEventListener('click', () => this.closeJournal());
    }

    // Journal Tabs
    const journalTabs = document.querySelectorAll('.journal-tab');
    journalTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const comicId = tab.dataset.comic;
        journalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderComicContent(comicId);
      });
    });

    // Dramatic Twist Cutscene Button
    const breachBtn = document.getElementById('btn-breach-twist');
    if (breachBtn) {
      breachBtn.addEventListener('click', () => {
        if (this.twistModal) this.twistModal.style.display = 'none';
        this.game.triggerCinematicVictory();
      });
    }

    // Pause Menu actions
    const resumeBtn = document.getElementById('btn-resume-game');
    if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePauseMenu(false));

    const restartBtn = document.getElementById('btn-restart-game');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (confirm("Restart game from the beginning?")) {
          this.state.reset();
          location.reload();
        }
      });
    }

    const volSlider = document.getElementById('slider-volume');
    if (volSlider) {
      volSlider.addEventListener('input', e => {
        sound.setMasterVolume(parseFloat(e.target.value));
      });
    }

    // Mystic Soundboard Testing Buttons
    const sfxButtons = [
      { id: 'test-sfx-stone', fn: () => sound.playStoneGrinding(2.0, 1.0, 1.0) },
      { id: 'test-sfx-crack', fn: () => sound.playWallCracking() },
      { id: 'test-sfx-brass', fn: () => sound.playKeyPickup('brass') },
      { id: 'test-sfx-silver', fn: () => sound.playKeyPickup('silver') },
      { id: 'test-sfx-obsidian', fn: () => sound.playKeyPickup('obsidian') },
      { id: 'test-sfx-bowl', fn: () => sound.playSingingBowl(528, 4.0) },
      { id: 'test-sfx-whisper', fn: () => sound.playMysticWhisper() },
      { id: 'test-sfx-chime', fn: () => sound.playMysticChime() },
      { id: 'test-sfx-antigrav', fn: () => sound.playAntigravityActivate() },
      { id: 'test-sfx-graviton', fn: () => sound.playGravitonPickup() }
    ];
    sfxButtons.forEach(({ id, fn }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          sound.ensureContext();
          fn();
        });
      }
    });

    // Mobile Virtual Controls
    this.setupMobileControls();
  }

  /* ---------------- CHARACTER CREATION & START ---------------- */
  handleStartGame() {
    const nameInput = document.getElementById('pname');
    const nameError = document.getElementById('name-error');
    const name = nameInput ? nameInput.value.trim() : "";

    if (!name || name.length < 1) {
      if (nameError) {
        nameError.innerText = "Please enter your operative name (1-20 characters).";
        nameError.style.display = 'block';
      }
      return;
    }
    if (nameError) nameError.style.display = 'none';

    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : "female";

    this.state.state.playerName = name;
    this.state.state.playerGender = gender;
    this.state.state.characterAvatar = gender === 'female' ? 'assets/maya_portrait_trans.png?v=5' : 'assets/leo_portrait_trans.png?v=5';
    this.state.state.characterModel = gender;
    this.state.state.gameStarted = true;
    this.state.save();

    // Hide Setup Modal, Show HUD
    if (this.setupModal) this.setupModal.style.display = 'none';
    if (this.hud) this.hud.style.display = 'flex';

    // Start Audio and guarantee background music plays
    sound.init();
    sound.ensureContext();
    sound.startBackgroundMusic();

    // Start Timer
    this.startTimer();

    // Update HUD
    this.updateHUDFromState();
    this.game.updateCharacterGear(gender);
    this.game.active = true;

    this.showBanner("MISSION ENGAGED", `Operative ${name}, uncover the ancient secrets and reach the Master Portal!`);

    // Lock controls
    try {
      this.game.controls.lock();
    } catch (e) {
      const c2p = document.getElementById('click-to-play');
      if (c2p) c2p.style.display = 'flex';
    }
  }

  /* ---------------- TIMER ENGINE ---------------- */
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.game.active || this.state.state.isPaused) return;

      this.state.state.timeRemaining--;
      if (this.state.state.timeRemaining <= 0) {
        this.triggerTimeExpired();
        return;
      }

      this.updateTimerDisplay();

      if (this.state.state.timeRemaining % 15 === 0) {
        this.state.save();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const total = Math.max(0, this.state.state.timeRemaining);
    const m = Math.floor(total / 60);
    const s = total % 60;
    const str = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    if (this.timerEl) {
      this.timerEl.innerHTML = `<span class="icon">⏱️</span><span>TIME: ${str}</span>`;
      if (total < 120) {
        this.timerEl.style.color = '#ef4444';
        this.timerEl.style.borderColor = '#ef4444';
      }
    }
  }

  triggerTimeExpired() {
    clearInterval(this.timerInterval);
    this.game.active = false;
    this.game.controls.unlock();
    sound.stopBackgroundMusic();
    sound.stopAmbience();

    if (this.endModal) {
      document.getElementById('end-title').innerText = "LOCKDOWN PERMANENT";
      document.getElementById('end-title').style.color = "#f43f5e";
      document.getElementById('end-msg').innerText = "The 15-minute countdown expired. The Chambers sealed into oblivion.";
      this.endModal.style.display = 'flex';
    }
  }

  /* ---------------- HUD UPDATES ---------------- */
  updateHUDFromState() {
    const s = this.state.state;
    if (this.hudPlayerName) this.hudPlayerName.innerText = s.playerName;
    if (this.hudAvatarImg) this.hudAvatarImg.src = s.characterAvatar;

    const roomNames = {
      1: "1 / 3: THE FORGOTTEN LIBRARY",
      2: "2 / 3: THE OBSERVATORY OF LOST STARS",
      3: "3 / 3: THE TEMPLE OF LIVING SHADOWS"
    };
    if (this.hudChamber) {
      this.hudChamber.innerHTML = `<span class="icon">🏛️</span><span>${roomNames[s.currentLevel] || "ARCHIVE"}</span>`;
    }

    this.updateKeysHUD();
    this.updateTimerDisplay();
  }

  updateKeysHUD() {
    const k = this.state.state.keys;
    const count = this.state.getKeyCount();
    if (!this.hudKeys) return;

    this.hudKeys.innerHTML = `
      <span class="icon">🔑</span>
      <span>KEYS: ${count} / 3</span>
      <div class="key-badges-row">
        <span class="key-slot ${k.libraryKey ? 'active' : ''}" data-key="brass" title="Key 1: Antique Brass Library Key (Click to inspect)">I</span>
        <span class="key-slot ${k.observatoryKey ? 'active' : ''}" data-key="silver" title="Key 2: Astral Silver Observatory Key (Click to inspect)">II</span>
        <span class="key-slot ${k.templeKey ? 'active' : ''}" data-key="obsidian" title="Key 3: Obsidian Temple Key (Click to inspect)">III</span>
      </div>
    `;

    // Interactive Key Inspection in HUD
    this.hudKeys.querySelectorAll('.key-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        const keyType = slot.dataset.key;
        const keyNames = {
          brass: { name: "Antique Brass Key", desc: "Heavy forged skeleton key. Emits a warm metallic bell chime." },
          silver: { name: "Astral Silver Key", desc: "Etched with celestial constellations. Resonates with singing bowl frequencies." },
          obsidian: { name: "Obsidian Temple Key", desc: "Volcanic glass artifact. Hummed with deep subterranean gong vibration." }
        };
        const info = keyNames[keyType];
        if (slot.classList.contains('active')) {
          sound.playKeyPickup(keyType);
          this.showBanner(info.name, info.desc);
        } else {
          sound.playKeyJingle();
          this.showBanner("UNCLAIMED KEY", `The ${info.name} remains sealed in the chambers.`);
        }
      });
    });
  }

  updateBatteryHUD(percent) {
    if (this.batteryFill) {
      this.batteryFill.style.width = `${percent}%`;
      if (percent < 20) this.batteryFill.style.background = '#ef4444';
      else if (percent < 50) this.batteryFill.style.background = '#facc15';
      else this.batteryFill.style.background = '#38bdf8';
    }
  }

  /* ---------------- BANNER POPUP ---------------- */
  showBanner(title, text) {
    if (!this.popupBanner) return;
    this.popupBanner.innerHTML = `<strong>${title}</strong>: ${text}`;
    this.popupBanner.style.opacity = '1';
    this.popupBanner.style.transform = 'translate(-50%, 0) scale(1.05)';
    clearTimeout(this.popTimeout);
    this.popTimeout = setTimeout(() => {
      this.popupBanner.style.opacity = '0';
      this.popupBanner.style.transform = 'translate(-50%, 20px) scale(0.95)';
    }, 3200);
  }

  /* ---------------- COMIC JOURNAL MODAL ---------------- */
  openJournal(comicId = null) {
    if (!comicId) {
      if (this.state.state.currentLevel === 3) comicId = 'temple';
      else if (this.state.state.currentLevel === 2) comicId = 'observatory';
      else comicId = 'library';
    }

    this.game.controls.unlock();
    sound.playBookInteract();

    const tabs = document.querySelectorAll('.journal-tab');
    tabs.forEach(tab => {
      const id = tab.dataset.comic;
      const discovered = this.state.state.discoveredComics[id];
      tab.style.display = discovered ? 'inline-block' : 'none';
      if (id === comicId) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    this.renderComicContent(comicId);
    if (this.comicModal) this.comicModal.style.display = 'flex';
  }

  closeJournal() {
    if (this.comicModal) this.comicModal.style.display = 'none';
    if (this.game.active && !this.state.state.isPaused) {
      this.game.controls.lock();
    }
  }

  renderComicContent(comicId) {
    const data = COMIC_DATA[comicId];
    if (!data) return;

    const titleEl = document.getElementById('comic-title');
    const container = document.getElementById('comic-strip-container');
    if (titleEl) titleEl.innerText = `${data.title} — ${data.subtitle}`;
    if (!container) return;

    container.innerHTML = `
      <div class="comic-intro-card">
        <p class="comic-lore-text">${data.narrativeIntro}</p>
      </div>
      <div class="comic-page-view">
        <img src="${data.coverImg}" class="comic-full-artwork" alt="${data.title}">
      </div>
      <div class="comic-panels-breakdown">
        ${data.panels.map(p => `
          <div class="comic-panel-modal">
            <div class="panel-speech">"${p.dialogue}"</div>
            <div class="panel-burst" style="color: ${p.soundColor || '#facc15'}">${p.onomatopoeia || 'POW!'}</div>
            <div class="panel-caption">${p.caption} • <em>${p.hintDetail}</em></div>
          </div>
        `).join('')}
      </div>
      <div class="uv-cipher-note">
        🔍 <strong>UV CIPHER INSCRIPTION:</strong> ${data.uvClue.secretText} (${data.uvClue.instruction})
      </div>
    `;
  }

  /* ---------------- 3-TIER HINT SYSTEM ---------------- */
  toggleHintModal(forceState) {
    if (!this.hintModal) return;
    const isVisible = this.hintModal.style.display === 'block';
    const newState = (forceState !== undefined) ? forceState : !isVisible;

    this.hintModal.style.display = newState ? 'block' : 'none';
    if (newState) {
      sound.playBookInteract();
      this.renderCurrentHints();
    }
  }

  renderCurrentHints() {
    const container = document.getElementById('hint-content-text');
    if (!container) return;

    const roomKeys = { 1: 'library', 2: 'observatory', 3: 'temple' };
    const roomKey = roomKeys[this.state.state.currentLevel] || 'library';
    const comic = COMIC_DATA[roomKey];
    if (!comic) return;

    let tier = Math.max(1, this.state.state.currentHintTier);

    container.innerHTML = comic.hints.slice(0, tier).map(h => `
      <div class="hint-step">
        <span class="step-num">${h.tier}</span>
        <strong>${h.title}:</strong> ${h.text}
      </div>
    `).join('');

    const btnNext = document.getElementById('btn-next-hint-tier');
    if (btnNext) {
      if (tier >= 3) {
        btnNext.style.display = 'none';
      } else {
        btnNext.style.display = 'block';
        btnNext.innerText = `REVEAL TIER ${tier + 1} HINT`;
      }
    }
  }

  unlockNextHintTier() {
    let tier = this.state.state.currentHintTier;
    if (tier < 3) {
      this.state.state.currentHintTier = tier + 1;
      this.state.state.hintsUsed++;
      this.state.save();
      sound.playPuzzleSolved();
      this.renderCurrentHints();
    }
  }

  /* ---------------- PAUSE MENU ---------------- */
  togglePauseMenu(forceState) {
    if (!this.pauseModal) return;
    const isVisible = this.pauseModal.style.display === 'flex';
    const newState = (forceState !== undefined) ? forceState : !isVisible;

    this.pauseModal.style.display = newState ? 'flex' : 'none';
    this.state.state.isPaused = newState;

    if (newState) {
      this.game.controls.unlock();
    } else {
      if (this.game.active) {
        this.game.controls.lock();
      }
    }
  }

  /* ---------------- DRAMATIC PLOT TWIST CUTSCENE ---------------- */
  showTwistCutscene() {
    this.game.controls.unlock();
    if (this.twistModal) {
      this.twistModal.style.display = 'flex';
    }
  }

  /* ---------------- MOBILE TOUCH CONTROLS ---------------- */
  setupMobileControls() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileUI = document.getElementById('mobile-controls');
    if (!mobileUI) return;

    if (isTouch) {
      mobileUI.style.display = 'flex';

      const btnUp = document.getElementById('mob-btn-up');
      const btnDown = document.getElementById('mob-btn-down');
      const btnLeft = document.getElementById('mob-btn-left');
      const btnRight = document.getElementById('mob-btn-right');

      const bindTouch = (el, prop) => {
        if (!el) return;
        el.addEventListener('touchstart', e => { e.preventDefault(); this.game.moveState[prop] = true; });
        el.addEventListener('touchend', e => { e.preventDefault(); this.game.moveState[prop] = false; });
      };

      bindTouch(btnUp, 'forward');
      bindTouch(btnDown, 'backward');
      bindTouch(btnLeft, 'left');
      bindTouch(btnRight, 'right');

      const mobAntigrav = document.getElementById('mob-btn-antigrav');
      if (mobAntigrav) {
        mobAntigrav.addEventListener('click', () => this.game.toggleAntigravity());
        mobAntigrav.addEventListener('touchstart', e => {
          e.preventDefault();
          this.game.toggleAntigravity();
        });
      }

      const mobInteract = document.getElementById('mob-btn-interact');
      if (mobInteract) mobInteract.addEventListener('click', () => this.game.handleInteraction());
      const mobFlash = document.getElementById('mob-btn-flash');
      if (mobFlash) mobFlash.addEventListener('click', () => this.game.toggleFlashlight());
      const mobMode = document.getElementById('mob-btn-mode');
      if (mobMode) {
        mobMode.addEventListener('click', () => {
          const modes = ['white', 'uv', 'laser'];
          const next = modes[(modes.indexOf(this.game.lightMode) + 1) % modes.length];
          this.game.setLightMode(next);
        });
      }
    }
  }

  /* ---------------- ANTIGRAVITY HUD UPDATER ---------------- */
  updateAntigravityHUD(active) {
    if (this.btnAntigrav) {
      this.btnAntigrav.classList.toggle('active', active);
    }
    if (this.antigravBtnText) {
      this.antigravBtnText.innerText = active ? "🌌 ANTIGRAVITY: ACTIVE" : "🌌 ANTIGRAVITY [G]: READY";
    }
    if (this.zeroGVignette) {
      this.zeroGVignette.classList.toggle('active', active);
    }
  }

  /* ---------------- VICTORY SCREEN WITH PLOT TWIST ---------------- */
  showVictoryScreen() {
    clearInterval(this.timerInterval);
    this.game.active = false;
    this.game.controls.unlock();
    sound.stopBackgroundMusic();
    sound.playVictory();

    const elapsed = (15 * 60) - this.state.state.timeRemaining;
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    const timeStr = `${m}m ${s < 10 ? '0' : ''}${s}s`;

    if (this.victoryModal) {
      document.getElementById('vic-player-name').innerText = this.state.state.playerName;
      document.getElementById('vic-time-taken').innerText = timeStr;
      document.getElementById('vic-hints-used').innerText = `${this.state.state.hintsUsed} hints used`;

      const keysCollected = this.state.getKeyCount();
      const keysDesc = document.getElementById('vic-keys-recovered');
      if (keysDesc) {
        keysDesc.innerText = `${keysCollected} / 3 (Decoy Keys)`;
      }

      this.victoryModal.style.display = 'flex';
    }
  }
}
