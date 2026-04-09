import { TileType } from '../types.js';
import { isTileSolid } from './tiles.js';

export class TileMap {
  readonly width: number;
  readonly height: number;
  private data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height);
  }

  get(col: number, row: number): TileType {
    if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
      return TileType.AIR;
    }
    return this.data[row * this.width + col] as TileType;
  }

  set(col: number, row: number, value: TileType): void {
    if (col < 0 || col >= this.width || row < 0 || row >= this.height) return;
    this.data[row * this.width + col] = value;
  }

  isSolid(col: number, row: number): boolean {
    return isTileSolid(this.get(col, row));
  }
}
