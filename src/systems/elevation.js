/**
 * Elevation system — manages a 2D elevation map parallel to the world map.
 * Values: 0 = ground, 1 = plateau, 2 = mountain
 */

import {
  WORLD_COLS,
  WORLD_ROWS,
  WORLD_TILE_SIZE,
  ELEVATION_GROUND,
  ELEVATION_PLATEAU,
  ELEVATION_MOUNTAIN,
  PLATEAU_Y_OFFSET,
} from '../utils/constants.js';

// Create elevation map (all ground by default)
const elevMap = [];
for (let r = 0; r < WORLD_ROWS; r++) {
  elevMap[r] = new Array(WORLD_COLS).fill(ELEVATION_GROUND);
}

/**
 * Set elevation for a single tile.
 */
export function setElevation(r, c, value) {
  if (r >= 0 && r < WORLD_ROWS && c >= 0 && c < WORLD_COLS) {
    elevMap[r][c] = value;
  }
}

/**
 * Set elevation for a rectangular region.
 */
export function fillElevation(r1, c1, r2, c2, value) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      setElevation(r, c, value);
    }
  }
}

/**
 * Get elevation at a tile coordinate.
 */
export function getElevation(tileCol, tileRow) {
  if (tileRow < 0 || tileRow >= WORLD_ROWS || tileCol < 0 || tileCol >= WORLD_COLS) {
    return ELEVATION_GROUND;
  }
  return elevMap[tileRow][tileCol];
}

/**
 * Get elevation at world pixel position.
 */
export function getElevationAtPixel(worldX, worldY) {
  const tileCol = Math.floor(worldX / WORLD_TILE_SIZE);
  const tileRow = Math.floor(worldY / WORLD_TILE_SIZE);
  return getElevation(tileCol, tileRow);
}

/**
 * Get the visual Y offset for a given elevation level.
 */
export function getElevationYOffset(elevation) {
  if (elevation === ELEVATION_PLATEAU) return PLATEAU_Y_OFFSET;
  return 0;
}

/** The elevation map — 160×160 2D array */
export const elevationMap = elevMap;
