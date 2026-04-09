import { KoopaState, EntityType } from '../types.js';
import { TileMap } from '../tiles/tilemap.js';
import * as C from '../constants.js';

export function createKoopa(x: number, y: number): KoopaState {
  return {
    x, y,
    vx: -C.KOOPA_SPEED,
    vy: 0,
    width: 0.8,
    height: 0.9,
    active: true,
    type: EntityType.KOOPA,
    shell: false,
    shellMoving: false,
    dying: false,
    dyingTimer: 0,
  };
}

export function updateKoopa(koopa: KoopaState, tilemap: TileMap, dt: number): void {
  if (koopa.dying) {
    koopa.dyingTimer--;
    if (koopa.dyingTimer <= 0) {
      koopa.active = false;
    }
    return;
  }

  if (koopa.shell && !koopa.shellMoving) {
    // Shell is stationary
    return;
  }

  // Check wall ahead
  const frontCol = Math.floor(koopa.x + (koopa.vx > 0 ? koopa.width : 0));
  const bodyRow = Math.floor(koopa.y);
  if (tilemap.isSolid(frontCol, bodyRow)) {
    koopa.vx = -koopa.vx;
  }

  // Non-shell koopas don't walk off edges
  if (!koopa.shell) {
    const footCol = Math.floor(koopa.x + (koopa.vx > 0 ? koopa.width : 0));
    const belowRow = Math.floor(koopa.y + 1);
    if (!tilemap.isSolid(footCol, belowRow) && koopa.vy === 0) {
      koopa.vx = -koopa.vx;
    }
  }
}

export function stompKoopa(koopa: KoopaState): void {
  if (!koopa.shell) {
    // Turn into shell
    koopa.shell = true;
    koopa.shellMoving = false;
    koopa.vx = 0;
    koopa.type = EntityType.KOOPA_SHELL;
  } else if (!koopa.shellMoving) {
    // Kick the shell - direction will be set by caller
    koopa.shellMoving = true;
  } else {
    // Stop moving shell
    koopa.shellMoving = false;
    koopa.vx = 0;
  }
}

export function kickShell(koopa: KoopaState, direction: -1 | 1): void {
  koopa.shell = true;
  koopa.shellMoving = true;
  koopa.vx = direction * C.SHELL_SPEED;
  koopa.type = EntityType.KOOPA_SHELL;
}
