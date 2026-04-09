import { GameState, Camera, Entity, TileType, EntityType, MarioState, GoombaState, KoopaState } from './types.js';
import { TileMap } from './tiles/tilemap.js';
import { getTileProps } from './tiles/tiles.js';
import { Renderer } from './renderer.js';
import { initInput, updateInput, wasKeyPressed } from './input.js';
import { updateCamera } from './camera.js';
import { createMario, updateMarioInput, getMarioGravity, killMario } from './entities/mario.js';
import { createGoomba } from './entities/goomba.js';
import { createKoopa } from './entities/koopa.js';
import {
  applyGravity, moveAndCollideX, moveAndCollideY,
  handleBlockHit, checkEntityCollisions, checkShellKills,
  updateEntities,
} from './physics.js';
import { loadLevel } from './level/level-loader.js';
import { LEVEL_1_1_ROWS, LEVEL_1_1_ENTITIES, LEVEL_1_1_ITEMS, MARIO_START_COL, MARIO_START_ROW } from './level/level-data.js';
import { drawHud } from './ui/hud.js';
import { drawTitleScreen, drawGameOverScreen, drawWinScreen, drawPauseScreen } from './ui/screens.js';
import * as C from './constants.js';
import { LevelItemDef } from './types.js';

let renderer: Renderer;
let state: GameState;
let camera: Camera;
let tilemap: TileMap;
let levelItems: LevelItemDef[];
let levelEntities: typeof LEVEL_1_1_ENTITIES;
let gameTimeout: ReturnType<typeof setTimeout>;
let modeTimer = 0;

export function initGame(): void {
  renderer = new Renderer();
  renderer.init();
  initInput();

  state = {
    mode: 'title',
    mario: createMario(MARIO_START_COL, MARIO_START_ROW),
    entities: [],
    score: 0,
    coins: 0,
    lives: C.STARTING_LIVES,
    time: C.STARTING_TIME,
    timeAccumulator: 0,
    frame: 0,
  };
  camera = { x: 0 };

  const loaded = loadLevel(LEVEL_1_1_ROWS, LEVEL_1_1_ENTITIES, LEVEL_1_1_ITEMS);
  tilemap = loaded.tilemap;
  levelEntities = loaded.entities;
  levelItems = loaded.items;

  startGameLoop();
}

function resetLevel(): void {
  const loaded = loadLevel(LEVEL_1_1_ROWS, LEVEL_1_1_ENTITIES, LEVEL_1_1_ITEMS);
  tilemap = loaded.tilemap;
  levelEntities = loaded.entities;
  levelItems = loaded.items;

  state.mario = createMario(MARIO_START_COL, MARIO_START_ROW);
  state.entities = [];
  state.time = C.STARTING_TIME;
  state.timeAccumulator = 0;
  camera = { x: 0 };
}

function startGameLoop(): void {
  const TICK_MS = 1000 / C.TICK_RATE;
  let lastTime = performance.now();
  let accumulator = 0;

  function gameLoop(): void {
    const now = performance.now();
    let frameTime = now - lastTime;
    lastTime = now;

    // Cap frame time to prevent spiral of death
    if (frameTime > 250) frameTime = 250;

    // Poll input once per frame, before physics
    updateInput();

    accumulator += frameTime;
    let ticked = false;

    while (accumulator >= TICK_MS) {
      update(C.DT);
      accumulator -= TICK_MS;
      ticked = true;
    }

    // Only render if at least one physics tick ran
    if (ticked) {
      render();
      state.frame++;
    }

    // Self-scheduling: more accurate than setInterval
    const elapsed = performance.now() - now;
    const delay = Math.max(1, TICK_MS - elapsed);
    gameTimeout = setTimeout(gameLoop, delay);
  }

  gameLoop();
}

function update(dt: number): void {
  if (wasKeyPressed('quit')) {
    cleanup();
    process.exit(0);
  }

  switch (state.mode) {
    case 'title':
      updateTitle();
      break;
    case 'playing':
      updatePlaying(dt);
      break;
    case 'paused':
      updatePaused();
      break;
    case 'dying':
      updateDying(dt);
      break;
    case 'gameover':
      updateGameOver();
      break;
    case 'win':
      updateWin();
      break;
  }
}

function updateTitle(): void {
  if (wasKeyPressed('space') || wasKeyPressed('enter')) {
    state.mode = 'playing';
    state.score = 0;
    state.coins = 0;
    state.lives = C.STARTING_LIVES;
    resetLevel();
  }
}

