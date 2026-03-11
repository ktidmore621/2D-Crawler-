/**
 * Collision system — tile passability and speed multiplier checks.
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
  WORLD_TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
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

/**
 * Check if a tile at (tileCol, tileRow) is passable.
 */
export function isPassable(tileCol, tileRow, worldMap) {
  if (tileRow < 0 || tileRow >= WORLD_ROWS || tileCol < 0 || tileCol >= WORLD_COLS) {
    return false;
  }
  return !BLOCKED_TILES.has(worldMap[tileRow][tileCol]);
}

/**
 * Check if a world-pixel position is passable.
 */
export function isPositionPassable(worldX, worldY, worldMap) {
  const tileCol = Math.floor(worldX / WORLD_TILE_SIZE);
  const tileRow = Math.floor(worldY / WORLD_TILE_SIZE);
  return isPassable(tileCol, tileRow, worldMap);
}

/**
 * Get speed multiplier for tile at world pixel position.
 * Returns 1.0 for normal speed, less for slowing tiles.
 */
export function getSpeedMultiplier(worldX, worldY, worldMap) {
  const tileCol = Math.floor(worldX / WORLD_TILE_SIZE);
  const tileRow = Math.floor(worldY / WORLD_TILE_SIZE);
  if (tileRow < 0 || tileRow >= WORLD_ROWS || tileCol < 0 || tileCol >= WORLD_COLS) {
    return 1.0;
  }
  const tileId = worldMap[tileRow][tileCol];
  return SPEED_MULTIPLIER_MAP.get(tileId) || 1.0;
}
