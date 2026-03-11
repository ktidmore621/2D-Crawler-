/**
 * Texture cache — loads all sprite sheets at startup and extracts
 * sub-region Textures that are reused throughout the game.
 * Never create new Textures per tile — always pull from this cache.
 */

import { Assets, Texture, Rectangle } from 'pixi.js';
import { SPRITE_ATLAS, getAllAssetPaths } from '../data/spriteAtlas.js';

/** Cached sub-textures keyed by name */
const cache = {};

/** Whether the cache has been initialized */
let initialized = false;

/**
 * Preload all sprite sheets and extract sub-textures.
 * Call once at startup before any rendering.
 * @param {function} [onProgress] - optional progress callback (0..1)
 */
export async function initTextureCache(onProgress) {
  if (initialized) return;

  // Register all assets as a bundle
  const assets = getAllAssetPaths();
  Assets.addBundle('sprites', assets);
  const textures = await Assets.loadBundle('sprites', onProgress);

  // ── Extract floor tile sub-textures ──
  const floorsTex = textures.floors;
  const fc = SPRITE_ATLAS.floors;
  for (const [name, pos] of Object.entries(fc.tiles)) {
    cache[`floor_${name}`] = extractTile(floorsTex, pos.col, pos.row, fc.tileW, fc.tileH);
  }

  // ── Extract wall tile sub-textures ──
  const wallsTex = textures.walls;
  const wc = SPRITE_ATLAS.walls;
  for (const [name, pos] of Object.entries(wc.tiles)) {
    cache[`wall_${name}`] = extractTile(wallsTex, pos.col, pos.row, wc.tileW, wc.tileH);
  }

  // ── Extract water tile sub-textures ──
  const waterTex = textures.water;
  const wtc = SPRITE_ATLAS.water;
  for (const [name, pos] of Object.entries(wtc.tiles)) {
    cache[`water_${name}`] = extractTile(waterTex, pos.col, pos.row, wtc.tileW, wtc.tileH);
  }

  // ── Extract tree sub-textures ──
  const tree1Tex = textures.treeModel1;
  const t1 = SPRITE_ATLAS.treeModel1;
  for (const [name, pos] of Object.entries(t1.trees)) {
    cache[`tree1_${name}`] = extractRect(tree1Tex, pos.col * t1.frameW, pos.row * t1.frameH, t1.frameW, t1.frameH);
  }

  const tree2Tex = textures.treeModel2;
  const t2 = SPRITE_ATLAS.treeModel2;
  for (const [name, pos] of Object.entries(t2.trees)) {
    cache[`tree2_${name}`] = extractRect(tree2Tex, pos.col * t2.frameW, pos.row * t2.frameH, t2.frameW, t2.frameH);
  }

  // ── Extract bonfire frames ──
  const bonfireTex = textures.bonfire;
  const bf = SPRITE_ATLAS.bonfire;
  for (let i = 0; i < bf.frameCount; i++) {
    cache[`bonfire_${i}`] = extractRect(bonfireTex, i * bf.frameW, 0, bf.frameW, bf.frameH);
  }

  // ── Extract fire frames ──
  const fireTex = textures.fire;
  const ff = SPRITE_ATLAS.fire;
  for (let i = 0; i < ff.frameCount; i++) {
    cache[`fire_${i}`] = extractRect(fireTex, i * ff.frameW, 0, ff.frameW, ff.frameH);
  }

  // ── Extract rock sub-textures ──
  const rocksTex = textures.rocks;
  for (const [name, rect] of Object.entries(SPRITE_ATLAS.rocks.regions)) {
    cache[`rock_${name}`] = extractRect(rocksTex, rect.x, rect.y, rect.w, rect.h);
  }

  // ── Extract vegetation sub-textures ──
  const vegTex = textures.vegetation;
  for (const [name, rect] of Object.entries(SPRITE_ATLAS.vegetation.regions)) {
    cache[`veg_${name}`] = extractRect(vegTex, rect.x, rect.y, rect.w, rect.h);
  }

  // ── Extract building wall sub-textures ──
  const bwTex = textures.buildingWalls;
  for (const [name, rect] of Object.entries(SPRITE_ATLAS.buildingWalls.regions)) {
    cache[`bwall_${name}`] = extractRect(bwTex, rect.x, rect.y, rect.w, rect.h);
  }

  // ── Extract building roof sub-textures ──
  const brTex = textures.buildingRoofs;
  for (const [name, rect] of Object.entries(SPRITE_ATLAS.buildingRoofs.regions)) {
    cache[`broof_${name}`] = extractRect(brTex, rect.x, rect.y, rect.w, rect.h);
  }

  // ── Extract terrain tile sub-textures (TopDownFantasy Forest) ──
  const terrainTex = textures.terrain;
  if (terrainTex) {
    const tc = SPRITE_ATLAS.terrain;
    for (const [name, pos] of Object.entries(tc.tiles)) {
      cache[`terrain_${name}`] = extractTile(terrainTex, pos.col, pos.row, tc.tileW, tc.tileH);
    }
  }

  // ── Extract nature decoration sub-textures ──
  const natureTex = textures.nature;
  if (natureTex) {
    for (const [name, rect] of Object.entries(SPRITE_ATLAS.nature.regions)) {
      cache[`nature_${name}`] = extractRect(natureTex, rect.x, rect.y, rect.w, rect.h);
    }
  }

  initialized = true;
}

/**
 * Get a cached sub-texture by name.
 * @param {string} name
 * @returns {Texture|null}
 */
export function getTex(name) {
  return cache[name] || null;
}

/**
 * Get bonfire animation frame textures as an array.
 */
export function getBonfireFrames() {
  const frames = [];
  for (let i = 0; i < SPRITE_ATLAS.bonfire.frameCount; i++) {
    frames.push(cache[`bonfire_${i}`]);
  }
  return frames;
}

/**
 * Get fire animation frame textures as an array.
 */
export function getFireFrames() {
  const frames = [];
  for (let i = 0; i < SPRITE_ATLAS.fire.frameCount; i++) {
    frames.push(cache[`fire_${i}`]);
  }
  return frames;
}

// ── Internal helpers ──

function extractTile(baseTexture, col, row, tileW, tileH) {
  const frame = new Rectangle(col * tileW, row * tileH, tileW, tileH);
  return new Texture({ source: baseTexture.source, frame });
}

function extractRect(baseTexture, x, y, w, h) {
  const frame = new Rectangle(x, y, w, h);
  return new Texture({ source: baseTexture.source, frame });
}
