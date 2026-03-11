import { Container, Graphics } from 'pixi.js';
import {
  BG_COLOR,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  WORLD_TILE_SIZE,
} from '../utils/constants.js';
import Player from '../entities/Player.js';
import { createInputState, updateStatusStrip } from '../systems/input.js';
import { updateCamera } from '../systems/camera.js';
import { createTilemap } from '../systems/tilemap.js';
import { createPropsRenderer } from '../systems/props.js';
import { isPositionPassable } from '../systems/collision.js';
import {
  worldMap,
  PLAYER_START_COL,
  PLAYER_START_ROW,
  DUNGEON_TILE_ROW,
  DUNGEON_TILE_COL,
} from '../data/worldMap.js';

export default class GameScene {
  /**
   * @param {import('pixi.js').Application} app
   * @param {string} characterType - 'male' | 'female' | 'androgynous'
   * @param {string} characterName - player-chosen name
   */
  constructor(app, characterType, characterName) {
    this.app = app;
    this.characterType = characterType;
    this.characterName = characterName;
    this.container = new Container();
    this.worldContainer = new Container();
    this.inputState = null;
    this.player = null;
    this.tilemap = null;
    this.propsRenderer = null;
    this.vignette = null;
    this.elapsedTime = 0;
    this._dungeonLogged = false;
  }

  async init() {
    const { width, height } = this.app.screen;
    this.app.renderer.background.color = BG_COLOR;
    this.app.stage.addChild(this.container);

    // World container holds tiles, props, and player
    this.container.addChild(this.worldContainer);

    // Create tile map renderer
    this.tilemap = createTilemap();
    this.worldContainer.addChild(this.tilemap.gfx);

    // Create props renderer
    this.propsRenderer = createPropsRenderer();
    this.worldContainer.addChild(this.propsRenderer.gfx);

    // Create and load player
    this.player = new Player(this.characterType, this.characterName);
    await this.player.load();

    // Start position — base camp
    this.player.x = PLAYER_START_COL * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2;
    this.player.y = PLAYER_START_ROW * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2;
    this.worldContainer.addChild(this.player.view);

    // Create vignette overlay (on top of everything, fixed to screen)
    this._createVignette(width, height);

    // Set up unified input
    this.inputState = createInputState();
    this._onKeyDown = this.inputState.onKeyDown;
    this._onKeyUp = this.inputState.onKeyUp;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    // Update status strip
    updateStatusStrip(this.characterName);

    // Initial camera + render
    this._updateWorld(0);
  }

  _createVignette(w, h) {
    this.vignette = new Graphics();

    // Dark edges, lighter center — radial gradient approximation
    // Draw concentric semi-transparent rectangles getting darker toward edges
    const steps = 8;
    for (let i = steps; i >= 1; i--) {
      const t = i / steps;
      const alpha = t * t * 0.35; // quadratic falloff, max 0.35
      const inset = (1 - t) * Math.min(w, h) * 0.3;
      this.vignette.rect(0, 0, w, h);
      this.vignette.fill({ color: 0x000000, alpha: alpha });
    }

    // Stronger edges
    // Top edge
    this.vignette.rect(0, 0, w, 30);
    this.vignette.fill({ color: 0x000000, alpha: 0.25 });
    // Bottom edge
    this.vignette.rect(0, h - 30, w, 30);
    this.vignette.fill({ color: 0x000000, alpha: 0.25 });
    // Left edge
    this.vignette.rect(0, 0, 20, h);
    this.vignette.fill({ color: 0x000000, alpha: 0.2 });
    // Right edge
    this.vignette.rect(w - 20, 0, 20, h);
    this.vignette.fill({ color: 0x000000, alpha: 0.2 });

    this.container.addChild(this.vignette);
  }

  update(deltaSeconds) {
    if (!this.player || !this.inputState) return;

    this.elapsedTime += deltaSeconds;

    // Merge keyboard + touch into dirs
    this.inputState.updateDirs();

    // Update player (movement + collision)
    this.player.update(this.inputState.dirs, worldMap, deltaSeconds);

    // Check dungeon entrance trigger
    this._checkDungeonTrigger();

    // Update world rendering
    this._updateWorld(deltaSeconds);
  }

  _updateWorld(deltaSeconds) {
    const { width, height } = this.app.screen;

    // Camera
    const cam = updateCamera(this.player, WORLD_WIDTH, WORLD_HEIGHT, width, height);
    this.worldContainer.x = cam.x;
    this.worldContainer.y = cam.y;

    // Render tiles (only visible ones)
    this.tilemap.render(worldMap, cam.x, cam.y, width, height, this.elapsedTime);

    // Render props (only visible ones)
    this.propsRenderer.render(cam.x, cam.y, width, height, this.elapsedTime);
  }

  _checkDungeonTrigger() {
    const playerTileCol = Math.floor(this.player.x / WORLD_TILE_SIZE);
    const playerTileRow = Math.floor(this.player.y / WORLD_TILE_SIZE);

    if (playerTileCol === DUNGEON_TILE_COL && playerTileRow === DUNGEON_TILE_ROW) {
      if (!this._dungeonLogged) {
        console.log('Enter dungeon');
        this._dungeonLogged = true;
      }
    } else {
      this._dungeonLogged = false;
    }
  }

  destroy() {
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
    if (this.inputState && this.inputState.destroy) {
      this.inputState.destroy();
    }
    this.container.destroy({ children: true });
  }
}
