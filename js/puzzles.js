/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * Puzzle Mechanics & Validation Engine with Dramatic Plot-Twist Exit
 */
import { gameState } from './state.js';
import { sound } from './audio.js';

export class PuzzleManager {
  constructor(game) {
    this.game = game;
    this.state = gameState;
  }

  /* ---------------- LEVEL 1: LIBRARY BOOK SEQUENCE ---------------- */
  cycleLibraryBook(lecternIndex) {
    const currentBooks = this.state.state.puzzles.libraryBooks;
    const current = currentBooks[lecternIndex];

    let next = 'falcon';
    if (current === 'falcon') next = 'serpent';
    else if (current === 'serpent') next = 'wolf';
    else if (current === 'wolf') next = 'falcon';

    currentBooks[lecternIndex] = next;
    this.state.state.puzzles.libraryBooks = [...currentBooks];
    this.state.save();

    sound.playBookInteract();
    this.game.updateLecternVisuals(lecternIndex, next);

    const bookNames = { falcon: "Golden Falcon", serpent: "Silver Serpent", wolf: "Azure Wolf" };
    this.game.showBannerPopup("TOME PLACED", `Lectern ${lecternIndex + 1} now holds Tome of the ${bookNames[next]}`);

    if (currentBooks[0] === 'falcon' && currentBooks[1] === 'serpent' && currentBooks[2] === 'wolf') {
      this.solveLibraryPuzzle();
    }
  }

  solveLibraryPuzzle() {
    if (this.state.state.puzzles.libraryCabinetUnlocked) return;
    this.state.state.puzzles.libraryCabinetUnlocked = true;
    this.state.save();

    sound.playWallCracking();
    sound.playStoneGrinding(1.8);
    sound.playPuzzleSolved();
    sound.playMysticWhisper();
    this.game.openLibraryCabinet();
    this.game.showBannerPopup("ARCHIVE UNLOCKED!", "The Ornate Cabinet has opened! Collect the Whispering Key.");
  }

  collectLibraryKey() {
    if (this.state.hasKey('libraryKey')) return;
    this.state.collectKey('libraryKey');
    sound.playKeyPickup('brass');

    this.game.hideLibraryKeyMesh();
    this.game.openDoor('door1');
    this.game.showBannerPopup("KEY ACQUIRED!", "Key 1 (Library Key) added to inventory! Observatory Door Unlocked.");
  }

  /* ---------------- LEVEL 2: OBSERVATORY OPTICAL ALIGNMENT ---------------- */
  rotateMirror(mirrorId) {
    if (mirrorId === 'alpha') {
      let angle = (this.state.state.puzzles.mirrorAlphaAngle + 45) % 360;
      this.state.state.puzzles.mirrorAlphaAngle = angle;
      this.state.save();
      sound.playMirrorRotate();
      this.game.setMirrorAngle('alpha', angle);
      this.game.showBannerPopup("PRISM-ALPHA ROTATED", `Mirror Alpha angled to ${angle}°`);
    } else if (mirrorId === 'beta') {
      let angle = (this.state.state.puzzles.mirrorBetaAngle + 45) % 360;
      this.state.state.puzzles.mirrorBetaAngle = angle;
      this.state.save();
      sound.playMirrorRotate();
      this.game.setMirrorAngle('beta', angle);
      this.game.showBannerPopup("PRISM-BETA ROTATED", `Mirror Beta angled to ${angle}°`);
    }
  }

  solveObservatoryPuzzle() {
    if (this.state.state.puzzles.observatoryAligned) return;
    this.state.state.puzzles.observatoryAligned = true;
    this.state.save();

    sound.playWallCracking();
    sound.playStoneGrinding(2.2);
    sound.playSingingBowl(528, 4.0);
    sound.playPuzzleSolved();
    this.game.openObservatoryVault();
    this.game.showBannerPopup("CELESTIAL HARMONY!", "The Armillary Vault has rotated open! Collect the Astral Key.");
  }

  collectObservatoryKey() {
    if (this.state.hasKey('observatoryKey')) return;
    this.state.collectKey('observatoryKey');
    sound.playKeyPickup('silver');

    this.game.hideObservatoryKeyMesh();
    this.game.openDoor('door2');
    this.game.showBannerPopup("KEY ACQUIRED!", "Key 2 (Astral Silver Key) added to inventory! Temple Door Unlocked.");
  }

  /* ---------------- LEVEL 3: TEMPLE SHADOW BALANCE ---------------- */
  cycleBrazier(type) {
    const levels = [25, 50, 75, 100];
    const names = { 25: "Dim Flame (25%)", 50: "Balanced Flame (50%)", 75: "Bright Flame (75%)", 100: "Blazing Fire (100%)" };

    if (type === 'sol') {
      let cur = this.state.state.puzzles.brazierSol;
      let nextIdx = (levels.indexOf(cur) + 1) % levels.length;
      let next = levels[nextIdx];
      this.state.state.puzzles.brazierSol = next;
      this.state.save();
      sound.playBrazierAdjust();
      this.game.setBrazierFlame('sol', next);
      this.game.showBannerPopup("BRAZIER SOL ADJUSTED", `Sun Brazier tuned to ${names[next]}`);
    } else if (type === 'luna') {
      let cur = this.state.state.puzzles.brazierLuna;
      let nextIdx = (levels.indexOf(cur) + 1) % levels.length;
      let next = levels[nextIdx];
      this.state.state.puzzles.brazierLuna = next;
      this.state.save();
      sound.playBrazierAdjust();
      this.game.setBrazierFlame('luna', next);
      this.game.showBannerPopup("BRAZIER LUNA ADJUSTED", `Moon Brazier tuned to ${names[next]}`);
    }

    this.checkTempleShadowBalance();
  }

