/**
 * Props system — decorative non-tile overlays rendered on the world.
 * Uses real pixel art sprites for trees, campfire, buildings, bushes, rocks,
 * and vegetation. Vehicles and utility props remain as Graphics drawings.
 */

import { Container, Graphics, Sprite, AnimatedSprite } from 'pixi.js';
import {
  WORLD_TILE_SIZE,
  CAMP_FIRE_COLORS,
  CAMP_GLOW_COLOR,
  CAMP_GLOW_RADIUS,
  DUNGEON_STONE_COLOR,
  DUNGEON_GLOW_COLOR,
} from '../utils/constants.js';
import { getTex, getBonfireFrames } from './textureCache.js';

// Hand-placed props
export const PROP_LIST = [
  // ── Original props (base camp area) ──
  { type: 'campfire', col: 6, row: 74 },
  { type: 'base_building', col: 3, row: 72 },
  { type: 'car', col: 15, row: 71, rotation: 0.1 },
  { type: 'car', col: 25, row: 73, rotation: -0.15 },
  { type: 'car', col: 33, row: 72, rotation: 0.3 },
  { type: 'car', col: 47, row: 44, rotation: 0.05 },
  { type: 'car', col: 50, row: 46, rotation: -0.2 },
  { type: 'car', col: 46, row: 52, rotation: 1.5 },
  { type: 'streetlight', col: 12, row: 72 },
  { type: 'streetlight', col: 20, row: 73 },
  { type: 'streetlight', col: 30, row: 72 },
  { type: 'streetlight', col: 48, row: 40 },
  { type: 'streetlight', col: 49, row: 50 },
  { type: 'telephone_pole', col: 18, row: 71 },
  { type: 'telephone_pole', col: 28, row: 71 },
  { type: 'telephone_pole', col: 38, row: 71 },
  { type: 'debris', col: 22, row: 72 },
  { type: 'debris', col: 45, row: 43 },
  { type: 'debris', col: 53, row: 50 },
  { type: 'debris', col: 35, row: 73 },
  { type: 'barrel', col: 8, row: 75 },
  { type: 'barrel', col: 43, row: 39 },
  { type: 'barrel', col: 55, row: 53 },
  { type: 'barrel', col: 14, row: 73 },
  { type: 'dungeon_arch', col: 38, row: 9 },

  // Bush props — now use vegetation sprites
  { type: 'bush', col: 5, row: 1 },
  { type: 'bush', col: 10, row: 2 },
  { type: 'bush', col: 16, row: 1 },
  { type: 'bush', col: 22, row: 3 },
  { type: 'bush', col: 28, row: 2 },
  { type: 'bush', col: 34, row: 1 },
  { type: 'bush', col: 40, row: 3 },
  { type: 'bush', col: 48, row: 2 },
  { type: 'bush', col: 54, row: 1 },
  { type: 'bush', col: 60, row: 3 },
  { type: 'bush', col: 66, row: 2 },
  { type: 'bush', col: 72, row: 1 },
  { type: 'bush', col: 4, row: 6 },
  { type: 'bush', col: 8, row: 8 },
  { type: 'bush', col: 12, row: 5 },
  { type: 'bush', col: 18, row: 10 },
  { type: 'bush', col: 6, row: 14 },
  { type: 'bush', col: 14, row: 18 },
  { type: 'bush', col: 22, row: 7 },
  { type: 'bush', col: 26, row: 12 },
  { type: 'bush', col: 50, row: 6 },
  { type: 'bush', col: 56, row: 9 },
  { type: 'bush', col: 62, row: 5 },
  { type: 'bush', col: 68, row: 8 },
  { type: 'bush', col: 52, row: 14 },
  { type: 'bush', col: 58, row: 18 },
  { type: 'bush', col: 64, row: 12 },
  { type: 'bush', col: 70, row: 16 },
  { type: 'bush', col: 75, row: 25 },
  { type: 'bush', col: 74, row: 35 },
  { type: 'bush', col: 75, row: 45 },
  { type: 'bush', col: 74, row: 55 },
  { type: 'bush', col: 75, row: 65 },

  // ── Zone 1: River — bridge posts and dock ──
  { type: 'bridge_post', col: 93, row: 70 },
  { type: 'bridge_post', col: 98, row: 70 },

  // ── Zone 2: Central Lake — dock posts, dead tree island ──
  { type: 'dock_post', col: 114, row: 92 },
  { type: 'dock_post', col: 116, row: 92 },
  { type: 'dock_post', col: 118, row: 92 },

  // ── Zone 3: Mountains — cave entrances ──
  { type: 'cave_entrance', col: 148, row: 39 },
  { type: 'cave_entrance', col: 100, row: 12 },
  { type: 'cave_entrance', col: 148, row: 99 },

  // ── Zone 4: Plateau — watchtower, antenna ──
  { type: 'watchtower', col: 109, row: 26 },
  { type: 'debris', col: 92, row: 23 },
  { type: 'barrel', col: 96, row: 25 },
  { type: 'barrel', col: 104, row: 29 },

  // ── Zone 5: Highway — wrecked vehicles, guardrails ──
  { type: 'car', col: 65, row: 44, rotation: 0.8 },
  { type: 'car', col: 72, row: 51, rotation: -0.3 },
  { type: 'bus', col: 80, row: 59 },
  { type: 'truck', col: 88, row: 67, rotation: 0.7 },
  { type: 'car', col: 95, row: 74, rotation: 1.2 },
  { type: 'car', col: 100, row: 79, rotation: -0.5 },
  { type: 'car', col: 108, row: 87, rotation: 0.2 },
  { type: 'car', col: 115, row: 94, rotation: -0.8 },
  { type: 'guardrail', col: 63, row: 42 },
  { type: 'guardrail', col: 75, row: 54 },
  { type: 'guardrail', col: 90, row: 69 },
  { type: 'guardrail', col: 105, row: 84 },
  { type: 'overpass_pillar', col: 95, row: 75 },
  { type: 'overpass_pillar', col: 97, row: 77 },

  // ── Zone 6: Farmland — barn, silo, tractor, scarecrow, fences ──
  { type: 'grain_silo', col: 33, row: 90 },
  { type: 'tractor', col: 40, row: 93 },
  { type: 'scarecrow', col: 28, row: 92 },
  { type: 'scarecrow', col: 44, row: 104 },
  { type: 'fence_post', col: 22, row: 88 },
  { type: 'fence_post', col: 27, row: 88 },
  { type: 'fence_post', col: 32, row: 88 },
  { type: 'fence_post', col: 37, row: 88 },
  { type: 'fence_post', col: 42, row: 88 },
  { type: 'fence_post', col: 47, row: 88 },
  { type: 'fence_post', col: 22, row: 108 },
  { type: 'fence_post', col: 27, row: 108 },
  { type: 'fence_post', col: 32, row: 108 },
  { type: 'fence_post', col: 37, row: 108 },
  { type: 'fence_post', col: 42, row: 108 },
  { type: 'fence_post', col: 47, row: 108 },

  // ── Zone 7: Dried Town — streetlights, benches, fountain, burnt cars ──
  { type: 'dry_fountain', col: 100, row: 55 },
  { type: 'streetlight', col: 90, row: 48 },
  { type: 'streetlight', col: 94, row: 55 },
  { type: 'streetlight', col: 100, row: 48 },
  { type: 'streetlight', col: 106, row: 55 },
  { type: 'streetlight', col: 110, row: 48 },
  { type: 'streetlight', col: 100, row: 62 },
  { type: 'streetlight', col: 90, row: 62 },
  { type: 'streetlight', col: 110, row: 62 },
  { type: 'burnt_car', col: 92, row: 50 },
  { type: 'burnt_car', col: 104, row: 50 },
  { type: 'burnt_car', col: 95, row: 60 },
  { type: 'bench', col: 113, row: 59 },
  { type: 'bench', col: 113, row: 60 },
  { type: 'bench', col: 114, row: 59 },

  // ── Zone 8: Impact Crater — debris around rim + rocks ──
  { type: 'debris', col: 122, row: 56 },
  { type: 'debris', col: 138, row: 56 },
  { type: 'debris', col: 120, row: 63 },
  { type: 'debris', col: 140, row: 63 },
  { type: 'debris', col: 125, row: 70 },
  { type: 'debris', col: 135, row: 70 },
  { type: 'barrel', col: 126, row: 57 },
  { type: 'barrel', col: 134, row: 69 },
  // Rocks near crater rim
  { type: 'rock', col: 121, row: 58 },
  { type: 'rock', col: 139, row: 58 },
  { type: 'rock', col: 123, row: 68 },
  { type: 'rock', col: 137, row: 68 },

  // ── Zone 9: Tunnel Entrance ──
  { type: 'concrete_stairs', col: 78, row: 123 },
  { type: 'debris', col: 76, row: 121 },
  { type: 'debris', col: 81, row: 125 },
  { type: 'barrel', col: 82, row: 121 },

  // ── Zone 10: Flooded Ruins — rowboat, dock posts ──
  { type: 'rowboat', col: 124, row: 121 },
  { type: 'dock_post', col: 112, row: 117 },
  { type: 'dock_post', col: 117, row: 119 },

  // ── Rocks scattered near canyon edges & mountain bases ──
  { type: 'rock', col: 59, row: 22 },
  { type: 'rock', col: 61, row: 28 },
  { type: 'rock', col: 57, row: 35 },
  { type: 'rock', col: 63, row: 42 },
  { type: 'rock', col: 60, row: 48 },
  // Mountain base rocks
  { type: 'rock', col: 146, row: 35 },
  { type: 'rock', col: 147, row: 42 },
  { type: 'rock', col: 145, row: 50 },
  { type: 'rock', col: 148, row: 58 },
  { type: 'rock', col: 146, row: 95 },
  { type: 'rock', col: 148, row: 102 },

  // ── Vegetation scatter (ground clutter) ──
  { type: 'vegetation', col: 3, row: 4 },
  { type: 'vegetation', col: 11, row: 7 },
  { type: 'vegetation', col: 19, row: 5 },
  { type: 'vegetation', col: 25, row: 9 },
  { type: 'vegetation', col: 31, row: 3 },
  { type: 'vegetation', col: 42, row: 6 },
  { type: 'vegetation', col: 55, row: 4 },
  { type: 'vegetation', col: 63, row: 8 },
  { type: 'vegetation', col: 71, row: 3 },
  { type: 'vegetation', col: 7, row: 70 },
  { type: 'vegetation', col: 16, row: 68 },
  { type: 'vegetation', col: 24, row: 70 },
  { type: 'vegetation', col: 32, row: 69 },
  { type: 'vegetation', col: 42, row: 71 },
  { type: 'vegetation', col: 35, row: 95 },
  { type: 'vegetation', col: 40, row: 100 },
  { type: 'vegetation', col: 30, row: 98 },

  // ── Grass tuft scatter (every 8-12 grass tiles) ──
  { type: 'grass_tuft', col: 8, row: 10 },
  { type: 'grass_tuft', col: 16, row: 15 },
  { type: 'grass_tuft', col: 24, row: 11 },
  { type: 'grass_tuft', col: 32, row: 18 },
  { type: 'grass_tuft', col: 40, row: 12 },
  { type: 'grass_tuft', col: 48, row: 20 },
  { type: 'grass_tuft', col: 56, row: 14 },
  { type: 'grass_tuft', col: 64, row: 22 },
  { type: 'grass_tuft', col: 72, row: 16 },
  { type: 'grass_tuft', col: 10, row: 30 },
  { type: 'grass_tuft', col: 20, row: 35 },
  { type: 'grass_tuft', col: 30, row: 28 },
  { type: 'grass_tuft', col: 38, row: 32 },
  { type: 'grass_tuft', col: 46, row: 38 },
  { type: 'grass_tuft', col: 54, row: 30 },
  { type: 'grass_tuft', col: 62, row: 36 },
  { type: 'grass_tuft', col: 70, row: 32 },
  { type: 'grass_tuft', col: 12, row: 50 },
  { type: 'grass_tuft', col: 22, row: 55 },
  { type: 'grass_tuft', col: 32, row: 48 },
  { type: 'grass_tuft', col: 42, row: 58 },
  { type: 'grass_tuft', col: 52, row: 52 },
  { type: 'grass_tuft', col: 14, row: 65 },
  { type: 'grass_tuft', col: 28, row: 62 },
  { type: 'grass_tuft', col: 36, row: 67 },

  // ── Mushroom clusters — near dungeon, crater, alien structures ──
  { type: 'mushroom', col: 36, row: 8 },
  { type: 'mushroom', col: 40, row: 10 },
  { type: 'mushroom', col: 37, row: 12 },
  { type: 'mushroom', col: 39, row: 7 },
  // Near crater (alien spores)
  { type: 'mushroom', col: 124, row: 58 },
  { type: 'mushroom', col: 136, row: 58 },
  { type: 'mushroom', col: 128, row: 68 },
  { type: 'mushroom', col: 132, row: 68 },
  { type: 'mushroom', col: 126, row: 63 },
  { type: 'mushroom', col: 134, row: 63 },
  // Between forest trees
  { type: 'mushroom', col: 8, row: 5 },
  { type: 'mushroom', col: 14, row: 12 },
  { type: 'mushroom', col: 20, row: 8 },
  { type: 'mushroom', col: 55, row: 10 },
  { type: 'mushroom', col: 65, row: 7 },

  // ── Fallen logs — near forest edges and ruins ──
  { type: 'fallen_log', col: 6, row: 18 },
  { type: 'fallen_log', col: 15, row: 22 },
  { type: 'fallen_log', col: 50, row: 16 },
  { type: 'fallen_log', col: 62, row: 20 },
  { type: 'fallen_log', col: 70, row: 10 },
  // Near ruins
  { type: 'fallen_log', col: 92, row: 52 },
  { type: 'fallen_log', col: 108, row: 48 },

  // ── Cattails/reeds — near river banks ──
  { type: 'cattail', col: 88, row: 72 },
  { type: 'cattail', col: 90, row: 74 },
  { type: 'cattail', col: 92, row: 72 },
  { type: 'cattail', col: 94, row: 74 },
  // Near lake
  { type: 'cattail', col: 112, row: 90 },
  { type: 'cattail', col: 114, row: 92 },
  { type: 'cattail', col: 116, row: 90 },
  { type: 'cattail', col: 118, row: 92 },
  // Near flooded ruins
  { type: 'cattail', col: 110, row: 118 },
  { type: 'cattail', col: 126, row: 120 },

  // ── Nature rock clusters — mountain base ──
  { type: 'nature_rock', col: 144, row: 30 },
  { type: 'nature_rock', col: 146, row: 38 },
  { type: 'nature_rock', col: 145, row: 46 },
  { type: 'nature_rock', col: 147, row: 54 },
  { type: 'nature_rock', col: 144, row: 62 },
  { type: 'nature_rock', col: 146, row: 90 },
  { type: 'nature_rock', col: 148, row: 98 },
  // Canyon edges
  { type: 'nature_rock', col: 58, row: 25 },
  { type: 'nature_rock', col: 60, row: 32 },
  { type: 'nature_rock', col: 62, row: 40 },
  { type: 'nature_rock', col: 56, row: 45 },

  // ── Nature bushes — forest edges ──
  { type: 'nature_bush', col: 3, row: 20 },
  { type: 'nature_bush', col: 10, row: 16 },
  { type: 'nature_bush', col: 18, row: 24 },
  { type: 'nature_bush', col: 52, row: 20 },
  { type: 'nature_bush', col: 60, row: 15 },
  { type: 'nature_bush', col: 68, row: 22 },
  { type: 'nature_bush', col: 74, row: 30 },
  { type: 'nature_bush', col: 73, row: 40 },
  { type: 'nature_bush', col: 75, row: 50 },
  { type: 'nature_bush', col: 74, row: 60 },
];

