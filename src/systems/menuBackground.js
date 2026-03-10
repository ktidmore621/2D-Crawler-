import {
  MENU_SKY_COLOR_TOP,
  MENU_SKY_COLOR_MID,
  MENU_AURORA_COLOR,
  MENU_GRASS_COLOR,
  MENU_PATH_COLOR,
  MENU_PATH_WIDTH,
  MENU_TREE_COLOR,
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

// ── Stars ──────────────────────────────────────────

function createStars(w, skyHeight) {
  const stars = [];
  for (let i = 0; i < MENU_STAR_COUNT; i++) {
    stars.push({
      x: rand(10, w - 10),
      y: rand(10, skyHeight - 20),
      size: rand(1, 2.5),
      phase: rand(0, Math.PI * 2),
      speed: rand(MENU_STAR_TWINKLE_SPEED * 0.5, MENU_STAR_TWINKLE_SPEED * 1.5),
    });
  }
  return stars;
}

// ── Trees ──────────────────────────────────────────

function createTrees(w, horizonY, groundBottom) {
  const trees = [];
  const treePositions = [
    // Left side trees
    { x: 30, height: rand(100, 140) },
    { x: 70, height: rand(80, 120) },
    { x: 110, height: rand(110, 150) },
    { x: 50, height: rand(60, 90) },
    // Right side trees
    { x: w - 30, height: rand(100, 140) },
    { x: w - 70, height: rand(80, 120) },
    { x: w - 110, height: rand(110, 150) },
    { x: w - 50, height: rand(60, 90) },
  ];

  for (const t of treePositions) {
    const baseY = rand(horizonY + 10, horizonY + 60);
    trees.push({
      x: t.x,
      baseY,
      height: t.height,
      trunkWidth: rand(8, 14),
      canopyWidth: rand(30, 50),
    });
  }
  return trees;
}

// ── Embers ─────────────────────────────────────────

function createEmber(fireX, fireY) {
  return {
    x: fireX + rand(-EMBER_SPREAD * 0.3, EMBER_SPREAD * 0.3),
    y: fireY + rand(-10, 5),
    size: rand(EMBER_MIN_SIZE, EMBER_MAX_SIZE),
    speed: rand(EMBER_MIN_SPEED, EMBER_MAX_SPEED),
    alpha: rand(0.5, 1.0),
    color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
    phase: rand(0, Math.PI * 2),
    driftFreq: rand(0.5, 2.0),
    driftAmp: rand(10, EMBER_SPREAD),
    life: rand(0, 1), // 0–1 normalized lifetime progress
    maxLife: rand(1.5, 4.0), // seconds
  };
}

// ── State Creation ─────────────────────────────────

export function createMenuBackgroundState(w, h) {
  const horizonY = h * 0.35;
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
    trees: createTrees(w, horizonY, h),
    embers,
  };
}

// ── Update ─────────────────────────────────────────

export function updateMenuBackground(state, w, h, elapsed, deltaSeconds) {
  const fireX = w * FIRE_BASE_X_RATIO;
  const fireY = h * FIRE_BASE_Y_RATIO;
  state.fireX = fireX;
  state.fireY = fireY;

  // Update embers
  for (let i = 0; i < state.embers.length; i++) {
    const e = state.embers[i];
    e.y -= e.speed * deltaSeconds;
    e.x += Math.sin(elapsed * e.driftFreq + e.phase) * e.driftAmp * deltaSeconds;
    e.life += deltaSeconds / e.maxLife;

    // Fade out as lifetime progresses
    e.alpha = Math.max(0, 1 - e.life) * 0.8;

    if (e.life >= 1 || e.y < state.horizonY - 30) {
      state.embers[i] = createEmber(fireX, fireY);
    }
  }
}

// ── Drawing ────────────────────────────────────────

