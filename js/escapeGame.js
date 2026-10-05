/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * Core 3D Gameplay Engine & Orchestrator
 */
import * as THREE from 'three';
import { PointerLockControls } from './PointerLockControls.js';
import { sound } from './audio.js';
import { gameState } from './state.js';
import { comicGen } from './comicTextures.js';
import { COMIC_DATA } from './comicData.js';
import { WorldArchitect } from './world.js';
import { PuzzleManager } from './puzzles.js';
import { UIController } from './ui.js';

export class EscapeGame3D {
  constructor() {
    this.container = document.getElementById('game-container');
    this.canvas = document.getElementById('webgl-canvas');

    this.active = false;
    this.isLocked = false;
    this.flashlightOn = true;
    this.lightMode = 'white'; // 'white', 'uv', 'laser'
    this.battery = 100;

    // Subsystems
    this.sound = sound;
    this.state = gameState;
    this.puzzleManager = new PuzzleManager(this);

    // Three.js Core
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04060c);
    this.scene.fog = new THREE.FogExp2(0x04060c, 0.028);

    const width = window.innerWidth || 960;
    const height = window.innerHeight || 640;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.7, 6);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    this.controls = new PointerLockControls(this.camera, document.body);
    this.moveState = {
      forward: false, backward: false, left: false, right: false, sprint: false,
      ascend: false, descend: false
    };
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.clock = new THREE.Clock();

    // Antigravity Feature System (Activated by pressing 'G')
    this.antigravityActive = false;
    this.antigravityEnergy = 100;
    this.targetAltitude = 1.7;
    this.floatBobTimer = 0;

    // World Collections
    this.colliders = [];
    this.interactables = [];
    this.comicWallMaterials = [];
    this.mirrors = [];
    this.doors = {};
    this.laserBeams = [];
    this.footstepTimer = 0;

    // Setup Systems
    this.setupLighting();
    this.setupFlashlight();

    // World Architect
    this.architect = new WorldArchitect(this);
    this.architect.buildAll();

    // UI Controller
    this.ui = new UIController(this);

    // Event Listeners
    this.setupEventListeners();

    // Check if saved state has ongoing game
    if (this.state.state.gameStarted && !this.state.state.gameWon && !this.state.state.gameOver) {
      this.restoreSavedGame();
    }

    // Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  /* ---------------- LIGHTING & FLASHLIGHT ---------------- */
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x0e172a, 0.45);
    this.scene.add(this.ambientLight);
  }

  setupFlashlight() {
    // SpotLight attached to player camera
    this.spotLight = new THREE.SpotLight(0xfff5e6, 3.6, 45, Math.PI / 4.4, 0.35, 1.2);
    this.spotLight.position.set(0.25, -0.2, -0.1);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 0.2;
    this.spotLight.shadow.camera.far = 45;
    this.spotLight.shadow.bias = -0.001;

    this.spotTarget = new THREE.Object3D();
    this.spotTarget.position.set(0, 0, -12);
    this.camera.add(this.spotTarget);
    this.spotLight.target = this.spotTarget;

    // Volumetric Cone
    const coneGeo = new THREE.ConeGeometry(3.6, 22, 32, 1, true);
    coneGeo.translate(0, -11, 0);
    coneGeo.rotateX(Math.PI / 2);
    this.coneMat = new THREE.MeshBasicMaterial({
      color: 0xfff5e6,
      transparent: true,
      opacity: 0.07,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.volumetricCone = new THREE.Mesh(coneGeo, this.coneMat);
    this.spotLight.add(this.volumetricCone);

    // 3D Flashlight & Character Hand/Arm Model
    const flashGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.32, 16);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const bodyMesh = new THREE.Mesh(bodyGeo, metalMat);
    bodyMesh.rotation.x = Math.PI / 2;
    flashGroup.add(bodyMesh);

    // Glowing Lens Ring
    const ringGeo = new THREE.TorusGeometry(0.046, 0.008, 12, 24);
    this.ringMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 });
    const ringMesh = new THREE.Mesh(ringGeo, this.ringMat);
    ringMesh.position.set(0, 0, -0.16);
    flashGroup.add(ringMesh);

    // Character Sleeve (Athletic sportswear)
    const sleeveGeo = new THREE.CylinderGeometry(0.055, 0.075, 0.42, 16);
    this.sleeveMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6, metalness: 0.1 });
    this.sleeveMesh = new THREE.Mesh(sleeveGeo, this.sleeveMat);
    this.sleeveMesh.position.set(0, -0.05, 0.15);
    this.sleeveMesh.rotation.x = -Math.PI / 3;

    // Sleeve racing trim
    const stripeGeo = new THREE.CylinderGeometry(0.057, 0.077, 0.42, 16, 1, false, 0, Math.PI / 2.5);
    this.stripeMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.5, metalness: 0.2 });
    this.stripeMesh = new THREE.Mesh(stripeGeo, this.stripeMat);
    this.stripeMesh.position.copy(this.sleeveMesh.position);
    this.stripeMesh.rotation.copy(this.sleeveMesh.rotation);

    // Hand gripping flashlight
    const handGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const handMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.7 });
    const handMesh = new THREE.Mesh(handGeo, handMat);
    handMesh.position.set(0, 0, 0.02);

    const armGroup = new THREE.Group();
    armGroup.add(this.sleeveMesh);
    armGroup.add(this.stripeMesh);
    armGroup.add(handMesh);
    flashGroup.add(armGroup);

    flashGroup.position.set(0.3, -0.26, -0.45);
    this.camera.add(flashGroup);
    this.flashlightMesh = flashGroup;

    this.camera.add(this.spotLight);
    this.scene.add(this.camera);
  }

  updateCharacterGear(gender) {
    if (!this.sleeveMat || !this.stripeMat) return;
    if (gender === 'female') {
      // Maya: Safari explorer vest / terracotta shirt with leather brown trim
      this.sleeveMat.color.setHex(0xc27845);
      this.stripeMat.color.setHex(0x5c3d1e);
    } else {
      // Leo: Olive field expedition jacket with dark khaki/forest trim
      this.sleeveMat.color.setHex(0x3e5e38);
      this.stripeMat.color.setHex(0x273822);
    }
  }

  setLightMode(mode) {
    this.lightMode = mode;
    this.state.state.settings.flashlightMode = mode;
    this.state.save();
    sound.playModeSwitch(mode);

    if (mode === 'white') {
      this.spotLight.color.setHex(0xfff5e6);
      this.spotLight.intensity = 3.6;
      this.spotLight.angle = Math.PI / 4.4;
      this.coneMat.color.setHex(0xfff5e6);
      this.coneMat.opacity = 0.07;
      this.ringMat.color.setHex(0xfef08a);
      this.ringMat.emissive.setHex(0xfef08a);
      this.updateUVEmission(0.0);
      this.showBannerPopup("WHITE FLOODLIGHT", "Broad illumination for dark corridors.");
    } else if (mode === 'uv') {
      this.spotLight.color.setHex(0x9333ea);
      this.spotLight.intensity = 4.5;
      this.spotLight.angle = Math.PI / 3.6;
      this.coneMat.color.setHex(0xa855f7);
      this.coneMat.opacity = 0.16;
      this.ringMat.color.setHex(0xd946ef);
      this.ringMat.emissive.setHex(0xd946ef);
      this.updateUVEmission(1.8);
      this.showBannerPopup("UV BLACKLIGHT ENGAGED", "Fluorescent secret comic ciphers and sigils revealed!");
    } else if (mode === 'laser') {
      this.spotLight.color.setHex(0xef4444);
      this.spotLight.intensity = 6.2;
      this.spotLight.angle = Math.PI / 18;
      this.coneMat.color.setHex(0xf87171);
      this.coneMat.opacity = 0.28;
      this.ringMat.color.setHex(0xef4444);
      this.ringMat.emissive.setHex(0xef4444);
      this.updateUVEmission(0.0);
      this.showBannerPopup("FOCUSED LASER ENGAGED", "High-intensity beam reflects off optical prism mirrors!");
    }

    this.updateHUDLightButtons();
  }

  toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    this.spotLight.visible = this.flashlightOn;
    sound.playFlashlightClick(this.flashlightOn);
    this.showBannerPopup(this.flashlightOn ? "BEAM ON" : "LIGHTS OUT", `[F] toggled flashlight`);
  }

  toggleAntigravity() {
    this.antigravityActive = !this.antigravityActive;
    this.state.state.antigravityActive = this.antigravityActive;
    this.state.save();

    if (this.antigravityActive) {
      sound.playAntigravityActivate();
      this.targetAltitude = Math.max(3.0, this.camera.position.y);
      this.showBannerPopup(
        "✨ ANTIGRAVITY [G] ACTIVATED! ✨",
        "Zero-G field active! [SPACE/Q] Float Up • [SHIFT/C] Glide Down • Glides over chasms!"
      );
      if (this.ui) this.ui.updateAntigravityHUD(true);
      // Volumetric beam shifts to cosmic quantum glow
      if (this.coneMat) {
        this.coneMat.color.setHex(0xa855f7);
        this.coneMat.opacity = 0.22;
      }
    } else {
      sound.playAntigravityDeactivate();
      this.targetAltitude = 1.7;
      this.showBannerPopup("GRAVITY RESTORED", "Operative grounded. Press [G] anytime to levitate!");
      if (this.ui) this.ui.updateAntigravityHUD(false);
      // Revert beam
      if (this.coneMat) {
        this.coneMat.color.setHex(this.lightMode === 'uv' ? 0xa855f7 : (this.lightMode === 'laser' ? 0xf87171 : 0xfff5e6));
        this.coneMat.opacity = this.lightMode === 'uv' ? 0.16 : (this.lightMode === 'laser' ? 0.28 : 0.07);
      }
    }
  }

  updateUVEmission(intensity) {
    this.comicWallMaterials.forEach(mat => {
      mat.emissive.setHex(intensity > 0 ? 0x38bdf8 : 0x000000);
      mat.emissiveIntensity = intensity;
      mat.needsUpdate = true;
    });
  }

  /* ---------------- WORLD BUILDING HELPER ---------------- */
  createComicWall(x, y, z, width, height, rotY, title, panels, uvConfig, coverImgPath = null) {
    const { diffuseTex, emissiveTex } = comicGen.createComicWallTexture(
      title.replace(/\s+/g, '_').toLowerCase(),
      title,
      panels,
      uvConfig,
      coverImgPath
    );

    const mat = new THREE.MeshStandardMaterial({
      map: diffuseTex,
      emissiveMap: emissiveTex,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
      roughness: 0.5,
      metalness: 0.15
    });
    this.comicWallMaterials.push(mat);

    const geo = new THREE.BoxGeometry(width, height, 0.4);
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(x, y, z);
    wall.rotation.y = rotY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);

    const halfW = (Math.abs(Math.cos(rotY)) * width + Math.abs(Math.sin(rotY)) * 0.4) / 2;
    const halfD = (Math.abs(Math.sin(rotY)) * width + Math.abs(Math.cos(rotY)) * 0.4) / 2;
    this.colliders.push({ minX: x - halfW, maxX: x + halfW, minZ: z - halfD, maxZ: z + halfD });

    wall.userData = {
      type: 'comic_wall',
      title: title,
      prompt: `[E] Read "${title}" Comic Inscription`
    };
    this.interactables.push(wall);
    return wall;
  }

  createVaultDoor(x, y, z, w, h, locked = true, label = "Vault Door", requiredKey = null) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const panelGeo = new THREE.BoxGeometry(w / 2, h, 0.35);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.25 });

    const leftPanel = new THREE.Mesh(panelGeo, panelMat);
    leftPanel.position.set(-w / 4, 0, 0);
    const rightPanel = new THREE.Mesh(panelGeo, panelMat);
    rightPanel.position.set(w / 4, 0, 0);
    group.add(leftPanel);
    group.add(rightPanel);

    // Glowing status indicator
    const statusLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({
        color: locked ? 0xef4444 : 0x22c55e,
        emissive: locked ? 0xef4444 : 0x22c55e,
        emissiveIntensity: 0.9
      })
    );
    statusLight.position.set(0, h / 2 - 0.4, 0.25);
    group.add(statusLight);

    // Door interaction trigger
    const doorTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 1.2),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    group.add(doorTrigger);

    this.scene.add(group);

    const doorObj = {
      group, leftPanel, rightPanel, statusLight,
      isOpen: !locked,
      locked: locked,
      targetOffset: locked ? 0 : w * 0.48,
      currentOffset: 0,
      width: w,
      open: () => {
        if (doorObj.isOpen) return;
        doorObj.isOpen = true;
        doorObj.locked = false;
        doorObj.targetOffset = w * 0.48;
        statusLight.material.color.setHex(0x22c55e);
        statusLight.material.emissive.setHex(0x22c55e);
        sound.playDoorSlide();
        this.showBannerPopup("DOOR UNLOCKED", `${label} has opened!`);
      }
    };

    const collider = {
      minX: x - w / 2, maxX: x + w / 2,
      minZ: z - 0.5, maxZ: z + 0.5,
      isDoor: true,
      doorRef: doorObj
    };
    this.colliders.push(collider);

    doorTrigger.userData = {
      type: 'vault_door',
      doorRef: doorObj,
      label: label,
      requiredKey: requiredKey
    };
    this.interactables.push(doorTrigger);

    return doorObj;
  }

  createRotatableMirror(x, y, z, initialAngle, label, mirrorId) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Pedestal
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.2, 20), baseMat);
    base.position.y = 0.6;
    group.add(base);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.2, 0);
    headGroup.rotation.y = initialAngle;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.12), frameMat);
    headGroup.add(frame);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
      metalness: 0.98,
      roughness: 0.05
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), glassMat);
    glass.position.set(0, 0, 0.07);
    headGroup.add(glass);

    group.add(headGroup);
    this.scene.add(group);

    this.colliders.push({ minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.7, maxZ: z + 0.7 });

    const mirrorObj = {
      group, headGroup, label, mirrorId,
      angle: initialAngle,
      rotate: () => this.puzzleManager.rotateMirror(mirrorId)
    };

    base.userData = {
      type: 'mirror',
      mirrorRef: mirrorObj,
      prompt: `[E] Rotate ${label} (45°)`
    };
    this.interactables.push(base);
    return mirrorObj;
  }

  /* ---------------- INTERACTION LOGIC ---------------- */
  handleInteraction() {
    if (!this.active) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = raycaster.intersectObjects(this.interactables, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      if (hit.distance < 4.5) {
        let obj = hit.object;
        while (obj && !obj.userData.type && obj.parent) {
          obj = obj.parent;
        }

        const data = obj.userData;
        if (!data) return;

        if (data.type === 'lectern') {
          this.puzzleManager.cycleLibraryBook(data.index);
        } else if (data.type === 'archive_cabinet') {
          if (this.state.state.puzzles.libraryCabinetUnlocked && !this.state.hasKey('libraryKey')) {
            this.puzzleManager.collectLibraryKey();
          } else if (!this.state.state.puzzles.libraryCabinetUnlocked) {
            this.showBannerPopup("CABINET LOCKED", "Requires sacred tome sequence (Falcon ➔ Serpent ➔ Wolf).");
            sound.playStoneLocked();
          }
        } else if (data.type === 'mirror') {
          data.mirrorRef.rotate();
        } else if (data.type === 'armillary_vault') {
          if (this.state.state.puzzles.observatoryAligned && !this.state.hasKey('observatoryKey')) {
            this.puzzleManager.collectObservatoryKey();
          } else if (!this.state.state.puzzles.observatoryAligned) {
            this.showBannerPopup("VAULT SEALED", "Align Mirror Alpha (45°) and Beta (135°) with the Astral Glyph!");
            sound.playStoneLocked();
          }
        } else if (data.type === 'brazier') {
          this.puzzleManager.cycleBrazier(data.brazierType);
        } else if (data.type === 'temple_altar') {
          if (this.state.state.puzzles.templeBalanced && !this.state.hasKey('templeKey')) {
            this.puzzleManager.collectTempleKey();
          } else if (!this.state.state.puzzles.templeBalanced) {
            this.showBannerPopup("ALTAR SEALED", "Tune Sun and Moon braziers to equal 50% balance.");
            sound.playStoneLocked();
          }
        } else if (data.type === 'final_portal') {
          this.puzzleManager.triggerFinalExit();
        } else if (data.type === 'comic_wall') {
          this.ui.openJournal();
        } else if (data.type === 'celestial_grimoire') {
          if (!this.antigravityActive && this.camera.position.y < 3.2) {
            this.showBannerPopup("TOO HIGH TO REACH", "Press [G] to activate Antigravity and float up to the Grimoire!");
            sound.playStoneLocked();
          } else {
            this.puzzleManager.solveCelestialGrimoire();
          }
        } else if (data.type === 'astral_graviton_prism') {
          if (!this.antigravityActive && this.camera.position.y < 3.5) {
            this.showBannerPopup("ASTRAL ORBIT OUT OF REACH", "Press [G] to activate Antigravity and float into the dome!");
            sound.playStoneLocked();
          } else {
            this.puzzleManager.solveAstralGravitonPrism();
          }
        } else if (data.type === 'eye_of_horus_tablet') {
          if (!this.antigravityActive && this.camera.position.y < 3.5) {
            this.showBannerPopup("SACRED HORUS SEAL", "Press [G] to activate Antigravity and ascend to the Guardian crowns!");
            sound.playStoneLocked();
          } else {
            this.puzzleManager.solveEyeOfHorusTablet();
          }
        } else if (data.type === 'vault_door') {
          if (data.doorRef && data.doorRef.isOpen) {
            this.showBannerPopup("GATEWAY OPEN", `${data.label} is already unlocked. Step through!`);
          } else if (data.doorRef && !data.doorRef.isOpen) {
            const reqKey = data.requiredKey;
            const hasKey = reqKey ? this.state.hasKey(reqKey) : false;
            if (hasKey || (reqKey === 'templeKey' && this.state.hasAllKeys())) {
              data.doorRef.open();
              sound.playKeyPickup(reqKey === 'libraryKey' ? 'brass' : (reqKey === 'observatoryKey' ? 'silver' : 'obsidian'));
              this.showBannerPopup("DOOR UNLOCKED", `Key used! ${data.label} has opened.`);
            } else {
              this.showBannerPopup(`${data.label.toUpperCase()} SEALED`, `This massive reinforced portal is locked. Solve this chamber's puzzle to obtain the key!`);
              sound.playStoneLocked();
            }
          }
        }
      }
    }
  }

  /* ---------------- PUZZLE VISUAL UPDATERS ---------------- */
  updateLecternVisuals(index, bookType) {
    const bookMesh = this.architect.bookMeshes[index];
    if (!bookMesh) return;

    const sigilMeta = {
      falcon: { name: "Falcon", color: '#92400e', icon: '🦅' },
      serpent: { name: "Serpent", color: '#065f46', icon: '🐍' },
      wolf: { name: "Wolf", color: '#1e3a8a', icon: '🐺' }
    }[bookType];

    const { diffuseTex, emissiveTex } = comicGen.createBookTexture(sigilMeta.name, sigilMeta.color, sigilMeta.icon);
    bookMesh.material.map = diffuseTex;
    bookMesh.material.emissiveMap = emissiveTex;
    bookMesh.material.needsUpdate = true;
  }

  openLibraryCabinet() {
    if (this.architect.libraryCabinet) {
      this.architect.libraryCabinet.leftDoor.rotation.y = -Math.PI / 1.8;
      this.architect.libraryCabinet.rightDoor.rotation.y = Math.PI / 1.8;
      this.architect.libraryCabinet.isOpen = true;
      if (!this.state.hasKey('libraryKey') && this.architect.libraryKeyGroup) {
        this.architect.libraryKeyGroup.visible = true;
      }
    }
  }

  hideLibraryKeyMesh() {
    if (this.architect.libraryKeyGroup) {
      this.architect.libraryKeyGroup.visible = false;
    }
    this.ui.updateKeysHUD();
  }

  setMirrorAngle(mirrorId, deg) {
    const rad = deg * (Math.PI / 180);
    if (mirrorId === 'alpha' && this.architect.mirrorAlpha) {
      this.architect.mirrorAlpha.headGroup.rotation.y = rad;
      this.architect.mirrorAlpha.angle = rad;
    } else if (mirrorId === 'beta' && this.architect.mirrorBeta) {
      this.architect.mirrorBeta.headGroup.rotation.y = rad;
      this.architect.mirrorBeta.angle = rad;
    }
  }

  openObservatoryVault() {
    if (this.architect.armillaryVault) {
      this.architect.armillaryVault.isOpen = true;
      if (!this.state.hasKey('observatoryKey') && this.architect.observatoryKeyGroup) {
        this.architect.observatoryKeyGroup.visible = true;
      }
    }
  }

  hideObservatoryKeyMesh() {
    if (this.architect.observatoryKeyGroup) {
      this.architect.observatoryKeyGroup.visible = false;
    }
    this.ui.updateKeysHUD();
  }

  setBrazierFlame(type, level) {
    const intensity = level / 20; // 1.25 to 5.0
    const brazier = type === 'sol' ? this.architect.brazierSol : this.architect.brazierLuna;
    if (brazier) {
      brazier.light.intensity = intensity;
      brazier.flame.scale.set(level / 50, level / 50, level / 50);
    }
  }

  openTempleAltar() {
    if (this.architect.templeAltar) {
      this.architect.templeAltar.lid.position.z = -1.2; // Slide lid open
      this.architect.templeAltar.glyphMat.emissive.setHex(0xf59e0b);
      this.architect.templeAltar.glyphMat.emissiveIntensity = 1.0;
      this.architect.templeAltar.isOpen = true;
      if (!this.state.hasKey('templeKey') && this.architect.templeKeyGroup) {
        this.architect.templeKeyGroup.visible = true;
      }
    }
  }

  hideTempleKeyMesh() {
    if (this.architect.templeKeyGroup) {
      this.architect.templeKeyGroup.visible = false;
    }
    this.ui.updateKeysHUD();
  }

  openDoor(doorId) {
    if (this.doors[doorId]) {
      this.doors[doorId].open();
    }
  }

  triggerCinematicVictory() {
    // Animate exit portal doors opening with colossal stone grinding and wall cracking
    sound.playStoneGrinding(3.6, 0.7, 1.25);
    sound.playWallCracking();
    sound.playSingingBowl(528, 4.2);

    if (this.architect.exitPortal) {
      this.architect.exitPortal.isOpen = true;
      this.architect.exitPortal.targetOffset = 3.4;
      this.architect.exitPortalSockets.forEach(s => {
        s.material.emissiveIntensity = 1.0;
      });
    }

    // Camera glide forward into the sunrise
    setTimeout(() => {
      this.ui.showVictoryScreen();
    }, 2800);
  }

  showBannerPopup(title, msg) {
    this.ui.showBanner(title, msg);
  }

  /* ---------------- LASER REFLECTION ENGINE ---------------- */
  updateLaserReflection() {
    this.laserBeams.forEach(b => this.scene.remove(b));
    this.laserBeams = [];

    if (!this.flashlightOn || this.lightMode !== 'laser') return;

    const origin = new THREE.Vector3();
    this.spotLight.getWorldPosition(origin);
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    let curPos = origin.clone();
    let curDir = dir.clone();

    for (let bounce = 0; bounce < 3; bounce++) {
      const raycaster = new THREE.Raycaster(curPos, curDir, 0.1, 40);
      const intersects = raycaster.intersectObjects(this.scene.children, true);

      let closest = null;
      for (let hit of intersects) {
        if (hit.object === this.volumetricCone || hit.object === this.flashlightMesh) continue;
        closest = hit;
        break;
      }

      if (!closest) {
        const endPos = curPos.clone().add(curDir.clone().multiplyScalar(35));
        this.drawLaserSegment(curPos, endPos);
        break;
      }

      this.drawLaserSegment(curPos, closest.point);

      // Check hit mirror
      let hitMirror = false;
      let obj = closest.object;
      while (obj) {
        if (obj.geometry && obj.geometry.type === 'PlaneGeometry' && obj.material && obj.material.metalness > 0.9) {
          hitMirror = true;
          break;
        }
        obj = obj.parent;
      }

      // Check hit Astral Sensor
      if (this.architect.astralSensor && closest.point.distanceTo(this.architect.astralSensor.position) < 1.0) {
        this.architect.astralSensor.hit();
      }

      if (hitMirror && closest.normal) {
        const normal = closest.normal.clone().transformDirection(closest.object.matrixWorld).normalize();
        const dot = curDir.dot(normal);
        curDir = curDir.clone().sub(normal.clone().multiplyScalar(2 * dot)).normalize();
        curPos = closest.point.clone().add(curDir.clone().multiplyScalar(0.05));
      } else {
        break;
      }
    }
  }

  drawLaserSegment(start, end) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.laserBeams.push(line);
  }

  /* ---------------- EVENT LISTENERS ---------------- */
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });

    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) && this.active) {
        e.preventDefault();
      }

      if (k === 'w' || k === 'arrowup') this.moveState.forward = true;
      if (k === 's' || k === 'arrowdown') this.moveState.backward = true;
      if (k === 'a' || k === 'arrowleft') this.moveState.left = true;
      if (k === 'd' || k === 'arrowright') this.moveState.right = true;
      if (k === 'shift') this.moveState.sprint = true;

      // Antigravity controls: 'g' toggles, space/q ascends, c/shift descends
      if (k === 'g') this.toggleAntigravity();
      if (this.antigravityActive) {
        if (k === ' ' || k === 'q') this.moveState.ascend = true;
        if (k === 'c') this.moveState.descend = true;
      }

      if (k === '1') this.setLightMode('white');
      if (k === '2') this.setLightMode('uv');
      if (k === '3') this.setLightMode('laser');
      if (k === 'f') this.toggleFlashlight();
      if (k === 'h') this.ui.toggleHintModal();
      if (k === 'j') this.ui.openJournal();
      if (k === 'escape') this.ui.togglePauseMenu();
      if (k === 'e' || (!this.antigravityActive && k === ' ')) this.handleInteraction();
    });

    window.addEventListener('keyup', e => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.moveState.forward = false;
      if (k === 's' || k === 'arrowdown') this.moveState.backward = false;
      if (k === 'a' || k === 'arrowleft') this.moveState.left = false;
      if (k === 'd' || k === 'arrowright') this.moveState.right = false;
      if (k === 'shift') this.moveState.sprint = false;
      if (k === ' ' || k === 'q') this.moveState.ascend = false;
      if (k === 'c') this.moveState.descend = false;
    });

    // Pointer Lock events
    this.controls.addEventListener('lock', () => {
      this.isLocked = true;
      const c2p = document.getElementById('click-to-play');
      if (c2p) c2p.style.display = 'none';
      sound.ensureContext();
    });

    this.controls.addEventListener('unlock', () => {
      this.isLocked = false;
      if (this.active && !this.state.state.isPaused && !document.getElementById('comic-modal').style.display.includes('flex')) {
        const c2p = document.getElementById('click-to-play');
        if (c2p) c2p.style.display = 'flex';
      }
    });

    const c2p = document.getElementById('click-to-play');
    if (c2p) {
      c2p.addEventListener('click', () => {
        if (this.active && !this.state.state.isPaused) {
          this.controls.lock();
        }
      });
    }

    this.canvas.addEventListener('click', () => {
      if (this.active && !this.isLocked && !this.state.state.isPaused) {
        this.controls.lock();
      }
    });

    // HUD Light Buttons
    document.getElementById('btn-mode-white').addEventListener('click', () => this.setLightMode('white'));
    document.getElementById('btn-mode-uv').addEventListener('click', () => this.setLightMode('uv'));
    document.getElementById('btn-mode-laser').addEventListener('click', () => this.setLightMode('laser'));
    document.getElementById('btn-toggle-flash').addEventListener('click', () => this.toggleFlashlight());
  }

  updateHUDLightButtons() {
    ['white', 'uv', 'laser'].forEach(m => {
      const el = document.getElementById(`btn-mode-${m}`);
      if (el) {
        if (m === this.lightMode) el.classList.add('active');
        else el.classList.remove('active');
      }
    });
  }

  /* ---------------- RESTORE SAVED STATE ---------------- */
  restoreSavedGame() {
    const s = this.state.state;
    this.active = true;
    document.getElementById('setup-modal').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';

    this.updateCharacterGear(s.playerGender);
    this.ui.updateHUDFromState();
    this.setLightMode(s.settings.flashlightMode || 'white');

    // Restore Puzzles only if game was actively in progress
    if (s.gameStarted) {
      if (s.puzzles.libraryBooks) {
        s.puzzles.libraryBooks.forEach((b, idx) => {
          if (b) this.updateLecternVisuals(idx, b);
        });
      }
      if (s.puzzles.libraryCabinetUnlocked) this.openLibraryCabinet();
      if (s.puzzles.libraryKeyCollected) this.hideLibraryKeyMesh();
      if (s.keys.libraryKey) this.openDoor('door1');

      if (s.puzzles.mirrorAlphaAngle) this.setMirrorAngle('alpha', s.puzzles.mirrorAlphaAngle);
      if (s.puzzles.mirrorBetaAngle) this.setMirrorAngle('beta', s.puzzles.mirrorBetaAngle);
      if (s.puzzles.observatoryAligned) this.openObservatoryVault();
      if (s.puzzles.observatoryKeyCollected) this.hideObservatoryKeyMesh();
      if (s.keys.observatoryKey) this.openDoor('door2');

      if (s.puzzles.brazierSol) this.setBrazierFlame('sol', s.puzzles.brazierSol);
      if (s.puzzles.brazierLuna) this.setBrazierFlame('luna', s.puzzles.brazierLuna);
      if (s.puzzles.templeBalanced) this.openTempleAltar();
      if (s.puzzles.templeKeyCollected) this.hideTempleKeyMesh();
      if (s.keys.templeKey) this.openDoor('door3');
    }

    sound.init();
    sound.startBackgroundMusic();
    this.ui.startTimer();
  }

  /* ---------------- ANIMATION LOOP ---------------- */
  animate() {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.active) {
      this.updateMovement(delta);
      this.updateInteractionPrompt();
      this.updateDoors(delta);
      this.updateLaserReflection();
      this.updateBattery(delta);

      // Update atmospheric particles & Antigravity vertical streams
      if (this.architect && this.architect.updateAtmosphere) {
        this.architect.updateAtmosphere(delta, this.antigravityActive);
      }

      // Rotate keys
      [this.architect.libraryKeyGroup, this.architect.observatoryKeyGroup, this.architect.templeKeyGroup].forEach(kg => {
        if (kg && kg.visible) kg.rotation.y += delta * 1.5;
      });

      // Rotate Armillary Vault rings
      if (this.architect.armillaryVault && this.architect.armillaryVault.isOpen) {
        this.architect.armillaryVault.ring1.rotation.y += delta * 1.0;
        this.architect.armillaryVault.ring2.rotation.z += delta * 1.4;
      }

      // Rotate Celestial Sky in Observatory
      if (this.architect.observatorySkyMesh) {
        this.architect.observatorySkyMesh.rotation.y += delta * 0.02;
      }

      // Exit Portal opening animation
      if (this.architect.exitPortal && this.architect.exitPortal.isOpen) {
        const ep = this.architect.exitPortal;
        if (ep.currentOffset < ep.targetOffset) {
          ep.currentOffset += delta * 1.5;
          ep.leftDoor.position.x = -1.6 - ep.currentOffset;
          ep.rightDoor.position.x = 1.6 + ep.currentOffset;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateBattery(delta) {
    if (this.flashlightOn) {
      const drainRate = this.lightMode === 'laser' ? 2.5 : (this.lightMode === 'uv' ? 1.8 : 0.8);
      this.battery = Math.max(15, this.battery - drainRate * delta); // Fair: never goes below 15%
    } else {
      this.battery = Math.min(100, this.battery + 8.0 * delta); // Recharges when off
    }
    this.ui.updateBatteryHUD(Math.round(this.battery));

    // Antigravity Energy Update
    if (this.antigravityActive) {
      this.antigravityEnergy = Math.max(15, this.antigravityEnergy - 3.0 * delta);
    } else {
      this.antigravityEnergy = Math.min(100, this.antigravityEnergy + 7.5 * delta);
    }
    this.state.state.antigravityEnergy = Math.round(this.antigravityEnergy);
  }

  updateMovement(delta) {
    if (!this.isLocked) return;

    // In Antigravity: reduced friction, floating glide velocity
    const speed = this.antigravityActive
      ? (this.moveState.sprint ? 9.2 : 6.2)
      : (this.moveState.sprint ? 7.5 : 4.5);
    const dampening = this.antigravityActive ? 5.2 : 10.0;
    this.velocity.x -= this.velocity.x * dampening * delta;
    this.velocity.z -= this.velocity.z * dampening * delta;

    this.direction.z = Number(this.moveState.forward) - Number(this.moveState.backward);
    this.direction.x = Number(this.moveState.right) - Number(this.moveState.left);
    this.direction.normalize();

    const accel = this.antigravityActive ? 6.5 : 8.0;
    if (this.moveState.forward || this.moveState.backward) {
      this.velocity.z -= this.direction.z * speed * accel * delta;
    }
    if (this.moveState.left || this.moveState.right) {
      this.velocity.x -= this.direction.x * speed * accel * delta;
    }

    const moving = Math.abs(this.velocity.x) > 0.5 || Math.abs(this.velocity.z) > 0.5;
    if (moving && !this.antigravityActive) {
      this.footstepTimer += delta;
      const stepInterval = this.moveState.sprint ? 0.3 : 0.45;
      if (this.footstepTimer > stepInterval) {
        sound.playFootstep();
        this.footstepTimer = 0;
      }
      if (this.flashlightMesh) {
        const bob = Math.sin(this.clock.getElapsedTime() * 10) * 0.015;
        this.flashlightMesh.position.y = -0.26 + bob;
      }
    } else if (this.antigravityActive && this.flashlightMesh) {
      // Gentle zero-gravity weightless hand drift
      this.flashlightMesh.position.y = -0.26 + Math.sin(this.floatBobTimer * 2.8) * 0.025;
      this.flashlightMesh.rotation.z = Math.sin(this.floatBobTimer * 1.4) * 0.04;
    }

    const oldX = this.camera.position.x;
    const oldZ = this.camera.position.z;

    this.controls.moveRight(-this.velocity.x * delta);
    if (this.checkCollisions(this.camera.position.x, oldZ)) {
      this.camera.position.x = oldX;
    }

    this.controls.moveForward(-this.velocity.z * delta);
    if (this.checkCollisions(this.camera.position.x, this.camera.position.z)) {
      this.camera.position.z = oldZ;
    }

    // Altitude Physics & Vertical Levitation Control
    if (this.antigravityActive) {
      if (this.moveState.ascend) {
        this.targetAltitude = Math.min(5.4, this.targetAltitude + 3.8 * delta);
      }
      if (this.moveState.descend) {
        this.targetAltitude = Math.max(1.7, this.targetAltitude - 3.8 * delta);
      }
      this.floatBobTimer += delta;
      const zeroGBob = Math.sin(this.floatBobTimer * 2.2) * 0.09;
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.targetAltitude + zeroGBob, delta * 4.2);
    } else {
      this.targetAltitude = 1.7;
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 1.7, delta * 7.5);
    }

    // Track room based on Z position
    let newLevel = 1;
    if (this.camera.position.z > -8) {
      newLevel = 1;
    } else if (this.camera.position.z > -30) {
      newLevel = 2;
    } else {
      newLevel = 3;
    }

    if (newLevel !== this.state.state.currentLevel) {
      this.state.state.currentLevel = newLevel;
      sound.startAmbience(newLevel);
      sound.playChamberTransition(newLevel);
      this.ui.updateHUDFromState();
      this.state.save();
    }
  }

  checkCollisions(x, z) {
    const R = 0.45;
    for (let c of this.colliders) {
      if (c.hasCollider === false) continue;
      if (c.isDoor && c.doorRef && c.doorRef.isOpen) continue;
      if (c.isPortal && this.architect.exitPortal && this.architect.exitPortal.isOpen) continue;
      // Shadow Chasm check: if player is flying above 2.1m with Antigravity, glide cleanly over!
      if (c.isChasm) {
        if (this.antigravityActive && this.camera.position.y >= 2.1) {
          continue; // Effortlessly glides over the shadow chasm
        }
      }
      if (x + R > c.minX && x - R < c.maxX && z + R > c.minZ && z - R < c.maxZ) {
        if (c.isChasm) {
          this.showBannerPopup("SHADOW ABYSS BLOCKED!", "The void consumes mortal steps! Press [G] to float across in Antigravity!");
          sound.playStoneLocked();
        }
        return true;
      }
    }
    return false;
  }

  updateInteractionPrompt() {
    const promptEl = document.getElementById('prompt-hint');
    if (!promptEl) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = raycaster.intersectObjects(this.interactables, true);

    if (intersects.length > 0 && intersects[0].distance < 4.8) {
      let obj = intersects[0].object;
      while (obj && !obj.userData.type && obj.parent) obj = obj.parent;
      if (obj && obj.userData) {
        let text = obj.userData.prompt;
        const type = obj.userData.type;

        if (type === 'archive_cabinet') {
          if (this.state.hasKey('libraryKey')) {
            text = "Ornate Archive Cabinet (Empty - Key 1 Acquired)";
          } else if (this.state.state.puzzles.libraryCabinetUnlocked) {
            text = "[E] Take Whispering Key (Antique Brass Key Ⅰ)";
          } else {
            text = "[E] Ornate Archive Cabinet (Locked — Solve 3 Book Pedestals)";
          }
        } else if (type === 'armillary_vault') {
          if (this.state.hasKey('observatoryKey')) {
            text = "Armillary Vault (Empty - Key 2 Acquired)";
          } else if (this.state.state.puzzles.observatoryAligned) {
            text = "[E] Take Astral Key (Silver Observatory Key Ⅱ)";
          } else {
            text = "[E] Armillary Vault (Sealed — Align Mirrors & Laser to Astral Sensor)";
          }
        } else if (type === 'temple_altar') {
          if (this.state.hasKey('templeKey')) {
            text = "Ceremonial Altar (Empty - Key 3 Acquired)";
          } else if (this.state.state.puzzles.templeBalanced) {
            text = "[E] Take Ancient Key (Obsidian Runic Key Ⅲ)";
          } else {
            text = "[E] Ceremonial Altar (Sealed — Balance Sun & Moon Flames to 50%)";
          }
        } else if (type === 'final_portal') {
          if (this.state.hasAllKeys()) {
            text = "[E] Place 3 Ancient Keys & Open Master Portal";
          } else {
            const count = this.state.getKeyCount();
            text = `Master Portal Sealed (${count}/3 Keys Collected — Requires All 3 Keys)`;
          }
        } else if (type === 'vault_door') {
          const dRef = obj.userData.doorRef;
          const reqKey = obj.userData.requiredKey;
          const hasKey = reqKey ? this.state.hasKey(reqKey) : false;
          if (dRef && dRef.isOpen) {
            text = `${obj.userData.label} [Open — Walk Through]`;
          } else if (hasKey || (reqKey === 'templeKey' && this.state.hasAllKeys())) {
            text = `[E] Unlock ${obj.userData.label}`;
          } else {
            text = `${obj.userData.label} (Sealed — Solve Chamber Puzzle to Unlock)`;
          }
        }

        if (text) {
          promptEl.innerText = text;
          promptEl.style.display = 'block';
          return;
        }
      }
    }
    promptEl.style.display = 'none';
  }

  updateDoors(delta) {
    Object.values(this.doors).forEach(d => {
      if (d.currentOffset < d.targetOffset) {
        d.currentOffset = Math.min(d.currentOffset + delta * 2.8, d.targetOffset);
        d.leftPanel.position.x = -d.width / 4 - d.currentOffset;
        d.rightPanel.position.x = d.width / 4 + d.currentOffset;
      }
    });
  }
}
