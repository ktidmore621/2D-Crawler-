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
import { createMiniMap } from '../systems/minimap.js';
import {
  worldMap,
  PLAYER_START_COL,
  PLAYER_START_ROW,
  DUNGEON_TILE_ROW,
  DUNGEON_TILE_COL,
  CAVE_TRIGGERS,
  TUNNEL_TRIGGER,
} from '../data/worldMap.js';

export default class GameScene {
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
    this.miniMap = null;
    this.elapsedTime = 0;
    this._dungeonLogged = false;
    this._caveLogged = {};
    this._tunnelLogged = false;
  }

  async init() {
    const { width, height } = this.app.screen;
    this.app.renderer.background.color = BG_COLOR;
    this.app.stage.addChild(this.container);

    this.container.addChild(this.worldContainer);

    this.tilemap = createTilemap();
    this.worldContainer.addChild(this.tilemap.gfx);

    // Decoration layer — rendered above tiles but below player
    this.propsRenderer = createPropsRenderer();
    this.worldContainer.addChild(this.propsRenderer.gfx);

    this.player = new Player(this.characterType, this.characterName);
    await this.player.load();

    this.player.x = PLAYER_START_COL * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2;
    this.player.y = PLAYER_START_ROW * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2;
    this.worldContainer.addChild(this.player.view);

    this._createVignette(width, height);

    // Mini map overlay (added to container so it stays on top of vignette)
    this.miniMap = createMiniMap(worldMap);
    this.container.addChild(this.miniMap.container);

    this.inputState = createInputState();
    this._onKeyDown = this.inputState.onKeyDown;
    this._onKeyUp = this.inputState.onKeyUp;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    updateStatusStrip(this.characterName);

    this._updateWorld(0);
  }

  _createVignette(w, h) {
    this.vignette = new Graphics();
    this.vignette.rect(0, 0, w, 30);
    this.vignette.fill({ color: 0x000000, alpha: 0.15 });
    this.vignette.rect(0, h - 30, w, 30);
    this.vignette.fill({ color: 0x000000, alpha: 0.15 });
    this.vignette.rect(0, 0, 20, h);
    this.vignette.fill({ color: 0x000000, alpha: 0.12 });
    this.vignette.rect(w - 20, 0, 20, h);
    this.vignette.fill({ color: 0x000000, alpha: 0.12 });
    this.vignette.rect(0, 0, w, h);
    this.vignette.fill({ color: 0x000000, alpha: 0.05 });
    this.container.addChild(this.vignette);
  }

  update(deltaSeconds) {
    if (!this.player || !this.inputState) return;

    this.elapsedTime += deltaSeconds;
    this.inputState.updateDirs();
    this.player.update(this.inputState.dirs, worldMap, deltaSeconds);

    this._checkTriggers();
    this._updateWorld(deltaSeconds);

    // Update mini map with player position
    if (this.miniMap) {
      const { width } = this.app.screen;
      this.miniMap.update(this.player.x, this.player.y, width);
    }
  }

  _updateWorld(deltaSeconds) {
    const { width, height } = this.app.screen;
    const cam = updateCamera(this.player, WORLD_WIDTH, WORLD_HEIGHT, width, height);
    this.worldContainer.x = cam.x;
    this.worldContainer.y = cam.y;
    this.tilemap.render(worldMap, cam.x, cam.y, width, height, this.elapsedTime);
    this.propsRenderer.render(cam.x, cam.y, width, height, this.elapsedTime);
  }

  _checkTriggers() {
    const playerTileCol = Math.floor(this.player.x / WORLD_TILE_SIZE);
    const playerTileRow = Math.floor(this.player.y / WORLD_TILE_SIZE);

    // Dungeon entrance
    if (playerTileCol === DUNGEON_TILE_COL && playerTileRow === DUNGEON_TILE_ROW) {
      if (!this._dungeonLogged) {
        console.log('Enter dungeon');
        this._dungeonLogged = true;
      }
    } else {
      this._dungeonLogged = false;
    }

    // Cave entrances
    for (const cave of CAVE_TRIGGERS) {
      const key = cave.label;
      if (playerTileCol === cave.col && playerTileRow === cave.row) {
        if (!this._caveLogged[key]) {
          console.log(`Enter ${cave.label}`);
          this._caveLogged[key] = true;
        }
      } else {
        this._caveLogged[key] = false;
      }
    }

    // Tunnel entrance
    if (playerTileCol === TUNNEL_TRIGGER.col && playerTileRow === TUNNEL_TRIGGER.row) {
      if (!this._tunnelLogged) {
        console.log('Enter tunnel');
        this._tunnelLogged = true;
      }
    } else {
      this._tunnelLogged = false;
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
    if (this.miniMap) {
      this.miniMap.destroy();
    }
    this.container.destroy({ children: true });
  }
}
