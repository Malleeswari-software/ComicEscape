import { EscapeGame3D } from './escapeGame.js';

function init() {
  if (!window.game) {
    try {
      console.log("[EscapeGame3D] Initializing engine...");
      window.game = new EscapeGame3D();
      console.log("[EscapeGame3D] Engine initialized successfully!");
    } catch (err) {
      console.error("[EscapeGame3D] Initialization failed:", err);
      const errBox = document.createElement('div');
      errBox.style.cssText = 'position:fixed;top:16px;left:16px;right:16px;padding:16px;background:#ef4444;color:#fff;border-radius:8px;z-index:99999;font-family:monospace;white-space:pre-wrap;box-shadow:0 10px 30px rgba(0,0,0,0.8);';
      errBox.innerText = 'Chamber of Shadows 3D Initialization Error:\n' + (err.stack || err.message || err);
      document.body.appendChild(errBox);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

