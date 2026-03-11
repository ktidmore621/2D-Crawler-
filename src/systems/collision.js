/**
 * Collision system — tile passability checks.
 */

import {
  TILE_TREE,
  TILE_BUSH,
  TILE_RUIN_WALL,
  TILE_RIVER,
  TILE_ALIEN,
  WORLD_TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
} from '../utils/constants.js';

const BLOCKED_TILES = new Set([
  TILE_TREE,
  TILE_BUSH,
  TILE_RUIN_WALL,
  TILE_RIVER,
  TILE_ALIEN,
]);

/**
 * Check if a tile at (tileCol, tileRow) is passable.
 * @param {number} tileCol
 * @param {number} tileRow
 * @param {number[][]} worldMap
 * @returns {boolean}
 */
export function isPassable(tileCol, tileRow, worldMap) {
  if (tileRow < 0 || tileRow >= WORLD_ROWS || tileCol < 0 || tileCol >= WORLD_COLS) {
    return false;
  }
  return !BLOCKED_TILES.has(worldMap[tileRow][tileCol]);
}

/**
 * Check if a world-pixel position is passable.
 * Checks the tile at the player's feet (bottom-center).
 * @param {number} worldX - pixel X
 * @param {number} worldY - pixel Y
 * @param {number[][]} worldMap
 * @returns {boolean}
 */
export function isPositionPassable(worldX, worldY, worldMap) {
  const tileCol = Math.floor(worldX / WORLD_TILE_SIZE);
  const tileRow = Math.floor(worldY / WORLD_TILE_SIZE);
  return isPassable(tileCol, tileRow, worldMap);
}
