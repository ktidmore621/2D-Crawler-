import { Container, Graphics } from 'pixi.js';
import {
  BG_COLOR,
  ISO_TILE_W,
  ISO_TILE_H,
  MAP_COLS,
  MAP_ROWS,
} from '../utils/constants.js';
import Player from '../entities/Player.js';
import { createInputState, updateStatusStrip } from '../systems/input.js';
import { updateCamera } from '../systems/camera.js';
import { createTilemap } from '../systems/tilemap.js';
import { createPropsRenderer, getBuildingCollisionTiles } from '../systems/props.js';
import { addBuildingCollision } from '../systems/collision.js';
import { createMiniMap } from '../systems/minimap.js';
import { gridToScreen } from '../systems/iso.js';
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
    // Deep forest green so any gap at edges blends with terrain
    this.app.renderer.background.color = 0x2a3d1a;
    this.app.stage.addChild(this.container);

    this.container.addChild(this.worldContainer);

    // Register building collision tiles
    const bldgTiles = getBuildingCollisionTiles();
    for (const t of bldgTiles) {
      addBuildingCollision(t.col, t.row);
    }

    // Tilemap layer
    this.tilemap = createTilemap();
    this.worldContainer.addChild(this.tilemap.gfx);

    // Props layer (above tiles, depth-sorted)
    this.propsRenderer = createPropsRenderer();
    this.propsRenderer.setWorldMap(worldMap);
    this.worldContainer.addChild(this.propsRenderer.gfx);

    // Player
    this.player = new Player(this.characterType, this.characterName);
    await this.player.load();
    this.player.setGridPosition(PLAYER_START_COL, PLAYER_START_ROW);
    this.worldContainer.addChild(this.player.view);

    this._createVignette(width, height);

    // Mini map
    this.miniMap = createMiniMap(worldMap);
    this.container.addChild(this.miniMap.container);

    // Input
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

    // Update mini map with player grid position
    if (this.miniMap) {
      const { width } = this.app.screen;
      this.miniMap.update(this.player.gridCol, this.player.gridRow, width);
    }
  }

  _updateWorld(deltaSeconds) {
    const { width, height } = this.app.screen;
    // Isometric world dimensions (approximate bounding box)
    const isoWorldW = (MAP_COLS + MAP_ROWS) * (ISO_TILE_W / 2);
    const isoWorldH = (MAP_COLS + MAP_ROWS) * (ISO_TILE_H / 2);
    const cam = updateCamera(this.player, isoWorldW, isoWorldH, width, height);
    this.worldContainer.x = cam.x;
    this.worldContainer.y = cam.y;
    this.tilemap.render(worldMap, cam.x, cam.y, width, height, this.elapsedTime);
    this.propsRenderer.render(cam.x, cam.y, width, height, this.elapsedTime);
  }

  _checkTriggers() {
    const playerTileCol = Math.floor(this.player.gridCol);
    const playerTileRow = Math.floor(this.player.gridRow);

    if (playerTileCol === DUNGEON_TILE_COL && playerTileRow === DUNGEON_TILE_ROW) {
      if (!this._dungeonLogged) {
        console.log('Enter dungeon');
        this._dungeonLogged = true;
      }
    } else {
      this._dungeonLogged = false;
    }

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
