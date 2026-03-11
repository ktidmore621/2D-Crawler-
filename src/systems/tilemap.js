/**
 * Tile map rendering system — draws only visible tiles + buffer for performance.
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
  GRASS_COLORS,
  DIRT_COLORS,
  TREE_TRUNK_COLOR,
  TREE_CANOPY_COLOR,
  BUSH_COLOR,
  RUIN_FLOOR_COLOR,
  RUIN_WALL_COLOR,
  RIVER_COLOR,
  RIVER_EDGE_COLOR,
  ALIEN_BASE_COLOR,
  ALIEN_GLOW_COLOR,
  BASE_FLOOR_COLOR,
  TREE_PINE_COLOR,
  TREE_OAK_COLOR,
  TREE_DEAD_COLOR,
  TREE_TRUNK_BROWN,
} from '../utils/constants.js';

// Pre-compute a random grass color index and tree type for each tile (seeded by position)
function hashTile(r, c) {
  return ((r * 137 + c * 311) & 0xFFFF);
}

/**
 * Create the tile map renderer.
 * Returns an object with a Graphics instance and an update method.
 */
export function createTilemap() {
  const gfx = new Graphics();

  // Cache tree variant per tile
  const treeVariants = new Map();

  function getTreeVariant(r, c) {
    const key = r * WORLD_COLS + c;
    if (!treeVariants.has(key)) {
      const h = hashTile(r, c) % 3;
      treeVariants.set(key, h); // 0=pine, 1=oak, 2=dead
    }
    return treeVariants.get(key);
  }

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

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        const x = c * WORLD_TILE_SIZE;
        const y = r * WORLD_TILE_SIZE;
        const s = WORLD_TILE_SIZE;

        drawTileBase(gfx, tileId, x, y, s, r, c, time);
      }
    }

    // Second pass: draw tree canopies and overlays (on top of ground tiles)
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = worldMap[r][c];
        if (tileId === TILE_TREE) {
          drawTreeOverlay(gfx, c * WORLD_TILE_SIZE, r * WORLD_TILE_SIZE, WORLD_TILE_SIZE, r, c);
        } else if (tileId === TILE_BUSH) {
          drawBushOverlay(gfx, c * WORLD_TILE_SIZE, r * WORLD_TILE_SIZE, WORLD_TILE_SIZE);
        } else if (tileId === TILE_ALIEN) {
          drawAlienOverlay(gfx, c * WORLD_TILE_SIZE, r * WORLD_TILE_SIZE, WORLD_TILE_SIZE, time);
        } else if (tileId === TILE_RUIN_WALL) {
          drawRuinWallDetail(gfx, c * WORLD_TILE_SIZE, r * WORLD_TILE_SIZE, WORLD_TILE_SIZE, r, c);
        }
      }
    }
  }

  return { gfx, render };
}

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
      // Ground underneath tree — dark grass
      color = 0x1a3010;
      break;
    case TILE_BUSH:
      color = GRASS_COLORS[0]; // grass under bush
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
    default:
      color = GRASS_COLORS[0];
  }

  gfx.rect(x, y, s, s);
  gfx.fill(color);

  // River edges
  if (tileId === TILE_RIVER) {
    gfx.rect(x, y, s, 3);
    gfx.fill(RIVER_EDGE_COLOR);
    gfx.rect(x, y + s - 3, s, 3);
    gfx.fill(RIVER_EDGE_COLOR);
  }

  // Ruin floor cracks
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

