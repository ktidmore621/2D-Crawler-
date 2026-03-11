/**
 * Props system — decorative non-tile overlays rendered on the world.
 * Broken cars, streetlights, telephone poles, debris, barrels, and campfire.
 */

import { Graphics } from 'pixi.js';
import {
  WORLD_TILE_SIZE,
  PROP_CAR_COLOR,
  PROP_BARREL_COLOR,
  PROP_POLE_COLOR,
  PROP_DEBRIS_COLOR,
  CAMP_FIRE_COLORS,
  CAMP_GLOW_COLOR,
  CAMP_GLOW_RADIUS,
  DUNGEON_STONE_COLOR,
  DUNGEON_GLOW_COLOR,
} from '../utils/constants.js';

/**
 * Prop definition: { type, col, row, rotation? }
 * Types: 'car', 'streetlight', 'telephone_pole', 'debris', 'barrel',
 *        'campfire', 'dungeon_arch'
 */

// Hand-placed props
export const PROP_LIST = [
  // Base camp — campfire
  { type: 'campfire', col: 6, row: 74 },

  // Broken cars along the dirt path
  { type: 'car', col: 15, row: 71, rotation: 0.1 },
  { type: 'car', col: 25, row: 73, rotation: -0.15 },
  { type: 'car', col: 33, row: 72, rotation: 0.3 },

  // Cars in the ruined town
  { type: 'car', col: 47, row: 44, rotation: 0.05 },
  { type: 'car', col: 50, row: 46, rotation: -0.2 },
  { type: 'car', col: 46, row: 52, rotation: 1.5 },

  // Streetlights along paths
  { type: 'streetlight', col: 12, row: 72 },
  { type: 'streetlight', col: 20, row: 73 },
  { type: 'streetlight', col: 30, row: 72 },
  { type: 'streetlight', col: 48, row: 40 },
  { type: 'streetlight', col: 49, row: 50 },

  // Telephone poles with wires
  { type: 'telephone_pole', col: 18, row: 71 },
  { type: 'telephone_pole', col: 28, row: 71 },
  { type: 'telephone_pole', col: 38, row: 71 },

  // Debris piles
  { type: 'debris', col: 22, row: 72 },
  { type: 'debris', col: 45, row: 43 },
  { type: 'debris', col: 53, row: 50 },
  { type: 'debris', col: 35, row: 73 },

  // Rusted barrels
  { type: 'barrel', col: 8, row: 75 },
  { type: 'barrel', col: 43, row: 39 },
  { type: 'barrel', col: 55, row: 53 },
  { type: 'barrel', col: 14, row: 73 },

  // Dungeon arch
  { type: 'dungeon_arch', col: 38, row: 9 },
];

/**
 * Create the props renderer.
 * Returns a Graphics object and update function.
 */
export function createPropsRenderer() {
  const gfx = new Graphics();

  /**
   * Render props visible in viewport.
   * @param {number} camX
   * @param {number} camY
   * @param {number} vpWidth
   * @param {number} vpHeight
   * @param {number} time - elapsed seconds for animations
   */
  function render(camX, camY, vpWidth, vpHeight, time) {
    gfx.clear();

    const viewLeft = -camX - WORLD_TILE_SIZE * 2;
    const viewRight = -camX + vpWidth + WORLD_TILE_SIZE * 2;
    const viewTop = -camY - WORLD_TILE_SIZE * 2;
    const viewBottom = -camY + vpHeight + WORLD_TILE_SIZE * 2;

    for (const prop of PROP_LIST) {
      const px = prop.col * WORLD_TILE_SIZE;
      const py = prop.row * WORLD_TILE_SIZE;

      // Cull off-screen props
      if (px < viewLeft || px > viewRight || py < viewTop || py > viewBottom) continue;

      switch (prop.type) {
        case 'car':
          drawCar(gfx, px, py, prop.rotation || 0);
          break;
        case 'streetlight':
          drawStreetlight(gfx, px, py);
          break;
        case 'telephone_pole':
          drawTelephonePole(gfx, px, py);
          break;
        case 'debris':
          drawDebris(gfx, px, py);
          break;
        case 'barrel':
          drawBarrel(gfx, px, py);
          break;
        case 'campfire':
          drawCampfire(gfx, px, py, time);
          break;
        case 'dungeon_arch':
          drawDungeonArch(gfx, px, py, time);
          break;
      }
    }

    // Draw wires between telephone poles
    drawWires(gfx);
  }

  return { gfx, render };
}

