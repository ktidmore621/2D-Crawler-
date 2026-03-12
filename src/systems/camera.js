/**
 * Isometric camera system — centers on player's screen position.
 * The player's screen position is calculated from their grid position
 * using gridToScreen(). The camera offsets the worldContainer.
 */

/**
 * Calculate camera offset so player is centered in viewport.
 * For isometric, no clamping to world bounds (isometric world has
 * diamond shape, clamping is more complex — skip for now).
 *
 * @param {{ x: number, y: number }} player - player screen position (from gridToScreen)
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 * @returns {{ x: number, y: number }}
 */
export function updateCamera(player, worldWidth, worldHeight, viewportWidth, viewportHeight) {
  let x = viewportWidth / 2 - player.x;
  let y = viewportHeight / 2 - player.y;

  return { x: Math.round(x), y: Math.round(y) };
}
