/**
 * Tile map rendering system — draws only visible tiles + buffer for performance.
 * Full 3/4 perspective: every object has top face (lightest), front face (mid),
 * shadow side (darkest), and casts shadow to south-east.
 */

import { Graphics } from 'pixi.js';
import {
  WORLD_TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
  TILE_BUFFER,
  TILE_GRASS,
  TILE_DIRT,
  TILE_TREE,
  TILE_BUSH,
  TILE_RUIN_FLOOR,
  TILE_RUIN_WALL,
  TILE_RIVER,
  TILE_ALIEN,
  TILE_BASE_FLOOR,
  GRASS_COLORS,
  DIRT_COLORS,
  RUIN_FLOOR_COLOR,
  RUIN_WALL_COLOR,
  RIVER_COLOR,
  RIVER_EDGE_COLOR,
  ALIEN_BASE_COLOR,
  ALIEN_GLOW_COLOR,
  BASE_FLOOR_COLOR,
} from '../utils/constants.js';

// Pre-compute a random hash for each tile (seeded by position)
function hashTile(r, c) {
  return ((r * 137 + c * 311) & 0xFFFF);
}

/**
 * Create the tile map renderer.
 * Returns an object with a Graphics instance and an update method.
 */
export function createTilemap() {
  const gfx = new Graphics();

  /**
   * Redraw visible tiles.
   * @param {number[][]} worldMap
   * @param {number} camX - camera offset X (negative)
   * @param {number} camY - camera offset Y (negative)
   * @param {number} vpWidth - viewport width
   * @param {number} vpHeight - viewport height
   * @param {number} time - elapsed time for animations
   */
  function render(worldMap, camX, camY, vpWidth, vpHeight, time) {
    gfx.clear();

    // Calculate visible tile range
    const startCol = Math.max(0, Math.floor(-camX / WORLD_TILE_SIZE) - TILE_BUFFER);
    const startRow = Math.max(0, Math.floor(-camY / WORLD_TILE_SIZE) - TILE_BUFFER);
    const endCol = Math.min(WORLD_COLS - 1, Math.floor((-camX + vpWidth) / WORLD_TILE_SIZE) + TILE_BUFFER);
    const endRow = Math.min(WORLD_ROWS - 1, Math.floor((-camY + vpHeight) / WORLD_TILE_SIZE) + TILE_BUFFER);

    // Pass 1: ground tiles
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        const x = c * WORLD_TILE_SIZE;
        const y = r * WORLD_TILE_SIZE;
        const s = WORLD_TILE_SIZE;
        drawTileBase(gfx, tileId, x, y, s, r, c, time);
      }
    }

    // Pass 2: overlays (tree canopies, bushes, alien structures, ruin wall details, base building)
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        const x = c * WORLD_TILE_SIZE;
        const y = r * WORLD_TILE_SIZE;
        const s = WORLD_TILE_SIZE;

        if (tileId === TILE_TREE) {
          drawTreeOverlay(gfx, x, y, s, r, c);
        } else if (tileId === TILE_BUSH) {
          drawBushOverlay(gfx, x, y, s, r, c);
        } else if (tileId === TILE_ALIEN) {
          drawAlienOverlay(gfx, x, y, s, time);
        } else if (tileId === TILE_RUIN_WALL) {
          drawRuinWallDetail(gfx, x, y, s, r, c);
        } else if (tileId === TILE_BASE_FLOOR) {
          drawBaseFloorDetail(gfx, x, y, s, r, c, worldMap);
        }
      }
    }
  }

  return { gfx, render };
}

/* ──────────────── Ground tiles ──────────────── */

