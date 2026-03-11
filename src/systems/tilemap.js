/**
 * Tile map rendering system — draws visible tiles using real pixel art sprites
 * from the Pixel Crawler pack, with Graphics overlays for animated effects.
 *
 * Ground tiles use Sprites from the texture cache (scaled 3× from 16px to 48px).
 * Animated effects (water shimmer, cliff faces, cracks) use Graphics on top.
 * Tree/bush overlays now use Sprites from tree model sheets.
 */

import { Container, Graphics, Sprite } from 'pixi.js';
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
  ALIEN_BASE_COLOR,
  ALIEN_GLOW_COLOR,
  FLOODED_FLOOR_COLOR,
  MOUNTAIN_WALL_COLORS,
  MOUNTAIN_TOP_COLORS,
  MOUNTAIN_SNOW_COLOR,
  CLIFF_EDGE_COLOR,
  CLIFF_FACE_COLOR,
  CLIFF_FACE_HEIGHT,
  WATERFALL_COLOR,
  WATERFALL_HIGHLIGHT,
  PLATEAU_Y_OFFSET,
} from '../utils/constants.js';
import { getElevation } from './elevation.js';
import { getTex } from './textureCache.js';

// Tile scale: 16px source → 48px display (for non-generated sprites)
const TILE_SCALE = WORLD_TILE_SIZE / 16;
// Ground tile scale for 16px source sprites: 1px overlap to eliminate dark gaps
const GROUND_SCALE_16 = (WORLD_TILE_SIZE + 1) / 16;
// Ground tile scale for 48px generated sprites: 1px overlap to eliminate dark gaps
const GROUND_SCALE_48 = (WORLD_TILE_SIZE + 1) / 48;

// Pre-compute a random hash for each tile (seeded by position)
function hashTile(r, c) {
  return ((r * 137 + c * 311) & 0xFFFF);
}

// Generated terrain texture names
const GRASS_TEX_NAMES = ['gen_grass_0', 'gen_grass_1', 'gen_grass_2'];
const DIRT_TEX_NAMES = ['gen_dirt_0', 'gen_dirt_1'];
const WATER_TEX_NAMES = ['gen_water_0', 'gen_water_1', 'gen_water_2'];
const STONE_TEX_NAMES = ['gen_stone_0', 'gen_stone_1'];

// Tile types that count as "grass" for transition checks
const GRASS_TYPES = new Set([TILE_GRASS, TILE_TREE, TILE_BUSH, TILE_PLATEAU_FLOOR, TILE_CLIFF_EDGE]);
const DIRT_TYPES = new Set([TILE_DIRT, TILE_HIGHWAY, TILE_DRY_LAKEBED, TILE_FARMLAND]);
const WATER_TYPES = new Set([TILE_WATER, TILE_SHALLOW_WATER, TILE_FLOODED_FLOOR, TILE_WATERFALL]);

/**
 * Get generated transition tile texture name for a dirt tile bordering grass.
 * Returns a texture where grass teeth bite into the dirt from the grass side.
 */
function getGrassDirtTransition(r, c, worldMap) {
  const getTile = (tr, tc) => {
    if (tr < 0 || tr >= WORLD_ROWS || tc < 0 || tc >= WORLD_COLS) return TILE_GRASS;
    return worldMap[tr][tc];
  };
  const gN = GRASS_TYPES.has(getTile(r - 1, c));
  const gS = GRASS_TYPES.has(getTile(r + 1, c));
  const gE = GRASS_TYPES.has(getTile(r, c + 1));
  const gW = GRASS_TYPES.has(getTile(r, c - 1));

  if (gN && gE) return 'gen_trans_grass_NE';
  if (gN && gW) return 'gen_trans_grass_NW';
  if (gS && gE) return 'gen_trans_grass_SE';
  if (gS && gW) return 'gen_trans_grass_SW';
  if (gN) return 'gen_trans_grass_N';
  if (gS) return 'gen_trans_grass_S';
  if (gE) return 'gen_trans_grass_E';
  if (gW) return 'gen_trans_grass_W';
  return null;
}

