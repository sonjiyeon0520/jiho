// Web Audio API Synthesizer & Speech Service for Kids Vehicles

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true;
  private engineLoopGain: GainNode | null = null;
  private engineLoopOsc: OscillatorNode | null = null;

  constructor() {
    // Initialized lazily on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopEngine();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
  }

  public getVoiceEnabled() {
    return this.isVoiceEnabled;
  }

  // Friendly voice encouragement for toddlers
  public speak(text: string) {
    if (!this.isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.25; // Warm, friendly pitch for young kids
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore if speech fails
    }
  }

  // 1. Piece snap: satisfying crisp mechanical click + high sparkle
  public playSnap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Crisp click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);

    // Chime overtone
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1046.5, t + 0.04); // C6
    chimeGain.gain.setValueAtTime(0.2, t + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);
    chime.start(t + 0.04);
    chime.stop(t + 0.28);
  }

  // 2. Pick up piece
  public playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.06);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 3. Engine rev / rumble
  public playEngineRev() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.exponentialRampToValueAtTime(420, t + 0.35);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.85);

    osc.frequency.setValueAtTime(55, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.35);
    osc.frequency.linearRampToValueAtTime(45, t + 0.85);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.9);
  }

  // 4. Hydraulic sound (for excavator arm, dump truck tilt, bulldozer lift)
  public playHydraulic() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // High-pressure hiss (white noise through bandpass)
    const bufferSize = this.ctx.sampleRate * 0.7;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.value = 3.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(t);

    // Motor whirr
    const motor = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    motor.type = 'sine';
    motor.frequency.setValueAtTime(180, t);
    motor.frequency.linearRampToValueAtTime(240, t + 0.35);
    motor.frequency.linearRampToValueAtTime(150, t + 0.7);

    motorGain.gain.setValueAtTime(0.12, t);
    motorGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    motor.connect(motorGain);
    motorGain.connect(this.ctx.destination);
    motor.start(t);
    motor.stop(t + 0.7);
  }

  // 5. Heavy horn honk
  public playHorn(vehicle: 'heavy' | 'car') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freq1 = vehicle === 'heavy' ? 185 : 349;
    const freq2 = vehicle === 'heavy' ? 233 : 440;

    [freq1, freq2].forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.setValueAtTime(0.15, t + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // 6. Police / Fire Emergency Siren
  public playSiren(durationSec: number = 1.8) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Two-tone wail
    const cycles = 4;
    const cycleLen = durationSec / cycles;
    for (let i = 0; i < cycles; i++) {
      const startT = t + i * cycleLen;
      osc.frequency.setValueAtTime(650, startT);
      osc.frequency.linearRampToValueAtTime(950, startT + cycleLen * 0.5);
      osc.frequency.linearRampToValueAtTime(650, startT + cycleLen);
    }

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.setValueAtTime(0.18, t + durationSec - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + durationSec);
  }

  // 7. Gravel / Sand dumping sound
  public playDumpSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 1.2;
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(300, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  // 8. Water cannon spray
  public playWaterSpray() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 1.0;
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  // 9. Soft collision bounce / cone hit
  public playBump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 10. Grand Fanfare for Puzzle & Parking completion
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.15, wait: 0 },    // C5
      { f: 659.25, d: 0.15, wait: 0.12 }, // E5
      { f: 783.99, d: 0.15, wait: 0.24 }, // G5
      { f: 1046.5, d: 0.45, wait: 0.38 }, // C6
    ];

    const t = this.ctx.currentTime;
    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t + n.wait);

      gain.gain.setValueAtTime(0.25, t + n.wait);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.wait + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + n.wait);
      osc.stop(t + n.wait + n.d);
    });
  }

  // Continuous gentle engine idling while driving
  public startDrivingEngine(pitchRatio: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (!this.engineLoopOsc) {
      const t = this.ctx.currentTime;
      this.engineLoopOsc = this.ctx.createOscillator();
      this.engineLoopGain = this.ctx.createGain();

      this.engineLoopOsc.type = 'sawtooth';
      this.engineLoopOsc.frequency.setValueAtTime(60 * pitchRatio, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, t);

      this.engineLoopGain.gain.setValueAtTime(0.08, t);

      this.engineLoopOsc.connect(filter);
      filter.connect(this.engineLoopGain);
      this.engineLoopGain.connect(this.ctx.destination);
      this.engineLoopOsc.start(t);
    } else if (this.engineLoopOsc && this.ctx) {
      const t = this.ctx.currentTime;
      this.engineLoopOsc.frequency.linearRampToValueAtTime(60 * pitchRatio, t + 0.1);
    }
  }

  public stopEngine() {
    if (this.engineLoopOsc) {
      try {
        this.engineLoopOsc.stop();
        this.engineLoopOsc.disconnect();
      } catch {
        // Ignored
      }
      this.engineLoopOsc = null;
      this.engineLoopGain = null;
    }
  }
}

export const sound = new SoundService();
