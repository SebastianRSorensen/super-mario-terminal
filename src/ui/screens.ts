import { Renderer } from '../renderer.js';
import { COLOR_HUD_FG, COLOR_SKY_BG, COLOR_MARIO_FG } from '../constants.js';
import { GameState } from '../types.js';

const TITLE_ART = [
  '  ____                        __  __            _       ',
  ' / ___| _   _ _ __   ___ _ __|  \\/  | __ _ _ __(_) ___  ',
  ' \\___ \\| | | | \'_ \\ / _ \\ \'__| |\\/| |/ _` | \'__| |/ _ \\ ',
  '  ___) | |_| | |_) |  __/ |  | |  | | (_| | |  | | (_) |',
  ' |____/ \\__,_| .__/ \\___|_|  |_|  |_|\\__,_|_|  |_|\\___/ ',
  '             |_|                                         ',
];

const TITLE_SUB = '  T E R M I N A L   E D I T I O N';

export function drawTitleScreen(renderer: Renderer, frame: number): void {
  renderer.clear();
  const startRow = Math.floor(renderer.height / 2) - 5;
  const fg = COLOR_MARIO_FG;
  const bg = COLOR_SKY_BG;

  for (let i = 0; i < TITLE_ART.length; i++) {
    const line = TITLE_ART[i]!;
    const col = Math.floor((renderer.width - line.length) / 2);
    renderer.drawString(col, startRow + i, line, fg, bg);
  }

  const subCol = Math.floor((renderer.width - TITLE_SUB.length) / 2);
  renderer.drawString(subCol, startRow + TITLE_ART.length + 1, TITLE_SUB, COLOR_HUD_FG, bg);

  // Blinking "PRESS SPACE TO START"
  if (frame % 40 < 28) {
    const prompt = 'PRESS SPACE TO START';
    const col = Math.floor((renderer.width - prompt.length) / 2);
    renderer.drawString(col, startRow + TITLE_ART.length + 4, prompt, COLOR_HUD_FG, bg);
  }
}

export function drawGameOverScreen(renderer: Renderer): void {
  renderer.clear();
  const text = 'G A M E   O V E R';
  const col = Math.floor((renderer.width - text.length) / 2);
  const row = Math.floor(renderer.height / 2);
  renderer.drawString(col, row, text, COLOR_MARIO_FG, COLOR_SKY_BG);
}

export function drawWinScreen(renderer: Renderer, state: GameState): void {
  renderer.clear();
  const bg = COLOR_SKY_BG;
  const row = Math.floor(renderer.height / 2) - 3;

  const title = 'C O U R S E   C L E A R !';
  const titleCol = Math.floor((renderer.width - title.length) / 2);
  renderer.drawString(titleCol, row, title, 226, bg);

  const scoreLine = `SCORE: ${String(state.score).padStart(6, '0')}`;
  const scoreCol = Math.floor((renderer.width - scoreLine.length) / 2);
  renderer.drawString(scoreCol, row + 2, scoreLine, COLOR_HUD_FG, bg);

  const coinLine = `COINS: ${state.coins}`;
  const coinCol = Math.floor((renderer.width - coinLine.length) / 2);
  renderer.drawString(coinCol, row + 3, coinLine, 226, bg);

  const thankLine = 'THANK YOU FOR PLAYING!';
  const thankCol = Math.floor((renderer.width - thankLine.length) / 2);
  renderer.drawString(thankCol, row + 5, thankLine, COLOR_HUD_FG, bg);
}
