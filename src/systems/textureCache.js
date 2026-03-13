/**
 * Texture cache — loads all sprite sheets at startup and extracts
 * sub-region Textures. Now includes isometric asset loading.
 */

import { Assets, Texture, Rectangle } from 'pixi.js';
import { SPRITE_ATLAS, getAllAssetPaths } from '../data/spriteAtlas.js';
import { ISO_ATLAS, WATER_ATLAS } from '../data/isoAtlas.js';

/** Cached sub-textures keyed by name */
const cache = {};

/** Isometric tile textures keyed by atlas group */
const isoTileCache = {};

/** Isometric prop textures keyed by prop name */
const isoPropCache = {};

/** Isometric building textures keyed by building name */
const isoBuildingCache = {};

/** Isometric cart textures keyed by cart name */
const isoCartCache = {};

/** Water tile textures */
const waterCache = {
  deep: [],     // 4 animation frames
  shallow: [],  // 4 animation frames
  shore: {},    // top, bottom, left, right
};

let initialized = false;

/**
 * Preload all sprite sheets and extract sub-textures.
 */
export async function initTextureCache(onProgress) {
  if (initialized) return;

  // ── Load original sprite assets (for character animations, etc.) ──
  const assets = getAllAssetPaths();
  Assets.addBundle('sprites', assets);
  const textures = await Assets.loadBundle('sprites', (p) => onProgress && onProgress(p * 0.4));

  // ── Extract character-related textures we still need ──
  _extractOriginalTextures(textures);

  // ── Load isometric assets ──
  Assets.addBundle('iso', [
    { alias: 'isoTiles',     src: ISO_ATLAS.tiles.path },
    { alias: 'isoProps',     src: ISO_ATLAS.props.path },
    { alias: 'isoBuildings', src: ISO_ATLAS.buildings.path },
    { alias: 'isoCarts',     src: ISO_ATLAS.carts.path },
  ]);
  const isoTextures = await Assets.loadBundle('iso', (p) => onProgress && onProgress(0.4 + p * 0.6));

  // ── Slice iso tile textures ──
  _sliceIsoTiles(isoTextures.isoTiles);

  // ── Slice iso prop textures ──
  _sliceIsoProps(isoTextures.isoProps);

  // ── Slice iso building textures ──
  _sliceIsoBuildings(isoTextures.isoBuildings);

  // ── Slice iso cart textures ──
  _sliceIsoCarts(isoTextures.isoCarts);

  // ── Load water tile textures (individual PNGs) ──
  const waterAssets = [];
  WATER_ATLAS.deep.forEach((src, i) => waterAssets.push({ alias: `waterDeep${i}`, src }));
  WATER_ATLAS.shallow.forEach((src, i) => waterAssets.push({ alias: `waterShallow${i}`, src }));
  Object.entries(WATER_ATLAS.shore).forEach(([dir, src]) => waterAssets.push({ alias: `waterShore_${dir}`, src }));
  Assets.addBundle('water', waterAssets);
  const waterTextures = await Assets.loadBundle('water');

  for (let i = 0; i < 4; i++) {
    waterCache.deep.push(waterTextures[`waterDeep${i}`]);
    waterCache.shallow.push(waterTextures[`waterShallow${i}`]);
  }
  for (const dir of ['top', 'bottom', 'left', 'right']) {
    waterCache.shore[dir] = waterTextures[`waterShore_${dir}`];
  }

  initialized = true;
}

function _extractOriginalTextures(textures) {
  // Extract bonfire frames (still used)
  const bonfireTex = textures.bonfire;
  if (bonfireTex) {
    const bf = SPRITE_ATLAS.bonfire;
    for (let i = 0; i < bf.frameCount; i++) {
      cache[`bonfire_${i}`] = extractRect(bonfireTex, i * bf.frameW, 0, bf.frameW, bf.frameH);
    }
  }

  // Extract fire frames
  const fireTex = textures.fire;
  if (fireTex) {
    const ff = SPRITE_ATLAS.fire;
    for (let i = 0; i < ff.frameCount; i++) {
      cache[`fire_${i}`] = extractRect(fireTex, i * ff.frameW, 0, ff.frameW, ff.frameH);
    }
  }
}