/**
 * Create the props renderer.
 * Returns a Container (sprites + graphics) and update function.
 */
export function createPropsRenderer() {
  const container = new Container();

  // Graphics layer for non-sprite props (vehicles, poles, etc.)
  const gfx = new Graphics();
  container.addChild(gfx);

  // Sprite layer for sprite-based props
  const spriteLayer = new Container();
  container.addChild(spriteLayer);

  // Sprite pool for prop sprites (bushes, rocks, vegetation, nature decorations)
  const SPRITE_POOL_SIZE = 140;
  const spritePool = [];
  for (let i = 0; i < SPRITE_POOL_SIZE; i++) {
    const s = new Sprite();
    s.visible = false;
    spriteLayer.addChild(s);
    spritePool.push(s);
  }

  // Campfire animated sprite — created once, repositioned each frame
  let campfireSprite = null;
  const bonfireFrames = getBonfireFrames();
  if (bonfireFrames.length > 0 && bonfireFrames[0]) {
    campfireSprite = new AnimatedSprite(bonfireFrames);
    campfireSprite.animationSpeed = 0.15;
    campfireSprite.play();
    campfireSprite.visible = false;
    campfireSprite.anchor.set(0.5, 0.8);
    campfireSprite.scale.set(2.5);
    spriteLayer.addChild(campfireSprite);
  }

  // Building sprites — created once
  let buildingContainer = null;
  buildingContainer = createBuildingSprites();
  if (buildingContainer) {
    buildingContainer.visible = false;
    spriteLayer.addChild(buildingContainer);
  }

  function render(camX, camY, vpWidth, vpHeight, time) {
    gfx.clear();
    let sprIdx = 0;

    const viewLeft = -camX - WORLD_TILE_SIZE * 4;
    const viewRight = -camX + vpWidth + WORLD_TILE_SIZE * 4;
    const viewTop = -camY - WORLD_TILE_SIZE * 4;
    const viewBottom = -camY + vpHeight + WORLD_TILE_SIZE * 4;

    for (const prop of PROP_LIST) {
      const px = prop.col * WORLD_TILE_SIZE;
      const py = prop.row * WORLD_TILE_SIZE;

      if (px < viewLeft || px > viewRight || py < viewTop || py > viewBottom) continue;

      switch (prop.type) {
        case 'campfire':
          drawCampfireSprite(gfx, campfireSprite, px, py, time);
          break;
        case 'base_building':
          drawBuildingSprite(gfx, buildingContainer, px, py);
          break;
        case 'bush':
          sprIdx = drawBushPropSprite(spritePool, sprIdx, gfx, px, py, prop.col, prop.row);
          break;
        case 'rock':
          sprIdx = drawRockSprite(spritePool, sprIdx, px, py, prop.col, prop.row);
          break;
        case 'vegetation':
          sprIdx = drawVegetationSprite(spritePool, sprIdx, px, py, prop.col, prop.row);
          break;
        case 'grass_tuft':
          sprIdx = drawGrassTuftSprite(spritePool, sprIdx, px, py, prop.col, prop.row);
          break;
        case 'mushroom':
          sprIdx = drawMushroomSprite(spritePool, sprIdx, px, py, prop.col, prop.row);
          break;
        case 'fallen_log':
          sprIdx = drawFallenLogSprite(spritePool, sprIdx, px, py, prop.col, prop.row);
          break;
        case 'cattail':
          sprIdx = drawCattailSprite(spritePool, sprIdx, px, py, prop.col, prop.row);
          break;
        case 'nature_rock':
          sprIdx = drawNatureRockSprite(spritePool, sprIdx, px, py, prop.col, prop.row);
          break;
        case 'nature_bush':
          sprIdx = drawNatureBushSprite(spritePool, sprIdx, gfx, px, py, prop.col, prop.row);
          break;
        // Graphics-only props
        case 'car': drawCar(gfx, px, py, prop.rotation || 0); break;
        case 'streetlight': drawStreetlight(gfx, px, py); break;
        case 'telephone_pole': drawTelephonePole(gfx, px, py); break;
        case 'debris': drawDebris(gfx, px, py); break;
        case 'barrel': drawBarrel(gfx, px, py); break;
        case 'dungeon_arch': drawDungeonArch(gfx, px, py, time); break;
        case 'bridge_post': drawBridgePost(gfx, px, py); break;
        case 'dock_post': drawDockPost(gfx, px, py); break;
        case 'cave_entrance': drawCaveEntrance(gfx, px, py); break;
        case 'watchtower': drawWatchtower(gfx, px, py); break;
        case 'bus': drawBus(gfx, px, py); break;
        case 'truck': drawTruck(gfx, px, py, prop.rotation || 0); break;
        case 'guardrail': drawGuardrail(gfx, px, py); break;
        case 'overpass_pillar': drawOverpassPillar(gfx, px, py); break;
        case 'grain_silo': drawGrainSilo(gfx, px, py); break;
        case 'tractor': drawTractor(gfx, px, py); break;
        case 'scarecrow': drawScarecrow(gfx, px, py); break;
        case 'fence_post': drawFencePost(gfx, px, py); break;
        case 'dry_fountain': drawDryFountain(gfx, px, py, time); break;
        case 'burnt_car': drawBurntCar(gfx, px, py); break;
        case 'bench': drawBench(gfx, px, py); break;
        case 'concrete_stairs': drawConcreteStairs(gfx, px, py, time); break;
        case 'rowboat': drawRowboat(gfx, px, py); break;
      }
    }

    drawWires(gfx);
    drawFenceWires(gfx);

    // Hide unused pool sprites
    for (let i = sprIdx; i < SPRITE_POOL_SIZE; i++) spritePool[i].visible = false;
  }

  return { gfx: container, render };
}

