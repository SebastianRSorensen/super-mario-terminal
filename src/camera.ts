import { Camera, MarioState } from './types.js';

export function updateCamera(camera: Camera, mario: MarioState, viewportWidth: number, levelWidth: number): void {
  const targetX = mario.x - viewportWidth / 3;
  if (targetX > camera.x) {
    camera.x = targetX;
  }
  camera.x = Math.max(0, Math.min(camera.x, levelWidth - viewportWidth));
}
