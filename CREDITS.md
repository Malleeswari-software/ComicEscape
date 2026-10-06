# CREDITS & ASSET LICENSING

### Comic Escape: Shadows of the Forgotten
**Submission for The Escape Protocol / Browser Game Jam 2026**

---

## 1. Development Team
- **Thadikonda Malleeswari (Chinnu)**: Solo Developer, Game Designer, Creative Director, Gameplay Programmer, and Puzzle Architect.

---

## 2. Third-Party Software & Open-Source Libraries

### Three.js (v0.186.1)
- **Role**: 3D WebGL Rendering Engine, Scene Graph, Lighting, and Materials.
- **Author**: Ricardo Cabello (Mr.doob) and the Three.js Authors.
- **Source**: [https://github.com/mrdoob/three.js](https://github.com/mrdoob/three.js) / [https://threejs.org](https://threejs.org)
- **License**: MIT License ([https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT))
- *Copyright © 2010-2026 Three.js Authors.*

### PointerLockControls Addon
- **Role**: First-person camera navigation and mouse-look control.
- **Author**: Three.js Authors.
- **Source**: [https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js)
- **License**: MIT License ([https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT))

### esbuild (v0.25+)
- **Role**: Build tool and JavaScript module bundler (development build dependency).
- **Author**: Evan Wallace.
- **Source**: [https://github.com/evanw/esbuild](https://github.com/evanw/esbuild)
- **License**: MIT License ([https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT))

---

## 3. Typography & Fonts

All fonts utilized in the game interface, HUD, dialogue boxes, and menus are open-source and served via Google Fonts:

### Cinzel
- **Designer**: Natanael Gama
- **Source**: [https://fonts.google.com/specimen/Cinzel](https://fonts.google.com/specimen/Cinzel)
- **License**: SIL Open Font License, Version 1.1 ([http://scripts.sil.org/OFL](http://scripts.sil.org/OFL))

### Outfit
- **Designer**: Onsen Type
- **Source**: [https://fonts.google.com/specimen/Outfit](https://fonts.google.com/specimen/Outfit)
- **License**: SIL Open Font License, Version 1.1 ([http://scripts.sil.org/OFL](http://scripts.sil.org/OFL))

### Space Mono
- **Designer**: Colophon Foundry
- **Source**: [https://fonts.google.com/specimen/Space+Mono](https://fonts.google.com/specimen/Space+Mono)
- **License**: SIL Open Font License, Version 1.1 ([http://scripts.sil.org/OFL](http://scripts.sil.org/OFL))

### Bangers
- **Designer**: Vernon Adams
- **Source**: [https://fonts.google.com/specimen/Bangers](https://fonts.google.com/specimen/Bangers)
- **License**: SIL Open Font License, Version 1.1 ([http://scripts.sil.org/OFL](http://scripts.sil.org/OFL))

---

## 4. Audio & Sound Design
- **100% Procedural Web Audio API Engine (`js/audio.js`)**:
  - All music, ambient atmospheric drones, stone grinding kinetics, wall cracking fractures, key pickup chimes, Tibetan singing bowl resonances (432Hz / 528Hz), and victory themes are synthesized **100% procedurally in code** using native browser Web Audio oscillators, biquad filters, and custom white-noise buffers.
  - Zero external MP3, WAV, or pre-recorded third-party audio files are used in this project.
  - Author: Original procedural synthesis code.

---

## 5. 3D Models & Geometry
- **100% Procedural Three.js Meshes (`js/world.js`, `js/escapeGame.js`)**:
  - The Library, Celestial Observatory, Temple of Living Shadows, North Portal, ancient lecterns, optical prisms, fire braziers, ceremonial altar, and multi-spectral flashlight are procedurally assembled from Three.js geometric primitives (`BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, `TorusGeometry`, `PlaneGeometry`).
  - Zero third-party 3D model files (`.gltf`, `.glb`, `.obj`, `.fbx`) are used.

---

## 6. 2D Art, Textures & Cutscenes

### Developer & AI-Assisted Illustrations:
- **Character Concept Art (`assets/characters.png`, `assets/characters_jungle.jpg`)**: Concept illustrations representing explorers Maya and Leo, provided by the developer.
- **Character Cutouts & HUD Badges**: Cropped, masked, feathered, and framed programmatically via custom Python PIL scripts.
- **Comic Chapter Covers & Cutscenes (`comic_library.jpg`, `comic_observatory.jpg`, `comic_temple.jpg`, `cutscene_door_open.jpg`, `cutscene_key_insert.jpg`, `victory_sunrise.jpg`, `keys_art.jpg`)**: Created with AI-assisted text-to-image generators (Google Imagen / DeepMind in Antigravity) to establish the vintage comic and cinematic aesthetic.
- **Procedural Canvas Textures (`js/comicTextures.js`)**: Halftone dot-matrix overlays, comic speech bubbles, and onomatopoeia sound bursts generated procedurally at runtime via the HTML5 Canvas 2D API.

---

## 7. AI Tool Disclosure (Game Jam Rule B)

In compliance with Game Jam Rule B (AI Disclosure and Originality):
- **Code & Logic Assistance**: Antigravity IDE powered by Google Gemini LLM was used for pair-programming, refactoring, procedural audio algorithms, and physics math calculations.
- **Art Generation**: Google Imagen / DeepMind AI generation in Antigravity was used for comic dossier covers and cinematic story cutscene panels.
- **Story, Narrative & Design**: The overarching story (*The Decoy Key Conspiracy*), chamber progression, puzzle rules (Falcon-Serpent-Wolf sigils, laser optical refraction, Sol/Luna shadow equilibrium), and creative direction were designed, curated, and integrated by the developer.

---

## 8. Third-Party Asset Restriction Confirmation
- **No Paid Assets**: No assets from the Unity Asset Store, Unreal Engine Marketplace, Fab, paid itch.io packs, or commercial stores were purchased or used.
- All code and font assets are free and open source under permissive MIT or SIL Open Font licenses.
