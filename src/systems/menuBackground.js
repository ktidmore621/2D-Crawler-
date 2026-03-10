import {
  MENU_SKY_COLOR_TOP,
  MENU_SKY_COLOR_MID,
  MENU_AURORA_COLOR,
  MENU_AURORA_COLOR_2,
  MENU_GRASS_COLOR,
  MENU_GRASS_COLOR_LIGHT,
  MENU_PATH_COLOR,
  MENU_PATH_COLOR_DARK,
  MENU_PATH_WIDTH,
  MENU_TREE_DARK,
  MENU_TREE_MID,
  MENU_TREE_TRUNK,
  MENU_MOUNTAIN_FAR,
  MENU_MOUNTAIN_NEAR,
  MENU_STAR_COUNT,
  MENU_STAR_COLOR,
  MENU_STAR_TWINKLE_SPEED,
  FIRE_BASE_X_RATIO,
  FIRE_BASE_Y_RATIO,
  FIRE_WIDTH,
  FIRE_HEIGHT,
  FIRE_PULSE_SPEED,
  FIRE_COLORS,
  FIRE_GLOW_COLOR,
  FIRE_GLOW_RADIUS,
  FIRE_RING_COLOR,
  FIRE_RING_COUNT,
  EMBER_COUNT,
  EMBER_MIN_SIZE,
  EMBER_MAX_SIZE,
  EMBER_MIN_SPEED,
  EMBER_MAX_SPEED,
  EMBER_SPREAD,
  EMBER_COLORS,
} from '../utils/constants.js';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function lerpColor(c1, c2, t) {
  const r = Math.round(((c1 >> 16) & 0xff) + (((c2 >> 16) & 0xff) - ((c1 >> 16) & 0xff)) * t);
  const g = Math.round(((c1 >> 8) & 0xff) + (((c2 >> 8) & 0xff) - ((c1 >> 8) & 0xff)) * t);
  const b = Math.round((c1 & 0xff) + ((c2 & 0xff) - (c1 & 0xff)) * t);
  return (r << 16) | (g << 8) | b;
}

// ── Stars ──────────────────────────────────────────

function createStars(w, skyHeight) {
  const stars = [];
  for (let i = 0; i < MENU_STAR_COUNT; i++) {
    stars.push({
      x: rand(20, w - 20),
      y: rand(15, skyHeight - 30),
      size: rand(2, 5),
      phase: rand(0, Math.PI * 2),
      speed: rand(MENU_STAR_TWINKLE_SPEED * 0.5, MENU_STAR_TWINKLE_SPEED * 1.5),
      brightness: rand(0.5, 1.0),
    });
  }
  return stars;
}

// ── Mountains ──────────────────────────────────────

function createMountains(w, horizonY) {
  const farPeaks = [];
  const nearPeaks = [];

  // Far mountain range (taller, bluer)
  let x = -40;
  while (x < w + 40) {
    const peakH = rand(60, 110);
    const peakW = rand(80, 160);
    farPeaks.push({ x, peakH, peakW });
    x += rand(50, 120);
  }

  // Near mountain range (shorter, greener)
  x = -30;
  while (x < w + 30) {
    const peakH = rand(30, 70);
    const peakW = rand(60, 130);
    nearPeaks.push({ x, peakH, peakW });
    x += rand(40, 100);
  }

  return { farPeaks, nearPeaks };
}

// ── Trees ──────────────────────────────────────────

