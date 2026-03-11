/**
 * Props system — decorative non-tile overlays rendered on the world.
 * Full 3/4 perspective: every object has top face (lightest), front face (mid),
 * shadow side (darkest), shadow to south-east, depth lines on corners.
 */

import { Graphics } from 'pixi.js';
import {
  WORLD_TILE_SIZE,
  CAMP_FIRE_COLORS,
  CAMP_GLOW_COLOR,
  CAMP_GLOW_RADIUS,
  DUNGEON_STONE_COLOR,
  DUNGEON_GLOW_COLOR,
} from '../utils/constants.js';

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

  // Original bush props
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
  // Overpass pillars over river
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

  // ── Zone 8: Impact Crater — debris around rim ──
  { type: 'debris', col: 122, row: 56 },
  { type: 'debris', col: 138, row: 56 },
  { type: 'debris', col: 120, row: 63 },
  { type: 'debris', col: 140, row: 63 },
  { type: 'debris', col: 125, row: 70 },
  { type: 'debris', col: 135, row: 70 },
  { type: 'barrel', col: 126, row: 57 },
  { type: 'barrel', col: 134, row: 69 },

  // ── Zone 9: Tunnel Entrance ──
  { type: 'concrete_stairs', col: 78, row: 123 },
  { type: 'debris', col: 76, row: 121 },
  { type: 'debris', col: 81, row: 125 },
  { type: 'barrel', col: 82, row: 121 },

  // ── Zone 10: Flooded Ruins — rowboat, dock posts ──
  { type: 'rowboat', col: 124, row: 121 },
  { type: 'dock_post', col: 112, row: 117 },
  { type: 'dock_post', col: 117, row: 119 },
];

/**
 * Create the props renderer.
 * Returns a Graphics object and update function.
 */
export function createPropsRenderer() {
  const gfx = new Graphics();

  function render(camX, camY, vpWidth, vpHeight, time) {
    gfx.clear();

    const viewLeft = -camX - WORLD_TILE_SIZE * 4;
    const viewRight = -camX + vpWidth + WORLD_TILE_SIZE * 4;
    const viewTop = -camY - WORLD_TILE_SIZE * 4;
    const viewBottom = -camY + vpHeight + WORLD_TILE_SIZE * 4;

    for (const prop of PROP_LIST) {
      const px = prop.col * WORLD_TILE_SIZE;
      const py = prop.row * WORLD_TILE_SIZE;

      if (px < viewLeft || px > viewRight || py < viewTop || py > viewBottom) continue;

      switch (prop.type) {
        case 'car': drawCar(gfx, px, py, prop.rotation || 0); break;
        case 'streetlight': drawStreetlight(gfx, px, py); break;
        case 'telephone_pole': drawTelephonePole(gfx, px, py); break;
        case 'debris': drawDebris(gfx, px, py); break;
        case 'barrel': drawBarrel(gfx, px, py); break;
        case 'campfire': drawCampfire(gfx, px, py, time); break;
        case 'dungeon_arch': drawDungeonArch(gfx, px, py, time); break;
        case 'base_building': drawBaseBuilding(gfx, px, py); break;
        case 'bush': drawBushProp(gfx, px, py); break;
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
  }

  return { gfx, render };
}

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

/* ──────────────── Burnt Car — darker ──────────────── */

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

/* ──────────────── Streetlight — 3/4 cylindrical ──────────────── */

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

  gfx.moveTo(bx - 14, by - 85);
  gfx.quadraticCurveTo(bx - 8, by - 60, bx - 2, by - 66);
  gfx.stroke({ width: 1, color: 0x4a4a4a, alpha: 0.5 });
}

/* ──────────────── Telephone Pole — 3/4 cylindrical ──────────────── */

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

/* ──────────────── Bush prop ──────────────── */

function drawBushProp(gfx, x, y) {
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

/* ──────────────── Wires between telephone poles ──────────────── */

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

/* ──────────────── Fence wires between fence posts ──────────────── */

function drawFenceWires(gfx) {
  const posts = PROP_LIST.filter(p => p.type === 'fence_post');
  // Group by row for horizontal wires
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
      // Two wire lines with sag
      gfx.moveTo(x1, y1);
      gfx.quadraticCurveTo(midX, y1 + 8, x2, y2);
      gfx.stroke({ width: 0.8, color: 0x6a6a62, alpha: 0.4 });
      gfx.moveTo(x1, y1 + 10);
      gfx.quadraticCurveTo(midX, y1 + 18, x2, y2 + 10);
      gfx.stroke({ width: 0.8, color: 0x6a6a62, alpha: 0.35 });
    }
  }
}