export function drawMenuBackground(gfx, state, w, h, elapsed) {
  gfx.clear();

  const { horizonY, fireX, fireY, stars, trees, embers } = state;

  // ── Sky gradient (banded approach) ──
  const skyBands = 12;
  const bandH = horizonY / skyBands;
  for (let i = 0; i < skyBands; i++) {
    const t = i / skyBands;
    const r = lerpChannel((MENU_SKY_COLOR_TOP >> 16) & 0xff, (MENU_SKY_COLOR_MID >> 16) & 0xff, t);
    const g = lerpChannel((MENU_SKY_COLOR_TOP >> 8) & 0xff, (MENU_SKY_COLOR_MID >> 8) & 0xff, t);
    const b = lerpChannel(MENU_SKY_COLOR_TOP & 0xff, MENU_SKY_COLOR_MID & 0xff, t);
    const color = (r << 16) | (g << 8) | b;
    gfx.rect(0, i * bandH, w, bandH + 1).fill({ color });
  }

  // ── Aurora glow near horizon ──
  for (let i = 0; i < 5; i++) {
    const auroraY = horizonY - 40 + i * 8;
    const alpha = (0.12 - i * 0.02) * (0.7 + 0.3 * Math.sin(elapsed * 0.5 + i));
    gfx.rect(0, auroraY, w, 12).fill({ color: MENU_AURORA_COLOR, alpha: Math.max(0, alpha) });
  }

  // Soft aurora arc
  const auroraWaveAlpha = 0.06 + 0.03 * Math.sin(elapsed * 0.3);
  gfx.ellipse(w / 2, horizonY, w * 0.7, 30)
    .fill({ color: MENU_AURORA_COLOR, alpha: auroraWaveAlpha });

  // ── Stars (cross-shaped +) ──
  for (const star of stars) {
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(elapsed * star.speed + star.phase));
    const s = star.size;
    // Horizontal bar
    gfx.rect(star.x - s, star.y - s * 0.3, s * 2, s * 0.6)
      .fill({ color: MENU_STAR_COLOR, alpha: twinkle });
    // Vertical bar
    gfx.rect(star.x - s * 0.3, star.y - s, s * 0.6, s * 2)
      .fill({ color: MENU_STAR_COLOR, alpha: twinkle });
  }

  // ── Ground (grass) ──
  gfx.rect(0, horizonY, w, h - horizonY).fill({ color: MENU_GRASS_COLOR });

  // Slight grass color variation
  for (let i = 0; i < 8; i++) {
    const stripY = horizonY + i * ((h - horizonY) / 8);
    const stripAlpha = 0.03 + (i % 2) * 0.03;
    gfx.rect(0, stripY, w, (h - horizonY) / 8)
      .fill({ color: 0x0a2a0a, alpha: stripAlpha });
  }

  // ── Dirt path (T-shape) ──
  const pathW = MENU_PATH_WIDTH;
  const cx = w / 2;

  // Vertical path (center, from horizon down)
  gfx.rect(cx - pathW / 2, horizonY, pathW, h - horizonY)
    .fill({ color: MENU_PATH_COLOR });

  // Horizontal path (cross bar)
  const crossY = horizonY + (h - horizonY) * 0.35;
  gfx.rect(cx - w * 0.3, crossY - pathW / 2, w * 0.6, pathW)
    .fill({ color: MENU_PATH_COLOR });

  // Path edge darkening
  const edgeDark = 0x704018;
  const edgeW = 4;
  // Vertical path edges
  gfx.rect(cx - pathW / 2, horizonY, edgeW, h - horizonY)
    .fill({ color: edgeDark, alpha: 0.4 });
  gfx.rect(cx + pathW / 2 - edgeW, horizonY, edgeW, h - horizonY)
    .fill({ color: edgeDark, alpha: 0.4 });
  // Horizontal path edges
  gfx.rect(cx - w * 0.3, crossY - pathW / 2, w * 0.6, edgeW)
    .fill({ color: edgeDark, alpha: 0.4 });
  gfx.rect(cx - w * 0.3, crossY + pathW / 2 - edgeW, w * 0.6, edgeW)
    .fill({ color: edgeDark, alpha: 0.4 });

  // Path texture (small dots)
  for (let i = 0; i < 40; i++) {
    const px = cx + rand(-pathW / 2 + 4, pathW / 2 - 4);
    const py = rand(horizonY + 5, h - 5);
    gfx.circle(px, py, rand(1, 2)).fill({ color: 0x8a4e1e, alpha: 0.3 });
  }
  for (let i = 0; i < 30; i++) {
    const px = rand(cx - w * 0.3 + 5, cx + w * 0.3 - 5);
    const py = crossY + rand(-pathW / 2 + 4, pathW / 2 - 4);
    gfx.circle(px, py, rand(1, 2)).fill({ color: 0x8a4e1e, alpha: 0.3 });
  }

  // ── Trees (silhouettes) ──
  for (const tree of trees) {
    // Trunk
    gfx.rect(tree.x - tree.trunkWidth / 2, tree.baseY - tree.height * 0.4, tree.trunkWidth, tree.height * 0.5)
      .fill({ color: MENU_TREE_COLOR });
    // Canopy (triangle)
    const topY = tree.baseY - tree.height;
    const cw = tree.canopyWidth;
    gfx.poly([
      tree.x, topY,
      tree.x - cw / 2, tree.baseY - tree.height * 0.2,
      tree.x + cw / 2, tree.baseY - tree.height * 0.2,
    ]).fill({ color: MENU_TREE_COLOR });
    // Second canopy layer (broader, lower)
    gfx.poly([
      tree.x, topY + tree.height * 0.15,
      tree.x - cw * 0.7, tree.baseY - tree.height * 0.05,
      tree.x + cw * 0.7, tree.baseY - tree.height * 0.05,
    ]).fill({ color: MENU_TREE_COLOR });
  }

  // ── Fire glow on ground ──
  const glowPulse = 0.6 + 0.4 * Math.sin(elapsed * FIRE_PULSE_SPEED * 0.7);
  for (let ring = 5; ring >= 0; ring--) {
    const ringR = FIRE_GLOW_RADIUS * (1 - ring * 0.12) * glowPulse;
    const alpha = 0.04 * (ring + 1) * glowPulse;
    gfx.ellipse(fireX, fireY + 8, ringR, ringR * 0.35)
      .fill({ color: FIRE_GLOW_COLOR, alpha: Math.min(alpha, 0.25) });
  }
  // Warm orange inner glow
  gfx.ellipse(fireX, fireY + 8, FIRE_GLOW_RADIUS * 0.3 * glowPulse, FIRE_GLOW_RADIUS * 0.12 * glowPulse)
    .fill({ color: 0x6b5a2a, alpha: 0.15 * glowPulse });

  // ── Green fire (layered flame shapes) ──
  drawFire(gfx, fireX, fireY, elapsed);

  // ── Embers ──
  for (const e of embers) {
    if (e.alpha > 0.01) {
      gfx.circle(e.x, e.y, e.size).fill({ color: e.color, alpha: e.alpha });
    }
  }
}

