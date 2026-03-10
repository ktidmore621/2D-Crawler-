import { Container, Graphics, Text, Assets } from 'pixi.js';
import {
  BG_COLOR,
  TITLE_COLOR,
  AMBER,
  AMBER_HEX,
  BUTTON_BG,
  BUTTON_TEXT_COLOR,
  BUTTON_HOVER_BG,
  BUTTON_RADIUS,
  CHARACTER_TYPES,
  CHARACTER_LABELS,
  CHAR_CARD_BG,
  CHAR_CARD_BORDER,
  CHAR_CARD_SELECTED_BORDER,
  CHAR_CARD_BORDER_WIDTH,
  PORTRAIT_HINT_THRESHOLD,
  PLAYER_ANIM_SPEED,
} from '../utils/constants.js';
import { loadAtlas, createAnimatedSprite } from '../systems/animation.js';

/**
 * Compute responsive layout values based on screen dimensions.
 * Mobile-first: everything scales with vw/vh/vmin equivalents.
 */
function computeLayout(w, h) {
  const vmin = Math.min(w, h);
  const isSmall = w < 600;

  // Cards always in a horizontal row — compute sizes to fit
  const cardGap = Math.max(8, vmin * 0.02);
  const availableWidth = w * 0.92; // 4% margin each side
  const totalGapWidth = cardGap * 2; // 2 gaps between 3 cards
  const cardWidth = Math.min(200, Math.max(90, (availableWidth - totalGapWidth) / 3));
  const cardHeight = Math.min(280, Math.max(140, cardWidth * 1.55));

  const titleSize = Math.min(36, Math.max(18, vmin * 0.06));
  const subtitleSize = Math.min(14, Math.max(9, vmin * 0.025));
  const labelSize = Math.min(14, Math.max(8, vmin * 0.025));
  const previewScale = Math.min(3, Math.max(1.2, cardWidth / 70));
  const inputWidth = Math.min(160, Math.max(70, cardWidth * 0.85));
  const inputHeight = Math.min(30, Math.max(20, vmin * 0.04));
  const inputFontSize = Math.min(14, Math.max(10, vmin * 0.025));

  const buttonWidth = Math.min(220, Math.max(120, w * 0.35));
  const buttonHeight = Math.min(56, Math.max(36, vmin * 0.08));
  const buttonFontSize = Math.min(22, Math.max(14, vmin * 0.04));

  // Vertical layout
  const titleY = Math.max(20, h * 0.05);
  const subtitleY = titleY + titleSize * 0.9;
  const cardTopY = subtitleY + subtitleSize + Math.max(8, h * 0.02);
  const buttonY = h - buttonHeight / 2 - Math.max(12, h * 0.03);

  // Portrait hint
  const showPortraitHint = w < PORTRAIT_HINT_THRESHOLD && h > w;

  return {
    cardWidth, cardHeight, cardGap,
    titleSize, subtitleSize, labelSize,
    previewScale, inputWidth, inputHeight, inputFontSize,
    buttonWidth, buttonHeight, buttonFontSize,
    titleY, subtitleY, cardTopY, buttonY,
    showPortraitHint, isSmall,
  };
}

export default class CharSelectScene {
  /**
   * @param {import('pixi.js').Application} app
   * @param {(type: string, name: string) => void} onBegin
   */
  constructor(app, onBegin) {
    this.app = app;
    this.onBegin = onBegin;
    this.container = new Container();
    this.selectedType = null;
    this.names = {};
    this.cards = {};
    this.inputEls = [];
    this.beginBtn = null;
    this.beginBtnBg = null;
    this.elapsed = 0;
    this._positionCallbacks = [];
    this._hintEl = null;
    this._resizeHandler = null;
  }

  async init() {
    const { width, height } = this.app.screen;
    this.app.renderer.background.color = BG_COLOR;
    this.app.stage.addChild(this.container);

    this.layout = computeLayout(width, height);
    await this._buildUI();

    // Listen for resize to rebuild layout
    this._resizeHandler = () => this._onResize();
    window.addEventListener('resize', this._resizeHandler);
  }

