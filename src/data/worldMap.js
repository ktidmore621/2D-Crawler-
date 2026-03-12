/**
 * Hand-designed 160×160 overworld tile map.
 *
 * Tile IDs:
 *   0  = Grass       (passable)
 *   1  = Dirt path   (passable)
 *   2  = Dense tree  (blocked)
 *   3  = Bush        (blocked)
 *   4  = Ruin floor  (passable)
 *   5  = Ruin wall   (blocked)
 *   6  = River/crack (blocked)
 *   7  = Alien struct (blocked)
 *   8  = Base floor  (passable)
 *   10 = Water deep  (blocked)
 *   11 = Shallow water (passable, slow)
 *   12 = Flooded floor (passable, slow)
 *   13 = Mountain wall (blocked)
 *   14 = Mountain top  (blocked)
 *   15 = Plateau floor (passable)
 *   16 = Cliff edge    (blocked)
 *   17 = Ramp          (passable)
 *   18 = Dry lakebed   (passable)
 *   19 = Farmland      (passable)
 *   20 = Crater floor  (passable)
 *   21 = Highway       (passable)
 *   22 = Waterfall     (blocked)
 *
 * Layout — existing content stays in bottom-left quadrant (0-79, 0-79).
 * New content fills upper and right portions.
 */

import {
  WORLD_COLS,
  WORLD_ROWS,
} from '../utils/constants.js';
import {
  setElevation,
  fillElevation,
} from '../systems/elevation.js';

// ── Seeded random for deterministic world ────────────────
let _seed = 12345;
function seededRandom() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed & 0xFFFF) / 0xFFFF;
}

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

// ══════════════════════════════════════════════════════════
// ── ORIGINAL BOTTOM-LEFT QUADRANT (existing content) ─────
// ══════════════════════════════════════════════════════════

// ── Dense forest borders (original top/right/bottom/left of old 80x80) ──
// Top edge of old area — thick tree band (rows 0-3)
for (let r = 0; r <= 3; r++) {
  for (let c = 0; c < 80; c++) {
    setTile(r, c, seededRandom() < 0.25 ? 2 : 0);
  }
}

// Original right edge — now internal, thin forest band (cols 76-79)
for (let r = 0; r < 80; r++) {
  for (let c = 76; c < 80; c++) {
    setTile(r, c, seededRandom() < 0.15 ? 2 : 0);
  }
}

// Bottom edge — scattered trees (rows 77-79) — original bottom of old map
// Now these are internal to the larger map, keep sparse
for (let r = 77; r < 80; r++) {
  for (let c = 0; c < 80; c++) {
    setTile(r, c, seededRandom() < 0.1 ? 2 : 0);
  }
}

// Left edge — scattered trees (cols 0-1)
for (let r = 0; r < WORLD_ROWS; r++) {
  for (let c = 0; c <= 1; c++) {
    setTile(r, c, seededRandom() < 0.15 ? 2 : 0);
  }
}

// ── Base camp — bottom-left (col 2-10, row 68-76) ────────
fillRect(68, 2, 76, 10, 8);
fillBorder(69, 3, 73, 8, 5);
fillRect(70, 4, 72, 7, 4);
setTile(73, 5, 5);
setTile(73, 6, 5);
setTile(69, 9, 5);
setTile(70, 9, 5);
setTile(71, 9, 5);

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
setTile(77, 4, 0);
setTile(77, 5, 0);
setTile(77, 6, 0);

// ── Dirt path from base heading east and north ────────────
for (let c = 10; c <= 40; c++) {
  setTile(72, c, 1);
  setTile(73, c, 1);
  // Occasional footprint tiles veering off the path
  if (c % 9 === 0) setTile(71, c, 1);
  if (c % 13 === 0) setTile(74, c, 1);
}

for (let r = 50; r <= 68; r++) {
  setTile(r, 5, 1);
  setTile(r, 6, 1);
  // Occasional footprint veering off
  if (r % 11 === 0) setTile(r, 7, 1);
}

for (let c = 6; c <= 10; c++) {
  setTile(72, c, 1);
  setTile(73, c, 1);
}

for (let r = 15; r <= 50; r++) {
  setTile(r, 5, 1);
  setTile(r, 6, 1);
  // Occasional footprint veering off
  if (r % 9 === 0) setTile(r, 4, 1);
}

for (let i = 0; i <= 20; i++) {
  const r = 25 - Math.floor(i * 0.7);
  const c = 6 + Math.floor(i * 1.6);
  setTile(r, c, 1);
  setTile(r, c + 1, 1);
}

