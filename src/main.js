import './style.css';
import { Application, Graphics, Text } from 'pixi.js';

const app = new Application();

await app.init({
  resizeTo: window,
  background: '#08111f',
  antialias: true
});

document.getElementById('game-root').appendChild(app.canvas);

const player = new Graphics();
player.circle(0, 0, 28).fill('#34d399');
player.stroke({ width: 4, color: '#ffffff' });
player.x = app.screen.width / 2;
player.y = app.screen.height / 2;
app.stage.addChild(player);

const label = new Text({
  text: 'Player',
  style: {
    fill: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});
label.anchor.set(0.5, 0);
label.x = player.x;
label.y = player.y + 36;
app.stage.addChild(label);

const speed = {
  x: 3,
  y: 2.4
};
const playerRadius = 28;

app.ticker.add(() => {
  player.x += speed.x;
  player.y += speed.y;

  const leftWall = playerRadius;
  const rightWall = app.screen.width - playerRadius;
  const topWall = playerRadius;
  const bottomWall = app.screen.height - playerRadius;

  if (player.x < leftWall || player.x > rightWall) {
    speed.x *= -1;
  }

  if (player.y < topWall || player.y > bottomWall) {
    speed.y *= -1;
  }

  label.x = player.x;
  label.y = player.y + 36;
});

app.canvas.addEventListener('pointerdown', (event) => {
  const canvasArea = app.canvas.getBoundingClientRect();
  const targetX = event.clientX - canvasArea.left;
  const targetY = event.clientY - canvasArea.top;

  speed.x = (targetX - player.x) * 0.05;
  speed.y = (targetY - player.y) * 0.05;
});
