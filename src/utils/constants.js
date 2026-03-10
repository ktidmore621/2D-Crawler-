// ── Display ──────────────────────────────────────────
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// ── Palette ──────────────────────────────────────────
export const BG_COLOR = 0x0a0805;
export const AMBER = 0xc07a2a;
export const AMBER_HEX = '#c07a2a';
export const TOXIC_GREEN = 0x7ab86e;
export const TOXIC_GREEN_HEX = '#7ab86e';
export const TITLE_COLOR = '#e8d5b0';
export const SUBTITLE_COLOR = '#c07a2a';
export const TAGLINE_COLOR = '#8a7a60';
export const VERSION_COLOR = '#5a5040';
export const BUTTON_BG = 0xc07a2a;
export const BUTTON_TEXT_COLOR = '#0a0805';
export const BUTTON_HOVER_BG = 0xd4922e;
export const CORNER_COLOR = 0xc07a2a;

// ── Tile Grid ────────────────────────────────────────
export const TILE_SIZE = 64;
export const TILE_LINE_COLOR = 0x1a1510;
export const TILE_LINE_ALPHA = 0.35;
export const TILE_SCROLL_SPEED = 12; // px per second

// ── Particles ────────────────────────────────────────
export const PARTICLE_COUNT = 60;
export const PARTICLE_MIN_SIZE = 1;
export const PARTICLE_MAX_SIZE = 3.5;
export const PARTICLE_MIN_SPEED = 15; // px/s upward
export const PARTICLE_MAX_SPEED = 45;
export const PARTICLE_MIN_ALPHA = 0.15;
export const PARTICLE_MAX_ALPHA = 0.7;
export const PARTICLE_DRIFT_STRENGTH = 20; // horizontal sway px/s

// ── Vignette / Grain ────────────────────────────────
export const VIGNETTE_ALPHA = 0.55;
export const GRAIN_ALPHA = 0.06;

// ── Corner Decorations ──────────────────────────────
export const CORNER_LINE_LENGTH = 60;
export const CORNER_LINE_WIDTH = 1.5;
export const CORNER_MARGIN = 24;
export const CORNER_ALPHA = 0.5;

// ── Menu Layout ─────────────────────────────────────
export const TITLE_FONT_SIZE = 96;
export const SUBTITLE_FONT_SIZE = 16;
export const SUBTITLE_LETTER_SPACING = 8;
export const TAGLINE_FONT_SIZE = 18;
export const BUTTON_WIDTH = 220;
export const BUTTON_HEIGHT = 56;
export const BUTTON_RADIUS = 6;
export const BUTTON_FONT_SIZE = 22;
export const VERSION_FONT_SIZE = 12;

// ── Menu Background Scene ──────────────────────────
export const MENU_SKY_COLOR_TOP = 0x060e08;       // very dark night sky
export const MENU_SKY_COLOR_MID = 0x0c1e14;       // dark green-navy
export const MENU_AURORA_COLOR = 0x22aa44;         // bright green aurora
export const MENU_AURORA_COLOR_2 = 0x116633;       // secondary aurora
export const MENU_GRASS_COLOR = 0x2a5a2a;          // rich dark green grass
export const MENU_GRASS_COLOR_LIGHT = 0x3a7a3a;    // lighter grass patches
export const MENU_PATH_COLOR = 0xb06e30;           // warm orange-brown dirt
export const MENU_PATH_COLOR_DARK = 0x7a4a1a;      // darker path edges
export const MENU_PATH_WIDTH = 70;                 // dirt path width in px
export const MENU_TREE_DARK = 0x1a3a1a;            // dark tree foliage
export const MENU_TREE_MID = 0x2a5a2a;             // mid tree foliage
export const MENU_TREE_TRUNK = 0x3a2a1a;           // tree trunk brown
export const MENU_MOUNTAIN_FAR = 0x0a1a2a;         // distant mountains (blue)
export const MENU_MOUNTAIN_NEAR = 0x122a1a;        // near mountains (green-dark)
export const MENU_STAR_COUNT = 25;
export const MENU_STAR_COLOR = 0xeedd88;           // warm golden stars
export const MENU_STAR_TWINKLE_SPEED = 1.2;        // radians/s

// ── Green Fire ─────────────────────────────────────
export const FIRE_BASE_X_RATIO = 0.5;              // centered horizontally
export const FIRE_BASE_Y_RATIO = 0.72;             // slightly higher
export const FIRE_WIDTH = 50;                       // wider fire
export const FIRE_HEIGHT = 100;                     // taller fire
export const FIRE_PULSE_SPEED = 3.5;               // radians/s
export const FIRE_COLORS = [0x0a5a1a, 0x1a8a2a, 0x3acc3a, 0x66ff33, 0xaaff66, 0xeeffaa];
export const FIRE_GLOW_COLOR = 0x33cc33;            // brighter green glow
export const FIRE_GLOW_RADIUS = 140;
export const FIRE_RING_COLOR = 0x44ff44;            // magic circle rings
export const FIRE_RING_COUNT = 3;

// ── Ember Particles ────────────────────────────────
export const EMBER_COUNT = 45;
export const EMBER_MIN_SIZE = 1;
export const EMBER_MAX_SIZE = 3.5;
export const EMBER_MIN_SPEED = 25;                  // px/s upward
export const EMBER_MAX_SPEED = 70;
export const EMBER_SPREAD = 60;                     // horizontal spread from fire
export const EMBER_COLORS = [0x66ff33, 0x88ff44, 0xccff66, 0xffff88, 0xffffcc];