function updatePaused(): void {
  if (wasKeyPressed('p')) {
    state.mode = 'playing';
  }
}

function updatePlaying(dt: number): void {
  const mario = state.mario;

  // Pause
  if (wasKeyPressed('p')) {
    state.mode = 'paused';
    return;
  }

  // Update Mario input
  updateMarioInput(mario, dt);

  // Apply gravity to Mario
  const gravity = getMarioGravity(mario);
  applyGravity(mario, gravity, dt);

  // Move Mario with collision
  moveAndCollideX(mario, tilemap, dt);
  const yResult = moveAndCollideY(mario, tilemap, dt);

  if (yResult.hitBelow) {
    mario.grounded = true;
  } else {
    mario.grounded = false;
  }

  if (yResult.hitAbove) {
    handleBlockHit(
      tilemap, yResult.hitAboveCol, yResult.hitAboveRow,
      mario, state.entities, levelItems,
      (pts) => { state.score += pts; },
      () => { state.coins++; },
    );
  }

  // Don't let Mario go left of camera
  if (mario.x < camera.x) {
    mario.x = camera.x;
    mario.vx = 0;
  }

  // Update entities
  spawnNearbyEntities();
  updateEntities(state.entities, tilemap, dt);
  checkEntityCollisions(
    mario, state.entities,
    (pts) => { state.score += pts; },
    () => { state.coins++; },
  );
  checkShellKills(state.entities, (pts) => { state.score += pts; });

  // Update camera
  updateCamera(camera, mario, renderer.width, tilemap.width);

  // Update invincibility timer
  if (mario.invincibleTimer > 0) {
    mario.invincibleTimer--;
  }

  // Update timer
  state.timeAccumulator += dt;
  if (state.timeAccumulator >= 1) {
    state.timeAccumulator -= 1;
    state.time--;
    if (state.time <= 0) {
      killMario(mario);
    }
  }

  // Check death (fell off screen)
  if (mario.y > tilemap.height + 2) {
    mario.dead = true;
    mario.deathTimer = 1; // instant
  }

  // Check win (reached flagpole)
  const marioCol = Math.floor(mario.x + mario.width / 2);
  const marioRow = Math.floor(mario.y);
  if (tilemap.get(marioCol, marioRow) === TileType.FLAGPOLE ||
      tilemap.get(marioCol, marioRow) === TileType.FLAG) {
    state.score += C.SCORE_FLAGPOLE;
    state.mode = 'win';
    modeTimer = 240;
    return;
  }

  // Transition to dying
  if (mario.dead) {
    state.mode = 'dying';
    modeTimer = C.DEATH_ANIMATION_FRAMES;
  }
}

function updateDying(dt: number): void {
  const mario = state.mario;

  // Death animation: Mario flies up then falls
  applyGravity(mario, C.GRAVITY, dt);
  mario.y += mario.vy * dt;

  modeTimer--;
  if (modeTimer <= 0) {
    state.lives--;
    if (state.lives <= 0) {
      state.mode = 'gameover';
      modeTimer = 180;
    } else {
      state.mode = 'playing';
      resetLevel();
    }
  }
}

function updateGameOver(): void {
  modeTimer--;
  if (modeTimer <= 0) {
    state.mode = 'title';
  }
}

function updateWin(): void {
  modeTimer--;
  if (modeTimer <= 0) {
    state.mode = 'title';
  }
}

function spawnNearbyEntities(): void {
  const spawnEdge = camera.x + renderer.width + 5;
  for (const spawn of levelEntities) {
    if (spawn.spawned) continue;
    if (spawn.col < spawnEdge) {
      spawn.spawned = true;
      if (spawn.type === 'goomba') {
        state.entities.push(createGoomba(spawn.col, spawn.row));
      } else if (spawn.type === 'koopa') {
        state.entities.push(createKoopa(spawn.col, spawn.row));
      }
    }
  }
}

function render(): void {
  switch (state.mode) {
    case 'title':
      drawTitleScreen(renderer, state.frame);
      break;
    case 'gameover':
      drawGameOverScreen(renderer);
      break;
    case 'win':
      drawWinScreen(renderer, state);
      break;
    case 'paused':
      drawGame();
      drawPauseScreen(renderer, state.frame);
      break;
    case 'playing':
    case 'dying':
      drawGame();
      break;
  }
  renderer.flush();
}