for (let c = 40; c <= 55; c++) {
  setTile(72, c, 1);
  setTile(73, c, 1);
}

// ── Ruined town — mid-map (col 40-58, row 35-55) ─────────
for (let r = 35; r <= 55; r++) {
  setTile(r, 48, 1);
  setTile(r, 49, 1);
}

for (let c = 40; c <= 48; c++) {
  setTile(45, c, 1);
  setTile(46, c, 1);
}

for (let r = 46; r <= 72; r++) {
  setTile(r, 48, 1);
  setTile(r, 49, 1);
}

fillBorder(37, 42, 42, 46, 5);
fillRect(38, 43, 41, 45, 4);
setTile(42, 43, 4); // doorway (2 wide)
setTile(42, 44, 4);

fillBorder(37, 51, 41, 55, 5);
fillRect(38, 52, 40, 54, 4);
setTile(41, 52, 4); // doorway (2 wide)
setTile(41, 53, 4);

fillBorder(44, 42, 48, 45, 5);
fillRect(45, 43, 47, 44, 4);
setTile(44, 43, 4); // doorway (2 wide)
setTile(44, 44, 4);

fillBorder(50, 43, 54, 47, 5);
fillRect(51, 44, 53, 46, 4);
setTile(50, 45, 4); // doorway (2 wide)
setTile(50, 46, 4);

fillBorder(44, 51, 49, 54, 5);
fillRect(45, 52, 48, 53, 4);
setTile(49, 52, 4); // doorway (2 wide)
setTile(49, 53, 4);

fillBorder(51, 51, 55, 56, 5);
fillRect(52, 52, 54, 55, 4);
setTile(51, 53, 4); // doorway (2 wide)
setTile(51, 54, 4);

// ── Cracked earth canyon — diagonal east (col 58-62, row 20-50) ──
for (let i = 0; i <= 30; i++) {
  const r = 20 + i;
  const c = 58 + Math.floor(Math.sin(i * 0.3) * 2);
  for (let w = 0; w < 4; w++) {
    setTile(r, c + w, 6);
  }
}

// ── Dungeon entrance — north-center (col 36-42, row 8-14) ──
fillRect(8, 34, 14, 44, 0);
for (let r = 8; r <= 14; r++) {
  setTile(r, 39, 1);
  setTile(r, 40, 1);
}
fillRect(9, 37, 11, 41, 4);
setTile(9, 37, 5);
setTile(10, 37, 5);
setTile(11, 37, 5);
setTile(9, 41, 5);
setTile(10, 41, 5);
setTile(11, 41, 5);
setTile(9, 38, 5);
setTile(9, 39, 4);
setTile(9, 40, 5);

setTile(7, 35, 2);
setTile(7, 43, 2);
setTile(8, 33, 2);
setTile(8, 45, 2);
setTile(12, 34, 2);
setTile(12, 44, 2);
setTile(14, 36, 2);
setTile(14, 42, 2);

setTile(8, 36, 7);
setTile(11, 43, 7);
setTile(13, 35, 7);

// Scattered alien structures
setTile(30, 65, 7);
setTile(31, 66, 7);
setTile(55, 20, 7);
setTile(56, 21, 7);

// Dense forest patches in north section (rows 4-20) — reduced density
_seed = 54321;
for (let r = 4; r <= 20; r++) {
  for (let c = 0; c < 80; c++) {
    if (map[r][c] !== 0) continue;
    if (c < 30 || c > 46) {
      if (seededRandom() < 0.12) {
        setTile(r, c, 2);
      } else if (seededRandom() < 0.04) {
        setTile(r, c, 3);
      }
    }
  }
}

// Scattered trees and bushes throughout middle area — reduced density
_seed = 99999;
for (let r = 20; r < 68; r++) {
  for (let c = 12; c < 76; c++) {
    if (map[r][c] !== 0) continue;
    if (r >= 35 && r <= 55 && c >= 40 && c <= 58) continue;
    const rng = seededRandom();
    if (rng < 0.02) {
      setTile(r, c, 2);
    } else if (rng < 0.03) {
      setTile(r, c, 3);
    }
  }
}


// ══════════════════════════════════════════════════════════
// ── NEW WORLD EXPANSION CONTENT ──────────────────────────
// ══════════════════════════════════════════════════════════