  checkTempleShadowBalance() {
    const sol = this.state.state.puzzles.brazierSol;
    const luna = this.state.state.puzzles.brazierLuna;

    if (sol === 50 && luna === 50) {
      this.solveTemplePuzzle();
    } else if (sol > 75 || luna > 75) {
      this.game.showBannerPopup("SHADOW WASHED OUT", "Too much light blinds the glyph! Lower flame intensity.");
    } else if (sol < 30 && luna < 30) {
      this.game.showBannerPopup("SHADOW TOO DEEP", "Darkness conceals the inscription! Increase flame balance.");
    }
  }

  solveTemplePuzzle() {
    if (this.state.state.puzzles.templeBalanced) return;
    this.state.state.puzzles.templeBalanced = true;
    this.state.save();

    sound.playWallCracking();
    sound.playStoneSlabSlide(2.6);
    sound.playSingingBowl(432, 4.5);
    sound.playPuzzleSolved();
    this.game.openTempleAltar();
    this.game.showBannerPopup("SOLAR-LUNAR EQUILIBRIUM!", "The shadows intersect! The stone altar has opened.");
  }

  collectTempleKey() {
    if (this.state.hasKey('templeKey')) return;
    this.state.collectKey('templeKey');
    sound.playKeyPickup('obsidian');

    this.game.hideTempleKeyMesh();
    this.game.showBannerPopup("ANCIENT KEY ACQUIRED!", "Proceed to the Master Exit Portal on the North Wall to investigate!");
  }

  /* ---------------- ANTIGRAVITY RELIC PUZZLE SOLVERS ---------------- */
  solveCelestialGrimoire() {
    this.state.state.gravitonSecrets.library = true;
    sound.playGravitonPickup();
    sound.playSingingBowl(528, 3.5);

    // Auto-align the library books to Falcon, Serpent, Wolf
    this.state.state.puzzles.libraryBooks = ['falcon', 'serpent', 'wolf'];
    this.state.save();
    [0, 1, 2].forEach(idx => {
      this.game.updateLecternVisuals(idx, this.state.state.puzzles.libraryBooks[idx]);
    });
    this.solveLibraryPuzzle();

    this.game.showBannerPopup(
      "🌟 CELESTIAL GRIMOIRE DECIPHERED!",
      "Antigravity Flight achieved! The sacred sequence [Falcon ➔ Serpent ➔ Wolf] is inscribed!"
    );
  }

  solveAstralGravitonPrism() {
    this.state.state.gravitonSecrets.observatory = true;
    sound.playGravitonPickup();

    // Auto-align the optical prism mirrors
    this.state.state.puzzles.mirrorAlphaAngle = 45;
    this.state.state.puzzles.mirrorBetaAngle = 135;
    this.state.save();

    this.game.setMirrorAngle('alpha', 45);
    this.game.setMirrorAngle('beta', 135);

    if (this.game.architect.astralSensor) {
      this.game.architect.astralSensor.hit();
      this.game.architect.astralSensor.hit();
      this.game.architect.astralSensor.hit();
    }
    this.solveObservatoryPuzzle();

    this.game.showBannerPopup(
      "✨ ASTRAL GRAVITON PRISM HARMONIZED!",
      "Zero-G alignment successful! Starlight vectors refracted directly into the Celestial Sensor!"
    );
  }

  solveEyeOfHorusTablet() {
    this.state.state.gravitonSecrets.temple = true;
    sound.playGravitonPickup();

    // Auto-balance both flame braziers to 50%
    this.state.state.puzzles.brazierSol = 50;
    this.state.state.puzzles.brazierLuna = 50;
    this.state.save();

    this.game.setBrazierFlame('sol', 50);
    this.game.setBrazierFlame('luna', 50);
    this.solveTemplePuzzle();

    this.game.showBannerPopup(
      "👁️ EYE OF HORUS CHANNELLED!",
      "Sacred Antigravity Seal engaged! Solar and Lunar fires locked in harmonic 50/50 equilibrium!"
    );
  }

  /* ---------------- MASTER EXIT PORTAL: DRAMATIC PLOT TWIST ---------------- */
  triggerFinalExit() {
    if (this.state.state.puzzles.exitPortalUnlocked) return;
    this.state.state.puzzles.exitPortalUnlocked = true;
    this.state.save();

    sound.playWallCracking();
    sound.playStoneGrinding(3.5);
    sound.playTwistReveal();

    this.game.ui.showTwistCutscene();
  }
}

