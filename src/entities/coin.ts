import { CoinPopup, EntityType } from '../types.js';
import { COIN_POPUP_FRAMES } from '../constants.js';

export function createCoinPopup(x: number, y: number): CoinPopup {
  return {
    x,
    y,
    vx: 0,
    vy: -8,
    width: 0.5,
    height: 0.5,
    active: true,
    type: EntityType.COIN_POPUP,
    timer: COIN_POPUP_FRAMES,
  };
}

export function updateCoinPopup(coin: CoinPopup, dt: number): void {
  coin.timer--;
  coin.y += coin.vy * dt;
  coin.vy += 20 * dt; // coin gravity (lighter than normal)
  if (coin.timer <= 0) {
    coin.active = false;
  }
}
