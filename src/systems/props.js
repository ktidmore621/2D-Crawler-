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

/**
 * Prop definition: { type, col, row, rotation? }
 */

// Hand-placed props
export const PROP_LIST = [
  // Base camp — campfire
  { type: 'campfire', col: 6, row: 74 },

  // Base building — condemned structure
  { type: 'base_building', col: 3, row: 72 },

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
   */
  function render(camX, camY, vpWidth, vpHeight, time) {
    gfx.clear();

    const viewLeft = -camX - WORLD_TILE_SIZE * 3;
    const viewRight = -camX + vpWidth + WORLD_TILE_SIZE * 3;
    const viewTop = -camY - WORLD_TILE_SIZE * 3;
    const viewBottom = -camY + vpHeight + WORLD_TILE_SIZE * 3;

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
        case 'base_building':
          drawBaseBuilding(gfx, px, py);
          break;
      }
    }

    // Draw wires between telephone poles
    drawWires(gfx);
  }

  return { gfx, render };
}

/* ──────────────── Broken Car — 3/4 ──────────────── */

function drawCar(gfx, x, y, rotation) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  // Helper: rotate point around center
  const rot = (dx, dy) => [
    cx + dx * cos - dy * sin,
    cy + dx * sin + dy * cos,
  ];

  // Shadow underneath — elongated dark ellipse
  gfx.ellipse(cx + 4, cy + 10, 24, 8);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // ── Car body (main) ──
  const hw = 22; // half width
  const hh = 11; // half height
  const bodyCorners = [
    rot(-hw, -hh), rot(hw, -hh), rot(hw, hh), rot(-hw, hh),
  ];

  // Main body fill
  gfx.moveTo(bodyCorners[0][0], bodyCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(bodyCorners[i][0], bodyCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x3a3530);

  // ── Shadow side (right/bottom strip) — darker ──
  const shadowCorners = [
    rot(hw - 4, -hh), rot(hw, -hh), rot(hw, hh), rot(hw - 4, hh),
  ];
  gfx.moveTo(shadowCorners[0][0], shadowCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(shadowCorners[i][0], shadowCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x252220);

  // Bottom shadow strip (south-facing depth)
  const btmCorners = [
    rot(-hw, hh - 3), rot(hw, hh - 3), rot(hw, hh), rot(-hw, hh),
  ];
  gfx.moveTo(btmCorners[0][0], btmCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(btmCorners[i][0], btmCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x252220);

  // ── Hood (north-facing end — slightly lighter) ──
  const hoodCorners = [
    rot(-hw, -hh), rot(hw, -hh), rot(hw, -hh + 6), rot(-hw, -hh + 6),
  ];
  gfx.moveTo(hoodCorners[0][0], hoodCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(hoodCorners[i][0], hoodCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x424038);

  // ── Roof — lighter smaller rectangle centered on body ──
  const rw = 12;
  const rh = 7;
  const roofCorners = [
    rot(-rw, -rh), rot(rw, -rh), rot(rw, rh), rot(-rw, rh),
  ];
  gfx.moveTo(roofCorners[0][0], roofCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(roofCorners[i][0], roofCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x4a4540);

  // ── Windshield — dark blue-grey on front face, with crack ──
  const wsCorners = [
    rot(-10, -hh + 6), rot(10, -hh + 6), rot(10, -hh + 10), rot(-10, -hh + 10),
  ];
  gfx.moveTo(wsCorners[0][0], wsCorners[0][1]);
  for (let i = 1; i < 4; i++) gfx.lineTo(wsCorners[i][0], wsCorners[i][1]);
  gfx.closePath();
  gfx.fill(0x1a2028);

  // Windshield crack line
  const crk1 = rot(-4, -hh + 7);
  const crk2 = rot(5, -hh + 9);
  gfx.moveTo(crk1[0], crk1[1]);
  gfx.lineTo(crk2[0], crk2[1]);
  gfx.stroke({ width: 1, color: 0x5a5a6a, alpha: 0.7 });

  // ── Wheels — small dark ellipses at corners (3/4 squashed) ──
  const wheelPositions = [
    [-hw + 3, -hh + 2], [hw - 3, -hh + 2],
    [-hw + 3, hh - 2], [hw - 3, hh - 2],
  ];
  for (const [dx, dy] of wheelPositions) {
    const [wx, wy] = rot(dx, dy);
    // Squashed ellipse for 3/4 view
    gfx.ellipse(wx, wy, 3.5, 2);
    gfx.fill(0x1a1a1a);
  }
}

/* ──────────────── Streetlight — 3/4 cylindrical ──────────────── */

function drawStreetlight(gfx, x, y) {
  const bx = x + WORLD_TILE_SIZE / 2;
  const by = y + WORLD_TILE_SIZE;

  // Shadow on ground
  gfx.ellipse(bx + 4, by + 2, 6, 2);
  gfx.fill({ color: 0x000000, alpha: 0.15 });

  // Pole — narrow rounded rectangle with left/right face for cylindrical depth
  // Left face (lit)
  gfx.rect(bx - 2, by - 38, 2, 38);
  gfx.fill(0x7a6a4a);
  // Right face (shadow)
  gfx.rect(bx, by - 38, 2, 38);
  gfx.fill(0x4a3a2a);

  // Bent top section
  gfx.moveTo(bx - 1, by - 38);
  gfx.lineTo(bx - 10, by - 42);
  gfx.stroke({ width: 2.5, color: 0x4a3a2a });
  gfx.moveTo(bx - 1, by - 39);
  gfx.lineTo(bx - 10, by - 43);
  gfx.stroke({ width: 1.5, color: 0x7a6a4a });

  // Lamp head — small rectangle with darker underside
  gfx.rect(bx - 14, by - 45, 8, 3);
  gfx.fill(0x5a5040); // top face
  gfx.rect(bx - 14, by - 42, 8, 2);
  gfx.fill(0x3a3020); // underside darker

  // Broken wire — bezier drooping down (2 lines for shadow depth)
  gfx.moveTo(bx - 10, by - 42);
  gfx.quadraticCurveTo(bx - 6, by - 30, bx - 2, by - 34);
  gfx.stroke({ width: 1, color: 0x3a3a3a, alpha: 0.5 });
  gfx.moveTo(bx - 10, by - 41);
  gfx.quadraticCurveTo(bx - 6, by - 29, bx - 2, by - 33);
  gfx.stroke({ width: 0.8, color: 0x5a5a5a, alpha: 0.3 });
}

/* ──────────────── Telephone Pole — 3/4 cylindrical ──────────────── */

function drawTelephonePole(gfx, x, y) {
  const bx = x + WORLD_TILE_SIZE / 2;
  const by = y + WORLD_TILE_SIZE;

  // Shadow on ground
  gfx.ellipse(bx + 4, by + 2, 5, 2);
  gfx.fill({ color: 0x000000, alpha: 0.15 });

  // Pole — cylindrical with left/right face
  gfx.rect(bx - 3, by - 44, 3, 44);
  gfx.fill(0x5a4a30); // left face (lit)
  gfx.rect(bx, by - 44, 3, 44);
  gfx.fill(0x3a2a1a); // right face (shadow)

  // Crossbar — wider rectangle with top/front/underside
  // Top face (lightest)
  gfx.rect(bx - 14, by - 42, 28, 2);
  gfx.fill(0x6a5a40);
  // Front face (mid)
  gfx.rect(bx - 14, by - 40, 28, 3);
  gfx.fill(0x4a3a28);
  // Underside (darkest)
  gfx.rect(bx - 14, by - 37, 28, 2);
  gfx.fill(0x2a1a10);
}

/* ──────────────── Wires between telephone poles — 3/4 ──────────────── */

function drawWires(gfx) {
  const poles = PROP_LIST.filter(p => p.type === 'telephone_pole');
  for (let i = 0; i < poles.length - 1; i++) {
    const p1 = poles[i];
    const p2 = poles[i + 1];

    const x1 = p1.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 + 14;
    const y1 = p1.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE - 40;
    const x2 = p2.col * WORLD_TILE_SIZE + WORLD_TILE_SIZE / 2 - 14;
    const y2 = p2.row * WORLD_TILE_SIZE + WORLD_TILE_SIZE - 40;

    const midX = (x1 + x2) / 2;
    const midY = Math.max(y1, y2) + 22;

    // Top wire — lighter
    gfx.moveTo(x1, y1);
    gfx.quadraticCurveTo(midX, midY, x2, y2);
    gfx.stroke({ width: 1, color: 0x5a5a5a, alpha: 0.4 });

    // Bottom wire — darker shadow
    gfx.moveTo(x1, y1 + 1.5);
    gfx.quadraticCurveTo(midX, midY + 1.5, x2, y2 + 1.5);
    gfx.stroke({ width: 1, color: 0x2a2a2a, alpha: 0.35 });
  }
}

/* ──────────────── Debris — 3/4 overlapping pieces ──────────────── */

function drawDebris(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Shadow underneath
  gfx.ellipse(cx + 2, cy + 8, 14, 4);
  gfx.fill({ color: 0x000000, alpha: 0.15 });

  // Back pieces — smaller, higher (further away in 3/4)
  // Piece 1 — concrete grey
  gfx.rect(cx - 6, cy - 8, 8, 4); // top face
  gfx.fill(0x7a7068);
  gfx.rect(cx - 6, cy - 4, 8, 5); // front face
  gfx.fill(0x6a6058);

  // Piece 2 — rust colored (back)
  gfx.rect(cx + 4, cy - 6, 6, 3); // top face
  gfx.fill(0x8a5a3a);
  gfx.rect(cx + 4, cy - 3, 6, 5); // front face
  gfx.fill(0x7a4a2a);

  // Front pieces — larger, lower (closer to camera)
  // Piece 3 — dark wood
  gfx.rect(cx - 8, cy + 1, 10, 3); // top face
  gfx.fill(0x5a4028);
  gfx.rect(cx - 8, cy + 4, 10, 6); // front face
  gfx.fill(0x4a3018);

  // Piece 4 — concrete
  gfx.rect(cx + 3, cy + 2, 7, 3); // top face
  gfx.fill(0x7a7068);
  gfx.rect(cx + 3, cy + 5, 7, 4); // front face
  gfx.fill(0x5a5848);

  // Piece 5 — small rust piece in front
  gfx.rect(cx - 2, cy + 6, 5, 2); // top face
  gfx.fill(0x8a5a3a);
  gfx.rect(cx - 2, cy + 8, 5, 3); // front face
  gfx.fill(0x6a3a1a);
}

/* ──────────────── Barrel — 3/4 ──────────────── */

function drawBarrel(gfx, x, y) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Small shadow ellipse underneath
  gfx.ellipse(cx + 3, cy + 10, 9, 3);
  gfx.fill({ color: 0x000000, alpha: 0.18 });

  // Front face — rectangle (mid tone)
  gfx.rect(cx - 7, cy - 4, 14, 14);
  gfx.fill(0x7a4a2a);

  // Bottom darker strip
  gfx.rect(cx - 7, cy + 7, 14, 3);
  gfx.fill(0x4a2a10);

  // Horizontal hoop lines on front face
  gfx.moveTo(cx - 7, cy);
  gfx.lineTo(cx + 7, cy);
  gfx.stroke({ width: 1.5, color: 0x5a3218, alpha: 0.7 });

  gfx.moveTo(cx - 7, cy + 5);
  gfx.lineTo(cx + 7, cy + 5);
  gfx.stroke({ width: 1.5, color: 0x5a3218, alpha: 0.6 });

  gfx.moveTo(cx - 7, cy - 2);
  gfx.lineTo(cx + 7, cy - 2);
  gfx.stroke({ width: 1, color: 0x5a3218, alpha: 0.5 });

  // Top ellipse — lighter rusty orange (top face)
  gfx.ellipse(cx, cy - 4, 7, 3);
  gfx.fill(0x8a5a2a);

  // Top face inner ring
  gfx.ellipse(cx, cy - 4, 4, 2);
  gfx.fill({ color: 0x6a3a1a, alpha: 0.5 });

  // Bottom ellipse shadow (implied curve)
  gfx.ellipse(cx, cy + 10, 7, 2);
  gfx.fill({ color: 0x3a1a08, alpha: 0.3 });
}

/* ──────────────── Campfire — 3/4 ──────────────── */

function drawCampfire(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE / 2;
  const cy = y + WORLD_TILE_SIZE / 2;

  // Glow pool on ground — ellipse (wider than tall, flat ground plane)
  const glowAlpha = 0.15 + 0.1 * Math.sin(time * 2.5);
  gfx.ellipse(cx, cy + 2, CAMP_GLOW_RADIUS * 1.1, CAMP_GLOW_RADIUS * 0.7);
  gfx.fill({ color: CAMP_GLOW_COLOR, alpha: glowAlpha });

  // Orange warm light layer (also elliptical)
  gfx.ellipse(cx, cy + 2, CAMP_GLOW_RADIUS * 0.7, CAMP_GLOW_RADIUS * 0.45);
  gfx.fill({ color: 0x885511, alpha: glowAlpha * 0.5 });

  // Stone ring — each stone as a 3/4 block
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const sx = cx + Math.cos(angle) * 11;
    const sy = cy + Math.sin(angle) * 9; // elliptical ring (3/4)

    // Top face (light grey)
    gfx.rect(sx - 3, sy - 3, 6, 3);
    gfx.fill(0x6a6058);
    // Front face (dark grey)
    gfx.rect(sx - 3, sy, 6, 3);
    gfx.fill(0x3a3830);
  }

  // Log pile — 2 crossed rectangles with lighter top face
  // Log 1
  gfx.rect(cx - 7, cy - 1, 14, 2); // top face
  gfx.fill(0x5a3a1a);
  gfx.rect(cx - 7, cy + 1, 14, 2); // front face
  gfx.fill(0x3a2210);
  // Log end
  gfx.ellipse(cx - 7, cy + 1, 2, 2);
  gfx.fill(0x4a2a10);
  gfx.ellipse(cx + 7, cy + 1, 2, 2);
  gfx.fill(0x3a1a08);

  // Log 2 (crossed)
  gfx.rect(cx - 2, cy - 5, 2, 10); // top face
  gfx.fill(0x5a3a1a);
  gfx.rect(cx, cy - 5, 2, 10); // front face
  gfx.fill(0x3a2210);

  // Animated flames — base wider than top (perspective)
  const pulseScale = 1 + 0.15 * Math.sin(time * 3.5);
  for (let i = 0; i < CAMP_FIRE_COLORS.length; i++) {
    const h = (12 - i * 1.5) * pulseScale;
    const w = (9 - i * 1.2) * pulseScale; // wider base
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

/* ──────────────── Dungeon Entrance Archway — 3/4 ──────────────── */

function drawDungeonArch(gfx, x, y, time) {
  const cx = x + WORLD_TILE_SIZE * 1.5;
  const top = y;
  const archWidth = WORLD_TILE_SIZE * 3;
  const archHeight = WORLD_TILE_SIZE * 2.5;

  // ── Steps leading down — 3 steps going into the arch ──
  const stepWidth = archWidth - 24;
  for (let i = 0; i < 3; i++) {
    const stepY = top + archHeight - 6 + i * 8;
    const darken = i * 0.15;
    // Top face of step (lighter)
    gfx.rect(x + 12 + i * 4, stepY, stepWidth - i * 8, 3);
    gfx.fill({ color: 0x4a4038, alpha: 1 - darken });
    // Front face of step (darker)
    gfx.rect(x + 12 + i * 4, stepY + 3, stepWidth - i * 8, 5);
    gfx.fill({ color: 0x2a2018, alpha: 1 - darken });
  }

  // ── Inside of arch — very dark, suggesting depth going down ──
  gfx.rect(x + 10, top + 12, archWidth - 20, archHeight - 12);
  gfx.fill(0x050302);

  // ── Left pillar — 3/4 stone blocks ──
  const pillarW = 14;
  // Front face
  gfx.rect(x - 4, top, pillarW, archHeight);
  gfx.fill(DUNGEON_STONE_COLOR);
  // Top face
  gfx.rect(x - 4, top - 4, pillarW, 4);
  gfx.fill(0x3a3530);
  // Shadow side (right edge)
  gfx.rect(x - 4 + pillarW - 3, top, 3, archHeight);
  gfx.fill(0x1a1510);

  // Stone block lines on left pillar
  for (let i = 0; i < 6; i++) {
    const ly = top + 6 + i * 18;
    const blockOffset = (i % 2 === 0) ? 0 : 4;
    // Horizontal mortar
    gfx.moveTo(x - 4, ly);
    gfx.lineTo(x - 4 + pillarW, ly);
    gfx.stroke({ width: 0.8, color: 0x1a1510, alpha: 0.5 });
    // Vertical mortar (offset for brick pattern)
    gfx.moveTo(x - 4 + blockOffset + 6, ly);
    gfx.lineTo(x - 4 + blockOffset + 6, ly + 18);
    gfx.stroke({ width: 0.6, color: 0x1a1510, alpha: 0.3 });
  }

  // ── Right pillar — 3/4 stone blocks ──
  const rpx = x + archWidth - 10;
  // Front face
  gfx.rect(rpx, top, pillarW, archHeight);
  gfx.fill(DUNGEON_STONE_COLOR);
  // Top face
  gfx.rect(rpx, top - 4, pillarW, 4);
  gfx.fill(0x3a3530);
  // Shadow side (right edge)
  gfx.rect(rpx + pillarW - 3, top, 3, archHeight);
  gfx.fill(0x1a1510);

  // Stone block lines on right pillar
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

  // ── Arch top — curved, with 3/4 treatment ──
  // Top face of arch (lightest)
  gfx.moveTo(x - 4, top - 4);
  gfx.quadraticCurveTo(cx, top - 30, x + archWidth + 4, top - 4);
  gfx.lineTo(x + archWidth + 4, top);
  gfx.quadraticCurveTo(cx, top - 22, x - 4, top);
  gfx.closePath();
  gfx.fill(0x3a3530);

  // Front face of arch (mid)
  gfx.moveTo(x - 4, top);
  gfx.quadraticCurveTo(cx, top - 22, x + archWidth + 4, top);
  gfx.lineTo(x + archWidth + 4, top + 8);
  gfx.quadraticCurveTo(cx, top - 14, x - 4, top + 8);
  gfx.closePath();
  gfx.fill(DUNGEON_STONE_COLOR);

  // Block lines on arch curve
  for (let i = 0; i < 5; i++) {
    const t = (i + 1) / 6;
    const ax = x - 4 + (archWidth + 8) * t;
    const ay = top - 22 + 22 * (1 - Math.sin(t * Math.PI)) * 0.4;
    gfx.moveTo(ax, ay - 4);
    gfx.lineTo(ax, ay + 8);
    gfx.stroke({ width: 0.6, color: 0x1a1510, alpha: 0.4 });
  }

  // ── Green threshold glow — ellipse on ground, pulsing ──
  const glowAlpha = 0.3 + 0.25 * Math.sin(time * 2.5);
  gfx.ellipse(cx, top + archHeight + 4, archWidth * 0.35, 8);
  gfx.fill({ color: DUNGEON_GLOW_COLOR, alpha: glowAlpha });

  // Glow inside entrance
  gfx.ellipse(cx, top + archHeight * 0.6, archWidth * 0.25, archHeight * 0.2);
  gfx.fill({ color: DUNGEON_GLOW_COLOR, alpha: glowAlpha * 0.12 });
}

/* ──────────────── Base Building — condemned 3/4 ──────────────── */

function drawBaseBuilding(gfx, x, y) {
  const bw = WORLD_TILE_SIZE * 3; // building width (3 tiles)
  const bh = WORLD_TILE_SIZE * 2; // building height (2 tiles)

  // ── Foundation — slightly lighter strip at base ──
  gfx.rect(x - 2, y + bh - 4, bw + 4, 6);
  gfx.fill(0x6a5a48);

  // ── Walls — full 3/4 stone block treatment ──
  // Front face (main wall, south-facing)
  gfx.rect(x, y + 12, bw, bh - 12);
  gfx.fill(0x5a4a38);

  // Top face — 12px strip
  gfx.rect(x, y, bw, 12);
  gfx.fill(0x7a6a58);

  // Right face — shadow side
  gfx.rect(x + bw - 8, y + 12, 8, bh - 12);
  gfx.fill(0x3a2a18);

  // Stone block lines on front wall (brick pattern)
  for (let row = 0; row < 6; row++) {
    const ly = y + 14 + row * 12;
    if (ly > y + bh - 4) break;
    // Horizontal mortar
    gfx.moveTo(x + 2, ly);
    gfx.lineTo(x + bw - 10, ly);
    gfx.stroke({ width: 1, color: 0x3a2a1a, alpha: 0.5 });

    // Vertical mortar — offset every other row
    const offset = (row % 2 === 0) ? 0 : 8;
    for (let vx = offset + 16; vx < bw - 10; vx += 16) {
      gfx.moveTo(x + vx, ly);
      gfx.lineTo(x + vx, ly + 12);
      gfx.stroke({ width: 0.8, color: 0x3a2a1a, alpha: 0.35 });
    }
  }

  // ── Windows — recessed look ──
  // Window 1
  const w1x = x + 16;
  const w1y = y + 26;
  gfx.rect(w1x, w1y, 18, 22);
  gfx.fill(0x0a0806); // dark interior
  gfx.moveTo(w1x, w1y);
  gfx.lineTo(w1x + 18, w1y);
  gfx.stroke({ width: 1.5, color: 0x9a8a78 }); // top sill highlight

  // Window 2
  const w2x = x + bw - 38;
  gfx.rect(w2x, w1y, 18, 22);
  gfx.fill(0x0a0806);
  gfx.moveTo(w2x, w1y);
  gfx.lineTo(w2x + 18, w1y);
  gfx.stroke({ width: 1.5, color: 0x9a8a78 });

  // ── Boarded door — X pattern of planks ──
  const dx = x + bw / 2 - 12;
  const dy = y + 30;
  const dw = 24;
  const dh = bh - 34;
  gfx.rect(dx, dy, dw, dh);
  gfx.fill(0x3a2510); // door background

  // Board X pattern
  gfx.moveTo(dx + 2, dy + 2);
  gfx.lineTo(dx + dw - 2, dy + dh - 2);
  gfx.stroke({ width: 3, color: 0x5a3518 });
  gfx.moveTo(dx + dw - 2, dy + 2);
  gfx.lineTo(dx + 2, dy + dh - 2);
  gfx.stroke({ width: 3, color: 0x5a3518 });

  // Board top edge highlights
  gfx.moveTo(dx + 2, dy + 1);
  gfx.lineTo(dx + dw - 2, dy + dh - 3);
  gfx.stroke({ width: 1, color: 0x7a5530, alpha: 0.5 });
  gfx.moveTo(dx + dw - 2, dy + 1);
  gfx.lineTo(dx + 2, dy + dh - 3);
  gfx.stroke({ width: 1, color: 0x7a5530, alpha: 0.5 });

  // Horizontal board
  gfx.rect(dx, dy + dh / 2 - 2, dw, 4);
  gfx.fill(0x5a3518);
  gfx.moveTo(dx, dy + dh / 2 - 2);
  gfx.lineTo(dx + dw, dy + dh / 2 - 2);
  gfx.stroke({ width: 1, color: 0x7a5530, alpha: 0.5 });

  // ── Roof — dark grey-brown slanted covering ──
  gfx.moveTo(x - 6, y - 2);
  gfx.lineTo(x + bw + 6, y - 2);
  gfx.lineTo(x + bw + 4, y - 16);
  gfx.lineTo(x - 4, y - 12);
  gfx.closePath();
  gfx.fill(0x3a2a18);

  // Roof front edge (lighter — top face)
  gfx.moveTo(x - 6, y - 2);
  gfx.lineTo(x + bw + 6, y - 2);
  gfx.lineTo(x + bw + 6, y);
  gfx.lineTo(x - 6, y);
  gfx.closePath();
  gfx.fill(0x4a3a28);

  // ── Collapsed section — one corner of roof missing ──
  // Remove top-right portion — show exposed rafters
  gfx.rect(x + bw - 30, y - 16, 34, 14);
  gfx.fill(0x0a0805); // sky through collapsed roof

  // Exposed rafters — 3-4 diagonal dark lines
  for (let i = 0; i < 4; i++) {
    const rx = x + bw - 28 + i * 8;
    gfx.moveTo(rx, y - 14);
    gfx.lineTo(rx + 4, y - 2);
    gfx.stroke({ width: 1.5, color: 0x2a1a08 });
  }

  // Wall cracks
  gfx.moveTo(x + 10, y + 20);
  gfx.lineTo(x + 18, y + 44);
  gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.4 });

  gfx.moveTo(x + bw - 20, y + 30);
  gfx.lineTo(x + bw - 16, y + 52);
  gfx.lineTo(x + bw - 22, y + 60);
  gfx.stroke({ width: 1, color: 0x2a1a0a, alpha: 0.35 });
}
