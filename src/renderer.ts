import { Cell } from './types.js';
import { COLOR_SKY_BG } from './constants.js';

const ESC = '\x1b';

export class Renderer {
  width: number;
  height: number;
  private frontBuffer: Cell[][];
  private backBuffer: Cell[][];
  private initialized = false;

  constructor() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 24;
    // Front buffer uses sentinel values so the first flush writes every cell
    this.frontBuffer = this.createBuffer(true);
    this.backBuffer = this.createBuffer(false);
  }

  private createBuffer(sentinel: boolean): Cell[][] {
    const buf: Cell[][] = [];
    for (let r = 0; r < this.height; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < this.width; c++) {
        row.push(sentinel
          ? { char: '\0', fg: -1, bg: -1 }
          : { char: ' ', fg: 255, bg: COLOR_SKY_BG },
        );
      }
      buf.push(row);
    }
    return buf;
  }

  init(): void {
    // Hide cursor, clear screen
    process.stdout.write(`${ESC}[?25l${ESC}[2J${ESC}[H`);
    this.initialized = true;
    // Handle resize
    process.stdout.on('resize', () => {
      this.width = process.stdout.columns || 80;
      this.height = process.stdout.rows || 24;
      this.frontBuffer = this.createBuffer(true);
      this.backBuffer = this.createBuffer(false);
      process.stdout.write(`${ESC}[2J`);
    });
  }

  cleanup(): void {
    // Show cursor, reset colors, move to bottom
    process.stdout.write(`${ESC}[?25h${ESC}[0m${ESC}[${this.height};1H\n`);
  }

  clear(): void {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const cell = this.backBuffer[r]?.[c];
        if (cell) {
          cell.char = ' ';
          cell.fg = 255;
          cell.bg = COLOR_SKY_BG;
        }
      }
    }
  }

  drawChar(col: number, row: number, char: string, fg: number, bg: number): void {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return;
    const cell = this.backBuffer[row]![col]!;
    cell.char = char;
    cell.fg = fg;
    cell.bg = bg;
  }

  drawString(col: number, row: number, str: string, fg: number, bg: number): void {
    for (let i = 0; i < str.length; i++) {
      this.drawChar(col + i, row, str[i]!, fg, bg);
    }
  }

  flush(): void {
    if (!this.initialized) return;

    let output = '';
    let lastFg = -1;
    let lastBg = -1;

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const front = this.frontBuffer[r]?.[c];
        const back = this.backBuffer[r]?.[c];
        if (!front || !back) continue;

        if (front.char !== back.char || front.fg !== back.fg || front.bg !== back.bg) {
          // Move cursor to position (1-indexed)
          output += `${ESC}[${r + 1};${c + 1}H`;

          // Set colors only if changed
          if (back.fg !== lastFg) {
            output += `${ESC}[38;5;${back.fg}m`;
            lastFg = back.fg;
          }
          if (back.bg !== lastBg) {
            output += `${ESC}[48;5;${back.bg}m`;
            lastBg = back.bg;
          }

          output += back.char;

          // Copy to front buffer
          front.char = back.char;
          front.fg = back.fg;
          front.bg = back.bg;
        }
      }
    }

    if (output.length > 0) {
      process.stdout.write(output);
    }
  }
}
