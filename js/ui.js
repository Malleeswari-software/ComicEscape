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

    // Character Selection Cards click handler
    const charCards = document.querySelectorAll('.char-choice-card');
    charCards.forEach(card => {
      card.addEventListener('click', () => {
        charCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          const val = radio.value;
          const nameInput = document.getElementById('pname');
          if (nameInput) {
            if (val === 'female') nameInput.value = 'Maya';
            else if (val === 'male') nameInput.value = 'Leo';
            else nameInput.value = 'Expedition Duo';
          }
          const previewImg = document.getElementById('char-preview-img');
          if (previewImg) {
            previewImg.src = val === 'female' ? 'assets/maya_explorer_trans.png?v=5' : (val === 'male' ? 'assets/leo_explorer_trans.png?v=5' : 'assets/characters.png?v=5');
          }
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
        this.clearCutsceneTimeouts();
        if (this.twistModal) this.twistModal.style.display = 'none';
        this.game.triggerCinematicVictory();
      });
    }

    this.initCutscene();

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
    const chosenName = name || (gender === 'female' ? 'Maya' : (gender === 'male' ? 'Leo' : 'Duo'));

    // Start fresh game session: reset all keys, all puzzles, lock all doors shut!
    this.state.state.keys = { libraryKey: false, observatoryKey: false, templeKey: false };
    this.state.state.puzzles = {
      libraryBooks: [null, null, null],
      libraryCabinetUnlocked: false,
      libraryKeyCollected: false,
      telescopeAngle: 0,
      mirrorAlphaAngle: 0,
      mirrorBetaAngle: 45,
      observatoryAligned: false,
      observatoryKeyCollected: false,
      brazierSol: 20,
      brazierLuna: 80,
      templeBalanced: false,
      templeKeyCollected: false,
      exitPortalUnlocked: false
    };
    this.state.state.timeRemaining = 15 * 60;
    this.state.state.hintsUsed = 0;
    this.state.state.currentLevel = 1;
    this.state.state.playerName = chosenName;
    this.state.state.playerGender = gender;
    this.state.state.characterAvatar = gender === 'female'
      ? 'assets/maya_portrait_trans.png?v=5'
      : (gender === 'male' ? 'assets/leo_portrait_trans.png?v=5' : 'assets/girl_portrait_trans.png?v=5');
    this.state.state.characterModel = gender;
    this.state.state.gameStarted = true;
    this.state.save();

    // Lock and reset every vault door firmly shut
    if (this.game.doors) {
      Object.values(this.game.doors).forEach(d => {
        d.isOpen = false;
        d.locked = true;
        d.targetOffset = 0;
        d.currentOffset = 0;
        d.leftPanel.position.x = -d.width / 4;
        d.rightPanel.position.x = d.width / 4;
        if (d.statusLight && d.statusLight.material) {
          d.statusLight.material.color.setHex(0xef4444);
          d.statusLight.material.emissive.setHex(0xef4444);
        }
      });
    }

    // Close and lock all 3 key containers & hide key meshes
    if (this.game.architect) {
      if (this.game.architect.libraryCabinet) {
        this.game.architect.libraryCabinet.isOpen = false;
        this.game.architect.libraryCabinet.leftDoor.rotation.y = 0;
        this.game.architect.libraryCabinet.rightDoor.rotation.y = 0;
      }
      if (this.game.architect.armillaryVault) {
        this.game.architect.armillaryVault.isOpen = false;
      }
      if (this.game.architect.templeAltar) {
        this.game.architect.templeAltar.isOpen = false;
        this.game.architect.templeAltar.lid.position.z = 0;
        if (this.game.architect.templeAltar.glyphMat) {
          this.game.architect.templeAltar.glyphMat.emissiveIntensity = 0;
        }
      }
      if (this.game.architect.exitPortal) {
        this.game.architect.exitPortal.isOpen = false;
        this.game.architect.exitPortal.targetOffset = 0;
        this.game.architect.exitPortal.currentOffset = 0;
      }
      if (this.game.architect.libraryKeyGroup) this.game.architect.libraryKeyGroup.visible = false;
      if (this.game.architect.observatoryKeyGroup) this.game.architect.observatoryKeyGroup.visible = false;
      if (this.game.architect.templeKeyGroup) this.game.architect.templeKeyGroup.visible = false;
    }

    // Hide Setup Modal, Show HUD
    if (this.setupModal) this.setupModal.style.display = 'none';
    if (this.hud) this.hud.style.display = 'flex';

    // Start Audio and guarantee background music plays
    sound.init();
    sound.ensureContext();
    sound.startBackgroundMusic();

    // Start Timer
    this.startTimer();

    // Update HUD and Gear
    this.updateHUDFromState();
    this.game.updateCharacterGear(gender);
    this.game.active = true;

    this.showBanner("MISSION ENGAGED", `Operative ${chosenName}, all chamber vault doors are sealed! Decode the clues to proceed.`);

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

  /* ---------------- DRAMATIC PLOT TWIST CUTSCENE CONTROLLER ---------------- */
  initCutscene() {
    this.cutsceneBgImg = document.getElementById('cutscene-bg-img');
    this.cutsceneCharFigure = document.getElementById('cutscene-char-figure');
    this.cutsceneTimerDisplay = document.getElementById('cutscene-timer-display');
    this.cutsceneKeysLayer = document.getElementById('cutscene-keys-layer');
    this.cutsceneKey1 = document.getElementById('cutscene-key-1');
    this.cutsceneKey2 = document.getElementById('cutscene-key-2');
    this.cutsceneKey3 = document.getElementById('cutscene-key-3');
    this.cutsceneSfxBurst = document.getElementById('cutscene-sfx-burst');
    this.cutsceneEdictBanner = document.getElementById('cutscene-edict-banner');
    this.cutsceneAvatarImg = document.getElementById('cutscene-avatar-img');
    this.cutsceneSpeakerName = document.getElementById('cutscene-speaker-name');
    this.cutscenePhaseBadge = document.getElementById('cutscene-phase-badge');
    this.cutsceneSpeechText = document.getElementById('cutscene-speech-text');
    this.cutsceneProgressFill = document.getElementById('cutscene-progress-fill');
    this.cutsceneTimeouts = [];

    const skipBtn = document.getElementById('btn-skip-twist');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.clearCutsceneTimeouts();
        if (this.twistModal) this.twistModal.style.display = 'none';
        this.game.triggerCinematicVictory();
      });
    }

    const replayBtn = document.getElementById('btn-replay-cutscene');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.playCutscenePhase(1);
      });
    }

    const chapBtns = document.querySelectorAll('.cutscene-chap-btn');
    chapBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const ph = parseInt(btn.dataset.phase, 10);
        this.playCutscenePhase(ph);
      });
    });
  }

  clearCutsceneTimeouts() {
    if (this.cutsceneTimeouts) {
      this.cutsceneTimeouts.forEach(t => clearTimeout(t));
      this.cutsceneTimeouts = [];
    }
  }

  showTwistCutscene() {
    this.game.controls.unlock();
    if (!this.cutsceneBgImg) {
      this.initCutscene();
    }
    this.clearCutsceneTimeouts();

    // Set protagonist profile and exact chosen character figure
    const gender = this.state.state.playerGender || 'female';
    const isGirl = gender === 'female' || gender === 'girl';
    const isGuy = gender === 'male' || gender === 'boy';

    if (this.cutsceneCharFigure) {
      if (isGirl) this.cutsceneCharFigure.src = 'assets/maya_explorer_trans.png?v=5';
      else if (isGuy) this.cutsceneCharFigure.src = 'assets/leo_explorer_trans.png?v=5';
      else this.cutsceneCharFigure.src = 'assets/characters.png?v=5';
      this.cutsceneCharFigure.className = 'cutscene-char-figure reach';
      this.cutsceneCharFigure.style.display = 'block';
    }

    if (this.cutsceneAvatarImg) {
      if (isGirl) this.cutsceneAvatarImg.src = 'assets/maya_portrait_trans.png?v=5';
      else if (isGuy) this.cutsceneAvatarImg.src = 'assets/leo_portrait_trans.png?v=5';
      else this.cutsceneAvatarImg.src = 'assets/characters_jungle.jpg?v=5';
    }

    if (this.cutsceneSpeakerName) {
      if (isGirl) this.cutsceneSpeakerName.innerText = 'MAYA [JUNGLE EXPLORER]';
      else if (isGuy) this.cutsceneSpeakerName.innerText = 'LEO [EXPEDITION SCHOLAR]';
      else this.cutsceneSpeakerName.innerText = 'EXPEDITION DUO [MAYA & LEO]';
    }

    if (this.twistModal) {
      this.twistModal.style.display = 'flex';
    }

    this.playCutscenePhase(1);
  }

  playCutscenePhase(phase) {
    this.clearCutsceneTimeouts();

    const gender = this.state.state.playerGender || 'female';
    const isGuy = gender === 'male' || gender === 'boy';

    // Update active chapter tab button
    const chapBtns = document.querySelectorAll('.cutscene-chap-btn');
    chapBtns.forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.phase, 10) === phase);
    });

    const triggerSfx = (text, shake = false, duration = 1200) => {
      if (!this.cutsceneSfxBurst) return;
      this.cutsceneSfxBurst.innerText = text;
      this.cutsceneSfxBurst.className = `cutscene-sfx-burst ${shake ? 'shake' : ''}`;
      this.cutsceneSfxBurst.style.display = 'block';
      this.cutsceneTimeouts.push(setTimeout(() => {
        if (this.cutsceneSfxBurst) this.cutsceneSfxBurst.style.display = 'none';
      }, duration));
    };

    if (phase === 1) {
      // Phase 1: Key Placement into Sockets
      if (this.cutsceneBgImg) this.cutsceneBgImg.src = 'assets/cutscene_key_insert.jpg';
      if (this.cutsceneKeysLayer) this.cutsceneKeysLayer.style.display = 'flex';
      if (this.cutsceneEdictBanner) this.cutsceneEdictBanner.style.display = 'none';
      if (this.cutsceneCharFigure) this.cutsceneCharFigure.className = 'cutscene-char-figure reach';
      if (this.cutscenePhaseBadge) this.cutscenePhaseBadge.innerText = 'PHASE 1: KEY PLACEMENT';
      if (this.cutsceneSpeechText) {
        this.cutsceneSpeechText.innerText = isGuy
          ? '“All three keys are placed in alignment: Brass, Silver, and Obsidian... Engaging the locks now!”'
          : '“I have all three keys: Brass for the Mind, Silver for the Stars, Obsidian for the Shadow... Slotting them into the triumvirate locks now!”';
      }
      if (this.cutsceneProgressFill) this.cutsceneProgressFill.style.width = '25%';
      if (this.cutsceneTimerDisplay) this.cutsceneTimerDisplay.innerText = '00:02 / 00:16';

      // Reset and animate keys sliding in sequentially
      [this.cutsceneKey1, this.cutsceneKey2, this.cutsceneKey3].forEach(k => {
        if (k) k.className = 'cutscene-key-img';
      });

      this.cutsceneTimeouts.push(setTimeout(() => {
        if (this.cutsceneKey1) this.cutsceneKey1.classList.add('inserted');
        sound.playKeyPickup('brass');
        triggerSfx('CLINK!', false, 900);
      }, 400));

      this.cutsceneTimeouts.push(setTimeout(() => {
        if (this.cutsceneKey2) this.cutsceneKey2.classList.add('inserted');
        sound.playKeyPickup('silver');
        triggerSfx('CLANG!', false, 900);
      }, 1400));

      this.cutsceneTimeouts.push(setTimeout(() => {
        if (this.cutsceneKey3) this.cutsceneKey3.classList.add('inserted');
        sound.playKeyPickup('obsidian');
        triggerSfx('ENGAGED!', false, 1100);
      }, 2400));

      // Advance to Phase 2 automatically after 4.2s
      this.cutsceneTimeouts.push(setTimeout(() => {
        this.playCutscenePhase(2);
      }, 4200));

    } else if (phase === 2) {
      // Phase 2: Hollow Ratchet - The Decoy Twist!
      if (this.cutsceneBgImg) this.cutsceneBgImg.src = 'assets/cutscene_key_insert.jpg';
      if (this.cutsceneKeysLayer) this.cutsceneKeysLayer.style.display = 'flex';
      if (this.cutsceneEdictBanner) this.cutsceneEdictBanner.style.display = 'none';
      if (this.cutsceneCharFigure) this.cutsceneCharFigure.className = 'cutscene-char-figure shock';
      if (this.cutscenePhaseBadge) this.cutscenePhaseBadge.innerText = 'PHASE 2: THE HOLLOW DECOY (THE TWIST)';
      if (this.cutsceneSpeechText) {
        this.cutsceneSpeechText.innerText = isGuy
          ? '“Wait... this does not make sense! The locks are just turning freely without catching! Look inside the cylinder... there are NO TUMBLERS! The mechanism is an empty decoy!”'
          : '“WAIT... WHAT?! The keys are just spinning freely in circles! Look into the keyholes... there are NO LOCK BOLTS! There are NO TUMBLERS! The locks are completely hollow inside!”';
      }
      if (this.cutsceneProgressFill) this.cutsceneProgressFill.style.width = '50%';
      if (this.cutsceneTimerDisplay) this.cutsceneTimerDisplay.innerText = '00:06 / 00:16';

      // Start keys spinning hollowly
      [this.cutsceneKey1, this.cutsceneKey2, this.cutsceneKey3].forEach(k => {
        if (k) k.className = 'cutscene-key-img spinning';
      });

      sound.playKeyTurnDecoy();
      triggerSfx('RATCHET... WHIRRR?!', true, 3000);

      // Advance to Phase 3 automatically after 4.8s
      this.cutsceneTimeouts.push(setTimeout(() => {
        this.playCutscenePhase(3);
      }, 4800));

    } else if (phase === 3) {
      // Phase 3: The Ancient Rune Inscription
      if (this.cutsceneBgImg) this.cutsceneBgImg.src = 'assets/cutscene_key_insert.jpg';
      if (this.cutsceneKeysLayer) this.cutsceneKeysLayer.style.display = 'flex';
      if (this.cutsceneEdictBanner) this.cutsceneEdictBanner.style.display = 'flex';
      if (this.cutsceneCharFigure) this.cutsceneCharFigure.className = 'cutscene-char-figure reach';
      if (this.cutscenePhaseBadge) this.cutscenePhaseBadge.innerText = 'PHASE 3: THE ANCIENT REVELATION';
      if (this.cutsceneSpeechText) {
        this.cutsceneSpeechText.innerText = '“Look at the arch! Ancient runes are blazing across the rock: ‘THE KEYS WERE DECOYS. THIS DOOR WAS NEVER LOCKED!’ All this time... we were searching in the dark, when the door was waiting to be opened!”';
      }
      if (this.cutsceneProgressFill) this.cutsceneProgressFill.style.width = '75%';
      if (this.cutsceneTimerDisplay) this.cutsceneTimerDisplay.innerText = '00:11 / 00:16';

      sound.playTwistReveal();
      triggerSfx('RUNES AWAKEN!', false, 2500);

      // Advance to Phase 4 automatically after 5.0s
      this.cutsceneTimeouts.push(setTimeout(() => {
        this.playCutscenePhase(4);
      }, 5000));

    } else if (phase === 4) {
      // Phase 4: Push Into Sunlight & Freedom
      if (this.cutsceneBgImg) this.cutsceneBgImg.src = 'assets/victory_sunrise.jpg';
      if (this.cutsceneKeysLayer) this.cutsceneKeysLayer.style.display = 'none';
      if (this.cutsceneEdictBanner) this.cutsceneEdictBanner.style.display = 'none';
      if (this.cutsceneCharFigure) this.cutsceneCharFigure.className = 'cutscene-char-figure push';
      if (this.cutscenePhaseBadge) this.cutscenePhaseBadge.innerText = 'PHASE 4: FREEDOM DAWN';
      if (this.cutsceneSpeechText) {
        this.cutsceneSpeechText.innerText = isGuy
          ? '“The door opens on its own! The morning dawn is breaking over the mountains... We made it out!”'
          : '“It yields to a simple push! The heavy granite slides apart effortlessly... The morning sunlight! WE ARE FREE!”';
      }
      if (this.cutsceneProgressFill) this.cutsceneProgressFill.style.width = '100%';
      if (this.cutsceneTimerDisplay) this.cutsceneTimerDisplay.innerText = '00:16 / 00:16';

      sound.playStoneGrinding(3.6, 0.7, 1.25);
      sound.playWallCracking();
      triggerSfx('CREEEAAAK!!', true, 3000);
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
