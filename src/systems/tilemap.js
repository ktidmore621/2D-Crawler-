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
      color = 0x1a3010; // dark grass under tree
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
    gfx.fill(0x3a2a18);
    // Front face of top edge — visible cliff wall
    gfx.rect(x, y + 4, s, 6);
    gfx.fill(0x2e2418);

    // Bottom edge — far wall visible in 3/4 (lighter strip suggesting other side)
    gfx.rect(x, y + s - 8, s, 4);
    gfx.fill(0x2a1a0a);
    // Far wall highlight
    gfx.rect(x, y + s - 8, s, 2);
    gfx.fill({ color: 0x4a3a28, alpha: 0.4 });

    // Canyon floor darkest at center
    gfx.rect(x, y + 14, s, s - 28);
    gfx.fill(0x1a1208);

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
  // Shadow on ground — elongated oval south-east
  gfx.ellipse(cx + 6, y + s - 4, s * 0.32, s * 0.12);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Trunk visible below bottom layer
  gfx.rect(cx - 3, cy + 8, 6, s * 0.28);
  gfx.fill(0x5a3a1a);
  // Trunk shadow side (right)
  gfx.rect(cx + 1, cy + 8, 2, s * 0.28);
  gfx.fill({ color: 0x3a2010, alpha: 0.5 });

  // Bottom layer — widest, darkest
  const bw = s * 0.42;
  const bh = 14;
  const by = cy + 2;
  // Left half (lit)
  gfx.moveTo(cx, by - bh);
  gfx.lineTo(cx - bw, by);
  gfx.lineTo(cx, by);
  gfx.closePath();
  gfx.fill(0x245c14);
  // Right half (shadow side — 15% darker)
  gfx.moveTo(cx, by - bh);
  gfx.lineTo(cx + bw, by);
  gfx.lineTo(cx, by);
  gfx.closePath();
  gfx.fill(0x1e4e10);
  // Top face highlight on bottom layer
  gfx.moveTo(cx - bw + 4, by - 1);
  gfx.lineTo(cx, by - bh);
  gfx.lineTo(cx + bw - 4, by - 1);
  gfx.stroke({ width: 1, color: 0x2d6b1a, alpha: 0.6 });

  // Middle layer
  const mw = s * 0.32;
  const mh = 12;
  const my = cy - 6;
  gfx.moveTo(cx, my - mh);
  gfx.lineTo(cx - mw, my);
  gfx.lineTo(cx, my);
  gfx.closePath();
  gfx.fill(0x2d6b1a);
  gfx.moveTo(cx, my - mh);
  gfx.lineTo(cx + mw, my);
  gfx.lineTo(cx, my);
  gfx.closePath();
  gfx.fill(0x265c16);

  // Top layer — smallest, lightest
  const tw = s * 0.2;
  const th = 10;
  const ty = cy - 14;
  gfx.moveTo(cx, ty - th);
  gfx.lineTo(cx - tw, ty);
  gfx.lineTo(cx, ty);
  gfx.closePath();
  gfx.fill(0x357820);
  gfx.moveTo(cx, ty - th);
  gfx.lineTo(cx + tw, ty);
  gfx.lineTo(cx, ty);
  gfx.closePath();
  gfx.fill(0x2d6b1a);
}

function drawOakTree(gfx, cx, cy, x, y, s) {
  // Wide round shadow south-east
  gfx.ellipse(cx + 5, y + s - 3, s * 0.38, s * 0.14);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Trunk: short wide rectangle below canopy
  gfx.rect(cx - 4, cy + 4, 5, s * 0.25);
  gfx.fill(0x6b4520); // lighter left face
  gfx.rect(cx + 1, cy + 4, 3, s * 0.25);
  gfx.fill(0x5a3a1a); // darker right face

  // Main canopy — flattened ellipse (wider than tall)
  // Bottom half darker (front face in 3/4)
  gfx.ellipse(cx, cy + 2, s * 0.38, s * 0.22);
  gfx.fill(0x245c14); // darker bottom

  // Top half lighter — clip with another ellipse offset up
  gfx.ellipse(cx, cy - 4, s * 0.36, s * 0.2);
  gfx.fill(0x3a7a20); // lighter top

  // Crown top highlight — second smaller ellipse offset up and left
  gfx.ellipse(cx - 4, cy - 8, s * 0.2, s * 0.12);
  gfx.fill(0x4a8a28);

  // Depth lines — suggest underside shadow on south face
  gfx.ellipse(cx, cy + 6, s * 0.3, s * 0.08);
  gfx.fill({ color: 0x1a4a10, alpha: 0.4 });
}