function createTrees(w, horizonY, h) {
  const trees = [];

  // Helper to add a tree cluster
  function addTree(x, baseY, type) {
    trees.push({
      x,
      baseY,
      type, // 'bush', 'pine', 'round'
      size: rand(0.7, 1.3),
      width: rand(28, 50),
      height: rand(40, 80),
    });
  }

  // Left side trees (scattered)
  addTree(25, horizonY + rand(20, 60), 'round');
  addTree(55, horizonY + rand(40, 80), 'bush');
  addTree(90, horizonY + rand(10, 40), 'pine');
  addTree(40, horizonY + rand(70, 120), 'bush');
  addTree(75, horizonY + rand(100, 160), 'round');
  addTree(20, horizonY + rand(130, 180), 'bush');
  addTree(110, horizonY + rand(60, 100), 'round');

  // Right side trees (scattered)
  addTree(w - 25, horizonY + rand(20, 60), 'round');
  addTree(w - 55, horizonY + rand(40, 80), 'bush');
  addTree(w - 90, horizonY + rand(10, 40), 'pine');
  addTree(w - 40, horizonY + rand(70, 120), 'bush');
  addTree(w - 75, horizonY + rand(100, 160), 'round');
  addTree(w - 20, horizonY + rand(130, 180), 'bush');
  addTree(w - 110, horizonY + rand(60, 100), 'round');

  // Some middle-ground trees (avoid the center path area)
  addTree(160, horizonY + rand(30, 70), 'pine');
  addTree(w - 160, horizonY + rand(30, 70), 'pine');
  addTree(180, horizonY + rand(100, 150), 'bush');
  addTree(w - 180, horizonY + rand(100, 150), 'bush');

  // Sort by baseY so further trees render behind closer ones
  trees.sort((a, b) => a.baseY - b.baseY);

  return trees;
}

// ── Grass patches (random texture) ─────────────────

function createGrassPatches(w, horizonY, h) {
  const patches = [];
  for (let i = 0; i < 80; i++) {
    patches.push({
      x: rand(0, w),
      y: rand(horizonY + 5, h),
      w: rand(8, 30),
      h: rand(4, 12),
      color: Math.random() > 0.5 ? MENU_GRASS_COLOR_LIGHT : 0x2e6e2e,
      alpha: rand(0.15, 0.35),
    });
  }
  return patches;
}

// ── Embers ─────────────────────────────────────────

function createEmber(fireX, fireY) {
  return {
    x: fireX + rand(-EMBER_SPREAD * 0.3, EMBER_SPREAD * 0.3),
    y: fireY + rand(-15, 5),
    size: rand(EMBER_MIN_SIZE, EMBER_MAX_SIZE),
    speed: rand(EMBER_MIN_SPEED, EMBER_MAX_SPEED),
    alpha: rand(0.6, 1.0),
    color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
    phase: rand(0, Math.PI * 2),
    driftFreq: rand(0.5, 2.0),
    driftAmp: rand(8, EMBER_SPREAD * 0.5),
    life: rand(0, 1),
    maxLife: rand(1.5, 3.5),
  };
}

// ── State Creation ─────────────────────────────────

export function createMenuBackgroundState(w, h) {
  const horizonY = h * 0.38;
  const fireX = w * FIRE_BASE_X_RATIO;
  const fireY = h * FIRE_BASE_Y_RATIO;

  const embers = [];
  for (let i = 0; i < EMBER_COUNT; i++) {
    embers.push(createEmber(fireX, fireY));
  }

  return {
    horizonY,
    fireX,
    fireY,
    stars: createStars(w, horizonY),
    mountains: createMountains(w, horizonY),
    trees: createTrees(w, horizonY, h),
    grassPatches: createGrassPatches(w, horizonY, h),
    embers,
  };
}

// ── Update ─────────────────────────────────────────

export function updateMenuBackground(state, w, h, elapsed, deltaSeconds) {
  const fireX = w * FIRE_BASE_X_RATIO;
  const fireY = h * FIRE_BASE_Y_RATIO;
  state.fireX = fireX;
  state.fireY = fireY;

  for (let i = 0; i < state.embers.length; i++) {
    const e = state.embers[i];
    e.y -= e.speed * deltaSeconds;
    e.x += Math.sin(elapsed * e.driftFreq + e.phase) * e.driftAmp * deltaSeconds;
    e.life += deltaSeconds / e.maxLife;
    e.alpha = Math.max(0, (1 - e.life) * 0.9);

    if (e.life >= 1 || e.y < state.horizonY - 40) {
      state.embers[i] = createEmber(fireX, fireY);
    }
  }
}

// ── Drawing ────────────────────────────────────────

