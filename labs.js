import { Game } from "./project/src/game.js";

export const limits = {
  speed: [0.2, 12],
  enemySpeed: [0, 6],
  spawnRate: [0, 6],
  fireRate: [0.1, 10],
  damage: [0, 10],
  projectileSpeed: [1, 30],
  pickupRadius: [0.2, 10],
  cameraHeight: [4, 32],
  cameraAngle: [-180, 180],
  spriteScale: [0.2, 3],
  enemyCap: [1, 150],
  duration: [10, 180],
  bossAt: [1, 180],
  hp: [1, 200],
  fps: [5, 60],
  x: [-10, 10],
  z: [-7, 7],
};
const bools = [
  "normalize",
  "combat",
  "xp",
  "evolution",
  "boss",
  "reducedMotion",
  "sound",
  "invincible",
  "grid",
];
export function safeConfig(result) {
  const out = {};
  for (const [key, [lo, hi]] of Object.entries(limits))
    if (Object.hasOwn(result, key)) {
      if (
        typeof result[key] !== "number" ||
        !Number.isFinite(result[key]) ||
        result[key] < lo ||
        result[key] > hi
      )
        throw Error(`${key} 需要是 ${lo}–${hi} 范围内的数字。`);
      out[key] = result[key];
    }
  for (const key of bools)
    if (Object.hasOwn(result, key)) {
      if (typeof result[key] !== "boolean")
        throw Error(`${key} 需要是 true 或 false。`);
      out[key] = result[key];
    }
  return out;
}

