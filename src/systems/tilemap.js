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
  TILE_WATER,
  TILE_SHALLOW_WATER,
  TILE_FLOODED_FLOOR,
  TILE_MOUNTAIN_WALL,
  TILE_MOUNTAIN_TOP,
  TILE_PLATEAU_FLOOR,
  TILE_CLIFF_EDGE,
  TILE_RAMP,
  TILE_DRY_LAKEBED,
  TILE_FARMLAND,
  TILE_CRATER_FLOOR,
  TILE_HIGHWAY,
  TILE_WATERFALL,
  GRASS_COLORS,
  DIRT_COLORS,
  RUIN_FLOOR_COLOR,
  RUIN_WALL_COLOR,
  RIVER_COLOR,
  ALIEN_BASE_COLOR,
  ALIEN_GLOW_COLOR,
  BASE_FLOOR_COLOR,
  WATER_COLORS,
  SHALLOW_WATER_COLORS,
  FLOODED_FLOOR_COLOR,
  MOUNTAIN_WALL_COLORS,
  MOUNTAIN_TOP_COLORS,
  MOUNTAIN_SNOW_COLOR,
  PLATEAU_FLOOR_COLORS,
  CLIFF_EDGE_COLOR,
  CLIFF_FACE_COLOR,
  CLIFF_FACE_HEIGHT,
  RAMP_COLORS,
  DRY_LAKEBED_COLOR,
  FARMLAND_COLORS,
  CRATER_FLOOR_COLOR,
  HIGHWAY_COLORS,
  WATERFALL_COLOR,
  WATERFALL_HIGHLIGHT,
  PLATEAU_Y_OFFSET,
} from '../utils/constants.js';
import { getElevation } from './elevation.js';

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

    // Pass 1: ground tiles (including elevation cliff faces drawn below elevated tiles)
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        const x = c * WORLD_TILE_SIZE;
        const y = r * WORLD_TILE_SIZE;
        const s = WORLD_TILE_SIZE;
        const elev = getElevation(c, r);

        // Draw cliff face below plateau/mountain tiles
        if (elev >= 1) {
          const southElev = r < WORLD_ROWS - 1 ? getElevation(c, r + 1) : 0;
          if (southElev < elev) {
            drawCliffFace(gfx, x, y + s, s, elev);
          }
        }

        // Draw base tile (with elevation offset for plateau)
        const yOff = elev === 1 ? PLATEAU_Y_OFFSET : 0;
        drawTileBase(gfx, tileId, x, y + yOff, s, r, c, time);
      }
    }

    // Pass 2: overlays (tree canopies, bushes, alien structures, ruin wall details, base building)
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        const x = c * WORLD_TILE_SIZE;
        const y = r * WORLD_TILE_SIZE;
        const s = WORLD_TILE_SIZE;
        const elev = getElevation(c, r);
        const yOff = elev === 1 ? PLATEAU_Y_OFFSET : 0;

        if (tileId === TILE_TREE) {
          drawTreeOverlay(gfx, x, y + yOff, s, r, c);
        } else if (tileId === TILE_BUSH) {
          drawBushOverlay(gfx, x, y + yOff, s, r, c);
        } else if (tileId === TILE_ALIEN) {
          drawAlienOverlay(gfx, x, y + yOff, s, time);
        } else if (tileId === TILE_RUIN_WALL) {
          drawRuinWallDetail(gfx, x, y + yOff, s, r, c);
        } else if (tileId === TILE_BASE_FLOOR) {
          drawBaseFloorDetail(gfx, x, y + yOff, s, r, c, worldMap);
        } else if (tileId === TILE_MOUNTAIN_WALL) {
          drawMountainWallOverlay(gfx, x, y, s, r, c);
        } else if (tileId === TILE_MOUNTAIN_TOP) {
          drawMountainTopOverlay(gfx, x, y, s, r, c);
        }
      }
    }
  }

  return { gfx, render };
}

/* ──────────────── Cliff face below elevated tiles ──────────────── */

