# Super Mario Terminal

A real-time side-scrolling Super Mario Bros game that runs entirely in your terminal. Built with TypeScript and zero runtime dependencies — just raw ANSI escape codes.

## Quick Start

```bash
pnpm install
pnpm dev
```

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move left/right |
| Space / Up / W | Jump (hold for higher) |
| Q / Ctrl+C | Quit |

## Features

- Side-scrolling platformer with smooth physics
- Variable-height jumping (tap vs hold)
- Level 1-1 inspired layout with pipes, gaps, and platforms
- Enemies: Goombas and Koopas (stomp to defeat)
- ? blocks with coins and mushroom powerups
- Small/Big Mario powerup system
- Score, coin counter, lives, and countdown timer
- Title screen, game over, and course clear screens
- Flicker-free double-buffered terminal rendering

## Scripts

```bash
pnpm dev      # Run directly (no build step)
pnpm build    # Compile TypeScript
pnpm start    # Run compiled version
```

## Requirements

- Node.js 18+
- A terminal with 256-color support (most modern terminals)

## How It Works

The game renders at 30fps using raw ANSI escape codes written directly to stdout. A double-buffer system diffs each frame and only writes changed cells, keeping output flicker-free. Physics use a fixed-timestep accumulator with separated-axis collision detection against a tile grid.