// ── Zone 3: Mountain Range (north and east borders of full 160x160) ──
// North mountains — top 15 rows
for (let r = 0; r <= 14; r++) {
  for (let c = 80; c < WORLD_COLS; c++) {
    if (r < 3) {
      setTile(r, c, 14); // Mountain top (snow)
    } else if (r < 12) {
      setTile(r, c, 13); // Mountain wall
    } else {
      setTile(r, c, seededRandom() < 0.4 ? 13 : 0);
    }
  }
}
// Extend mountain border along top for original area too (overwrite old forest)
for (let r = 0; r <= 2; r++) {
  for (let c = 0; c < 80; c++) {
    setTile(r, c, r < 1 ? 14 : 13);
  }
}
for (let r = 3; r <= 5; r++) {
  for (let c = 0; c < 80; c++) {
    if (map[r][c] === 2 || map[r][c] === 3) {
      setTile(r, c, 13);
    }
  }
}

// East mountains — right 15 columns
for (let r = 0; r < WORLD_ROWS; r++) {
  for (let c = 145; c < WORLD_COLS; c++) {
    if (c >= 157) {
      setTile(r, c, 14);
    } else if (c >= 148) {
      setTile(r, c, 13);
    } else {
      setTile(r, c, seededRandom() < 0.3 ? 13 : 0);
    }
  }
}

// Set mountain elevation
fillElevation(0, 0, 2, WORLD_COLS - 1, 2);
fillElevation(0, 145, WORLD_ROWS - 1, WORLD_COLS - 1, 2);

// Cave entrance 1 — east face of mountains at row 40
fillRect(38, 146, 42, 148, 0);
for (let r = 38; r <= 42; r++) setTile(r, 147, 1);
setTile(40, 148, 4); // cave opening

// Cave entrance 2 — north face at col 100
fillRect(13, 98, 15, 102, 0);
for (let c = 98; c <= 102; c++) setTile(14, c, 1);
setTile(13, 100, 4); // cave opening

// Cave entrance 3 — east face at row 100
fillRect(98, 146, 102, 148, 0);
for (let r = 98; r <= 102; r++) setTile(r, 147, 1);
setTile(100, 148, 4); // cave opening

// ── Zone 4: Elevated Plateau (north-center, roughly cols 90-112, rows 20-38) ──
// Cliff edges on all sides
for (let c = 88; c <= 114; c++) {
  setTile(38, c, 16);
  setTile(20, c, 16);
}
for (let r = 20; r <= 38; r++) {
  setTile(r, 88, 16);
  setTile(r, 114, 16);
}

// Plateau floor
fillRect(21, 89, 37, 113, 15);

// Set plateau elevation
fillElevation(20, 88, 38, 114, 1);

// Ramp entrances on south face
setTile(38, 96, 17);
setTile(38, 97, 17);
setTile(38, 106, 17);
setTile(38, 107, 17);
// Make ramps ground elevation so they're passable transitions
setElevation(38, 96, 0);
setElevation(38, 97, 0);
setElevation(38, 106, 0);
setElevation(38, 107, 0);

// Dirt paths leading to ramps from below
for (let r = 39; r <= 45; r++) {
  setTile(r, 96, 1);
  setTile(r, 97, 1);
  setTile(r, 106, 1);
  setTile(r, 107, 1);
}

// Military outpost ruins on plateau
// Main building
fillBorder(24, 96, 30, 104, 5);
fillRect(25, 97, 29, 103, 4);
setTile(30, 99, 4); // doorway
setTile(30, 100, 4); // doorway (2 wide)

// Watchtower base (smaller structure)
fillBorder(26, 108, 29, 111, 5);
fillRect(27, 109, 28, 110, 4);

// Collapsed antenna base
setTile(23, 92, 4);
setTile(23, 93, 4);

// Some trees on plateau — reduced
_seed = 77777;
for (let r = 21; r <= 37; r++) {
  for (let c = 89; c <= 113; c++) {
    if (map[r][c] !== 15) continue;
    if (seededRandom() < 0.02) setTile(r, c, 2);
  }
}


// ── Zone 1: River System (flows from mountains in NE down through mid-map) ──
// Main river path — winding from northeast mountains down to center-east lake
const riverPoints = [
  // Start from mountains
  [15, 130], [18, 128], [22, 126], [26, 124], [30, 122],
  [34, 120], [38, 118], [42, 116], [46, 114],
  // Mid section — curves west
  [50, 112], [54, 108], [58, 104], [62, 100],
  // Approaches lake area
  [66, 98], [70, 96], [74, 96], [78, 96],
  // Continues south
  [82, 96], [86, 96], [90, 98],
];

