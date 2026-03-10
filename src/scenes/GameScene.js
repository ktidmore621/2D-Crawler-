import { Container, Text } from 'pixi.js';
import { BG_COLOR, TAGLINE_COLOR } from '../utils/constants.js';

export default class GameScene {
  constructor(app) {
    this.app = app;
    this.container = new Container();
  }

  init() {
    this.app.stage.addChild(this.container);
    this.app.renderer.background.color = BG_COLOR;

    const message = new Text({
      text: 'Game coming soon',
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: 36,
        fill: TAGLINE_COLOR,
      },
    });
    message.anchor.set(0.5);
    message.x = this.app.screen.width / 2;
    message.y = this.app.screen.height / 2;
    this.container.addChild(message);
  }

  update() {}

  destroy() {
    this.container.destroy({ children: true });
  }
}