function drawCliffFace(gfx, x, y, s, elevation) {
  const faceH = CLIFF_FACE_HEIGHT;
  // Main cliff face
  gfx.rect(x, y, s, faceH);
  gfx.fill(CLIFF_FACE_COLOR);
  // Darker base shadow
  gfx.rect(x, y + faceH - 6, s, 6);
  gfx.fill({ color: 0x000000, alpha: 0.25 });
  // Highlight at top edge
  gfx.rect(x, y, s, 2);
  gfx.fill({ color: 0x8a9a6a, alpha: 0.4 });

  if (elevation >= 2) {
    // Extra tall face for mountain elevation
    gfx.rect(x, y + faceH, s, faceH);
    gfx.fill(0x4a5a2a);
    gfx.rect(x, y + faceH * 2 - 6, s, 6);
    gfx.fill({ color: 0x000000, alpha: 0.3 });
  }
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
    case TILE_WATER:
      drawWaterTile(gfx, x, y, s, r, c, time, false);
      return;
    case TILE_SHALLOW_WATER:
      drawWaterTile(gfx, x, y, s, r, c, time, true);
      return;
    case TILE_FLOODED_FLOOR:
      drawFloodedFloorTile(gfx, x, y, s, r, c, time);
      return;
    case TILE_MOUNTAIN_WALL:
      color = MOUNTAIN_WALL_COLORS[hashTile(r, c) % 2];
      break;
    case TILE_MOUNTAIN_TOP:
      color = MOUNTAIN_TOP_COLORS[hashTile(r, c) % 2];
      break;
    case TILE_PLATEAU_FLOOR:
      color = PLATEAU_FLOOR_COLORS[hashTile(r, c) % 2];
      break;
    case TILE_CLIFF_EDGE:
      drawCliffEdgeTile(gfx, x, y, s, r, c);
      return;
    case TILE_RAMP:
      drawRampTile(gfx, x, y, s, r, c);
      return;
    case TILE_DRY_LAKEBED:
      drawDryLakebedTile(gfx, x, y, s, r, c);
      return;
    case TILE_FARMLAND:
      drawFarmlandTile(gfx, x, y, s, r, c);
      return;
    case TILE_CRATER_FLOOR:
      drawCraterFloorTile(gfx, x, y, s, r, c);
      return;
    case TILE_HIGHWAY:
      drawHighwayTile(gfx, x, y, s, r, c);
      return;
    case TILE_WATERFALL:
      drawWaterfallTile(gfx, x, y, s, r, c, time);
      return;
    default:
      color = GRASS_COLORS[0];
  }

  gfx.rect(x, y, s, s);
  gfx.fill(color);

  // ── Canyon / Dried River — 3/4 depth ──
  if (tileId === TILE_RIVER) {
    gfx.rect(x, y, s, 4);
    gfx.fill(0x5a4a32);
    gfx.rect(x, y + 4, s, 6);
    gfx.fill(0x4a3a28);
    gfx.rect(x, y + s - 8, s, 4);
    gfx.fill(0x3a2e20);
    gfx.rect(x, y + s - 8, s, 2);
    gfx.fill({ color: 0x5a4a32, alpha: 0.4 });
    gfx.rect(x, y + 14, s, s - 28);
    gfx.fill(0x2a2010);

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

/* ──────────────── Water tile — animated ──────────────── */

function drawWaterTile(gfx, x, y, s, r, c, time, isShallow) {
  const colors = isShallow ? SHALLOW_WATER_COLORS : WATER_COLORS;
  // Sine wave color oscillation
  const wave = Math.sin(time * 0.8 + r * 0.5 + c * 0.3);
  const colorIdx = wave > 0 ? 0 : 1;
  const baseColor = colors[colorIdx];

  gfx.rect(x, y, s, s);
  gfx.fill(baseColor);

  // Animated highlight — sine wave shimmer
  const highlightAlpha = 0.08 + 0.06 * Math.sin(time * 1.2 + c * 0.7 + r * 0.4);
  gfx.rect(x, y, s, s);
  gfx.fill({ color: 0x6aaaca, alpha: highlightAlpha });

  // Flow direction lines (subtle diagonal current)
  const h = hashTile(r, c);
  if (h % 3 === 0) {
    const lineOffset = (time * 12 + h) % s;
    gfx.moveTo(x + lineOffset, y);
    gfx.lineTo(x + lineOffset + 8, y + s);
    gfx.stroke({ width: 0.5, color: 0x5a9aba, alpha: 0.2 });
  }
  if (h % 4 === 1) {
    const lineOffset2 = (time * 10 + h * 2) % s;
    gfx.moveTo(x + lineOffset2, y);
    gfx.lineTo(x + lineOffset2 + 6, y + s);
    gfx.stroke({ width: 0.5, color: 0x5a9aba, alpha: 0.15 });
  }
}

/* ──────────────── Flooded floor tile ──────────────── */

function drawFloodedFloorTile(gfx, x, y, s, r, c, time) {
  // Draw ruin floor base
  gfx.rect(x, y, s, s);
  gfx.fill(RUIN_FLOOR_COLOR);

  // Ruin floor cracks
  const h = hashTile(r, c);
  if (h % 3 === 0) {
    gfx.moveTo(x + 8, y + 12);
    gfx.lineTo(x + 20, y + 30);
    gfx.stroke({ width: 1, color: 0x3a3020, alpha: 0.3 });
  }

  // Water overlay at 0.6 opacity
  const wave = Math.sin(time * 0.8 + r * 0.5 + c * 0.3);
  const waterAlpha = 0.55 + 0.05 * wave;
  gfx.rect(x, y, s, s);
  gfx.fill({ color: FLOODED_FLOOR_COLOR, alpha: waterAlpha });

  // Shimmer
  const shimmer = 0.06 + 0.04 * Math.sin(time * 1.2 + c * 0.7);
  gfx.rect(x, y, s, s);
  gfx.fill({ color: 0x6aaaca, alpha: shimmer });

  // Algae tint near edges
  if (h % 5 < 2) {
    gfx.rect(x, y, s / 3, s);
    gfx.fill({ color: 0x2a5a2a, alpha: 0.15 });
  }
}

/* ──────────────── Cliff edge tile ──────────────── */

function drawCliffEdgeTile(gfx, x, y, s, r, c) {
  // Ground tile base
  const color = GRASS_COLORS[hashTile(r, c) % 3];
  gfx.rect(x, y, s, s);
  gfx.fill(color);

  // Dramatic drop shadow on south edge
  gfx.rect(x, y + s - 6, s, 6);
  gfx.fill({ color: 0x000000, alpha: 0.4 });

  // Overhang line
  gfx.moveTo(x, y + s - 6);
  gfx.lineTo(x + s, y + s - 6);
  gfx.stroke({ width: 2, color: CLIFF_EDGE_COLOR });

  // Slight darker overhang
  gfx.rect(x, y + s - 3, s, 3);
  gfx.fill({ color: 0x2a1a08, alpha: 0.5 });
}

/* ──────────────── Ramp tile ──────────────── */

function drawRampTile(gfx, x, y, s, r, c) {
  const color = RAMP_COLORS[hashTile(r, c) % 2];
  gfx.rect(x, y, s, s);
  gfx.fill(color);

  // Diagonal face suggesting slope — lighter at top, darker at bottom
  gfx.moveTo(x, y + s);
  gfx.lineTo(x + s, y + s);
  gfx.lineTo(x + s, y);
  gfx.lineTo(x, y + s * 0.4);
  gfx.closePath();
  gfx.fill({ color: 0x7a6a42, alpha: 0.3 });

  // Horizontal tread lines
  for (let i = 1; i < 4; i++) {
    const ly = y + (s * i) / 4;
    gfx.moveTo(x, ly);
    gfx.lineTo(x + s, ly);
    gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.4 });
  }
}