function drawTileBase(gfx, tileId, x, y, s, r, c, time) {
  let color;

  switch (tileId) {
    case TILE_GRASS:
      color = GRASS_COLORS[hashTile(r, c) % 3];
      break;
    case TILE_DIRT:
      color = DIRT_COLORS[hashTile(r, c) % 2];
      break;
    case TILE_TREE:
      color = 0x4a7a30; // grass under tree
      break;
    case TILE_BUSH:
      color = GRASS_COLORS[0];
      break;
    case TILE_RUIN_FLOOR:
      color = RUIN_FLOOR_COLOR;
      break;
    case TILE_RUIN_WALL:
      color = RUIN_WALL_COLOR;
      break;
    case TILE_RIVER:
      color = RIVER_COLOR;
      break;
    case TILE_ALIEN:
      color = ALIEN_BASE_COLOR;
      break;
    case TILE_BASE_FLOOR:
      color = BASE_FLOOR_COLOR;
      break;
    default:
      color = GRASS_COLORS[0];
  }

  gfx.rect(x, y, s, s);
  gfx.fill(color);

  // ── Canyon / Dried River — 3/4 depth ──
  if (tileId === TILE_RIVER) {
    // Top edge — ground level lip (lighter, top face of the cliff edge)
    gfx.rect(x, y, s, 4);
    gfx.fill(0x5a4a32);
    // Front face of top edge — visible cliff wall
    gfx.rect(x, y + 4, s, 6);
    gfx.fill(0x4a3a28);

    // Bottom edge — far wall visible in 3/4 (lighter strip suggesting other side)
    gfx.rect(x, y + s - 8, s, 4);
    gfx.fill(0x3a2e20);
    // Far wall highlight
    gfx.rect(x, y + s - 8, s, 2);
    gfx.fill({ color: 0x5a4a32, alpha: 0.4 });

    // Canyon floor darkest at center
    gfx.rect(x, y + 14, s, s - 28);
    gfx.fill(0x2a2010);

    // Crack lines on edges
    const h = hashTile(r, c);
    if (h % 3 === 0) {
      gfx.moveTo(x + 6, y + 3);
      gfx.lineTo(x + 10, y + 12);
      gfx.stroke({ width: 1, color: 0x0a0804, alpha: 0.5 });
    }
    if (h % 4 === 1) {
      gfx.moveTo(x + s - 8, y + 2);
      gfx.lineTo(x + s - 12, y + 14);
      gfx.stroke({ width: 1, color: 0x0a0804, alpha: 0.4 });
    }
  }

  // ── Ruin floor cracks ──
  if (tileId === TILE_RUIN_FLOOR) {
    const h = hashTile(r, c);
    if (h % 3 === 0) {
      gfx.moveTo(x + 8, y + 12);
      gfx.lineTo(x + 20, y + 30);
      gfx.lineTo(x + 15, y + 40);
      gfx.stroke({ width: 1, color: 0x3a3020, alpha: 0.5 });
    }
  }
}

/* ──────────────── Tree overlay — 3 variants with full 3/4 ──────────────── */

function drawTreeOverlay(gfx, x, y, s, r, c) {
  const variant = hashTile(r, c) % 3;
  const cx = x + s / 2;
  const cy = y + s / 2;

  if (variant === 0) {
    drawPineTree(gfx, cx, cy, x, y, s);
  } else if (variant === 1) {
    drawOakTree(gfx, cx, cy, x, y, s);
  } else {
    drawDeadTree(gfx, cx, cy, x, y, s);
  }
}

