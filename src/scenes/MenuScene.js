import { Container, Graphics, Text } from 'pixi.js';
import {
  BG_COLOR,
  AMBER_HEX,
  TOXIC_GREEN_HEX,
  TITLE_COLOR,
  SUBTITLE_COLOR,
  TAGLINE_COLOR,
  VERSION_COLOR,
  BUTTON_BG,
  BUTTON_TEXT_COLOR,
  BUTTON_HOVER_BG,
  CORNER_COLOR,
  TITLE_FONT_SIZE,
  SUBTITLE_FONT_SIZE,
  SUBTITLE_LETTER_SPACING,
  TAGLINE_FONT_SIZE,
  BUTTON_WIDTH,
  BUTTON_HEIGHT,
  BUTTON_RADIUS,
  BUTTON_FONT_SIZE,
  VERSION_FONT_SIZE,
  VIGNETTE_ALPHA,
  GRAIN_ALPHA,
  CORNER_LINE_LENGTH,
  CORNER_LINE_WIDTH,
  CORNER_MARGIN,
  CORNER_ALPHA,
} from '../utils/constants.js';
import { createTileGridState, updateTileGrid, drawTileGrid } from '../systems/tileGrid.js';
import { createParticleState, updateParticles } from '../systems/particles.js';

export default class MenuScene {
  constructor(app, onPlay) {
    this.app = app;
    this.onPlay = onPlay;
    this.container = new Container();
    this.elapsed = 0;
  }

  init() {
    const { width, height } = this.app.screen;
    this.app.renderer.background.color = BG_COLOR;
    this.app.stage.addChild(this.container);

    // ── Tile grid layer ──
    this.gridGfx = new Graphics();
    this.container.addChild(this.gridGfx);
    this.tileState = createTileGridState();

    // ── Particle layer ──
    this.particleGfx = new Graphics();
    this.container.addChild(this.particleGfx);
    this.particleState = createParticleState(width, height);

    // ── Vignette overlay ──
    this._drawVignette(width, height);

    // ── Grain overlay ──
    this.grainGfx = new Graphics();
    this.container.addChild(this.grainGfx);
    this._drawGrain(width, height);

    // ── Corner decorations ──
    this._drawCorners(width, height);

    // ── UI container (centered) ──
    this.ui = new Container();
    this.container.addChild(this.ui);

    const cx = width / 2;
    let cursorY = height * 0.28;

    // Subtitle: "Episode Earth"
    const subtitle = new Text({
      text: 'EPISODE EARTH',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: SUBTITLE_FONT_SIZE,
        fill: SUBTITLE_COLOR,
        letterSpacing: SUBTITLE_LETTER_SPACING,
        fontWeight: '600',
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.x = cx;
    subtitle.y = cursorY;
    this.ui.addChild(subtitle);

    cursorY += 40;

    // Title: "Crawl Craft"
    const title = new Text({
      text: 'Crawl Craft',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: TITLE_FONT_SIZE,
        fill: TITLE_COLOR,
        dropShadow: {
          color: '#000000',
          blur: 8,
          distance: 3,
          angle: Math.PI / 4,
          alpha: 0.6,
        },
      },
    });
    title.anchor.set(0.5);
    title.x = cx;
    title.y = cursorY;
    this.titleText = title;
    this.ui.addChild(title);

    cursorY += TITLE_FONT_SIZE * 0.6 + 12;

    // Tagline
    const tagline = new Text({
      text: 'A World Reclaimed',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: TAGLINE_FONT_SIZE,
        fill: TAGLINE_COLOR,
        fontStyle: 'italic',
      },
    });
    tagline.anchor.set(0.5);
    tagline.x = cx;
    tagline.y = cursorY;
    this.ui.addChild(tagline);

    cursorY += 70;

    // ── Play button ──
    this._createPlayButton(cx, cursorY);

    // ── Version tag ──
    const version = new Text({
      text: 'v0.1.0 — Alpha Build',
      style: {
        fontFamily: 'monospace',
        fontSize: VERSION_FONT_SIZE,
        fill: VERSION_COLOR,
      },
    });
    version.anchor.set(0.5, 1);
    version.x = cx;
    version.y = height - 18;
    this.ui.addChild(version);

    // Draw initial frame
    drawTileGrid(this.gridGfx, this.tileState, width, height);
    this._drawParticles();
  }

  _createPlayButton(cx, cy) {
    const btn = new Container();
    btn.x = cx;
    btn.y = cy;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_RADIUS);
    bg.fill({ color: BUTTON_BG });
    btn.addChild(bg);
    this.btnBg = bg;