function drawDeadTree(gfx, cx, cy, x, y, s) {
  // Subtle grey shadow below
  gfx.ellipse(cx + 4, y + s - 5, s * 0.22, s * 0.08);
  gfx.fill({ color: 0x000000, alpha: 0.15 });

  // Main trunk — tall narrow rectangle with 3/4 faces
  // Left face (lit)
  gfx.rect(cx - 3, cy - 10, 3, s * 0.55);
  gfx.fill(0x4a3a2a);
  // Right face (shadow)
  gfx.rect(cx, cy - 10, 3, s * 0.55);
  gfx.fill(0x2a1a0a);

  // Branches with top highlight and darker underside
  // Branch 1 — left
  gfx.moveTo(cx, cy - 2);
  gfx.lineTo(cx - 12, cy - 14);
  gfx.stroke({ width: 2.5, color: 0x2a1a0a }); // underside
  gfx.moveTo(cx, cy - 3);
  gfx.lineTo(cx - 11, cy - 15);
  gfx.stroke({ width: 1.5, color: 0x5a4a3a }); // top highlight

  // Branch 2 — right
  gfx.moveTo(cx, cy - 6);
  gfx.lineTo(cx + 10, cy - 18);
  gfx.stroke({ width: 2.5, color: 0x2a1a0a });
  gfx.moveTo(cx, cy - 7);
  gfx.lineTo(cx + 9, cy - 19);
  gfx.stroke({ width: 1.5, color: 0x5a4a3a });

  // Sub-branch tips
  gfx.moveTo(cx - 12, cy - 14);
  gfx.lineTo(cx - 16, cy - 20);
  gfx.stroke({ width: 1.5, color: 0x2a1a0a });
  gfx.moveTo(cx - 12, cy - 15);
  gfx.lineTo(cx - 15, cy - 21);
  gfx.stroke({ width: 1, color: 0x4a3a2a });

  gfx.moveTo(cx + 10, cy - 18);
  gfx.lineTo(cx + 15, cy - 23);
  gfx.stroke({ width: 1.5, color: 0x2a1a0a });
  gfx.moveTo(cx + 10, cy - 19);
  gfx.lineTo(cx + 14, cy - 24);
  gfx.stroke({ width: 1, color: 0x4a3a2a });
}

/* ──────────────── Bush overlay — 3/4 ──────────────── */

function drawBushOverlay(gfx, x, y, s, r, c) {
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Tiny shadow ellipse underneath
  gfx.ellipse(cx + 3, y + s - 3, s * 0.3, s * 0.08);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  // Front-bottom ellipse: darker (closer to camera in 3/4)
  gfx.ellipse(cx, cy + 4, s * 0.32, s * 0.2);
  gfx.fill(0x2a5015);

  // Back-top ellipse: lighter, offset up 6px (further from camera, higher)
  gfx.ellipse(cx - 2, cy - 2, s * 0.3, s * 0.18);
  gfx.fill(0x3a6b20);

  // Top highlight on back ellipse
  gfx.ellipse(cx - 3, cy - 5, s * 0.16, s * 0.09);
  gfx.fill({ color: 0x4a7a2a, alpha: 0.5 });
}

/* ──────────────── Ruin wall detail — full 3/4 ──────────────── */

function drawRuinWallDetail(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);

  // Top face — lightest, 12px strip
  gfx.rect(x, y, s, 12);
  gfx.fill(0x9a8a78);

  // Front face — mid tone, main visible face
  gfx.rect(x, y + 12, s, 28);
  gfx.fill(0x7a6a58);

  // Shadow base
  gfx.rect(x, y + 40, s, s - 40);
  gfx.fill(0x5a4a38);

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
  gfx.fill(0x6a5a48);

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