/**
 * Get shore transition texture name for water bordering grass.
 */
function getShoreTransition(r, c, worldMap) {
  const getTile = (tr, tc) => {
    if (tr < 0 || tr >= WORLD_ROWS || tc < 0 || tc >= WORLD_COLS) return TILE_WATER;
    return worldMap[tr][tc];
  };
  const gN = GRASS_TYPES.has(getTile(r - 1, c));
  const gS = GRASS_TYPES.has(getTile(r + 1, c));
  const gE = GRASS_TYPES.has(getTile(r, c + 1));
  const gW = GRASS_TYPES.has(getTile(r, c - 1));

  if (gN && gE) return 'gen_shore_NE';
  if (gN && gW) return 'gen_shore_NW';
  if (gS && gE) return 'gen_shore_SE';
  if (gS && gW) return 'gen_shore_SW';
  if (gN) return 'gen_shore_N';
  if (gS) return 'gen_shore_S';
  if (gE) return 'gen_shore_E';
  if (gW) return 'gen_shore_W';
  return null;
}

/**
 * Create the tile map renderer.
 * Returns a container (with sprites + graphics) and a render method.
 */
export function createTilemap() {
  const container = new Container();

  // Layer 1: ground tile sprites
  const groundContainer = new Container();
  container.addChild(groundContainer);

  // Layer 2: graphics overlays (animated effects, cliff faces, details)
  const gfx = new Graphics();
  container.addChild(gfx);

  // Layer 3: tree/bush/overlay sprites
  const overlayContainer = new Container();
  container.addChild(overlayContainer);

  // Layer 4: additional graphics on top of overlay sprites
  const overlayGfx = new Graphics();
  container.addChild(overlayGfx);

  // Sprite pool for ground tiles (larger to handle two-layer transitions)
  const GROUND_POOL_SIZE = 900;
  const groundPool = [];
  for (let i = 0; i < GROUND_POOL_SIZE; i++) {
    const s = new Sprite();
    s.visible = false;
    groundContainer.addChild(s);
    groundPool.push(s);
  }

  // Sprite pool for overlay objects (trees, bushes)
  const OVERLAY_POOL_SIZE = 100;
  const overlayPool = [];
  for (let i = 0; i < OVERLAY_POOL_SIZE; i++) {
    const s = new Sprite();
    s.visible = false;
    overlayContainer.addChild(s);
    overlayPool.push(s);
  }

  /**
   * Redraw visible tiles.
   */
  function render(worldMap, camX, camY, vpWidth, vpHeight, time) {
    gfx.clear();
    overlayGfx.clear();

    let groundIdx = 0;
    let overlayIdx = 0;

    // Calculate visible tile range
    const startCol = Math.max(0, Math.floor(-camX / WORLD_TILE_SIZE) - TILE_BUFFER);
    const startRow = Math.max(0, Math.floor(-camY / WORLD_TILE_SIZE) - TILE_BUFFER);
    const endCol = Math.min(WORLD_COLS - 1, Math.floor((-camX + vpWidth) / WORLD_TILE_SIZE) + TILE_BUFFER);
    const endRow = Math.min(WORLD_ROWS - 1, Math.floor((-camY + vpHeight) / WORLD_TILE_SIZE) + TILE_BUFFER);

    // Pass 1: ground tiles + cliff faces
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        const x = c * WORLD_TILE_SIZE;
        const y = r * WORLD_TILE_SIZE;
        const s = WORLD_TILE_SIZE;
        const elev = getElevation(c, r);

        // Draw cliff face below elevated tiles
        if (elev >= 1) {
          const southElev = r < WORLD_ROWS - 1 ? getElevation(c, r + 1) : 0;
          if (southElev < elev) {
            drawCliffFace(gfx, x, y + s, s, elev);
          }
        }

        const yOff = elev === 1 ? PLATEAU_Y_OFFSET : 0;
        groundIdx = drawGroundTile(groundPool, groundIdx, gfx, tileId, x, y + yOff, s, r, c, time, worldMap);
      }
    }

    // Pass 2: overlays (tree sprites, bush sprites, wall details, mountains, alien)
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        const x = c * WORLD_TILE_SIZE;
        const y = r * WORLD_TILE_SIZE;
        const s = WORLD_TILE_SIZE;
        const elev = getElevation(c, r);
        const yOff = elev === 1 ? PLATEAU_Y_OFFSET : 0;

        if (tileId === TILE_TREE) {
          overlayIdx = drawTreeSprite(overlayPool, overlayIdx, overlayGfx, x, y + yOff, s, r, c);
        } else if (tileId === TILE_BUSH) {
          overlayIdx = drawBushSprite(overlayPool, overlayIdx, overlayGfx, x, y + yOff, s, r, c);
        } else if (tileId === TILE_ALIEN) {
          drawAlienOverlay(overlayGfx, x, y + yOff, s, time);
        } else if (tileId === TILE_RUIN_WALL) {
          overlayIdx = drawRuinWallSprite(overlayPool, overlayIdx, overlayGfx, x, y + yOff, s, r, c);
        } else if (tileId === TILE_BASE_FLOOR) {
          drawBaseFloorDetail(overlayGfx, x, y + yOff, s, r, c, worldMap);
        } else if (tileId === TILE_MOUNTAIN_WALL) {
          drawMountainWallOverlay(overlayGfx, x, y, s, r, c);
        } else if (tileId === TILE_MOUNTAIN_TOP) {
          drawMountainTopOverlay(overlayGfx, x, y, s, r, c);
        }
      }
    }

    // Hide unused pool sprites
    for (let i = groundIdx; i < groundPool.length; i++) groundPool[i].visible = false;
    for (let i = overlayIdx; i < OVERLAY_POOL_SIZE; i++) overlayPool[i].visible = false;
  }

  return { gfx: container, render };
}