// Draw river tiles (3-4 wide) with shallow borders
for (let i = 0; i < riverPoints.length; i++) {
  const [pr, pc] = riverPoints[i];
  // Interpolate between points for smooth river
  if (i < riverPoints.length - 1) {
    const [nr, nc] = riverPoints[i + 1];
    const steps = Math.max(Math.abs(nr - pr), Math.abs(nc - pc));
    for (let s = 0; s <= steps; s++) {
      const t = s / Math.max(1, steps);
      const ir = Math.round(pr + (nr - pr) * t);
      const ic = Math.round(pc + (nc - pc) * t);
      // River core (3 tiles wide)
      for (let w = -1; w <= 1; w++) {
        setTile(ir, ic + w, 10);
      }
      // Shallow water borders
      setTile(ir, ic - 2, 11);
      setTile(ir, ic + 2, 11);
    }
  }
}

// River splits into two branches mid-map forming a small island
// Branch A continues straight
for (let r = 62; r <= 74; r++) {
  setTile(r, 94, 11);
  setTile(r, 95, 10);
  setTile(r, 96, 10);
  setTile(r, 97, 11);
}
// Branch B goes around east side forming island
for (let r = 62; r <= 66; r++) {
  setTile(r, 102, 11);
  setTile(r, 103, 10);
  setTile(r, 104, 10);
  setTile(r, 105, 11);
}
for (let c = 97; c <= 103; c++) {
  setTile(62, c, 10);
  setTile(61, c, 11);
  setTile(63, c, 11);
}
for (let c = 97; c <= 103; c++) {
  setTile(74, c, 10);
  setTile(73, c, 11);
  setTile(75, c, 11);
}
for (let r = 66; r <= 74; r++) {
  setTile(r, 102, 11);
  setTile(r, 103, 10);
  setTile(r, 104, 10);
  setTile(r, 105, 11);
}
// Island interior — grass
fillRect(64, 98, 72, 101, 0);
// Dead tree on island
setTile(68, 100, 2);

// Wooden bridge crossing (dirt path tiles over water)
for (let c = 93; c <= 98; c++) {
  setTile(70, c, 1);
}

// Waterfalls from mountains
setTile(14, 129, 22);
setTile(15, 129, 22);
setTile(14, 130, 22);
setTile(15, 130, 22);

setTile(12, 140, 22);
setTile(13, 140, 22);
setTile(12, 141, 22);
setTile(13, 141, 22);


// ── Zone 2: Central Lake (center-east, roughly cols 108-124, rows 80-92) ──
// Deep water oval (12×8)
for (let r = 82; r <= 89; r++) {
  for (let c = 110; c <= 121; c++) {
    // Oval shape
    const dr = (r - 85.5) / 4;
    const dc = (c - 115.5) / 6;
    if (dr * dr + dc * dc <= 1) {
      setTile(r, c, 10);
    }
  }
}

// Shallow water border around lake
for (let r = 80; r <= 91; r++) {
  for (let c = 108; c <= 123; c++) {
    if (map[r][c] === 10) continue;
    // Check if adjacent to deep water
    let nearWater = false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < WORLD_ROWS && nc >= 0 && nc < WORLD_COLS && map[nr][nc] === 10) {
          nearWater = true;
        }
      }
    }
    if (nearWater) setTile(r, c, 11);
  }
}

// Small grassy island in center of lake
setTile(85, 115, 0);
setTile(86, 115, 0);
setTile(85, 116, 0);
setTile(86, 116, 0);
// Dead tree on island
setTile(85, 116, 2);

// Connect river to lake
for (let r = 90; r <= 95; r++) {
  setTile(r, 110, 11);
  setTile(r, 111, 10);
  setTile(r, 112, 10);
  setTile(r, 113, 11);
}

// Old dock ruins on south shore
fillRect(91, 114, 93, 118, 4);
setTile(92, 114, 11);
setTile(93, 115, 11);
setTile(93, 116, 11);

// Flooded building on east shore
fillBorder(84, 123, 88, 127, 5);
fillRect(85, 124, 87, 126, 12);
setTile(88, 125, 4); // doorway (2 wide)
setTile(88, 126, 4);


// ── Zone 5: Overgrown Highway (diagonal NW to SE across center) ──
// Highway runs from about (40, 60) to (120, 140)
for (let i = 0; i <= 100; i++) {
  const r = 40 + Math.round(i * 0.8);
  const c = 60 + Math.round(i * 0.8);
  if (r >= WORLD_ROWS || c >= WORLD_COLS) break;
  // 4-lane highway (4 tiles wide)
  for (let w = -1; w <= 2; w++) {
    const tr = r + w;
    const tc = c;
    if (tr >= 0 && tr < WORLD_ROWS && tc >= 0 && tc < WORLD_COLS) {
      // Don't overwrite water or mountains
      if (map[tr][tc] === 10 || map[tr][tc] === 13 || map[tr][tc] === 14) continue;
      setTile(tr, tc, 21);
    }
  }
  // Overgrown sections
  if (i % 12 < 3) {
    setTile(r, c, 0); // grass breaking through
  }
}

