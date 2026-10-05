/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * Game State Manager with LocalStorage Persistence
 */

export const SAVE_KEY = 'escape_protocol_save_v4';

export class GameStateManager {
  constructor() {
    this.defaultState = {
      playerName: "Maya",
      playerGender: "female", // 'female', 'male', 'other'
      characterAvatar: "assets/maya_portrait_trans.png",
      characterModel: "female",
      currentLevel: 1, // 1: Library, 2: Observatory, 3: Temple
      timeRemaining: 15 * 60, // 900 seconds (15 minutes)
      isPaused: false,
      keys: {
        libraryKey: false,
        observatoryKey: false,
        templeKey: false
      },
      puzzles: {
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
      },
      discoveredComics: {
        library: true,
        observatory: false,
        temple: false
      },
      battery: 100, // 0 to 100%
      antigravityActive: false,
      antigravityEnergy: 100, // 0 to 100%
      gravitonSecrets: {
        library: false,
        observatory: false,
        temple: false
      },
      hintsUsed: 0,
      currentHintTier: 0,
      gameWon: false,
      gameOver: false,
      gameStarted: false,
      settings: {
        masterVolume: 0.7,
        musicEnabled: true,
        sfxEnabled: true,
        flashlightMode: 'white'
      }
    };

    this.state = this.loadState();
    this.listeners = new Set();
  }

  loadState() {
    try {
      // Purge obsolete save caches
      ['escape_protocol_save_v1', 'escape_protocol_save_v2', 'escape_protocol_save_v3'].forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });

      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.gameStarted) {
          return {
            ...this.defaultState,
            ...parsed,
            keys: { ...this.defaultState.keys, ...(parsed.keys || {}) },
            puzzles: { ...this.defaultState.puzzles, ...(parsed.puzzles || {}) },
            discoveredComics: { ...this.defaultState.discoveredComics, ...(parsed.discoveredComics || {}) },
            settings: { ...this.defaultState.settings, ...(parsed.settings || {}) }
          };
        }
      }
    } catch (e) {
      console.warn("Failed to load saved state:", e);
    }
    return JSON.parse(JSON.stringify(this.defaultState));
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save state to localStorage:", e);
    }
    this.notify();
  }

  reset() {
    localStorage.removeItem(SAVE_KEY);
    this.state = JSON.parse(JSON.stringify(this.defaultState));
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // Key Helpers
  hasKey(keyName) {
    return !!this.state.keys[keyName];
  }

  collectKey(keyName) {
    if (this.state.keys[keyName]) return false;
    this.state.keys[keyName] = true;
    if (keyName === 'libraryKey') {
      this.state.puzzles.libraryKeyCollected = true;
      this.state.discoveredComics.observatory = true;
    } else if (keyName === 'observatoryKey') {
      this.state.puzzles.observatoryKeyCollected = true;
      this.state.discoveredComics.temple = true;
    } else if (keyName === 'templeKey') {
      this.state.puzzles.templeKeyCollected = true;
    }
    this.save();
    return true;
  }

  getKeyCount() {
    let count = 0;
    if (this.state.keys.libraryKey) count++;
    if (this.state.keys.observatoryKey) count++;
    if (this.state.keys.templeKey) count++;
    return count;
  }

  hasAllKeys() {
    return this.state.keys.libraryKey && this.state.keys.observatoryKey && this.state.keys.templeKey;
  }
}

export const gameState = new GameStateManager();
