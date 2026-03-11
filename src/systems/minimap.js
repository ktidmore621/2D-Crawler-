/**
 * Mini map overlay — renders a scaled-down view of the 160×160 world.
 * Uses an offscreen canvas for the terrain (rendered once at startup).
 * Player dot updates only when player moves more than 1 tile.
 */

import { Container, Graphics, Sprite, Texture, Text } from 'pixi.js';
import {
  WORLD_COLS,
  WORLD_ROWS,
  WORLD_TILE_SIZE,
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
  AMBER_HEX,
} from '../utils/constants.js';
import {
  CAVE_TRIGGERS,
  TUNNEL_TRIGGER,
  DUNGEON_TILE_ROW,
  DUNGEON_TILE_COL,
} from '../data/worldMap.js';

// ── Tile → mini map color (as [r,g,b]) ──────────────────
function hexToRGB(hex) {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

const TILE_COLOR_MAP = {
  [TILE_GRASS]: hexToRGB(0x4a7a30),
  [TILE_DIRT]: hexToRGB(0x9a7248),
  [TILE_TREE]: hexToRGB(0x1a3310),
  [TILE_BUSH]: hexToRGB(0x1a3310),
  [TILE_RUIN_FLOOR]: hexToRGB(0x7a6a58),
  [TILE_RUIN_WALL]: hexToRGB(0x7a6a58),
  [TILE_RIVER]: hexToRGB(0x9a7248),
  [TILE_ALIEN]: hexToRGB(0x1a3310),
  [TILE_BASE_FLOOR]: hexToRGB(0x7a6a58),
  [TILE_WATER]: hexToRGB(0x2a5a8a),
  [TILE_SHALLOW_WATER]: hexToRGB(0x3a7aaa),
  [TILE_FLOODED_FLOOR]: hexToRGB(0x3a7aaa),
  [TILE_MOUNTAIN_WALL]: hexToRGB(0x6a6258),
  [TILE_MOUNTAIN_TOP]: hexToRGB(0x6a6258),
  [TILE_PLATEAU_FLOOR]: hexToRGB(0x6a7a4a),
  [TILE_CLIFF_EDGE]: hexToRGB(0x6a6258),
  [TILE_RAMP]: hexToRGB(0x9a7248),
  [TILE_DRY_LAKEBED]: hexToRGB(0x9a7248),
  [TILE_FARMLAND]: hexToRGB(0x7a5a32),
  [TILE_CRATER_FLOOR]: hexToRGB(0x2a2218),
  [TILE_HIGHWAY]: hexToRGB(0x4a4844),
  [TILE_WATERFALL]: hexToRGB(0x3a7aaa),
};

const DEFAULT_COLOR = hexToRGB(0x4a7a30);

const SMALL_SIZE = 120;
const EXPANDED_SIZE = 200;
const MARGIN = 20;

/**
 * Create the mini map system.
 * @param {number[][]} worldMap - the 160×160 tile array
 * @returns {{ container, update, destroy }}
 */
export function createMiniMap(worldMap) {
  const container = new Container();
  let currentSize = SMALL_SIZE;
  let expanded = false;
  let lastLayoutSize = -1;

  // ── Offscreen canvas — 1 pixel per tile ────────────────
  const offCanvas = document.createElement('canvas');
  offCanvas.width = WORLD_COLS;
  offCanvas.height = WORLD_ROWS;
  const offCtx = offCanvas.getContext('2d');

  // Draw terrain
  _drawTerrain(offCtx, worldMap);
  // Draw entrance markers + town center
  _drawEntrances(offCtx);
  _drawTownCenter(offCtx);

  // Create texture from canvas
  const terrainTexture = Texture.from(offCanvas);
  terrainTexture.source.scaleMode = 'nearest';

  // ── Background + border ────────────────────────────────
  const bg = new Graphics();
  container.addChild(bg);

  // ── Terrain sprite ─────────────────────────────────────
  const terrainSprite = new Sprite(terrainTexture);
  container.addChild(terrainSprite);

  // ── Player dot ─────────────────────────────────────────
  const playerDot = new Graphics();
  container.addChild(playerDot);

  // ── Label ──────────────────────────────────────────────
  const label = new Text({
    text: 'MAP',
    style: {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: 10,
      fill: AMBER_HEX,
      letterSpacing: 2,
    },
  });
  container.addChild(label);

  // Track last player tile for dirty check
  let lastTileCol = -1;
  let lastTileRow = -1;
  let needsRedraw = true;

  // ── Click/tap to toggle size ───────────────────────────
  bg.eventMode = 'static';
  bg.cursor = 'pointer';
  terrainSprite.eventMode = 'static';
  terrainSprite.cursor = 'pointer';
  const toggle = () => {
    expanded = !expanded;
    currentSize = expanded ? EXPANDED_SIZE : SMALL_SIZE;
    needsRedraw = true;
    lastLayoutSize = -1;
  };
  bg.on('pointerdown', toggle);
  terrainSprite.on('pointerdown', toggle);

  function _layout(vpWidth) {
    if (lastLayoutSize === currentSize) return;
    lastLayoutSize = currentSize;

    const mapX = vpWidth - currentSize - MARGIN;
    const mapY = MARGIN + 14; // room for label above

    // Background + border
    bg.clear();
    bg.rect(mapX - 1, mapY - 1, currentSize + 2, currentSize + 2);
    bg.fill({ color: 0xc07a2a, alpha: 1 });
    bg.rect(mapX, mapY, currentSize, currentSize);
    bg.fill({ color: 0x0a0805, alpha: 0.8 });

    // Position + scale terrain sprite
    terrainSprite.x = mapX;
    terrainSprite.y = mapY;
    terrainSprite.width = currentSize;
    terrainSprite.height = currentSize;

    // Label
    label.x = mapX;
    label.y = mapY - 14;
  }

  /**
   * Update mini map. Call each frame from GameScene.
   */
  function update(playerX, playerY, vpWidth) {
    const tileCol = Math.floor(playerX / WORLD_TILE_SIZE);
    const tileRow = Math.floor(playerY / WORLD_TILE_SIZE);

    if (tileCol !== lastTileCol || tileRow !== lastTileRow) {
      needsRedraw = true;
      lastTileCol = tileCol;
      lastTileRow = tileRow;
    }

    if (!needsRedraw) return;
    needsRedraw = false;

    _layout(vpWidth);

    const mapX = vpWidth - currentSize - MARGIN;
    const mapY = MARGIN + 14;

    // Player dot (2×2 amber)
    const px = mapX + (playerX / (WORLD_COLS * WORLD_TILE_SIZE)) * currentSize;
    const py = mapY + (playerY / (WORLD_ROWS * WORLD_TILE_SIZE)) * currentSize;
    playerDot.clear();
    playerDot.rect(px - 1, py - 1, 3, 3);
    playerDot.fill(0xc07a2a);
  }

  function destroy() {
    terrainTexture.destroy(true);
    container.destroy({ children: true });
  }

  return { container, update, destroy };
}

/* ── Private helpers ──────────────────────────────────── */

function _drawTerrain(ctx, worldMap) {
  const imgData = ctx.createImageData(WORLD_COLS, WORLD_ROWS);
  const data = imgData.data;

  for (let r = 0; r < WORLD_ROWS; r++) {
    for (let c = 0; c < WORLD_COLS; c++) {
      const tileId = worldMap[r][c];
      const rgb = TILE_COLOR_MAP[tileId] || DEFAULT_COLOR;
      const idx = (r * WORLD_COLS + c) * 4;
      data[idx] = rgb[0];
      data[idx + 1] = rgb[1];
      data[idx + 2] = rgb[2];
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function _drawEntrances(ctx) {
  ctx.fillStyle = '#ffffff';
  // Cave entrances
  for (const cave of CAVE_TRIGGERS) {
    ctx.fillRect(cave.col, cave.row, 2, 2);
  }
  // Tunnel entrance
  ctx.fillRect(TUNNEL_TRIGGER.col, TUNNEL_TRIGGER.row, 2, 2);
  // Dungeon entrance
  ctx.fillRect(DUNGEON_TILE_COL, DUNGEON_TILE_ROW, 2, 2);
}

function _drawTownCenter(ctx) {
  // Town center cluster around cols 97-104, rows 53-58
  ctx.fillStyle = '#8a8a8a';
  const dots = [
    [55, 100], [55, 101], [56, 100], [56, 101],
    [54, 99], [54, 102], [57, 99], [57, 102],
  ];
  for (const [r, c] of dots) {
    ctx.fillRect(c, r, 1, 1);
  }
}
