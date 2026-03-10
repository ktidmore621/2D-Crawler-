import { bootstrapGame } from './game.js';

bootstrapGame().catch((err) => {
  console.error('Failed to start game:', err);
});