export function drawMenuBackground(gfx, state, w, h, elapsed) {
  gfx.clear();

  const { horizonY, fireX, fireY, stars, mountains, trees, grassPatches, embers } = state;

  // ── Sky gradient ──
  const skyBands = 16;
  const bandH = horizonY / skyBands;
  for (let i = 0; i < skyBands; i++) {
    const t = i / skyBands;
    const color = lerpColor(MENU_SKY_COLOR_TOP, MENU_SKY_COLOR_MID, t);
    gfx.rect(0, i * bandH, w, bandH + 1).fill({ color });
  }

  // ── Aurora glow (wavy, prominent) ──
  drawAurora(gfx, w, horizonY, elapsed);

  // ── Stars (four-pointed) ──
  for (const star of stars) {
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(elapsed * star.speed + star.phase));
    const alpha = twinkle * star.brightness;
    drawFourPointStar(gfx, star.x, star.y, star.size, MENU_STAR_COLOR, alpha);
  }

  // ── Far mountains ──
  for (const peak of mountains.farPeaks) {
    const py = horizonY;
    gfx.poly([
      peak.x, py,
      peak.x + peak.peakW * 0.5, py - peak.peakH,
      peak.x + peak.peakW, py,
    ]).fill({ color: MENU_MOUNTAIN_FAR });
  }

  // ── Near mountains ──
  for (const peak of mountains.nearPeaks) {
    const py = horizonY;
    gfx.poly([
      peak.x, py,
      peak.x + peak.peakW * 0.5, py - peak.peakH,
      peak.x + peak.peakW, py,
    ]).fill({ color: MENU_MOUNTAIN_NEAR });
  }

  // ── Ground (grass base) ──
  gfx.rect(0, horizonY, w, h - horizonY).fill({ color: MENU_GRASS_COLOR });

  // Grass texture patches
  for (const patch of grassPatches) {
    gfx.rect(patch.x, patch.y, patch.w, patch.h)
      .fill({ color: patch.color, alpha: patch.alpha });
  }

  // ── Dirt path (organic cross shape) ──
  drawDirtPath(gfx, w, h, horizonY, fireX, fireY);

  // ── Fire ground glow ──
  drawFireGlow(gfx, fireX, fireY, elapsed);

  // ── Magic circle rings at fire base ──
  drawMagicRings(gfx, fireX, fireY, elapsed);

  // ── Trees (sorted back-to-front) ──
  for (const tree of trees) {
    drawTree(gfx, tree);
  }

  // ── Green fire ──
  drawFire(gfx, fireX, fireY, elapsed);

  // ── Embers ──
  for (const e of embers) {
    if (e.alpha > 0.02) {
      gfx.circle(e.x, e.y, e.size).fill({ color: e.color, alpha: e.alpha });
    }
  }
}

// ── Aurora ─────────────────────────────────────────

function drawAurora(gfx, w, horizonY, elapsed) {
  // Wavy aurora bands near horizon
  const auroraBaseY = horizonY - 20;
  for (let band = 0; band < 6; band++) {
    const bandY = auroraBaseY - band * 14;
    const bandAlpha = (0.08 + band * 0.02) * (0.6 + 0.4 * Math.sin(elapsed * 0.4 + band * 0.8));
    const color = band < 3 ? MENU_AURORA_COLOR : MENU_AURORA_COLOR_2;

    // Draw wavy band using segments
    const segW = 20;
    for (let x = 0; x < w; x += segW) {
      const waveY = Math.sin((x / w) * Math.PI * 3 + elapsed * 0.3 + band * 0.5) * 8;
      const segAlpha = bandAlpha * (0.5 + 0.5 * Math.sin((x / w) * Math.PI));
      gfx.rect(x, bandY + waveY, segW + 1, 10)
        .fill({ color, alpha: Math.max(0, segAlpha) });
    }
  }

  // Big soft aurora glow
  const glowAlpha = 0.06 + 0.03 * Math.sin(elapsed * 0.25);
  gfx.ellipse(w / 2, horizonY - 10, w * 0.6, 50)
    .fill({ color: MENU_AURORA_COLOR, alpha: glowAlpha });
  gfx.ellipse(w * 0.35, horizonY - 15, w * 0.3, 35)
    .fill({ color: MENU_AURORA_COLOR_2, alpha: glowAlpha * 0.7 });
  gfx.ellipse(w * 0.65, horizonY - 15, w * 0.3, 35)
    .fill({ color: MENU_AURORA_COLOR, alpha: glowAlpha * 0.7 });
}

