export class Audio {
  unlock() {
    this.ctx ??= new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }
  play(kind) {
    if (!this.ctx || this.ctx.state !== "running") return;
    const oscillator = this.ctx.createOscillator(),
      gain = this.ctx.createGain(),
      now = this.ctx.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      kind === "pickup" ? 650 : kind === "hurt" ? 140 : 360,
      now,
    );
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start();
    oscillator.stop(now + 0.09);
  }
  dispose() {
    this.ctx?.close();
  }
}
