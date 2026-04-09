import { TileType, LevelEntitySpawn, LevelItemDef } from '../types.js';
import { TileMap } from '../tiles/tilemap.js';

const CHAR_TO_TILE: Record<string, TileType> = {
  ' ': TileType.AIR,
  '=': TileType.GROUND,
  'B': TileType.BRICK,
  '?': TileType.QUESTION,
  'S': TileType.BLOCK_SOLID,
  '<': TileType.PIPE_TOP_LEFT,
  '>': TileType.PIPE_TOP_RIGHT,
  '{': TileType.PIPE_BODY_LEFT,
  '}': TileType.PIPE_BODY_RIGHT,
  '|': TileType.FLAGPOLE,
  'F': TileType.FLAG,
};

export interface LoadedLevel {
  tilemap: TileMap;
  entities: LevelEntitySpawn[];
  items: LevelItemDef[];
}

export function loadLevel(
  rows: string[],
  entitySpawns: LevelEntitySpawn[],
  items: LevelItemDef[],
): LoadedLevel {
  const height = rows.length;
  const width = Math.max(...rows.map(r => r.length));

  const tilemap = new TileMap(width, height);

  for (let r = 0; r < height; r++) {
    const row = rows[r]!;
    for (let c = 0; c < width; c++) {
      const ch = c < row.length ? row[c]! : ' ';
      const tile = CHAR_TO_TILE[ch] ?? TileType.AIR;
      tilemap.set(c, r, tile);
    }
  }

  // Reset spawn state
  const entities = entitySpawns.map(e => ({ ...e, spawned: false }));
  const itemsCopy = items.map(i => ({ ...i }));

  return { tilemap, entities, items: itemsCopy };
}