/* ──────────────── Ground tile rendering with sprites ──────────────── */

function drawGroundTile(pool, idx, gfx, tileId, x, y, s, r, c, time, worldMap) {
  const h = hashTile(r, c);
  const variant = (c * 3 + r * 7);
  let texName = null;

  switch (tileId) {
    case TILE_GRASS:
      texName = GRASS_TEX_NAMES[variant % 3];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    case TILE_DIRT: {
      // Check if this dirt tile borders grass — show grass teeth biting in
      const trans = worldMap ? getGrassDirtTransition(r, c, worldMap) : null;
      if (trans) {
        idx = placeGroundSprite(pool, idx, trans, x, y, s);
        return idx;
      }
      texName = DIRT_TEX_NAMES[variant % 2];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    }
    case TILE_TREE:
      texName = GRASS_TEX_NAMES[variant % 3]; // grass under tree
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    case TILE_BUSH:
      texName = GRASS_TEX_NAMES[variant % 3];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    case TILE_RUIN_FLOOR:
      texName = STONE_TEX_NAMES[h % STONE_TEX_NAMES.length];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      drawRuinFloorCracks(gfx, x, y, s, r, c);
      return idx;
    case TILE_RUIN_WALL:
      texName = STONE_TEX_NAMES[(h + 1) % STONE_TEX_NAMES.length];
      break;
    case TILE_RIVER:
      texName = DIRT_TEX_NAMES[h % DIRT_TEX_NAMES.length];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      drawCanyonOverlay(gfx, x, y, s, r, c);
      return idx;
    case TILE_ALIEN:
      gfx.rect(x, y, s, s);
      gfx.fill(ALIEN_BASE_COLOR);
      return idx;
    case TILE_BASE_FLOOR:
      texName = STONE_TEX_NAMES[0];
      break;
    case TILE_WATER:
      return drawWaterSpriteTile(pool, idx, gfx, x, y, s, r, c, time, false, worldMap);
    case TILE_SHALLOW_WATER:
      return drawWaterSpriteTile(pool, idx, gfx, x, y, s, r, c, time, true, worldMap);
    case TILE_FLOODED_FLOOR:
      texName = STONE_TEX_NAMES[h % STONE_TEX_NAMES.length];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      drawFloodedOverlay(gfx, x, y, s, r, c, time);
      return idx;
    case TILE_MOUNTAIN_WALL:
      texName = 'gen_mountain';
      break;
    case TILE_MOUNTAIN_TOP:
      texName = 'wall_grayWall';
      break;
    case TILE_PLATEAU_FLOOR:
      texName = 'gen_plateau';
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    case TILE_CLIFF_EDGE:
      texName = GRASS_TEX_NAMES[variant % 3];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      drawCliffEdgeOverlay(gfx, x, y, s);
      return idx;
    case TILE_RAMP:
      texName = DIRT_TEX_NAMES[0];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      drawRampOverlay(gfx, x, y, s, r, c);
      return idx;
    case TILE_DRY_LAKEBED:
      texName = DIRT_TEX_NAMES[h % DIRT_TEX_NAMES.length];
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      drawDryLakebedOverlay(gfx, x, y, s, r, c);
      return idx;
    case TILE_FARMLAND:
      texName = 'gen_farmland';
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    case TILE_CRATER_FLOOR:
      texName = 'gen_crater';
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    case TILE_HIGHWAY:
      texName = 'gen_highway';
      idx = placeGroundSprite(pool, idx, texName, x, y, s);
      return idx;
    case TILE_WATERFALL:
      drawWaterfallTile(gfx, x, y, s, r, c, time);
      return idx;
    default:
      texName = GRASS_TEX_NAMES[0];
  }

  idx = placeGroundSprite(pool, idx, texName, x, y, s);
  return idx;
}