  async _buildUI() {
    const { width, height } = this.app.screen;
    const L = this.layout;

    // ── Title ──
    this.titleText = new Text({
      text: 'Crawl Craft',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: L.titleSize,
        fill: TITLE_COLOR,
        dropShadow: { color: '#000000', blur: 8, distance: 2, angle: Math.PI / 4, alpha: 0.8 },
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.x = width / 2;
    this.titleText.y = L.titleY;
    this.container.addChild(this.titleText);

    this.subtitleText = new Text({
      text: 'CHOOSE YOUR SURVIVOR',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: L.subtitleSize,
        fill: AMBER_HEX,
        letterSpacing: Math.max(2, L.subtitleSize * 0.4),
      },
    });
    this.subtitleText.anchor.set(0.5);
    this.subtitleText.x = width / 2;
    this.subtitleText.y = L.subtitleY;
    this.container.addChild(this.subtitleText);

    // ── Character cards (always horizontal row) ──
    const totalWidth = CHARACTER_TYPES.length * L.cardWidth + (CHARACTER_TYPES.length - 1) * L.cardGap;
    const startX = (width - totalWidth) / 2;

    for (let i = 0; i < CHARACTER_TYPES.length; i++) {
      const type = CHARACTER_TYPES[i];
      const cx = startX + i * (L.cardWidth + L.cardGap) + L.cardWidth / 2;
      await this._createCard(type, cx, L.cardTopY, L);
    }

    // ── BEGIN button ──
    this._createBeginButton(width / 2, L.buttonY, L);
    this._updateBeginState();

    // ── Portrait rotation hint (DOM overlay) ──
    this._updatePortraitHint();
  }

  async _createCard(type, cx, top, L) {
    const cardContainer = new Container();
    cardContainer.x = cx;
    cardContainer.y = top;
    this.container.addChild(cardContainer);

    // Card background
    const bg = new Graphics();
    bg.roundRect(-L.cardWidth / 2, 0, L.cardWidth, L.cardHeight, 6);
    bg.fill({ color: CHAR_CARD_BG });
    bg.stroke({ color: CHAR_CARD_BORDER, width: CHAR_CARD_BORDER_WIDTH });
    cardContainer.addChild(bg);

    cardContainer.eventMode = 'static';
    cardContainer.cursor = 'pointer';

    // ── Idle animation preview ──
    const idleSheet = await loadAtlas(type, 'idle');
    const textures = idleSheet.animations['idle_down'];
    const preview = createAnimatedSprite(textures);
    preview.scale.set(L.previewScale);
    preview.anchor.set(0.5, 0.5);
    preview.y = L.cardHeight * 0.35;
    cardContainer.addChild(preview);

    // ── Label ──
    const label = new Text({
      text: CHARACTER_LABELS[type],
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: L.labelSize,
        fill: TITLE_COLOR,
        letterSpacing: 1,
      },
    });
    label.anchor.set(0.5);
    label.y = L.cardHeight * 0.65;
    cardContainer.addChild(label);

    // ── Name input (HTML overlay) ──
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Name...';
    input.maxLength = 16;
    Object.assign(input.style, {
      position: 'absolute',
      width: `${L.inputWidth}px`,
      height: `${L.inputHeight}px`,
      background: '#0a0805',
      border: `1px solid ${AMBER_HEX}`,
      borderRadius: '4px',
      color: '#e8d5b0',
      fontFamily: 'Pirata One, serif',
      fontSize: `${L.inputFontSize}px`,
      textAlign: 'center',
      outline: 'none',
      padding: '0 4px',
      zIndex: '10',
    });
    input.addEventListener('input', () => {
      this.names[type] = input.value.trim();
      this._updateBeginState();
    });
    input.addEventListener('keydown', (e) => e.stopPropagation());
    input.addEventListener('keyup', (e) => e.stopPropagation());
    document.body.appendChild(input);
    this.inputEls.push(input);

    // Position callback for input overlay
    const positionInput = () => {
      const canvas = this.app.canvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / this.app.screen.width;
      const scaleY = rect.height / this.app.screen.height;
      const worldX = cardContainer.x - L.inputWidth / 2;
      const worldY = cardContainer.y + L.cardHeight * 0.75;
      input.style.left = `${rect.left + worldX * scaleX}px`;
      input.style.top = `${rect.top + worldY * scaleY}px`;
      input.style.transform = `scale(${scaleX}, ${scaleY})`;
      input.style.transformOrigin = 'top left';
    };
    this._positionCallbacks.push(positionInput);
    positionInput();

    // ── Selection handling ──
    const borderGfx = new Graphics();
    cardContainer.addChildAt(borderGfx, 0);

    this.cards[type] = { container: cardContainer, bg, borderGfx, preview, label, L };

    cardContainer.on('pointerdown', () => {
      this.selectedType = type;
      this._updateSelection();
      this._updateBeginState();
    });
  }