export class Lab {
  constructor(host, lesson, onStatus = () => {}) {
    this.host = host;
    this.lesson = lesson;
    this.onStatus = onStatus;
    this.config = {
      speed: 5,
      fps: 30,
      x: 0,
      z: 0,
      normalize: true,
      duration: 90,
      ...lesson.config,
    };
    this.disposed = false;
    host.innerHTML = `<div class="stage"><canvas tabindex="0" aria-label="${lesson.title}交互实验，点击后使用 WASD 或方向键移动"></canvas><div class="stage-label">LIVE · 可操作实验</div><div class="stage-hud" aria-live="off"></div><div class="stage-modal" hidden></div><div class="stage-error" hidden></div></div><div class="lab-buttons"><button data-action="start" class="btn dark">开始实验 ↗</button><button data-action="pause" class="btn">暂停</button><button data-action="reset" class="btn">重新开始</button></div><div class="touch-pad" aria-label="触屏移动"><button data-dir="up" aria-label="向前移动">↑</button><div><button data-dir="left" aria-label="向左移动">←</button><button data-dir="down" aria-label="向后移动">↓</button><button data-dir="right" aria-label="向右移动">→</button></div></div><p class="stage-help"></p><div class="meters"></div>`;
    this.canvas = host.querySelector("canvas");
    this.stats = host.querySelector(".meters");
    this.hud = host.querySelector(".stage-hud");
    this.modal = host.querySelector(".stage-modal");
    this.is2d = ["map", "coordinates", "loop", "movement", "save"].includes(
      lesson.lab,
    );
    host.querySelector(".stage-help").textContent = this.is2d
      ? "先预测，再运行。移动实验：点击画布后使用 WASD / 方向键。"
      : "点击画布后 WASD / 方向键移动 · 自动攻击 · 青色晶体是经验 · 切到后台会自动暂停";
    if (this.is2d) this.setup2d();
    else {
      try {
        this.game = new Game(this.canvas, {
          ...lesson.config,
          onChange: (w) => this.sync(w),
        });
      } catch (error) {
        const box = host.querySelector(".stage-error");
        box.hidden = false;
        box.textContent =
          "3D 实验暂时无法启动。请检查浏览器是否支持 WebGL 2 及硬件加速。课程、代码练习和二维实验仍可使用。错误：" +
          error.message;
        this.onStatus(error.message);
      }
    }
    this.actionHandler = (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (action === "start") {
        if (this.is2d) this.active = true;
        else if (this.game?.world.phase === "paused") this.game.pause();
        else this.game?.start();
        this.canvas.focus({ preventScroll: true });
      }
      if (action === "pause") {
        if (this.is2d) this.active = !this.active;
        else this.game?.pause();
      }
      if (action === "reset") {
        if (this.is2d) {
          this.clock = 0;
          this.point = { x: 0, z: 0 };
          this.active = false;
        } else this.game?.reset();
      }
      const upgrade = e.target.closest("[data-upgrade]")?.dataset.upgrade;
      if (upgrade) this.game?.upgrade(upgrade);
    };
    host.addEventListener("click", this.actionHandler);
    this.touchClean = [];
    for (const button of host.querySelectorAll("[data-dir]")) {
      const vector = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0],
      }[button.dataset.dir];
      const down = (e) => {
        e.preventDefault();
        button.setPointerCapture(e.pointerId);
        this.touch = vector;
        this.game?.input.touch(...vector);
      };
      const up = () => {
        this.touch = [0, 0];
        this.game?.input.touch(0, 0);
      };
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("lostpointercapture", up);
      this.touchClean.push(() => {
        button.removeEventListener("pointerdown", down);
        button.removeEventListener("pointerup", up);
        button.removeEventListener("pointercancel", up);
        button.removeEventListener("lostpointercapture", up);
      });
    }
    if (lesson.lab === "save") {
      const row = document.createElement("div");
      row.className = "save-tools";
      row.innerHTML =
        '<button class="btn" data-save="write">保存示例</button><button class="btn" data-save="read">读取示例</button><output>独立的练习存档，不影响学习记录。</output>';
      host.append(row);
      row.addEventListener("click", (e) => {
        const action = e.target.dataset.save;
        if (!action) return;
        try {
          if (action === "write")
            localStorage.setItem(
              "little-worlds-save-demo",
              JSON.stringify({ version: 1, best: Math.floor(this.clock ?? 0) }),
            );
          row.querySelector("output").textContent =
            action === "write"
              ? "已保存，刷新页面也还在。"
              : (localStorage.getItem("little-worlds-save-demo") ??
                "还没有存档，请先保存。");
        } catch {
          row.querySelector("output").textContent =
            "浏览器暂时不允许保存，请使用正常浏览模式。";
        }
      });
    }
  }
  setup2d() {
    this.context = this.canvas.getContext("2d");
    this.clock = 0;
    this.active = this.lesson.lab === "loop" || this.lesson.lab === "map";
    this.keys = new Set();
    this.touch = [0, 0];
    this.point = { x: 0, z: 0 };
    this.previous = 0;
    this.keyDown = (e) => {
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        this.keys.add(e.code);
        e.preventDefault();
      }
    };
    this.keyUp = (e) => this.keys.delete(e.code);
    this.blur = () => this.keys.clear();
    this.canvas.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
    this.canvas.addEventListener("blur", this.blur);
    this.pointer = () => this.canvas.focus({ preventScroll: true });
    this.canvas.addEventListener("pointerdown", this.pointer);
    const animate = (now) => {
      if (this.disposed) return;
      const dt = this.previous
        ? Math.min((now - this.previous) / 1000, 0.05)
        : 0;
      this.previous = now;
      if (this.active) {
        this.clock += dt;
        let x =
            Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) -
            Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft")) +
            this.touch[0],
          z =
            Number(this.keys.has("KeyS") || this.keys.has("ArrowDown")) -
            Number(this.keys.has("KeyW") || this.keys.has("ArrowUp")) +
            this.touch[1];
        const len = Math.hypot(x, z);
        if (this.config.normalize && len > 0) {
          x /= len;
          z /= len;
        }
        this.point.x = Math.max(
          -9,
          Math.min(9, this.point.x + x * this.config.speed * dt),
        );
        this.point.z = Math.max(
          -5,
          Math.min(5, this.point.z + z * this.config.speed * dt),
        );
      }
      this.draw2d();
      this.raf = requestAnimationFrame(animate);
    };
    this.raf = requestAnimationFrame(animate);
  }
  draw2d() {
    const c = this.context,
      w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (
      this.canvas.width !== Math.round(w * dpr) ||
      this.canvas.height !== Math.round(h * dpr)
    ) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = "#183c32";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#ffffff0b";
    for (let x = 0; x < w; x += 26) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    }
    for (let y = 0; y < h; y += 26) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    c.font = "12px system-ui";
    c.textAlign = "left";
    if (this.lesson.lab === "loop") {
      const cycle = this.clock % 5,
        good = cycle * this.config.speed,
        bad = (cycle * this.config.speed * this.config.fps) / 60,
        scale = (w - 100) / 30;
      for (const [i, x, color, label] of [
        [0, good, "#b9e2b9", "乘 dt：一秒公平地走"],
        [1, bad, "#edbe70", "每帧固定：跟着帧率变"],
      ]) {
        const y = h * 0.38 + i * 92;
        c.strokeStyle = "#ffffff35";
        c.beginPath();
        c.moveTo(32, y);
        c.lineTo(w - 32, y);
        c.stroke();
        c.fillStyle = color;
        c.fillRect(32 + x * scale, y - 12, 20, 24);
        c.fillText(label, 32, y - 32);
      }
      this.stats.textContent = `模拟帧率 ${this.config.fps} FPS · 第 ${cycle.toFixed(1)} 秒 · 使用 dt：${good.toFixed(1)} 单位 · 固定每帧：${bad.toFixed(1)} 单位`;
    } else if (this.lesson.lab === "map") {
      const points = [
        ["输入", w * 0.2, h * 0.44],
        ["更新", w * 0.5, h * 0.44],
        ["绘制", w * 0.8, h * 0.44],
      ];
      c.strokeStyle = "#92bba2";
      c.beginPath();
      c.moveTo(w * 0.2, h * 0.44);
      c.lineTo(w * 0.8, h * 0.44);
      c.stroke();
      points.forEach(([label, x, y], i) => {
        const on = Math.floor(this.clock * 2) % 3 === i;
        c.fillStyle = on ? "#edbe70" : "#285547";
        c.beginPath();
        c.arc(x, y, 31, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = on ? "#183c32" : "#d6eadb";
        c.textAlign = "center";
        c.fillText(label, x, y + 4);
      });
      c.fillStyle = "#a6c0ad";
      c.fillText("把这三步重复起来，世界就开始活了。", w / 2, h * 0.72);
      this.stats.textContent = `你的最小版本：${this.config.duration} 秒 · 一位角色 · 一片森林 · 一个完整结局`;
    } else {
      const px =
          this.lesson.lab === "coordinates" ? this.config.x : this.point.x,
        pz = this.lesson.lab === "coordinates" ? this.config.z : this.point.z;
      const step = Math.min(w / 23, h / 15),
        cx = w / 2,
        cy = h / 2;
      c.strokeStyle = "#c6dfcb55";
      c.beginPath();
      c.moveTo(20, cy);
      c.lineTo(w - 20, cy);
      c.moveTo(cx, 40);
      c.lineTo(cx, h - 25);
      c.stroke();
      c.fillStyle = "#9bbba5";
      c.fillText("+X →", w - 60, cy - 12);
      c.fillText("+Z ↓", cx + 9, h - 30);
      const x = cx + px * step,
        y = cy + pz * step;
      c.fillStyle = "#d9b666";
      c.fillRect(x - 10, y - 10, 20, 20);
      c.fillStyle = "#98c8a2";
      c.fillRect(x - 6, y - 17, 12, 7);
      c.fillStyle = "#f5e7bd";
      c.fillRect(x - 5, y - 4, 3, 3);
      c.fillRect(x + 3, y - 4, 3, 3);
      this.stats.textContent = `x=${px.toFixed(2)} · z=${pz.toFixed(2)} · 速度 ${this.config.speed} 单位/秒 · ${this.config.normalize ? "已归一化" : "斜向加速中"}`;
    }
  }
  sync(w) {
    if (this.disposed) return;
    const time = Math.max(0, w.config.duration - w.time);
    this.hud.textContent = `♥ ${Math.ceil(w.player.hp)}   LV.${w.level}   ◇ ${w.xp}/${w.xpNext}   ${Math.ceil(time)}s`;
    this.stats.textContent = `敌人 ${w.enemies.length} · 弹丸 ${w.shots.length} · 晶体 ${w.gems.length} · 击败 ${w.kills} · draw calls ${this.game?.view.renderer.info.render.calls ?? 0}`;
    if (this.lastPhase !== w.phase) {
      this.lastPhase = w.phase;
      this.modal.hidden = ![
        "ready",
        "paused",
        "upgrade",
        "over",
        "won",
      ].includes(w.phase);
      if (w.phase === "ready")
        this.modal.innerHTML =
          '<span class="modal-kicker">你的实验已就绪</span><h3>一颗种子，一整个世界。</h3><p>点击下方“开始实验”，再点击画布移动。</p>';
      if (w.phase === "paused")
        this.modal.innerHTML =
          "<h3>森林在等你。</h3><p>点击“开始实验”或“暂停”继续。</p>";
      if (w.phase === "upgrade")
        this.modal.innerHTML =
          '<h3>微光成长了 · 选一张</h3><p>整个模拟已暂停，慢慢想。</p><button data-upgrade="power">锋芒 · 每发伤害 +1</button><button data-upgrade="haste">迅捷 · 每秒发射 +0.5</button><button data-upgrade="heal">恢复 · 生命 +35</button>';
      if (w.phase === "over" || w.phase === "won")
        this.modal.innerHTML = `<span class="modal-kicker">${w.phase === "won" ? "天亮了，守林人！" : "这次的旅程结束了"}</span><h3>你守住了 ${w.time.toFixed(1)} 秒</h3><p>击败 ${w.kills} · 等级 ${w.level} · ${w.evolved ? "已进化" : "尚未进化"}</p><button data-action="reset">带着经验，再试一次</button>`;
    }
  }
  apply(result) {
    const config = safeConfig(result);
    Object.assign(this.config, config);
    this.game?.setConfig(config);
    this.onStatus(
      "实验参数已更新。对局时长、速度等会立即生效；重新开始可清空本局状态。",
    );
  }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.game?.dispose();
    this.host.removeEventListener("click", this.actionHandler);
    this.touchClean.forEach((fn) => fn());
    if (this.is2d) {
      this.canvas.removeEventListener("keydown", this.keyDown);
      window.removeEventListener("keyup", this.keyUp);
      this.canvas.removeEventListener("blur", this.blur);
      this.canvas.removeEventListener("pointerdown", this.pointer);
    }
  }
}