// Overpass ruins where highway crosses the river (around row 68-72, col 94-98)
// Highway tiles over water stay as highway (elevated overpass)
for (let c = 92; c <= 100; c++) {
  const r = Math.round(40 + (c - 60) * 1.0);
  if (r >= 0 && r < WORLD_ROWS) {
    setTile(r, c, 21);
    setTile(r + 1, c, 21);
  }
}


// ── Zone 6: Abandoned Farmland (west-center, cols 20-50, rows 85-115) ──
// Farmland grid — rectangular fields separated by dirt paths
// Field 1
fillRect(88, 22, 96, 34, 19);
// Field 2
fillRect(88, 37, 96, 48, 19);
// Field 3
fillRect(100, 22, 108, 34, 19);
// Field 4
fillRect(100, 37, 108, 48, 19);

// Dirt paths between fields
for (let r = 86; r <= 110; r++) {
  setTile(r, 35, 1);
  setTile(r, 36, 1);
  setTile(r, 21, 1);
  setTile(r, 49, 1);
}
for (let c = 21; c <= 49; c++) {
  setTile(97, c, 1);
  setTile(98, c, 1);
  setTile(87, c, 1);
  setTile(109, c, 1);
}

// Collapsed barn footprint (large ruin)
fillBorder(90, 27, 95, 31, 5);
fillRect(91, 28, 94, 30, 4);
setTile(95, 28, 4); // doorway (2 wide)
setTile(95, 29, 4);

// Connect farmland to main path network
for (let r = 76; r <= 87; r++) {
  setTile(r, 35, 1);
  setTile(r, 36, 1);
}
for (let c = 35; c <= 48; c++) {
  setTile(76, c, 1);
}


// ── Zone 7: Dried Town Center (center-north, cols 85-115, rows 45-65) ──
// Grid streets — cross pattern
// Main street N-S
for (let r = 45; r <= 65; r++) {
  setTile(r, 100, 21);
  setTile(r, 101, 21);
}
// Main street E-W
for (let c = 85; c <= 115; c++) {
  setTile(55, c, 21);
  setTile(56, c, 21);
}
// Secondary streets
for (let r = 45; r <= 65; r++) {
  setTile(r, 90, 21);
  setTile(r, 110, 21);
}
for (let c = 85; c <= 115; c++) {
  setTile(48, c, 21);
  setTile(62, c, 21);
}

// Town square at center (col 97-104, row 53-58)
fillRect(53, 97, 58, 104, 4);

// Dry fountain at center of square
setTile(55, 100, 18);
setTile(55, 101, 18);
setTile(56, 100, 18);
setTile(56, 101, 18);

// Alien structure in fountain center
setTile(55, 101, 7);

// Buildings along streets
// Building T1
fillBorder(49, 92, 53, 97, 5);
fillRect(50, 93, 52, 96, 4);
setTile(53, 94, 4); // doorway (2 wide)
setTile(53, 95, 4);

// Building T2
fillBorder(49, 103, 53, 108, 5);
fillRect(50, 104, 52, 107, 4);
setTile(53, 105, 4); // doorway (2 wide)
setTile(53, 106, 4);

// Building T3
fillBorder(58, 92, 61, 97, 5);
fillRect(59, 93, 60, 96, 4);
setTile(58, 94, 4); // doorway (2 wide)
setTile(58, 95, 4);

// Building T4
fillBorder(58, 103, 61, 108, 5);
fillRect(59, 104, 60, 107, 4);
setTile(58, 105, 4); // doorway (2 wide)
setTile(58, 106, 4);

// Building T5 (town hall — larger)
fillBorder(46, 96, 48, 105, 5);
fillRect(47, 97, 47, 104, 4);
setTile(48, 100, 4);
setTile(48, 101, 4);

// Building T6
fillBorder(63, 93, 65, 98, 5);
fillRect(64, 94, 64, 97, 4);
setTile(63, 95, 4); // doorway (2 wide)
setTile(63, 96, 4);

// Building T7
fillBorder(63, 102, 65, 107, 5);
fillRect(64, 103, 64, 106, 4);
setTile(63, 104, 4); // doorway (2 wide)
setTile(63, 105, 4);