/* ──────────────── Debris — 3/4 overlapping pieces ──────────────── */

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
  gfx.rect(cx - 2, cy + 6, 5, 2);
  gfx.fill(0x9a6a4a);
  gfx.rect(cx - 2, cy + 8, 5, 3);
  gfx.fill(0x7a4a2a);
}

/* ──────────────── Barrel — 3/4 ──────────────── */

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

/* ──────────────── Campfire — 3/4 ──────────────── */

function drawCampfire(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  const glowAlpha = 0.15 + 0.1 * Math.sin(time * 2.5);
  gfx.ellipse(cx, cy + 2, CAMP_GLOW_RADIUS * 1.1, CAMP_GLOW_RADIUS * 0.7);
  gfx.fill({ color: CAMP_GLOW_COLOR, alpha: glowAlpha });
  gfx.ellipse(cx, cy + 2, CAMP_GLOW_RADIUS * 0.7, CAMP_GLOW_RADIUS * 0.45);
  gfx.fill({ color: 0x885511, alpha: glowAlpha * 0.5 });

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const sx = cx + Math.cos(angle) * 22;
    const sy = cy + Math.sin(angle) * 18;
    gfx.rect(sx - 3, sy - 3, 6, 3);
    gfx.fill(0x6a6058);
    gfx.rect(sx - 3, sy, 6, 3);
    gfx.fill(0x3a3830);
  }

  gfx.rect(cx - 7, cy - 1, 14, 2);
  gfx.fill(0x5a3a1a);
  gfx.rect(cx - 7, cy + 1, 14, 2);
  gfx.fill(0x3a2210);
  gfx.ellipse(cx - 7, cy + 1, 2, 2);
  gfx.fill(0x4a2a10);
  gfx.ellipse(cx + 7, cy + 1, 2, 2);
  gfx.fill(0x3a1a08);
  gfx.rect(cx - 2, cy - 5, 2, 10);
  gfx.fill(0x5a3a1a);
  gfx.rect(cx, cy - 5, 2, 10);
  gfx.fill(0x3a2210);

  const pulseScale = 1 + 0.15 * Math.sin(time * 3.5);
  for (let i = 0; i < CAMP_FIRE_COLORS.length; i++) {
    const h = (12 - i * 1.5) * pulseScale;
    const w = (9 - i * 1.2) * pulseScale;
    const yOff = i * 1.5;
    const xWobble = Math.sin(time * 4 + i * 0.8) * 2;
    gfx.ellipse(cx + xWobble, cy - yOff - h / 2, w, h);
    gfx.fill({ color: CAMP_FIRE_COLORS[i], alpha: 0.8 - i * 0.08 });
  }

  for (let i = 0; i < 5; i++) {
    const emberT = (time * 1.2 + i * 1.3) % 3;
    const ex = cx + Math.sin(time * 2 + i * 2) * 8;
    const ey = cy - 10 - emberT * 12;
    const ea = Math.max(0, 0.7 - emberT * 0.25);
    gfx.circle(ex, ey, 1.5);
    gfx.fill({ color: 0x66ff33, alpha: ea });
  }
}

/* ──────────────── Dungeon Entrance Archway — 3/4 ──────────────── */

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

/* ──────────────── Base Building — condemned 3/4 ──────────────── */

