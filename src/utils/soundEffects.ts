// Web Audio API helper for zero-latency, realistic haptic sound feedback
class SoundManager {
  private ctx: AudioContext | null = null;
  private soundFxEnabled: boolean = (() => {
    try {
      const saved = localStorage.getItem('sakinward_sound_fx');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  })();

  isSoundFxEnabled(): boolean {
    return this.soundFxEnabled;
  }

  setSoundFxEnabled(enabled: boolean) {
    this.soundFxEnabled = enabled;
    try {
      localStorage.setItem('sakinward_sound_fx', String(enabled));
    } catch {}
  }

  toggleSoundFx(): boolean {
    this.setSoundFxEnabled(!this.soundFxEnabled);
    return this.soundFxEnabled;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Soft wooden bead click for Tasbih
  playBeadClick() {
    if (!this.soundFxEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (e) {
      // Audio might be blocked by browser policy until interaction
    }
  }

  // Heavenly chime for completion
  playChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.85);
      });
    } catch (e) {}
  }

  // Serene sound preview at specific volume
  playSereneTone(volume = 0.5) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const freqs = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      const now = ctx.currentTime;
      const vol = Math.max(0.05, Math.min(1.0, volume));

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);

        gain.gain.setValueAtTime(0.2 * vol, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.95);
      });
    } catch (e) {}
  }

  // Gentle haptic feedback
  triggerHaptic() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }
  }
}

export const soundManager = new SoundManager();