function drawTreeOverlay(gfx, x, y, s, r, c) {
  const variant = ((r * 137 + c * 311) & 0xFFFF) % 3;
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Shadow on ground
  gfx.ellipse(cx, y + s - 6, s * 0.4, s * 0.15);
  gfx.fill({ color: 0x000000, alpha: 0.25 });

  if (variant === 0) {
    // Pine tree — triangle canopy, thin trunk
    gfx.rect(cx - 2, cy + 4, 4, s * 0.35);
    gfx.fill(TREE_TRUNK_BROWN);

    gfx.moveTo(cx, y + 2);
    gfx.lineTo(cx - s * 0.35, cy + 6);
    gfx.lineTo(cx + s * 0.35, cy + 6);
    gfx.closePath();
    gfx.fill(TREE_PINE_COLOR);

    // Second smaller triangle on top
    gfx.moveTo(cx, y - 2);
    gfx.lineTo(cx - s * 0.22, cy - 2);
    gfx.lineTo(cx + s * 0.22, cy - 2);
    gfx.closePath();
    gfx.fill(0x1a4a14);
  } else if (variant === 1) {
    // Oak tree — round canopy, wider trunk
    gfx.rect(cx - 3, cy + 2, 6, s * 0.3);
    gfx.fill(TREE_TRUNK_BROWN);

    gfx.circle(cx, cy - 2, s * 0.35);
    gfx.fill(TREE_OAK_COLOR);

    // Highlight
    gfx.circle(cx - 3, cy - 5, s * 0.15);
    gfx.fill({ color: 0x3a7a22, alpha: 0.5 });
  } else {
    // Dead tree — bare branches, grey tone
    gfx.rect(cx - 2, cy + 2, 4, s * 0.4);
    gfx.fill(0x5a5040);

    // Bare branches
    gfx.moveTo(cx, cy + 2);
    gfx.lineTo(cx - 10, cy - 10);
    gfx.stroke({ width: 2, color: TREE_DEAD_COLOR });

    gfx.moveTo(cx, cy - 2);
    gfx.lineTo(cx + 8, cy - 14);
    gfx.stroke({ width: 2, color: TREE_DEAD_COLOR });

    gfx.moveTo(cx - 10, cy - 10);
    gfx.lineTo(cx - 14, cy - 16);
    gfx.stroke({ width: 1.5, color: TREE_DEAD_COLOR });

    gfx.moveTo(cx + 8, cy - 14);
    gfx.lineTo(cx + 13, cy - 18);
    gfx.stroke({ width: 1.5, color: TREE_DEAD_COLOR });
  }
}

function drawBushOverlay(gfx, x, y, s) {
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Shadow
  gfx.ellipse(cx, y + s - 4, s * 0.35, s * 0.1);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Bush body
  gfx.circle(cx, cy + 2, s * 0.3);
  gfx.fill(BUSH_COLOR);

  gfx.circle(cx - 6, cy, s * 0.2);
  gfx.fill(0x2a5518);

  gfx.circle(cx + 5, cy + 3, s * 0.18);
  gfx.fill(0x224a12);
}

function drawAlienOverlay(gfx, x, y, s, time) {
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Hexagonal shape
  const radius = s * 0.35;
  gfx.moveTo(cx + radius, cy);
  for (let i = 1; i <= 6; i++) {
    const angle = (Math.PI / 3) * i;
    gfx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }
  gfx.closePath();
  gfx.fill(0x1a2a1a);

  // Glow edge — pulsing alpha
  const glowAlpha = 0.3 + 0.3 * Math.sin(time * 2);
  const glowRadius = radius + 3;
  gfx.moveTo(cx + glowRadius, cy);
  for (let i = 1; i <= 6; i++) {
    const angle = (Math.PI / 3) * i;
    gfx.lineTo(cx + glowRadius * Math.cos(angle), cy + glowRadius * Math.sin(angle));
  }
  gfx.closePath();
  gfx.stroke({ width: 2, color: ALIEN_GLOW_COLOR, alpha: glowAlpha });
}

function drawRuinWallDetail(gfx, x, y, s, r, c) {
  // Cracked stone look — add some lines
  const h = hashTile(r, c);
  if (h % 4 === 0) {
    gfx.moveTo(x + 5, y + 5);
    gfx.lineTo(x + s - 10, y + s / 2);
    gfx.stroke({ width: 1, color: 0x4a3a28, alpha: 0.6 });
  }
  if (h % 3 === 0) {
    gfx.moveTo(x + s / 2, y + 3);
    gfx.lineTo(x + s / 2 - 5, y + s - 3);
    gfx.stroke({ width: 1, color: 0x4a3a28, alpha: 0.4 });
  }
  // Stone block grid lines
  gfx.moveTo(x, y + s / 2);
  gfx.lineTo(x + s, y + s / 2);
  gfx.stroke({ width: 0.5, color: 0x3a2a18, alpha: 0.3 });
  gfx.moveTo(x + s / 2, y);
  gfx.lineTo(x + s / 2, y + s);
  gfx.stroke({ width: 0.5, color: 0x3a2a18, alpha: 0.3 });
}
