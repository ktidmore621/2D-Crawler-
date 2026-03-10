import {
  TILE_SIZE,
  TILE_LINE_COLOR,
  TILE_LINE_ALPHA,
  TILE_SCROLL_SPEED,
} from '../utils/constants.js';

export function createTileGridState() {
  return { offset: 0 };
}

export function updateTileGrid(state, deltaSeconds) {
  state.offset = (state.offset + TILE_SCROLL_SPEED * deltaSeconds) % TILE_SIZE;
}

export function drawTileGrid(graphics, state, width, height) {
  graphics.clear();

  const startY = -TILE_SIZE + state.offset;
  const startX = -TILE_SIZE + state.offset;

  for (let y = startY; y <= height + TILE_SIZE; y += TILE_SIZE) {
    graphics.moveTo(0, y).lineTo(width, y).stroke({ color: TILE_LINE_COLOR, alpha: TILE_LINE_ALPHA, width: 1 });
  }

  for (let x = startX; x <= width + TILE_SIZE; x += TILE_SIZE) {
    graphics.moveTo(x, 0).lineTo(x, height).stroke({ color: TILE_LINE_COLOR, alpha: TILE_LINE_ALPHA, width: 1 });
  }
}
