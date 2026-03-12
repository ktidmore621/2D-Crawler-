/**
 * Isometric tile map rendering system.
 * Renders visible tiles as isometric diamonds using sprite textures from the
 * iso asset pack. Uses viewport culling with a tile buffer for performance.
 */

import { Container, Sprite } from 'pixi.js';
import { gridToScreen } from './iso.js';
import {
  ISO_TILE_W,
  ISO_TILE_H,
  ISO_TILE_SCALE,
  MAP_COLS,
  MAP_ROWS,
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
} from '../utils/constants.js';
import { getIsoTex } from './textureCache.js';

const TILE_BUFFER = 4;

function hashTile(r, c) {
  return ((r * 137 + c * 311) & 0xFFFF);
}

/**
 * Create the isometric tile map renderer.
 */
export function createTilemap() {
  const container = new Container();

  const POOL_SIZE = 1200;
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const s = new Sprite();
    s.visible = false;
    s.anchor.set(0.5, 0.5);
    container.addChild(s);
    pool.push(s);
  }

  let lastCamCol = -999;
  let lastCamRow = -999;

  function render(worldMap, camX, camY, vpWidth, vpHeight) {
    const centerWorldX = -camX + vpWidth / 2;
    const centerWorldY = -camY + vpHeight / 2;
    const centerCol = (centerWorldX / (ISO_TILE_W / 2) + centerWorldY / (ISO_TILE_H / 2)) / 2;
    const centerRow = (centerWorldY / (ISO_TILE_H / 2) - centerWorldX / (ISO_TILE_W / 2)) / 2;

    const tilesPerHalfW = Math.ceil(vpWidth / ISO_TILE_W) + TILE_BUFFER;
    const tilesPerHalfH = Math.ceil(vpHeight / ISO_TILE_H) + TILE_BUFFER;
    const viewRadius = Math.max(tilesPerHalfW, tilesPerHalfH);

    const camCol = Math.floor(centerCol);
    const camRow = Math.floor(centerRow);
    if (Math.abs(camCol - lastCamCol) < 1 && Math.abs(camRow - lastCamRow) < 1) {
      return;
    }
    lastCamCol = camCol;
    lastCamRow = camRow;

    let idx = 0;

    const startCol = Math.max(0, camCol - viewRadius);
    const endCol = Math.min(MAP_COLS - 1, camCol + viewRadius);
    const startRow = Math.max(0, camRow - viewRadius);
    const endRow = Math.min(MAP_ROWS - 1, camRow + viewRadius);

    for (let depth = startCol + startRow; depth <= endCol + endRow; depth++) {
      const minC = Math.max(startCol, depth - endRow);
      const maxC = Math.min(endCol, depth - startRow);
      for (let c = minC; c <= maxC; c++) {
        const r = depth - c;
        if (r < startRow || r > endRow) continue;
        if (idx >= POOL_SIZE) break;

        const tileId = worldMap[r][c];
        const tex = getTileTexture(tileId, c, r);
        if (!tex) continue;

        const screen = gridToScreen(c, r);
        const sprite = pool[idx++];
        sprite.texture = tex;
        sprite.x = screen.x;
        sprite.y = screen.y;
        sprite.scale.set(ISO_TILE_SCALE);
        sprite.anchor.set(0.5, 0.5);
        sprite.tint = 0xffffff;
        sprite.visible = true;

        if (tileId === TILE_WATER || tileId === TILE_WATERFALL) {
          sprite.tint = 0x8888ff;
        } else if (tileId === TILE_SHALLOW_WATER || tileId === TILE_FLOODED_FLOOR) {
          sprite.tint = 0xaaaaff;
        }
      }
    }

    for (let i = idx; i < POOL_SIZE; i++) {
      pool[i].visible = false;
    }
  }

  return { gfx: container, render };
}

function getTileTexture(tileId, col, row) {
  const h = hashTile(row, col);

  switch (tileId) {
    case TILE_GRASS:
    case TILE_TREE:
    case TILE_BUSH:
      return getIsoTex('flatGrass', h);
    case TILE_DIRT:
    case TILE_DRY_LAKEBED:
      return getIsoTex('flatDirt', h);
    case TILE_RUIN_FLOOR:
    case TILE_BASE_FLOOR:
      return getIsoTex('flatStone', h);
    case TILE_RUIN_WALL:
      return getIsoTex('stone', h);
    case TILE_RIVER:
      return getIsoTex('flatDirt', h);
    case TILE_ALIEN:
      return getIsoTex('rock', h);
    case TILE_WATER:
    case TILE_WATERFALL:
      return getIsoTex('flatGrass', h);
    case TILE_SHALLOW_WATER:
    case TILE_FLOODED_FLOOR:
      return getIsoTex('flatGrass', h);
    case TILE_MOUNTAIN_WALL:
    case TILE_MOUNTAIN_TOP:
    case TILE_CLIFF_EDGE:
      return getIsoTex('rock', h);
    case TILE_PLATEAU_FLOOR:
      return getIsoTex('grass', h);
    case TILE_RAMP:
      return getIsoTex('rampN', 0);
    case TILE_FARMLAND:
      return getIsoTex('flatDirt', h);
    case TILE_CRATER_FLOOR:
      return getIsoTex('flatStone', h);
    case TILE_HIGHWAY:
      return getIsoTex('flatStone', h);
    default:
      return getIsoTex('flatGrass', h);
  }
}