/* ══════════════════ SPRITE-BASED PROPS ══════════════════ */

/* ──────────────── Campfire — animated bonfire sprite ──────────────── */

function drawCampfireSprite(gfx, campfireSprite, x, y, time) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Glow circle (graphics)
  const glowAlpha = 0.12 + 0.08 * Math.sin(time * 2.5);
  gfx.ellipse(cx, cy + 2, CAMP_GLOW_RADIUS * 1.1, CAMP_GLOW_RADIUS * 0.7);
  gfx.fill({ color: CAMP_GLOW_COLOR, alpha: glowAlpha });

  // Stone ring (graphics)
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const sx = cx + Math.cos(angle) * 22;
    const sy = cy + Math.sin(angle) * 18;
    gfx.rect(sx - 3, sy - 3, 6, 3);
    gfx.fill(0x6a6058);
    gfx.rect(sx - 3, sy, 6, 3);
    gfx.fill(0x3a3830);
  }

  // Place animated bonfire sprite
  if (campfireSprite) {
    campfireSprite.x = cx;
    campfireSprite.y = cy;
    campfireSprite.visible = true;
  }
}

/* ──────────────── Base Building — real wall/roof sprites ──────────────── */

function createBuildingSprites() {
  const c = new Container();

  // Wall sprite
  const wallTex = getTex('bwall_wallSection');
  if (wallTex) {
    const wall = new Sprite(wallTex);
    wall.scale.set(0.75);
    wall.x = 0;
    wall.y = 16;
    c.addChild(wall);
  }

  // Roof sprite
  const roofTex = getTex('broof_roofBrown');
  if (roofTex) {
    const roof = new Sprite(roofTex);
    roof.scale.set(0.85);
    roof.x = 2;
    roof.y = -20; // offset up for 3/4 perspective
    c.addChild(roof);
  }

  return c;
}

