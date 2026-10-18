import { Game } from "./game.js";
import { defaults } from "./config.js";
import { loadRecord, saveRecord } from "./save.js";
const $ = (selector) => document.querySelector(selector);
const record = loadRecord();
let settled = false,
  lastPhase = "",
  game;
function render(world) {
  $("#hp").textContent =
    `♥ ${Math.ceil(world.player.hp)} / ${world.player.maxHp}`;
  $("#level").textContent = `LV.${world.level} · ◇ ${world.xp}/${world.xpNext}`;
  $("#clock").textContent =
    `${Math.ceil(Math.max(0, world.config.duration - world.time))}s`;
  $("#kills").textContent = `击败 ${world.kills}`;
  $(".goal").textContent =
    `目标：守住 ${world.config.duration} 秒，等待天亮。${world.config.bossAt} 秒时精英登场。`;
  if (lastPhase === world.phase) return;
  lastPhase = world.phase;
  const overlay = $("#overlay");
  overlay.replaceChildren();
  if (world.phase === "ready")
    overlay.innerHTML = `<span class="kicker">YOUR FIRST LITTLE WORLD</span><h1>微光守林人</h1><p>在敌群中守住微光，等待天亮。<br>自动攻击，走位和成长由你决定。<br>历史最佳：${record.best} 次击败 · 完成 ${record.runs} 局</p><button class="big" data-action="start">带着种子，出发 ↗</button>`;
  if (world.phase === "paused")
    overlay.innerHTML =
      '<span class="kicker">TAKE YOUR TIME</span><h1>森林在等你。</h1><p>暂停时所有模拟与倒计时都已停止。</p><button class="big" data-action="resume">继续探索 →</button>';
  if (world.phase === "upgrade")
    overlay.innerHTML = `<span class="kicker">LEVEL ${world.level}</span><h1>微光成长了。</h1><p>选一个方向，长成你的样子。</p><div class="choices"><button data-upgrade="power"><span>锋芒</span><small>伤害 ${world.config.damage} → ${world.config.damage + 1}</small></button><button data-upgrade="haste"><span>迅捷</span><small>每秒 ${world.config.fireRate} → ${Math.min(10, world.config.fireRate + 0.5)} 发</small></button><button data-upgrade="heal"><span>恢复</span><small>生命 ${Math.ceil(world.player.hp)} → ${Math.min(world.player.maxHp, Math.ceil(world.player.hp + 35))}</small></button></div>`;
  if (["over", "won"].includes(world.phase)) {
    let stored = true;
    if (!settled) {
      record.best = Math.max(record.best, world.kills);
      record.runs++;
      stored = saveRecord(record);
      settled = true;
    }
    overlay.innerHTML = `<span class="kicker">${world.phase === "won" ? "THE FOREST REMEMBERS" : "EVERY TRY IS A NEW BEGINNING"}</span><h1>${world.phase === "won" ? "天亮了，守林人！" : "微光不会熄灭。"}</h1><p>生存 ${world.time.toFixed(1)} 秒 · 击败 ${world.kills}<br>等级 ${world.level} · ${world.evolved ? "完成了进化" : "下次试试成长到 Lv.3"}<br>${stored ? "纪录已保存在当前浏览器。" : "浏览器不允许保存，本次纪录暂未保存。"}</p><button class="big" data-action="restart">再种下一个世界 →</button>`;
  }
}
try {
  game = new Game($("#game"), {
    ...defaults,
    reducedMotion: true,
    onChange: render,
  });
  render(game.world);
  $("#overlay").addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "start") game.start();
    if (action === "resume") game.pause();
    if (action === "restart") {
      settled = false;
      game.reset();
      game.start();
    }
    const upgrade = e.target.closest("[data-upgrade]")?.dataset.upgrade;
    if (upgrade) game.upgrade(upgrade);
  });
  $("#pause").onclick = () => game.pause();
  $("#quiet").onchange = (e) => {
    game.setConfig({ sound: !e.target.checked });
    if (!e.target.checked) game.audio.unlock();
  };
  $("#comfort").onchange = (e) =>
    game.setConfig({ reducedMotion: e.target.checked });
  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      e.preventDefault();
      game.pause();
    }
  });
  for (const button of document.querySelectorAll("[data-dir]")) {
    const direction = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    }[button.dataset.dir];
    button.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      game.input.touch(...direction);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      button.addEventListener(type, () => game.input.touch(0, 0));
  }
  window.addEventListener("pagehide", () => game.dispose());
} catch (error) {
  $("#error").hidden = false;
  $("#error").textContent =
    "无法启动三维画面。需要支持 WebGL 2 的浏览器；请检查硬件加速。详细信息：" +
    error.message;
}
// When downloaded independently, do not link to a nonexistent course.
if (location.pathname === "/" || location.pathname === "/index.html")
  $("#course-link").hidden = true;