// ── Fire Drawing ───────────────────────────────────

function drawFire(gfx, fx, fy, elapsed) {
  const pulse = Math.sin(elapsed * FIRE_PULSE_SPEED);
  const pulse2 = Math.sin(elapsed * FIRE_PULSE_SPEED * 1.3 + 1);
  const pulse3 = Math.sin(elapsed * FIRE_PULSE_SPEED * 0.7 + 2);

  const hw = FIRE_WIDTH / 2;
  const fh = FIRE_HEIGHT;

  // Outer flame (darkest green)
  const outerSway = pulse * 6;
  gfx.poly([
    fx + outerSway, fy - fh * (0.9 + pulse * 0.1),
    fx - hw * 1.2, fy + 5,
    fx + hw * 1.2, fy + 5,
  ]).fill({ color: FIRE_COLORS[0], alpha: 0.6 });

  // Second layer
  const sway2 = pulse2 * 4;
  gfx.poly([
    fx + sway2, fy - fh * (0.75 + pulse2 * 0.08),
    fx - hw * 0.95, fy + 3,
    fx + hw * 0.95, fy + 3,
  ]).fill({ color: FIRE_COLORS[1], alpha: 0.55 });

  // Third layer
  const sway3 = pulse3 * 3;
  gfx.poly([
    fx + sway3, fy - fh * (0.6 + pulse3 * 0.06),
    fx - hw * 0.7, fy + 2,
    fx + hw * 0.7, fy + 2,
  ]).fill({ color: FIRE_COLORS[2], alpha: 0.5 });

  // Inner bright flame
  gfx.poly([
    fx + pulse * 2, fy - fh * (0.45 + pulse * 0.05),
    fx - hw * 0.45, fy + 1,
    fx + hw * 0.45, fy + 1,
  ]).fill({ color: FIRE_COLORS[3], alpha: 0.6 });

  // Core (white-green)
  gfx.poly([
    fx + pulse2 * 1.5, fy - fh * (0.3 + pulse2 * 0.03),
    fx - hw * 0.2, fy,
    fx + hw * 0.2, fy,
  ]).fill({ color: FIRE_COLORS[4], alpha: 0.5 });

  // Small side flame (left)
  const leftFlameH = fh * (0.3 + pulse3 * 0.08);
  gfx.poly([
    fx - hw * 0.6 + pulse3 * 3, fy - leftFlameH,
    fx - hw * 1.0, fy + 3,
    fx - hw * 0.3, fy + 3,
  ]).fill({ color: FIRE_COLORS[1], alpha: 0.35 });

  // Small side flame (right)
  const rightFlameH = fh * (0.25 + pulse * 0.07);
  gfx.poly([
    fx + hw * 0.6 - pulse * 3, fy - rightFlameH,
    fx + hw * 0.3, fy + 3,
    fx + hw * 1.0, fy + 3,
  ]).fill({ color: FIRE_COLORS[1], alpha: 0.35 });

  // Fire base glow (bright spot at base)
  gfx.ellipse(fx, fy + 2, hw * 0.8, 6)
    .fill({ color: FIRE_COLORS[3], alpha: 0.3 + pulse * 0.1 });
}

// ── Helpers ────────────────────────────────────────

function lerpChannel(a, b, t) {
  return Math.round(a + (b - a) * t);
}