// Building T8
fillBorder(49, 111, 53, 114, 5);
fillRect(50, 112, 52, 113, 4);
setTile(53, 112, 4); // doorway (2 wide)
setTile(53, 113, 4);

// Park area — small section of grass with benches
fillRect(58, 112, 61, 115, 0);


// ── Zone 8: Impact Crater (east-center, cols 120-140, rows 55-70) ──
// Outer ring — cliff edges facing inward
for (let r = 55; r <= 70; r++) {
  for (let c = 120; c <= 140; c++) {
    const dr = (r - 62.5) / 8;
    const dc = (c - 130) / 10;
    const dist = dr * dr + dc * dc;
    if (dist <= 1.0 && dist > 0.6) {
      setTile(r, c, 16); // crater rim
    } else if (dist <= 0.6 && dist > 0.25) {
      setTile(r, c, 20); // scorched earth ring
    } else if (dist <= 0.25) {
      setTile(r, c, 20); // crater floor center
    }
  }
}
// Darkest crater center
fillRect(60, 128, 64, 132, 20);
// Alien buried structure at very center
setTile(62, 130, 7);
setTile(62, 131, 7);

// Scorched dead trees radiating outward
setTile(54, 125, 2);
setTile(54, 135, 2);
setTile(56, 119, 2);
setTile(56, 141, 2);
setTile(71, 125, 2);
setTile(71, 135, 2);
setTile(68, 119, 2);
setTile(68, 141, 2);
setTile(55, 130, 2);
setTile(70, 130, 2);

// Dirt paths leading to crater
for (let r = 70; r <= 78; r++) {
  setTile(r, 130, 1);
  setTile(r, 131, 1);
}
for (let c = 115; c <= 120; c++) {
  setTile(62, c, 1);
  setTile(63, c, 1);
}


// ── Zone 9: Underground Tunnel Entrance (south-center, col 75-82, row 120-126) ──
// Concrete area surrounding entrance
fillRect(120, 75, 126, 82, 4);
// Cracked concrete edges
for (let c = 73; c <= 84; c++) {
  setTile(119, c, 1);
  setTile(127, c, 1);
}
for (let r = 119; r <= 127; r++) {
  setTile(r, 73, 1);
  setTile(r, 84, 1);
}
// Stairway opening
setTile(123, 78, 4);
setTile(123, 79, 4);
setTile(124, 78, 4);
setTile(124, 79, 4);

// Urban debris around tunnel
setTile(121, 76, 4);
setTile(125, 81, 4);

// Path leading to tunnel from north
for (let r = 110; r <= 119; r++) {
  setTile(r, 78, 1);
  setTile(r, 79, 1);
}

// Connect to main path network
for (let c = 49; c <= 78; c++) {
  setTile(110, c, 1);
  setTile(111, c, 1);
}


// ── Zone 10: Flooded Ruins (south-east, cols 110-130, rows 110-125) ──
// Building F1 — flooded interior
fillBorder(112, 112, 117, 117, 5);
fillRect(113, 113, 116, 116, 12);
setTile(117, 114, 4); // doorway (2 wide)
setTile(117, 115, 4);

// Building F2 — flooded
fillBorder(112, 120, 116, 125, 5);
fillRect(113, 121, 115, 124, 12);
setTile(116, 122, 4); // doorway (2 wide)
setTile(116, 123, 4);

// Building F3 — partially collapsed, flooded
fillBorder(119, 114, 123, 119, 5);
fillRect(120, 115, 122, 118, 12);
setTile(119, 116, 4); // doorway (2 wide)
setTile(119, 117, 4);
// Missing wall section (collapsed)
setTile(123, 116, 4);
setTile(123, 117, 4);

// Building F4 — flooded with rowboat inside
fillBorder(119, 122, 124, 127, 5);
fillRect(120, 123, 123, 126, 12);
setTile(124, 124, 4); // doorway (2 wide)
setTile(124, 125, 4);

// Building F5
fillBorder(113, 129, 117, 133, 5);
fillRect(114, 130, 116, 132, 12);
setTile(117, 130, 4); // doorway (2 wide)
setTile(117, 131, 4);

// Surrounding water
for (let r = 110; r <= 126; r++) {
  for (let c = 110; c <= 135; c++) {
    if (map[r][c] === 0) {
      // Shallow water around flooded area
      let nearBuilding = false;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < WORLD_ROWS && nc >= 0 && nc < WORLD_COLS) {
            if (map[nr][nc] === 5 || map[nr][nc] === 12) nearBuilding = true;
          }
        }
      }
      if (nearBuilding) setTile(r, c, 11);
    }
  }
}

