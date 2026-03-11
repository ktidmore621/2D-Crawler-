/**
 * Hand-designed 80×80 overworld tile map.
 *
 * Tile IDs:
 *   0 = Grass       (passable)
 *   1 = Dirt path   (passable)
 *   2 = Dense tree  (blocked)
 *   3 = Bush        (blocked)
 *   4 = Ruin floor  (passable)
 *   5 = Ruin wall   (blocked)
 *   6 = River/crack (blocked)
 *   7 = Alien struct (blocked)
 *   8 = Base floor  (passable)
 *
 * Layout zones:
 *   Bottom-left  (col 2-10, row 68-76)  — Base camp / player start
 *   East-center  (col 40-60, row 35-55) — Ruined town
 *   North-center (col 35-45, row 5-15)  — Dungeon entrance
 *   Top & right edges                   — Dense forest border
 *   Diagonal east (col 55-65, row 20-50)— Cracked earth canyon
 */

import {
  WORLD_COLS,
  WORLD_ROWS,
} from '../utils/constants.js';

// Start with all grass
const map = [];
for (let r = 0; r < WORLD_ROWS; r++) {
  map[r] = new Array(WORLD_COLS).fill(0);
}

// ── Helper functions ──────────────────────────────────────
function setTile(r, c, id) {
  if (r >= 0 && r < WORLD_ROWS && c >= 0 && c < WORLD_COLS) {
    map[r][c] = id;
  }
}

function fillRect(r1, c1, r2, c2, id) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      setTile(r, c, id);
    }
  }
}

function fillBorder(r1, c1, r2, c2, id) {
  for (let c = c1; c <= c2; c++) {
    setTile(r1, c, id);
    setTile(r2, c, id);
  }
  for (let r = r1; r <= r2; r++) {
    setTile(r, c1, id);
    setTile(r, c2, id);
  }
}

// ── Dense forest borders (top, right edges) ──────────────
// Top edge — thick tree band (rows 0-3)
for (let r = 0; r <= 3; r++) {
  for (let c = 0; c < WORLD_COLS; c++) {
    setTile(r, c, Math.random() < 0.7 ? 2 : 3);
  }
}

// Right edge — thick tree band (cols 76-79)
for (let r = 0; r < WORLD_ROWS; r++) {
  for (let c = 76; c < WORLD_COLS; c++) {
    setTile(r, c, Math.random() < 0.7 ? 2 : 3);
  }
}

// Bottom edge — scattered trees (rows 77-79)
for (let r = 77; r < WORLD_ROWS; r++) {
  for (let c = 0; c < WORLD_COLS; c++) {
    setTile(r, c, Math.random() < 0.6 ? 2 : 3);
  }
}

// Left edge — scattered trees (cols 0-1)
for (let r = 0; r < WORLD_ROWS; r++) {
  for (let c = 0; c <= 1; c++) {
    setTile(r, c, Math.random() < 0.5 ? 2 : 0);
  }
}

// ── Base camp — bottom-left (col 2-10, row 68-76) ────────
// Base floor area
fillRect(68, 2, 76, 10, 8);

// Broken-down building (condemned) — U-shape ruin walls
// Main rectangle at (69, 3) to (73, 8) with gaps
fillBorder(69, 3, 73, 8, 5);
// Fill interior with ruin floor
fillRect(70, 4, 72, 7, 4);
// Doorway gaps — blocked/boarded (leave walls to show condemned)
// Small gap on south side
setTile(73, 5, 5); // keep boarded
setTile(73, 6, 5); // keep boarded
// L-shape extension for "condemned" feel
setTile(69, 9, 5);
setTile(70, 9, 5);
setTile(71, 9, 5);

// Campfire location — just outside building at (74, 6)
// (handled as a prop in props.js, tile stays base floor)

// Sparse trees and bushes around base perimeter
setTile(67, 1, 2);
setTile(67, 3, 3);
setTile(67, 8, 2);
setTile(67, 11, 2);
setTile(68, 11, 3);
setTile(76, 1, 2);
setTile(76, 11, 2);
setTile(75, 11, 3);
setTile(68, 1, 3);
setTile(74, 1, 2);
setTile(77, 4, 0); // clear path south
setTile(77, 5, 0);
setTile(77, 6, 0);

// ── Dirt path from base heading east and north ────────────
// Path east from base (row 72-73, col 10 → 40)
for (let c = 10; c <= 40; c++) {
  setTile(72, c, 1);
  setTile(73, c, 1);
  // Slight winding — offset some tiles
  if (c % 7 === 0) {
    setTile(71, c, 1);
  }
  if (c % 11 === 0) {
    setTile(74, c, 1);
  }
}

// Path from base heading north (col 5-6, row 50 → 68)
for (let r = 50; r <= 68; r++) {
  setTile(r, 5, 1);
  setTile(r, 6, 1);
  if (r % 8 === 0) {
    setTile(r, 7, 1);
  }
}

// Connect north path to east path at row 72
for (let c = 6; c <= 10; c++) {
  setTile(72, c, 1);
  setTile(73, c, 1);
}

// North path continues up (col 5-6, row 15 → 50)
for (let r = 15; r <= 50; r++) {
  setTile(r, 5, 1);
  setTile(r, 6, 1);
  if (r % 6 === 0) {
    setTile(r, 4, 1);
  }
}

// Path fork — one branch goes north toward dungeon (from col 6, row 25 → col 38, row 10)
// Diagonal-ish path heading northeast to dungeon
for (let i = 0; i <= 20; i++) {
  const r = 25 - Math.floor(i * 0.7);
  const c = 6 + Math.floor(i * 1.6);
  setTile(r, c, 1);
  setTile(r, c + 1, 1);
  setTile(r + 1, c, 1);
}

