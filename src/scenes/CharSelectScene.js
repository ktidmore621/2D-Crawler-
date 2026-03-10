import { Container, Graphics, Text, Assets } from 'pixi.js';
import {
  BG_COLOR,
  TITLE_COLOR,
  AMBER,
  AMBER_HEX,
  BUTTON_BG,
  BUTTON_TEXT_COLOR,
  BUTTON_HOVER_BG,
  BUTTON_WIDTH,
  BUTTON_HEIGHT,
  BUTTON_RADIUS,
  BUTTON_FONT_SIZE,
  CHARACTER_TYPES,
  CHARACTER_LABELS,
  CHAR_CARD_WIDTH,
  CHAR_CARD_HEIGHT,
  CHAR_CARD_GAP,
  CHAR_CARD_BG,
  CHAR_CARD_BORDER,
  CHAR_CARD_SELECTED_BORDER,
  CHAR_CARD_BORDER_WIDTH,
  CHAR_SELECT_TITLE_SIZE,
  CHAR_LABEL_FONT_SIZE,
  CHAR_INPUT_WIDTH,
  CHAR_INPUT_HEIGHT,
  CHAR_PREVIEW_SCALE,
  PLAYER_ANIM_SPEED,
} from '../utils/constants.js';
import { loadAtlas, createAnimatedSprite } from '../systems/animation.js';

export default class CharSelectScene {
  /**
   * @param {import('pixi.js').Application} app
   * @param {(type: string, name: string) => void} onBegin - callback when BEGIN is clicked
   */
  constructor(app, onBegin) {
    this.app = app;
    this.onBegin = onBegin;
    this.container = new Container();
    this.selectedType = null;
    this.names = {};         // { male: '', female: '', androgynous: '' }
    this.cards = {};         // { type: { bg, border, ... } }
    this.inputEls = [];      // DOM input references for cleanup
    this.beginBtn = null;
    this.beginBtnBg = null;
    this.elapsed = 0;
  }