// Paths connecting to flooded ruins
for (let r = 105; r <= 112; r++) {
  setTile(r, 115, 1);
  setTile(r, 116, 1);
}


// ══════════════════════════════════════════════════════════
// ── WATER DIVERSITY — ponds, wider river, streams, puddles ─
// ══════════════════════════════════════════════════════════

// ── Pond 1: Near farmland (south-west of farmland fields) ──
fillRect(84, 30, 86, 33, 10);  // deep water core 4×3
// Shallow water border
for (let r = 83; r <= 87; r++) {
  for (let c = 29; c <= 34; c++) {
    if (map[r][c] !== 10) setTile(r, c, 11);
  }
}

// ── Pond 2: Near ruined town (east of the old ruined town) ──
fillRect(42, 60, 44, 63, 10);  // deep water core 4×3
for (let r = 41; r <= 45; r++) {
  for (let c = 59; c <= 64; c++) {
    if (map[r][c] !== 10 && map[r][c] === 0) setTile(r, c, 11);
  }
}

// ── Pond 3: Near base camp south path ──
fillRect(78, 12, 80, 15, 10);  // deep water core 4×3
for (let r = 77; r <= 81; r++) {
  for (let c = 11; c <= 16; c++) {
    if (map[r][c] !== 10 && map[r][c] === 0) setTile(r, c, 11);
  }
}

// ── Widen river by 1 tile on each bank (add shallow water borders) ──
for (let r = 0; r < WORLD_ROWS; r++) {
  for (let c = 0; c < WORLD_COLS; c++) {
    if (map[r][c] !== 10) continue; // only process deep water
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < WORLD_ROWS && nc >= 0 && nc < WORLD_COLS) {
          if (map[nr][nc] === 0) {
            map[nr][nc] = 11; // shallow water border
          }
        }
      }
    }
  }
}

// ── Second smaller stream branching off main river toward flooded ruins ──
// Branches from around row 80, col 98 and winds southeast to flooded ruins at ~row 110, col 115
const streamPoints = [
  [80, 98], [83, 100], [86, 102], [89, 104], [92, 106],
  [95, 108], [98, 110], [101, 112], [104, 113], [107, 114], [110, 115],
];
for (let i = 0; i < streamPoints.length - 1; i++) {
  const [pr, pc] = streamPoints[i];
  const [nr, nc] = streamPoints[i + 1];
  const steps = Math.max(Math.abs(nr - pr), Math.abs(nc - pc));
  for (let s = 0; s <= steps; s++) {
    const t = s / Math.max(1, steps);
    const ir = Math.round(pr + (nr - pr) * t);
    const ic = Math.round(pc + (nc - pc) * t);
    // Narrow stream — 2 tiles wide
    setTile(ir, ic, 10);
    setTile(ir, ic + 1, 10);
    // Shallow borders
    if (map[ir][ic - 1] === 0) setTile(ir, ic - 1, 11);
    if (map[ir][ic + 2] === 0) setTile(ir, ic + 2, 11);
  }
}

// ── Additional flooded ruin footprints near existing flooded ruins zone ──
// Flooded ruin F6
fillBorder(126, 116, 130, 121, 5);
fillRect(127, 117, 129, 120, 12);
setTile(126, 118, 4); // doorway (2 wide)
setTile(126, 119, 4);

// Flooded ruin F7
fillBorder(125, 126, 129, 130, 5);
fillRect(126, 127, 128, 129, 12);
setTile(129, 127, 4); // doorway (2 wide)
setTile(129, 128, 4);

// Flooded ruin F8 — small collapsed
fillBorder(131, 120, 134, 124, 5);
fillRect(132, 121, 133, 123, 12);
setTile(131, 122, 4); // doorway (2 wide)
setTile(131, 123, 4);

// Shallow water around new flooded ruins
for (let r = 124; r <= 136; r++) {
  for (let c = 114; c <= 132; c++) {
    if (map[r][c] === 0) {
      let nearBuilding = false;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < WORLD_ROWS && nc >= 0 && nc < WORLD_COLS) {
            if (map[nr][nc] === 5 || map[nr][nc] === 12) nearBuilding = true;
          }
        }
      }
      if (nearBuilding) setTile(r, c, 11);
    }
  }
}

