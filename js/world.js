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

    // Antigravity & Atmospheric Visual Systems
    this.floatingBooks = [];
    this.celestialGrimoire = null;
    this.astralGravitonLens = null;
    this.eyeOfHorusTablet = null;
    this.ambientDustSystem = null;
    this.antigravityStreamSystem = null;
    this.shadowChasmMesh = null;
    this.atmosphereTimer = 0;
  }

  buildAll() {
    this.buildGeneralFloorAndCeiling();
    this.buildParticleAtmosphere();
    this.buildLevel1_Library();
    this.buildLevel2_Observatory();
    this.buildLevel3_Temple();
    this.buildFinalExitPortal();
    this.buildAntigravityRelics();
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

  /* ---------------- SOLID ENCLOSURE WALLS & PARTITIONS ---------------- */
  createPartitionWall(x, y, z, width, height, rotY = 0, hasCollider = true) {
    const wallGeo = new THREE.BoxGeometry(width, height, 0.8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x162032,
      roughness: 0.88,
      metalness: 0.2
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, y, z);
    wall.rotation.y = rotY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);

    if (hasCollider) {
      const halfW = (Math.abs(Math.cos(rotY)) * width + Math.abs(Math.sin(rotY)) * 0.8) / 2;
      const halfD = (Math.abs(Math.sin(rotY)) * width + Math.abs(Math.cos(rotY)) * 0.8) / 2;
      this.game.colliders.push({
        minX: x - halfW, maxX: x + halfW,
        minZ: z - halfD, maxZ: z + halfD
      });
    }
    return wall;
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

    // Floating Books that levitate in zero gravity
    this.createFloatingBooks(0, 2.4, 1);

    // Ornate Archive Cabinet on North Wall (Housing Key 1)
    this.createArchiveCabinet(6.5, 0, -7.5);

    // Door 1 (Between Library and Observatory) - Completely Enclosed by Solid Stone Partition Walls
    this.createPartitionWall(-6.2, 3.25, -8, 8.0, 6.5, 0); // Left solid wall
    this.createPartitionWall(6.2, 3.25, -8, 8.0, 6.5, 0);  // Right solid wall
    this.createPartitionWall(0, 5.65, -8, 4.4, 1.7, 0, false); // Top arch lintel (overhead only, no ground collider)
    this.game.doors['door1'] = this.game.createVaultDoor(0, 2.4, -8, 4.4, 4.8, true, "Observatory Portal", 'libraryKey');
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

    // Key 1: Antique Brass Library Key on Cushion (Hidden until solved)
    const key1 = this.createKeyMesh(0xf59e0b, 0xd97706, 'brass');
    key1.position.set(0, 1.5, 0.2);
    key1.scale.set(1.4, 1.4, 1.4);
    key1.visible = false; // Hidden until solved
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

    // Door 2 (Between Observatory and Temple) - Completely Enclosed by Solid Stone Partition Walls
    this.createPartitionWall(-6.2, 3.25, Z_CENTER - 10, 8.0, 6.5, 0); // Left solid wall
    this.createPartitionWall(6.2, 3.25, Z_CENTER - 10, 8.0, 6.5, 0);  // Right solid wall
    this.createPartitionWall(0, 5.65, Z_CENTER - 10, 4.4, 1.7, 0, false); // Top arch lintel (overhead only, no ground collider)
    this.game.doors['door2'] = this.game.createVaultDoor(0, 2.4, Z_CENTER - 10, 4.4, 4.8, true, "Temple Gateway", 'observatoryKey');
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

    // Key 2: Astral Silver Key inside Vault (Hidden until solved)
    const key2 = this.createKeyMesh(0x93c5fd, 0x38bdf8, 'silver');
    key2.position.set(0, 1.8, 0);
    key2.scale.set(1.4, 1.4, 1.4);
    key2.visible = false; // Hidden until solved
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

    // Colossal Guardian Statues casting long shadows along flanking columns (leaving center walkway clear)
    this.createGuardianStatue(-6, 0, Z_CENTER + 6, Math.PI / 4);
    this.createGuardianStatue(6, 0, Z_CENTER + 6, -Math.PI / 4);
    this.createGuardianStatue(-6, 0, Z_CENTER + 10, Math.PI / 4);
    this.createGuardianStatue(6, 0, Z_CENTER + 10, -Math.PI / 4);

    // Two Movable/Adjustable Flame Braziers (Sol on right, Luna on left)
    this.brazierSol = this.createFlameBrazier(5.5, 0, Z_CENTER - 1, 'sol', 0xf97316);
    this.brazierLuna = this.createFlameBrazier(-5.5, 0, Z_CENTER - 1, 'luna', 0xa855f7);

    // Central Ceremonial Altar with Solar-Lunar Glyph
    this.createCeremonialAltar(0, 0, Z_CENTER - 1);

    // Door 3 (Between Temple and Master Portal Sanctuary) - Solid Stone Partition Walls
    this.createPartitionWall(-7.1, 3.5, -48, 9.8, 7.0, 0); // Left solid wall
    this.createPartitionWall(7.1, 3.5, -48, 9.8, 7.0, 0);  // Right solid wall
    this.createPartitionWall(0, 5.9, -48, 4.4, 2.2, 0, false); // Top arch lintel (overhead only, no ground collider)
    this.game.doors['door3'] = this.game.createVaultDoor(0, 2.4, -48, 4.4, 4.8, true, "Sanctuary Gateway", 'templeKey');
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

    // Key 3: Obsidian Runic Key inside Altar (Hidden until solved)
    const key3 = this.createKeyMesh(0x1e293b, 0xf59e0b, 'obsidian');
    key3.position.set(0, 0.8, 0);
    key3.scale.set(1.4, 1.4, 1.4);
    key3.visible = false; // Hidden until solved
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

    // Sanctuary Side Walls enclosing corridor from Temple Door 3 (Z = -48) to Master Portal (Z = -56)
    this.createPartitionWall(-6.0, 3.5, -52, 8.0, 7.0, Math.PI / 2); // Left corridor wall
    this.createPartitionWall(6.0, 3.5, -52, 8.0, 7.0, Math.PI / 2);  // Right corridor wall

    // Sanctuary Back Flanking Walls sealing sides of the portal at Z = -56
    this.createPartitionWall(-9.0, 3.5, -56, 6.0, 7.0, 0);
    this.createPartitionWall(9.0, 3.5, -56, 6.0, 7.0, 0);

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

  /* ---------------- PARTICLE ATMOSPHERE & ANTIGRAVITY STREAMS ---------------- */
  createParticleTexture(colorHex = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, colorHex);
    grad.addColorStop(0.35, colorHex);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  buildParticleAtmosphere() {
    const particleCount = 550;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = 0.5 + Math.random() * 5.5;
      const z = 10 - Math.random() * 66; // spans library, observatory, temple

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color coding based on chamber: Gold for Library, Cyan/Purple for Observatory, Amber/Ruby for Temple
      if (z > -8) {
        colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.82; colors[i * 3 + 2] = 0.35; // Golden dust
      } else if (z > -30) {
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.98; // Astral cyan
      } else {
        colors[i * 3] = 0.85; colors[i * 3 + 1] = 0.35; colors[i * 3 + 2] = 0.95; // Temple mystic violet
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      map: this.createParticleTexture('#ffffff'),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.ambientDustSystem = new THREE.Points(geo, pMat);
    this.scene.add(this.ambientDustSystem);

    // Antigravity Vertical Stream System
    const gravCount = 400;
    const gGeo = new THREE.BufferGeometry();
    const gPositions = new Float32Array(gravCount * 3);
    for (let i = 0; i < gravCount; i++) {
      gPositions[i * 3] = (Math.random() - 0.5) * 16;
      gPositions[i * 3 + 1] = Math.random() * 6.0;
      gPositions[i * 3 + 2] = 8 - Math.random() * 62;
    }
    gGeo.setAttribute('position', new THREE.BufferAttribute(gPositions, 3));

    const gMat = new THREE.PointsMaterial({
      size: 0.24,
      color: 0x38bdf8,
      map: this.createParticleTexture('#38bdf8'),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.antigravityStreamSystem = new THREE.Points(gGeo, gMat);
    this.scene.add(this.antigravityStreamSystem);
  }

  /* ---------------- ANTIGRAVITY HIGH-ALTITUDE RELICS ---------------- */
  buildAntigravityRelics() {
    // 1. Chamber 1: High Celestial Grimoire floating near ceiling (Y=4.3)
    this.createCelestialGrimoire(0, 4.3, 2);

    // 2. Chamber 2: High Astral Graviton Prism in center of dome (Y=4.8)
    this.createAstralGravitonPrism(0, 4.8, -20);

    // 3. Chamber 3: High Sacred Eye of Horus Tablet above pharaohs (Y=4.6)
    this.createEyeOfHorusTablet(0, 4.6, -38);

    // 4. Chamber 3: Floor Shadow Chasm (requires floating in Antigravity to cross)
    this.createShadowChasm(-34);
  }

  createFloatingBooks(x, y, z) {
    const bookColors = [0x9333ea, 0x0284c7, 0xf59e0b, 0x10b981];
    [-2.2, -0.8, 0.8, 2.2].forEach((offsetX, idx) => {
      const group = new THREE.Group();
      group.position.set(x + offsetX, y + (idx % 2 === 0 ? 0.3 : -0.2), z + (idx % 2 === 0 ? 0.8 : -0.8));

      // Open book geometry
      const pageMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: bookColors[idx],
        emissiveIntensity: 0.4,
        roughness: 0.5
      });
      const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.7), pageMat);
      leftPage.position.set(-0.24, 0, 0);
      leftPage.rotation.z = Math.PI / 16;

      const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.7), pageMat);
      rightPage.position.set(0.24, 0, 0);
      rightPage.rotation.z = -Math.PI / 16;

      group.add(leftPage);
      group.add(rightPage);

      this.scene.add(group);
      this.floatingBooks.push({
        group,
        baseY: group.position.y,
        speed: 1.2 + idx * 0.3,
        rotSpeed: 0.4 + idx * 0.2
      });
    });
  }

  createCelestialGrimoire(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Glowing ancient runic circle underneath
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 8, 32), ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Inner rotating glyph disc
    const discGeo = new THREE.RingGeometry(0.3, 1.1, 16);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    group.add(disc);

    // Grand Floating Tome
    const tomeMat = new THREE.MeshStandardMaterial({
      color: 0x4c1d95,
      emissive: 0xfacc15,
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.4
    });
    const tome = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.5), tomeMat);
    group.add(tome);

    // Golden embossed corner guards
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    [-0.55, 0.55].forEach(cx => {
      [-0.7, 0.7].forEach(cz => {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.18), cornerMat);
        c.position.set(cx, 0, cz);
        group.add(c);
      });
    });

    // Glowing PointLight
    const light = new THREE.PointLight(0xfacc15, 2.8, 14, 1.4);
    light.position.set(0, 0.4, 0);
    group.add(light);

    // Interaction trigger box
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), new THREE.MeshBasicMaterial({ visible: false }));
    trigger.userData = {
      type: 'celestial_grimoire',
      prompt: '[E] Decipher Celestial Antigravity Grimoire'
    };
    this.game.interactables.push(trigger);
    group.add(trigger);

    this.scene.add(group);
    this.celestialGrimoire = { group, ring, disc, tome, light, baseY: y };
  }

  createAstralGravitonPrism(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Central Floating Crystalline Octahedron
    const crystalGeo = new THREE.OctahedronGeometry(1.0, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      metalness: 0.95,
      roughness: 0.08,
      transparent: true,
      opacity: 0.92
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    group.add(crystal);

    // Orbiting Starlight Spheres
    const orbiters = [];
    const orbGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let i = 0; i < 3; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      group.add(orb);
      orbiters.push(orb);
    }

    // Astral cyan point light
    const light = new THREE.PointLight(0x38bdf8, 3.2, 16, 1.2);
    group.add(light);

    // Interaction trigger box
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), new THREE.MeshBasicMaterial({ visible: false }));
    trigger.userData = {
      type: 'astral_graviton_prism',
      prompt: '[E] Harmonize Astral Graviton Prism'
    };
    this.game.interactables.push(trigger);
    group.add(trigger);

    this.scene.add(group);
    this.astralGravitonLens = { group, crystal, orbiters, light, baseY: y };
  }

  createEyeOfHorusTablet(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Ornate Golden-Lapis Tablet Slab
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      metalness: 0.8,
      roughness: 0.25
    });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.2), slabMat);
    group.add(slab);

    // Golden Crest Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const topFrame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 4), frameMat);
    topFrame.position.set(0, 0.9, 0);
    group.add(topFrame);

    // Eye of Horus Canvas Texture
    const eyeCanvas = document.createElement('canvas');
    eyeCanvas.width = 256;
    eyeCanvas.height = 256;
    const ectx = eyeCanvas.getContext('2d');
    ectx.fillStyle = '#0f172a';
    ectx.fillRect(0, 0, 256, 256);
    ectx.fillStyle = '#facc15';
    ectx.font = '900 80px sans-serif';
    ectx.textAlign = 'center';
    ectx.textBaseline = 'middle';
    ectx.fillText('𓂀', 128, 128);

    const eyeTex = new THREE.CanvasTexture(eyeCanvas);
    const eyePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.0),
      new THREE.MeshStandardMaterial({ map: eyeTex, emissive: 0xf59e0b, emissiveIntensity: 0.6 })
    );
    eyePlane.position.set(0, 0, 0.12);
    group.add(eyePlane);

    // Warm golden light
    const light = new THREE.PointLight(0xf59e0b, 2.6, 14, 1.2);
    group.add(light);

    // Interaction trigger
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), new THREE.MeshBasicMaterial({ visible: false }));
    trigger.userData = {
      type: 'eye_of_horus_tablet',
      prompt: '[E] Channel Eye of Horus Graviton Seal'
    };
    this.game.interactables.push(trigger);
    group.add(trigger);

    this.scene.add(group);
    this.eyeOfHorusTablet = { group, slab, eyePlane, light, baseY: y };
  }

  createShadowChasm(z) {
    const group = new THREE.Group();
    group.position.set(0, 0.04, z);

    // Dark Void Trench across floor
    const chasmCanvas = document.createElement('canvas');
    chasmCanvas.width = 512;
    chasmCanvas.height = 128;
    const cctx = chasmCanvas.getContext('2d');
    cctx.fillStyle = '#020617';
    cctx.fillRect(0, 0, 512, 128);
    // Swirling purple energetic ripples
    cctx.strokeStyle = '#a855f7';
    cctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      cctx.beginPath();
      cctx.arc(256 + (i - 2.5) * 80, 64, 45, 0, Math.PI * 2);
      cctx.stroke();
    }

    const cTex = new THREE.CanvasTexture(chasmCanvas);
    const chasmMat = new THREE.MeshStandardMaterial({
      map: cTex,
      color: 0x05021a,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });

    const chasmMesh = new THREE.Mesh(new THREE.PlaneGeometry(19, 3.2), chasmMat);
    chasmMesh.rotation.x = -Math.PI / 2;
    group.add(chasmMesh);

    // Glowing border runes
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(19, 0.1, 0.1), borderMat);
    b1.position.set(0, 0.05, -1.6);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(19, 0.1, 0.1), borderMat);
    b2.position.set(0, 0.05, 1.6);
    group.add(b1);
    group.add(b2);

    this.scene.add(group);
    this.shadowChasmMesh = chasmMesh;

    // Collider with isChasm = true (blocks movement unless player is floating in Antigravity)
    this.game.colliders.push({
      minX: -9.5,
      maxX: 9.5,
      minZ: z - 1.4,
      maxZ: z + 1.4,
      isChasm: true
    });
  }

  updateAtmosphere(delta, antigravityActive) {
    this.atmosphereTimer += delta;

    // 1. Update ambient dust
    if (this.ambientDustSystem) {
      const pos = this.ambientDustSystem.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        if (antigravityActive) {
          pos[i] += delta * 2.2;
          if (pos[i] > 6.4) pos[i] = 0.4;
        } else {
          pos[i] += Math.sin(this.atmosphereTimer + i) * delta * 0.15;
        }
      }
      this.ambientDustSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update Antigravity vertical streams
    if (this.antigravityStreamSystem) {
      const gPos = this.antigravityStreamSystem.geometry.attributes.position.array;
      const speed = antigravityActive ? 5.5 : 0.4;
      this.antigravityStreamSystem.material.opacity = antigravityActive ? 0.85 : 0.25;
      for (let i = 1; i < gPos.length; i += 3) {
        gPos[i] += delta * speed;
        if (gPos[i] > 6.4) gPos[i] = 0.2;
      }
      this.antigravityStreamSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animate floating books
    this.floatingBooks.forEach((fb, idx) => {
      const bobAmp = antigravityActive ? 0.45 : 0.12;
      fb.group.position.y = fb.baseY + Math.sin(this.atmosphereTimer * fb.speed) * bobAmp;
      fb.group.rotation.y += delta * fb.rotSpeed * (antigravityActive ? 2.5 : 0.8);
      if (antigravityActive) {
        fb.group.rotation.z = Math.sin(this.atmosphereTimer * 1.5 + idx) * 0.2;
      }
    });

    // 4. Animate Celestial Grimoire
    if (this.celestialGrimoire) {
      const cg = this.celestialGrimoire;
      cg.group.position.y = cg.baseY + Math.sin(this.atmosphereTimer * 1.8) * (antigravityActive ? 0.35 : 0.15);
      cg.ring.rotation.z += delta * 1.2;
      cg.disc.rotation.z -= delta * 0.9;
      cg.tome.rotation.y += delta * 0.5;
    }

    // 5. Animate Astral Graviton Prism
    if (this.astralGravitonLens) {
      const ag = this.astralGravitonLens;
      ag.group.position.y = ag.baseY + Math.sin(this.atmosphereTimer * 2.2) * (antigravityActive ? 0.3 : 0.1);
      ag.crystal.rotation.x += delta * 1.0;
      ag.crystal.rotation.y += delta * 1.4;

      ag.orbiters.forEach((orb, i) => {
        const angle = this.atmosphereTimer * 2.5 + (i * Math.PI * 2) / 3;
        orb.position.set(Math.cos(angle) * 1.8, Math.sin(angle * 1.2) * 0.5, Math.sin(angle) * 1.8);
      });
    }

    // 6. Animate Eye of Horus Tablet
    if (this.eyeOfHorusTablet) {
      const et = this.eyeOfHorusTablet;
      et.group.position.y = et.baseY + Math.sin(this.atmosphereTimer * 1.5) * (antigravityActive ? 0.28 : 0.1);
      et.group.rotation.y = Math.sin(this.atmosphereTimer * 0.8) * 0.25;
    }

    // 7. Pulse Shadow Chasm
    if (this.shadowChasmMesh) {
      this.shadowChasmMesh.material.emissiveIntensity = 0.5 + Math.sin(this.atmosphereTimer * 3.0) * 0.35;
    }
  }
}

