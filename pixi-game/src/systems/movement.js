export function createMovementState() {
  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  };

  return {
    keys,
    onKeyDown(event) {
      if (event.code in keys) {
        keys[event.code] = true;
      }
    },
    onKeyUp(event) {
      if (event.code in keys) {
        keys[event.code] = false;
      }
    },
  };
}

export function updatePlayerMovement({
  player,
  movementState,
  boundsWidth,
  boundsHeight,
  deltaSeconds,
}) {
  const { keys } = movementState;

  const up = keys.ArrowUp || keys.KeyW;
  const down = keys.ArrowDown || keys.KeyS;
  const left = keys.ArrowLeft || keys.KeyA;
  const right = keys.ArrowRight || keys.KeyD;

  let moveX = 0;
  let moveY = 0;

  if (up) moveY -= 1;
  if (down) moveY += 1;
  if (left) moveX -= 1;
  if (right) moveX += 1;

  // Normalize diagonal movement so diagonal speed is not faster.
  if (moveX !== 0 && moveY !== 0) {
    const diagonalScale = 1 / Math.sqrt(2);
    moveX *= diagonalScale;
    moveY *= diagonalScale;
  }

  player.x += moveX * player.speed * deltaSeconds;
  player.y += moveY * player.speed * deltaSeconds;

  // Keep player inside visible screen area.
  const minX = player.radius;
  const maxX = boundsWidth - player.radius;
  const minY = player.radius;
  const maxY = boundsHeight - player.radius;

  player.x = Math.max(minX, Math.min(maxX, player.x));
  player.y = Math.max(minY, Math.min(maxY, player.y));
}
