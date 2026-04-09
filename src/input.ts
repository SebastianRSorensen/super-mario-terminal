// Three-state key tracking: inactive → tap → held → inactive
// Distinguishes single taps (~1 cell nudge) from sustained holds (acceleration).
// Held keys use global activity tracking to survive when another key steals
// the terminal's repeat — the key stays held as long as ANY key is generating events.

type KeyPhase = 'inactive' | 'tap' | 'held';

interface KeyEntry {
  phase: KeyPhase;
  lastSeen: number;          // performance.now() timestamp
  pressedThisFrame: boolean; // edge trigger, consumed on first read
  tapConsumed: boolean;      // true once the 1-cell impulse has been applied
}

// TAP_WINDOW_MS: how long a tap stays active waiting for a repeat event.
// Must exceed the OS key-repeat initial delay (~300-500ms) so holds are detected.
const TAP_WINDOW_MS = 400;

// RELEASE_THRESHOLD_MS: how long a held key stays active between repeat events.
// Also used as the global-silence threshold for releasing held keys.
const RELEASE_THRESHOLD_MS = 150;

// HELD_MAX_SILENCE_MS: absolute maximum time a held key stays active without
// its own events, even if other keys are active. Covers edge case where player
// releases a direction key while mashing other keys repeatedly.
const HELD_MAX_SILENCE_MS = 1000;

const keyMap = new Map<string, KeyEntry>();
const eventQueue: string[] = [];
let lastAnyKeyEvent = 0;

// Opposing directions — pressing one cancels the other
const OPPOSITES: Record<string, string> = { left: 'right', right: 'left', up: 'down', down: 'up' };

export function initInput(): void {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data: string) => {
    const keys = parseKeys(data);
    eventQueue.push(...keys);
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

export function updateInput(): void {
  const now = performance.now();

  // Clear per-frame edge triggers
  for (const entry of keyMap.values()) {
    entry.pressedThisFrame = false;
  }

  // Drain event queue — apply phase transitions
  while (eventQueue.length > 0) {
    const key = eventQueue.shift()!;
    lastAnyKeyEvent = now;

    let entry = keyMap.get(key);
    if (!entry) {
      entry = { phase: 'inactive', lastSeen: 0, pressedThisFrame: false, tapConsumed: false };
      keyMap.set(key, entry);
    }

    if (entry.phase === 'inactive') {
      // Fresh press → tap
      entry.phase = 'tap';
      entry.pressedThisFrame = true;
      entry.tapConsumed = false;

      // Cancel opposing direction to prevent both-active glitch
      const opp = OPPOSITES[key];
      if (opp) {
        const oppEntry = keyMap.get(opp);
        if (oppEntry && oppEntry.phase !== 'inactive') {
          oppEntry.phase = 'inactive';
        }
      }
    } else if (entry.phase === 'tap') {
      // Second event while in tap → confirmed held
      entry.phase = 'held';
    }
    // If already 'held', just refresh timestamp

    entry.lastSeen = now;
  }

  // Timeout-based phase transitions
  for (const entry of keyMap.values()) {
    if (entry.phase === 'inactive') continue;
    const elapsed = now - entry.lastSeen;

    if (entry.phase === 'tap' && elapsed > TAP_WINDOW_MS) {
      // Tap expired with no repeat → release
      entry.phase = 'inactive';
    } else if (entry.phase === 'held') {
      const globalSilence = now - lastAnyKeyEvent;

      if (elapsed > RELEASE_THRESHOLD_MS && globalSilence > RELEASE_THRESHOLD_MS) {
        // No events from ANY key for 150ms → player released
        entry.phase = 'inactive';
      } else if (elapsed > HELD_MAX_SILENCE_MS) {
        // Safety cap: don't hold forever even with other key activity
        entry.phase = 'inactive';
      }
    }
  }
}

// True when the key is in any active state (tap or held).
// Used for jump hold detection (variable-height jump).
export function isKeyDown(key: string): boolean {
  const phase = keyMap.get(key)?.phase ?? 'inactive';
  return phase !== 'inactive';
}

// True when the player is confirmed holding (repeat events detected).
// Used for acceleration-based horizontal movement.
export function isKeyHeld(key: string): boolean {
  return keyMap.get(key)?.phase === 'held';
}

// Edge trigger — true only once per press, auto-consumed on first read.
export function wasKeyPressed(key: string): boolean {
  const entry = keyMap.get(key);
  if (entry?.pressedThisFrame) {
    entry.pressedThisFrame = false;
    return true;
  }
  return false;
}

// Returns true once per tap to apply the initial impulse, then marks consumed.
// Subsequent calls while still in tap phase return false (friction takes over).
export function consumeTap(key: string): boolean {
  const entry = keyMap.get(key);
  if (entry?.phase === 'tap' && !entry.tapConsumed) {
    entry.tapConsumed = true;
    return true;
  }
  return false;
}