// ── Four-Point Star ────────────────────────────────

function drawFourPointStar(gfx, x, y, size, color, alpha) {
  const inner = size * 0.3;
  // Four diamond points
  gfx.poly([
    x, y - size,          // top
    x + inner, y - inner,
    x + size, y,          // right
    x + inner, y + inner,
    x, y + size,          // bottom
    x - inner, y + inner,
    x - size, y,          // left
    x - inner, y - inner,
  ]).fill({ color, alpha });
}

// ── Dirt Path (organic cross) ──────────────────────

function drawDirtPath(gfx, w, h, horizonY, fireX, fireY) {
  const pw = MENU_PATH_WIDTH;
  const cx = fireX;
  const groundH = h - horizonY;

  // Main vertical path (from horizon down, wider near the fire)
  // Narrower at horizon, wider at bottom
  const topW = pw * 0.6;
  const botW = pw * 1.3;
  const midW = pw * 1.6; // wider at intersection

  // Vertical path polygon (tapered)
  gfx.poly([
    cx - topW / 2, horizonY,
    cx + topW / 2, horizonY,
    cx + midW / 2, fireY - 10,
    cx + botW / 2, h,
    cx - botW / 2, h,
    cx - midW / 2, fireY - 10,
  ]).fill({ color: MENU_PATH_COLOR });

  // Horizontal cross path (wider at center)
  const crossY = fireY + 15;
  const hpw = pw * 0.7;
  const leftX = cx - w * 0.28;
  const rightX = cx + w * 0.28;

  // Left branch
  gfx.poly([
    leftX, crossY - hpw * 0.4,
    cx - midW / 2, crossY - hpw * 0.7,
    cx - midW / 2, crossY + hpw * 0.7,
    leftX, crossY + hpw * 0.4,
  ]).fill({ color: MENU_PATH_COLOR });

  // Right branch
  gfx.poly([
    rightX, crossY - hpw * 0.4,
    cx + midW / 2, crossY - hpw * 0.7,
    cx + midW / 2, crossY + hpw * 0.7,
    rightX, crossY + hpw * 0.4,
  ]).fill({ color: MENU_PATH_COLOR });

  // Wider intersection circle/diamond area
  gfx.ellipse(cx, fireY + 10, midW * 0.7, midW * 0.4)
    .fill({ color: MENU_PATH_COLOR });

  // Path edge shading
  gfx.poly([
    cx - topW / 2 - 2, horizonY,
    cx - topW / 2, horizonY,
    cx - midW / 2, fireY - 10,
    cx - midW / 2 - 3, fireY - 10,
  ]).fill({ color: MENU_PATH_COLOR_DARK, alpha: 0.5 });
  gfx.poly([
    cx + topW / 2 + 2, horizonY,
    cx + topW / 2, horizonY,
    cx + midW / 2, fireY - 10,
    cx + midW / 2 + 3, fireY - 10,
  ]).fill({ color: MENU_PATH_COLOR_DARK, alpha: 0.5 });

  // Dirt texture dots on path
  const seedX = 12345;
  for (let i = 0; i < 60; i++) {
    const t = (i * seedX + 67) % 100 / 100;
    const px = cx + (t - 0.5) * midW * 1.2;
    const py = horizonY + (i / 60) * groundH;
    const dist = Math.abs(px - cx);
    if (dist < midW * 0.7) {
      gfx.circle(px, py, rand(0.5, 2)).fill({ color: MENU_PATH_COLOR_DARK, alpha: 0.25 });
    }
  }
}

// ── Tree Drawing ───────────────────────────────────

