import { World } from "./state.js";
import { View } from "./view.js";
import { createInput } from "./input.js";
import { Audio } from "./audio.js";
export class Game {
  constructor(canvas, { onChange = () => {}, ...options } = {}) {
    this.world = new World(options);
    this.view = new View(canvas);
    this.input = createInput(canvas);
    this.audio = new Audio();
    this.onChange = onChange;
    this.canvas = canvas;
    this.last = 0;
    this.running = true;
    this.lastUi = 0;
    this.onHidden = () => {
      if (document.hidden && this.world.phase === "play") {
        this.world.phase = "paused";
        this.input.clear();
        this.onChange(this.world);
      }
    };
    document.addEventListener("visibilitychange", this.onHidden);
    this.tick = this.tick.bind(this);
    this.raf = requestAnimationFrame(this.tick);
  }
  tick(now) {
    if (!this.running) return;
    const dt = this.last ? (now - this.last) / 1000 : 0;
    this.last = now;
    this.world.update(dt, this.input.read());
    for (const event of this.world.events)
      if (this.world.config.sound && ["pickup", "hurt"].includes(event.type))
        this.audio.play(event.type);
    this.world.events.length = 0;
    this.view.sync(this.world);
    if (now - this.lastUi > 100) {
      this.onChange(this.world);
      this.lastUi = now;
    }
    this.raf = requestAnimationFrame(this.tick);
  }
  start() {
    this.world.start();
    this.canvas.focus({ preventScroll: true });
    if (this.world.config.sound) this.audio.unlock();
    this.onChange(this.world);
  }
  pause() {
    const w = this.world;
    if (w.phase === "play") w.phase = "paused";
    else if (w.phase === "paused") {
      w.phase = "play";
      this.canvas.focus({ preventScroll: true });
    }
    this.input.clear();
    this.onChange(w);
  }
  reset() {
    this.input.clear();
    this.world.reset();
    this.onChange(this.world);
  }
  setConfig(config) {
    Object.assign(this.world.config, config);
    Object.assign(this.world.initialConfig, config);
    if (Object.hasOwn(config, "enemySpeed"))
      for (const enemy of this.world.enemies)
        if (!enemy.boss) enemy.speed = config.enemySpeed;
    this.onChange(this.world);
  }
  upgrade(id) {
    this.world.chooseUpgrade(id);
    this.canvas.focus({ preventScroll: true });
    this.onChange(this.world);
  }
  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    document.removeEventListener("visibilitychange", this.onHidden);
    this.input.dispose();
    this.audio.dispose();
    this.view.dispose();
  }
}
