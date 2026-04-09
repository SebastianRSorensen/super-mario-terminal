# Super Mario Terminal - Implementation Plan

## Context
Build a real-time side-scrolling Super Mario Bros platformer that runs entirely in the terminal. The project repo is empty (just a README). The goal is a playable game with classic Mario mechanics: running, jumping, enemies, blocks, coins, and a complete level.

## Status: v1.0 Complete

All 5 phases have been implemented. The game compiles cleanly and is playable.

- [x] Phase 1: Scaffold + Renderer
- [x] Phase 2: World (tiles, level, camera)
- [x] Phase 3: Mario + Physics
- [x] Phase 4: Enemies + Items
- [x] Phase 5: Polish (UI, screens, game flow)

## Tech Stack
- **TypeScript + Node.js** — zero runtime dependencies
- Raw ANSI escape codes to `process.stdout` (no blessed/terminal-kit)
- Raw `process.stdin` in raw mode for immediate input
- Dev deps only: `typescript`, `@types/node`, `tsx`
- Package manager: **pnpm**

## File Structure
```
package.json / tsconfig.json
bin/mario.ts                    # Entry point, terminal setup/cleanup
src/
  constants.ts                  # Physics values, dimensions, timing, colors
  types.ts                      # Shared types (Entity, GameState, TileType, etc.)
  game.ts                       # Game loop, state machine, orchestrator
  input.ts                      # Raw stdin keypress handling, key-down tracking
  renderer.ts                   # Double-buffered ANSI renderer (diff-based)
  physics.ts                    # Gravity, tile collision, entity collision
  camera.ts                     # Viewport scrolling (right-only, like original)
  entities/
    mario.ts                    # Movement, jump, powerups, damage
    goomba.ts                   # Walk, reverse at walls, stomp death
    koopa.ts                    # Walk, shell state, kick mechanics
    coin.ts                     # Popup animation from ? blocks
    mushroom.ts                 # Powerup movement
  tiles/
    tilemap.ts                  # 2D tile grid (Uint8Array)
    tiles.ts                    # TileType enum, solid/breakable properties
  level/
    level-data.ts               # Level 1-1 layout as string arrays + entity spawns
    level-loader.ts             # Parse into TileMap + entity list
  ui/
    hud.ts                      # Score, coins, lives, time (top 2 rows)
    screens.ts                  # Title, game over, win screens
```

## Core Systems

### Renderer
- Double-buffered with diff-based flushing (only changed cells written)
- ANSI 256-color, single `stdout.write()` per frame for flicker-free output
- Visual: `m/M`=Mario, `g`=Goomba, `k`=Koopa, `o`=Shell, `?`=Question, `#`=Brick, `=`=Ground, `[]`=Pipes, `$`=Coin, `^`=Mushroom

### Physics
- 30 ticks/second fixed timestep with accumulator catch-up
- Separated-axis tile collision (move X then resolve, move Y then resolve)
- Variable-height jump (reduced gravity while holding jump + moving up)
- Block-hit detection (? blocks spawn coins/mushrooms, big Mario breaks bricks)
- AABB entity-vs-entity collisions (stomp, kick, collect, damage)

### Game Flow
- State machine: TITLE -> PLAYING -> WIN, with DYING -> GAMEOVER branching
- 3 lives, score tracking, 400-second countdown timer
- Enemies spawn on camera approach, not all at once

## Implementation Order

### Phase 1: Scaffold + Renderer - DONE
1. ~~Create `package.json`, `tsconfig.json`~~
2. ~~`src/constants.ts`, `src/types.ts` - all type definitions~~
3. ~~`src/renderer.ts` - double-buffered terminal renderer~~
4. ~~`src/input.ts` - keyboard input~~
5. ~~`bin/mario.ts` - entry point with terminal cleanup~~

### Phase 2: World - DONE
6. ~~`src/tiles/tiles.ts`, `src/tiles/tilemap.ts` - tile system~~
7. ~~`src/level/level-data.ts`, `src/level/level-loader.ts` - level 1-1~~
8. ~~`src/camera.ts` - viewport scrolling~~
9. ~~Wire up: render tiles, scroll with keys~~

### Phase 3: Mario + Physics - DONE
10. ~~`src/entities/mario.ts` - Mario movement and state~~
11. ~~`src/physics.ts` - gravity and collision~~
12. ~~`src/game.ts` - game loop~~
13. ~~Wire up: Mario runs and jumps through level with collision~~

### Phase 4: Enemies + Items - DONE
14. ~~`src/entities/goomba.ts`, `src/entities/koopa.ts` - enemy AI~~
15. ~~`src/entities/coin.ts`, `src/entities/mushroom.ts` - items~~
16. ~~Block-hit logic, entity-vs-entity collision~~
17. ~~Score, coins, lives tracking~~

### Phase 5: Polish - DONE
18. ~~`src/ui/hud.ts` - HUD display~~
19. ~~`src/ui/screens.ts` - title/gameover/win screens~~
20. ~~Game state machine transitions, death animation, invincibility flicker~~
21. ~~Flagpole win sequence, timer countdown~~
22. ~~Physics tuning for good game feel~~

## Verification
1. ~~`pnpm install && pnpm build` - compiles without errors~~
2. `pnpm start` - launches the game in terminal
3. Test: title screen appears, space starts game
4. Test: Mario moves left/right, jumps with variable height
5. Test: collides with ground, blocks, pipes correctly
6. Test: ? blocks give coins (score increases), mushroom makes Mario big
7. Test: stomping goombas/koopas works, side-contact damages Mario
8. Test: falling in gaps or timer=0 triggers death, lives decrement
9. Test: reaching flagpole shows win screen
10. Test: 0 lives -> game over -> back to title

## Possible Future Improvements
- Fire flower powerup + fireball throwing
- Additional levels (1-2, 1-3, etc.)
- Sound effects (terminal bell or system audio)
- High score persistence
- Starman invincibility powerup
- Underground/underwater sections
- Animated sprites (multi-frame character art)