function drawTree(gfx, tree) {
  const { x, baseY, type, size, width: tw, height: th } = tree;
  const s = size;

  if (type === 'bush') {
    // Round bushy tree — multiple overlapping circles
    const r = tw * s * 0.5;
    gfx.circle(x, baseY - r * 0.6, r).fill({ color: MENU_TREE_DARK });
    gfx.circle(x - r * 0.5, baseY - r * 0.3, r * 0.8).fill({ color: MENU_TREE_DARK });
    gfx.circle(x + r * 0.5, baseY - r * 0.3, r * 0.8).fill({ color: MENU_TREE_DARK });
    // Highlight
    gfx.circle(x + r * 0.15, baseY - r * 0.8, r * 0.5).fill({ color: MENU_TREE_MID, alpha: 0.5 });
  } else if (type === 'pine') {
    // Conifer/pine — triangle layers
    const trunkW = 6 * s;
    const trunkH = th * s * 0.25;
    gfx.rect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH).fill({ color: MENU_TREE_TRUNK });

    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const layerW = (tw * s * (1 - i * 0.25));
      const layerH = th * s * 0.3;
      const layerY = baseY - trunkH - i * layerH * 0.7;
      gfx.poly([
        x, layerY - layerH,
        x - layerW / 2, layerY,
        x + layerW / 2, layerY,
      ]).fill({ color: i === 0 ? MENU_TREE_DARK : MENU_TREE_MID });
    }
  } else {
    // Round tree — trunk + big circle canopy
    const trunkW = 8 * s;
    const trunkH = th * s * 0.35;
    gfx.rect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH).fill({ color: MENU_TREE_TRUNK });

    const canopyR = tw * s * 0.55;
    const canopyY = baseY - trunkH - canopyR * 0.5;
    gfx.circle(x, canopyY, canopyR).fill({ color: MENU_TREE_DARK });
    // Highlight on upper portion
    gfx.circle(x + canopyR * 0.15, canopyY - canopyR * 0.2, canopyR * 0.6)
      .fill({ color: MENU_TREE_MID, alpha: 0.4 });
  }
}

// ── Fire Ground Glow ───────────────────────────────

function drawFireGlow(gfx, fx, fy, elapsed) {
  const pulse = 0.6 + 0.4 * Math.sin(elapsed * FIRE_PULSE_SPEED * 0.6);

  // Large soft green glow on ground
  for (let ring = 6; ring >= 0; ring--) {
    const r = FIRE_GLOW_RADIUS * (1 - ring * 0.1) * pulse;
    const alpha = 0.03 * (ring + 1) * pulse;
    gfx.ellipse(fx, fy + 12, r, r * 0.3)
      .fill({ color: FIRE_GLOW_COLOR, alpha: Math.min(alpha, 0.2) });
  }

  // Brighter inner glow (more saturated green)
  const innerR = FIRE_GLOW_RADIUS * 0.35 * pulse;
  gfx.ellipse(fx, fy + 10, innerR, innerR * 0.25)
    .fill({ color: 0x44ff44, alpha: 0.12 * pulse });

  // Warm yellowish center glow
  gfx.ellipse(fx, fy + 8, innerR * 0.5, innerR * 0.15)
    .fill({ color: 0xaaff66, alpha: 0.08 * pulse });
}

// ── Magic Circle Rings ─────────────────────────────

function drawMagicRings(gfx, fx, fy, elapsed) {
  const pulse = 0.5 + 0.5 * Math.sin(elapsed * FIRE_PULSE_SPEED * 0.8);

  for (let i = 0; i < FIRE_RING_COUNT; i++) {
    const ringR = 25 + i * 18;
    const alpha = (0.25 - i * 0.07) * pulse;
    const ringY = fy + 8;

    // Elliptical ring (perspective)
    gfx.ellipse(fx, ringY, ringR, ringR * 0.3)
      .stroke({ color: FIRE_RING_COLOR, alpha: Math.max(0.03, alpha), width: 1.5 });
  }

  // Small rotating dots on innermost ring
  const dotCount = 6;
  const dotR = 25;
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2 + elapsed * 1.2;
    const dx = Math.cos(angle) * dotR;
    const dy = Math.sin(angle) * dotR * 0.3;
    const dotAlpha = 0.4 * pulse;
    gfx.circle(fx + dx, fy + 8 + dy, 1.5)
      .fill({ color: FIRE_RING_COLOR, alpha: dotAlpha });
  }
}