function placeGroundSprite(pool, idx, texName, x, y, s, tint) {
  const tex = getTex(texName);
  if (!tex || idx >= pool.length) {
    return idx;
  }
  const sprite = pool[idx++];
  sprite.texture = tex;
  sprite.x = x;
  sprite.y = y;
  // Generated tiles are 48px, other sprites are 16px — use appropriate scale
  const scale = texName.startsWith('gen_') ? GROUND_SCALE_48 : GROUND_SCALE_16;
  sprite.scale.set(scale);
  sprite.tint = tint || 0xffffff;
  sprite.visible = true;
  return idx;
}

/* ──────────────── Water tile — sprite + animated overlay ──────────────── */

function drawWaterSpriteTile(pool, idx, gfx, x, y, s, r, c, time, isShallow, worldMap) {
  const h = hashTile(r, c);

  // Check for shore transitions — if water borders grass, use generated shore tile
  if (worldMap) {
    const shoreTex = getShoreTransition(r, c, worldMap);
    if (shoreTex) {
      idx = placeGroundSprite(pool, idx, shoreTex, x, y, s);
    } else if (isShallow) {
      idx = placeGroundSprite(pool, idx, 'gen_shallow_water', x, y, s);
    } else {
      // Animated water — cycle 3 frames
      const frameIdx = Math.floor(time * 1.25 + r * 0.3 + c * 0.2) % 3;
      idx = placeGroundSprite(pool, idx, WATER_TEX_NAMES[frameIdx], x, y, s);
    }
  } else {
    const frameIdx = Math.floor(time * 1.25 + r * 0.3 + c * 0.2) % 3;
    idx = placeGroundSprite(pool, idx, isShallow ? 'gen_shallow_water' : WATER_TEX_NAMES[frameIdx], x, y, s);
  }

  // Animated shimmer overlay
  const highlightAlpha = 0.06 + 0.04 * Math.sin(time * 1.2 + c * 0.7 + r * 0.4);
  gfx.rect(x, y, s, s);
  gfx.fill({ color: 0x6aaaca, alpha: highlightAlpha });

  // Flow direction lines
  if (h % 3 === 0) {
    const lineOffset = (time * 12 + h) % s;
    gfx.moveTo(x + lineOffset, y);
    gfx.lineTo(x + lineOffset + 8, y + s);
    gfx.stroke({ width: 0.5, color: 0x5a9aba, alpha: 0.2 });
  }

  return idx;
}

