/**
 * SMART QUIZ SMP 19 PALEMBANG - Audio Engine
 * Menggunakan Web Audio API untuk menghasilkan efek suara prosedural
 * 100% offline, tanpa unduh file eksternal, tanpa latency!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.5;
    
    // Inisialisasi AudioContext saat ada interaksi pertama
    const initAudio = () => {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    // Load preferensi mute dari localStorage
    const savedMute = localStorage.getItem('smartquiz_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('smartquiz_muted', this.isMuted);
    return this.isMuted;
  }

  setMute(state) {
    this.isMuted = !!state;
    localStorage.setItem('smartquiz_muted', this.isMuted);
  }

  // Efek tombol klik halus
  playClick() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Efek jawaban BENAR (Major chord arpeggio yang riang)
  playCorrect() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        const startTime = ctx.currentTime + idx * 0.08;
        const duration = 0.35;

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Efek jawaban SALAH (Dissonant descending buzz yang mendidik/lembut)
  playWrong() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      const now = ctx.currentTime;
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.35);

      osc2.frequency.setValueAtTime(245, now);
      osc2.frequency.exponentialRampToValueAtTime(130, now + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Efek detak jam timer (Woodblock / Clock Tick)
  playTick(isUrgent = false) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = isUrgent ? 'square' : 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 880 : 540, now);
      osc.frequency.exponentialRampToValueAtTime(isUrgent ? 440 : 200, now + 0.04);

      gain.gain.setValueAtTime(this.volume * (isUrgent ? 0.3 : 0.15), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Efek Waktu Habis
  playTimesUp() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [392, 349.23, 329.63, 293.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.1;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(this.volume * 0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Efek Power-Up diaktifkan
  playPowerUp() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(this.volume * 0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Efek Streak bonus bertambah
  playStreak() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const notes = [587.33, 739.99, 880, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = ctx.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(this.volume * 0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Efek Kemenangan / Pemenang Kuis / Fanfare Podium
  playVictory() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.15, pause: 0 },
        { f: 523.25, d: 0.15, pause: 0.15 },
        { f: 523.25, d: 0.15, pause: 0.30 },
        { f: 659.25, d: 0.40, pause: 0.45 },
        { f: 587.33, d: 0.20, pause: 0.90 },
        { f: 659.25, d: 0.20, pause: 1.10 },
        { f: 783.99, d: 0.65, pause: 1.30 }
      ];

      const now = ctx.currentTime;
      melody.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + item.pause;
        osc.frequency.setValueAtTime(item.f, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(this.volume * 0.45, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + item.d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + item.d);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }
}

// Global singleton instance
window.smartSound = new SoundEngine();
