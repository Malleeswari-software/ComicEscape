/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * Procedural & Illustrated Comic Wall & Object Texture Generator
 */
import * as THREE from 'three';

export class ComicTextureGenerator {
  constructor() {
    this.cache = new Map();
    this.textureLoader = new THREE.TextureLoader();
  }

  // Draw halftone pattern onto a canvas context
  drawHalftone(ctx, x, y, w, h, dotSize = 3, spacing = 8, color = 'rgba(0,0,0,0.12)') {
    ctx.save();
    ctx.fillStyle = color;
    for (let py = y; py < y + h; py += spacing) {
      for (let px = x; px < x + w; px += spacing) {
        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Draw comic speech bubble
  drawSpeechBubble(ctx, text, x, y, w, h, tailDirection = 'bottom', speaker = '') {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    const r = 12;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    if (tailDirection === 'bottom') {
      ctx.moveTo(x + w * 0.3, y + h);
      ctx.lineTo(x + w * 0.2, y + h + 22);
      ctx.lineTo(x + w * 0.5, y + h);
    } else {
      ctx.moveTo(x + w * 0.3, y);
      ctx.lineTo(x + w * 0.2, y - 22);
      ctx.lineTo(x + w * 0.5, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Speaker tag
    if (speaker) {
      ctx.fillStyle = '#b91c1c';
      ctx.font = '900 12px "Outfit", sans-serif';
      ctx.fillText(speaker.toUpperCase(), x + 12, y + 8);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px monospace';
    this.wrapText(ctx, text, x + 12, y + (speaker ? 26 : 14), w - 24, 18);
    ctx.restore();
  }

  // Draw onomatopoeia burst
  drawOnomatopoeia(ctx, text, x, y, fontSize = 48, color = '#facc15', strokeColor = '#000000', angle = -0.15) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Burst background star
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const spikes = 10;
    const outerR = fontSize * 1.25;
    const innerR = fontSize * 0.65;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / spikes;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#000000';
    for (let i = 4; i >= 1; i--) {
      ctx.fillText(text, i, i);
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 6;
    ctx.strokeText(text, 0, 0);

    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  // Create high-res comic wall texture with UV emissive map
  createComicWallTexture(wallId, title, panels, uvData, coverImgPath = null) {
    const W = 1024;
    const H = 768;

    // 1. Diffuse canvas
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Default comic page background
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, W, H);

    // Comic Header Banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, 70);
    ctx.fillStyle = '#facc15';
    ctx.font = '900 32px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`COMIC ESCAPE • ${title.toUpperCase()}`, 28, 48);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Space Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`CLASSIFIED DOSSIER [${wallId}]`, W - 28, 45);

    // Panel grid: 2x2
    const panelCols = 2;
    const panelRows = 2;
    const pad = 18;
    const headerH = 75;
    const pW = (W - pad * 3) / panelCols;
    const pH = (H - headerH - pad * 3) / panelRows;

    panels.slice(0, 4).forEach((p, idx) => {
      const col = idx % panelCols;
      const row = Math.floor(idx / panelCols);
      const px = pad + col * (pW + pad);
      const py = headerH + pad + row * (pH + pad);

      ctx.save();
      // Panel frame
      ctx.fillStyle = p.bg || '#ffffff';
      ctx.fillRect(px, py, pW, pH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.strokeRect(px, py, pW, pH);

      // Halftone pattern
      this.drawHalftone(ctx, px, py, pW * 0.45, pH * 0.4, 2, 7, 'rgba(0,0,0,0.06)');

      // Dialogue bubble
      if (p.dialogue) {
        this.drawSpeechBubble(ctx, p.dialogue, px + 14, py + 14, pW - 28, 76, 'bottom', p.speaker || '');
      }

      // Onomatopoeia
      if (p.onomatopoeia) {
        this.drawOnomatopoeia(ctx, p.onomatopoeia, px + pW * 0.72, py + pH * 0.65, 34, p.soundColor || '#facc15');
      }

      // Caption bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 4, py + pH - 28, pW - 8, 24);
      ctx.fillStyle = '#facc15';
      ctx.font = '900 12px "Impact", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.caption || `PANEL ${idx + 1}`, px + 12, py + pH - 12);
      ctx.restore();
    });

    // Heavy comic outer border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);

    // If high-res illustration cover image is provided, draw it into canvas once loaded
    const diffuseTex = new THREE.CanvasTexture(canvas);
    if (coverImgPath) {
      const img = new Image();
      img.onload = () => {
        // Draw image keeping comic border & header
        ctx.drawImage(img, pad, headerH + pad, W - pad * 2, H - headerH - pad * 2);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, W - 10, H - 10);
        diffuseTex.needsUpdate = true;
      };
      img.src = coverImgPath;
    }

    // 2. UV Emissive Canvas (Invisible fluorescent ink)
    const uvCanvas = document.createElement('canvas');
    uvCanvas.width = W;
    uvCanvas.height = H;
    const uctx = uvCanvas.getContext('2d');
    uctx.fillStyle = '#000000';
    uctx.fillRect(0, 0, W, H);

    if (uvData) {
      const color = uvData.color || '#38bdf8';
      uctx.strokeStyle = color;
      uctx.fillStyle = color;

      if (uvData.cipherText) {
        uctx.save();
        uctx.font = '900 36px "Impact", sans-serif';
        uctx.textAlign = 'center';
        uctx.shadowColor = color;
        uctx.shadowBlur = 18;
        uctx.fillText(uvData.cipherText, W / 2, H / 2);

        if (uvData.subText) {
          uctx.font = 'bold 19px "Space Mono", monospace';
          uctx.fillText(uvData.subText, W / 2, H / 2 + 46);
        }
        uctx.restore();
      }

      if (uvData.glyph) {
        uctx.save();
        uctx.font = '48px sans-serif';
        uctx.textAlign = 'center';
        uctx.shadowColor = color;
        uctx.shadowBlur = 20;
        uctx.fillText(uvData.glyph, W / 2, H / 2 - 60);
        uctx.restore();
      }
    }

    const emissiveTex = new THREE.CanvasTexture(uvCanvas);

    return { diffuseTex, emissiveTex, canvas, uvCanvas };
  }

  // Create Book Cover Texture (Falcon, Serpent, Wolf)
  createBookTexture(sigilName, colorHex, symbolGlyph) {
    const W = 512;
    const H = 768;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Leather background
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, W, H);

    // Ornate gold border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    // Book Title
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 28px "Impact", "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText("TOME OF THE", W / 2, 140);
    ctx.font = '900 42px "Impact", "Cinzel", serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(sigilName.toUpperCase(), W / 2, 195);

    // Sigil Symbol
    ctx.font = '110px sans-serif';
    ctx.fillText(symbolGlyph, W / 2, 380);

    // Filigree markings
    ctx.fillStyle = '#fef08a';
    ctx.font = 'italic bold 18px serif';
    ctx.fillText("• ANCIENT ARCHIVE CHRONICLE •", W / 2, 540);

    // UV Emissive map for glowing book sigil
    const uvCanvas = document.createElement('canvas');
    uvCanvas.width = W;
    uvCanvas.height = H;
    const uctx = uvCanvas.getContext('2d');
    uctx.fillStyle = '#000000';
    uctx.fillRect(0, 0, W, H);

    uctx.fillStyle = '#38bdf8';
    uctx.shadowColor = '#38bdf8';
    uctx.shadowBlur = 20;
    uctx.font = '110px sans-serif';
    uctx.textAlign = 'center';
    uctx.fillText(symbolGlyph, W / 2, 380);

    const diffuseTex = new THREE.CanvasTexture(canvas);
    const emissiveTex = new THREE.CanvasTexture(uvCanvas);
    return { diffuseTex, emissiveTex };
  }
}

export const comicGen = new ComicTextureGenerator();