/* ──────────────── Flooded floor overlay ──────────────── */

function drawFloodedOverlay(gfx, x, y, s, r, c, time) {
  const wave = Math.sin(time * 0.8 + r * 0.5 + c * 0.3);
  const waterAlpha = 0.5 + 0.05 * wave;
  gfx.rect(x, y, s, s);
  gfx.fill({ color: FLOODED_FLOOR_COLOR, alpha: waterAlpha });

  const shimmer = 0.05 + 0.03 * Math.sin(time * 1.2 + c * 0.7);
  gfx.rect(x, y, s, s);
  gfx.fill({ color: 0x6aaaca, alpha: shimmer });

  const h = hashTile(r, c);
  if (h % 5 < 2) {
    gfx.rect(x, y, s / 3, s);
    gfx.fill({ color: 0x2a5a2a, alpha: 0.12 });
  }
}

/* ──────────────── Ruin floor cracks (graphics overlay) ──────────────── */

function drawRuinFloorCracks(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);
  if (h % 3 === 0) {
    gfx.moveTo(x + 8, y + 12);
    gfx.lineTo(x + 20, y + 30);
    gfx.lineTo(x + 15, y + 40);
    gfx.stroke({ width: 1, color: 0x3a3020, alpha: 0.5 });
  }
}

/* ──────────────── Canyon / dried river overlay ──────────────── */

function drawCanyonOverlay(gfx, x, y, s, r, c) {
  gfx.rect(x, y, s, 4);
  gfx.fill({ color: 0x5a4a32, alpha: 0.6 });
  gfx.rect(x, y + s - 6, s, 4);
  gfx.fill({ color: 0x3a2e20, alpha: 0.5 });
  gfx.rect(x, y + 14, s, s - 28);
  gfx.fill({ color: 0x2a2010, alpha: 0.4 });

  const h = hashTile(r, c);
  if (h % 3 === 0) {
    gfx.moveTo(x + 6, y + 3);
    gfx.lineTo(x + 10, y + 12);
    gfx.stroke({ width: 1, color: 0x0a0804, alpha: 0.5 });
  }
}

/* ──────────────── Cliff face below elevated tiles ──────────────── */

function drawCliffFace(gfx, x, y, s, elevation) {
  const faceH = CLIFF_FACE_HEIGHT;
  gfx.rect(x, y, s, faceH);
  gfx.fill(CLIFF_FACE_COLOR);
  gfx.rect(x, y + faceH - 6, s, 6);
  gfx.fill({ color: 0x000000, alpha: 0.25 });
  gfx.rect(x, y, s, 2);
  gfx.fill({ color: 0x8a9a6a, alpha: 0.4 });

  if (elevation >= 2) {
    gfx.rect(x, y + faceH, s, faceH);
    gfx.fill(0x4a5a2a);
    gfx.rect(x, y + faceH * 2 - 6, s, 6);
    gfx.fill({ color: 0x000000, alpha: 0.3 });
  }
}

/* ──────────────── Cliff edge overlay ──────────────── */

