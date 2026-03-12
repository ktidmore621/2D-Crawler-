/**
 * Sprite atlas registry — describes every sprite sheet's path, tile/frame sizes,
 * and named sub-regions. All rendering code imports from here.
 *
 * Generated terrain tiles are 48×48 PNGs in assets/tilesets/generated/
 * Tile positions measured from actual sheet dimensions:
 *   nature.png        256×256  — TopDownFantasy Forest decorations
 *   floors_tiles.png  400×416  (25×26 tiles of 16×16)
 *   wall_tiles.png    400×400  (25×25 tiles of 16×16)
 *   water_tiles.png   400×400  (25×25 tiles of 16×16)
 *   dungeon_tiles.png 400×400  (25×25 tiles of 16×16)
 *   tree_model1.png   448×368  (4 cols × 3 rows: 112×152 trees + 112×64 stumps)
 *   tree_model2.png   288×320  (3 cols × 2 rows: 96×144 pines + 96×32 stumps)
 *   bonfire_sheet.png 128×32   (4 frames of 32×32)
 *   fire_sheet.png    128×48   (4 frames of 32×48)
 *   rocks.png         208×304
 *   vegetation.png    400×432
 *   walls.png         672×800
 *   roofs.png         400×400
 */

/**
 * Generated terrain tiles — Python/Pillow pixel art tiles (48×48 each).
 * Loaded as individual PNGs, no sprite sheet slicing needed.
 */
export const GENERATED_TILES = {
  grass:    ['grass_0','grass_1','grass_2'],
  dirt:     ['dirt_0','dirt_1'],
  water:    ['water_0','water_1','water_2'],
  shallowWater: 'shallow_water',
  stone:    ['stone_0','stone_1'],
  mountain: 'mountain',
  plateau:  'plateau',
  crater:   'crater',
  highway:  'highway',
  farmland: 'farmland',
  transGrassN:  'trans_grass_N',
  transGrassS:  'trans_grass_S',
  transGrassE:  'trans_grass_E',
  transGrassW:  'trans_grass_W',
  transGrassNE: 'trans_grass_NE',
  transGrassNW: 'trans_grass_NW',
  transGrassSE: 'trans_grass_SE',
  transGrassSW: 'trans_grass_SW',
  shoreN:  'shore_N',
  shoreS:  'shore_S',
  shoreE:  'shore_E',
  shoreW:  'shore_W',
  shoreNE: 'shore_NE',
  shoreNW: 'shore_NW',
  shoreSE: 'shore_SE',
  shoreSW: 'shore_SW',
};

