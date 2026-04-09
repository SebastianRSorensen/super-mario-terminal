import { LevelEntitySpawn, LevelItemDef } from '../types.js';

// Level 1-1 inspired layout. 15 rows tall, ~212 columns wide.
// Legend: ' '=air, '='=ground, 'B'=brick, '?'=question block, 'S'=solid block
// '<'=pipe top left, '>'=pipe top right, '{'=pipe body left, '}'=pipe body right
// '|'=flagpole, 'F'=flag
export const LEVEL_1_1_ROWS: string[] = [
  //          1111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333444444444455555555556666666666777777777788888888889999999999000000000011111111112222
  //0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012
  '                                                                                                                                                                                                           |    ',  // 0
  '                                                                                                                                                                                                           |    ',  // 1
  '                                                                                                                                                                                                          F|    ',  // 2
  '                                                                                                                                                                                                           |    ',  // 3
  '                                                                                                                                                                                           S               |    ',  // 4
  '                                                                                                                                                                                          SS               |    ',  // 5
  '                                                                                                                                                                                         SSS               |    ',  // 6
  '                                                                                                                                                                                        SSSS               |    ',  // 7
  '                                                                                                                                                                                       SSSSS               |    ',  // 8
  '                    ?         ?B?B?                                    ?   ?                           B  B?B  B                                    BB   ?  BB                          SSSSSS               |    ',  // 9
  '                                                                                                                                                                                      SSSSSSS               |    ',  // 10
  '                                                                                                                                                                                     SSSSSSSS               |    ',  // 11
  '                         <>          <>             <>                                           <>                    <>          <>                                                SSSSSSSSS               |    ',  // 12
  '============================  ========{}========  =={}=============  ======{}======  ====================={}===  ============{}=========={}==================  ===  ===  ===  =================={}============{}====',  // 13
  '============================  ========{}========  =={}=============  ======{}======  ====================={}===  ============{}=========={}==================  ===  ===  ===  =================={}============{}====',  // 14
];

export const MARIO_START_COL = 3;
export const MARIO_START_ROW = 12;

export const LEVEL_1_1_ENTITIES: LevelEntitySpawn[] = [
  { type: 'goomba', col: 22, row: 12, spawned: false },
  { type: 'goomba', col: 40, row: 12, spawned: false },
  { type: 'goomba', col: 51, row: 12, spawned: false },
  { type: 'goomba', col: 53, row: 12, spawned: false },
  { type: 'koopa',  col: 80, row: 12, spawned: false },
  { type: 'goomba', col: 97, row: 12, spawned: false },
  { type: 'goomba', col: 99, row: 12, spawned: false },
  { type: 'goomba', col: 114, row: 12, spawned: false },
  { type: 'goomba', col: 116, row: 12, spawned: false },
  { type: 'goomba', col: 124, row: 12, spawned: false },
  { type: 'goomba', col: 126, row: 12, spawned: false },
  { type: 'goomba', col: 140, row: 12, spawned: false },
  { type: 'koopa',  col: 155, row: 12, spawned: false },
  { type: 'goomba', col: 166, row: 12, spawned: false },
  { type: 'goomba', col: 168, row: 12, spawned: false },
];

export const LEVEL_1_1_ITEMS: LevelItemDef[] = [
  { col: 20, row: 9, item: 'coin' },
  { col: 24, row: 9, item: 'mushroom' },
  { col: 25, row: 9, item: 'coin' },
  { col: 27, row: 9, item: 'coin' },
  { col: 73, row: 9, item: 'coin' },
  { col: 77, row: 9, item: 'mushroom' },
  { col: 106, row: 9, item: 'coin' },
  { col: 109, row: 9, item: 'coin' },
  { col: 144, row: 9, item: 'coin' },
];