/* ──────────────── Dry lakebed tile ──────────────── */

function drawDryLakebedTile(gfx, x, y, s, r, c) {
  gfx.rect(x, y, s, s);
  gfx.fill(DRY_LAKEBED_COLOR);

  // Cracked pattern
  const h = hashTile(r, c);
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Radial cracks from center
  gfx.moveTo(cx, cy);
  gfx.lineTo(cx + 12 + (h % 8), cy - 14 - (h % 6));
  gfx.stroke({ width: 1, color: 0x5a4a32, alpha: 0.6 });

  gfx.moveTo(cx, cy);
  gfx.lineTo(cx - 10 - (h % 7), cy + 12 + (h % 5));
  gfx.stroke({ width: 1, color: 0x5a4a32, alpha: 0.5 });

  gfx.moveTo(cx, cy);
  gfx.lineTo(cx + 8 + (h % 6), cy + 10 + (h % 8));
  gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.4 });

  if (h % 3 === 0) {
    gfx.moveTo(cx, cy);
    gfx.lineTo(cx - 14, cy - 8);
    gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.4 });
  }
}

/* ──────────────── Farmland tile ──────────────── */

function drawFarmlandTile(gfx, x, y, s, r, c) {
  const color = FARMLAND_COLORS[hashTile(r, c) % 2];
  gfx.rect(x, y, s, s);
  gfx.fill(color);

  // Furrow lines (horizontal rows)
  for (let i = 1; i < 6; i++) {
    const ly = y + (s * i) / 6;
    gfx.moveTo(x + 2, ly);
    gfx.lineTo(x + s - 2, ly);
    gfx.stroke({ width: 0.8, color: 0x5a3a1a, alpha: 0.4 });
  }

  // Overgrown grass clumps
  const h = hashTile(r, c);
  if (h % 4 < 2) {
    const gx = x + 8 + (h % 20);
    const gy = y + 10 + (h % 18);
    gfx.circle(gx, gy, 2);
    gfx.fill({ color: 0x5a8a38, alpha: 0.6 });
    gfx.circle(gx + 4, gy + 2, 1.5);
    gfx.fill({ color: 0x6a9a42, alpha: 0.5 });
  }
  if (h % 5 === 0) {
    const gx2 = x + 24 + (h % 16);
    const gy2 = y + 28 + (h % 12);
    gfx.circle(gx2, gy2, 2.5);
    gfx.fill({ color: 0x5a8a38, alpha: 0.5 });
  }
}

