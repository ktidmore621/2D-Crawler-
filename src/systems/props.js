/**
 * Isometric props system — places decorative props and trees on the world.
 * Props are depth-sorted with tiles using painter's algorithm.
 *
 * Trees are placed via three systems:
 *   A) Dense forest patches (12 clusters)
 *   B) Tree lines along paths and water edges
 *   C) Orchard rows near village
 */

import { Container, Sprite } from 'pixi.js';
import { gridToScreen, getSortDepth } from './iso.js';
import {
  ISO_TILE_W,
  ISO_TILE_H,
  MAP_COLS,
  MAP_ROWS,
  TILE_GRASS,
  TILE_DIRT,
  TILE_BUSH,
  TILE_WATER,
  TILE_SHALLOW_WATER,
} from '../utils/constants.js';
import { getIsoPropTex, getIsoBuildingTex } from './textureCache.js';

// ── Seeded RNG for deterministic tree placement ──────────
class SeededRandom {
  constructor(seed) {
    this._seed = seed;
  }
  next() {
    this._seed = (this._seed * 16807 + 0) % 2147483647;
    return (this._seed & 0xFFFF) / 0xFFFF;
  }
}

// ── Village center coordinates ───────────────────────────
const VC_COL = 75;
const VC_ROW = 140;

// ── Building placements — scattered homestead layout ─────
const BUILDING_PLACEMENTS = [
  { key: 'house1', col: VC_COL - 2, row: VC_ROW - 8, scaleW: 4, scaleH: 4, label: 'shelter' },
  { key: 'house2', col: VC_COL + 10, row: VC_ROW - 4, scaleW: 4, scaleH: 4, label: 'crafting' },
  { key: 'house3', col: VC_COL - 14, row: VC_ROW - 2, scaleW: 4, scaleH: 4, label: 'barn' },
  { key: 'well',   col: VC_COL,     row: VC_ROW - 2, scaleW: 2, scaleH: 2, label: 'well' },
];

// ── Fixed prop placements around village ─────────────────
const FIXED_PROPS = [
  { key: 'campfire',  col: VC_COL + 2,  row: VC_ROW + 2 },
  { key: 'barrel1',   col: VC_COL + 12, row: VC_ROW + 1 },
  { key: 'barrel2',   col: VC_COL - 12, row: VC_ROW + 3 },
  { key: 'crate1',    col: VC_COL + 8,  row: VC_ROW - 6 },
  { key: 'crate2',    col: VC_COL - 4,  row: VC_ROW - 10 },
  { key: 'woodPile1', col: VC_COL - 10, row: VC_ROW - 5 },
  { key: 'sign2',     col: VC_COL - 6,  row: VC_ROW + 5 },
  { key: 'pot1',      col: VC_COL + 3,  row: VC_ROW - 4 },
  { key: 'haybale',   col: VC_COL - 13, row: VC_ROW + 4 },
  { key: 'fence1',    col: VC_COL + 6,  row: VC_ROW - 8 },
  { key: 'fence2',    col: VC_COL + 7,  row: VC_ROW - 8 },
  { key: 'fence3',    col: VC_COL + 8,  row: VC_ROW - 8 },
  { key: 'cart1',     col: VC_COL + 14, row: VC_ROW + 3, isCart: true },
  { key: 'cart2',     col: VC_COL - 16, row: VC_ROW + 5, isCart: true },
];

// ── Forest patch definitions (System A) ──────────────────
const FOREST_PATCHES = [
  { col: 20,  row: 20,  count: 12, radius: 5 },
  { col: 50,  row: 15,  count: 10, radius: 4 },
  { col: 130, row: 25,  count: 14, radius: 6 },
  { col: 15,  row: 60,  count: 11, radius: 5 },
  { col: 140, row: 70,  count: 13, radius: 5 },
  { col: 30,  row: 100, count: 9,  radius: 4 },
  { col: 120, row: 110, count: 12, radius: 5 },
  { col: 55,  row: 130, count: 8,  radius: 4 },
  { col: 100, row: 135, count: 10, radius: 4 },
  { col: 10,  row: 145, count: 11, radius: 5 },
  { col: 145, row: 140, count: 13, radius: 6 },
  { col: 80,  row: 30,  count: 9,  radius: 4 },
];

// Maximum total trees
const MAX_TREES = 400;

// ── Pre-compute all tree positions once ──────────────────
let _treePlacements = null;