function drawCliffEdgeOverlay(gfx, x, y, s) {
  gfx.rect(x, y + s - 6, s, 6);
  gfx.fill({ color: 0x000000, alpha: 0.4 });
  gfx.moveTo(x, y + s - 6);
  gfx.lineTo(x + s, y + s - 6);
  gfx.stroke({ width: 2, color: CLIFF_EDGE_COLOR });
  gfx.rect(x, y + s - 3, s, 3);
  gfx.fill({ color: 0x2a1a08, alpha: 0.5 });
}

/* ──────────────── Ramp overlay ──────────────── */

function drawRampOverlay(gfx, x, y, s, r, c) {
  gfx.moveTo(x, y + s);
  gfx.lineTo(x + s, y + s);
  gfx.lineTo(x + s, y);
  gfx.lineTo(x, y + s * 0.4);
  gfx.closePath();
  gfx.fill({ color: 0x7a6a42, alpha: 0.25 });

  for (let i = 1; i < 4; i++) {
    const ly = y + (s * i) / 4;
    gfx.moveTo(x, ly);
    gfx.lineTo(x + s, ly);
    gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.35 });
  }
}

/* ──────────────── Dry lakebed overlay ──────────────── */

function drawDryLakebedOverlay(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);
  const cx = x + s / 2;
  const cy = y + s / 2;

  gfx.moveTo(cx, cy);
  gfx.lineTo(cx + 12 + (h % 8), cy - 14 - (h % 6));
  gfx.stroke({ width: 1, color: 0x5a4a32, alpha: 0.5 });
  gfx.moveTo(cx, cy);
  gfx.lineTo(cx - 10 - (h % 7), cy + 12 + (h % 5));
  gfx.stroke({ width: 1, color: 0x5a4a32, alpha: 0.4 });
  gfx.moveTo(cx, cy);
  gfx.lineTo(cx + 8 + (h % 6), cy + 10 + (h % 8));
  gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.35 });
}

/* ──────────────── Waterfall tile ──────────────── */

function drawWaterfallTile(gfx, x, y, s, r, c, time) {
  gfx.rect(x, y, s, s);
  gfx.fill(WATERFALL_COLOR);

  for (let i = 0; i < 5; i++) {
    const lx = x + 4 + i * (s / 5);
    const offset = (time * 80 + i * 17 + hashTile(r, c)) % s;
    const lineLen = 12 + (i % 3) * 4;
    gfx.moveTo(lx, y + offset);
    gfx.lineTo(lx + 1, y + offset + lineLen);
    gfx.stroke({ width: 2, color: WATERFALL_HIGHLIGHT, alpha: 0.5 + 0.2 * Math.sin(time * 3 + i) });
  }

  for (let i = 0; i < 3; i++) {
    const lx2 = x + 8 + i * (s / 3);
    const offset2 = (time * 100 + i * 31) % s;
    gfx.moveTo(lx2, y + offset2);
    gfx.lineTo(lx2, y + offset2 + 8);
    gfx.stroke({ width: 1.5, color: 0xaaddff, alpha: 0.3 });
  }

  gfx.rect(x, y, 3, s);
  gfx.fill({ color: 0xaaddff, alpha: 0.15 });
  gfx.rect(x + s - 3, y, 3, s);
  gfx.fill({ color: 0xaaddff, alpha: 0.15 });
}

/* ──────────────── Tree overlay — real sprites ──────────────── */

