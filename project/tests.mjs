import assert from "node:assert/strict";
import { World } from "./src/state.js";
import { direction, nearest, distance } from "./src/math.js";
const results = [];
function test(name, fn) {
  fn();
  results.push(name);
}
test("归一化：零输入安全，斜向速度一致", () => {
  assert.deepEqual(direction(0, 0), { x: 0, z: 0 });
  assert(Math.abs(Math.hypot(...Object.values(direction(1, 1))) - 1) < 1e-9);
});
test("按秒移动：30 / 60 FPS 的一秒距离相同", () => {
  const move = (fps) => {
    const w = new World({ combat: false, xp: false });
    w.start();
    for (let i = 0; i < fps; i++) w.update(1 / fps, { x: 1, z: 0 });
    return w.player.x;
  };
  assert(Math.abs(move(30) - 5) < 1e-6);
  assert(Math.abs(move(60) - 5) < 1e-6);
});
test("暂停会停止整个模拟，而不只是隐藏画面", () => {
  const w = new World();
  w.start();
  w.phase = "paused";
  const before = JSON.stringify({ p: w.player, t: w.time, e: w.enemies });
  w.update(0.05, { x: 1, z: 0 });
  assert.equal(
    JSON.stringify({ p: w.player, t: w.time, e: w.enemies }),
    before,
  );
});
test("没有目标不会凭空发射，也不会报错", () => {
  const w = new World({ spawnRate: 0, boss: false });
  w.start();
  for (let i = 0; i < 10; i++) w.update(0.05);
  assert.equal(w.shots.length, 0);
});
test("扫掠碰撞：高速弹丸经过敌人也能命中", () => {
  const w = new World({ spawnRate: 0, boss: false, xp: false, damage: 0 });
  w.start();
  w.enemies.push({ id: 1, x: 0, z: 3, hp: 1, radius: 0.5, speed: 0 });
  w.shots.push({
    id: 2,
    x: -5,
    z: 3,
    vx: 200,
    vz: 0,
    life: 2,
    radius: 0.1,
    damage: 1,
  });
  w.fireClock = 99;
  w.update(0.05);
  assert.equal(w.enemies.length, 0);
  assert.equal(w.kills, 1);
  assert.equal(w.shots.length, 0);
  assert.equal(w.gems.length, 1);
});
test("持续接触不会每一帧都扣血", () => {
  const w = new World({ spawnRate: 0, boss: false, xp: false, fireRate: 0.1 });
  w.start();
  w.enemies.push({ id: 1, x: 0, z: 0, hp: 999, radius: 1, speed: 0 });
  w.fireClock = 99;
  for (let i = 0; i < 10; i++) w.update(0.05);
  assert.equal(w.player.hp, 91);
});
test("经验触发选择，选择后只应用一次升级", () => {
  const w = new World({ spawnRate: 0, boss: false });
  w.start();
  w.xp = 5;
  w.update(0.01);
  assert.equal(w.phase, "upgrade");
  assert.equal(w.level, 2);
  const t = w.time;
  w.update(0.05);
  assert.equal(w.time, t);
  assert(w.chooseUpgrade("power"));
  assert.equal(w.config.damage, 2);
  assert.equal(w.chooseUpgrade("power"), false);
  assert.equal(w.config.damage, 2);
});
test("Lv.3 进化只奖励一次，重开不继承局内强化", () => {
  const w = new World({ spawnRate: 0, boss: false });
  w.start();
  w.level = 2;
  w.xp = 5;
  w.update(0.01);
  assert(w.evolved);
  assert.equal(w.config.damage, 2);
  w.chooseUpgrade("heal");
  for (let i = 0; i < 30; i++) w.update(0.01);
  assert.equal(w.config.damage, 2);
  w.reset();
  assert.equal(w.level, 1);
  assert.equal(w.config.damage, 1);
  assert(!w.evolved);
  assert.equal(w.phase, "ready");
});
test("精英时间轴仅触发一次", () => {
  const w = new World({ spawnRate: 0, bossAt: 1, xp: false });
  w.start();
  for (let i = 0; i < 30; i++) w.update(0.05);
  assert.equal(w.enemies.filter((e) => e.boss).length, 1);
});
test("同一帧死亡与到时，死亡优先", () => {
  const w = new World({ hp: 1, duration: 0.01, spawnRate: 0, boss: false });
  w.start();
  w.enemies.push({ id: 1, x: 0, z: 0, hp: 999, radius: 1, speed: 0 });
  w.update(0.02);
  assert.equal(w.phase, "over");
});
test("抵达终点获胜，结束后不再推进", () => {
  const w = new World({ combat: false, xp: false, duration: 0.2 });
  w.start();
  for (let i = 0; i < 10; i++) w.update(0.05);
  assert.equal(w.phase, "won");
  const t = w.time;
  w.update(0.05);
  assert.equal(w.time, t);
});
test("默认关卡可以通过移动与选择完成一次完整模拟", () => {
  const w = new World();
  w.start();
  let frames = 0;
  while (!["over", "won"].includes(w.phase) && frames++ < 60 * 110) {
    if (w.phase === "upgrade") {
      w.chooseUpgrade(w.player.hp < 60 ? "heal" : "power");
      continue;
    }
    const desired = {
      x: Math.cos(w.time * 0.45) * 9,
      z: Math.sin(w.time * 0.45) * 9,
    };
    const d = direction(desired.x - w.player.x, desired.z - w.player.z);
    w.update(1 / 60, d);
  }
  assert.equal(w.phase, "won");
  assert(w.kills > 0);
  assert(w.level >= 3);
});
console.log(
  `核心规则检查通过：${results.length} 项\n` +
    results.map((s) => "✓ " + s).join("\n"),
);
export { results };
