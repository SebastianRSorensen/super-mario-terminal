import { Entity, MarioState, EntityType, TileType, GoombaState, KoopaState, MushroomState, CoinPopup } from './types.js';
import { TileMap } from './tiles/tilemap.js';
import * as C from './constants.js';
import { getMarioGravity, damageMario, powerupMario, killMario } from './entities/mario.js';
import { stompGoomba, updateGoomba } from './entities/goomba.js';
import { stompKoopa, kickShell, updateKoopa } from './entities/koopa.js';
import { updateCoinPopup, createCoinPopup } from './entities/coin.js';
import { createMushroom, updateMushroomEmerge } from './entities/mushroom.js';
import { LevelItemDef } from './types.js';

export function applyGravity(entity: Entity, gravity: number, dt: number): void {
  entity.vy += gravity * dt;
  if (entity.vy > C.TERMINAL_VELOCITY) {
    entity.vy = C.TERMINAL_VELOCITY;
  }
}

export function moveAndCollideX(entity: Entity, tilemap: TileMap, dt: number): void {
  entity.x += entity.vx * dt;

  if (entity.vx > 0) {
    // Moving right - check right edge
    const right = entity.x + entity.width;
    const col = Math.floor(right);
    const topRow = Math.floor(entity.y);
    const botRow = Math.floor(entity.y + entity.height - 0.01);
    for (let r = topRow; r <= botRow; r++) {
      if (tilemap.isSolid(col, r)) {
        entity.x = col - entity.width;
        entity.vx = 0;
        break;
      }
    }
  } else if (entity.vx < 0) {
    // Moving left - check left edge
    const col = Math.floor(entity.x);
    const topRow = Math.floor(entity.y);
    const botRow = Math.floor(entity.y + entity.height - 0.01);
    for (let r = topRow; r <= botRow; r++) {
      if (tilemap.isSolid(col, r)) {
        entity.x = col + 1;
        entity.vx = 0;
        break;
      }
    }
  }

  // Clamp to level bounds
  if (entity.x < 0) {
    entity.x = 0;
    entity.vx = 0;
  }
  if (entity.x + entity.width > tilemap.width) {
    entity.x = tilemap.width - entity.width;
    entity.vx = 0;
  }
}

export interface CollideYResult {
  hitBelow: boolean;
  hitAbove: boolean;
  hitAboveCol: number;
  hitAboveRow: number;
}

export function moveAndCollideY(entity: Entity, tilemap: TileMap, dt: number): CollideYResult {
  const result: CollideYResult = { hitBelow: false, hitAbove: false, hitAboveCol: -1, hitAboveRow: -1 };

  entity.y += entity.vy * dt;

  if (entity.vy > 0) {
    // Falling - check bottom edge
    const bot = entity.y + entity.height;
    const row = Math.floor(bot);
    const leftCol = Math.floor(entity.x + 0.05);
    const rightCol = Math.floor(entity.x + entity.width - 0.05);
    for (let c = leftCol; c <= rightCol; c++) {
      if (tilemap.isSolid(c, row)) {
        entity.y = row - entity.height;
        entity.vy = 0;
        result.hitBelow = true;
        break;
      }
    }
  } else if (entity.vy < 0) {
    // Rising - check top edge
    const row = Math.floor(entity.y);
    const leftCol = Math.floor(entity.x + 0.05);
    const rightCol = Math.floor(entity.x + entity.width - 0.05);
    for (let c = leftCol; c <= rightCol; c++) {
      if (tilemap.isSolid(c, row)) {
        entity.y = row + 1;
        entity.vy = 0;
        result.hitAbove = true;
        result.hitAboveCol = c;
        result.hitAboveRow = row;
        break;
      }
    }
  }

  return result;
}

export function handleBlockHit(
  tilemap: TileMap,
  col: number,
  row: number,
  mario: MarioState,
  entities: Entity[],
  items: LevelItemDef[],
  addScore: (points: number) => void,
  addCoin: () => void,
): void {
  const tile = tilemap.get(col, row);

  if (tile === TileType.QUESTION) {
    tilemap.set(col, row, TileType.QUESTION_EMPTY);
    // Find what item this block contains
    const itemDef = items.find(i => i.col === col && i.row === row);
    if (itemDef?.item === 'mushroom') {
      const mushroom = createMushroom(col, row - 1);
      entities.push(mushroom);
    } else {
      // Default: coin
      const coin = createCoinPopup(col + 0.25, row - 1);
      entities.push(coin);
      addScore(C.SCORE_COIN);
      addCoin();
    }
  } else if (tile === TileType.BRICK) {
    if (mario.powerup === 'big') {
      // Break the brick
      tilemap.set(col, row, TileType.AIR);
    }
    // Small Mario just bumps it
  }
}

