import { MushroomState, EntityType } from '../types.js';
import * as C from '../constants.js';

export function createMushroom(x: number, y: number): MushroomState {
  return {
    x,
    y,
    vx: C.MUSHROOM_SPEED,
    vy: 0,
    width: 0.8,
    height: 0.9,
    active: true,
    type: EntityType.MUSHROOM,
    emerging: true,
    emergeTimer: 30,
  };
}

export function updateMushroomEmerge(mushroom: MushroomState, dt: number): void {
  if (mushroom.emerging) {
    mushroom.emergeTimer--;
    mushroom.y -= 1.5 * dt; // 1.5 tiles/s rise rate
    if (mushroom.emergeTimer <= 0) {
      mushroom.emerging = false;
    }
  }
}
