import { TileType } from '../types.js';
import * as C from '../constants.js';

export interface TileProperties {
  solid: boolean;
  breakable: boolean;
  char: string;
  fg: number;
  bg: number;
}

const TILE_PROPS: Record<TileType, TileProperties> = {
  [TileType.AIR]:            { solid: false, breakable: false, char: ' ', fg: 255,                  bg: C.COLOR_SKY_BG },
  [TileType.GROUND]:         { solid: true,  breakable: false, char: '=', fg: C.COLOR_GROUND_FG,    bg: C.COLOR_GROUND_BG },
  [TileType.BRICK]:          { solid: true,  breakable: true,  char: '#', fg: C.COLOR_BRICK_FG,     bg: C.COLOR_BRICK_BG },
  [TileType.QUESTION]:       { solid: true,  breakable: false, char: '?', fg: C.COLOR_QUESTION_FG,  bg: C.COLOR_QUESTION_BG },
  [TileType.QUESTION_EMPTY]: { solid: true,  breakable: false, char: '?', fg: C.COLOR_QUESTION_EMPTY_FG, bg: C.COLOR_QUESTION_EMPTY_BG },
  [TileType.PIPE_TOP_LEFT]:  { solid: true,  breakable: false, char: '[', fg: C.COLOR_PIPE_FG,      bg: C.COLOR_PIPE_BG },
  [TileType.PIPE_TOP_RIGHT]: { solid: true,  breakable: false, char: ']', fg: C.COLOR_PIPE_FG,      bg: C.COLOR_PIPE_BG },
  [TileType.PIPE_BODY_LEFT]: { solid: true,  breakable: false, char: '[', fg: C.COLOR_PIPE_FG,      bg: C.COLOR_PIPE_BG },
  [TileType.PIPE_BODY_RIGHT]:{ solid: true,  breakable: false, char: ']', fg: C.COLOR_PIPE_FG,      bg: C.COLOR_PIPE_BG },
  [TileType.BLOCK_SOLID]:    { solid: true,  breakable: false, char: '#', fg: C.COLOR_SOLID_FG,     bg: C.COLOR_SOLID_BG },
  [TileType.FLAGPOLE]:       { solid: false, breakable: false, char: '|', fg: C.COLOR_FLAGPOLE_FG,  bg: C.COLOR_SKY_BG },
  [TileType.FLAG]:           { solid: false, breakable: false, char: '>', fg: C.COLOR_FLAG_FG,      bg: C.COLOR_SKY_BG },
};

export function getTileProps(type: TileType): TileProperties {
  return TILE_PROPS[type];
}

export function isTileSolid(type: TileType): boolean {
  return TILE_PROPS[type].solid;
}