  _updateSelection() {
    for (const [type, card] of Object.entries(this.cards)) {
      const isSelected = type === this.selectedType;
      const cL = card.L;
      card.bg.clear();
      card.bg.roundRect(-cL.cardWidth / 2, 0, cL.cardWidth, cL.cardHeight, 6);
      card.bg.fill({ color: CHAR_CARD_BG });
      card.bg.stroke({
        color: isSelected ? CHAR_CARD_SELECTED_BORDER : CHAR_CARD_BORDER,
        width: isSelected ? 3 : CHAR_CARD_BORDER_WIDTH,
      });

      card.borderGfx.clear();
      if (isSelected) {
        card.borderGfx.roundRect(
          -cL.cardWidth / 2 - 4, -4,
          cL.cardWidth + 8, cL.cardHeight + 8, 8
        );
        card.borderGfx.stroke({ color: CHAR_CARD_SELECTED_BORDER, width: 2, alpha: 0.4 });
      }
    }
  }

  _createBeginButton(cx, cy, L) {
    const btn = new Container();
    btn.x = cx;
    btn.y = cy;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-L.buttonWidth / 2, -L.buttonHeight / 2, L.buttonWidth, L.buttonHeight, BUTTON_RADIUS);
    bg.fill({ color: BUTTON_BG });
    btn.addChild(bg);
    this.beginBtnBg = bg;
    this._beginBtnLayout = L;

    const label = new Text({
      text: 'BEGIN',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: L.buttonFontSize,
        fill: BUTTON_TEXT_COLOR,
        letterSpacing: 4,
        fontWeight: 'bold',
      },
    });
    label.anchor.set(0.5);
    btn.addChild(label);
    this.beginLabel = label;

    btn.on('pointerenter', () => {
      if (!this._beginEnabled) return;
      bg.clear();
      bg.roundRect(-L.buttonWidth / 2, -L.buttonHeight / 2, L.buttonWidth, L.buttonHeight, BUTTON_RADIUS);
      bg.fill({ color: BUTTON_HOVER_BG });
      btn.scale.set(1.05);
    });

    btn.on('pointerleave', () => {
      this._redrawBeginBg();
      btn.scale.set(1.0);
    });

    btn.on('pointerdown', () => {
      if (!this._beginEnabled) return;
      const name = this.names[this.selectedType];
      if (this.onBegin) this.onBegin(this.selectedType, name);
    });

    this.container.addChild(btn);
    this.beginBtn = btn;
  }

  _updateBeginState() {
    const hasSelection = !!this.selectedType;
    const hasName = hasSelection && this.names[this.selectedType]?.length > 0;
    this._beginEnabled = hasSelection && hasName;
    this._redrawBeginBg();
  }

  _redrawBeginBg() {
    const bg = this.beginBtnBg;
    const L = this._beginBtnLayout;
    bg.clear();
    bg.roundRect(-L.buttonWidth / 2, -L.buttonHeight / 2, L.buttonWidth, L.buttonHeight, BUTTON_RADIUS);
    if (this._beginEnabled) {
      bg.fill({ color: BUTTON_BG });
    } else {
      bg.fill({ color: BUTTON_BG, alpha: 0.3 });
    }
  }

  _updatePortraitHint() {
    const { width, height } = this.app.screen;
    const showHint = width < PORTRAIT_HINT_THRESHOLD && height > width;

    if (showHint && !this._hintEl) {
      const hint = document.createElement('div');
      Object.assign(hint.style, {
        position: 'fixed',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.7)',
        color: '#c07a2a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        padding: '6px 14px',
        borderRadius: '12px',
        zIndex: '100',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      });
      hint.textContent = '↻ Rotate device for best experience';
      document.body.appendChild(hint);
      this._hintEl = hint;
    } else if (!showHint && this._hintEl) {
      this._hintEl.remove();
      this._hintEl = null;
    }
  }

  _onResize() {
    // Recalculate layout and update portrait hint
    this.layout = computeLayout(this.app.screen.width, this.app.screen.height);
    this._updatePortraitHint();
  }

  update(deltaSeconds) {
    this.elapsed += deltaSeconds;
    if (this._positionCallbacks) {
      for (const cb of this._positionCallbacks) cb();
    }
  }

  destroy() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    for (const input of this.inputEls) {
      input.remove();
    }
    this.inputEls = [];
    this._positionCallbacks = null;
    if (this._hintEl) {
      this._hintEl.remove();
      this._hintEl = null;
    }
    this.container.destroy({ children: true });
  }
}
