// ── Display ──────────────────────────────────────────
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// ── Game Boy Device Layout ───────────────────────────
export const VIEWPORT_HEIGHT_PERCENT = 0.70;
export const CONTROLS_HEIGHT_PERCENT = 0.30;
export const MAX_DEVICE_WIDTH = 430;

// ── Palette ──────────────────────────────────────────
export const BG_COLOR = 0x2e3828;
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

// ── Sprite / Player ─────────────────────────────────
export const SPRITE_FRAME_WIDTH = 48;
export const SPRITE_FRAME_HEIGHT = 64;
export const PLAYER_SPEED = 260;               // px per second
export const PLAYER_ANIM_SPEED = 0.15;         // frames per tick for AnimatedSprite
export const PLAYER_SCALE = 1.875;             // scale up 48×64 sprites (reduced 25%)
export const PLAYER_NAME_FONT_SIZE = 12;
export const PLAYER_NAME_OFFSET_Y = -10;       // px above sprite anchor

// ── Character Types ─────────────────────────────────
export const CHARACTER_TYPES = ['male', 'female', 'androgynous'];
export const CHARACTER_LABELS = {
  male: 'MALE SURVIVOR',
  female: 'FEMALE SURVIVOR',
  androgynous: 'WANDERER',
};

// ── Character Select Scene ──────────────────────────
export const CHAR_CARD_WIDTH = 200;
export const CHAR_CARD_HEIGHT = 280;
export const CHAR_CARD_GAP = 40;
export const CHAR_CARD_BG = 0x1a1510;
export const CHAR_CARD_BORDER = 0x3a3020;
export const CHAR_CARD_SELECTED_BORDER = 0xc07a2a;
export const CHAR_CARD_BORDER_WIDTH = 2;
export const CHAR_SELECT_TITLE_SIZE = 36;
export const CHAR_LABEL_FONT_SIZE = 14;
export const CHAR_INPUT_WIDTH = 160;
export const CHAR_INPUT_HEIGHT = 30;
export const CHAR_PREVIEW_SCALE = 3;

// ── Mobile Character Select ────────────────────────
export const CHAR_CARD_MIN_WIDTH = 90;
export const CHAR_CARD_MIN_HEIGHT = 160;
export const CHAR_CARD_MIN_GAP = 8;
export const CHAR_CARD_MOBILE_PREVIEW_SCALE = 1.5;
export const CHAR_LABEL_MOBILE_FONT_SIZE = 10;
export const CHAR_SELECT_MOBILE_TITLE_SIZE = 22;
export const CHAR_INPUT_MOBILE_WIDTH = 80;
export const CHAR_INPUT_MOBILE_HEIGHT = 22;
export const PORTRAIT_HINT_THRESHOLD = 500;

// ── D-Pad (Control Panel) ────────────────────────────
export const DPAD_BUTTON_SIZE = 52;
export const DPAD_MARGIN = 20;
export const DPAD_ALPHA = 0.35;
export const DPAD_PRESSED_ALPHA = 0.6;
export const DPAD_COLOR = 0xffffff;
export const DPAD_BG_COLOR = 0x000000;
export const DPAD_BG_ALPHA = 0.2;

// ── Action Buttons (Control Panel) ───────────────────
export const ACTION_BUTTON_SIZE = 52;

// ── Named Button Mapping ────────────────────────────
export const BUTTON_A = 'attack';   // right — confirm / attack
export const BUTTON_B = 'roll';     // bottom — cancel / roll
export const BUTTON_X = 'hotbar';   // left — hotbar
export const BUTTON_Y = 'map';      // top — map

// ── Overworld Map ───────────────────────────────────
export const WORLD_TILE_SIZE = 48;
export const WORLD_COLS = 80;
export const WORLD_ROWS = 80;
export const WORLD_WIDTH = WORLD_COLS * WORLD_TILE_SIZE;   // 3840
export const WORLD_HEIGHT = WORLD_ROWS * WORLD_TILE_SIZE;  // 3840
export const TILE_BUFFER = 2; // extra tiles rendered beyond viewport

// ── Tile Type IDs ───────────────────────────────────
export const TILE_GRASS = 0;
export const TILE_DIRT = 1;
export const TILE_TREE = 2;
export const TILE_BUSH = 3;
export const TILE_RUIN_FLOOR = 4;
export const TILE_RUIN_WALL = 5;
export const TILE_RIVER = 6;
export const TILE_ALIEN = 7;
export const TILE_BASE_FLOOR = 8;

// ── Tile Colors ─────────────────────────────────────
export const GRASS_COLORS = [0x6a9a42, 0x729e48, 0x5e8e38];
export const DIRT_COLORS = [0xb8925e, 0xc49a66, 0xaa8452];
export const TREE_TRUNK_COLOR = 0x1a3310;
export const TREE_CANOPY_COLOR = 0x2d5e18;
export const BUSH_COLOR = 0x489228;
export const RUIN_FLOOR_COLOR = 0x8a7a62;
export const RUIN_WALL_COLOR = 0x9a8a72;
export const RIVER_COLOR = 0x3a2e20;
export const RIVER_EDGE_COLOR = 0x5a4a32;
export const ALIEN_BASE_COLOR = 0x1a2a1a;
export const ALIEN_GLOW_COLOR = 0x00ff88;
export const BASE_FLOOR_COLOR = 0x8a7a62;

// ── Dungeon Entrance ────────────────────────────────
export const DUNGEON_STONE_COLOR = 0x2a2520;
export const DUNGEON_GLOW_COLOR = 0x00ff88;

// ── Prop Colors ─────────────────────────────────────
export const PROP_CAR_COLOR = 0x5a5248;
export const PROP_BARREL_COLOR = 0x9a6232;
export const PROP_POLE_COLOR = 0x8a7248;
export const PROP_DEBRIS_COLOR = 0x7a6a58;

// ── Tree Variants ───────────────────────────────────
export const TREE_PINE_COLOR = 0x3a8a20;
export const TREE_OAK_COLOR = 0x429828;
export const TREE_DEAD_COLOR = 0x6a5a42;
export const TREE_TRUNK_BROWN = 0x3a2a1a;

// ── Campfire (overworld) ────────────────────────────
export const CAMP_FIRE_COLORS = [0x0a5a1a, 0x1a8a2a, 0x3acc3a, 0x66ff33];
export const CAMP_GLOW_COLOR = 0x33cc33;
export const CAMP_GLOW_RADIUS = 80;
