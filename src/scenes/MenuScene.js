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
  VIGNETTE_ALPHA,
  CORNER_LINE_WIDTH,
  CORNER_ALPHA,
  AMBER_HEX,
} from '../utils/constants.js';
import {
  createMenuBackgroundState,
  updateMenuBackground,
  drawMenuBackground,
} from '../systems/menuBackground.js';
import { createInputState, BUTTONS } from '../systems/input.js';

export default class MenuScene {
  constructor(app, onPlay) {
    this.app = app;
    this.onPlay = onPlay;
    this.container = new Container();
    this.elapsed = 0;
    this.inputState = null;
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

    // Scale font sizes relative to viewport
    const vmin = Math.min(width, height);
    const titleSize = Math.min(72, Math.max(36, vmin * 0.16));
    const subtitleSize = Math.min(14, Math.max(10, vmin * 0.035));
    const taglineSize = Math.min(16, Math.max(11, vmin * 0.04));
    const buttonW = Math.min(200, Math.max(140, width * 0.55));
    const buttonH = Math.min(48, Math.max(36, vmin * 0.1));
    const buttonFontSize = Math.min(20, Math.max(14, vmin * 0.05));
    const versionSize = Math.min(10, Math.max(8, vmin * 0.025));

    let cursorY = height * 0.22;

    // Subtitle: "Episode Earth"
    const subtitle = new Text({
      text: 'EPISODE EARTH',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: subtitleSize,
        fill: SUBTITLE_COLOR,
        letterSpacing: Math.max(3, subtitleSize * 0.5),
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

    cursorY += subtitleSize * 2.5;

    // Title: "Crawl Craft"
    const title = new Text({
      text: 'Crawl Craft',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: titleSize,
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

    cursorY += titleSize * 0.55 + 8;

    // Tagline
    const tagline = new Text({
      text: 'A World Reclaimed',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: taglineSize,
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
    const backdropPadX = 40;
    const backdropTop = subtitle.y - subtitleSize / 2 - 16;
    const backdropBottom = tagline.y + taglineSize / 2 + 16;
    const backdropHeight = backdropBottom - backdropTop;
    const backdropWidth = Math.max(titleSize * 4, width * 0.85) + backdropPadX * 2;
    const backdrop = new Graphics();
    backdrop.roundRect(
      cx - backdropWidth / 2, backdropTop,
      backdropWidth, backdropHeight, 12
    );
    backdrop.fill({ color: 0x000000, alpha: 0.45 });
    this.ui.addChildAt(backdrop, 0);

    cursorY += 50;

    // ── Play button ──
    this._createPlayButton(cx, cursorY, buttonW, buttonH, buttonFontSize);

    // ── Hint text under PLAY button ──
    const hintSize = Math.min(11, Math.max(8, vmin * 0.025));
    const hint = new Text({
      text: 'or press A to start',
      style: {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: hintSize,
        fill: AMBER_HEX,
        fontWeight: '400',
      },
    });
    hint.anchor.set(0.5);
    hint.x = cx;
    hint.y = cursorY + buttonH / 2 + 10;
    hint.alpha = 0.7;
    this.ui.addChild(hint);

    // ── Version tag ──
    const version = new Text({
      text: 'v0.1.0 — Alpha Build',
      style: {
        fontFamily: 'monospace',
        fontSize: versionSize,
        fill: VERSION_COLOR,
      },
    });
    version.anchor.set(0.5, 1);
    version.x = cx;
    version.y = height - 10;
    this.ui.addChild(version);

    // Draw initial frame
    drawMenuBackground(this.bgGfx, this.bgState, width, height, 0);

    // ── Input: A button (Z key) or touch A button starts the game ──
    this.inputState = createInputState();
    this._onKeyDown = this.inputState.onKeyDown;
    this._onKeyUp = this.inputState.onKeyUp;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    this._unsubA = this.inputState.onAction(BUTTONS.A, () => {
      if (this.onPlay) this.onPlay();
    });
  }

  _createPlayButton(cx, cy, btnW, btnH, fontSize) {
    const btn = new Container();
    btn.x = cx;
    btn.y = cy;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const RADIUS = 6;

    // Button shadow
    const shadow = new Graphics();
    shadow.roundRect(-btnW / 2 + 3, -btnH / 2 + 4, btnW, btnH, RADIUS);
    shadow.fill({ color: 0x000000, alpha: 0.5 });
    btn.addChild(shadow);

    const bg = new Graphics();
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, RADIUS);
    bg.fill({ color: BUTTON_BG });
    btn.addChild(bg);
    this.btnBg = bg;
    this._btnW = btnW;
    this._btnH = btnH;

    const label = new Text({
      text: 'PLAY',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: fontSize,
        fill: BUTTON_TEXT_COLOR,
        letterSpacing: 4,
        fontWeight: 'bold',
      },
    });
    label.anchor.set(0.5);
    btn.addChild(label);

    btn.on('pointerenter', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, RADIUS);
      bg.fill({ color: BUTTON_HOVER_BG });
      btn.scale.set(1.05);
    });

    btn.on('pointerleave', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, RADIUS);
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
    edgeGfx.rect(0, 0, w, h * 0.12).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.7 });
    edgeGfx.rect(0, h * 0.88, w, h * 0.12).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.7 });
    edgeGfx.rect(0, 0, w * 0.1, h).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.5 });
    edgeGfx.rect(w * 0.9, 0, w * 0.1, h).fill({ color: 0x000000, alpha: VIGNETTE_ALPHA * 0.5 });
    this.container.addChild(edgeGfx);
  }

  _drawCorners(w, h) {
    const gfx = new Graphics();
    gfx.alpha = CORNER_ALPHA;
    const m = Math.min(16, w * 0.04);
    const l = Math.min(40, w * 0.1);
    const lw = CORNER_LINE_WIDTH;

    gfx.moveTo(m, m + l).lineTo(m, m).lineTo(m + l, m)
      .stroke({ color: CORNER_COLOR, width: lw });
    gfx.moveTo(w - m - l, m).lineTo(w - m, m).lineTo(w - m, m + l)
      .stroke({ color: CORNER_COLOR, width: lw });
    gfx.moveTo(m, h - m - l).lineTo(m, h - m).lineTo(m + l, h - m)
      .stroke({ color: CORNER_COLOR, width: lw });
    gfx.moveTo(w - m - l, h - m).lineTo(w - m, h - m).lineTo(w - m, h - m - l)
      .stroke({ color: CORNER_COLOR, width: lw });

    this.container.addChild(gfx);
  }

  update(deltaSeconds) {
    this.elapsed += deltaSeconds;
    const { width, height } = this.app.screen;

    updateMenuBackground(this.bgState, width, height, this.elapsed, deltaSeconds);
    drawMenuBackground(this.bgGfx, this.bgState, width, height, this.elapsed);

    if (this.titleText) {
      this.titleText.alpha = 0.9 + 0.1 * Math.sin(this.elapsed * 1.5);
    }
  }

  destroy() {
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
    if (this._unsubA) this._unsubA();
    if (this.inputState) this.inputState.destroy();
    this.container.destroy({ children: true });
  }
}