/* ──────────────── Crater floor tile ──────────────── */

function drawCraterFloorTile(gfx, x, y, s, r, c) {
  gfx.rect(x, y, s, s);
  gfx.fill(CRATER_FLOOR_COLOR);

  // Scorched texture — darker patches
  const h = hashTile(r, c);
  if (h % 3 === 0) {
    gfx.rect(x + 4 + (h % 12), y + 6 + (h % 10), 12, 8);
    gfx.fill({ color: 0x1a1810, alpha: 0.4 });
  }
  if (h % 4 === 1) {
    gfx.circle(x + 20 + (h % 16), y + 20 + (h % 14), 4);
    gfx.fill({ color: 0x1a1810, alpha: 0.3 });
  }

  // Subtle ash streaks
  if (h % 5 < 2) {
    gfx.moveTo(x + 6, y + 12 + (h % 20));
    gfx.lineTo(x + s - 6, y + 16 + (h % 16));
    gfx.stroke({ width: 0.6, color: 0x3a3228, alpha: 0.3 });
  }
}

/* ──────────────── Highway tile ──────────────── */

function drawHighwayTile(gfx, x, y, s, r, c) {
  const color = HIGHWAY_COLORS[hashTile(r, c) % 2];
  gfx.rect(x, y, s, s);
  gfx.fill(color);

  // Faded yellow center line (dashed)
  const h = hashTile(r, c);
  if (h % 3 !== 2) {
    gfx.rect(x + s / 2 - 1.5, y, 3, s);
    gfx.fill({ color: 0x8a8a3a, alpha: 0.35 });
  }

  // White edge lines
  gfx.rect(x, y, 2, s);
  gfx.fill({ color: 0x9a9a92, alpha: 0.2 });
  gfx.rect(x + s - 2, y, 2, s);
  gfx.fill({ color: 0x9a9a92, alpha: 0.2 });

  // Cracks in asphalt
  if (h % 5 === 0) {
    gfx.moveTo(x + 8 + (h % 12), y);
    gfx.lineTo(x + 12 + (h % 10), y + s);
    gfx.stroke({ width: 0.6, color: 0x2a2824, alpha: 0.4 });
  }

  // Overgrown sections — grass breaking through
  if (h % 7 === 0) {
    gfx.circle(x + 10 + (h % 20), y + 15 + (h % 18), 3);
    gfx.fill({ color: 0x5a8a38, alpha: 0.4 });
  }
}

