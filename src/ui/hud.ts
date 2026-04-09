import { Renderer } from '../renderer.js';
import { GameState } from '../types.js';
import { COLOR_HUD_FG, COLOR_SKY_BG } from '../constants.js';

export function drawHud(renderer: Renderer, state: GameState): void {
  const bg = 0; // Black background for HUD
  const fg = COLOR_HUD_FG;
  const w = renderer.width;

  // Clear HUD rows
  for (let c = 0; c < w; c++) {
    renderer.drawChar(c, 0, ' ', fg, bg);
    renderer.drawChar(c, 1, ' ', fg, bg);
  }

  // MARIO label + score
  renderer.drawString(2, 0, 'MARIO', fg, bg);
  renderer.drawString(2, 1, String(state.score).padStart(6, '0'), fg, bg);

  // Coins
  const coinChar = state.frame % 32 < 16 ? '$' : 'o';
  renderer.drawString(12, 1, `${coinChar}x${String(state.coins).padStart(2, '0')}`, 226, bg);

  // WORLD
  const worldCol = Math.floor(w / 2) - 3;
  renderer.drawString(worldCol, 0, 'WORLD', fg, bg);
  renderer.drawString(worldCol + 1, 1, '1-1', fg, bg);

  // TIME
  const timeCol = w - 8;
  renderer.drawString(timeCol, 0, 'TIME', fg, bg);
  renderer.drawString(timeCol, 1, String(Math.ceil(state.time)).padStart(4, ' '), fg, bg);
}
