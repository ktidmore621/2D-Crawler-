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
export const MENU_SKY_COLOR_TOP = 0x0a1a12;      // deep dark green-navy
export const MENU_SKY_COLOR_MID = 0x0d2818;       // slightly lighter green
export const MENU_AURORA_COLOR = 0x1a6b3a;        // green aurora glow
export const MENU_GRASS_COLOR = 0x1a3a1a;         // dark green grass
export const MENU_PATH_COLOR = 0xa0622a;          // warm orange-brown dirt
export const MENU_PATH_WIDTH = 64;                // dirt path width in px
export const MENU_TREE_COLOR = 0x0d1a0d;          // dark silhouette trees
export const MENU_STAR_COUNT = 40;
export const MENU_STAR_COLOR = 0xccddcc;          // pale green-white stars
export const MENU_STAR_TWINKLE_SPEED = 1.5;       // radians/s

// ── Green Fire ─────────────────────────────────────
export const FIRE_BASE_X_RATIO = 0.5;             // centered horizontally
export const FIRE_BASE_Y_RATIO = 0.78;            // in lower portion
export const FIRE_WIDTH = 40;
export const FIRE_HEIGHT = 70;
export const FIRE_PULSE_SPEED = 4;                // radians/s
export const FIRE_COLORS = [0x1a6b2a, 0x2d9b3a, 0x4dcc4d, 0x7fff00, 0xccffcc];
export const FIRE_GLOW_COLOR = 0x3a6b2a;
export const FIRE_GLOW_RADIUS = 120;

// ── Ember Particles ────────────────────────────────
export const EMBER_COUNT = 35;
export const EMBER_MIN_SIZE = 1;
export const EMBER_MAX_SIZE = 3;
export const EMBER_MIN_SPEED = 20;                // px/s upward
export const EMBER_MAX_SPEED = 60;
export const EMBER_SPREAD = 80;                   // horizontal spread from fire
export const EMBER_COLORS = [0x7fff00, 0xaaff44, 0xffffaa, 0xffff66];
