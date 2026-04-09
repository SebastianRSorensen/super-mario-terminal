// Per-key state tracking
interface KeyState {
  lastSeenFrame: number;
  holding: boolean; // true once key-repeat is detected
}

const keys = new Map<string, KeyState>();
const pressedThisFrame = new Set<string>();
let frameCounter = 0;
let lastAnyInputFrame = 0;

// Once key-repeat is detected, use a long hold to bridge gaps between repeats.
// Before that, use a short hold so taps produce small movement.
const TAP_HOLD = 3;         // 100ms — single tap ≈ 1 cell
const REPEAT_HOLD = 10;     // 333ms — bridges gaps between key-repeat events
// Window for detecting that a second event is a key-repeat (not a fresh press).
// Must be longer than the OS key-repeat delay (~300-500ms).
const REPEAT_DETECT = 18;   // 600ms

export function initInput(): void {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data: string) => {
    for (const key of parseKeys(data)) {
      const state = keys.get(key);
      const gap = state ? frameCounter - state.lastSeenFrame : Infinity;

      if (gap <= REPEAT_DETECT && state) {
        // Event arrived within detection window → key-repeat confirmed
        state.holding = true;
        state.lastSeenFrame = frameCounter;
      } else {
        // Fresh press
        keys.set(key, { lastSeenFrame: frameCounter, holding: false });
        pressedThisFrame.add(key);
      }

      lastAnyInputFrame = frameCounter;
    }
  });
}

function parseKeys(data: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < data.length) {
    if (data[i] === '\x1b' && data[i + 1] === '[') {
      switch (data[i + 2]) {
        case 'A': result.push('up'); break;
        case 'B': result.push('down'); break;
        case 'C': result.push('right'); break;
        case 'D': result.push('left'); break;
      }
      i += 3;
    } else if (data[i] === '\x03') {
      result.push('quit');
      i++;
    } else {
      const ch = data[i]!.toLowerCase();
      switch (ch) {
        case 'w': result.push('up'); break;
        case 'a': result.push('left'); break;
        case 's': result.push('down'); break;
        case 'd': result.push('right'); break;
        case ' ': result.push('space'); break;
        case 'q': result.push('quit'); break;
        case '\r': result.push('enter'); break;
        case '\n': result.push('enter'); break;
        default: result.push(ch); break;
      }
      i++;
    }
  }
  return result;
}

export function isKeyDown(key: string): boolean {
  const state = keys.get(key);
  if (!state) return false;
  const hold = state.holding ? REPEAT_HOLD : TAP_HOLD;
  return (frameCounter - state.lastSeenFrame) <= hold;
}

export function wasKeyPressed(key: string): boolean {
  return pressedThisFrame.has(key);
}

export function isAnyKeyRecent(): boolean {
  return (frameCounter - lastAnyInputFrame) <= REPEAT_HOLD;
}

export function tickInput(): void {
  frameCounter++;
  pressedThisFrame.clear();
}
