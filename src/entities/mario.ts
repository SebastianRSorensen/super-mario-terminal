import { MarioState, EntityType } from '../types.js';
import { isKeyDown, isKeyHeld, wasKeyPressed, consumeTap } from '../input.js';
import * as C from '../constants.js';

export function createMario(x: number, y: number): MarioState {
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
    coyoteTimer: 0,
  };
}

export function updateMarioInput(mario: MarioState, dt: number): void {
  if (mario.dead) return;

  // Horizontal movement with acceleration/friction
  const accel = mario.grounded ? C.MARIO_ACCEL : C.MARIO_AIR_ACCEL;
  const decel = mario.grounded ? C.MARIO_DECEL : C.MARIO_AIR_DECEL;

  const leftHeld = isKeyHeld('left');
  const rightHeld = isKeyHeld('right');
  const leftTap = consumeTap('left');
  const rightTap = consumeTap('right');

  if (leftHeld || rightHeld) {
    // Confirmed hold → full acceleration
    let moveDir = 0;
    if (leftHeld) moveDir -= 1;
    if (rightHeld) moveDir += 1;
    mario.vx += moveDir * accel * dt;
    mario.vx = Math.max(-C.MARIO_MAX_SPEED, Math.min(C.MARIO_MAX_SPEED, mario.vx));
    mario.facing = moveDir as -1 | 1;
  } else if (leftTap || rightTap) {
    // Single tap → impulse, then friction handles the rest
    const tapDir = leftTap ? -1 : 1;
    mario.vx = tapDir * C.TAP_MOVE_SPEED;
    mario.facing = tapDir as -1 | 1;
  } else {
    // No input → friction/deceleration
    if (mario.vx > 0) {
      mario.vx = Math.max(0, mario.vx - decel * dt);
    } else if (mario.vx < 0) {
      mario.vx = Math.min(0, mario.vx + decel * dt);
    }
  }

  // Coyote time
  if (mario.grounded) {
    mario.coyoteTimer = C.COYOTE_TIME;
  } else {
    mario.coyoteTimer = Math.max(0, mario.coyoteTimer - dt);
  }

  // Jump — edge-triggered via wasKeyPressed, hold-tracked via isKeyDown
  const jumpPressed = wasKeyPressed('up') || wasKeyPressed('space');
  const jumpHeldDown = isKeyDown('up') || isKeyDown('space');
  const canJump = mario.grounded || mario.coyoteTimer > 0;

  if (jumpPressed && canJump) {
    mario.vy = C.MARIO_JUMP_VELOCITY;
    mario.grounded = false;
    mario.coyoteTimer = 0;
    mario.jumpHeld = true;
  }
  if (!jumpHeldDown) {
    mario.jumpHeld = false;
  }
}

export function getMarioGravity(mario: MarioState): number {
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
