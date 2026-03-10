import { Container, Graphics, Text } from 'pixi.js';
import {
  BG_COLOR,
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
  CORNER_LINE_LENGTH,
  CORNER_LINE_WIDTH,
  CORNER_MARGIN,
  CORNER_ALPHA,
} from '../utils/constants.js';
import {
  createMenuBackgroundState,
  updateMenuBackground,
  drawMenuBackground,
} from '../systems/menuBackground.js';

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

    // ── Animated background layer ──
    this.bgGfx = new Graphics();
    this.container.addChild(this.bgGfx);
    this.bgState = createMenuBackgroundState(width, height);

    // ── Vignette overlay ──
    this._drawVignette(width, height);

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
        dropShadow: {
          color: '#000000',
          blur: 6,
          distance: 2,
          angle: Math.PI / 4,
          alpha: 0.8,
        },
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
          blur: 16,
          distance: 4,
          angle: Math.PI / 4,
          alpha: 0.9,
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
        dropShadow: {
          color: '#000000',
          blur: 6,
          distance: 2,
          angle: Math.PI / 4,
          alpha: 0.8,
        },
      },
    });
    tagline.anchor.set(0.5);
    tagline.x = cx;
    tagline.y = cursorY;
    this.ui.addChild(tagline);

    // ── Dark backdrop pill behind title block ──
    const backdropPadX = 60;
    const backdropTop = subtitle.y - SUBTITLE_FONT_SIZE / 2 - 20;
    const backdropBottom = tagline.y + TAGLINE_FONT_SIZE / 2 + 20;
    const backdropHeight = backdropBottom - backdropTop;
    const backdropWidth = Math.max(TITLE_FONT_SIZE * 5, 400) + backdropPadX * 2;
    const backdrop = new Graphics();
    backdrop.roundRect(
      cx - backdropWidth / 2, backdropTop,
      backdropWidth, backdropHeight, 16
    );
    backdrop.fill({ color: 0x000000, alpha: 0.45 });
    // Insert behind the text children
    this.ui.addChildAt(backdrop, 0);

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
    drawMenuBackground(this.bgGfx, this.bgState, width, height, 0);
  }

  _createPlayButton(cx, cy) {
    const btn = new Container();
    btn.x = cx;
    btn.y = cy;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    // Button shadow
    const shadow = new Graphics();
    shadow.roundRect(-BUTTON_WIDTH / 2 + 3, -BUTTON_HEIGHT / 2 + 4, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_RADIUS);
    shadow.fill({ color: 0x000000, alpha: 0.5 });
    btn.addChild(shadow);

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

  update(deltaSeconds) {
    this.elapsed += deltaSeconds;
    const { width, height } = this.app.screen;

    // Animate background scene
    updateMenuBackground(this.bgState, width, height, this.elapsed, deltaSeconds);
    drawMenuBackground(this.bgGfx, this.bgState, width, height, this.elapsed);

    // Subtle title pulse
    if (this.titleText) {
      this.titleText.alpha = 0.9 + 0.1 * Math.sin(this.elapsed * 1.5);
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