    const label = new Text({
      text: 'PLAY',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: BUTTON_FONT_SIZE,
        fill: BUTTON_TEXT_COLOR,
        letterSpacing: 4,
        fontWeight: 'bold',
      },
    });
    label.anchor.set(0.5);
    btn.addChild(label);

    btn.on('pointerenter', () => {
      bg.clear();
      bg.roundRect(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_RADIUS);
      bg.fill({ color: BUTTON_HOVER_BG });
      btn.scale.set(1.05);
    });

    btn.on('pointerleave', () => {
      bg.clear();
      bg.roundRect(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_RADIUS);
      bg.fill({ color: BUTTON_BG });
      btn.scale.set(1.0);
    });

    btn.on('pointerdown', () => {
      if (this.onPlay) this.onPlay();
    });

    this.ui.addChild(btn);
  }

  _drawVignette(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${VIGNETTE_ALPHA})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const gfx = new Graphics();
    const texture = this.app.renderer.generateTexture({
      target: (() => {
        const sprite = new Graphics();
        sprite.rect(0, 0, 1, 1).fill({ color: 0x000000 });
        return sprite;
      })(),
    });

    // Use a simple darkened rectangle approach for vignette
    const vignetteContainer = new Container();
    // Top-left corner shadow
    const corners = [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: 0, y: h },
      { x: w, y: h },
    ];

    const vigGfx = new Graphics();
    vigGfx.rect(0, 0, w, h);
    vigGfx.fill({ color: 0x000000 });
    vigGfx.alpha = VIGNETTE_ALPHA;

    // Create a circular mask to cut out the center
    const maskGfx = new Graphics();
    maskGfx.ellipse(w / 2, h / 2, w * 0.55, h * 0.6);
    maskGfx.fill({ color: 0xffffff });

    // Instead of complex masking, use a simpler approach with corner gradients
    // Just add semi-transparent edges
    const edgeGfx = new Graphics();

    // Top edge
    edgeGfx.rect(0, 0, w, h * 0.15).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.7 });
    // Bottom edge
    edgeGfx.rect(0, h * 0.85, w, h * 0.15).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.7 });
    // Left edge
    edgeGfx.rect(0, 0, w * 0.12, h).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.5 });
    // Right edge
    edgeGfx.rect(w * 0.88, 0, w * 0.12, h).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.5 });

    this.container.addChild(edgeGfx);
  }

  _drawGrain(w, h) {
    // Procedural noise via small random dots
    const gfx = this.grainGfx;
    gfx.clear();
    const step = 4;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (Math.random() < 0.35) {
          const brightness = Math.random() < 0.5 ? 0x000000 : 0xffffff;
          gfx.rect(x, y, step, step).fill({ color: brightness, alpha: GRAIN_ALPHA * Math.random() });
        }
      }
    }
  }

  _drawCorners(w, h) {
    const gfx = new Graphics();
    gfx.alpha = CORNER_ALPHA;
    const m = CORNER_MARGIN;
    const l = CORNER_LINE_LENGTH;
    const lw = CORNER_LINE_WIDTH;

    // Top-left
    gfx.moveTo(m, m + l).lineTo(m, m).lineTo(m + l, m)
      .stroke({ color: CORNER_COLOR, width: lw });

    // Top-right
    gfx.moveTo(w - m - l, m).lineTo(w - m, m).lineTo(w - m, m + l)
      .stroke({ color: CORNER_COLOR, width: lw });

    // Bottom-left
    gfx.moveTo(m, h - m - l).lineTo(m, h - m).lineTo(m + l, h - m)
      .stroke({ color: CORNER_COLOR, width: lw });

    // Bottom-right
    gfx.moveTo(w - m - l, h - m).lineTo(w - m, h - m).lineTo(w - m, h - m - l)
      .stroke({ color: CORNER_COLOR, width: lw });

    this.container.addChild(gfx);
  }

  _drawParticles() {
    const gfx = this.particleGfx;
    gfx.clear();
    for (const p of this.particleState.particles) {
      gfx.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: p.alpha });
    }
  }

  update(deltaSeconds) {
    this.elapsed += deltaSeconds;
    const { width, height } = this.app.screen;

    // Animate tile grid
    updateTileGrid(this.tileState, deltaSeconds);
    drawTileGrid(this.gridGfx, this.tileState, width, height);

    // Animate particles
    updateParticles(this.particleState, width, height, this.elapsed, deltaSeconds);
    this._drawParticles();

    // Subtle title pulse
    if (this.titleText) {
      this.titleText.alpha = 0.9 + 0.1 * Math.sin(this.elapsed * 1.5);
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
