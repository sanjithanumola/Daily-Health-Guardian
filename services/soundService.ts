// Web Audio API Sound Service for Health Guardian Alerts
class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Load sound preference from localStorage
    const savedMute = localStorage.getItem('health_guardian_sound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public setSoundMuted(muted: boolean): void {
    this.isMuted = muted;
    localStorage.setItem('health_guardian_sound_muted', String(muted));
  }

  public playAlertTone(type: 'chime' | 'gentle' | 'bell' | 'pulse' = 'chime'): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'chime') {
        // High quality dual-chime harmonic tone (D5 -> A5 -> D6)
        const notes = [587.33, 880.0, 1174.66];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.12);

          gain.gain.setValueAtTime(0.001, now + index * 0.12);
          gain.gain.linearRampToValueAtTime(0.25, now + index * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + index * 0.12);
          osc.stop(now + index * 0.12 + 0.85);
        });
      } else if (type === 'gentle') {
        // Soft ambient marimba / sine wave
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + index * 0.15);

          gain.gain.setValueAtTime(0.001, now + index * 0.15);
          gain.gain.linearRampToValueAtTime(0.2, now + index * 0.15 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + index * 0.15);
          osc.stop(now + index * 0.15 + 0.65);
        });
      } else if (type === 'bell') {
        // Clear bell chime
        const baseFreq = 880; // A5
        const harmonics = [1, 2, 2.76, 5.4];
        harmonics.forEach((mult, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * mult, now);

          const initialGain = 0.2 / (idx + 1);
          gain.gain.setValueAtTime(initialGain, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 / (idx + 1));

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.3);
        });
      } else {
        // Pulse tone
        [0, 0.2, 0.4].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now + delay);

          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.18);
        });
      }
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
}

export const soundService = new SoundService();