function drawBaseBuilding(gfx, x, y) {
  const bw = WORLD_TILE_SIZE * 3;
  const bh = WORLD_TILE_SIZE * 2;

  gfx.rect(x - 2, y + bh - 4, bw + 4, 6);
  gfx.fill(0x6a5a48);

  gfx.rect(x, y + 12, bw, bh - 12);
  gfx.fill(0x5a4a38);
  gfx.rect(x, y, bw, 12);
  gfx.fill(0x7a6a58);
  gfx.rect(x + bw - 8, y + 12, 8, bh - 12);
  gfx.fill(0x3a2a18);

  for (let row = 0; row < 6; row++) {
    const ly = y + 14 + row * 12;
    if (ly > y + bh - 4) break;
    gfx.moveTo(x + 2, ly);
    gfx.lineTo(x + bw - 10, ly);
    gfx.stroke({ width: 1, color: 0x3a2a1a, alpha: 0.5 });
    const offset = (row % 2 === 0) ? 0 : 8;
    for (let vx = offset + 16; vx < bw - 10; vx += 16) {
      gfx.moveTo(x + vx, ly);
      gfx.lineTo(x + vx, ly + 12);
      gfx.stroke({ width: 0.8, color: 0x3a2a1a, alpha: 0.35 });
    }
  }

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

  gfx.moveTo(x - 6, y - 2);
  gfx.lineTo(x + bw + 6, y - 2);
  gfx.lineTo(x + bw + 4, y - 16);
  gfx.lineTo(x - 4, y - 12);
  gfx.closePath();
  gfx.fill(0x3a2a18);

  gfx.moveTo(x - 6, y - 2);
  gfx.lineTo(x + bw + 6, y - 2);
  gfx.lineTo(x + bw + 6, y);
  gfx.lineTo(x - 6, y);
  gfx.closePath();
  gfx.fill(0x4a3a28);

  gfx.rect(x + bw - 30, y - 16, 34, 14);
  gfx.fill(0x0a0805);
  for (let i = 0; i < 4; i++) {
    const rx = x + bw - 28 + i * 8;
    gfx.moveTo(rx, y - 14);
    gfx.lineTo(rx + 4, y - 2);
    gfx.stroke({ width: 1.5, color: 0x2a1a08 });
  }

  gfx.moveTo(x + 10, y + 20);
  gfx.lineTo(x + 18, y + 44);
  gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.4 });
  gfx.moveTo(x + bw - 20, y + 30);
  gfx.lineTo(x + bw - 16, y + 52);
  gfx.lineTo(x + bw - 22, y + 60);
  gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.35 });
}

/* ──────────────── NEW PROP TYPES ──────────────── */

/* ──────────────── Bridge Post ──────────────── */

function drawBridgePost(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Dark brown vertical post
  gfx.rect(cx - 4, cy - 30, 4, 40);
  gfx.fill(0x4a3218);
  gfx.rect(cx, cy - 30, 4, 40);
  gfx.fill(0x3a2210);

  // Cross brace
  gfx.moveTo(cx - 8, cy - 10);
  gfx.lineTo(cx + 8, cy - 20);
  gfx.stroke({ width: 2, color: 0x4a3218 });

  // Top cap
  gfx.rect(cx - 5, cy - 32, 10, 4);
  gfx.fill(0x5a4228);
}

/* ──────────────── Dock Post ──────────────── */

function drawDockPost(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Weathered pole — top above water
  gfx.rect(cx - 3, cy - 20, 3, 30);
  gfx.fill(0x6a5a3a);
  gfx.rect(cx, cy - 20, 3, 30);
  gfx.fill(0x4a3a1a);

  // Top cap
  gfx.ellipse(cx, cy - 20, 4, 2);
  gfx.fill(0x7a6a4a);

  // Water line suggestion
  gfx.rect(cx - 4, cy + 4, 8, 2);
  gfx.fill({ color: 0x2a5a8a, alpha: 0.5 });
}

/* ──────────────── Cave Entrance ──────────────── */

function drawCaveEntrance(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const top = y;
  const w = 56;
  const h = 48;

  // Dark interior
  gfx.ellipse(cx, top + h / 2 + 6, w / 2 - 4, h / 2 - 4);
  gfx.fill(0x0a0806);

  // Rough rock arch — irregular shape
  // Left rock face
  gfx.moveTo(cx - w / 2, top + h);
  gfx.lineTo(cx - w / 2 - 4, top + h / 3);
  gfx.lineTo(cx - w / 4, top);
  gfx.lineTo(cx - w / 2 + 8, top + h / 2);
  gfx.closePath();
  gfx.fill(0x5a5248);

  // Right rock face
  gfx.moveTo(cx + w / 2, top + h);
  gfx.lineTo(cx + w / 2 + 4, top + h / 3);
  gfx.lineTo(cx + w / 4, top - 2);
  gfx.lineTo(cx + w / 2 - 8, top + h / 2);
  gfx.closePath();
  gfx.fill(0x4a4238);

  // Top arch rock
  gfx.moveTo(cx - w / 4, top);
  gfx.quadraticCurveTo(cx, top - 14, cx + w / 4, top - 2);
  gfx.lineTo(cx + w / 4 - 4, top + 6);
  gfx.quadraticCurveTo(cx, top - 4, cx - w / 4 + 4, top + 6);
  gfx.closePath();
  gfx.fill(0x6a6258);

  // Rocky path leading in
  gfx.rect(cx - 8, top + h, 16, 8);
  gfx.fill(0x7a6a52);
}