function drawPineTree(gfx, cx, cy, x, y, s) {
  // Pine tree: base width 52px, total height 72px
  const baseY = cy + 12; // trunk bottom
  const topY = baseY - 72; // tree top

  // Shadow on ground — elongated oval south-east
  gfx.ellipse(cx + 6, baseY + 4, 28, 8);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Trunk visible below bottom layer
  gfx.rect(cx - 4, baseY - 22, 8, 26);
  gfx.fill(0x5a3a1a);
  // Trunk shadow side (right)
  gfx.rect(cx + 1, baseY - 22, 3, 26);
  gfx.fill({ color: 0x3a2010, alpha: 0.5 });

  // Bottom layer — widest (52px wide = 26 each side), 20px tall
  const bw = 26;
  const bh = 20;
  const by = baseY - 16;
  // Left half (lit)
  gfx.moveTo(cx, by - bh);
  gfx.lineTo(cx - bw, by);
  gfx.lineTo(cx, by);
  gfx.closePath();
  gfx.fill(0x3a8a20);
  // Right half (shadow side)
  gfx.moveTo(cx, by - bh);
  gfx.lineTo(cx + bw, by);
  gfx.lineTo(cx, by);
  gfx.closePath();
  gfx.fill(0x2e7018);
  // Top face highlight
  gfx.moveTo(cx - bw + 4, by - 1);
  gfx.lineTo(cx, by - bh);
  gfx.lineTo(cx + bw - 4, by - 1);
  gfx.stroke({ width: 1, color: 0x4a9a28, alpha: 0.6 });

  // Middle layer — 40px wide, 18px tall
  const mw = 20;
  const mh = 18;
  const my = by - 14;
  gfx.moveTo(cx, my - mh);
  gfx.lineTo(cx - mw, my);
  gfx.lineTo(cx, my);
  gfx.closePath();
  gfx.fill(0x4a9a28);
  gfx.moveTo(cx, my - mh);
  gfx.lineTo(cx + mw, my);
  gfx.lineTo(cx, my);
  gfx.closePath();
  gfx.fill(0x3a8a20);

  // Top layer — smallest, lightest, 24px wide, 16px tall
  const tw = 12;
  const th = 16;
  const ty = my - 12;
  gfx.moveTo(cx, ty - th);
  gfx.lineTo(cx - tw, ty);
  gfx.lineTo(cx, ty);
  gfx.closePath();
  gfx.fill(0x4a9a28);
  gfx.moveTo(cx, ty - th);
  gfx.lineTo(cx + tw, ty);
  gfx.lineTo(cx, ty);
  gfx.closePath();
  gfx.fill(0x3a8a20);
}