  async init() {
    const { width, height } = this.app.screen;
    this.app.renderer.background.color = BG_COLOR;
    this.app.stage.addChild(this.container);

    // ── Title ──
    const title = new Text({
      text: 'Crawl Craft',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: CHAR_SELECT_TITLE_SIZE,
        fill: TITLE_COLOR,
      },
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = 50;
    this.container.addChild(title);

    const subtitle = new Text({
      text: 'CHOOSE YOUR SURVIVOR',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: AMBER_HEX,
        letterSpacing: 6,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.x = width / 2;
    subtitle.y = 85;
    this.container.addChild(subtitle);

    // ── Character cards ──
    const totalWidth = CHARACTER_TYPES.length * CHAR_CARD_WIDTH + (CHARACTER_TYPES.length - 1) * CHAR_CARD_GAP;
    const startX = (width - totalWidth) / 2;
    const cardY = 120;

    for (let i = 0; i < CHARACTER_TYPES.length; i++) {
      const type = CHARACTER_TYPES[i];
      const cx = startX + i * (CHAR_CARD_WIDTH + CHAR_CARD_GAP) + CHAR_CARD_WIDTH / 2;
      await this._createCard(type, cx, cardY);
    }

    // ── BEGIN button ──
    this._createBeginButton(width / 2, height - 60);
    this._updateBeginState();
  }

  async _createCard(type, cx, top) {
    const cardContainer = new Container();
    cardContainer.x = cx;
    cardContainer.y = top;
    this.container.addChild(cardContainer);

    // Card background
    const bg = new Graphics();
    bg.roundRect(-CHAR_CARD_WIDTH / 2, 0, CHAR_CARD_WIDTH, CHAR_CARD_HEIGHT, 6);
    bg.fill({ color: CHAR_CARD_BG });
    bg.stroke({ color: CHAR_CARD_BORDER, width: CHAR_CARD_BORDER_WIDTH });
    cardContainer.addChild(bg);

    // Card is clickable
    cardContainer.eventMode = 'static';
    cardContainer.cursor = 'pointer';

    // ── Load idle animation for preview ──
    const idleSheet = await loadAtlas(type, 'idle');
    const textures = idleSheet.animations['idle_down'];
    const preview = createAnimatedSprite(textures);
    preview.scale.set(CHAR_PREVIEW_SCALE);
    preview.anchor.set(0.5, 0.5);
    preview.y = 90;
    cardContainer.addChild(preview);

    // ── Label ──
    const label = new Text({
      text: CHARACTER_LABELS[type],
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: CHAR_LABEL_FONT_SIZE,
        fill: TITLE_COLOR,
        letterSpacing: 2,
      },
    });
    label.anchor.set(0.5);
    label.y = 170;
    cardContainer.addChild(label);

    // ── Name input (HTML overlay) ──
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter name...';
    input.maxLength = 16;
    Object.assign(input.style, {
      position: 'absolute',
      width: `${CHAR_INPUT_WIDTH}px`,
      height: `${CHAR_INPUT_HEIGHT}px`,
      background: '#0a0805',
      border: `1px solid ${AMBER_HEX}`,
      borderRadius: '4px',
      color: '#e8d5b0',
      fontFamily: 'Pirata One, serif',
      fontSize: '14px',
      textAlign: 'center',
      outline: 'none',
      padding: '0 8px',
      zIndex: '10',
    });
    input.addEventListener('input', () => {
      this.names[type] = input.value.trim();
      this._updateBeginState();
    });
    // Prevent game key handlers from firing while typing
    input.addEventListener('keydown', (e) => e.stopPropagation());
    input.addEventListener('keyup', (e) => e.stopPropagation());
    document.body.appendChild(input);
    this.inputEls.push(input);

    // Position the input — we need to recalc on each frame because of resize
    const positionInput = () => {
      const canvas = this.app.canvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / this.app.screen.width;
      const scaleY = rect.height / this.app.screen.height;
      const worldX = cardContainer.x - CHAR_INPUT_WIDTH / 2;
      const worldY = cardContainer.y + 200;
      input.style.left = `${rect.left + worldX * scaleX}px`;
      input.style.top = `${rect.top + worldY * scaleY}px`;
      input.style.transform = `scale(${scaleX}, ${scaleY})`;
      input.style.transformOrigin = 'top left';
    };
    this._positionCallbacks = this._positionCallbacks || [];
    this._positionCallbacks.push(positionInput);
    positionInput();

    // ── Selection handling ──
    const borderGfx = new Graphics();
    cardContainer.addChildAt(borderGfx, 0);

    this.cards[type] = { container: cardContainer, bg, borderGfx, preview };

    cardContainer.on('pointerdown', () => {
      this.selectedType = type;
      this._updateSelection();
      this._updateBeginState();
    });
  }

  _updateSelection() {
    for (const [type, card] of Object.entries(this.cards)) {
      const isSelected = type === this.selectedType;
      card.bg.clear();
      card.bg.roundRect(-CHAR_CARD_WIDTH / 2, 0, CHAR_CARD_WIDTH, CHAR_CARD_HEIGHT, 6);
      card.bg.fill({ color: CHAR_CARD_BG });
      card.bg.stroke({
        color: isSelected ? CHAR_CARD_SELECTED_BORDER : CHAR_CARD_BORDER,
        width: isSelected ? 3 : CHAR_CARD_BORDER_WIDTH,
      });

      // Glow effect for selected
      card.borderGfx.clear();
      if (isSelected) {
        card.borderGfx.roundRect(
          -CHAR_CARD_WIDTH / 2 - 4, -4,
          CHAR_CARD_WIDTH + 8, CHAR_CARD_HEIGHT + 8, 8
        );
        card.borderGfx.stroke({ color: CHAR_CARD_SELECTED_BORDER, width: 2, alpha: 0.4 });
      }
    }
  }

  _createBeginButton(cx, cy) {
    const btn = new Container();
    btn.x = cx;
    btn.y = cy;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_RADIUS);
    bg.fill({ color: BUTTON_BG });
    btn.addChild(bg);
    this.beginBtnBg = bg;

    const label = new Text({
      text: 'BEGIN',
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
    this.beginLabel = label;

    btn.on('pointerenter', () => {
      if (!this._beginEnabled) return;
      bg.clear();
      bg.roundRect(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_RADIUS);
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
    bg.clear();
    bg.roundRect(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_RADIUS);
    if (this._beginEnabled) {
      bg.fill({ color: BUTTON_BG });
    } else {
      bg.fill({ color: BUTTON_BG, alpha: 0.3 });
    }
  }

  update(deltaSeconds) {
    this.elapsed += deltaSeconds;
    // Reposition HTML inputs to follow canvas
    if (this._positionCallbacks) {
      for (const cb of this._positionCallbacks) cb();
    }
  }

  destroy() {
    // Remove HTML inputs
    for (const input of this.inputEls) {
      input.remove();
    }
    this.inputEls = [];
    this._positionCallbacks = null;
    this.container.destroy({ children: true });
  }
}