/* ──────────────── Watchtower Base ──────────────── */

function drawWatchtower(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const baseY = y + WORLD_TILE_SIZE;

  // Shadow
  gfx.ellipse(cx + 4, baseY + 4, 18, 6);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Tower body — tall rectangle
  gfx.rect(cx - 14, baseY - 96, 14, 96);
  gfx.fill(0x5a4a38);
  gfx.rect(cx, baseY - 96, 14, 96);
  gfx.fill(0x4a3a28);

  // Top face
  gfx.rect(cx - 16, baseY - 98, 32, 4);
  gfx.fill(0x7a6a58);

  // Floor line halfway up
  gfx.moveTo(cx - 14, baseY - 48);
  gfx.lineTo(cx + 14, baseY - 48);
  gfx.stroke({ width: 2, color: 0x3a2a18 });

  // Ladder lines on one side
  for (let i = 0; i < 6; i++) {
    const ly = baseY - 12 - i * 14;
    gfx.moveTo(cx + 4, ly);
    gfx.lineTo(cx + 12, ly);
    gfx.stroke({ width: 1, color: 0x6a5a42, alpha: 0.6 });
  }

  // Vertical ladder rails
  gfx.moveTo(cx + 4, baseY - 4);
  gfx.lineTo(cx + 4, baseY - 86);
  gfx.stroke({ width: 1, color: 0x6a5a42, alpha: 0.5 });
  gfx.moveTo(cx + 12, baseY - 4);
  gfx.lineTo(cx + 12, baseY - 86);
  gfx.stroke({ width: 1, color: 0x6a5a42, alpha: 0.5 });

  // Window openings
  gfx.rect(cx - 10, baseY - 90, 8, 12);
  gfx.fill(0x0a0806);
  gfx.rect(cx - 10, baseY - 44, 8, 10);
  gfx.fill(0x0a0806);
}

/* ──────────────── Bus ──────────────── */

function drawBus(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  const bw = 56, bh = 26;

  // Shadow
  gfx.ellipse(cx + 4, cy + bh + 4, bw + 4, 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Body
  gfx.rect(cx - bw, cy - bh, bw * 2, bh * 2);
  gfx.fill(0x5a5248);

  // Top face
  gfx.rect(cx - bw, cy - bh, bw * 2, 8);
  gfx.fill(0x6a6258);

  // Shadow side
  gfx.rect(cx + bw - 6, cy - bh + 8, 6, bh * 2 - 8);
  gfx.fill(0x4a4238);

  // Bottom darker strip
  gfx.rect(cx - bw, cy + bh - 5, bw * 2, 5);
  gfx.fill(0x3a3228);

  // Windows along side
  for (let i = 0; i < 8; i++) {
    const wx = cx - bw + 8 + i * 13;
    gfx.rect(wx, cy - bh + 12, 10, 14);
    gfx.fill(0x1a2028);
  }

  // Front grille
  gfx.rect(cx - bw, cy - bh + 10, 6, bh * 2 - 15);
  gfx.fill(0x3a3228);

  // Wheels
  const wheelY = [cy - bh + 4, cy + bh - 4];
  const wheelX = [cx - bw + 10, cx + bw - 10];
  for (const wy of wheelY) {
    for (const wx of wheelX) {
      gfx.ellipse(wx, wy, 6, 4);
      gfx.fill(0x1a1a1a);
    }
  }
}

/* ──────────────── Truck ──────────────── */

function drawTruck(gfx, x, y, rotation) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Shadow
  gfx.ellipse(cx + 4, cy + 30, 40, 10);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Cab
  gfx.rect(cx - 18, cy - 28, 36, 24);
  gfx.fill(0x5a5248);
  gfx.rect(cx - 18, cy - 28, 36, 6);
  gfx.fill(0x6a6258);

  // Windshield
  gfx.rect(cx - 12, cy - 22, 24, 10);
  gfx.fill(0x1a2028);

  // Trailer — larger separate rectangle
  gfx.rect(cx - 22, cy, 44, 48);
  gfx.fill(0x5a5a52);
  gfx.rect(cx - 22, cy, 44, 6);
  gfx.fill(0x6a6a62);
  gfx.rect(cx + 22 - 6, cy + 6, 6, 42);
  gfx.fill(0x4a4a42);

  // Wheels
  gfx.ellipse(cx - 14, cy - 4, 5, 3);
  gfx.fill(0x1a1a1a);
  gfx.ellipse(cx + 14, cy - 4, 5, 3);
  gfx.fill(0x1a1a1a);
  gfx.ellipse(cx - 16, cy + 46, 6, 4);
  gfx.fill(0x1a1a1a);
  gfx.ellipse(cx + 16, cy + 46, 6, 4);
  gfx.fill(0x1a1a1a);
}

