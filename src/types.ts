export enum TileType {
  AIR = 0,
  GROUND = 1,
  BRICK = 2,
  QUESTION = 3,
  QUESTION_EMPTY = 4,
  PIPE_TOP_LEFT = 5,
  PIPE_TOP_RIGHT = 6,
  PIPE_BODY_LEFT = 7,
  PIPE_BODY_RIGHT = 8,
  BLOCK_SOLID = 9,
  FLAGPOLE = 10,
  FLAG = 11,
}

export enum EntityType {
  MARIO,
  GOOMBA,
  KOOPA,
  KOOPA_SHELL,
  COIN_POPUP,
  MUSHROOM,
}

export type PowerupState = 'small' | 'big';

export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  active: boolean;
  type: EntityType;
}

export interface MarioState extends Entity {
  grounded: boolean;
  facing: -1 | 1;
  powerup: PowerupState;
  invincibleTimer: number;
  dead: boolean;
  jumpHeld: boolean;
  deathTimer: number;
  coyoteTimer: number;
}

export interface GoombaState extends Entity {
  dying: boolean;
  dyingTimer: number;
}

export interface KoopaState extends Entity {
  shell: boolean;
  shellMoving: boolean;
  dying: boolean;
  dyingTimer: number;
}

export interface CoinPopup extends Entity {
  timer: number;
}

export interface MushroomState extends Entity {
  emerging: boolean;
  emergeTimer: number;
}

export type GameMode = 'title' | 'playing' | 'dying' | 'gameover' | 'win' | 'paused';

export interface GameState {
  mode: GameMode;
  mario: MarioState;
  entities: Entity[];
  score: number;
  coins: number;
  lives: number;
  time: number;
  timeAccumulator: number;
  frame: number;
}

export interface Camera {
  x: number;
}

export interface Cell {
  char: string;
  fg: number;
  bg: number;
}

export interface LevelEntitySpawn {
  type: 'goomba' | 'koopa';
  col: number;
  row: number;
  spawned: boolean;
}

export interface LevelItemDef {
  col: number;
  row: number;
  item: 'coin' | 'mushroom';
}