function aabbOverlap(a: Entity, b: Entity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function checkEntityCollisions(
  mario: MarioState,
  entities: Entity[],
  addScore: (points: number) => void,
  addCoin: () => void,
): void {
  if (mario.dead) return;

  for (const entity of entities) {
    if (!entity.active) continue;
    if (!aabbOverlap(mario, entity)) continue;

    switch (entity.type) {
      case EntityType.GOOMBA: {
        const goomba = entity as GoombaState;
        if (goomba.dying) break;
        // Check if Mario is falling onto goomba
        if (mario.vy > 0 && mario.y + mario.height - 0.3 < goomba.y + goomba.height * 0.5) {
          stompGoomba(goomba);
          mario.vy = -10; // bounce
          addScore(C.SCORE_GOOMBA);
        } else {
          damageMario(mario);
        }
        break;
      }

      case EntityType.KOOPA: {
        const koopa = entity as KoopaState;
        if (koopa.dying) break;
        if (mario.vy > 0 && mario.y + mario.height - 0.3 < koopa.y + koopa.height * 0.5) {
          stompKoopa(koopa);
          mario.vy = -10; // bounce
          addScore(C.SCORE_KOOPA);
        } else {
          damageMario(mario);
        }
        break;
      }

      case EntityType.KOOPA_SHELL: {
        const shell = entity as KoopaState;
        if (shell.dying) break;
        if (!shell.shellMoving) {
          // Kick it
          const dir = mario.facing;
          kickShell(shell, dir);
        } else if (mario.vy > 0 && mario.y + mario.height - 0.3 < shell.y + shell.height * 0.5) {
          // Stomp to stop
          stompKoopa(shell);
          mario.vy = -10;
        } else {
          damageMario(mario);
        }
        break;
      }

      case EntityType.MUSHROOM: {
        const mushroom = entity as MushroomState;
        if (mushroom.emerging) break;
        mushroom.active = false;
        powerupMario(mario);
        addScore(C.SCORE_MUSHROOM);
        break;
      }

      case EntityType.COIN_POPUP:
        // No collision with coin popups
        break;
    }
  }
}

export function checkShellKills(entities: Entity[], addScore: (points: number) => void): void {
  // Moving shells kill enemies they hit
  for (const entity of entities) {
    if (!entity.active || entity.type !== EntityType.KOOPA_SHELL) continue;
    const shell = entity as KoopaState;
    if (!shell.shellMoving) continue;

    for (const other of entities) {
      if (other === entity || !other.active) continue;
      if (other.type !== EntityType.GOOMBA && other.type !== EntityType.KOOPA) continue;
      if (!aabbOverlap(shell, other)) continue;

      if (other.type === EntityType.GOOMBA) {
        (other as GoombaState).dying = true;
        (other as GoombaState).dyingTimer = 1;
        addScore(C.SCORE_GOOMBA);
      } else {
        (other as KoopaState).dying = true;
        (other as KoopaState).dyingTimer = 1;
        addScore(C.SCORE_KOOPA);
      }
    }
  }
}

export function updateEntities(
  entities: Entity[],
  tilemap: TileMap,
  dt: number,
): void {
  for (const entity of entities) {
    if (!entity.active) continue;

    switch (entity.type) {
      case EntityType.GOOMBA: {
        const goomba = entity as GoombaState;
        updateGoomba(goomba, tilemap, dt);
        if (!goomba.dying) {
          applyGravity(goomba, C.GRAVITY, dt);
          moveAndCollideX(goomba, tilemap, dt);
          const yResult = moveAndCollideY(goomba, tilemap, dt);
          if (yResult.hitBelow) goomba.vy = 0;
        }
        break;
      }

      case EntityType.KOOPA:
      case EntityType.KOOPA_SHELL: {
        const koopa = entity as KoopaState;
        updateKoopa(koopa, tilemap, dt);
        if (!koopa.dying) {
          applyGravity(koopa, C.GRAVITY, dt);
          moveAndCollideX(koopa, tilemap, dt);
          const yResult = moveAndCollideY(koopa, tilemap, dt);
          if (yResult.hitBelow) koopa.vy = 0;
        }
        break;
      }

      case EntityType.COIN_POPUP: {
        updateCoinPopup(entity as CoinPopup, dt);
        break;
      }

      case EntityType.MUSHROOM: {
        const mushroom = entity as MushroomState;
        updateMushroomEmerge(mushroom, dt);
        if (!mushroom.emerging) {
          applyGravity(mushroom, C.GRAVITY, dt);
          moveAndCollideX(mushroom, tilemap, dt);
          const yResult = moveAndCollideY(mushroom, tilemap, dt);
          if (yResult.hitBelow) mushroom.vy = 0;
        }
        break;
      }
    }
  }

  // Remove inactive entities
  for (let i = entities.length - 1; i >= 0; i--) {
    if (!entities[i]!.active) {
      entities.splice(i, 1);
    }
  }
}
