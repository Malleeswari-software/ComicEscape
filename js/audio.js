/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * Advanced Procedural Web Audio Engine
 * Features:
 * - Realistic Granular Stone Grinding & Heavy Slab Sliding
 * - Violent Structural Wall Cracking & Crumbling Masonry
 * - Authentic Metallic Modal Key Resonance (Brass, Astral Silver, Obsidian)
 * - Mystical Tibetan Singing Bowl & Solfeggio Harmonics
 * - Ethereal Spectral Wind & Arcane Whispers
 * - Adaptive Dark Mystery Soundtrack with Lush Pads
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicMuted = false;
    this.masterVolume = 1.0;
    this.musicVolume = 0.82;
    this.sfxVolume = 0.95;
    this.ambienceVolume = 0.68;

    this.masterNode = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambienceGain = null;

    this.initialized = false;
    this.musicRunning = false;
    this.musicTimer = null;
    this.currentStep = 0;
    this.tempo = 86; // Slower, deeper, more mysterious and cinematic

    this.currentRoom = 1;
    this.ambienceNodes = [];
    this.padOscs = [];
    this.padGain = null;
    this.noiseBuffer = null;
    this.antigravityHumNode = null;

    this.attachAutoUnlock();
  }

  attachAutoUnlock() {
    const unlock = () => {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'running' && !this.musicRunning && !this.musicMuted) {
        this.startBackgroundMusic();
      }
    };
    ['click', 'pointerdown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlock, { passive: true });
    });
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Output
      this.masterNode = this.ctx.createGain();
      this.masterNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterNode.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterNode);

      // Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterNode);

      // Ambience Bus
      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(this.ambienceVolume, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterNode);

      this.initialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.startAmbience(this.currentRoom);
      this.startMysticPadDrone();
    } catch (e) {
      console.warn("Web Audio context initialization error:", e);
    }
  }

  ensureContext() {
    if (!this.initialized || !this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getNoiseBuffer() {
    if (this.noiseBuffer) return this.noiseBuffer;
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brownian integration for authentic gravel/stone texture
      data[i] = (lastOut + (0.025 * white)) / 1.025;
      lastOut = data[i];
      data[i] *= 3.8;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterNode && this.ctx) {
      this.masterNode.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterNode && this.ctx) {
      this.masterNode.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.muted;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
    if (!this.musicMuted) {
      this.ensureContext();
      if (!this.musicRunning) this.startBackgroundMusic();
      this.playMysticChime();
    }
    return !this.musicMuted;
  }

  /* ---------------- MYSTIC PAD DRONE & SINGING BOWL HARMONICS ---------------- */
  startMysticPadDrone() {
    if (!this.ctx || this.padGain) return;
    try {
      const t = this.ctx.currentTime;
      this.padGain = this.ctx.createGain();
      this.padGain.gain.setValueAtTime(0.55, t);
      this.padGain.connect(this.ambienceGain);

      // Deep Egyptian / Phrygian mystery harmony (D2, A2, D3, F3, A3, D4)
      const freqs = [73.42, 110.0, 146.83, 174.61, 220.0, 293.66, 349.23];
      this.padOscs = freqs.map((f, idx) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        // Alternating triangle and detuned sawtooth for rich ancient warmth
        osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(f + (Math.random() - 0.5) * 1.8, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, t);
        filter.Q.setValueAtTime(1.5, t);

        g.gain.setValueAtTime(0.28 / (1 + idx * 0.25), t);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.padGain);

        osc.start(t);
        return osc;
      });
    } catch (e) {
      console.warn("Mystic pad drone error:", e);
    }
  }

  /* ---------------- ENVIRONMENTAL AMBIENCE ---------------- */
  startAmbience(roomNumber = 1) {
    this.ensureContext();
    if (!this.ctx) return;

    this.stopAmbience();
    this.currentRoom = roomNumber;

    try {
      const t = this.ctx.currentTime;
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      if (roomNumber === 1) {
        // Library: warm dusty drone + ancient whispering resonance
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.setValueAtTime(110, t); // A2 audible fundamental
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480, t);
        filter.Q.setValueAtTime(2.0, t);
      } else if (roomNumber === 2) {
        // Observatory: celestial glassy oscillating drone with mystical 432Hz tuning
        droneOsc.type = 'sine';
        droneOsc.frequency.setValueAtTime(216, t); // Harmonic octave of 432Hz
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(432, t);
        filter.Q.setValueAtTime(4.2, t);
      } else {
        // Temple: subterranean mystery chant + ancient basalt resonance
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.setValueAtTime(82.4, t); // E2
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, t);
        filter.Q.setValueAtTime(2.5, t);
      }

      droneGain.gain.setValueAtTime(0.01, t);
      droneGain.gain.linearRampToValueAtTime(0.42, t + 1.2);

      droneOsc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.ambienceGain);

      droneOsc.start();
      this.ambienceNodes.push(droneOsc, droneGain);
    } catch (e) {
      console.warn("Ambience startup error:", e);
    }
  }

  stopAmbience() {
    for (const node of this.ambienceNodes) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    }
    this.ambienceNodes = [];
  }

  /* ---------------- CONTINUOUS MYSTICAL SOUNDTRACK ---------------- */
  startBackgroundMusic() {
    this.ensureContext();
    if (!this.ctx) return;
    if (this.musicRunning) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this.startBackgroundMusic());
      return;
    }

    this.musicRunning = true;
    this.currentStep = 0;

    // Haunting ancient Egyptian / Phrygian Mystery progression
    // Chord 1: Dm9 (Deep ancient archive)
    // Chord 2: Bbmaj7#11 (Cosmic starlight / floating nebula)
    // Chord 3: Gm9 (Subterranean shadow sanctuary)
    // Chord 4: A7(b9,b13) (Mystic Phrygian dark resolution)
    const chordProgressions = [
      { bass: 73.42,  harmonics: 146.83, chords: [220.0, 261.63, 329.63, 392.00, 528.00, 587.33] }, // Dm9
      { bass: 58.27,  harmonics: 116.54, chords: [233.08, 293.66, 349.23, 440.00, 493.88, 587.33] }, // Bbmaj7#11
      { bass: 98.00,  harmonics: 196.00, chords: [196.0, 233.08, 293.66, 349.23, 440.00, 528.00] }, // Gm9
      { bass: 110.00, harmonics: 220.00, chords: [220.0, 277.18, 329.63, 392.00, 466.16, 554.37] }  // A7b9
    ];

    const stepDuration = (60 / this.tempo) / 2; // ~0.348s per step

    const scheduleStep = () => {
      if (!this.musicRunning || !this.ctx) return;

      const t = this.ctx.currentTime;
      const bar = Math.floor((this.currentStep % 32) / 8);
      const stepInBar = this.currentStep % 8;
      const harmony = chordProgressions[bar];

      // Audible deep resonant bass with harmonic growl on beats 0 and 4
      if (stepInBar === 0 || stepInBar === 4) {
        this.playBassNote(harmony.bass, harmony.harmonics, t, stepDuration * 3.6);
      }

      // Mysterious celestial glass chime / Solfeggio arpeggiator
      const notePattern = [0, 2, 4, 1, 5, 3, 4, 2];
      const noteIdx = notePattern[stepInBar];
      const freq = harmony.chords[noteIdx];
      this.playArpNote(freq, t, stepDuration * 2.4);

      // Subtle mysterious sub-pulse on odd beats
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6) {
        this.playSubPulse(t);
      }

      this.currentStep++;
      const nextTime = Math.max(0.04, (t + stepDuration) - this.ctx.currentTime);
      this.musicTimer = setTimeout(scheduleStep, nextTime * 1000);
    };

    scheduleStep();
  }

  stopBackgroundMusic() {
    this.musicRunning = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playBassNote(fundamental, harmonic, time, duration) {
    if (!this.ctx || this.musicMuted) return;
    try {
      // 1. Fundamental warm bass
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(fundamental, time);

      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(320, time);
      filter1.frequency.exponentialRampToValueAtTime(110, time + duration);
      filter1.Q.setValueAtTime(2.5, time);

      gain1.gain.setValueAtTime(0.65, time);
      gain1.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.musicGain);

      osc1.start(time);
      osc1.stop(time + duration);

      // 2. Audible harmonic octave for crystal-clear fidelity on laptop speakers
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(harmonic, time);

      gain2.gain.setValueAtTime(0.38, time);
      gain2.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.7);

      osc2.connect(gain2);
      gain2.connect(this.musicGain);

      osc2.start(time);
      osc2.stop(time + duration * 0.7);
    } catch (e) {}
  }

  playArpNote(freq, time, duration) {
    if (!this.ctx || this.musicMuted) return;
    try {
      // Shimmering celestial singing chime (sine + faint triangle harmonic)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, time);
      filter.Q.setValueAtTime(3.0, time);

      gain.gain.setValueAtTime(0.48, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);

      // Subtle harmonic overtone shimmer
      const overtone = this.ctx.createOscillator();
      const oGain = this.ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.0, time);

      oGain.gain.setValueAtTime(0.18, time);
      oGain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.6);

      overtone.connect(oGain);
      oGain.connect(this.musicGain);

      overtone.start(time);
      overtone.stop(time + duration * 0.6);
    } catch (e) {}
  }

  playSubPulse(time) {
    if (!this.ctx || this.musicMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(96, time);
      osc.frequency.exponentialRampToValueAtTime(48, time + 0.38);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, time);

      gain.gain.setValueAtTime(0.42, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.38);
    } catch (e) {}
  }

  /* ---------------- ANTIGRAVITY AUDIO SUITE ---------------- */
  playAntigravityActivate() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Exhilarating Ascending Quantum Pitch Warp (120Hz -> 880Hz)
      const warpOsc = this.ctx.createOscillator();
      const warpGain = this.ctx.createGain();
      const warpFilter = this.ctx.createBiquadFilter();

      warpOsc.type = 'sawtooth';
      warpOsc.frequency.setValueAtTime(120, t);
      warpOsc.frequency.exponentialRampToValueAtTime(880, t + 0.9);

      warpFilter.type = 'bandpass';
      warpFilter.frequency.setValueAtTime(240, t);
      warpFilter.frequency.exponentialRampToValueAtTime(1400, t + 0.9);
      warpFilter.Q.setValueAtTime(4.5, t);

      warpGain.gain.setValueAtTime(0.01, t);
      warpGain.gain.linearRampToValueAtTime(0.75, t + 0.15);
      warpGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      warpOsc.connect(warpFilter);
      warpFilter.connect(warpGain);
      warpGain.connect(this.sfxGain);

      warpOsc.start(t);
      warpOsc.stop(t + 1.2);

      // 2. Cosmic Crystalline Chime Burst (Zero-G shimmer)
      [528, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(f, t + 0.08 * idx);

        chimeGain.gain.setValueAtTime(0.35, t + 0.08 * idx);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08 * idx + 1.4);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.sfxGain);

        chimeOsc.start(t + 0.08 * idx);
        chimeOsc.stop(t + 0.08 * idx + 1.4);
      });

      // 3. Sub-Bass Levitation Pulse
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(65, t);
      sub.frequency.linearRampToValueAtTime(130, t + 0.6);
      subG.gain.setValueAtTime(0.70, t);
      subG.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      sub.connect(subG);
      subG.connect(this.sfxGain);
      sub.start(t);
      sub.stop(t + 0.9);

      // Start continuous zero-g hum
      this.startAntigravityHum();
    } catch (e) {
      console.warn("Antigravity activate sound error:", e);
    }
  }

  playAntigravityDeactivate() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.stopAntigravityHum();

      // Downward descending gravity lock (660Hz -> 90Hz)
      const descOsc = this.ctx.createOscillator();
      const descGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      descOsc.type = 'sawtooth';
      descOsc.frequency.setValueAtTime(660, t);
      descOsc.frequency.exponentialRampToValueAtTime(90, t + 0.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.linearRampToValueAtTime(200, t + 0.6);

      descGain.gain.setValueAtTime(0.65, t);
      descGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      descOsc.connect(filter);
      filter.connect(descGain);
      descGain.connect(this.sfxGain);

      descOsc.start(t);
      descOsc.stop(t + 0.65);

      // Soft solid landing thud
      const thud = this.ctx.createOscillator();
      const thudG = this.ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(110, t + 0.4);
      thud.frequency.exponentialRampToValueAtTime(32, t + 0.7);
      thudG.gain.setValueAtTime(0.55, t + 0.4);
      thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      thud.connect(thudG);
      thudG.connect(this.sfxGain);
      thud.start(t + 0.4);
      thud.stop(t + 0.7);
    } catch (e) {}
  }

  startAntigravityHum() {
    if (this.antigravityHumNode || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(196, t); // G3 musical tone

      // LFO modulation for ethereal breathing float
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(1.8, t); // 1.8 Hz floating wave
      lfoGain.gain.setValueAtTime(12, t);
      lfo.connect(osc.frequency);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      lfo.start(t);

      this.antigravityHumNode = { osc, lfo, gain };
    } catch (e) {}
  }

  stopAntigravityHum() {
    if (!this.antigravityHumNode) return;
    try {
      const t = this.ctx ? this.ctx.currentTime : 0;
      if (this.antigravityHumNode.gain && this.ctx) {
        this.antigravityHumNode.gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      }
      setTimeout(() => {
        try {
          if (this.antigravityHumNode.osc) this.antigravityHumNode.osc.stop();
          if (this.antigravityHumNode.lfo) this.antigravityHumNode.lfo.stop();
        } catch (err) {}
        this.antigravityHumNode = null;
      }, 350);
    } catch (e) {
      this.antigravityHumNode = null;
    }
  }

  playGravitonPickup() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Sacred Solfeggio triad (528Hz, 639Hz, 852Hz, 963Hz)
      const freqs = [528, 639, 852, 963];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.05);

        gain.gain.setValueAtTime(0.42, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 1.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 1.6);
      });
    } catch (e) {}
  }

  /* ---------------- REALISTIC STONE MOVING & GRINDING ---------------- */
  playStoneGrinding(duration = 2.0, pitchScale = 1.0, volumeScale = 1.0) {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const noiseBuf = this.getNoiseBuffer();

      // 1. Dual Swept-Bandpass Granular Granite Scraping (Captures both low friction & high grit)
      if (noiseBuf) {
        // Lower granite body friction (220Hz - 440Hz)
        const lowSrc = this.ctx.createBufferSource();
        lowSrc.buffer = noiseBuf;
        lowSrc.loop = true;

        const lowFilter = this.ctx.createBiquadFilter();
        lowFilter.type = 'bandpass';
        lowFilter.frequency.setValueAtTime(240 * pitchScale, t);
        lowFilter.frequency.linearRampToValueAtTime(460 * pitchScale, t + duration * 0.45);
        lowFilter.frequency.linearRampToValueAtTime(200 * pitchScale, t + duration);
        lowFilter.Q.setValueAtTime(3.8, t);

        const lowGain = this.ctx.createGain();
        lowGain.gain.setValueAtTime(0.01, t);
        lowGain.gain.linearRampToValueAtTime(0.55 * volumeScale, t + 0.12);
        lowGain.gain.setValueAtTime(0.50 * volumeScale, t + duration - 0.25);
        lowGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        lowSrc.connect(lowFilter);
        lowFilter.connect(lowGain);
        lowGain.connect(this.sfxGain);

        lowSrc.start(t);
        lowSrc.stop(t + duration);

        // High sharp mineral grit scraping (650Hz - 1100Hz)
        const highSrc = this.ctx.createBufferSource();
        highSrc.buffer = noiseBuf;
        highSrc.loop = true;

        const highFilter = this.ctx.createBiquadFilter();
        highFilter.type = 'bandpass';
        highFilter.frequency.setValueAtTime(700 * pitchScale, t);
        highFilter.frequency.linearRampToValueAtTime(1100 * pitchScale, t + duration * 0.6);
        highFilter.frequency.linearRampToValueAtTime(550 * pitchScale, t + duration);
        highFilter.Q.setValueAtTime(5.2, t);

        const highGain = this.ctx.createGain();
        highGain.gain.setValueAtTime(0.01, t);
        highGain.gain.linearRampToValueAtTime(0.38 * volumeScale, t + 0.18);
        highGain.gain.setValueAtTime(0.32 * volumeScale, t + duration - 0.2);
        highGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        highSrc.connect(highFilter);
        highFilter.connect(highGain);
        highGain.connect(this.sfxGain);

        highSrc.start(t);
        highSrc.stop(t + duration);

        // 2. Randomized Granite Micro-Clicks (Pebble grit shearing under weight)
        const clickCount = Math.floor(duration * 6);
        for (let i = 0; i < clickCount; i++) {
          const clickTime = t + 0.08 + Math.random() * (duration - 0.2);
          const cSrc = this.ctx.createBufferSource();
          cSrc.buffer = noiseBuf;

          const cFilter = this.ctx.createBiquadFilter();
          cFilter.type = 'bandpass';
          cFilter.frequency.setValueAtTime((800 + Math.random() * 1200) * pitchScale, clickTime);
          cFilter.Q.setValueAtTime(7.0, clickTime);

          const cGain = this.ctx.createGain();
          cGain.gain.setValueAtTime(0.30 * volumeScale, clickTime);
          cGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

          cSrc.connect(cFilter);
          cFilter.connect(cGain);
          cGain.connect(this.sfxGain);

          cSrc.start(clickTime);
          cSrc.stop(clickTime + 0.05);
        }
      }

      // 3. Subterranean Massive Low-End Rumble (44Hz -> 28Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(46 * pitchScale, t);
      subOsc.frequency.linearRampToValueAtTime(28 * pitchScale, t + duration);

      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(115, t);

      subGain.gain.setValueAtTime(0.01, t);
      subGain.gain.linearRampToValueAtTime(0.50 * volumeScale, t + 0.15);
      subGain.gain.linearRampToValueAtTime(0.42 * volumeScale, t + duration - 0.2);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.sfxGain);

      subOsc.start(t);
      subOsc.stop(t + duration);

      // 4. Heavy Granite Seating Slam / Impact Thud (Final lock into position)
      const impactTime = t + duration;
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(125 * pitchScale, impactTime);
      thudOsc.frequency.exponentialRampToValueAtTime(24 * pitchScale, impactTime + 0.42);

      thudGain.gain.setValueAtTime(0.75 * volumeScale, impactTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.42);

      thudOsc.connect(thudGain);
      thudGain.connect(this.sfxGain);
      thudOsc.start(impactTime);
      thudOsc.stop(impactTime + 0.42);
    } catch (e) {
      console.warn("Stone grinding sound error:", e);
    }
  }

  /* ---------------- HEAVY STONE SLAB SLIDE ---------------- */
  playStoneSlabSlide(duration = 1.8) {
    this.playStoneGrinding(duration, 0.82, 1.15);
  }

  /* ---------------- DULL IMMOVABLE STONE CLUNK (LOCKED MECHANISM) ---------------- */
  playStoneLocked() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // Heavy dull stone impact
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(85, t);
      thudOsc.frequency.exponentialRampToValueAtTime(28, t + 0.25);
      thudGain.gain.setValueAtTime(0.65, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      thudOsc.connect(thudGain);
      thudGain.connect(this.sfxGain);
      thudOsc.start(t);
      thudOsc.stop(t + 0.25);

      // Iron lock resistance rattle
      [0, 0.04].forEach(off => {
        const rattleOsc = this.ctx.createOscillator();
        const rGain = this.ctx.createGain();
        rattleOsc.type = 'square';
        rattleOsc.frequency.setValueAtTime(420 + off * 200, t + off);
        rGain.gain.setValueAtTime(0.25, t + off);
        rGain.gain.exponentialRampToValueAtTime(0.001, t + off + 0.05);
        rattleOsc.connect(rGain);
        rGain.connect(this.sfxGain);
        rattleOsc.start(t + off);
        rattleOsc.stop(t + off + 0.05);
      });
    } catch (e) {}
  }

  /* ---------------- VIOLENT STRUCTURAL WALL CRACKING ---------------- */
  playWallCracking() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // 1. High-Tension Structural Stress Snaps (Acoustic fracture transients)
      [0, 0.06, 0.14, 0.24, 0.42].forEach((offset, idx) => {
        const snapTime = t + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1600 + idx * 480, snapTime);
        osc.frequency.exponentialRampToValueAtTime(180, snapTime + 0.055);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2100, snapTime);
        filter.Q.setValueAtTime(4.8, snapTime);

        gain.gain.setValueAtTime(0.72, snapTime);
        gain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.06);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(snapTime);
        osc.stop(snapTime + 0.06);
      });

      // 2. Concussive Sub-Bass Tectonic Fissure (Tearing stone)
      const fissureOsc = this.ctx.createOscillator();
      const fissureGain = this.ctx.createGain();
      fissureOsc.type = 'sawtooth';
      fissureOsc.frequency.setValueAtTime(160, t + 0.04);
      fissureOsc.frequency.exponentialRampToValueAtTime(22, t + 1.9);

      const fissureFilter = this.ctx.createBiquadFilter();
      fissureFilter.type = 'lowpass';
      fissureFilter.frequency.setValueAtTime(140, t + 0.04);

      fissureGain.gain.setValueAtTime(0.85, t + 0.04);
      fissureGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

      fissureOsc.connect(fissureFilter);
      fissureFilter.connect(fissureGain);
      fissureGain.connect(this.sfxGain);

      fissureOsc.start(t + 0.04);
      fissureOsc.stop(t + 2.0);

      // 3. Falling Crumbling Mortar & Rock Fragments Tumbling
      const noiseBuf = this.getNoiseBuffer();
      if (noiseBuf) {
        for (let i = 0; i < 11; i++) {
          const pebbleTime = t + 0.18 + Math.random() * 1.3;
          const noiseSrc = this.ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;

          const bp = this.ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(600 + Math.random() * 1200, pebbleTime);
          bp.Q.setValueAtTime(6.5, pebbleTime);

          const pg = this.ctx.createGain();
          pg.gain.setValueAtTime(0.38, pebbleTime);
          pg.gain.exponentialRampToValueAtTime(0.001, pebbleTime + 0.07);

          noiseSrc.connect(bp);
          bp.connect(pg);
          pg.connect(this.sfxGain);

          noiseSrc.start(pebbleTime);
          noiseSrc.stop(pebbleTime + 0.08);
        }
      }
    } catch (e) {
      console.warn("Wall cracking sound error:", e);
    }
  }

  /* ---------------- AUTHENTIC METALLIC KEY PICKUP (BRASS, SILVER, OBSIDIAN) ---------------- */
  playKeyPickup(keyType = 'brass') {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Realistic Multi-Clink Key Ring Jingle (Keys rattling on iron ring)
      [0, 0.026, 0.054].forEach((offset, idx) => {
        const jingleOsc = this.ctx.createOscillator();
        const jingleGain = this.ctx.createGain();
        jingleOsc.type = 'square';
        jingleOsc.frequency.setValueAtTime(1800 + idx * 420, t + offset);
        jingleOsc.frequency.exponentialRampToValueAtTime(450, t + offset + 0.04);
        jingleGain.gain.setValueAtTime(0.38, t + offset);
        jingleGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);
        jingleOsc.connect(jingleGain);
        jingleGain.connect(this.sfxGain);
        jingleOsc.start(t + offset);
        jingleOsc.stop(t + offset + 0.04);
      });

      // 2. Material-Specific Modal Synthesis
      if (keyType === 'brass') {
        // Antique Brass Skeleton Key: warm inharmonic brass bell partials (392Hz, 784Hz, 1175Hz, 1960Hz, 3136Hz)
        const partials = [
          { f: 392.0, g: 0.42, d: 1.6 },
          { f: 784.0, g: 0.36, d: 1.2 },
          { f: 1175.0, g: 0.28, d: 0.9 },
          { f: 1960.0, g: 0.20, d: 0.6 },
          { f: 3136.0, g: 0.15, d: 0.4 }
        ];
        partials.forEach(p => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.f, t + 0.05);
          gain.gain.setValueAtTime(p.g, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + p.d);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + 0.05);
          osc.stop(t + 0.05 + p.d);
        });
      } else if (keyType === 'silver') {
        // Astral Silver Observatory Key: crystalline singing bowl chime (880Hz, 1760Hz, 2640Hz, 3520Hz, 5280Hz) + Solfeggio 528Hz
        const partials = [
          { f: 528.0, g: 0.30, d: 2.4 }, // Solfeggio 528Hz sub-resonance
          { f: 880.0, g: 0.40, d: 2.2 },
          { f: 1760.0, g: 0.35, d: 1.7 },
          { f: 2640.0, g: 0.26, d: 1.2 },
          { f: 3520.0, g: 0.20, d: 0.9 },
          { f: 5280.0, g: 0.14, d: 0.6 }
        ];
        partials.forEach(p => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          // Detuned chorus for sparkling celestial shimmer
          osc.frequency.setValueAtTime(p.f, t + 0.05);
          gain.gain.setValueAtTime(p.g, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + p.d);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + 0.05);
          osc.stop(t + 0.05 + p.d);
        });
      } else {
        // Obsidian Runic Temple Key: sharp volcanic mineral clack + sacred deep Tibetan temple gong (136.1Hz Om, 272.2Hz, 408.3Hz, 544.4Hz)
        const mineralSnap = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        mineralSnap.type = 'triangle';
        mineralSnap.frequency.setValueAtTime(2400, t + 0.05);
        mineralSnap.frequency.exponentialRampToValueAtTime(500, t + 0.09);
        snapGain.gain.setValueAtTime(0.55, t + 0.05);
        snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        mineralSnap.connect(snapGain);
        snapGain.connect(this.sfxGain);
        mineralSnap.start(t + 0.05);
        mineralSnap.stop(t + 0.09);

        const partials = [
          { f: 136.1, g: 0.55, d: 3.2 }, // Sacred Om frequency
          { f: 272.2, g: 0.42, d: 2.6 },
          { f: 408.3, g: 0.32, d: 2.0 },
          { f: 544.4, g: 0.24, d: 1.4 },
          { f: 816.6, g: 0.16, d: 0.9 }
        ];
        partials.forEach(p => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.f, t + 0.06);
          gain.gain.setValueAtTime(p.g, t + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06 + p.d);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + 0.06);
          osc.stop(t + 0.06 + p.d);
        });
      }
    } catch (e) {
      console.warn("Key pickup sound error:", e);
    }
  }

  /* ---------------- METALLIC KEY JINGLE (HUD / INVENTORY TOUCH) ---------------- */
  playKeyJingle() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [0, 0.03, 0.07].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2200 + idx * 450, t + offset);
        gain.gain.setValueAtTime(0.24, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + offset);
        osc.stop(t + offset + 0.04);
      });
    } catch (e) {}
  }

  /* ---------------- TIBETAN SINGING BOWL (ACOUSTIC BEATING TREMOLO) ---------------- */
  playSingingBowl(baseFreq = 528, duration = 4.5) {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Dual detuned sine waves create authentic acoustic beating tremolo (1.8Hz pulsation)
      [baseFreq, baseFreq + 1.8].forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.30, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + duration);
      });

      // Harmonic overtones of hammered bronze bowl (2.76x and 5.4x)
      [baseFreq * 2.76, baseFreq * 5.4].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.12 / (idx + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.7);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + duration * 0.7);
      });
    } catch (e) {}
  }

  /* ---------------- MYSTIC CHIME & ARCANE WHISPER ---------------- */
  playMysticChime() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Sacred Solfeggio 528Hz singing bowl tone
      const harmonics = [528.0, 1056.0, 1584.0, 2112.0];
      harmonics.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        const amp = 0.3 / (idx + 1);
        gain.gain.setValueAtTime(amp, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 3.0);
      });
    } catch (e) {}
  }

  playMysticWhisper() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const noiseBuf = this.getNoiseBuffer();
      if (!noiseBuf) return;

      const src = this.ctx.createBufferSource();
      src.buffer = noiseBuf;

      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(750, t);
      bp.frequency.linearRampToValueAtTime(1450, t + 0.8);
      bp.frequency.linearRampToValueAtTime(800, t + 1.8);
      bp.Q.setValueAtTime(4.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.9);

      src.connect(bp);
      bp.connect(gain);
      gain.connect(this.sfxGain);

      src.start(t);
      src.stop(t + 1.9);
    } catch (e) {}
  }

  /* ---------------- INTERACTIVE PUZZLE SOUNDS ---------------- */
  playFootstep() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // 1. Crisp stone heel impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 50, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.09);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.09);

      // 2. Subtle stone dust crunch
      const noiseBuf = this.getNoiseBuffer();
      if (noiseBuf) {
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = noiseBuf;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(800 + Math.random() * 400, t);
        bp.Q.setValueAtTime(5.0, t);
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(0.09, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        nSrc.connect(bp);
        bp.connect(ng);
        ng.connect(this.sfxGain);
        nSrc.start(t);
        nSrc.stop(t + 0.07);
      }
    } catch (e) {}
  }

  playFlashlightClick(state = true) {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(state ? 1400 : 800, t);
      osc.frequency.exponentialRampToValueAtTime(state ? 2400 : 500, t + 0.05);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }

  playModeSwitch(mode) {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (mode === 'white') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(700, t + 0.14);
      } else if (mode === 'uv') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, t);
        osc.frequency.exponentialRampToValueAtTime(1500, t + 0.18);
        this.playMysticWhisper();
      } else if (mode === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.2);
      }

      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  playBookInteract() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // Heavy stone lectern slide friction
      this.playStoneGrinding(0.45, 1.4, 0.45);

      // Heavy wooden book thud on stone lectern
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      gain.gain.setValueAtTime(0.42, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.18);

      // Mystic parchment page flutter
      this.playMysticWhisper();
    } catch (e) {}
  }

  playMirrorRotate() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Mechanical brass gears & heavy stone friction
      this.playStoneGrinding(0.55, 1.1, 0.55);

      [0, 0.05, 0.11, 0.18].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(520 + idx * 140, t + offset);
        gain.gain.setValueAtTime(0.26, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + offset);
        osc.stop(t + offset + 0.04);
      });
      // Subtle crystalline prism ping
      this.playSingingBowl(880, 1.8);
    } catch (e) {}
  }

  playLaserBounce() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Crystalline refraction ping
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.14);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch (e) {}
  }

  playBrazierAdjust() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Heavy stone bowl friction + fire flare
      this.playStoneGrinding(0.7, 0.85, 0.65);

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, t);

      gain.gain.setValueAtTime(0.40, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch (e) {}
  }

  playChamberTransition(roomNumber) {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      this.playMysticWhisper();
      if (roomNumber === 2) {
        this.playSingingBowl(432, 3.5);
      } else if (roomNumber === 3) {
        this.playKeyPickup('obsidian');
        this.playWallCracking();
      } else {
        this.playMysticChime();
      }
    } catch (e) {}
  }

  playDoorSlide() {
    // Heavy granite stone grinding + structural creak
    this.playStoneGrinding(1.8);
    this.playWallCracking();
  }

  playPuzzleSolved() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Mystic ascension harmonic sequence (Solfeggio frequencies: 396Hz, 417Hz, 528Hz, 639Hz)
      const notes = [396.0, 417.0, 528.0, 639.0];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);

        gain.gain.setValueAtTime(0.35, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + idx * 0.1);
        osc.stop(t + idx * 0.1 + 1.2);
      });
      this.playMysticWhisper();
    } catch (e) {}
  }

  /* ---------------- HOLLOW DECOY KEY TURN SFX ---------------- */
  playKeyTurnDecoy() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // 1. Rapid ratcheting metallic clicks as keys rotate
      for (let i = 0; i < 7; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(520 + i * 90, t + i * 0.07);
        gain.gain.setValueAtTime(0.42, t + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.045);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.045);
      }
      // 2. Hollow mechanism spin rattle
      const spin = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      spin.type = 'sawtooth';
      spin.frequency.setValueAtTime(280, t + 0.45);
      spin.frequency.exponentialRampToValueAtTime(70, t + 1.3);
      sGain.gain.setValueAtTime(0.35, t + 0.45);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
      spin.connect(sGain);
      sGain.connect(this.sfxGain);
      spin.start(t + 0.45);
      spin.stop(t + 1.3);
    } catch (e) {}
  }

  /* ---------------- DRAMATIC PLOT-TWIST REVEAL SFX ---------------- */
  playTwistReveal() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      // 1. Violent wall cracking and debris tumbling
      this.playWallCracking();

      // 2. Colossal granite doors grinding open
      this.playStoneGrinding(3.5);

      // 3. Ancient lock shatter & heroic breakthrough chord
      const t = this.ctx.currentTime;
      [0.8, 1.1, 1.4].forEach((timeOffset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(500 + idx * 300, t + timeOffset);
        gain.gain.setValueAtTime(0.45, t + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.22);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + 0.22);
      });

      // 4. Heroic Grand Chord (Triumphant breakthrough)
      const chord = [130.81, 196.00, 261.63, 392.00, 523.25, 659.25];
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + 1.8);
        gain.gain.setValueAtTime(0.32, t + 1.8);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 5.5);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + 1.8);
        osc.stop(t + 5.5);
      });
    } catch (e) {
      console.warn("Twist reveal audio error:", e);
    }
  }

  playVictory() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const melody = [
        { f: 392.00, d: 0.35 },  // G4
        { f: 528.00, d: 0.35 },  // C5 (528Hz Solfeggio)
        { f: 659.25, d: 0.35 },  // E5
        { f: 783.99, d: 0.95 }   // G5
      ];
      let cur = t;
      melody.forEach(m => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(m.f, cur);
        gain.gain.setValueAtTime(0.45, cur);
        gain.gain.exponentialRampToValueAtTime(0.001, cur + m.d);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(cur);
        osc.stop(cur + m.d);
        cur += m.d;
      });
      this.playMysticChime();
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
