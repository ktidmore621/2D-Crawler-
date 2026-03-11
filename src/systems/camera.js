/**
 * Camera system — centers on player, clamped to world bounds.
 */

/**
 * Calculate camera offset so player is centered in viewport,
 * clamped so world edges never show empty space.
 *
 * @param {{ x: number, y: number }} player - player world position
 * @param {number} worldWidth - total world width in pixels
 * @param {number} worldHeight - total world height in pixels
 * @param {number} viewportWidth - visible screen width
 * @param {number} viewportHeight - visible screen height
 * @returns {{ x: number, y: number }} camera offset (negative values to shift world container)
 */
export function updateCamera(player, worldWidth, worldHeight, viewportWidth, viewportHeight) {
  // Desired camera position: center player in viewport
  let x = viewportWidth / 2 - player.x;
  let y = viewportHeight / 2 - player.y;

  // Clamp so world edges don't scroll past viewport edges
  const minX = viewportWidth - worldWidth;
  const minY = viewportHeight - worldHeight;

  x = Math.min(0, Math.max(minX, x));
  y = Math.min(0, Math.max(minY, y));

  return { x, y };
}