function drawCar(gfx, x, y, rotation) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Ground shadow
  gfx.ellipse(cx, cy + 6, 22, 8);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Car body — dark rectangle
  // Apply rotation by drawing at offset
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  // Simple rotated rectangle approximation
  const hw = 20;
  const hh = 10;

  const corners = [
    [-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh],
  ].map(([dx, dy]) => [
    cx + dx * cos - dy * sin,
    cy + dx * sin + dy * cos,
  ]);

  gfx.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < 4; i++) {
    gfx.lineTo(corners[i][0], corners[i][1]);
  }
  gfx.closePath();
  gfx.fill(PROP_CAR_COLOR);

  // Windshield crack line
  const windshieldX = cx + 8 * cos;
  const windshieldY = cy + 8 * sin;
  gfx.moveTo(windshieldX - 6, windshieldY - 5);
  gfx.lineTo(windshieldX + 4, windshieldY + 5);
  gfx.stroke({ width: 1, color: 0x4a4a4a, alpha: 0.6 });

  // Flat tires — small dark circles at corners
  gfx.circle(corners[0][0], corners[0][1], 3);
  gfx.fill(0x1a1a1a);
  gfx.circle(corners[1][0], corners[1][1], 3);
  gfx.fill(0x1a1a1a);
  gfx.circle(corners[2][0], corners[2][1], 3);
  gfx.fill(0x1a1a1a);
  gfx.circle(corners[3][0], corners[3][1], 3);
  gfx.fill(0x1a1a1a);
}

function drawStreetlight(gfx, x, y) {
  const bx = x + WORLD_TILE_SIZE / 2;
  const by = y + WORLD_TILE_SIZE;

  // Pole — vertical, bent/snapped
  gfx.moveTo(bx, by);
  gfx.lineTo(bx, by - 35);
  gfx.lineTo(bx - 8, by - 40); // bent top
  gfx.stroke({ width: 2, color: PROP_POLE_COLOR });

  // No light — just the fixture shape
  gfx.circle(bx - 8, by - 40, 3);
  gfx.fill({ color: 0x3a3a3a, alpha: 0.5 });
}

function drawTelephonePole(gfx, x, y) {
  const bx = x + WORLD_TILE_SIZE / 2;
  const by = y + WORLD_TILE_SIZE;

  // Vertical pole
  gfx.moveTo(bx, by);
  gfx.lineTo(bx, by - 42);
  gfx.stroke({ width: 3, color: 0x3a2a1a });

  // Crossbar
  gfx.moveTo(bx - 12, by - 38);
  gfx.lineTo(bx + 12, by - 38);
  gfx.stroke({ width: 2, color: 0x3a2a1a });
}

function drawWires(gfx) {
  // Draw sagging wires between telephone poles
  const poles = PROP_LIST.filter(p => p.type === 'telephone_pole');
  for (let i = 0; i < poles.length - 1; i++) {
    const p1 = poles[i];
    const p2 = poles[i + 1];

    const x1 = p1.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 + 12;
    const y1 = p1.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE - 38;
    const x2 = p2.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 - 12;
    const y2 = p2.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE - 38;

    // Sagging wire as bezier curve
    const midX = (x1 + x2) / 2;
    const midY = Math.max(y1, y2) + 20; // sag

    gfx.moveTo(x1, y1);
    gfx.quadraticCurveTo(midX, midY, x2, y2);
    gfx.stroke({ width: 1, color: 0x3a3a3a, alpha: 0.5 });
  }
}

function drawDebris(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Cluster of small dark rectangles
  gfx.rect(cx - 8, cy - 4, 7, 5);
  gfx.fill(PROP_DEBRIS_COLOR);
  gfx.rect(cx + 2, cy - 2, 5, 8);
  gfx.fill(0x2a2018);
  gfx.rect(cx - 4, cy + 3, 9, 4);
  gfx.fill(0x1a1810);
  gfx.rect(cx + 5, cy + 5, 4, 3);
  gfx.fill(PROP_DEBRIS_COLOR);
}

function drawBarrel(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Shadow
  gfx.ellipse(cx, cy + 6, 8, 3);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Barrel body
  gfx.circle(cx, cy, 7);
  gfx.fill(PROP_BARREL_COLOR);

  // Rust ring
  gfx.circle(cx, cy, 7);
  gfx.stroke({ width: 1.5, color: 0x6a3a0a, alpha: 0.6 });

  // Top highlight
  gfx.circle(cx, cy - 2, 3);
  gfx.fill({ color: 0x9a5a2a, alpha: 0.4 });
}