/* ──────────────── Waterfall tile ──────────────── */

function drawWaterfallTile(gfx, x, y, s, r, c, time) {
  // Water background
  gfx.rect(x, y, s, s);
  gfx.fill(WATERFALL_COLOR);

  // Animated vertical white-blue lines (fast downward)
  for (let i = 0; i < 5; i++) {
    const lx = x + 4 + i * (s / 5);
    const offset = (time * 80 + i * 17 + hashTile(r, c)) % s;
    const lineLen = 12 + (i % 3) * 4;
    gfx.moveTo(lx, y + offset);
    gfx.lineTo(lx + 1, y + offset + lineLen);
    gfx.stroke({ width: 2, color: WATERFALL_HIGHLIGHT, alpha: 0.5 + 0.2 * Math.sin(time * 3 + i) });
  }

  // Additional fast streaks
  for (let i = 0; i < 3; i++) {
    const lx2 = x + 8 + i * (s / 3);
    const offset2 = (time * 100 + i * 31) % s;
    gfx.moveTo(lx2, y + offset2);
    gfx.lineTo(lx2, y + offset2 + 8);
    gfx.stroke({ width: 1.5, color: 0xaaddff, alpha: 0.3 });
  }

  // Foam/mist at edges
  gfx.rect(x, y, 3, s);
  gfx.fill({ color: 0xaaddff, alpha: 0.15 });
  gfx.rect(x + s - 3, y, 3, s);
  gfx.fill({ color: 0xaaddff, alpha: 0.15 });
}

/* ──────────────── Mountain wall overlay — 3/4 stacked blocks ──────────────── */

function drawMountainWallOverlay(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);

  // Top face — lightest
  gfx.rect(x, y, s, 10);
  gfx.fill(MOUNTAIN_TOP_COLORS[h % 2]);

  // Front face — main visible face, stacked layers
  gfx.rect(x, y + 10, s, 18);
  gfx.fill(MOUNTAIN_WALL_COLORS[0]);

  // Mid layer — slightly darker
  gfx.rect(x, y + 28, s, 12);
  gfx.fill(0x4a4238);

  // Base — darkest
  gfx.rect(x, y + 40, s, s - 40);
  gfx.fill(0x3a3228);

  // Right shadow face
  gfx.rect(x + s - 6, y + 10, 6, s - 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Rock texture lines
  if (h % 3 === 0) {
    gfx.moveTo(x + 8, y + 14);
    gfx.lineTo(x + 20, y + 26);
    gfx.stroke({ width: 0.8, color: 0x3a3228, alpha: 0.4 });
  }

  // Snow cap on top rows (r < 8 in the mountain range)
  if (r < 8 || h % 6 === 0) {
    gfx.rect(x + 2, y + 1, s - 4, 6);
    gfx.fill({ color: MOUNTAIN_SNOW_COLOR, alpha: 0.6 });
  }
}

/* ──────────────── Mountain top overlay ──────────────── */