function _sliceIsoTiles(baseTex) {
  const cell = ISO_ATLAS.tiles.cellSize;
  const tileGroups = [
    'grass', 'dirt', 'stone', 'rock',
    'flatGrass', 'flatDirt', 'flatStone', 'flatMisc',
  ];

  for (const group of tileGroups) {
    const defs = ISO_ATLAS.tiles[group];
    if (!Array.isArray(defs)) continue;
    isoTileCache[group] = defs.map(d =>
      extractRect(baseTex, d.col * cell, d.row * cell, cell, cell)
    );
  }

  // Single ramp textures
  const rampKeys = [
    'rampN', 'rampS', 'rampE', 'rampW',
    'rampGrassN', 'rampGrassS', 'rampGrassE', 'rampGrassW',
    'rampStone1', 'rampStone2',
    'halfRampS', 'halfRampN', 'halfRampW', 'halfRampE',
    'halfRampS2', 'halfRampN2',
    'stairs1', 'stairs2', 'stairsStone1', 'stairsStone2',
  ];
  for (const key of rampKeys) {
    const d = ISO_ATLAS.tiles[key];
    if (d) {
      isoTileCache[key] = extractRect(baseTex, d.col * cell, d.row * cell, cell, cell);
    }
  }
}

function _sliceIsoProps(baseTex) {
  const propKeys = Object.keys(ISO_ATLAS.props).filter(k => k !== 'path' && k !== 'cellSize');
  for (const key of propKeys) {
    const d = ISO_ATLAS.props[key];
    isoPropCache[key] = extractRect(baseTex, d.x, d.y, d.w, d.h);
  }
}

function _sliceIsoBuildings(baseTex) {
  const keys = Object.keys(ISO_ATLAS.buildings).filter(k => k !== 'path' && k !== 'cellSize');
  for (const key of keys) {
    const d = ISO_ATLAS.buildings[key];
    isoBuildingCache[key] = extractRect(baseTex, d.x, d.y, d.w, d.h);
  }
}

function _sliceIsoCarts(baseTex) {
  const keys = Object.keys(ISO_ATLAS.carts).filter(k => k !== 'path' && k !== 'cellSize');
  for (const key of keys) {
    const d = ISO_ATLAS.carts[key];
    isoCartCache[key] = extractRect(baseTex, d.x, d.y, d.w, d.h);
  }
}

/**
 * Get a cached sub-texture by name (original assets).
 */
export function getTex(name) {
  return cache[name] || null;
}

/**
 * Get an isometric tile texture by group name and variant hash.
 */
export function getIsoTex(group, variantHash) {
  const arr = isoTileCache[group];
  if (!arr) return null;
  if (Array.isArray(arr)) {
    return arr[Math.abs(variantHash) % arr.length];
  }
  return arr; // single texture (ramps, etc.)
}

/**
 * Get an isometric prop texture by name.
 */
export function getIsoPropTex(name) {
  return isoPropCache[name] || isoCartCache[name] || null;
}

/**
 * Get an isometric building texture by name.
 */
export function getIsoBuildingTex(name) {
  return isoBuildingCache[name] || null;
}

/**
 * Get bonfire animation frame textures as an array.
 */
export function getBonfireFrames() {
  const frames = [];
  const bf = SPRITE_ATLAS.bonfire;
  for (let i = 0; i < bf.frameCount; i++) {
    const t = cache[`bonfire_${i}`];
    if (t) frames.push(t);
  }
  return frames;
}

/**
 * Get fire animation frame textures as an array.
 */
export function getFireFrames() {
  const frames = [];
  const ff = SPRITE_ATLAS.fire;
  for (let i = 0; i < ff.frameCount; i++) {
    const t = cache[`fire_${i}`];
    if (t) frames.push(t);
  }
  return frames;
}

/**
 * Get a water texture by type and frame/direction.
 * @param {'deep'|'shallow'} type
 * @param {number} frame - animation frame 0-3
 */
export function getWaterTex(type, frame) {
  return waterCache[type]?.[frame] || null;
}

/**
 * Get a shore transition texture by direction.
 * @param {'top'|'bottom'|'left'|'right'} direction
 */
export function getShoreTex(direction) {
  return waterCache.shore[direction] || null;
}

// ── Internal helpers ──

function extractRect(baseTexture, x, y, w, h) {
  const frame = new Rectangle(x, y, w, h);
  return new Texture({ source: baseTexture.source, frame });
}
