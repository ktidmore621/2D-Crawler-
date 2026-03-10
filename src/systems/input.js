/**
 * Unified input system — handles keyboard, DOM D-pad, and action buttons.
 * Single source of truth for all directional + action input.
 */

const GAME_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'KeyZ', 'KeyX', 'KeyC', 'KeyM',
]);

/**
 * Creates a unified input state that merges keyboard + touch directions.
 * Also wires up DOM D-pad buttons and action buttons from #control-panel.
 */
export function createInputState() {
  const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
    KeyZ: false, KeyX: false, KeyC: false, KeyM: false,
  };

  // Touch directions (set by D-pad)
  const touch = { up: false, down: false, left: false, right: false };

  // Merged directional state — read this in game loop
  const dirs = { up: false, down: false, left: false, right: false };

  function onKeyDown(e) {
    if (GAME_KEYS.has(e.code)) {
      e.preventDefault();
      keys[e.code] = true;

      // Action keyboard shortcuts
      if (e.code === 'KeyZ') emitAction('attack');
      if (e.code === 'KeyX') emitAction('interact');
      if (e.code === 'KeyC') emitAction('roll');
      if (e.code === 'KeyM') emitAction('inventory');
    }
  }

  function onKeyUp(e) {
    if (GAME_KEYS.has(e.code)) {
      e.preventDefault();
      keys[e.code] = false;
    }
  }

  /**
   * Set a touch direction on/off. Called by D-pad.
   */
  function setTouchDir(dir, active) {
    touch[dir] = active;
  }

  /** Merge keyboard + touch into `dirs`. Call once per frame before reading dirs. */
  function updateDirs() {
    dirs.up = keys.ArrowUp || keys.KeyW || touch.up;
    dirs.down = keys.ArrowDown || keys.KeyS || touch.down;
    dirs.left = keys.ArrowLeft || keys.KeyA || touch.left;
    dirs.right = keys.ArrowRight || keys.KeyD || touch.right;
  }

  const isTouchDevice = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  // ── Wire up DOM D-pad buttons ──
  const dpadCleanups = [];
  const dpadBtns = document.querySelectorAll('.dpad-btn[data-dir]');
  for (const btn of dpadBtns) {
    const dir = btn.dataset.dir;
    const activate = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('pressed');
      setTouchDir(dir, true);
    };
    const deactivate = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      btn.classList.remove('pressed');
      setTouchDir(dir, false);
    };
    btn.addEventListener('pointerdown', activate);
    btn.addEventListener('pointerup', deactivate);
    btn.addEventListener('pointerleave', deactivate);
    btn.addEventListener('pointercancel', deactivate);
    dpadCleanups.push(() => {
      btn.removeEventListener('pointerdown', activate);
      btn.removeEventListener('pointerup', deactivate);
      btn.removeEventListener('pointerleave', deactivate);
      btn.removeEventListener('pointercancel', deactivate);
    });
  }

  // ── Wire up DOM Action buttons ──
  const actionCleanups = [];
  const actionBtns = document.querySelectorAll('.action-btn[data-action]');
  for (const btn of actionBtns) {
    const action = btn.dataset.action;
    const onPress = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('pressed');
      emitAction(action);
    };
    const onRelease = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      btn.classList.remove('pressed');
    };
    btn.addEventListener('pointerdown', onPress);
    btn.addEventListener('pointerup', onRelease);
    btn.addEventListener('pointerleave', onRelease);
    btn.addEventListener('pointercancel', onRelease);
    actionCleanups.push(() => {
      btn.removeEventListener('pointerdown', onPress);
      btn.removeEventListener('pointerup', onRelease);
      btn.removeEventListener('pointerleave', onRelease);
      btn.removeEventListener('pointercancel', onRelease);
    });
  }

  /** Emit a named action event (placeholder — console.log for now) */
  function emitAction(name) {
    console.log(`[action] ${name}`);
  }

  /** Clean up all event listeners */
  function destroy() {
    for (const fn of dpadCleanups) fn();
    for (const fn of actionCleanups) fn();
    dpadCleanups.length = 0;
    actionCleanups.length = 0;
  }

  return {
    dirs, keys, touch,
    onKeyDown, onKeyUp, setTouchDir, updateDirs,
    isTouchDevice, emitAction, destroy,
  };
}

/**
 * Update the status strip in the control panel.
 * @param {string} name - Player name
 * @param {number} healthPct - 0–1
 * @param {number} staminaPct - 0–1
 */
export function updateStatusStrip(name, healthPct = 1, staminaPct = 1) {
  const nameEl = document.getElementById('status-player-name');
  const healthEl = document.getElementById('health-bar');
  const staminaEl = document.getElementById('stamina-bar');
  if (nameEl) nameEl.textContent = name || 'SURVIVOR';
  if (healthEl) healthEl.style.width = `${Math.round(healthPct * 100)}%`;
  if (staminaEl) staminaEl.style.width = `${Math.round(staminaPct * 100)}%`;
}