/* ──────────────── Guardrail ──────────────── */

function drawGuardrail(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Thin horizontal rectangle — silver grey
  gfx.rect(cx - 30, cy - 2, 60, 3);
  gfx.fill(0x8a8a82);
  gfx.rect(cx - 30, cy + 1, 60, 2);
  gfx.fill(0x6a6a62);

  // Support posts
  gfx.rect(cx - 28, cy - 6, 3, 12);
  gfx.fill(0x7a7a72);
  gfx.rect(cx, cy - 6, 3, 12);
  gfx.fill(0x7a7a72);
  gfx.rect(cx + 26, cy - 6, 3, 12);
  gfx.fill(0x7a7a72);

  // Broken section — gap in middle
  gfx.rect(cx - 6, cy - 2, 12, 5);
  gfx.fill(0x4a4844); // match highway color to "erase" rail section
}

/* ──────────────── Overpass Pillar ──────────────── */

function drawOverpassPillar(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Thick rectangle pillar
  gfx.rect(cx - 10, cy - 40, 10, 60);
  gfx.fill(0x6a6a62);
  gfx.rect(cx, cy - 40, 10, 60);
  gfx.fill(0x5a5a52);

  // Top cap
  gfx.rect(cx - 12, cy - 42, 24, 4);
  gfx.fill(0x7a7a72);

  // Crumbling top edge
  gfx.moveTo(cx - 8, cy - 42);
  gfx.lineTo(cx - 4, cy - 46);
  gfx.lineTo(cx + 2, cy - 43);
  gfx.lineTo(cx + 8, cy - 45);
  gfx.stroke({ width: 1.5, color: 0x5a5a52, alpha: 0.6 });

  // Shadow on south face
  gfx.rect(cx - 10, cy + 14, 20, 6);
  gfx.fill({ color: 0x000000, alpha: 0.2 });
}

/* ──────────────── Grain Silo ──────────────── */

function drawGrainSilo(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const baseY = y + WORLD_TILE_SIZE;

  // Shadow
  gfx.ellipse(cx + 5, baseY + 4, 18, 6);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Body — tapered rectangle
  gfx.moveTo(cx - 14, baseY);
  gfx.lineTo(cx - 12, baseY - 72);
  gfx.lineTo(cx + 12, baseY - 72);
  gfx.lineTo(cx + 14, baseY);
  gfx.closePath();
  gfx.fill(0x7a5a3a);

  // Shadow side
  gfx.moveTo(cx + 4, baseY);
  gfx.lineTo(cx + 4, baseY - 72);
  gfx.lineTo(cx + 12, baseY - 72);
  gfx.lineTo(cx + 14, baseY);
  gfx.closePath();
  gfx.fill(0x5a3a1a);

  // Top circle cap
  gfx.ellipse(cx, baseY - 72, 14, 5);
  gfx.fill(0x6a5a3a);

  // Seam line
  gfx.moveTo(cx, baseY);
  gfx.lineTo(cx, baseY - 72);
  gfx.stroke({ width: 0.8, color: 0x4a3a1a, alpha: 0.4 });

  // Hoop bands
  gfx.moveTo(cx - 13, baseY - 20);
  gfx.lineTo(cx + 13, baseY - 20);
  gfx.stroke({ width: 1.2, color: 0x5a4a2a, alpha: 0.5 });
  gfx.moveTo(cx - 13, baseY - 50);
  gfx.lineTo(cx + 13, baseY - 50);
  gfx.stroke({ width: 1.2, color: 0x5a4a2a, alpha: 0.5 });
}