function drawMountainTopOverlay(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);

  // Snow/rock cap
  gfx.rect(x, y, s, s);
  gfx.fill(MOUNTAIN_TOP_COLORS[h % 2]);

  // Snow overlay
  gfx.rect(x + 3, y + 3, s - 6, s - 6);
  gfx.fill({ color: MOUNTAIN_SNOW_COLOR, alpha: 0.5 });

  // Rock peaking through
  if (h % 4 < 2) {
    gfx.rect(x + 10 + (h % 12), y + 8 + (h % 10), 10, 8);
    gfx.fill({ color: MOUNTAIN_WALL_COLORS[0], alpha: 0.6 });
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
  const baseY = cy + 12;
  const topY = baseY - 72;

  gfx.ellipse(cx + 6, baseY + 4, 28, 8);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  gfx.rect(cx - 4, baseY - 22, 8, 26);
  gfx.fill(0x5a3a1a);
  gfx.rect(cx + 1, baseY - 22, 3, 26);
  gfx.fill({ color: 0x3a2010, alpha: 0.5 });

  const bw = 26;
  const bh = 20;
  const by = baseY - 16;
  gfx.moveTo(cx, by - bh);
  gfx.lineTo(cx - bw, by);
  gfx.lineTo(cx, by);
  gfx.closePath();
  gfx.fill(0x3a8a20);
  gfx.moveTo(cx, by - bh);
  gfx.lineTo(cx + bw, by);
  gfx.lineTo(cx, by);
  gfx.closePath();
  gfx.fill(0x2e7018);
  gfx.moveTo(cx - bw + 4, by - 1);
  gfx.lineTo(cx, by - bh);
  gfx.lineTo(cx + bw - 4, by - 1);
  gfx.stroke({ width: 1, color: 0x4a9a28, alpha: 0.6 });

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
  const baseY = cy + 12;
  const canopyCY = baseY - 44;

  gfx.ellipse(cx + 5, baseY + 6, 34, 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  gfx.rect(cx - 5, canopyCY + 16, 6, 28);
  gfx.fill(0x6b4520);
  gfx.rect(cx + 1, canopyCY + 16, 4, 28);
  gfx.fill(0x5a3a1a);

  gfx.ellipse(cx, canopyCY + 4, 32, 24);
  gfx.fill(0x368020);
  gfx.ellipse(cx, canopyCY - 4, 30, 20);
  gfx.fill(0x429828);
  gfx.ellipse(cx - 4, canopyCY - 12, 18, 10);
  gfx.fill(0x52a832);
  gfx.ellipse(cx, canopyCY + 14, 24, 8);
  gfx.fill({ color: 0x2a6a18, alpha: 0.4 });
}

function drawDeadTree(gfx, cx, cy, x, y, s) {
  const baseY = cy + 12;
  const topY = baseY - 80;

  gfx.ellipse(cx + 4, baseY + 4, 18, 6);
  gfx.fill({ color: 0x000000, alpha: 0.15 });

  gfx.rect(cx - 5, topY, 5, 80);
  gfx.fill(0x6a5a42);
  gfx.rect(cx, topY, 5, 80);
  gfx.fill(0x5a4a32);

  const b1y = topY + 24;
  gfx.moveTo(cx, b1y);
  gfx.lineTo(cx - 28, b1y - 20);
  gfx.stroke({ width: 3, color: 0x5a4a32 });
  gfx.moveTo(cx, b1y - 1);
  gfx.lineTo(cx - 27, b1y - 21);
  gfx.stroke({ width: 2, color: 0x6a5a42 });

  const b2y = topY + 16;
  gfx.moveTo(cx, b2y);
  gfx.lineTo(cx + 28, b2y - 22);
  gfx.stroke({ width: 3, color: 0x5a4a32 });
  gfx.moveTo(cx, b2y - 1);
  gfx.lineTo(cx + 27, b2y - 23);
  gfx.stroke({ width: 2, color: 0x6a5a42 });

  gfx.moveTo(cx - 28, b1y - 20);
  gfx.lineTo(cx - 36, b1y - 30);
  gfx.stroke({ width: 2, color: 0x5a4a32 });
  gfx.moveTo(cx - 28, b1y - 21);
  gfx.lineTo(cx - 35, b1y - 31);
  gfx.stroke({ width: 1.2, color: 0x6a5a42 });

  gfx.moveTo(cx + 28, b2y - 22);
  gfx.lineTo(cx + 36, b2y - 32);
  gfx.stroke({ width: 2, color: 0x5a4a32 });
  gfx.moveTo(cx + 28, b2y - 23);
  gfx.lineTo(cx + 35, b2y - 33);
  gfx.stroke({ width: 1.2, color: 0x6a5a42 });

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

  gfx.ellipse(cx + 3, cy + 14, 20, 6);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  gfx.ellipse(cx, cy + 4, 18, 12);
  gfx.fill(0x389018);

  gfx.ellipse(cx - 2, cy - 4, 16, 10);
  gfx.fill(0x489228);

  gfx.ellipse(cx - 3, cy - 8, 10, 6);
  gfx.fill({ color: 0x58a232, alpha: 0.5 });
}

/* ──────────────── Ruin wall detail — full 3/4 ──────────────── */

function drawRuinWallDetail(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);

  gfx.rect(x, y, s, 12);
  gfx.fill(0xc4b49a);

  gfx.rect(x, y + 12, s, 28);
  gfx.fill(0x9a8a72);

  gfx.rect(x, y + 40, s, s - 40);
  gfx.fill(0x8a7a62);

  gfx.rect(x + s - 8, y + 12, 8, s - 12);
  gfx.fill(0x4a3a28);

  for (let i = 0; i < 3; i++) {
    const ly = y + 12 + i * 12;
    gfx.moveTo(x, ly);
    gfx.lineTo(x + s - 8, ly);
    gfx.stroke({ width: 1, color: 0x3a2a1a, alpha: 0.6 });
  }

  for (let i = 0; i < 3; i++) {
    const ly = y + 12 + i * 12;
    const offset = (i % 2 === 0) ? 0 : 6;
    for (let vx = offset; vx < s - 8; vx += 16) {
      gfx.moveTo(x + vx, ly);
      gfx.lineTo(x + vx, ly + 12);
      gfx.stroke({ width: 1, color: 0x3a2a1a, alpha: 0.4 });
    }
  }

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

  const glowAlpha = 0.15 + 0.15 * Math.sin(time * 2);
  gfx.ellipse(cx, cy + 4, s * 0.44, s * 0.28);
  gfx.fill({ color: ALIEN_GLOW_COLOR, alpha: glowAlpha * 0.3 });

  const radius = s * 0.35;
  gfx.moveTo(cx + radius, cy - 4);
  for (let i = 1; i <= 6; i++) {
    const angle = (Math.PI / 3) * i;
    gfx.lineTo(cx + radius * Math.cos(angle), cy - 4 + radius * Math.sin(angle) * 0.5);
  }
  gfx.closePath();
  gfx.fill(0x1a2a1a);

  gfx.moveTo(cx - radius, cy - 4);
  gfx.lineTo(cx - radius, cy + 6);
  gfx.lineTo(cx + radius, cy + 6);
  gfx.lineTo(cx + radius, cy - 4);
  gfx.closePath();
  gfx.fill(0x243424);

  const edgeGlow = 0.3 + 0.3 * Math.sin(time * 2);
  gfx.moveTo(cx + radius + 2, cy - 5);
  for (let i = 1; i <= 6; i++) {
    const angle = (Math.PI / 3) * i;
    gfx.lineTo(cx + (radius + 2) * Math.cos(angle), cy - 5 + (radius + 2) * Math.sin(angle) * 0.5);
  }
  gfx.closePath();
  gfx.stroke({ width: 2, color: ALIEN_GLOW_COLOR, alpha: edgeGlow });

  gfx.rect(x, cy + 6, s, s / 2 - 6);
  gfx.fill({ color: ALIEN_BASE_COLOR, alpha: 0.7 });
}

/* ──────────────── Base floor detail — 3/4 treatment ──────────────── */

function drawBaseFloorDetail(gfx, x, y, s, r, c, worldMap) {
  const h = hashTile(r, c);

  gfx.rect(x, y + s - 4, s, 4);
  gfx.fill(0x7a6a52);

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
