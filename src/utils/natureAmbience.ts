// Web Audio Nature Ambience Synthesizer for Sakinward
// Pure client-side nature soundscapes (Rain, Ocean, Night Breeze, Stream, Cosmic Resonance)

class AmbienceEngine {
  private ctx: AudioContext | null = null;
  private currentMode: string | null = null;
  private nodes: { [key: string]: any } = {};
  private isRunning: boolean = false;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  public play(mode: 'rain' | 'ocean' | 'breeze' | 'stream' | 'cosmos') {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentMode = mode;
    this.isRunning = true;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.gainNode = masterGain;

    if (mode === 'rain') {
      this.startRain(masterGain);
    } else if (mode === 'ocean') {
      this.startOcean(masterGain);
    } else if (mode === 'breeze') {
      this.startBreeze(masterGain);
    } else if (mode === 'stream') {
      this.startStream(masterGain);
    } else if (mode === 'cosmos') {
      this.startCosmos(masterGain);
    }
  }

  private startRain(dest: AudioNode) {
    if (!this.ctx) return;
    // Pink noise buffer generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(dest);
    whiteNoise.start();

    this.nodes['noise'] = whiteNoise;
  }

  private startOcean(dest: AudioNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Ocean swell LFO
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    brownNoise.connect(filter);
    filter.connect(dest);

    brownNoise.start();
    lfo.start();

    this.nodes['noise'] = brownNoise;
    this.nodes['lfo'] = lfo;
  }

  private startBreeze(dest: AudioNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (last + 0.04 * white) / 1.04;
      last = output[i];
      output[i] *= 2.0;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(dest);

    noise.start();
    lfo.start();

    this.nodes['noise'] = noise;
    this.nodes['lfo'] = lfo;
  }

  private startStream(dest: AudioNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter1.Q.setValueAtTime(2.0, this.ctx.currentTime);

    noise.connect(filter1);
    filter1.connect(dest);

    noise.start();
    this.nodes['noise'] = noise;
  }

  private startCosmos(dest: AudioNode) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, this.ctx.currentTime); // Deep calming tone

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(162, this.ctx.currentTime); // Perfect fifth harmony

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(216, this.ctx.currentTime); // Octave

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    osc1.connect(subGain);
    osc2.connect(subGain);
    osc3.connect(subGain);
    subGain.connect(dest);

    osc1.start();
    osc2.start();
    osc3.start();

    this.nodes['osc1'] = osc1;
    this.nodes['osc2'] = osc2;
    this.nodes['osc3'] = osc3;
  }

  public stop() {
    this.isRunning = false;
    this.currentMode = null;
    try {
      Object.keys(this.nodes).forEach((key) => {
        if (this.nodes[key]) {
          try {
            this.nodes[key].stop();
            this.nodes[key].disconnect();
          } catch {}
        }
      });
      if (this.gainNode) {
        this.gainNode.disconnect();
      }
    } catch {}
    this.nodes = {};
  }

  public getActiveMode() {
    return this.currentMode;
  }

  public getIsRunning() {
    return this.isRunning;
  }
}

export const natureSoundscape = new AmbienceEngine();