function drawBuildingSprite(gfx, buildingContainer, x, y) {
  const bw = WORLD_TILE_SIZE * 3;
  const bh = WORLD_TILE_SIZE * 2;

  // Foundation (graphics)
  gfx.rect(x - 2, y + bh - 4, bw + 4, 6);
  gfx.fill(0x6a5a48);

  // Place building sprite container
  if (buildingContainer) {
    buildingContainer.x = x;
    buildingContainer.y = y;
    buildingContainer.visible = true;
  }

  // Boarded door overlay (graphics on top)
  const dx = x + bw / 2 - 12, dy = y + 30, dw = 24, dh = bh - 34;
  gfx.rect(dx, dy, dw, dh);
  gfx.fill(0x3a2510);
  gfx.moveTo(dx + 2, dy + 2);
  gfx.lineTo(dx + dw - 2, dy + dh - 2);
  gfx.stroke({ width: 3, color: 0x5a3518 });
  gfx.moveTo(dx + dw - 2, dy + 2);
  gfx.lineTo(dx + 2, dy + dh - 2);
  gfx.stroke({ width: 3, color: 0x5a3518 });
  gfx.rect(dx, dy + dh / 2 - 2, dw, 4);
  gfx.fill(0x5a3518);

  // Broken window overlay (graphics)
  const w1x = x + 16, w1y = y + 26;
  gfx.rect(w1x, w1y, 18, 22);
  gfx.fill(0x0a0806);
  gfx.moveTo(w1x, w1y);
  gfx.lineTo(w1x + 18, w1y);
  gfx.stroke({ width: 1.5, color: 0x9a8a78 });

  const w2x = x + bw - 38;
  gfx.rect(w2x, w1y, 18, 22);
  gfx.fill(0x0a0806);
  gfx.moveTo(w2x, w1y);
  gfx.lineTo(w2x + 18, w1y);
  gfx.stroke({ width: 1.5, color: 0x9a8a78 });

  // Wall cracks
  gfx.moveTo(x + 10, y + 20);
  gfx.lineTo(x + 18, y + 44);
  gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.4 });
  gfx.moveTo(x + bw - 20, y + 30);
  gfx.lineTo(x + bw - 16, y + 52);
  gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.35 });
}

/* ──────────────── Bush prop — vegetation sprite ──────────────── */

function drawBushPropSprite(pool, idx, gfx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 4;
  const bushNames = ['veg_bushGreen1', 'veg_bushGreen2', 'veg_bushGreen3', 'veg_bushYellow'];
  const tex = getTex(bushNames[variant]);

  if (!tex || idx >= pool.length) {
    // Fallback to graphics
    drawBushPropGraphics(gfx, x, y);
    return idx;
  }

  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Shadow
  gfx.ellipse(cx + 3, cy + 14, 20, 6);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = (WORLD_TILE_SIZE * 0.85) / 48;
  sprite.scale.set(scale);
  sprite.x = cx - (48 * scale) / 2;
  sprite.y = cy - (48 * scale) / 2 - 4;
  sprite.visible = true;

  return idx;
}

function drawBushPropGraphics(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.ellipse(cx + 3, cy + 14, 20, 6);
  gfx.fill({ color: 0x000000, alpha: 0.18 });
  gfx.ellipse(cx, cy + 4, 18, 12);
  gfx.fill(0x389018);
  gfx.ellipse(cx - 2, cy - 4, 16, 10);
  gfx.fill(0x489228);
  gfx.ellipse(cx - 3, cy - 8, 10, 6);
  gfx.fill({ color: 0x58a232, alpha: 0.5 });
}

/* ──────────────── Rock prop — rock sprite ──────────────── */

function drawRockSprite(pool, idx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 3;
  const rockNames = ['rock_largeRock1', 'rock_largeRock2', 'rock_largeRock3'];
  const tex = getTex(rockNames[variant]);

  if (!tex || idx >= pool.length) return idx;

  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 1.8; // 32px source × 1.8 ≈ 58px on screen
  sprite.scale.set(scale);
  sprite.x = cx - 32 * scale / 2;
  sprite.y = cy - 32 * scale / 2;
  sprite.visible = true;

  return idx;
}

/* ──────────────── Vegetation scatter — small plant sprites ──────────────── */

function drawVegetationSprite(pool, idx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 3;
  const vegNames = ['veg_smallPlant1', 'veg_smallPlant2', 'veg_smallPlant3'];
  const tex = getTex(vegNames[variant]);

  if (!tex || idx >= pool.length) return idx;

  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 1.2; // 32px source × 1.2 ≈ 38px
  sprite.scale.set(scale);
  sprite.x = cx - 32 * scale / 2;
  sprite.y = cy - 32 * scale / 2;
  sprite.visible = true;

  return idx;
}

/* ──────────────── Grass tuft — nature decoration sprite ──────────────── */

function drawGrassTuftSprite(pool, idx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 3;
  const names = ['nature_grassTuft1', 'nature_grassTuft2', 'nature_grassTuft3'];
  const tex = getTex(names[variant]);
  if (!tex || idx >= pool.length) return idx;

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 2.5; // 16px source × 2.5 = 40px
  sprite.scale.set(scale);
  sprite.x = x + WORLD_TILE_SIZE / 2 - 16 * scale / 2 + (h % 10) - 5;
  sprite.y = y + WORLD_TILE_SIZE / 2 - 16 * scale / 2 + (h % 8) - 4;
  sprite.visible = true;
  return idx;
}

/* ──────────────── Mushroom cluster — nature decoration sprite ──────────────── */

function drawMushroomSprite(pool, idx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 3;
  const names = ['nature_mushroom1', 'nature_mushroom2', 'nature_mushroom3'];
  const tex = getTex(names[variant]);
  if (!tex || idx >= pool.length) return idx;

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 1.5; // 32px source × 1.5 = 48px
  sprite.scale.set(scale);
  sprite.x = x + WORLD_TILE_SIZE / 2 - 32 * scale / 2;
  sprite.y = y + WORLD_TILE_SIZE / 2 - 32 * scale / 2;
  sprite.visible = true;
  return idx;
}

/* ──────────────── Fallen log — nature decoration sprite ──────────────── */

function drawFallenLogSprite(pool, idx, x, y, col, row) {
  const tex = getTex('nature_log1');
  if (!tex || idx >= pool.length) return idx;

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 1.2; // 64×32 source × 1.2 = 77×38px
  sprite.scale.set(scale);
  sprite.x = x + WORLD_TILE_SIZE / 2 - 64 * scale / 2;
  sprite.y = y + WORLD_TILE_SIZE / 2 - 32 * scale / 2 + 4;
  sprite.visible = true;
  return idx;
}

/* ──────────────── Cattail/reed — nature decoration sprite ──────────────── */

function drawCattailSprite(pool, idx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 2;
  const names = ['nature_cattail1', 'nature_cattail2'];
  const tex = getTex(names[variant]);
  if (!tex || idx >= pool.length) return idx;

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 2.5; // 16×32 source × 2.5 = 40×80px
  sprite.scale.set(scale);
  sprite.x = x + WORLD_TILE_SIZE / 2 - 16 * scale / 2 + (h % 6) - 3;
  sprite.y = y + WORLD_TILE_SIZE / 2 - 32 * scale / 2;
  sprite.visible = true;
  return idx;
}

/* ──────────────── Nature rock cluster — decoration sprite ──────────────── */

function drawNatureRockSprite(pool, idx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 3;
  const names = ['nature_rockSmall1', 'nature_rockSmall2', 'nature_rockCluster'];
  const tex = getTex(names[variant]);
  if (!tex || idx >= pool.length) return idx;

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 1.8; // 32px source × 1.8 = 58px
  sprite.scale.set(scale);
  sprite.x = x + WORLD_TILE_SIZE / 2 - 32 * scale / 2;
  sprite.y = y + WORLD_TILE_SIZE / 2 - 32 * scale / 2 + 4;
  sprite.visible = true;
  return idx;
}

/* ──────────────── Nature bush — TopDownFantasy Forest bush ──────────────── */

