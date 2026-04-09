import { MarioState, EntityType } from '../types.js';
import { isKeyDown, wasKeyPressed, isAnyKeyRecent } from '../input.js';
import * as C from '../constants.js';

// Track whether Mario was moving horizontally when he left the ground
let airborneVx = 0;

export function createMario(x: number, y: number): MarioState {
  airborneVx = 0;
  return {
    x, y,
    vx: 0, vy: 0,
    width: 0.8, height: 0.9,
    active: true,
    type: EntityType.MARIO,
    grounded: false,
    facing: 1,
    powerup: 'small',
    invincibleTimer: 0,
    dead: false,
    jumpHeld: false,
    deathTimer: 0,
  };
}

export function updateMarioInput(mario: MarioState): void {
  if (mario.dead) return;

  // Horizontal movement
  const leftDown = isKeyDown('left');
  const rightDown = isKeyDown('right');

  if (leftDown) {
    mario.vx = -C.MARIO_RUN_SPEED;
    mario.facing = -1;
  } else if (rightDown) {
    mario.vx = C.MARIO_RUN_SPEED;
    mario.facing = 1;
  } else if (!mario.grounded && airborneVx !== 0 && isAnyKeyRecent()) {
    // While airborne, maintain the horizontal speed we had when leaving
    // the ground — but only if we were actually moving. Terminals only
    // repeat one key at a time, so direction keys stop when jump is held.
    mario.vx = airborneVx;
  } else {
    mario.vx = 0;
  }

  // Snapshot horizontal velocity when leaving the ground
  if (mario.grounded) {
    airborneVx = mario.vx;
  }

  // Jump
  const jumpKey = isKeyDown('up') || isKeyDown('space');
  if (jumpKey && mario.grounded && !mario.jumpHeld) {
    mario.vy = C.MARIO_JUMP_VELOCITY;
    mario.grounded = false;
    mario.jumpHeld = true;
  }
  if (!jumpKey) {
    mario.jumpHeld = false;
  }
}

export function getMarioGravity(mario: MarioState): number {
  // Variable-height jump: lower gravity while holding jump and moving upward
  if (mario.jumpHeld && mario.vy < 0) {
    return C.MARIO_JUMP_HOLD_GRAVITY;
  }
  return C.GRAVITY;
}

export function damageMario(mario: MarioState): void {
  if (mario.invincibleTimer > 0 || mario.dead) return;

  if (mario.powerup === 'big') {
    mario.powerup = 'small';
    mario.invincibleTimer = C.INVINCIBLE_FRAMES;
  } else {
    killMario(mario);
  }
}

export function killMario(mario: MarioState): void {
  mario.dead = true;
  mario.vy = C.MARIO_JUMP_VELOCITY;
  mario.vx = 0;
  mario.deathTimer = C.DEATH_ANIMATION_FRAMES;
}

export function powerupMario(mario: MarioState): void {
  mario.powerup = 'big';
}
