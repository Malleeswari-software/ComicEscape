/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * 3D World Architect: Constructs The Forgotten Library, The Observatory of Lost Stars,
 * The Temple of Living Shadows, and The Master Exit Portal.
 */
import * as THREE from 'three';
import { comicGen } from './comicTextures.js';
import { COMIC_DATA } from './comicData.js';

export class WorldArchitect {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    // References to dynamic objects
    this.bookshelves = [];
    this.lecterns = [];
    this.bookMeshes = [];
    this.libraryCabinet = null;
    this.libraryKeyGroup = null;

    this.observatoryTelescope = null;
    this.observatorySkyMesh = null;
    this.mirrorAlpha = null;
    this.mirrorBeta = null;
    this.astralSensor = null;
    this.armillaryVault = null;
    this.observatoryKeyGroup = null;

    this.brazierSol = null;
    this.brazierLuna = null;
    this.templeStatues = [];
    this.templeAltar = null;
    this.solarLunarGlyph = null;
    this.templeKeyGroup = null;

    this.exitPortal = null;
    this.exitPortalSockets = [];
    this.exitDoorPanels = [];
    this.exitVistaMesh = null;
  }

  buildAll() {
    this.buildGeneralFloorAndCeiling();
    this.buildLevel1_Library();
    this.buildLevel2_Observatory();
    this.buildLevel3_Temple();
    this.buildFinalExitPortal();
  }

  /* ---------------- GENERAL FLOOR & CEILING ---------------- */
  buildGeneralFloorAndCeiling() {
    // Large Stone Flagstone Floor
    const floorGeo = new THREE.PlaneGeometry(100, 160);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fctx = floorCanvas.getContext('2d');

    // Ancient flagstone texture
    fctx.fillStyle = '#0b0f19';
    fctx.fillRect(0, 0, 1024, 1024);
    fctx.strokeStyle = '#1e293b';
    fctx.lineWidth = 6;
    for (let y = 0; y < 1024; y += 128) {
      const offsetX = (y / 128) % 2 === 0 ? 0 : 64;
      for (let x = -64; x < 1024; x += 128) {
        fctx.strokeRect(x + offsetX, y, 128, 128);
        fctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        fctx.fillRect(x + offsetX + 4, y + 4, 120, 120);
      }
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(16, 24);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.85,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -30);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Stone Vaulted Ceiling
    const ceilGeo = new THREE.PlaneGeometry(100, 160);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.95 });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.position.set(0, 6.5, -30);
    ceil.rotation.x = Math.PI / 2;
    this.scene.add(ceil);
  }

  /* ---------------- LEVEL 1: THE FORGOTTEN LIBRARY ---------------- */
  buildLevel1_Library() {
    const H = 6;
    // Room bounds: Z from 12 to -8, X from -10 to 10
    // South Wall (Behind spawn)
    this.game.createComicWall(
      0, H / 2, 10, 20, H, 0,
      "The Tome of the Nameless Keeper",
      COMIC_DATA.library.panels,
      COMIC_DATA.library.uvClue,
      COMIC_DATA.library.coverImg
    );

    // West Wall with towering bookshelves
    this.createBookshelfRow(-9.5, 0, 1, 18, H, Math.PI / 2);

    // East Wall with towering bookshelves
    this.createBookshelfRow(9.5, 0, 1, 18, H, -Math.PI / 2);

    // Warm candle chandeliers hanging from ceiling
    this.createCandleChandelier(0, 5.2, 2);

    // High Gothic Moonlight Window on West Wall
    this.createMoonlightWindow(-9.8, 3.8, 2);

    // Central Reading Table with 3 Lecterns
    this.createReadingTable(0, 0, 1);

    // Ornate Archive Cabinet on North Wall (Housing Key 1)
    this.createArchiveCabinet(6.5, 0, -7.5);

    // Door 1 (Between Library and Observatory)
    this.game.doors['door1'] = this.game.createVaultDoor(0, 2.4, -8, 4.4, 4.8, true, "Observatory Portal");
  }

  createBookshelfRow(x, y, z, length, height, rotY) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    // Wood Shelf Frame
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.8, metalness: 0.1 });
    const shelfGeo = new THREE.BoxGeometry(length, height, 0.9);
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.y = height / 2;
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    group.add(shelf);

    // Book spines canvas
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 512;
    const bctx = bCanvas.getContext('2d');
    bctx.fillStyle = '#1c130d';
    bctx.fillRect(0, 0, 512, 512);

    const colors = ['#831843', '#1e3a8a', '#14532d', '#78350f', '#4c1d95', '#b45309'];
    for (let r = 0; r < 4; r++) {
      const rowY = r * 128;
      bctx.fillStyle = '#0f0a07';
      bctx.fillRect(0, rowY + 118, 512, 10);
      let curX = 10;
      while (curX < 500) {
        const bw = Math.floor(18 + Math.random() * 24);
        bctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        bctx.fillRect(curX, rowY + 15, bw, 100);
        bctx.fillStyle = '#f59e0b';
        bctx.fillRect(curX + 3, rowY + 30, bw - 6, 4);
        curX += bw + 3;
      }
    }

    const bTex = new THREE.CanvasTexture(bCanvas);
    bTex.wrapS = THREE.RepeatWrapping;
    bTex.wrapT = THREE.RepeatWrapping;
    bTex.repeat.set(length / 3, 2);

    const bookMat = new THREE.MeshStandardMaterial({ map: bTex, roughness: 0.7 });
    const spineMesh = new THREE.Mesh(new THREE.PlaneGeometry(length * 0.98, height * 0.9), bookMat);
    spineMesh.position.set(0, height / 2, 0.46);
    group.add(spineMesh);

    this.scene.add(group);

    // Add collider
    const halfW = (Math.abs(Math.cos(rotY)) * length + Math.abs(Math.sin(rotY)) * 0.9) / 2;
    const halfD = (Math.abs(Math.sin(rotY)) * length + Math.abs(Math.cos(rotY)) * 0.9) / 2;
    this.game.colliders.push({ minX: x - halfW, maxX: x + halfW, minZ: z - halfD, maxZ: z + halfD });
  }

  createCandleChandelier(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Iron ring
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 12, 24), ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Chains
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), chainMat);
      chain.position.set(Math.cos(a) * 1.2, 0.6, Math.sin(a) * 1.2);
      chain.rotation.z = Math.cos(a) * 0.3;
      group.add(chain);
    }

    // Warm Candle PointLight
    const warmLight = new THREE.PointLight(0xf59e0b, 2.5, 18, 1.2);
    warmLight.position.set(0, -0.2, 0);
    warmLight.castShadow = true;
    warmLight.shadow.bias = -0.002;
    group.add(warmLight);

    this.scene.add(group);
  }

  createMoonlightWindow(x, y, z) {
    // Window frame
    const winGeo = new THREE.BoxGeometry(0.3, 3.2, 2.2);
    const winMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(x, y, z);
    this.scene.add(win);

    // Glowing cold blue glass
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.0), glassMat);
    glass.position.set(x + 0.16, y, z);
    glass.rotation.y = Math.PI / 2;
    this.scene.add(glass);

    // Cold moonlight directional ray
    const moonLight = new THREE.SpotLight(0x7dd3fc, 2.8, 30, Math.PI / 5, 0.4);
    moonLight.position.set(x + 0.5, y, z);
    moonLight.target.position.set(0, 0, 1);
    this.scene.add(moonLight);
    this.scene.add(moonLight.target);
  }

  createReadingTable(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Table top
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x3e2312, roughness: 0.7, metalness: 0.15 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.2, 2.2), tableMat);
    top.position.y = 1.0;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 12);
    [
      [-3.0, 0.5, -0.9], [3.0, 0.5, -0.9],
      [-3.0, 0.5, 0.9], [3.0, 0.5, 0.9]
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, tableMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // 3 Stone Lecterns for Books (Left, Center, Right)
    const lecternGeo = new THREE.BoxGeometry(1.2, 0.25, 0.9);
    const lecternMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });

    const lecternX = [-2.0, 0, 2.0];
    lecternX.forEach((lx, idx) => {
      const lectern = new THREE.Mesh(lecternGeo, lecternMat);
      lectern.position.set(lx, 1.2, 0);
      lectern.rotation.x = -Math.PI / 12; // tilted for reading
      lectern.castShadow = true;
      group.add(lectern);

      // Book mesh on lectern
      const bookMesh = this.createGrimoireMesh(idx);
      bookMesh.position.set(lx, 1.35, 0);
      bookMesh.rotation.x = -Math.PI / 12;
      group.add(bookMesh);
      this.bookMeshes.push(bookMesh);

      // Make lectern interactable
      lectern.userData = {
        type: 'lectern',
        index: idx,
        prompt: `[E] Arrange Tome on Lectern ${idx + 1}`
      };
      this.game.interactables.push(lectern);
      this.lecterns.push(lectern);
    });

    this.scene.add(group);
    this.game.colliders.push({ minX: x - 3.4, maxX: x + 3.4, minZ: z - 1.3, maxZ: z + 1.3 });
  }

  createGrimoireMesh(lecternIdx) {
    const initialSigil = ['serpent', 'wolf', 'falcon'][lecternIdx];
    const sigilMeta = {
      falcon: { name: "Falcon", color: '#92400e', icon: '🦅' },
      serpent: { name: "Serpent", color: '#065f46', icon: '🐍' },
      wolf: { name: "Wolf", color: '#1e3a8a', icon: '🐺' }
    }[initialSigil];

    const { diffuseTex, emissiveTex } = comicGen.createBookTexture(sigilMeta.name, sigilMeta.color, sigilMeta.icon);

    const bookGeo = new THREE.BoxGeometry(0.8, 0.12, 1.0);
    const bookMat = new THREE.MeshStandardMaterial({
      map: diffuseTex,
      emissiveMap: emissiveTex,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
      roughness: 0.6,
      metalness: 0.2
    });
    this.game.comicWallMaterials.push(bookMat);

    const mesh = new THREE.Mesh(bookGeo, bookMat);
    mesh.castShadow = true;
    mesh.userData = { currentSigil: initialSigil, bookMat };
    return mesh;
  }

  createArchiveCabinet(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Ornate Wooden Cabinet
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x2e190e, roughness: 0.7, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 1.2), cabMat);
    body.position.y = 1.6;
    body.castShadow = true;
    group.add(body);

    // Velvet Interior Nook
    const nookMat = new THREE.MeshStandardMaterial({ color: 0x4c0519, roughness: 0.9 });
    const nook = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.8), nookMat);
    nook.position.set(0, 1.6, 0.22);
    group.add(nook);

    // Cabinet Doors (Left & Right that can swing open)
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2113, roughness: 0.6, metalness: 0.3 });
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.1), doorMat);
    leftDoor.position.set(-0.4, 1.6, 0.62);
    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.1), doorMat);
    rightDoor.position.set(0.4, 1.6, 0.62);
    group.add(leftDoor);
    group.add(rightDoor);

    // Key 1: Antique Brass Library Key on Cushion
    const key1 = this.createKeyMesh(0xf59e0b, 0xd97706, 'brass');
    key1.position.set(0, 1.5, 0.2);
    key1.scale.set(1.4, 1.4, 1.4);
    group.add(key1);
    this.libraryKeyGroup = key1;

    // Make Cabinet & Key Interactable
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 1.4), new THREE.MeshBasicMaterial({ visible: false }));
    trigger.position.y = 1.6;
    group.add(trigger);

    trigger.userData = {
      type: 'archive_cabinet',
      prompt: '[E] Inspect Ornate Archive Cabinet'
    };
    this.game.interactables.push(trigger);

    this.scene.add(group);
    this.libraryCabinet = { group, leftDoor, rightDoor, isOpen: false, keyMesh: key1, trigger };
    this.game.colliders.push({ minX: x - 1.4, maxX: x + 1.4, minZ: z - 0.8, maxZ: z + 0.8 });
  }

  /* ---------------- LEVEL 2: THE OBSERVATORY OF LOST STARS ---------------- */
  buildLevel2_Observatory() {
    const H = 6.5;
    const Z_CENTER = -20;

    // Circular/hexagonal walls with comic and star charts
    // West Wall with Comic 2: "The Last Night of the Lost Constellation"
    this.game.createComicWall(
      -10, H / 2, Z_CENTER, 20, H, Math.PI / 2,
      "The Last Night of the Lost Constellation",
      COMIC_DATA.observatory.panels,
      COMIC_DATA.observatory.uvClue,
      COMIC_DATA.observatory.coverImg
    );

    // East Wall with star chart panels
    this.createStarChartWall(10, H / 2, Z_CENTER, 20, H, -Math.PI / 2);

    // Glass Domed Ceiling with Moving Night Sky
    this.createObservatoryGlassDome(0, 6.2, Z_CENTER);

    // Grand Brass Telescope on pedestal
    this.createGrandTelescope(0, 0, Z_CENTER + 2);

    // Two Rotatable Optical Prism Mirrors (Alpha on left, Beta on right)
    this.mirrorAlpha = this.game.createRotatableMirror(-5.5, 0, Z_CENTER + 4, 0, "Mirror Alpha", 'alpha');
    this.mirrorBeta = this.game.createRotatableMirror(5.5, 0, Z_CENTER - 4, Math.PI / 4, "Mirror Beta", 'beta');

    // Central Armillary Vault housing Key 2
    this.createArmillaryVault(0, 0, Z_CENTER - 4);

    // Celestial Star Glyph Sensor on North Wall
    this.astralSensor = this.createAstralGlyphSensor(6.0, 2.2, Z_CENTER - 9.6);

    // Door 2 (Between Observatory and Temple)
    this.game.doors['door2'] = this.game.createVaultDoor(0, 2.4, Z_CENTER - 10, 4.4, 4.8, true, "Temple Gateway");
  }

  createStarChartWall(x, y, z, width, height, rotY) {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 1024;
    sCanvas.height = 512;
    const sctx = sCanvas.getContext('2d');
    sctx.fillStyle = '#060d1a';
    sctx.fillRect(0, 0, 1024, 512);

    // Draw glowing constellations & star charts
    sctx.strokeStyle = '#38bdf8';
    sctx.fillStyle = '#ffffff';
    sctx.lineWidth = 2;

    // Draw constellation lines
    const stars = [
      [150, 180], [240, 120], [320, 220], [420, 160], [540, 280],
      [680, 150], [780, 240], [880, 190]
    ];
    sctx.beginPath();
    stars.forEach(([sx, sy], i) => {
      if (i === 0) sctx.moveTo(sx, sy);
      else sctx.lineTo(sx, sy);
      sctx.arc(sx, sy, 4, 0, Math.PI * 2);
    });
    sctx.stroke();

    sctx.fillStyle = '#facc15';
    sctx.font = '900 24px "Space Mono", monospace';
    sctx.fillText("CELESTIAL EPHEMERIS: PHOENIX ➔ ORION ➔ CASSIOPEIA", 120, 450);

    const sTex = new THREE.CanvasTexture(sCanvas);
    const wallGeo = new THREE.BoxGeometry(width, height, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({ map: sTex, roughness: 0.6, metalness: 0.2 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, y, z);
    wall.rotation.y = rotY;
    this.scene.add(wall);
    this.game.colliders.push({ minX: x - 0.5, maxX: x + 0.5, minZ: z - width / 2, maxZ: z + width / 2 });
  }

  createObservatoryGlassDome(x, y, z) {
    const domeGeo = new THREE.SphereGeometry(12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x091b34,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(x, y - 2, z);
    this.scene.add(dome);

    // Starry Sky Hemisphere
    const skyGeo = new THREE.SphereGeometry(45, 24, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.set(x, y, z);
    this.scene.add(sky);
    this.observatorySkyMesh = sky;
  }

  createGrandTelescope(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Brass Mount
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 1.4, 20), brassMat);
    base.position.y = 0.7;
    group.add(base);

    // Telescope Tube angled at the stars
    const tubeGeo = new THREE.CylinderGeometry(0.24, 0.38, 4.2, 24);
    const tube = new THREE.Mesh(tubeGeo, brassMat);
    tube.position.set(0, 2.2, 0);
    tube.rotation.x = Math.PI / 4;
    group.add(tube);

    this.scene.add(group);
    this.observatoryTelescope = group;
    this.game.colliders.push({ minX: x - 1.2, maxX: x + 1.2, minZ: z - 1.2, maxZ: z + 1.2 });
  }

  createArmillaryVault(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Marble Pedestal
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 1.2, 24), marbleMat);
    ped.position.y = 0.6;
    ped.castShadow = true;
    group.add(ped);

    // Rotating Brass Rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 12, 32), ringMat);
    ring1.position.y = 1.8;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 12, 32), ringMat);
    ring2.position.y = 1.8;
    ring2.rotation.x = Math.PI / 3;
    group.add(ring1);
    group.add(ring2);

    // Key 2: Astral Silver Key inside Vault
    const key2 = this.createKeyMesh(0x93c5fd, 0x38bdf8, 'silver');
    key2.position.set(0, 1.8, 0);
    key2.scale.set(1.4, 1.4, 1.4);
    group.add(key2);
    this.observatoryKeyGroup = key2;

    // Interaction trigger
    ped.userData = {
      type: 'armillary_vault',
      prompt: '[E] Inspect Armillary Vault'
    };
    this.game.interactables.push(ped);

    this.scene.add(group);
    this.armillaryVault = { group, ring1, ring2, keyMesh: key2, isOpen: false };
    this.game.colliders.push({ minX: x - 1.6, maxX: x + 1.6, minZ: z - 1.6, maxZ: z + 1.6 });
  }

  createAstralGlyphSensor(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Outer Runic Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.2), frameMat);
    group.add(frame);

    // Glowing Star Glyph Center
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.8
    });
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 24), eyeMat);
    eye.rotation.x = Math.PI / 2;
    eye.position.z = 0.12;
    group.add(eye);

    this.scene.add(group);

    return {
      group,
      eyeMat,
      position: new THREE.Vector3(x, y, z),
      activated: false,
      charge: 0,
      hit: () => {
        if (this.astralSensor.activated) return;
        this.astralSensor.charge += 0.08;
        this.game.sound.playLaserBounce();
        if (this.astralSensor.charge >= 1.0) {
          this.astralSensor.activated = true;
          this.astralSensor.eyeMat.color.setHex(0x38bdf8);
          this.astralSensor.eyeMat.emissive.setHex(0x38bdf8);
          this.game.puzzleManager.solveObservatoryPuzzle();
        }
      }
    };
  }

  /* ---------------- LEVEL 3: THE TEMPLE OF LIVING SHADOWS ---------------- */
  buildLevel3_Temple() {
    const H = 7.0;
    const Z_CENTER = -44;

    // West Wall with Comic 3: "The Final Shadow of the Sun and Moon"
    this.game.createComicWall(
      -12, H / 2, Z_CENTER, 24, H, Math.PI / 2,
      "The Final Shadow of the Sun and Moon",
      COMIC_DATA.temple.panels,
      COMIC_DATA.temple.uvClue,
      COMIC_DATA.temple.coverImg
    );

    // East Wall with ancient carved hieroglyphs
    this.createHieroglyphWall(12, H / 2, Z_CENTER, 24, H, -Math.PI / 2);

    // Colossal Guardian Statues casting long shadows
    this.createGuardianStatue(-6, 0, Z_CENTER + 6, Math.PI / 4);
    this.createGuardianStatue(6, 0, Z_CENTER + 6, -Math.PI / 4);
    this.createGuardianStatue(0, 0, Z_CENTER + 9, 0);

    // Two Movable/Adjustable Flame Braziers (Sol on right, Luna on left)
    this.brazierSol = this.createFlameBrazier(5.5, 0, Z_CENTER - 1, 'sol', 0xf97316);
    this.brazierLuna = this.createFlameBrazier(-5.5, 0, Z_CENTER - 1, 'luna', 0xa855f7);

    // Central Ceremonial Altar with Solar-Lunar Glyph
    this.createCeremonialAltar(0, 0, Z_CENTER - 1);
  }

  createHieroglyphWall(x, y, z, width, height, rotY) {
    const hCanvas = document.createElement('canvas');
    hCanvas.width = 1024;
    hCanvas.height = 512;
    const hctx = hCanvas.getContext('2d');
    hctx.fillStyle = '#111827';
    hctx.fillRect(0, 0, 1024, 512);

    // Carved hieroglyphics
    hctx.fillStyle = '#475569';
    hctx.font = '32px sans-serif';
    const glyphs = ['𓀀', '𓀁', '𓀂', '𓁐', '𓂀', '𓃭', '𓆣', '𓇋', '𓈖', '𓉐', '𓋹', '𓍯', '𓊪'];
    for (let r = 40; r < 480; r += 50) {
      let line = '';
      for (let c = 0; c < 18; c++) {
        line += glyphs[Math.floor(Math.random() * glyphs.length)] + ' ';
      }
      hctx.fillText(line, 40, r);
    }

    const hTex = new THREE.CanvasTexture(hCanvas);
    const wallGeo = new THREE.BoxGeometry(width, height, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({ map: hTex, roughness: 0.9, metalness: 0.1 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, y, z);
    wall.rotation.y = rotY;
    this.scene.add(wall);
    this.game.colliders.push({ minX: x - 0.5, maxX: x + 0.5, minZ: z - width / 2, maxZ: z + width / 2 });
  }

  createGuardianStatue(x, y, z, rotY) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    // Stone Pedestal
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.2 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.6), stoneMat);
    base.position.y = 0.5;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Statue Torso & Head
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.4, 0.8), stoneMat);
    body.position.y = 2.7;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Head with Anubis/Pharaoh crown
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 4), stoneMat);
    head.position.y = 4.8;
    head.castShadow = true;
    group.add(head);

    this.scene.add(group);
    this.templeStatues.push(group);
    this.game.colliders.push({ minX: x - 1.0, maxX: x + 1.0, minZ: z - 1.0, maxZ: z + 1.0 });
  }

  createFlameBrazier(x, y, z, type, lightColorHex) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Iron Stand
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.6, 1.4, 16), ironMat);
    stand.position.y = 0.7;
    stand.castShadow = true;
    group.add(stand);

    // Fire Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.3, 0.5, 20), ironMat);
    bowl.position.y = 1.6;
    bowl.castShadow = true;
    group.add(bowl);

    // Flame Core Mesh
    const flameMat = new THREE.MeshBasicMaterial({ color: lightColorHex });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 12), flameMat);
    flame.position.y = 2.1;
    group.add(flame);

    // Flickering Shadow PointLight
    const light = new THREE.PointLight(lightColorHex, 2.5, 20, 1.2);
    light.position.set(0, 2.2, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    group.add(light);

    // Interaction trigger
    bowl.userData = {
      type: 'brazier',
      brazierType: type,
      prompt: `[E] Adjust ${type === 'sol' ? 'Sun Brazier' : 'Moon Brazier'}`
    };
    this.game.interactables.push(bowl);

    this.scene.add(group);
    this.game.colliders.push({ minX: x - 0.9, maxX: x + 0.9, minZ: z - 0.9, maxZ: z + 0.9 });

    return { group, bowl, flame, light, type, intensity: 2.5 };
  }

  createCeremonialAltar(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Stone Altar Block
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.25 });
    const altar = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 2.4), stoneMat);
    altar.position.y = 0.6;
    altar.castShadow = true;
    altar.receiveShadow = true;
    group.add(altar);

    // Top Stone Lid that slides open
    const lid = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 2.4), stoneMat);
    lid.position.y = 1.3;
    lid.castShadow = true;
    lid.receiveShadow = true;
    group.add(lid);

    // Solar-Lunar Eclipse Glyph on Altar Top
    const glyphCanvas = document.createElement('canvas');
    glyphCanvas.width = 512;
    glyphCanvas.height = 512;
    const gctx = glyphCanvas.getContext('2d');
    gctx.fillStyle = '#0f172a';
    gctx.fillRect(0, 0, 512, 512);

    // Draw Sun & Moon Eclipse Emblem
    gctx.strokeStyle = '#f59e0b';
    gctx.fillStyle = '#f59e0b';
    gctx.lineWidth = 12;
    gctx.beginPath();
    gctx.arc(256, 256, 120, 0, Math.PI * 2);
    gctx.stroke();

    // Crescent cut
    gctx.fillStyle = '#38bdf8';
    gctx.beginPath();
    gctx.arc(230, 256, 100, -Math.PI / 2, Math.PI / 2, true);
    gctx.arc(200, 256, 120, Math.PI / 2, -Math.PI / 2, false);
    gctx.fill();

    const glyphTex = new THREE.CanvasTexture(glyphCanvas);
    const glyphMat = new THREE.MeshStandardMaterial({
      map: glyphTex,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
      roughness: 0.5
    });

    const glyphMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), glyphMat);
    glyphMesh.position.set(0, 1.41, 0);
    glyphMesh.rotation.x = -Math.PI / 2;
    group.add(glyphMesh);
    this.solarLunarGlyph = glyphMesh;

    // Key 3: Obsidian Runic Key inside Altar
    const key3 = this.createKeyMesh(0x1e293b, 0xf59e0b, 'obsidian');
    key3.position.set(0, 0.8, 0);
    key3.scale.set(1.4, 1.4, 1.4);
    group.add(key3);
    this.templeKeyGroup = key3;

    altar.userData = {
      type: 'temple_altar',
      prompt: '[E] Inspect Ceremonial Altar'
    };
    this.game.interactables.push(altar);

    this.scene.add(group);
    this.templeAltar = { group, lid, glyphMesh, glyphMat, keyMesh: key3, isOpen: false };
    this.game.colliders.push({ minX: x - 2.0, maxX: x + 2.0, minZ: z - 1.4, maxZ: z + 1.4 });
  }

  /* ---------------- MASTER EXIT PORTAL ---------------- */
  buildFinalExitPortal() {
    const H = 7.0;
    const Z_PORTAL = -56;
    const group = new THREE.Group();
    group.position.set(0, 0, Z_PORTAL);

    // Massive Stone Arch Frame
    const archMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.3 });
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, H, 2.0), archMat);
    leftPillar.position.set(-4.5, H / 2, 0);
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, H, 2.0), archMat);
    rightPillar.position.set(4.5, H / 2, 0);
    const topLintel = new THREE.Mesh(new THREE.BoxGeometry(11.5, 2.0, 2.2), archMat);
    topLintel.position.set(0, H - 1.0, 0);

    group.add(leftPillar);
    group.add(rightPillar);
    group.add(topLintel);

    // Dual Massive Stone Portal Doors (split in half, slide open)
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(3.2, H - 2.0, 0.6), doorMat);
    leftDoor.position.set(-1.6, (H - 2.0) / 2, 0);
    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(3.2, H - 2.0, 0.6), doorMat);
    rightDoor.position.set(1.6, (H - 2.0) / 2, 0);

    group.add(leftDoor);
    group.add(rightDoor);
    this.exitDoorPanels = [leftDoor, rightDoor];

    // Three Key Sockets on the Door Center
    const socketGeo = new THREE.TorusGeometry(0.3, 0.08, 12, 24);
    const socketColors = [0xd97706, 0x38bdf8, 0xf59e0b]; // Brass, Silver, Obsidian
    [-1.2, 0, 1.2].forEach((sx, idx) => {
      const sMat = new THREE.MeshStandardMaterial({
        color: socketColors[idx],
        emissive: socketColors[idx],
        emissiveIntensity: 0.2
      });
      const sMesh = new THREE.Mesh(socketGeo, sMat);
      sMesh.position.set(sx, 2.6, 0.35);
      group.add(sMesh);
      this.exitPortalSockets.push(sMesh);
    });

    // Vista Mesh Behind Portal: Glowing Sunrise Backdrop
    const vistaGeo = new THREE.PlaneGeometry(16, 12);
    const vistaMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    // Load victory sunrise image
    const vLoader = new THREE.TextureLoader();
    vLoader.load('assets/victory_sunrise.jpg', tex => {
      vistaMat.map = tex;
      vistaMat.needsUpdate = true;
    });

    const vistaMesh = new THREE.Mesh(vistaGeo, vistaMat);
    vistaMesh.position.set(0, H / 2, -1.5);
    group.add(vistaMesh);
    this.exitVistaMesh = vistaMesh;

    // Interaction Trigger
    const portalTrigger = new THREE.Mesh(new THREE.BoxGeometry(5.0, 4.0, 2.0), new THREE.MeshBasicMaterial({ visible: false }));
    portalTrigger.position.set(0, 2.5, 0.8);
    portalTrigger.userData = {
      type: 'final_portal',
      prompt: '[E] Inspect the Colossal Master Portal Mechanism'
    };
    this.game.interactables.push(portalTrigger);
    group.add(portalTrigger);

    this.scene.add(group);
    this.exitPortal = { group, leftDoor, rightDoor, isOpen: false, targetOffset: 0, currentOffset: 0 };
    this.game.colliders.push({ minX: -6.0, maxX: 6.0, minZ: Z_PORTAL - 1.0, maxZ: Z_PORTAL + 1.0, isPortal: true });
  }

  // Key mesh generator (Torus + Shaft + Teeth)
  createKeyMesh(colorHex, emissiveHex, type = 'brass') {
    const keyGroup = new THREE.Group();
    const keyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: emissiveHex,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.15
    });

    // Bow / Ring
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 16, 24), keyMat);
    keyGroup.add(bow);

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 12), keyMat);
    stem.position.set(0, -0.3, 0);
    keyGroup.add(stem);

    // Bit / Teeth
    const bit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.03), keyMat);
    bit.position.set(0.08, -0.46, 0);
    keyGroup.add(bit);

    keyGroup.userData = { keyType: type };
    return keyGroup;
  }
}