function drawCampfire(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Glow circle beneath (pulsing)
  const glowAlpha = 0.15 + 0.1 * Math.sin(time * 2.5);
  gfx.circle(cx, cy, CAMP_GLOW_RADIUS);
  gfx.fill({ color: CAMP_GLOW_COLOR, alpha: glowAlpha });

  // Orange warm light layer
  gfx.circle(cx, cy, CAMP_GLOW_RADIUS * 0.6);
  gfx.fill({ color: 0x885511, alpha: glowAlpha * 0.5 });

  // Fire ring (stones)
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const sx = cx + Math.cos(angle) * 10;
    const sy = cy + Math.sin(angle) * 8;
    gfx.circle(sx, sy, 3);
    gfx.fill(0x4a4040);
  }

  // Animated flames
  const pulseScale = 1 + 0.15 * Math.sin(time * 3.5);
  for (let i = 0; i < CAMP_FIRE_COLORS.length; i++) {
    const h = (12 - i * 1.5) * pulseScale;
    const w = (8 - i) * pulseScale;
    const yOff = i * 1.5;
    const xWobble = Math.sin(time * 4 + i * 0.8) * 2;
    gfx.ellipse(cx + xWobble, cy - yOff - h / 2, w, h);
    gfx.fill({ color: CAMP_FIRE_COLORS[i], alpha: 0.8 - i * 0.08 });
  }

  // Embers — small dots floating up
  for (let i = 0; i < 5; i++) {
    const emberT = (time * 1.2 + i * 1.3) % 3;
    const ex = cx + Math.sin(time * 2 + i * 2) * 8;
    const ey = cy - 10 - emberT * 12;
    const ea = Math.max(0, 0.7 - emberT * 0.25);
    gfx.circle(ex, ey, 1.5);
    gfx.fill({ color: 0x66ff33, alpha: ea });
  }
}

function drawDungeonArch(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE * 1.5; // center of 3-tile wide arch
  const top = y;

  // Left pillar
  gfx.rect(x - 4, top, 12, WORLD_TILE_SIZE * 2.5);
  gfx.fill(DUNGEON_STONE_COLOR);

  // Right pillar
  gfx.rect(x + WORLD_TILE_SIZE * 3 - 8, top, 12, WORLD_TILE_SIZE * 2.5);
  gfx.fill(DUNGEON_STONE_COLOR);

  // Arch top — curved
  gfx.moveTo(x - 4, top + 6);
  gfx.lineTo(x - 4, top - 8);
  gfx.quadraticCurveTo(cx, top - 25, x + WORLD_TILE_SIZE * 3 + 4, top - 8);
  gfx.lineTo(x + WORLD_TILE_SIZE * 3 + 4, top + 6);
  gfx.quadraticCurveTo(cx, top - 15, x - 4, top + 6);
  gfx.closePath();
  gfx.fill(DUNGEON_STONE_COLOR);

  // Stone block lines on pillars
  for (let i = 0; i < 5; i++) {
    const ly = top + 10 + i * 20;
    gfx.moveTo(x - 4, ly);
    gfx.lineTo(x + 8, ly);
    gfx.stroke({ width: 0.5, color: 0x1a1510, alpha: 0.5 });

    gfx.moveTo(x + WORLD_TILE_SIZE * 3 - 8, ly);
    gfx.lineTo(x + WORLD_TILE_SIZE * 3 + 4, ly);
    gfx.stroke({ width: 0.5, color: 0x1a1510, alpha: 0.5 });
  }

  // Green glowing threshold — pulsing
  const glowAlpha = 0.3 + 0.25 * Math.sin(time * 2.5);
  gfx.rect(x + 10, top + WORLD_TILE_SIZE * 2, WORLD_TILE_SIZE * 3 - 20, 6);
  gfx.fill({ color: DUNGEON_GLOW_COLOR, alpha: glowAlpha });

  // Glow around entrance
  gfx.rect(x + 12, top + 10, WORLD_TILE_SIZE * 3 - 24, WORLD_TILE_SIZE * 2 - 10);
  gfx.fill({ color: DUNGEON_GLOW_COLOR, alpha: glowAlpha * 0.15 });
}