function drawGame(): void {
  renderer.clear();

  const viewCols = renderer.width;
  const viewRows = renderer.height;
  const camCol = Math.floor(camera.x);
  const hudRows = 2;

  // Anchor level to bottom of screen: tile row 14 (ground) = last screen row
  const levelScreenBottom = viewRows;
  const levelScreenTop = levelScreenBottom - C.LEVEL_HEIGHT;

  // Fill underground area (below level) with black
  for (let r = levelScreenBottom; r < viewRows; r++) {
    for (let c = 0; c < viewCols; c++) {
      renderer.drawChar(c, r, ' ', 0, C.COLOR_UNDERGROUND_BG);
    }
  }

  // Draw decorative clouds
  drawClouds(camCol, levelScreenTop);

  // Draw tiles
  for (let tileRow = 0; tileRow < C.LEVEL_HEIGHT; tileRow++) {
    const screenRow = levelScreenTop + tileRow;
    if (screenRow < hudRows || screenRow >= viewRows) continue;
    for (let screenCol = 0; screenCol < viewCols; screenCol++) {
      const tileCol = camCol + screenCol;
      const tile = tilemap.get(tileCol, tileRow);
      if (tile !== TileType.AIR) {
        const props = getTileProps(tile);
        renderer.drawChar(screenCol, screenRow, props.char, props.fg, props.bg);
      }
    }
  }

  // Helper to convert tile coords to screen coords
  const tileToScreenY = (tileY: number) => Math.round(tileY) + levelScreenTop;
  const tileToScreenX = (tileX: number) => Math.round(tileX - camera.x);

  // Draw entities
  for (const entity of state.entities) {
    if (!entity.active) continue;
    const screenX = tileToScreenX(entity.x);
    const screenY = tileToScreenY(entity.y);

    if (screenX < -1 || screenX >= viewCols + 1) continue;
    if (screenY < hudRows || screenY >= viewRows) continue;

    switch (entity.type) {
      case EntityType.GOOMBA: {
        const goomba = entity as GoombaState;
        const char = goomba.dying ? '_' : 'g';
        renderer.drawChar(screenX, screenY, char, C.COLOR_GOOMBA_FG, C.COLOR_SKY_BG);
        break;
      }
      case EntityType.KOOPA:
        renderer.drawChar(screenX, screenY, 'k', C.COLOR_KOOPA_FG, C.COLOR_SKY_BG);
        break;
      case EntityType.KOOPA_SHELL:
        renderer.drawChar(screenX, screenY, 'o', C.COLOR_KOOPA_FG, C.COLOR_SKY_BG);
        break;
      case EntityType.COIN_POPUP:
        renderer.drawChar(screenX, screenY, '$', C.COLOR_COIN_FG, C.COLOR_SKY_BG);
        break;
      case EntityType.MUSHROOM:
        renderer.drawChar(screenX, screenY, '^', C.COLOR_MUSHROOM_FG, C.COLOR_SKY_BG);
        break;
    }
  }

  // Draw Mario
  const mario = state.mario;
  const marioScreenX = tileToScreenX(mario.x);
  const marioScreenY = tileToScreenY(mario.y);

  // Invincibility flicker
  const visible = mario.invincibleTimer <= 0 || state.frame % 8 < 4;

  if (visible && marioScreenY >= hudRows && marioScreenY < viewRows && marioScreenX >= 0 && marioScreenX < viewCols) {
    const marioChar = mario.powerup === 'big' ? 'M' : 'm';
    renderer.drawChar(marioScreenX, marioScreenY, marioChar, C.COLOR_MARIO_FG, C.COLOR_SKY_BG);
    // Big Mario: also draw head
    if (mario.powerup === 'big' && marioScreenY - 1 >= hudRows) {
      renderer.drawChar(marioScreenX, marioScreenY - 1, 'M', C.COLOR_MARIO_FG, C.COLOR_SKY_BG);
    }
  }

  // Draw HUD (on top of everything)
  drawHud(renderer, state);
}

function drawClouds(camCol: number, levelTop: number): void {
  // Simple decorative clouds at fixed positions
  const cloudPositions = [10, 30, 55, 75, 100, 125, 150, 180];
  const cloudRow = levelTop + 1; // near the top of the level area

  for (const cloudCol of cloudPositions) {
    const screenCol = cloudCol - camCol;
    if (screenCol >= -3 && screenCol < renderer.width + 3 && cloudRow >= 2) {
      renderer.drawString(screenCol, cloudRow, '~~~', C.COLOR_CLOUD_FG, C.COLOR_SKY_BG);
    }
  }
}

export function cleanup(): void {
  if (gameTimeout) clearTimeout(gameTimeout);
  renderer?.cleanup();
}
