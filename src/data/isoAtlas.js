/**
 * Isometric sprite atlas — all pixel measurements from the asset pack.
 *
 * tiles.png:     2560×2560 — 10×10 grid of 256px cells
 * props.png:     2560×2560 — 10×10 grid of 256px cells (some multi-cell)
 * buildings.png: 2560×2560 — 10×10 grid of 256px cells (large multi-cell)
 * carts.png:     1536×512  — 6×2 grid of 256px cells (each cart spans 2 cells)
 */

export const ISO_ATLAS = {
  tiles: {
    path: 'assets/iso/tiles.png',
    cellSize: 256,
    // Row 0: Grass raised blocks (10 variants)
    grass: [
      { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
      { col: 3, row: 0 }, { col: 4, row: 0 }, { col: 5, row: 0 },
      { col: 6, row: 0 }, { col: 7, row: 0 }, { col: 8, row: 0 },
      { col: 9, row: 0 },
    ],
    // Row 1: Dirt/bare raised blocks (10 variants)
    dirt: [
      { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
      { col: 3, row: 1 }, { col: 4, row: 1 }, { col: 5, row: 1 },
      { col: 6, row: 1 }, { col: 7, row: 1 }, { col: 8, row: 1 },
      { col: 9, row: 1 },
    ],
    // Row 2: Stone path raised blocks (10 variants)
    stone: [
      { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      { col: 3, row: 2 }, { col: 4, row: 2 }, { col: 5, row: 2 },
      { col: 6, row: 2 }, { col: 7, row: 2 }, { col: 8, row: 2 },
      { col: 9, row: 2 },
    ],
    // Row 3: Rock/boulder raised blocks (10 variants)
    rock: [
      { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 },
      { col: 3, row: 3 }, { col: 4, row: 3 }, { col: 5, row: 3 },
      { col: 6, row: 3 }, { col: 7, row: 3 }, { col: 8, row: 3 },
      { col: 9, row: 3 },
    ],
    // Row 4: Ramp tiles (various directions)
    rampS:    { col: 0, row: 4 },
    rampN:    { col: 1, row: 4 },
    rampW:    { col: 2, row: 4 },
    rampE:    { col: 3, row: 4 },
    rampGrassS: { col: 4, row: 4 },
    rampGrassN: { col: 5, row: 4 },
    rampGrassW: { col: 6, row: 4 },
    rampGrassE: { col: 7, row: 4 },
    rampStone1: { col: 8, row: 4 },
    rampStone2: { col: 9, row: 4 },
    // Row 5: Half-height ramps and stairs
    halfRampS:  { col: 0, row: 5 },
    halfRampN:  { col: 1, row: 5 },
    halfRampW:  { col: 2, row: 5 },
    halfRampE:  { col: 3, row: 5 },
    halfRampS2: { col: 4, row: 5 },
    halfRampN2: { col: 5, row: 5 },
    stairs1:    { col: 6, row: 5 },
    stairs2:    { col: 7, row: 5 },
    stairsStone1: { col: 8, row: 5 },
    stairsStone2: { col: 9, row: 5 },
    // Row 6: Flat grass tiles (10 variants)
    flatGrass: [
      { col: 0, row: 6 }, { col: 1, row: 6 }, { col: 2, row: 6 },
      { col: 3, row: 6 }, { col: 4, row: 6 }, { col: 5, row: 6 },
      { col: 6, row: 6 }, { col: 7, row: 6 }, { col: 8, row: 6 },
      { col: 9, row: 6 },
    ],
    // Row 7: Flat dirt tiles (10 variants)
    flatDirt: [
      { col: 0, row: 7 }, { col: 1, row: 7 }, { col: 2, row: 7 },
      { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 5, row: 7 },
      { col: 6, row: 7 }, { col: 7, row: 7 }, { col: 8, row: 7 },
      { col: 9, row: 7 },
    ],
    // Row 8: Flat stone tiles (10 variants)
    flatStone: [
      { col: 0, row: 8 }, { col: 1, row: 8 }, { col: 2, row: 8 },
      { col: 3, row: 8 }, { col: 4, row: 8 }, { col: 5, row: 8 },
      { col: 6, row: 8 }, { col: 7, row: 8 }, { col: 8, row: 8 },
      { col: 9, row: 8 },
    ],
    // Row 9: Flat misc/stone tiles (10 variants)
    flatMisc: [
      { col: 0, row: 9 }, { col: 1, row: 9 }, { col: 2, row: 9 },
      { col: 3, row: 9 }, { col: 4, row: 9 }, { col: 5, row: 9 },
      { col: 6, row: 9 }, { col: 7, row: 9 }, { col: 8, row: 9 },
      { col: 9, row: 9 },
    ],
  },

  props: {
    path: 'assets/iso/props.png',
    cellSize: 256,
    // Row 0: Single-cell props (256×256 each)
    rockLarge1:   { x: 0,    y: 0,    w: 256, h: 256 },
    rockLarge2:   { x: 256,  y: 0,    w: 256, h: 256 },
    rockMedium:   { x: 512,  y: 0,    w: 256, h: 256 },
    barrel1:      { x: 768,  y: 0,    w: 256, h: 256 },
    crate1:       { x: 1024, y: 0,    w: 256, h: 256 },
    pot1:         { x: 1280, y: 0,    w: 256, h: 256 },
    grassTuft:    { x: 1536, y: 0,    w: 256, h: 256 },
    barrel2:      { x: 1792, y: 0,    w: 256, h: 256 },
    crate2:       { x: 2048, y: 0,    w: 256, h: 256 },
    sign1:        { x: 2304, y: 0,    w: 256, h: 256 },
    // Row 1: Smaller props
    mushroom1:    { x: 0,    y: 256,  w: 256, h: 256 },
    mushroom2:    { x: 256,  y: 256,  w: 256, h: 256 },
    grassSmall:   { x: 512,  y: 256,  w: 256, h: 256 },
    bush1:        { x: 768,  y: 256,  w: 256, h: 256 },
    sign2:        { x: 1024, y: 256,  w: 256, h: 256 },
    sign3:        { x: 1280, y: 256,  w: 256, h: 256 },
    rockSmall:    { x: 1536, y: 256,  w: 256, h: 256 },
    bush2:        { x: 1792, y: 256,  w: 256, h: 256 },
    stump1:       { x: 2048, y: 256,  w: 256, h: 256 },
    chest:        { x: 2304, y: 256,  w: 256, h: 256 },
    // Row 2: Medium props
    cauldron1:    { x: 0,    y: 512,  w: 256, h: 256 },
    cauldron2:    { x: 256,  y: 512,  w: 256, h: 256 },
    pot2:         { x: 512,  y: 512,  w: 256, h: 256 },
    woodPile1:    { x: 768,  y: 512,  w: 256, h: 256 },
    woodPile2:    { x: 1024, y: 512,  w: 256, h: 256 },
    fence1:       { x: 1280, y: 512,  w: 256, h: 256 },
    fence2:       { x: 1536, y: 512,  w: 256, h: 256 },
    fence3:       { x: 1792, y: 512,  w: 256, h: 256 },
    fence4:       { x: 2048, y: 512,  w: 256, h: 256 },
    haybale:      { x: 2304, y: 512,  w: 256, h: 256 },
    // Rows 3-4: Tent (large, spans 2×2 cells)
    tent:         { x: 0,    y: 768,  w: 512, h: 512 },
    // Rows 3-4: Well area
    wellProp:     { x: 768,  y: 768,  w: 512, h: 512 },
    // Row 3, cols 4-6: Additional mid-size props
    campfire:     { x: 1024, y: 768,  w: 256, h: 256 },
    lantern1:     { x: 1280, y: 768,  w: 256, h: 256 },
    lantern2:     { x: 1536, y: 768,  w: 256, h: 256 },
    // Row 3, cols 7-9: Small props
    flowerPot1:   { x: 1792, y: 768,  w: 256, h: 256 },
    flowerPot2:   { x: 2048, y: 768,  w: 256, h: 256 },
    flowerPot3:   { x: 2304, y: 768,  w: 256, h: 256 },
    // Row 6, col 3: Another well sprite
    well2:        { x: 768,  y: 1536, w: 256, h: 256 },
    // Row 6, cols 7-8: Wheelbarrow or cart-like object
    wheelbarrow:  { x: 1792, y: 1536, w: 512, h: 256 },
    // Row 7, col 3: Small bush/shrub
    shrub:        { x: 768,  y: 1792, w: 256, h: 256 },
    // Rows 7-9: Pine Tree (spans ~3 cols × 3 rows)
    pineTree:     { x: 0,    y: 1792, w: 768, h: 768 },
    // Rows 7-9: Oak Tree (spans ~3 cols × 3 rows)
    oakTree:      { x: 1024, y: 1792, w: 768, h: 768 },
    // Row 7-8: Additional props (cols 7-9)
    logPile1:     { x: 1792, y: 1792, w: 256, h: 256 },
    logPile2:     { x: 2048, y: 1792, w: 256, h: 256 },
    logPile3:     { x: 2304, y: 1792, w: 256, h: 256 },
    // Row 8: More props
    anvil:        { x: 768,  y: 2048, w: 256, h: 256 },
    workbench1:   { x: 1792, y: 2048, w: 256, h: 256 },
    workbench2:   { x: 2048, y: 2048, w: 256, h: 256 },
    workbench3:   { x: 2304, y: 2048, w: 256, h: 256 },
    // Row 9: Remaining
    scarecrow:    { x: 1280, y: 2304, w: 256, h: 256 },
    toolRack:     { x: 1792, y: 2304, w: 256, h: 256 },
    anvil2:       { x: 2048, y: 2304, w: 256, h: 256 },
    grindstone:   { x: 2304, y: 2304, w: 256, h: 256 },
  },

  buildings: {
    path: 'assets/iso/buildings.png',
    cellSize: 256,
    // House 1: rows 0-3, cols 0-3 (4×4 cells = 1024×1024)
    house1: { x: 0,    y: 0,    w: 1024, h: 1024 },
    // House 2: rows 0-4, cols 5-8 (4×5 cells = 1024×1280)
    house2: { x: 1280, y: 0,    w: 1024, h: 1280 },
    // House 3: rows 4-7, cols 0-3 (4×4 cells = 1024×1024)
    house3: { x: 0,    y: 1024, w: 1024, h: 1024 },
    // Well: rows 5-6, cols 5-6 (2×2 cells = 512×512)
    well:   { x: 1280, y: 1280, w: 512,  h: 512 },
  },

  carts: {
    path: 'assets/iso/carts.png',
    cellSize: 256,
    // Cart 1: cols 0-1 (2 cells wide × 2 rows = 512×512)
    cart1: { x: 0,   y: 0, w: 512, h: 512 },
    // Cart 2: cols 2-3
    cart2: { x: 512, y: 0, w: 512, h: 512 },
    // Cart 3: cols 4-5
    cart3: { x: 1024, y: 0, w: 512, h: 512 },
  },
};
