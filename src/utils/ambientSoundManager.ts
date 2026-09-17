/**
 * Ambient Background Sound State Manager
 * Handles video sound unmuting, volume adjustment, and persistence.
 */

type Listener = () => void;
const listeners = new Set<Listener>();

let isMuted: boolean = (() => {
  try {
    const saved = localStorage.getItem('sakinward_bg_muted');
    return saved !== null ? saved === 'true' : false; // Default: sound ON (not muted)
  } catch {
    return false;
  }
})();

let volume: number = (() => {
  try {
    const saved = localStorage.getItem('sakinward_bg_volume');
    return saved !== null ? parseFloat(saved) : 1.0;
  } catch {
    return 1.0;
  }
})();

function notify() {
  listeners.forEach((fn) => fn());
}

export const ambientSound = {
  getIsMuted() {
    return isMuted;
  },
  getVolume() {
    return volume;
  },
  toggleMute() {
    isMuted = !isMuted;
    try {
      localStorage.setItem('sakinward_bg_muted', String(isMuted));
    } catch {}
    notify();
    return isMuted;
  },
  setMuted(muted: boolean) {
    isMuted = muted;
    try {
      localStorage.setItem('sakinward_bg_muted', String(isMuted));
    } catch {}
    notify();
  },
  setVolume(vol: number) {
    volume = Math.max(0, Math.min(1, vol));
    if (volume > 0 && isMuted) {
      isMuted = false;
      try {
        localStorage.setItem('sakinward_bg_muted', 'false');
      } catch {}
    }
    try {
      localStorage.setItem('sakinward_bg_volume', String(volume));
    } catch {}
    notify();
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