function drawTreeSprite(pool, idx, gfx, x, y, s, r, c) {
  const variant = hashTile(r, c) % 7;
  let texName;
  let treeW, treeH;

  if (variant === 0) {
    texName = 'tree1_greenOak';
    treeW = 112; treeH = 152;
  } else if (variant === 1) {
    texName = 'tree1_yellowOak';
    treeW = 112; treeH = 152;
  } else if (variant === 2) {
    texName = 'tree1_autumnOak';
    treeW = 112; treeH = 152;
  } else if (variant === 3) {
    texName = 'tree2_pine1';
    treeW = 96; treeH = 144;
  } else if (variant === 4) {
    // Nature pack forest trees
    texName = 'nature_treeForest1';
    treeW = 80; treeH = 96;
  } else if (variant === 5) {
    texName = 'nature_treeForest2';
    treeW = 80; treeH = 96;
  } else {
    texName = 'tree1_bareBrown';
    treeW = 112; treeH = 152;
  }

  const tex = getTex(texName);
  if (!tex || idx >= pool.length) return idx;

  // Shadow under tree
  const cx = x + s / 2;
  const baseY = y + s / 2 + 12;
  gfx.ellipse(cx + 4, baseY + 4, 28, 8);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Scale tree to be clearly larger than a tile (~1.8× tile width)
  const targetW = s * 1.8;
  const scale = targetW / treeW;

  const sprite = pool[idx++];
  sprite.texture = tex;
  sprite.anchor.set(0.5, 1.0); // bottom-center — tree grows upward from base
  sprite.x = cx;
  sprite.y = baseY + 8; // base of sprite sits at tree base
  sprite.scale.set(scale);
  sprite.visible = true;

  return idx;
}

/* ──────────────── Bush overlay — vegetation sprite ──────────────── */

function drawBushSprite(pool, idx, gfx, x, y, s, r, c) {
  const variant = hashTile(r, c) % 4;
  const bushNames = ['veg_bushGreen1', 'veg_bushGreen2', 'veg_bushGreen3', 'veg_bushYellow'];
  const texName = bushNames[variant];
  const tex = getTex(texName);

  if (!tex || idx >= pool.length) return idx;

  const cx = x + s / 2;
  const cy = y + s / 2;

  // Shadow
  gfx.ellipse(cx + 3, cy + 12, 18, 5);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  // Scale bush to roughly tile size
  const targetW = s * 0.9;
  const scale = targetW / 48; // vegetation bush sprites are ~48px

  const sprite = pool[idx++];
  sprite.texture = tex;
  sprite.anchor.set(0.5, 1.0); // bottom-center — bush grows upward from base
  sprite.x = cx;
  sprite.y = y + s; // base of sprite sits at bottom of tile
  sprite.scale.set(scale);
  sprite.visible = true;

  return idx;
}

/* ──────────────── Ruin wall — wall tile sprite + crack details ──────────────── */

function drawRuinWallSprite(pool, idx, gfx, x, y, s, r, c) {
  const h = hashTile(r, c);
  const wallNames = ['wall_brownWall', 'wall_grayWall', 'wall_darkWall'];
  const texName = wallNames[h % 3];
  const tex = getTex(texName);

  if (!tex || idx >= pool.length) {
    // Fallback to graphics
    drawRuinWallGraphics(gfx, x, y, s, r, c);
    return idx;
  }

  const sprite = pool[idx++];
  sprite.texture = tex;
  sprite.anchor.set(0, 0); // reset anchor for wall tiles (pool shared with trees/bushes)
  sprite.x = x;
  sprite.y = y;
  sprite.scale.set(TILE_SCALE);
  sprite.visible = true;

  // Add crack details on top
  if (h % 4 === 0) {
    gfx.moveTo(x + 8, y + 14);
    gfx.lineTo(x + 16, y + 30);
    gfx.stroke({ width: 0.8, color: 0x2a1a0a, alpha: 0.4 });
  }
  if (h % 3 === 0) {
    gfx.moveTo(x + s - 18, y + 16);
    gfx.lineTo(x + s - 22, y + 34);
    gfx.stroke({ width: 0.8, color: 0x2a1a0a, alpha: 0.35 });
  }
  // Subtle mortar lines (0.5px instead of chunky)
  gfx.moveTo(x, y + 10);
  gfx.lineTo(x + s, y + 10);
  gfx.stroke({ width: 0.5, color: 0x5a4a32, alpha: 0.2 });
  // Rounded corners — cut 2px from each corner
  gfx.rect(x, y, 2, 2);
  gfx.fill({ color: 0x8a7a62, alpha: 0.6 });
  gfx.rect(x + s - 2, y, 2, 2);
  gfx.fill({ color: 0x8a7a62, alpha: 0.6 });
  // Vertical crack line for walls in long sections (age/damage)
  if (h % 5 === 0) {
    const crackX = x + s / 2 + (h % 4) - 2;
    gfx.moveTo(crackX, y + 4);
    gfx.lineTo(crackX + 1, y + s - 4);
    gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.3 });
  }

  return idx;
}

