/**
 * Isometric props system — places decorative props and trees on the world.
 * Props are depth-sorted with tiles using painter's algorithm.
 *
 * Props are placed based on tile types (trees on TILE_TREE, etc.) and
 * fixed positions for buildings and special objects.
 */

import { Container, Sprite } from 'pixi.js';
import { gridToScreen, getSortDepth } from './iso.js';
import {
  ISO_TILE_W,
  ISO_TILE_H,
  ISO_TILE_SCALE,
  MAP_COLS,
  MAP_ROWS,
  TILE_TREE,
  TILE_BUSH,
} from '../utils/constants.js';
import { getIsoTex, getIsoPropTex, getIsoBuildingTex } from './textureCache.js';

function hashTile(r, c) {
  return ((r * 137 + c * 311) & 0xFFFF);
}

// Building placements in base camp area
const BUILDING_PLACEMENTS = [
  { key: 'house1', col: 5,  row: 73, scaleW: 4, scaleH: 4, label: 'shelter' },
  { key: 'house2', col: 12, row: 71, scaleW: 4, scaleH: 5, label: 'crafting' },
  { key: 'house3', col: 5,  row: 68, scaleW: 4, scaleH: 4, label: 'barn' },
  { key: 'well',   col: 9,  row: 72, scaleW: 2, scaleH: 2, label: 'well' },
];

// Fixed prop placements (campfire, carts, etc.)
const FIXED_PROPS = [
  { key: 'campfire',  col: 8,  row: 74 },
  { key: 'barrel1',   col: 10, row: 75 },
  { key: 'barrel2',   col: 14, row: 73 },
  { key: 'crate1',    col: 16, row: 72 },
  { key: 'crate2',    col: 7,  row: 70 },
  { key: 'woodPile1', col: 11, row: 69 },
  { key: 'sign2',     col: 3,  row: 75 },
  { key: 'pot1',      col: 9,  row: 69 },
  { key: 'haybale',   col: 6,  row: 66 },
  { key: 'fence1',    col: 4,  row: 67 },
  { key: 'fence2',    col: 5,  row: 67 },
  { key: 'fence3',    col: 6,  row: 67 },
  { key: 'cart1',     col: 15, row: 74, isCart: true },
  { key: 'cart2',     col: 25, row: 73, isCart: true },
];

/**
 * Create the isometric props renderer.
 */
export function createPropsRenderer() {
  const container = new Container();

  const POOL_SIZE = 400;
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const s = new Sprite();
    s.visible = false;
    container.addChild(s);
    pool.push(s);
  }

  let lastCamCol = -999;
  let lastCamRow = -999;

  function render(camX, camY, vpWidth, vpHeight) {
    const centerWorldX = -camX + vpWidth / 2;
    const centerWorldY = -camY + vpHeight / 2;
    const centerCol = (centerWorldX / (ISO_TILE_W / 2) + centerWorldY / (ISO_TILE_H / 2)) / 2;
    const centerRow = (centerWorldY / (ISO_TILE_H / 2) - centerWorldX / (ISO_TILE_W / 2)) / 2;

    const camCol = Math.floor(centerCol);
    const camRow = Math.floor(centerRow);
    if (Math.abs(camCol - lastCamCol) < 1 && Math.abs(camRow - lastCamRow) < 1) {
      return;
    }
    lastCamCol = camCol;
    lastCamRow = camRow;

    let idx = 0;

    // Place tree and bush sprites from worldMap
    const viewRadius = Math.ceil(vpWidth / ISO_TILE_W) + 6;
    const startCol = Math.max(0, camCol - viewRadius);
    const endCol = Math.min(MAP_COLS - 1, camCol + viewRadius);
    const startRow = Math.max(0, camRow - viewRadius);
    const endRow = Math.min(MAP_ROWS - 1, camRow + viewRadius);

    // Collect props for depth sorting
    const visibleProps = [];

    // Tree/bush props from world map
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = _worldMapRef[r]?.[c];
        if (tileId === TILE_TREE) {
          const h = hashTile(r, c);
          const isOak = h % 3 === 0;
          visibleProps.push({
            col: c, row: r,
            texKey: isOak ? 'oakTree' : 'pineTree',
            isProp: true,
            scale: 0.18,
            anchorX: 0.5,
            anchorY: 0.85,
            depth: getSortDepth(c, r) + 0.5,
          });
        } else if (tileId === TILE_BUSH) {
          visibleProps.push({
            col: c, row: r,
            texKey: 'bush1',
            isProp: true,
            scale: 0.35,
            anchorX: 0.5,
            anchorY: 0.8,
            depth: getSortDepth(c, r) + 0.5,
          });
        }
      }
    }

    // Fixed props
    for (const prop of FIXED_PROPS) {
      if (prop.col >= startCol && prop.col <= endCol &&
          prop.row >= startRow && prop.row <= endRow) {
        const tex = prop.isCart
          ? getIsoPropTex(prop.key)
          : getIsoPropTex(prop.key);
        if (tex) {
          visibleProps.push({
            col: prop.col, row: prop.row,
            tex,
            isProp: false,
            scale: prop.isCart ? 0.2 : 0.35,
            anchorX: 0.5,
            anchorY: 0.8,
            depth: getSortDepth(prop.col, prop.row) + 0.5,
          });
        }
      }
    }

    // Buildings
    for (const bldg of BUILDING_PLACEMENTS) {
      if (bldg.col + bldg.scaleW >= startCol && bldg.col <= endCol &&
          bldg.row + bldg.scaleH >= startRow && bldg.row <= endRow) {
        const tex = getIsoBuildingTex(bldg.key);
        if (tex) {
          visibleProps.push({
            col: bldg.col + bldg.scaleW / 2, row: bldg.row + bldg.scaleH / 2,
            tex,
            isProp: false,
            scale: (bldg.scaleW * ISO_TILE_W) / tex.width,
            anchorX: 0.5,
            anchorY: 0.7,
            depth: getSortDepth(bldg.col + bldg.scaleW, bldg.row + bldg.scaleH),
          });
        }
      }
    }

    // Sort by depth (painter's algorithm)
    visibleProps.sort((a, b) => a.depth - b.depth);

    // Render
    for (const p of visibleProps) {
      if (idx >= POOL_SIZE) break;

      let tex;
      if (p.isProp) {
        tex = getIsoPropTex(p.texKey);
      } else {
        tex = p.tex;
      }
      if (!tex) continue;

      const screen = gridToScreen(p.col, p.row);
      const sprite = pool[idx++];
      sprite.texture = tex;
      sprite.anchor.set(p.anchorX, p.anchorY);
      sprite.x = screen.x;
      sprite.y = screen.y;
      sprite.scale.set(p.scale);
      sprite.tint = 0xffffff;
      sprite.visible = true;
    }

    for (let i = idx; i < POOL_SIZE; i++) {
      pool[i].visible = false;
    }
  }

  // Store worldMap reference for tree/bush detection
  let _worldMapRef = null;
  function setWorldMap(wm) { _worldMapRef = wm; }

  return { gfx: container, render, setWorldMap };
}

/**
 * Get the building collision footprints (impassable tiles).
 * Returns array of { col, row } for all tiles occupied by buildings.
 */
export function getBuildingCollisionTiles() {
  const tiles = [];
  for (const bldg of BUILDING_PLACEMENTS) {
    for (let r = bldg.row; r < bldg.row + bldg.scaleH; r++) {
      for (let c = bldg.col; c < bldg.col + bldg.scaleW; c++) {
        tiles.push({ col: c, row: r });
      }
    }
  }
  return tiles;
}
