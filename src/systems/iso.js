/**
 * Isometric math module — all coordinate conversion lives here.
 */

import { ISO_TILE_W, ISO_TILE_H } from '../utils/constants.js';

/**
 * Convert grid (col, row) to screen (x, y).
 * Origin is top of diamond map (col=0, row=0 at top).
 */
export function gridToScreen(col, row) {
  return {
    x: (col - row) * (ISO_TILE_W / 2),
    y: (col + row) * (ISO_TILE_H / 2),
  };
}

/**
 * Convert screen (x, y) to grid (col, row) — for click/collision.
 */
export function screenToGrid(x, y) {
  const col = (x / (ISO_TILE_W / 2) + y / (ISO_TILE_H / 2)) / 2;
  const row = (y / (ISO_TILE_H / 2) - x / (ISO_TILE_W / 2)) / 2;
  return { col, row };
}

/**
 * Get render sort order (painter's algorithm — back to front).
 * Higher value = render later (on top).
 */
export function getSortDepth(col, row) {
  return col + row;
}