function drawNatureBushSprite(pool, idx, gfx, x, y, col, row) {
  const h = ((row * 137 + col * 311) & 0xFFFF);
  const variant = h % 2;
  const names = ['nature_bush1', 'nature_bush2'];
  const tex = getTex(names[variant]);
  if (!tex || idx >= pool.length) return idx;

  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Shadow
  gfx.ellipse(cx + 3, cy + 16, 22, 6);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  const sprite = pool[idx++];
  sprite.texture = tex;
  const scale = 1.0; // 48px source → 48px display
  sprite.scale.set(scale);
  sprite.x = cx - 48 * scale / 2;
  sprite.y = cy - 48 * scale / 2 - 4;
  sprite.visible = true;
  return idx;
}

/* ══════════════════ GRAPHICS-ONLY PROPS (unchanged) ══════════════════ */

/* ──────────────── Broken Car — 3/4 ──────────────── */

function drawCar(gfx, x, y, rotation) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const rot = (dx, dy) => [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  const hw = 36, hh = 22;

  gfx.ellipse(cx + 4, cy + hh + 4, hw + 2, 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  const bodyCorners = [rot(-hw, -hh), rot(hw, -hh), rot(hw, hh), rot(-hw, hh)];
  gfx.moveTo(bodyCorners[0][0], bodyCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(bodyCorners[i][0], bodyCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x5a5248);

  const shadowCorners = [rot(hw - 6, -hh), rot(hw, -hh), rot(hw, hh), rot(hw - 6, hh)];
  gfx.moveTo(shadowCorners[0][0], shadowCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(shadowCorners[i][0], shadowCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x4a4438);

  const btmCorners = [rot(-hw, hh - 5), rot(hw, hh - 5), rot(hw, hh), rot(-hw, hh)];
  gfx.moveTo(btmCorners[0][0], btmCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(btmCorners[i][0], btmCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x4a4438);

  const hoodCorners = [rot(-hw, -hh), rot(hw, -hh), rot(hw, -hh + 10), rot(-hw, -hh + 10)];
  gfx.moveTo(hoodCorners[0][0], hoodCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(hoodCorners[i][0], hoodCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x646058);

  const rw = 20, rh = 12;
  const roofCorners = [rot(-rw, -rh), rot(rw, -rh), rot(rw, rh), rot(-rw, rh)];
  gfx.moveTo(roofCorners[0][0], roofCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(roofCorners[i][0], roofCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x6a6460);

  const wsCorners = [rot(-16, -hh + 10), rot(16, -hh + 10), rot(16, -hh + 16), rot(-16, -hh + 16)];
  gfx.moveTo(wsCorners[0][0], wsCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(wsCorners[i][0], wsCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x1a2028);

  const crk1 = rot(-6, -hh + 11);
  const crk2 = rot(8, -hh + 14);
  gfx.moveTo(crk1[0], crk1[1]);
  gfx.lineTo(crk2[0], crk2[1]);
  gfx.stroke({ width: 1, color: 0x5a5a6a, alpha: 0.7 });

  const wheelPositions = [[-hw + 6, -hh + 4], [hw - 6, -hh + 4], [-hw + 6, hh - 4], [hw - 6, hh - 4]];
  for (const [dx, dy] of wheelPositions) {
    const [wx, wy] = rot(dx, dy);
    gfx.ellipse(wx, wy, 5, 3);
    gfx.fill(0x1a1a1a);
  }
}

function drawBurntCar(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  const hw = 34, hh = 20;
  gfx.ellipse(cx + 3, cy + hh + 3, hw, 8);
  gfx.fill({ color: 0x000000, alpha: 0.25 });
  gfx.rect(cx - hw, cy - hh, hw * 2, hh * 2);
  gfx.fill(0x2a2520);
  gfx.rect(cx - hw, cy - hh, hw * 2, 8);
  gfx.fill(0x3a3530);
  gfx.rect(cx - 16, cy - hh + 8, 32, 10);
  gfx.fill(0x1a1a1a);
  const wheelPositions = [[-hw + 6, -hh + 4], [hw - 6, -hh + 4], [-hw + 6, hh - 4], [hw - 6, hh - 4]];
  for (const [dx, dy] of wheelPositions) {
    gfx.ellipse(cx + dx, cy + dy, 5, 3);
    gfx.fill(0x0a0a0a);
  }
}

function drawStreetlight(gfx, x, y) {
  const bx = x + WORLD_TILE_SIZE / 2;
  const by = y + WORLD_TILE_SIZE;
  gfx.ellipse(bx + 4, by + 2, 8, 3);
  gfx.fill({ color: 0x000000, alpha: 0.15 });
  gfx.rect(bx - 3, by - 80, 3, 80);
  gfx.fill(0x8a7a5a);
  gfx.rect(bx, by - 80, 3, 80);
  gfx.fill(0x5a4a32);
  gfx.moveTo(bx - 1, by - 80);
  gfx.lineTo(bx - 14, by - 86);
  gfx.stroke({ width: 3, color: 0x5a4a32 });
  gfx.moveTo(bx - 1, by - 81);
  gfx.lineTo(bx - 14, by - 87);
  gfx.stroke({ width: 2, color: 0x8a7a5a });
  gfx.rect(bx - 18, by - 89, 10, 4);
  gfx.fill(0x6a6050);
  gfx.rect(bx - 18, by - 85, 10, 3);
  gfx.fill(0x4a4030);
}

function drawTelephonePole(gfx, x, y) {
  const bx = x + WORLD_TILE_SIZE / 2;
  const by = y + WORLD_TILE_SIZE;
  gfx.ellipse(bx + 4, by + 2, 8, 3);
  gfx.fill({ color: 0x000000, alpha: 0.15 });
  gfx.rect(bx - 4, by - 96, 4, 96);
  gfx.fill(0x8a7248);
  gfx.rect(bx, by - 96, 4, 96);
  gfx.fill(0x6a5232);
  gfx.rect(bx - 20, by - 92, 40, 3);
  gfx.fill(0x8a7248);
  gfx.rect(bx - 20, by - 89, 40, 4);
  gfx.fill(0x6a5232);
  gfx.rect(bx - 20, by - 85, 40, 3);
  gfx.fill(0x4a3a20);
}

function drawWires(gfx) {
  const poles = PROP_LIST.filter(p => p.type === 'telephone_pole');
  for (let i = 0; i < poles.length - 1; i++) {
    const p1 = poles[i];
    const p2 = poles[i + 1];
    const x1 = p1.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 + 20;
    const y1 = p1.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE - 90;
    const x2 = p2.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 - 20;
    const y2 = p2.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE - 90;
    const midX = (x1 + x2) / 2;
    const midY = Math.max(y1, y2) + 22;
    gfx.moveTo(x1, y1);
    gfx.quadraticCurveTo(midX, midY, x2, y2);
    gfx.stroke({ width: 1, color: 0x5a5a5a, alpha: 0.4 });
    gfx.moveTo(x1, y1 + 1.5);
    gfx.quadraticCurveTo(midX, midY + 1.5, x2, y2 + 1.5);
    gfx.stroke({ width: 1, color: 0x2a2a2a, alpha: 0.35 });
  }
}

function drawFenceWires(gfx) {
  const posts = PROP_LIST.filter(p => p.type === 'fence_post');
  const byRow = {};
  for (const p of posts) {
    const key = p.row;
    if (!byRow[key]) byRow[key] = [];
    byRow[key].push(p);
  }
  for (const row of Object.keys(byRow)) {
    const rowPosts = byRow[row].sort((a, b) => a.col - b.col);
    for (let i = 0; i < rowPosts.length - 1; i++) {
      const p1 = rowPosts[i];
      const p2 = rowPosts[i + 1];
      const x1 = p1.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2;
      const y1 = p1.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 - 20;
      const x2 = p2.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2;
      const y2 = p2.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 - 20;
      const midX = (x1 + x2) / 2;
      gfx.moveTo(x1, y1);
      gfx.quadraticCurveTo(midX, y1 + 8, x2, y2);
      gfx.stroke({ width: 0.8, color: 0x6a6a62, alpha: 0.4 });
      gfx.moveTo(x1, y1 + 10);
      gfx.quadraticCurveTo(midX, y1 + 18, x2, y2 + 10);
      gfx.stroke({ width: 0.8, color: 0x6a6a62, alpha: 0.35 });
    }
  }
}

function drawDebris(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.ellipse(cx + 2, cy + 8, 14, 4);
  gfx.fill({ color: 0x000000, alpha: 0.15 });
  gfx.rect(cx - 6, cy - 8, 8, 4);
  gfx.fill(0x7a6a58);
  gfx.rect(cx - 6, cy - 4, 8, 5);
  gfx.fill(0x6a5a48);
  gfx.rect(cx + 4, cy - 6, 6, 3);
  gfx.fill(0x9a6a4a);
  gfx.rect(cx + 4, cy - 3, 6, 5);
  gfx.fill(0x8a5a3a);
  gfx.rect(cx - 8, cy + 1, 10, 3);
  gfx.fill(0x7a6a58);
  gfx.rect(cx - 8, cy + 4, 10, 6);
  gfx.fill(0x6a5a48);
  gfx.rect(cx + 3, cy + 2, 7, 3);
  gfx.fill(0x8a7a68);
  gfx.rect(cx + 3, cy + 5, 7, 4);
  gfx.fill(0x6a6058);
}

function drawBarrel(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  const hw = 10, hh = 13;
  gfx.ellipse(cx + 3, cy + hh + 3, hw + 2, 4);
  gfx.fill({ color: 0x000000, alpha: 0.18 });
  gfx.rect(cx - hw, cy - hh + 4, hw * 2, hh * 2 - 4);
  gfx.fill(0x9a6232);
  gfx.rect(cx - hw, cy + hh - 4, hw * 2, 4);
  gfx.fill(0x6a4218);
  gfx.moveTo(cx - hw, cy - 2);
  gfx.lineTo(cx + hw, cy - 2);
  gfx.stroke({ width: 1.5, color: 0x7a4a28, alpha: 0.7 });
  gfx.moveTo(cx - hw, cy + 6);
  gfx.lineTo(cx + hw, cy + 6);
  gfx.stroke({ width: 1.5, color: 0x7a4a28, alpha: 0.6 });
  gfx.ellipse(cx, cy - hh + 4, hw, 4);
  gfx.fill(0x8a5228);
  gfx.ellipse(cx, cy - hh + 4, 6, 3);
  gfx.fill({ color: 0x7a4218, alpha: 0.5 });
}

function drawDungeonArch(gfx, x, y, time) {
  const archWidth = 80;
  const archHeight = 90;
  const cx = x + archWidth / 2;
  const top = y;

  const stepWidth = archWidth - 24;
  for (let i = 0; i < 3; i++) {
    const stepY = top + archHeight - 6 + i * 8;
    const darken = i * 0.15;
    gfx.rect(x + 12 + i * 4, stepY, stepWidth - i * 8, 3);
    gfx.fill({ color: 0x4a4038, alpha: 1 - darken });
    gfx.rect(x + 12 + i * 4, stepY + 3, stepWidth - i * 8, 5);
    gfx.fill({ color: 0x2a2018, alpha: 1 - darken });
  }

  gfx.rect(x + 10, top + 12, archWidth - 20, archHeight - 12);
  gfx.fill(0x050302);

  const pillarW = 14;
  gfx.rect(x - 4, top, pillarW, archHeight);
  gfx.fill(DUNGEON_STONE_COLOR);
  gfx.rect(x - 4, top - 4, pillarW, 4);
  gfx.fill(0x3a3530);
  gfx.rect(x - 4 + pillarW - 3, top, 3, archHeight);
  gfx.fill(0x1a1510);

  for (let i = 0; i < 6; i++) {
    const ly = top + 6 + i * 18;
    const blockOffset = (i % 2 === 0) ? 0 : 4;
    gfx.moveTo(x - 4, ly);
    gfx.lineTo(x - 4 + pillarW, ly);
    gfx.stroke({ width: 0.8, color: 0x1a1510, alpha: 0.5 });
    gfx.moveTo(x - 4 + blockOffset + 6, ly);
    gfx.lineTo(x - 4 + blockOffset + 6, ly + 18);
    gfx.stroke({ width: 0.6, color: 0x1a1510, alpha: 0.3 });
  }

  const rpx = x + archWidth - 10;
  gfx.rect(rpx, top, pillarW, archHeight);
  gfx.fill(DUNGEON_STONE_COLOR);
  gfx.rect(rpx, top - 4, pillarW, 4);
  gfx.fill(0x3a3530);
  gfx.rect(rpx + pillarW - 3, top, 3, archHeight);
  gfx.fill(0x1a1510);

  for (let i = 0; i < 6; i++) {
    const ly = top + 6 + i * 18;
    const blockOffset = (i % 2 === 0) ? 0 : 4;
    gfx.moveTo(rpx, ly);
    gfx.lineTo(rpx + pillarW, ly);
    gfx.stroke({ width: 0.8, color: 0x1a1510, alpha: 0.5 });
    gfx.moveTo(rpx + blockOffset + 6, ly);
    gfx.lineTo(rpx + blockOffset + 6, ly + 18);
    gfx.stroke({ width: 0.6, color: 0x1a1510, alpha: 0.3 });
  }

  gfx.moveTo(x - 4, top - 4);
  gfx.quadraticCurveTo(cx, top - 30, x + archWidth + 4, top - 4);
  gfx.lineTo(x + archWidth + 4, top);
  gfx.quadraticCurveTo(cx, top - 22, x - 4, top);
  gfx.closePath();
  gfx.fill(0x3a3530);

  gfx.moveTo(x - 4, top);
  gfx.quadraticCurveTo(cx, top - 22, x + archWidth + 4, top);
  gfx.lineTo(x + archWidth + 4, top + 8);
  gfx.quadraticCurveTo(cx, top - 14, x - 4, top + 8);
  gfx.closePath();
  gfx.fill(DUNGEON_STONE_COLOR);

  for (let i = 0; i < 5; i++) {
    const t = (i + 1) / 6;
    const ax = x - 4 + (archWidth + 8) * t;
    const ay = top - 22 + 22 * (1 - Math.sin(t * Math.PI)) * 0.4;
    gfx.moveTo(ax, ay - 4);
    gfx.lineTo(ax, ay + 8);
    gfx.stroke({ width: 0.6, color: 0x1a1510, alpha: 0.4 });
  }

  const glowAlpha = 0.3 + 0.25 * Math.sin(time * 2.5);
  gfx.ellipse(cx, top + archHeight + 4, archWidth * 0.35, 8);
  gfx.fill({ color: DUNGEON_GLOW_COLOR, alpha: glowAlpha });
  gfx.ellipse(cx, top + archHeight * 0.6, archWidth * 0.25, archHeight * 0.2);
  gfx.fill({ color: DUNGEON_GLOW_COLOR, alpha: glowAlpha * 0.12 });
}

function drawBridgePost(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.rect(cx - 4, cy - 30, 4, 40);
  gfx.fill(0x4a3218);
  gfx.rect(cx, cy - 30, 4, 40);
  gfx.fill(0x3a2210);
  gfx.moveTo(cx - 8, cy - 10);
  gfx.lineTo(cx + 8, cy - 20);
  gfx.stroke({ width: 2, color: 0x4a3218 });
  gfx.rect(cx - 5, cy - 32, 10, 4);
  gfx.fill(0x5a4228);
}

function drawDockPost(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.rect(cx - 3, cy - 20, 3, 30);
  gfx.fill(0x6a5a3a);
  gfx.rect(cx, cy - 20, 3, 30);
  gfx.fill(0x4a3a1a);
  gfx.ellipse(cx, cy - 20, 4, 2);
  gfx.fill(0x7a6a4a);
  gfx.rect(cx - 4, cy + 4, 8, 2);
  gfx.fill({ color: 0x2a5a8a, alpha: 0.5 });
}

function drawCaveEntrance(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const top = y;
  const w = 56;
  const h = 48;
  gfx.ellipse(cx, top + h / 2 + 6, w / 2 - 4, h / 2 - 4);
  gfx.fill(0x0a0806);
  gfx.moveTo(cx - w / 2, top + h);
  gfx.lineTo(cx - w / 2 - 4, top + h / 3);
  gfx.lineTo(cx - w / 4, top);
  gfx.lineTo(cx - w / 2 + 8, top + h / 2);
  gfx.closePath();
  gfx.fill(0x5a5248);
  gfx.moveTo(cx + w / 2, top + h);
  gfx.lineTo(cx + w / 2 + 4, top + h / 3);
  gfx.lineTo(cx + w / 4, top - 2);
  gfx.lineTo(cx + w / 2 - 8, top + h / 2);
  gfx.closePath();
  gfx.fill(0x4a4238);
  gfx.moveTo(cx - w / 4, top);
  gfx.quadraticCurveTo(cx, top - 14, cx + w / 4, top - 2);
  gfx.lineTo(cx + w / 4 - 4, top + 6);
  gfx.quadraticCurveTo(cx, top - 4, cx - w / 4 + 4, top + 6);
  gfx.closePath();
  gfx.fill(0x6a6258);
  gfx.rect(cx - 8, top + h, 16, 8);
  gfx.fill(0x7a6a52);
}

function drawWatchtower(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const baseY = y + WORLD_TILE_SIZE;
  gfx.ellipse(cx + 4, baseY + 4, 18, 6);
  gfx.fill({ color: 0x000000, alpha: 0.2 });
  gfx.rect(cx - 14, baseY - 96, 14, 96);
  gfx.fill(0x5a4a38);
  gfx.rect(cx, baseY - 96, 14, 96);
  gfx.fill(0x4a3a28);
  gfx.rect(cx - 16, baseY - 98, 32, 4);
  gfx.fill(0x7a6a58);
  gfx.moveTo(cx - 14, baseY - 48);
  gfx.lineTo(cx + 14, baseY - 48);
  gfx.stroke({ width: 2, color: 0x3a2a18 });
  for (let i = 0; i < 6; i++) {
    const ly = baseY - 12 - i * 14;
    gfx.moveTo(cx + 4, ly);
    gfx.lineTo(cx + 12, ly);
    gfx.stroke({ width: 1, color: 0x6a5a42, alpha: 0.6 });
  }
  gfx.moveTo(cx + 4, baseY - 4);
  gfx.lineTo(cx + 4, baseY - 86);
  gfx.stroke({ width: 1, color: 0x6a5a42, alpha: 0.5 });
  gfx.moveTo(cx + 12, baseY - 4);
  gfx.lineTo(cx + 12, baseY - 86);
  gfx.stroke({ width: 1, color: 0x6a5a42, alpha: 0.5 });
  gfx.rect(cx - 10, baseY - 90, 8, 12);
  gfx.fill(0x0a0806);
  gfx.rect(cx - 10, baseY - 44, 8, 10);
  gfx.fill(0x0a0806);
}

function drawBus(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  const bw = 56, bh = 26;
  gfx.ellipse(cx + 4, cy + bh + 4, bw + 4, 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });
  gfx.rect(cx - bw, cy - bh, bw * 2, bh * 2);
  gfx.fill(0x5a5248);
  gfx.rect(cx - bw, cy - bh, bw * 2, 8);
  gfx.fill(0x6a6258);
  gfx.rect(cx + bw - 6, cy - bh + 8, 6, bh * 2 - 8);
  gfx.fill(0x4a4238);
  gfx.rect(cx - bw, cy + bh - 5, bw * 2, 5);
  gfx.fill(0x3a3228);
  for (let i = 0; i < 8; i++) {
    const wx = cx - bw + 8 + i * 13;
    gfx.rect(wx, cy - bh + 12, 10, 14);
    gfx.fill(0x1a2028);
  }
  gfx.rect(cx - bw, cy - bh + 10, 6, bh * 2 - 15);
  gfx.fill(0x3a3228);
  const wheelY = [cy - bh + 4, cy + bh - 4];
  const wheelX = [cx - bw + 10, cx + bw - 10];
  for (const wy of wheelY) {
    for (const wx of wheelX) {
      gfx.ellipse(wx, wy, 6, 4);
      gfx.fill(0x1a1a1a);
    }
  }
}

function drawTruck(gfx, x, y, rotation) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.ellipse(cx + 4, cy + 30, 40, 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });
  gfx.rect(cx - 18, cy - 28, 36, 24);
  gfx.fill(0x5a5248);
  gfx.rect(cx - 18, cy - 28, 36, 6);
  gfx.fill(0x6a6258);
  gfx.rect(cx - 12, cy - 22, 24, 10);
  gfx.fill(0x1a2028);
  gfx.rect(cx - 22, cy, 44, 48);
  gfx.fill(0x5a5a52);
  gfx.rect(cx - 22, cy, 44, 6);
  gfx.fill(0x6a6a62);
  gfx.rect(cx + 22 - 6, cy + 6, 6, 42);
  gfx.fill(0x4a4a42);
  gfx.ellipse(cx - 14, cy - 4, 5, 3);
  gfx.fill(0x1a1a1a);
  gfx.ellipse(cx + 14, cy - 4, 5, 3);
  gfx.fill(0x1a1a1a);
  gfx.ellipse(cx - 16, cy + 46, 6, 4);
  gfx.fill(0x1a1a1a);
  gfx.ellipse(cx + 16, cy + 46, 6, 4);
  gfx.fill(0x1a1a1a);
}

function drawGuardrail(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.rect(cx - 30, cy - 2, 60, 3);
  gfx.fill(0x8a8a82);
  gfx.rect(cx - 30, cy + 1, 60, 2);
  gfx.fill(0x6a6a62);
  gfx.rect(cx - 28, cy - 6, 3, 12);
  gfx.fill(0x7a7a72);
  gfx.rect(cx, cy - 6, 3, 12);
  gfx.fill(0x7a7a72);
  gfx.rect(cx + 26, cy - 6, 3, 12);
  gfx.fill(0x7a7a72);
  gfx.rect(cx - 6, cy - 2, 12, 5);
  gfx.fill(0x4a4844);
}

function drawOverpassPillar(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.rect(cx - 10, cy - 40, 10, 60);
  gfx.fill(0x6a6a62);
  gfx.rect(cx, cy - 40, 10, 60);
  gfx.fill(0x5a5a52);
  gfx.rect(cx - 12, cy - 42, 24, 4);
  gfx.fill(0x7a7a72);
  gfx.moveTo(cx - 8, cy - 42);
  gfx.lineTo(cx - 4, cy - 46);
  gfx.lineTo(cx + 2, cy - 43);
  gfx.lineTo(cx + 8, cy - 45);
  gfx.stroke({ width: 1.5, color: 0x5a5a52, alpha: 0.6 });
  gfx.rect(cx - 10, cy + 14, 20, 6);
  gfx.fill({ color: 0x000000, alpha: 0.2 });
}

function drawGrainSilo(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const baseY = y + WORLD_TILE_SIZE;
  gfx.ellipse(cx + 5, baseY + 4, 18, 6);
  gfx.fill({ color: 0x000000, alpha: 0.2 });
  gfx.moveTo(cx - 14, baseY);
  gfx.lineTo(cx - 12, baseY - 72);
  gfx.lineTo(cx + 12, baseY - 72);
  gfx.lineTo(cx + 14, baseY);
  gfx.closePath();
  gfx.fill(0x7a5a3a);
  gfx.moveTo(cx + 4, baseY);
  gfx.lineTo(cx + 4, baseY - 72);
  gfx.lineTo(cx + 12, baseY - 72);
  gfx.lineTo(cx + 14, baseY);
  gfx.closePath();
  gfx.fill(0x5a3a1a);
  gfx.ellipse(cx, baseY - 72, 14, 5);
  gfx.fill(0x6a5a3a);
  gfx.moveTo(cx, baseY);
  gfx.lineTo(cx, baseY - 72);
  gfx.stroke({ width: 0.8, color: 0x4a3a1a, alpha: 0.4 });
  gfx.moveTo(cx - 13, baseY - 20);
  gfx.lineTo(cx + 13, baseY - 20);
  gfx.stroke({ width: 1.2, color: 0x5a4a2a, alpha: 0.5 });
  gfx.moveTo(cx - 13, baseY - 50);
  gfx.lineTo(cx + 13, baseY - 50);
  gfx.stroke({ width: 1.2, color: 0x5a4a2a, alpha: 0.5 });
}

function drawTractor(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.ellipse(cx + 3, cy + 16, 24, 6);
  gfx.fill({ color: 0x000000, alpha: 0.18 });
  gfx.rect(cx - 16, cy - 10, 32, 20);
  gfx.fill(0x6a4a2a);
  gfx.rect(cx - 16, cy - 10, 32, 5);
  gfx.fill(0x7a5a3a);
  gfx.ellipse(cx - 14, cy + 8, 10, 12);
  gfx.fill(0x2a2a2a);
  gfx.ellipse(cx - 14, cy + 8, 6, 8);
  gfx.fill(0x3a3a3a);
  gfx.ellipse(cx + 14, cy + 8, 10, 12);
  gfx.fill(0x2a2a2a);
  gfx.ellipse(cx + 14, cy + 8, 6, 8);
  gfx.fill(0x3a3a3a);
  gfx.ellipse(cx - 16, cy - 8, 5, 6);
  gfx.fill(0x2a2a2a);
  gfx.ellipse(cx + 16, cy - 8, 5, 6);
  gfx.fill(0x2a2a2a);
  gfx.rect(cx - 4, cy - 20, 3, 12);
  gfx.fill(0x4a4a4a);
  gfx.rect(cx - 1, cy - 20, 3, 12);
  gfx.fill(0x3a3a3a);
}

function drawScarecrow(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const baseY = y + WORLD_TILE_SIZE;
  gfx.ellipse(cx + 2, baseY + 2, 10, 3);
  gfx.fill({ color: 0x000000, alpha: 0.15 });
  gfx.rect(cx - 2, baseY - 60, 2, 60);
  gfx.fill(0x6a5232);
  gfx.rect(cx, baseY - 60, 2, 60);
  gfx.fill(0x5a4222);
  gfx.rect(cx - 18, baseY - 48, 36, 3);
  gfx.fill(0x6a5232);
  gfx.moveTo(cx - 16, baseY - 45);
  gfx.lineTo(cx - 20, baseY - 30);
  gfx.stroke({ width: 1.5, color: 0x8a7a5a, alpha: 0.6 });
  gfx.moveTo(cx + 16, baseY - 45);
  gfx.lineTo(cx + 20, baseY - 30);
  gfx.stroke({ width: 1.5, color: 0x8a7a5a, alpha: 0.6 });
  gfx.moveTo(cx - 12, baseY - 45);
  gfx.lineTo(cx - 14, baseY - 28);
  gfx.stroke({ width: 1, color: 0x7a6a4a, alpha: 0.5 });
  gfx.moveTo(cx + 12, baseY - 45);
  gfx.lineTo(cx + 14, baseY - 28);
  gfx.stroke({ width: 1, color: 0x7a6a4a, alpha: 0.5 });
  gfx.circle(cx, baseY - 54, 5);
  gfx.fill(0x8a7a52);
}

function drawFencePost(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.rect(cx - 2, cy - 24, 2, 32);
  gfx.fill(0x6a5a3a);
  gfx.rect(cx, cy - 24, 2, 32);
  gfx.fill(0x5a4a2a);
  gfx.moveTo(cx - 2, cy - 24);
  gfx.lineTo(cx, cy - 28);
  gfx.lineTo(cx + 2, cy - 24);
  gfx.closePath();
  gfx.fill(0x6a5a3a);
}

function drawDryFountain(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE;
  const cy = y + WORLD_TILE_SIZE;
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const bx = cx + Math.cos(angle) * 28;
    const by = cy + Math.sin(angle) * 22;
    gfx.rect(bx - 4, by - 3, 8, 3);
    gfx.fill(0x7a7a6a);
    gfx.rect(bx - 4, by, 8, 3);
    gfx.fill(0x5a5a4a);
  }
  gfx.ellipse(cx, cy, 22, 16);
  gfx.fill(0x6a6a5a);
  gfx.ellipse(cx, cy, 18, 12);
  gfx.fill(0x8a7a52);
  gfx.moveTo(cx - 8, cy - 4);
  gfx.lineTo(cx + 6, cy + 4);
  gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.5 });
  gfx.moveTo(cx + 2, cy - 6);
  gfx.lineTo(cx - 4, cy + 6);
  gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.4 });
  const glowAlpha = 0.3 + 0.2 * Math.sin(time * 2);
  gfx.ellipse(cx, cy, 6, 4);
  gfx.fill({ color: 0x00ff88, alpha: glowAlpha });
  gfx.circle(cx, cy - 2, 3);
  gfx.fill(0x1a2a1a);
  gfx.circle(cx, cy - 2, 3);
  gfx.stroke({ width: 1, color: 0x00ff88, alpha: glowAlpha * 0.8 });
}