// Path continues east toward ruined town (row 72-73, already done to col 40)
// Extend into the town
for (let c = 40; c <= 55; c++) {
  setTile(72, c, 1); // becomes "road" through town
  setTile(73, c, 1);
}

// ── Ruined town — mid-map (col 40-58, row 35-55) ─────────
// "Road" running north-south through town (col 48-49)
for (let r = 35; r <= 55; r++) {
  setTile(r, 48, 1);
  setTile(r, 49, 1);
}

// Connect road to east path
for (let c = 40; c <= 48; c++) {
  setTile(45, c, 1);
  setTile(46, c, 1);
}

// Connect to the east-west path
for (let r = 46; r <= 72; r++) {
  setTile(r, 48, 1);
  setTile(r, 49, 1);
}

// Building 1 — (row 37-42, col 42-46)
fillBorder(37, 42, 42, 46, 5);
fillRect(38, 43, 41, 45, 4);
setTile(42, 44, 4); // doorway south

// Building 2 — (row 37-41, col 51-55)
fillBorder(37, 51, 41, 55, 5);
fillRect(38, 52, 40, 54, 4);
setTile(41, 53, 4); // doorway south

// Building 3 — (row 44-48, col 42-45)
fillBorder(44, 42, 48, 45, 5);
fillRect(45, 43, 47, 44, 4);
setTile(44, 43, 4); // doorway north

// Building 4 — (row 50-54, col 43-47)
fillBorder(50, 43, 54, 47, 5);
fillRect(51, 44, 53, 46, 4);
setTile(50, 45, 4); // doorway north

// Building 5 — (row 44-49, col 51-54)
fillBorder(44, 51, 49, 54, 5);
fillRect(45, 52, 48, 53, 4);
setTile(49, 52, 4); // doorway south

// Building 6 — (row 51-55, col 51-56)
fillBorder(51, 51, 55, 56, 5);
fillRect(52, 52, 54, 55, 4);
setTile(51, 54, 4); // doorway north

// ── Cracked earth canyon — diagonal east (col 58-62, row 20-50) ──
for (let i = 0; i <= 30; i++) {
  const r = 20 + i;
  const c = 58 + Math.floor(Math.sin(i * 0.3) * 2);
  for (let w = 0; w < 4; w++) {
    setTile(r, c + w, 6);
  }
}

// ── Dungeon entrance — north-center (col 36-42, row 8-14) ──
// Clear area around dungeon
fillRect(8, 34, 14, 44, 0);

// Path leading to dungeon
for (let r = 8; r <= 14; r++) {
  setTile(r, 38, 1);
  setTile(r, 39, 1);
  setTile(r, 40, 1);
}

// Stone archway area
fillRect(9, 37, 11, 41, 4); // ruin floor base
setTile(9, 37, 5); // left pillar
setTile(10, 37, 5);
setTile(11, 37, 5);
setTile(9, 41, 5); // right pillar
setTile(10, 41, 5);
setTile(11, 41, 5);
setTile(9, 38, 5); // arch top
setTile(9, 39, 4); // arch opening (the trigger tile)
setTile(9, 40, 5); // arch top

// Dead trees surrounding dungeon
setTile(7, 35, 2);
setTile(7, 43, 2);
setTile(8, 33, 2);
setTile(8, 45, 2);
setTile(12, 34, 2);
setTile(12, 44, 2);
setTile(14, 36, 2);
setTile(14, 42, 2);

// Alien structures near dungeon
setTile(8, 36, 7);
setTile(11, 43, 7);
setTile(13, 35, 7);

// ── Scattered alien structures ──────────────────────────
setTile(30, 65, 7);
setTile(31, 66, 7);
setTile(55, 20, 7);
setTile(56, 21, 7);

// ── Dense forest patches in north section (rows 4-20) ───
for (let r = 4; r <= 20; r++) {
  for (let c = 0; c < WORLD_COLS; c++) {
    // Skip areas we already set (paths, dungeon area, etc.)
    if (map[r][c] !== 0) continue;

    // Dense trees in most of north section
    if (c < 30 || c > 46) {
      if (Math.random() < 0.55) {
        setTile(r, c, 2);
      } else if (Math.random() < 0.2) {
        setTile(r, c, 3);
      }
    }
  }
}

// ── Scattered trees and bushes throughout middle area ────
for (let r = 20; r < 68; r++) {
  for (let c = 12; c < 76; c++) {
    if (map[r][c] !== 0) continue;

    // Avoid town area and paths
    if (r >= 35 && r <= 55 && c >= 40 && c <= 58) continue;

    // Random trees/bushes at lower density
    const rng = Math.random();
    if (rng < 0.06) {
      setTile(r, c, 2);
    } else if (rng < 0.09) {
      setTile(r, c, 3);
    }
  }
}

// ── Dungeon entrance trigger tile coordinates (for GameScene) ──
export const DUNGEON_TILE_ROW = 10;
export const DUNGEON_TILE_COL = 39;

// ── Player start position (world pixels) ─────────────────
export const PLAYER_START_COL = 6;
export const PLAYER_START_ROW = 74;

// ── Campfire position (world tile coords) ────────────────
export const CAMPFIRE_TILE_ROW = 74;
export const CAMPFIRE_TILE_COL = 6;

/** The world map — 80×80 2D array of tile IDs */
export const worldMap = map;