// ── Water puddles in crater floor (rain collected in crater) ──
// Scatter individual water puddles (1×1 deep, surrounded by shallow)
const craterPuddles = [
  [61, 129], [63, 131], [60, 132], [64, 128], [62, 133],
];
for (const [pr, pc] of craterPuddles) {
  if (map[pr][pc] === 20) {
    setTile(pr, pc, 10); // deep water puddle
    // Shallow water ring around puddle
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = pr + dr;
        const nc = pc + dc;
        if (nr >= 0 && nr < WORLD_ROWS && nc >= 0 && nc < WORLD_COLS && map[nr][nc] === 20) {
          setTile(nr, nc, 11);
        }
      }
    }
  }
}


// ══════════════════════════════════════════════════════════
// ── FILL REMAINING AREAS ─────────────────────────────────
// ══════════════════════════════════════════════════════════

// Bottom edge of full map — scattered trees (rows 155-159)
for (let r = 155; r < WORLD_ROWS; r++) {
  for (let c = 0; c < WORLD_COLS; c++) {
    if (map[r][c] === 0) {
      setTile(r, c, seededRandom() < 0.15 ? 2 : 0);
    }
  }
}

// Fill empty areas with scattered vegetation — reduced density
_seed = 33333;
for (let r = 0; r < WORLD_ROWS; r++) {
  for (let c = 0; c < WORLD_COLS; c++) {
    if (map[r][c] !== 0) continue;
    // Skip zones that should stay clear
    if (r < 15 && c >= 80) continue; // mountains
    if (c >= 145) continue; // east mountains
    if (r >= 155) continue; // bottom edge

    const rng = seededRandom();
    if (rng < 0.015) {
      setTile(r, c, 2);
    } else if (rng < 0.025) {
      setTile(r, c, 3);
    }
  }
}


// ── POST-PROCESSING: enforce tree spacing, clear player start, cap total ──
// Remove all trees within 8 tiles of player start
const _pStartCol = 15;
const _pStartRow = 145;
for (let r = _pStartRow - 8; r <= _pStartRow + 8; r++) {
  for (let c = _pStartCol - 8; c <= _pStartCol + 8; c++) {
    if (r >= 0 && r < WORLD_ROWS && c >= 0 && c < WORLD_COLS) {
      if (map[r][c] === 2 || map[r][c] === 3) {
        map[r][c] = 0;
      }
    }
  }
}

// Enforce minimum 3-tile spacing between trees — remove crowded trees
for (let r = 0; r < WORLD_ROWS; r++) {
  for (let c = 0; c < WORLD_COLS; c++) {
    if (map[r][c] !== 2) continue;
    // Check 3-tile radius for other trees; remove this one if neighbor found first
    let hasNeighbor = false;
    for (let dr = -3; dr <= 3 && !hasNeighbor; dr++) {
      for (let dc = -3; dc <= 3 && !hasNeighbor; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < WORLD_ROWS && nc >= 0 && nc < WORLD_COLS) {
          if (map[nr][nc] === 2 && (nr < r || (nr === r && nc < c))) {
            // A previously-kept tree is too close — remove this one
            hasNeighbor = true;
          }
        }
      }
    }
    if (hasNeighbor) {
      map[r][c] = 0;
    }
  }
}

// Cap total tree count at 300
{
  const treeTiles = [];
  for (let r = 0; r < WORLD_ROWS; r++) {
    for (let c = 0; c < WORLD_COLS; c++) {
      if (map[r][c] === 2) treeTiles.push({ r, c });
    }
  }
  if (treeTiles.length > 300) {
    // Remove excess trees deterministically (keep first 300 in scan order)
    for (let i = 300; i < treeTiles.length; i++) {
      map[treeTiles[i].r][treeTiles[i].c] = 0;
    }
  }
}

// ── Dungeon entrance trigger tile coordinates (for GameScene) ──
export const DUNGEON_TILE_ROW = 10;
export const DUNGEON_TILE_COL = 39;

// ── Cave entrance trigger coordinates ─────────────────────
export const CAVE_TRIGGERS = [
  { row: 40, col: 148, label: 'cave 1' },
  { row: 13, col: 100, label: 'cave 2' },
  { row: 100, col: 148, label: 'cave 3' },
];

// ── Tunnel entrance trigger ───────────────────────────────
export const TUNNEL_TRIGGER = { row: 123, col: 78, label: 'tunnel' };

// ── Player start position (world pixels) ─────────────────
// Set player start to open grass area away from buildings and trees
export const PLAYER_START_COL = 15;
export const PLAYER_START_ROW = 145;

// ── Campfire position (world tile coords) ────────────────
export const CAMPFIRE_TILE_ROW = 74;
export const CAMPFIRE_TILE_COL = 6;

/** The world map — 160×160 2D array of tile IDs */
export const worldMap = map;