/* ──────────────── Tractor ──────────────── */

function drawTractor(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Shadow
  gfx.ellipse(cx + 3, cy + 16, 24, 6);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  // Body — squat rectangle
  gfx.rect(cx - 16, cy - 10, 32, 20);
  gfx.fill(0x6a4a2a);
  gfx.rect(cx - 16, cy - 10, 32, 5);
  gfx.fill(0x7a5a3a);

  // Large rear wheels (ellipses)
  gfx.ellipse(cx - 14, cy + 8, 10, 12);
  gfx.fill(0x2a2a2a);
  gfx.ellipse(cx - 14, cy + 8, 6, 8);
  gfx.fill(0x3a3a3a);

  gfx.ellipse(cx + 14, cy + 8, 10, 12);
  gfx.fill(0x2a2a2a);
  gfx.ellipse(cx + 14, cy + 8, 6, 8);
  gfx.fill(0x3a3a3a);

  // Small front wheels
  gfx.ellipse(cx - 16, cy - 8, 5, 6);
  gfx.fill(0x2a2a2a);
  gfx.ellipse(cx + 16, cy - 8, 5, 6);
  gfx.fill(0x2a2a2a);

  // Exhaust pipe
  gfx.rect(cx - 4, cy - 20, 3, 12);
  gfx.fill(0x4a4a4a);
  gfx.rect(cx - 1, cy - 20, 3, 12);
  gfx.fill(0x3a3a3a);
}

/* ──────────────── Scarecrow ──────────────── */

function drawScarecrow(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const baseY = y + WORLD_TILE_SIZE;

  // Shadow
  gfx.ellipse(cx + 2, baseY + 2, 10, 3);
  gfx.fill({ color: 0x000000, alpha: 0.15 });

  // Vertical post
  gfx.rect(cx - 2, baseY - 60, 2, 60);
  gfx.fill(0x6a5232);
  gfx.rect(cx, baseY - 60, 2, 60);
  gfx.fill(0x5a4222);

  // Horizontal crossbar (T-shape)
  gfx.rect(cx - 18, baseY - 48, 36, 3);
  gfx.fill(0x6a5232);

  // Cloth strips hanging down (thin diagonal lines)
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

  // Head (small circle)
  gfx.circle(cx, baseY - 54, 5);
  gfx.fill(0x8a7a52);
}

/* ──────────────── Fence Post ──────────────── */

function drawFencePost(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  gfx.rect(cx - 2, cy - 24, 2, 32);
  gfx.fill(0x6a5a3a);
  gfx.rect(cx, cy - 24, 2, 32);
  gfx.fill(0x5a4a2a);

  // Top point
  gfx.moveTo(cx - 2, cy - 24);
  gfx.lineTo(cx, cy - 28);
  gfx.lineTo(cx + 2, cy - 24);
  gfx.closePath();
  gfx.fill(0x6a5a3a);
}

/* ──────────────── Dry Fountain ──────────────── */