/* Fallback ruin wall in graphics (kept for safety) */
function drawRuinWallGraphics(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);
  // Thinner top face (6px instead of 12)
  gfx.rect(x, y, s, 6);
  gfx.fill(0xc4b49a);
  // Thinner front face (20px instead of 28)
  gfx.rect(x, y + 6, s, 20);
  gfx.fill(0x9a8a72);
  gfx.rect(x, y + 26, s, s - 26);
  gfx.fill(0x8a7a62);
  gfx.rect(x + s - 6, y + 6, 6, s - 6);
  gfx.fill(0x4a3a28);
  // Rounded corners — cut 2px from each corner with bg color
  gfx.rect(x, y, 2, 2);
  gfx.fill(0x8a7a62);
  gfx.rect(x + s - 2, y, 2, 2);
  gfx.fill(0x8a7a62);
  // Subtle mortar lines (0.5px)
  gfx.moveTo(x, y + 10);
  gfx.lineTo(x + s, y + 10);
  gfx.stroke({ width: 0.5, color: 0x5a4a32, alpha: 0.25 });
  gfx.moveTo(x, y + 18);
  gfx.lineTo(x + s, y + 18);
  gfx.stroke({ width: 0.5, color: 0x5a4a32, alpha: 0.25 });
}

/* ──────────────── Mountain wall overlay — 3/4 stacked blocks ──────────────── */

function drawMountainWallOverlay(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);

  gfx.rect(x, y, s, 10);
  gfx.fill(MOUNTAIN_TOP_COLORS[h % 2]);
  gfx.rect(x, y + 10, s, 18);
  gfx.fill(MOUNTAIN_WALL_COLORS[0]);
  gfx.rect(x, y + 28, s, 12);
  gfx.fill(0x4a4238);
  gfx.rect(x, y + 40, s, s - 40);
  gfx.fill(0x3a3228);
  gfx.rect(x + s - 6, y + 10, 6, s - 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  if (h % 3 === 0) {
    gfx.moveTo(x + 8, y + 14);
    gfx.lineTo(x + 20, y + 26);
    gfx.stroke({ width: 0.8, color: 0x3a3228, alpha: 0.4 });
  }

  if (r < 8 || h % 6 === 0) {
    gfx.rect(x + 2, y + 1, s - 4, 6);
    gfx.fill({ color: MOUNTAIN_SNOW_COLOR, alpha: 0.6 });
  }
}

/* ──────────────── Mountain top overlay ──────────────── */

function drawMountainTopOverlay(gfx, x, y, s, r, c) {
  const h = hashTile(r, c);

  gfx.rect(x, y, s, s);
  gfx.fill(MOUNTAIN_TOP_COLORS[h % 2]);
  gfx.rect(x + 3, y + 3, s - 6, s - 6);
  gfx.fill({ color: MOUNTAIN_SNOW_COLOR, alpha: 0.5 });

  if (h % 4 < 2) {
    gfx.rect(x + 10 + (h % 12), y + 8 + (h % 10), 10, 8);
    gfx.fill({ color: MOUNTAIN_WALL_COLORS[0], alpha: 0.6 });
  }
}

/* ──────────────── Alien structure overlay ──────────────── */

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

/* ──────────────── Base floor detail ──────────────── */

function drawBaseFloorDetail(gfx, x, y, s, r, c) {
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