function drawOakTree(gfx, cx, cy, x, y, s) {
  // Oak tree: canopy 64px wide × 48px tall, total height 70px
  const baseY = cy + 12; // trunk bottom
  const canopyCY = baseY - 44; // canopy center

  // Wide round shadow south-east
  gfx.ellipse(cx + 5, baseY + 6, 34, 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Trunk: short wide rectangle below canopy
  gfx.rect(cx - 5, canopyCY + 16, 6, 28);
  gfx.fill(0x6b4520); // lighter left face
  gfx.rect(cx + 1, canopyCY + 16, 4, 28);
  gfx.fill(0x5a3a1a); // darker right face

  // Main canopy — 64px wide × 48px tall
  // Bottom half darker (front face in 3/4)
  gfx.ellipse(cx, canopyCY + 4, 32, 24);
  gfx.fill(0x368020); // darker bottom

  // Top half lighter
  gfx.ellipse(cx, canopyCY - 4, 30, 20);
  gfx.fill(0x429828); // lighter top

  // Crown top highlight
  gfx.ellipse(cx - 4, canopyCY - 12, 18, 10);
  gfx.fill(0x52a832);

  // Depth lines — suggest underside shadow on south face
  gfx.ellipse(cx, canopyCY + 14, 24, 8);
  gfx.fill({ color: 0x2a6a18, alpha: 0.4 });
}

function drawDeadTree(gfx, cx, cy, x, y, s) {
  // Dead tree: trunk 10px wide × 80px tall, branches extend 28px each side
  const baseY = cy + 12;
  const topY = baseY - 80;

  // Subtle grey shadow below
  gfx.ellipse(cx + 4, baseY + 4, 18, 6);
  gfx.fill({ color: 0x000000, alpha: 0.15 });

  // Main trunk — 10px wide × 80px tall
  // Left face (lit)
  gfx.rect(cx - 5, topY, 5, 80);
  gfx.fill(0x6a5a42);
  // Right face (shadow)
  gfx.rect(cx, topY, 5, 80);
  gfx.fill(0x5a4a32);

  // Branch 1 — left, extends 28px
  const b1y = topY + 24;
  gfx.moveTo(cx, b1y);
  gfx.lineTo(cx - 28, b1y - 20);
  gfx.stroke({ width: 3, color: 0x5a4a32 }); // underside
  gfx.moveTo(cx, b1y - 1);
  gfx.lineTo(cx - 27, b1y - 21);
  gfx.stroke({ width: 2, color: 0x6a5a42 }); // top highlight

  // Branch 2 — right, extends 28px
  const b2y = topY + 16;
  gfx.moveTo(cx, b2y);
  gfx.lineTo(cx + 28, b2y - 22);
  gfx.stroke({ width: 3, color: 0x5a4a32 });
  gfx.moveTo(cx, b2y - 1);
  gfx.lineTo(cx + 27, b2y - 23);
  gfx.stroke({ width: 2, color: 0x6a5a42 });

  // Sub-branch tips — left
  gfx.moveTo(cx - 28, b1y - 20);
  gfx.lineTo(cx - 36, b1y - 30);
  gfx.stroke({ width: 2, color: 0x5a4a32 });
  gfx.moveTo(cx - 28, b1y - 21);
  gfx.lineTo(cx - 35, b1y - 31);
  gfx.stroke({ width: 1.2, color: 0x6a5a42 });

  // Sub-branch tips — right
  gfx.moveTo(cx + 28, b2y - 22);
  gfx.lineTo(cx + 36, b2y - 32);
  gfx.stroke({ width: 2, color: 0x5a4a32 });
  gfx.moveTo(cx + 28, b2y - 23);
  gfx.lineTo(cx + 35, b2y - 33);
  gfx.stroke({ width: 1.2, color: 0x6a5a42 });

  // Branch 3 — lower left small
  const b3y = topY + 46;
  gfx.moveTo(cx, b3y);
  gfx.lineTo(cx - 18, b3y - 12);
  gfx.stroke({ width: 2.5, color: 0x5a4a32 });
  gfx.moveTo(cx, b3y - 1);
  gfx.lineTo(cx - 17, b3y - 13);
  gfx.stroke({ width: 1.5, color: 0x6a5a42 });
}

/* ──────────────── Bush overlay — 3/4 ──────────────── */

function drawBushOverlay(gfx, x, y, s, r, c) {
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Bush: 36px wide × 24px tall
  // Tiny shadow ellipse underneath
  gfx.ellipse(cx + 3, cy + 14, 20, 6);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  // Front-bottom ellipse: darker (closer to camera in 3/4)
  gfx.ellipse(cx, cy + 4, 18, 12);
  gfx.fill(0x389018);

  // Back-top ellipse: lighter, offset up
  gfx.ellipse(cx - 2, cy - 4, 16, 10);
  gfx.fill(0x489228);

  // Top highlight on back ellipse
  gfx.ellipse(cx - 3, cy - 8, 10, 6);
  gfx.fill({ color: 0x58a232, alpha: 0.5 });
}

/* ──────────────── Ruin wall detail — full 3/4 ──────────────── */

function drawRuinWallDetail(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);

  // Top face — lightest, 12px strip
  gfx.rect(x, y, s, 12);
  gfx.fill(0xc4b49a);

  // Front face — mid tone, main visible face
  gfx.rect(x, y + 12, s, 28);
  gfx.fill(0x9a8a72);

  // Shadow base
  gfx.rect(x, y + 40, s, s - 40);
  gfx.fill(0x8a7a62);

  // Right face — darkest, 8px strip on right edge (corner/end piece look)
  gfx.rect(x + s - 8, y + 12, 8, s - 12);
  gfx.fill(0x4a3a28);

  // Stone block pattern — brick pattern on front face
  // Horizontal mortar lines every 12px
  for (let i = 0; i < 3; i++) {
    const ly = y + 12 + i * 12;
    gfx.moveTo(x, ly);
    gfx.lineTo(x + s - 8, ly);
    gfx.stroke({ width: 1, color: 0x3a2a1a, alpha: 0.6 });
  }

  // Vertical mortar — offset every other row for brick pattern
  for (let i = 0; i < 3; i++) {
    const ly = y + 12 + i * 12;
    const offset = (i % 2 === 0) ? 0 : 6;
    for (let vx = offset; vx < s - 8; vx += 16) {
      gfx.moveTo(x + vx, ly);
      gfx.lineTo(x + vx, ly + 12);
      gfx.stroke({ width: 1, color: 0x3a2a1a, alpha: 0.4 });
    }
  }

  // Crack details — 2-3 random thin diagonal lines
  if (h % 4 === 0) {
    gfx.moveTo(x + 8, y + 14);
    gfx.lineTo(x + 16, y + 30);
    gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.5 });
  }
  if (h % 3 === 0) {
    gfx.moveTo(x + s - 18, y + 16);
    gfx.lineTo(x + s - 22, y + 34);
    gfx.lineTo(x + s - 16, y + 38);
    gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.4 });
  }
  if (h % 5 === 0) {
    gfx.moveTo(x + s / 2, y + 18);
    gfx.lineTo(x + s / 2 + 6, y + 28);
    gfx.stroke({ width: 0.8, color: 0x2a1a0a, alpha: 0.3 });
  }
}