// ── Fire Drawing ───────────────────────────────────

function drawFire(gfx, fx, fy, elapsed) {
  const p1 = Math.sin(elapsed * FIRE_PULSE_SPEED);
  const p2 = Math.sin(elapsed * FIRE_PULSE_SPEED * 1.3 + 1);
  const p3 = Math.sin(elapsed * FIRE_PULSE_SPEED * 0.7 + 2.5);
  const p4 = Math.sin(elapsed * FIRE_PULSE_SPEED * 1.7 + 0.5);

  const hw = FIRE_WIDTH / 2;
  const fh = FIRE_HEIGHT;

  // Outermost flame (dark green, wide)
  gfx.poly([
    fx + p1 * 7, fy - fh * (1.0 + p1 * 0.08),
    fx - hw * 1.4, fy + 8,
    fx + hw * 1.4, fy + 8,
  ]).fill({ color: FIRE_COLORS[0], alpha: 0.5 });

  // Second layer
  gfx.poly([
    fx + p2 * 5, fy - fh * (0.85 + p2 * 0.07),
    fx - hw * 1.15, fy + 6,
    fx + hw * 1.15, fy + 6,
  ]).fill({ color: FIRE_COLORS[1], alpha: 0.55 });

  // Third layer
  gfx.poly([
    fx + p3 * 4, fy - fh * (0.7 + p3 * 0.06),
    fx - hw * 0.9, fy + 4,
    fx + hw * 0.9, fy + 4,
  ]).fill({ color: FIRE_COLORS[2], alpha: 0.55 });

  // Fourth layer (bright green)
  gfx.poly([
    fx + p4 * 3, fy - fh * (0.55 + p4 * 0.05),
    fx - hw * 0.65, fy + 3,
    fx + hw * 0.65, fy + 3,
  ]).fill({ color: FIRE_COLORS[3], alpha: 0.6 });

  // Inner bright core
  gfx.poly([
    fx + p1 * 2, fy - fh * (0.4 + p1 * 0.04),
    fx - hw * 0.4, fy + 2,
    fx + hw * 0.4, fy + 2,
  ]).fill({ color: FIRE_COLORS[4], alpha: 0.6 });

  // White-hot center
  gfx.poly([
    fx + p2 * 1.5, fy - fh * (0.25 + p2 * 0.03),
    fx - hw * 0.2, fy + 1,
    fx + hw * 0.2, fy + 1,
  ]).fill({ color: FIRE_COLORS[5], alpha: 0.55 });

  // Left tendril flame
  const leftH = fh * (0.35 + p3 * 0.08);
  gfx.poly([
    fx - hw * 0.5 + p3 * 4, fy - leftH,
    fx - hw * 1.3, fy + 6,
    fx - hw * 0.2, fy + 5,
  ]).fill({ color: FIRE_COLORS[1], alpha: 0.3 });

  // Right tendril flame
  const rightH = fh * (0.3 + p4 * 0.07);
  gfx.poly([
    fx + hw * 0.5 - p4 * 4, fy - rightH,
    fx + hw * 0.2, fy + 5,
    fx + hw * 1.3, fy + 6,
  ]).fill({ color: FIRE_COLORS[1], alpha: 0.3 });

  // Small flicker wisps
  const wispH = fh * (0.15 + p1 * 0.05);
  gfx.poly([
    fx + p3 * 8, fy - fh * 0.7 - wispH,
    fx + p3 * 6 - 4, fy - fh * 0.6,
    fx + p3 * 6 + 4, fy - fh * 0.6,
  ]).fill({ color: FIRE_COLORS[3], alpha: 0.25 });

  // Fire base bright spot
  gfx.ellipse(fx, fy + 4, hw * 0.9, 7)
    .fill({ color: FIRE_COLORS[4], alpha: 0.3 + p1 * 0.1 });
}
