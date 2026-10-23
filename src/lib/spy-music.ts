/**
 * Procedural spy-thriller background loop (Web Audio API, no audio files).
 * 4 bars in E minor: Em – Em7 – Cmaj7 – B7, with the classic chromatic spy vamp,
 * a pulsing bass, a delayed arpeggio and light tactical percussion.
 */

const BPM = 108;
const STEP = 60 / BPM / 4; // one 16th note, in seconds
const STEPS_PER_BAR = 16;
const BARS = 4;
const VOLUME = 0.45;
const LOOKAHEAD_S = 0.12;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

const BASS_ROOTS = [40, 40, 36, 35]; // E2 E2 C2 B1
const ARP_CHORDS = [
  [52, 55, 59, 66], // Em(add9)
  [52, 55, 59, 62], // Em7
  [48, 52, 55, 59], // Cmaj7
  [47, 51, 54, 57], // B7
];
const ARP_ORDER = [0, 1, 2, 3, 2, 1, 3, 2];
// Bass: step → semitone offset from the bar's root.
const BASS_PATTERN: Record<number, number> = { 0: 0, 3: 0, 6: 12, 8: 0, 10: 0, 11: 7, 14: 12 };
// Spy vamp (5 – b6 – 6 – b6 over E minor), quarter notes in bars 1–2.
const VAMP = [59, 60, 61, 60];

class SpyMusic {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private delayIn!: GainNode;
  private noise!: AudioBuffer;
  private timer: number | null = null;
  private suspendTimer: number | null = null;
  private step = 0;
  private nextTime = 0;
  playing = false;

  private init() {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(comp);

    // Dotted-8th echo for the arpeggio.
    this.delayIn = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = STEP * 3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    this.delayIn.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(this.master);

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    document.addEventListener("visibilitychange", () => {
      if (!this.ctx || !this.playing) return;
      if (document.hidden) this.ctx.suspend();
      else this.ctx.resume();
    });
  }

  start() {
    if (!this.ctx) this.init();
    const ctx = this.ctx!;
    if (this.suspendTimer) window.clearTimeout(this.suspendTimer);
    ctx.resume();
    if (this.playing) return;
    this.playing = true;

    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now);
    this.master.gain.exponentialRampToValueAtTime(VOLUME, now + 1.5);

    this.step = 0;
    this.nextTime = now + 0.05;
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  stop() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.suspendTimer = window.setTimeout(() => this.ctx?.suspend(), 500);
  }

  private schedule() {
    const ctx = this.ctx!;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD_S) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += STEP;
      this.step = (this.step + 1) % (STEPS_PER_BAR * BARS);
    }
  }

  private playStep(step: number, t: number) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const s = step % STEPS_PER_BAR;

    // Drums
    if (s === 0 || s === 8 || (bar === 3 && s === 11)) this.kick(t);
    if (s === 4 || s === 12) this.rim(t);
    this.hat(t, s % 4 === 2 ? 0.09 : 0.03);

    // Bass
    const offset = BASS_PATTERN[s];
    if (offset !== undefined) this.bass(midi(BASS_ROOTS[bar] + offset), t);

    // Arpeggio on 8ths
    if (s % 2 === 0) {
      const chord = ARP_CHORDS[bar];
      this.pluck(midi(chord[ARP_ORDER[s / 2]] + 12), t);
    }

    // Spy vamp on quarters, bars 1–2
    if (bar < 2 && s % 4 === 0) this.vamp(midi(VAMP[s / 4]), t, STEP * 4);
  }

  private voice(type: OscillatorType, freq: number, t: number, peak: number, attack: number, decay: number, cutoff: number, send = false) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    osc.connect(filter).connect(gain).connect(this.master);
    if (send) gain.connect(this.delayIn);
    osc.start(t);
    osc.stop(t + attack + decay + 0.05);
  }

  private bass(freq: number, t: number) {
    this.voice("sawtooth", freq, t, 0.32, 0.005, 0.22, 520);
  }

  private pluck(freq: number, t: number) {
    this.voice("triangle", freq, t, 0.12, 0.004, 0.25, 3200, true);
  }

  private vamp(freq: number, t: number, length: number) {
    this.voice("sawtooth", freq, t, 0.06, 0.03, length, 1400);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, peak: number, decay: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = type === "bandpass" ? 3 : 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + decay + 0.02);
  }

  private hat(t: number, peak: number) {
    this.noiseHit(t, "highpass", 7500, peak, 0.04);
  }

  private rim(t: number) {
    this.noiseHit(t, "bandpass", 1900, 0.22, 0.08);
  }
}

let instance: SpyMusic | null = null;

export function getSpyMusic() {
  instance ??= new SpyMusic();
  return instance;
}
