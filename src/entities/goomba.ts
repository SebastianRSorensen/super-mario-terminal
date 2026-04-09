import { GoombaState, EntityType } from '../types.js';
import { TileMap } from '../tiles/tilemap.js';
import * as C from '../constants.js';

export function createGoomba(x: number, y: number): GoombaState {
  return {
    x, y,
    vx: -C.GOOMBA_SPEED,
    vy: 0,
    width: 0.8,
    height: 0.9,
    active: true,
    type: EntityType.GOOMBA,
    dying: false,
    dyingTimer: 0,
  };
}

export function updateGoomba(goomba: GoombaState, tilemap: TileMap, dt: number): void {
  if (goomba.dying) {
    goomba.dyingTimer--;
    if (goomba.dyingTimer <= 0) {
      goomba.active = false;
    }
    return;
  }

  // Check wall ahead
  const frontCol = Math.floor(goomba.x + (goomba.vx > 0 ? goomba.width : 0));
  const bodyRow = Math.floor(goomba.y);
  if (tilemap.isSolid(frontCol, bodyRow)) {
    goomba.vx = -goomba.vx;
  }

  // Check ledge ahead (don't walk off edges)
  const footCol = Math.floor(goomba.x + (goomba.vx > 0 ? goomba.width : 0));
  const belowRow = Math.floor(goomba.y + 1);
  if (!tilemap.isSolid(footCol, belowRow) && goomba.vy === 0) {
    goomba.vx = -goomba.vx;
  }
}

export function stompGoomba(goomba: GoombaState): void {
  goomba.dying = true;
  goomba.dyingTimer = 10;
  goomba.vx = 0;
}
