/**
 * Virtual D-pad for mobile touch controls.
 * Renders 4 arrow buttons in a plus/cross shape using PixiJS Graphics.
 */
import { Container, Graphics, Text } from 'pixi.js';
import {
  DPAD_BUTTON_SIZE,
  DPAD_MARGIN,
  DPAD_ALPHA,
  DPAD_PRESSED_ALPHA,
  DPAD_COLOR,
  DPAD_BG_COLOR,
  DPAD_BG_ALPHA,
} from '../utils/constants.js';

const ARROW_LABELS = {
  up:    '▲',
  down:  '▼',
  left:  '◀',
  right: '▶',
};

const POSITIONS = {
  up:    { col: 1, row: 0 },
  left:  { col: 0, row: 1 },
  right: { col: 2, row: 1 },
  down:  { col: 1, row: 2 },
};

/**
 * Create and return a D-pad container.
 * @param {Function} setTouchDir - (dir, active) => void
 * @returns {Container} The D-pad display object to add to stage.
 */
export function createDpad(setTouchDir) {
  const dpad = new Container();
  const size = DPAD_BUTTON_SIZE;

  for (const [dir, pos] of Object.entries(POSITIONS)) {
    const btn = new Container();
    btn.x = pos.col * size;
    btn.y = pos.row * size;
    btn.eventMode = 'static';

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, size, size, 8);
    bg.fill({ color: DPAD_BG_COLOR, alpha: DPAD_BG_ALPHA });
    btn.addChild(bg);

    // Arrow label
    const label = new Text({
      text: ARROW_LABELS[dir],
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: size * 0.4,
        fill: DPAD_COLOR,
      },
    });
    label.anchor.set(0.5);
    label.x = size / 2;
    label.y = size / 2;
    btn.addChild(label);

    btn.alpha = DPAD_ALPHA;

    // Touch handlers
    const activate = (e) => {
      e.stopPropagation();
      btn.alpha = DPAD_PRESSED_ALPHA;
      setTouchDir(dir, true);
    };
    const deactivate = (e) => {
      if (e) e.stopPropagation();
      btn.alpha = DPAD_ALPHA;
      setTouchDir(dir, false);
    };

    btn.on('pointerdown', activate);
    btn.on('pointerup', deactivate);
    btn.on('pointerupoutside', deactivate);
    btn.on('pointercancel', deactivate);

    dpad.addChild(btn);
  }

  return dpad;
}

/**
 * Position the D-pad in the bottom-left corner of the screen.
 * @param {Container} dpad
 * @param {number} screenWidth
 * @param {number} screenHeight
 */
export function positionDpad(dpad, screenWidth, screenHeight) {
  const totalSize = DPAD_BUTTON_SIZE * 3;
  dpad.x = DPAD_MARGIN;
  dpad.y = screenHeight - totalSize - DPAD_MARGIN;
}