/* ──────────────── Alien structure overlay — 3/4 partially buried ──────────────── */

function drawAlienOverlay(gfx, x, y, s, time) {
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Ground-level glow pool — ellipse (wider than tall, flat ground plane)
  const glowAlpha = 0.15 + 0.15 * Math.sin(time * 2);
  gfx.ellipse(cx, cy + 4, s * 0.44, s * 0.28);
  gfx.fill({ color: ALIEN_GLOW_COLOR, alpha: glowAlpha * 0.3 });

  // Hexagonal shape — partially buried, only top portion visible
  const radius = s * 0.35;
  // Top face — very dark
  gfx.moveTo(cx + radius, cy - 4);
  for (let i = 1; i <= 6; i++) {
    const angle = (Math.PI / 3) * i;
    gfx.lineTo(cx + radius * Math.cos(angle), cy - 4 + radius * Math.sin(angle) * 0.5);
  }
  gfx.closePath();
  gfx.fill(0x1a2a1a);

  // South-facing side face — slightly lighter
  gfx.moveTo(cx - radius, cy - 4);
  gfx.lineTo(cx - radius, cy + 6);
  gfx.lineTo(cx + radius, cy + 6);
  gfx.lineTo(cx + radius, cy - 4);
  gfx.closePath();
  gfx.fill(0x243424);

  // Green edge glow on top
  const edgeGlow = 0.3 + 0.3 * Math.sin(time * 2);
  gfx.moveTo(cx + radius + 2, cy - 5);
  for (let i = 1; i <= 6; i++) {
    const angle = (Math.PI / 3) * i;
    gfx.lineTo(cx + (radius + 2) * Math.cos(angle), cy - 5 + (radius + 2) * Math.sin(angle) * 0.5);
  }
  gfx.closePath();
  gfx.stroke({ width: 2, color: ALIEN_GLOW_COLOR, alpha: edgeGlow });

  // Buried bottom — ground tiles overlap the bottom edge (darker blend)
  gfx.rect(x, cy + 6, s, s / 2 - 6);
  gfx.fill({ color: ALIEN_BASE_COLOR, alpha: 0.7 });
}

/* ──────────────── Base floor detail — 3/4 treatment ──────────────── */

function drawBaseFloorDetail(gfx, x, y, s, r, c, worldMap) {
  const h = hashTile(r, c);

  // Foundation stone pattern — lighter than base floor
  gfx.rect(x, y + s - 4, s, 4);
  gfx.fill(0x7a6a52);

  // Stone block lines on floor
  if (h % 2 === 0) {
    gfx.moveTo(x, y + s / 2);
    gfx.lineTo(x + s, y + s / 2);
    gfx.stroke({ width: 0.5, color: 0x2a2218, alpha: 0.3 });
  }
  if (h % 3 === 0) {
    gfx.moveTo(x + s / 3, y);
    gfx.lineTo(x + s / 3, y + s);
    gfx.stroke({ width: 0.5, color: 0x2a2218, alpha: 0.25 });
  }
}