function drawBench(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.rect(cx - 12, cy - 2, 24, 4);
  gfx.fill(0x6a5232);
  gfx.rect(cx - 12, cy + 2, 24, 2);
  gfx.fill(0x5a4222);
  gfx.rect(cx - 10, cy + 4, 2, 6);
  gfx.fill(0x4a3a18);
  gfx.rect(cx + 8, cy + 4, 2, 6);
  gfx.fill(0x4a3a18);
  gfx.rect(cx - 10, cy - 4, 2, 6);
  gfx.fill(0x5a4a28);
  gfx.rect(cx + 8, cy - 4, 2, 6);
  gfx.fill(0x5a4a28);
}

function drawConcreteStairs(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const top = y;
  const w = 40;
  for (let i = 0; i < 5; i++) {
    const stepW = w - i * 4;
    const stepY = top + i * 10;
    const darken = i * 0.12;
    gfx.rect(cx - stepW / 2, stepY, stepW, 4);
    gfx.fill({ color: 0x7a7a6a, alpha: 1 - darken });
    gfx.rect(cx - stepW / 2, stepY + 4, stepW, 6);
    gfx.fill({ color: 0x5a5a4a, alpha: 1 - darken });
  }
  gfx.rect(cx - 12, top + 50, 24, 12);
  gfx.fill(0x0a0806);
  const glowAlpha = 0.15 + 0.1 * Math.sin(time * 1.5);
  gfx.ellipse(cx, top + 54, 14, 5);
  gfx.fill({ color: 0x00ff88, alpha: glowAlpha });
  gfx.moveTo(cx - w / 2 - 2, top);
  gfx.lineTo(cx - w / 2 + 6, top + 50);
  gfx.stroke({ width: 1.5, color: 0x6a6a62 });
  gfx.rect(cx + w / 2 + 2, top + 4, 12, 8);
  gfx.fill(0x5a5a4a);
  gfx.rect(cx + w / 2 + 3, top + 5, 10, 6);
  gfx.fill(0x7a7a6a);
}

function drawRowboat(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  gfx.ellipse(cx, cy, 20, 8);
  gfx.fill(0x6a5232);
  gfx.ellipse(cx, cy, 16, 5);
  gfx.fill(0x8a7252);
  gfx.moveTo(cx - 8, cy - 3);
  gfx.lineTo(cx - 8, cy + 3);
  gfx.stroke({ width: 1.5, color: 0x5a4222 });
  gfx.moveTo(cx + 6, cy - 3);
  gfx.lineTo(cx + 6, cy + 3);
  gfx.stroke({ width: 1.5, color: 0x5a4222 });
  gfx.moveTo(cx + 16, cy - 2);
  gfx.lineTo(cx + 28, cy - 8);
  gfx.stroke({ width: 1, color: 0x7a6242, alpha: 0.6 });
}