function computeTreePlacements(worldMap) {
  if (_treePlacements) return _treePlacements;

  const placed = []; // { col, row, type }
  const occupied = new Set(); // "col,row" keys for spacing check

  function isNearTree(c, r) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (occupied.has(`${c + dc},${r + dr}`)) return true;
      }
    }
    return false;
  }

  function isNearBuilding(c, r) {
    for (const bldg of BUILDING_PLACEMENTS) {
      const bCenterC = bldg.col + bldg.scaleW / 2;
      const bCenterR = bldg.row + bldg.scaleH / 2;
      if (Math.abs(c - bCenterC) < 6 + bldg.scaleW / 2 &&
          Math.abs(r - bCenterR) < 6 + bldg.scaleH / 2) return true;
    }
    return false;
  }

  function isNearSpawn(c, r) {
    return Math.abs(c - VC_COL) <= 4 && Math.abs(r - VC_ROW) <= 4;
  }

  function isOnDirtPath(c, r) {
    if (!worldMap || r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return false;
    // Check 2-tile radius around dirt path centerline
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
          if (worldMap[nr][nc] === TILE_DIRT) return true;
        }
      }
    }
    return false;
  }

  function isGrassTile(c, r) {
    if (!worldMap || r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return false;
    return worldMap[r][c] === TILE_GRASS;
  }

  function tryPlaceTree(c, r, type) {
    if (placed.length >= MAX_TREES) return false;
    c = Math.max(1, Math.min(MAP_COLS - 2, Math.round(c)));
    r = Math.max(1, Math.min(MAP_ROWS - 2, Math.round(r)));
    if (!isGrassTile(c, r)) return false;
    if (isNearTree(c, r)) return false;
    if (isNearBuilding(c, r)) return false;
    if (isNearSpawn(c, r)) return false;
    placed.push({ col: c, row: r, type });
    occupied.add(`${c},${r}`);
    return true;
  }

  // ── System A: Dense forest patches ───────────────────
  for (const patch of FOREST_PATCHES) {
    for (let i = 0; i < patch.count; i++) {
      const rng = new SeededRandom(patch.col * 100 + patch.row + i);
      const angle = rng.next() * Math.PI * 2;
      const dist = rng.next() * patch.radius;
      const tc = Math.round(patch.col + Math.cos(angle) * dist);
      const tr = Math.round(patch.row + Math.sin(angle) * dist);
      const treeType = rng.next() > 0.5 ? 'oakTree' : 'pineTree';
      tryPlaceTree(tc, tr, treeType);
    }
  }

  // ── System B: Tree lines along paths ─────────────────
  if (worldMap) {
    let pathIndex = 0;
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (worldMap[r][c] !== TILE_DIRT) continue;
        pathIndex++;
        // Every 3rd dirt tile, place a tree 2 tiles off to one side
        if (pathIndex % 3 !== 0) continue;
        const side = (pathIndex % 6 < 3) ? 2 : -2;
        // Try col offset first, then row offset
        const rng = new SeededRandom(r * 160 + c);
        if (rng.next() > 0.5) {
          tryPlaceTree(c + side, r, 'oakTree');
        } else {
          tryPlaceTree(c, r + side, 'oakTree');
        }
      }
    }

    // Tree lines along water edges
    let waterIndex = 0;
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tid = worldMap[r][c];
        if (tid !== TILE_WATER && tid !== TILE_SHALLOW_WATER) continue;
        // Check if this is a water edge (adjacent to non-water)
        let isEdge = false;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
              const adj = worldMap[nr][nc];
              if (adj === TILE_GRASS) isEdge = true;
            }
          }
        }
        if (!isEdge) continue;
        waterIndex++;
        if (waterIndex % 5 !== 0) continue;
        // Place tree 2 tiles back from waterline toward grass
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
              if (worldMap[nr][nc] === TILE_GRASS && !isOnDirtPath(nc, nr)) {
                tryPlaceTree(nc, nr, 'pineTree');
                dr = 3; // break outer loop
                break;
              }
            }
          }
        }
      }
    }
  }

  // ── System C: Orchard rows near village ──────────────
  // Orchard row 1 — east of village
  for (let i = 0; i < 5; i++) {
    tryPlaceTree(VC_COL + 16 + i * 3, VC_ROW + 2, 'oakTree');
  }
  // Orchard row 2 — south of village
  for (let i = 0; i < 5; i++) {
    tryPlaceTree(VC_COL + i * 3 - 6, VC_ROW + 8, 'oakTree');
  }

  _treePlacements = placed;
  return placed;
}

/**
 * Create the isometric props renderer.
 */
export function createPropsRenderer() {
  const container = new Container();

  const POOL_SIZE = 600;
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

    const viewRadius = Math.ceil(vpWidth / ISO_TILE_W) + 8;
    const startCol = Math.max(0, camCol - viewRadius);
    const endCol = Math.min(MAP_COLS - 1, camCol + viewRadius);
    const startRow = Math.max(0, camRow - viewRadius);
    const endRow = Math.min(MAP_ROWS - 1, camRow + viewRadius);

    const visibleProps = [];

    // Pre-computed trees (from forest patches, path lines, orchards)
    const trees = computeTreePlacements(_worldMapRef);
    for (const tree of trees) {
      if (tree.col >= startCol && tree.col <= endCol &&
          tree.row >= startRow && tree.row <= endRow) {
        visibleProps.push({
          col: tree.col, row: tree.row,
          texKey: tree.type,
          isProp: true,
          scale: 0.18,
          anchorX: 0.5,
          anchorY: 0.85,
          depth: getSortDepth(tree.col, tree.row) + 0.5,
        });
      }
    }

    // Bush props from world map (kept from worldMap data)
    if (_worldMapRef) {
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const tileId = _worldMapRef[r]?.[c];
          if (tileId === TILE_BUSH) {
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
    }

    // Fixed props
    for (const prop of FIXED_PROPS) {
      if (prop.col >= startCol && prop.col <= endCol &&
          prop.row >= startRow && prop.row <= endRow) {
        const tex = getIsoPropTex(prop.key);
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