function drawDryFountain(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE;
  const cy = y + WORLD_TILE_SIZE;

  // Outer stone ring
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const bx = cx + Math.cos(angle) * 28;
    const by = cy + Math.sin(angle) * 22;
    gfx.rect(bx - 4, by - 3, 8, 3);
    gfx.fill(0x7a7a6a);
    gfx.rect(bx - 4, by, 8, 3);
    gfx.fill(0x5a5a4a);
  }

  // Inner basin
  gfx.ellipse(cx, cy, 22, 16);
  gfx.fill(0x6a6a5a);

  // Cracked dry floor
  gfx.ellipse(cx, cy, 18, 12);
  gfx.fill(0x8a7a52);

  // Crack lines
  gfx.moveTo(cx - 8, cy - 4);
  gfx.lineTo(cx + 6, cy + 4);
  gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.5 });
  gfx.moveTo(cx + 2, cy - 6);
  gfx.lineTo(cx - 4, cy + 6);
  gfx.stroke({ width: 0.8, color: 0x5a4a32, alpha: 0.4 });

  // Alien structure at center — glowing
  const glowAlpha = 0.3 + 0.2 * Math.sin(time * 2);
  gfx.ellipse(cx, cy, 6, 4);
  gfx.fill({ color: 0x00ff88, alpha: glowAlpha });
  gfx.circle(cx, cy - 2, 3);
  gfx.fill(0x1a2a1a);
  gfx.circle(cx, cy - 2, 3);
  gfx.stroke({ width: 1, color: 0x00ff88, alpha: glowAlpha * 0.8 });
}

/* ──────────────── Bench ──────────────── */

function drawBench(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Seat — small rectangle
  gfx.rect(cx - 12, cy - 2, 24, 4);
  gfx.fill(0x6a5232);
  gfx.rect(cx - 12, cy + 2, 24, 2);
  gfx.fill(0x5a4222);

  // 4 legs
  gfx.rect(cx - 10, cy + 4, 2, 6);
  gfx.fill(0x4a3a18);
  gfx.rect(cx + 8, cy + 4, 2, 6);
  gfx.fill(0x4a3a18);
  gfx.rect(cx - 10, cy - 4, 2, 6);
  gfx.fill(0x5a4a28);
  gfx.rect(cx + 8, cy - 4, 2, 6);
  gfx.fill(0x5a4a28);
}

/* ──────────────── Concrete Stairs ──────────────── */

function drawConcreteStairs(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const top = y;
  const w = 40;

  // 5 progressively recessed rectangles going down
  for (let i = 0; i < 5; i++) {
    const stepW = w - i * 4;
    const stepY = top + i * 10;
    const darken = i * 0.12;
    // Top face
    gfx.rect(cx - stepW / 2, stepY, stepW, 4);
    gfx.fill({ color: 0x7a7a6a, alpha: 1 - darken });
    // Front face
    gfx.rect(cx - stepW / 2, stepY + 4, stepW, 6);
    gfx.fill({ color: 0x5a5a4a, alpha: 1 - darken });
  }

  // Darkness at bottom
  gfx.rect(cx - 12, top + 50, 24, 12);
  gfx.fill(0x0a0806);

  // Faint green glow at bottom
  const glowAlpha = 0.15 + 0.1 * Math.sin(time * 1.5);
  gfx.ellipse(cx, top + 54, 14, 5);
  gfx.fill({ color: 0x00ff88, alpha: glowAlpha });

  // Metal handrail on left
  gfx.moveTo(cx - w / 2 - 2, top);
  gfx.lineTo(cx - w / 2 + 6, top + 50);
  gfx.stroke({ width: 1.5, color: 0x6a6a62 });

  // Faded signage rectangle
  gfx.rect(cx + w / 2 + 2, top + 4, 12, 8);
  gfx.fill(0x5a5a4a);
  gfx.rect(cx + w / 2 + 3, top + 5, 10, 6);
  gfx.fill(0x7a7a6a);
}

/* ──────────────── Rowboat ──────────────── */

function drawRowboat(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Hull — flattened ellipse
  gfx.ellipse(cx, cy, 20, 8);
  gfx.fill(0x6a5232);
  // Inner hull (lighter)
  gfx.ellipse(cx, cy, 16, 5);
  gfx.fill(0x8a7252);

  // Plank seat lines
  gfx.moveTo(cx - 8, cy - 3);
  gfx.lineTo(cx - 8, cy + 3);
  gfx.stroke({ width: 1.5, color: 0x5a4222 });
  gfx.moveTo(cx + 6, cy - 3);
  gfx.lineTo(cx + 6, cy + 3);
  gfx.stroke({ width: 1.5, color: 0x5a4222 });

  // Oar suggestion
  gfx.moveTo(cx + 16, cy - 2);
  gfx.lineTo(cx + 28, cy - 8);
  gfx.stroke({ width: 1, color: 0x7a6242, alpha: 0.6 });
}
