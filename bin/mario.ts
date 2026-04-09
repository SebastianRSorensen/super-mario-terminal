import { initGame, cleanup } from '../src/game.js';

// Handle clean exit
process.on('exit', () => cleanup());
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});
process.on('uncaughtException', (err) => {
  cleanup();
  console.error('Uncaught error:', err);
  process.exit(1);
});

// Start the game
initGame();
