/**
 * Collision system — tile passability and speed multiplier checks.
 * Updated for isometric: uses grid col/row directly instead of pixel positions.
 */

import {
  TILE_TREE,
  TILE_BUSH,
  TILE_RUIN_WALL,
  TILE_RIVER,
  TILE_ALIEN,
  TILE_WATER,
  TILE_SHALLOW_WATER,
  TILE_FLOODED_FLOOR,
  TILE_MOUNTAIN_WALL,
  TILE_MOUNTAIN_TOP,
  TILE_CLIFF_EDGE,
  TILE_WATERFALL,
  MAP_COLS,
  MAP_ROWS,
  SHALLOW_WATER_SPEED_MULTIPLIER,
  FLOODED_FLOOR_SPEED_MULTIPLIER,
} from '../utils/constants.js';

const BLOCKED_TILES = new Set([
  TILE_TREE,
  TILE_BUSH,
  TILE_RUIN_WALL,
  TILE_RIVER,
  TILE_ALIEN,
  TILE_WATER,
  TILE_MOUNTAIN_WALL,
  TILE_MOUNTAIN_TOP,
  TILE_CLIFF_EDGE,
  TILE_WATERFALL,
]);

const SPEED_MULTIPLIER_MAP = new Map([
  [TILE_SHALLOW_WATER, SHALLOW_WATER_SPEED_MULTIPLIER],
  [TILE_FLOODED_FLOOR, FLOODED_FLOOR_SPEED_MULTIPLIER],
]);

// Building collision tiles (set by GameScene after init)
const buildingBlockedTiles = new Set();

export function addBuildingCollision(col, row) {
  buildingBlockedTiles.add(`${col},${row}`);
}

/**
 * Check if a tile at (tileCol, tileRow) is passable.
 */
export function isPassable(tileCol, tileRow, worldMap) {
  if (tileRow < 0 || tileRow >= MAP_ROWS || tileCol < 0 || tileCol >= MAP_COLS) {
    return false;
  }
  if (buildingBlockedTiles.has(`${tileCol},${tileRow}`)) {
    return false;
  }
  return !BLOCKED_TILES.has(worldMap[tileRow][tileCol]);
}

/**
 * Check if a world-pixel position is passable.
 * (Legacy compatibility — converts pixel to grid)
 */
export function isPositionPassable(worldX, worldY, worldMap) {
  const tileCol = Math.floor(worldX);
  const tileRow = Math.floor(worldY);
  return isPassable(tileCol, tileRow, worldMap);
}

/**
 * Get speed multiplier for tile at grid position.
 */
export function getSpeedMultiplier(tileCol, tileRow, worldMap) {
  if (tileRow < 0 || tileRow >= MAP_ROWS || tileCol < 0 || tileCol >= MAP_COLS) {
    return 1.0;
  }
  const tileId = worldMap[tileRow][tileCol];
  return SPEED_MULTIPLIER_MAP.get(tileId) || 1.0;
}