export const SPRITE_ATLAS = {
  // ── Nature Decorations (TopDownFantasy Forest) ──────
  nature: {
    path: 'assets/decorations/nature.png',
    // 256×256 — bushes, logs, mushrooms, grass tufts, rocks, trees
    regions: {
      // Bushes — stacked vertically in top-left (each ~35×27 content)
      bush1:          { x: 0,   y: 0,   w: 48, h: 32 },
      bush2:          { x: 0,   y: 32,  w: 48, h: 32 },
      // Fallen log — brown horizontal log, upper-middle area
      log1:           { x: 64,  y: 0,   w: 64, h: 64 },
      // Grass tufts — tall grass sprites (each ~14×22 content in 32×32 cell)
      grassTuft1:     { x: 0,   y: 64,  w: 32, h: 32 },
      grassTuft2:     { x: 32,  y: 64,  w: 32, h: 32 },
      grassTuft3:     { x: 0,   y: 96,  w: 32, h: 32 },
      // Cattails/reeds — taller plant clusters
      cattail1:       { x: 64,  y: 64,  w: 32, h: 32 },
      cattail2:       { x: 96,  y: 64,  w: 32, h: 32 },
      // Mushroom clusters — 3×3 grid on right side (each ~13×14 content)
      mushroom1:      { x: 160, y: 0,   w: 32, h: 32 },
      mushroom2:      { x: 192, y: 0,   w: 32, h: 32 },
      mushroom3:      { x: 224, y: 0,   w: 32, h: 32 },
      mushroomSmall1: { x: 160, y: 32,  w: 32, h: 32 },
      mushroomSmall2: { x: 192, y: 32,  w: 32, h: 32 },
      // Rocks — small rocks at y=96, larger clusters at y=128
      rockSmall1:     { x: 160, y: 96,  w: 32, h: 32 },
      rockSmall2:     { x: 192, y: 96,  w: 32, h: 32 },
      rockCluster:    { x: 224, y: 96,  w: 32, h: 32 },
      // Trees — large, bottom section; start at y=128 to capture full canopy
      treeForest1:    { x: 0,   y: 128, w: 80, h: 128 },
      treeForest2:    { x: 80,  y: 128, w: 80, h: 128 },
      treeForest3:    { x: 160, y: 128, w: 96, h: 128 },
    },
  },

  // ── Tilesets ──────────────────────────────────────
  floors: {
    path: 'assets/tilesets/floors_tiles.png',
    tileW: 16,
    tileH: 16,
    cols: 25,
    rows: 26,
    // Named tile regions (col, row in tile grid)
    tiles: {
      grass:       { col: 2, row: 10 },  // RGB ~(50,118,3) bright green
      grassDark:   { col: 2, row: 11 },  // RGB ~(43,105,4) darker green
      grassAlt:    { col: 1, row: 10 },  // RGB ~(50,119,3) green variant
      dirt:        { col: 7, row: 10 },  // RGB ~(143,123,98) tan
      dirtDark:    { col: 7, row: 11 },  // RGB ~(125,108,86) darker
      dirtBrown:   { col: 12, row: 10 }, // RGB ~(157,106,61) brown
      stone:       { col: 16, row: 0 },  // RGB ~(117,107,95) gray stone
      stoneDark:   { col: 17, row: 0 },  // RGB ~(115,105,93)
      ruinFloor:   { col: 6, row: 10 },  // tan for ruin floors
      farmSoil:    { col: 12, row: 11 }, // dark brown soil
    },
  },

  walls: {
    path: 'assets/tilesets/wall_tiles.png',
    tileW: 16,
    tileH: 16,
    cols: 25,
    rows: 25,
    tiles: {
      brownWall:   { col: 2, row: 2 },   // RGB ~(157,106,61) brown
      brownFront:  { col: 2, row: 3 },   // brown front face
      grayWall:    { col: 8, row: 2 },   // RGB ~(81,100,103) gray
      grayFront:   { col: 8, row: 3 },   // gray front face
      darkWall:    { col: 14, row: 2 },  // RGB ~(96,63,15) dark
      woodPlank:   { col: 1, row: 16 },  // RGB ~(135,86,51) wood
      woodPlank2:  { col: 2, row: 16 },  // wood variant
    },
  },

  water: {
    path: 'assets/tilesets/water_tiles.png',
    tileW: 16,
    tileH: 16,
    cols: 25,
    rows: 25,
    tiles: {
      // Different blue shades for animation frames
      deep1:    { col: 2, row: 7 },   // RGB ~(62,146,209)
      deep2:    { col: 7, row: 7 },   // RGB ~(65,133,202) darker
      deep3:    { col: 2, row: 12 },  // RGB ~(66,150,209) lighter
      shallow1: { col: 7, row: 12 },  // RGB ~(69,136,203) shallow
      shallow2: { col: 2, row: 11 },  // RGB ~(66,150,209) shallow variant
    },
  },

  dungeon: {
    path: 'assets/tilesets/dungeon_tiles.png',
    tileW: 16,
    tileH: 16,
    cols: 25,
    rows: 25,
  },

  // ── Trees ─────────────────────────────────────────
  treeModel1: {
    path: 'assets/trees/tree_model1.png',
    // 448×368 → 4 columns of 112px, rows: 2 tree rows (152px) + stump row (64px)
    frameW: 112,
    frameH: 152,
    trees: {
      greenOak:    { col: 0, row: 0 },  // green full tree
      yellowOak:   { col: 1, row: 0 },  // yellow-green
      bareBrown:   { col: 2, row: 0 },  // bare/dead
      iceTree:     { col: 3, row: 0 },  // winter/ice
      autumnOak:   { col: 0, row: 1 },  // autumn orange
      autumnYellow: { col: 1, row: 1 }, // autumn yellow
      bareDark:    { col: 2, row: 1 },  // bare darker
      iceBlue:     { col: 3, row: 1 },  // ice blue
    },
  },

  treeModel2: {
    path: 'assets/trees/tree_model2.png',
    // 288×320 → 3 columns of 96px, rows: 2 tree rows (144px) + stump (32px)
    frameW: 96,
    frameH: 144,
    trees: {
      pine1:     { col: 0, row: 0 },  // blue-green pine
      pine2:     { col: 1, row: 0 },  // blue-green variant
      deadBare:  { col: 2, row: 0 },  // bare dead tree
      pine3:     { col: 0, row: 1 },  // pine variant
      pine4:     { col: 1, row: 1 },  // pine variant
    },
  },

  // ── Stations ──────────────────────────────────────
  bonfire: {
    path: 'assets/stations/bonfire_sheet.png',
    frameW: 32,
    frameH: 32,
    frameCount: 4,
  },

  fire: {
    path: 'assets/stations/fire_sheet.png',
    frameW: 32,
    frameH: 48,
    frameCount: 4,
  },

  // ── Props ─────────────────────────────────────────
  rocks: {
    path: 'assets/props/rocks.png',
    // 208×304 — various rock sprites at different sizes
    // Large rocks at top, smaller further down
    regions: {
      largeRock1:  { x: 0,   y: 16,  w: 32, h: 32 },
      largeRock2:  { x: 32,  y: 16,  w: 32, h: 32 },
      largeRock3:  { x: 64,  y: 16,  w: 32, h: 32 },
      medRock1:    { x: 0,   y: 64,  w: 24, h: 24 },
      medRock2:    { x: 24,  y: 64,  w: 24, h: 24 },
      medRock3:    { x: 48,  y: 64,  w: 24, h: 24 },
      smallRock1:  { x: 0,   y: 96,  w: 16, h: 16 },
      smallRock2:  { x: 16,  y: 96,  w: 16, h: 16 },
      smallRock3:  { x: 32,  y: 96,  w: 16, h: 16 },
    },
  },

  vegetation: {
    path: 'assets/props/vegetation.png',
    // 400×432 — bushes, plants, ground clutter
    regions: {
      bushGreen1:   { x: 0,   y: 0,   w: 48, h: 48 },
      bushGreen2:   { x: 48,  y: 0,   w: 48, h: 48 },
      bushYellow:   { x: 96,  y: 0,   w: 48, h: 48 },
      bushBrown:    { x: 144, y: 0,   w: 48, h: 48 },
      bushGreen3:   { x: 0,   y: 48,  w: 48, h: 48 },
      bushGreen4:   { x: 48,  y: 48,  w: 48, h: 48 },
      deadBranch:   { x: 192, y: 0,   w: 48, h: 48 },
      smallPlant1:  { x: 0,   y: 144, w: 32, h: 32 },
      smallPlant2:  { x: 32,  y: 144, w: 32, h: 32 },
      smallPlant3:  { x: 64,  y: 144, w: 32, h: 32 },
      grassClump1:  { x: 0,   y: 176, w: 16, h: 16 },
      grassClump2:  { x: 16,  y: 176, w: 16, h: 16 },
      grassClump3:  { x: 32,  y: 176, w: 16, h: 16 },
    },
  },

  // ── Buildings ─────────────────────────────────────
  buildingWalls: {
    path: 'assets/buildings/walls.png',
    // 672×800 — wall segments for buildings
    regions: {
      // Top section: log/wood walls with window openings
      wallFrontWood:  { x: 0,   y: 0,   w: 96,  h: 64 },
      wallSideWood:   { x: 96,  y: 0,   w: 96,  h: 64 },
      wallStone:      { x: 288, y: 0,   w: 96,  h: 64 },
      wallStone2:     { x: 384, y: 0,   w: 96,  h: 64 },
      // Full building wall section
      wallSection:    { x: 0,   y: 0,   w: 192, h: 128 },
      // Window wall sections (lower half with windows)
      windowWall:     { x: 0,   y: 400, w: 96,  h: 80 },
      windowWall2:    { x: 96,  y: 400, w: 96,  h: 80 },
    },
  },

  buildingRoofs: {
    path: 'assets/buildings/roofs.png',
    // 400×400 — various roof styles
    regions: {
      roofBrown:  { x: 0,   y: 0,   w: 160, h: 96 },
      roofGreen:  { x: 160, y: 0,   w: 160, h: 96 },
      roofBig:    { x: 0,   y: 96,  w: 160, h: 112 },
      roofGreenBig: { x: 160, y: 96, w: 160, h: 112 },
    },
  },

  // ── Enemies (preloaded but not rendered yet) ──────
  orcIdle: { path: 'assets/enemies/orc_idle.png', frameW: 32, frameH: 32, frameCount: 4 },
  orcRun: { path: 'assets/enemies/orc_run.png', frameW: 64, frameH: 64, frameCount: 6 },
  skeletonIdle: { path: 'assets/enemies/skeleton_idle.png', frameW: 32, frameH: 32, frameCount: 4 },
  skeletonRun: { path: 'assets/enemies/skeleton_run.png', frameW: 64, frameH: 64, frameCount: 6 },

  // ── Weapons (preloaded but not rendered yet) ──────
  bone: { path: 'assets/weapons/bone.png' },
  wood: { path: 'assets/weapons/wood.png' },
};

/**
 * Collect all asset paths for preloading.
 */
export function getAllAssetPaths() {
  const paths = [];
  for (const key of Object.keys(SPRITE_ATLAS)) {
    const entry = SPRITE_ATLAS[key];
    if (entry.path) {
      paths.push({ alias: key, src: entry.path });
    }
  }
  return paths;
}

/**
 * Collect generated terrain tile paths for preloading.
 */
export function getGeneratedTilePaths() {
  const paths = [];
  const seen = new Set();
  for (const val of Object.values(GENERATED_TILES)) {
    const names = Array.isArray(val) ? val : [val];
    for (const name of names) {
      if (!seen.has(name)) {
        seen.add(name);
        paths.push({ alias: `gen_${name}`, src: `assets/tilesets/generated/${name}.png` });
      }
    }
  }
  return paths;
}
