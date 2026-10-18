import { defaults } from "./config.js";
import { direction, distance, nearest, clamp, rng } from "./math.js";

export class World {
  constructor(options = {}) {
    this.initialConfig = { ...defaults, ...options };
    this.reset();
  }
  reset() {
    this.config = { ...this.initialConfig };
    this.phase = "ready";
    this.time = 0;
    this.kills = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNext = 5;
    this.evolved = false;
    this.bossSpawned = false;
    this.player = {
      x: 0,
      z: 0,
      radius: 0.5,
      hp: this.config.hp,
      maxHp: this.config.hp,
      hurtCooldown: 0,
    };
    this.enemies = [];
    this.shots = [];
    this.gems = [];
    this.effects = [];
    this.spawnClock = 0;
    this.fireClock = 0;
    this.serial = 0;
    this.random = rng(42);
    this.events = [];
  }
  start() {
    if (this.phase === "ready") this.phase = "play";
  }
  emit(type, data = {}) {
    this.events.push({ type, ...data });
  }
  spawn(boss = false) {
    const a = this.random() * Math.PI * 2,
      r = boss ? 15 : 13 + this.random() * 5;
    this.enemies.push({
      id: ++this.serial,
      x: this.player.x + Math.cos(a) * r,
      z: this.player.z + Math.sin(a) * r,
      hp: boss ? 55 : 3,
      radius: boss ? 1.2 : 0.45,
      boss,
      speed: boss ? 0.85 : this.config.enemySpeed,
    });
    if (boss) this.emit("boss");
  }
  update(dt, input = { x: 0, z: 0 }) {
    // While choosing an upgrade, every simulation clock stops here.
    if (this.phase !== "play") return;
    dt = clamp(dt, 0, 0.05);
    this.time += dt;
    const p = this.player,
      c = this.config;
    let v = c.normalize ? direction(input.x, input.z) : input;
    p.x = clamp(p.x + v.x * c.speed * dt, -22, 22);
    p.z = clamp(p.z + v.z * c.speed * dt, -22, 22);
    p.hurtCooldown = Math.max(0, p.hurtCooldown - dt);
    if (c.combat) {
      this.spawnClock += dt * c.spawnRate;
      while (this.spawnClock >= 1) {
        this.spawnClock -= 1;
        if (this.enemies.length < c.enemyCap) this.spawn();
      }
      if (c.boss && !this.bossSpawned && this.time >= c.bossAt) {
        this.spawn(true);
        this.bossSpawned = true;
      }
      this.fireClock -= dt;
      if (this.fireClock <= 0) {
        const target = nearest(p, this.enemies);
        if (target) {
          const d = direction(target.x - p.x, target.z - p.z);
          this.shots.push({
            id: ++this.serial,
            x: p.x,
            z: p.z,
            vx: d.x * c.projectileSpeed,
            vz: d.z * c.projectileSpeed,
            life: 2,
            radius: 0.18,
            damage: c.damage,
          });
          this.fireClock = 1 / c.fireRate;
          this.emit("shoot");
        }
      }
      for (const e of this.enemies) {
        const d = direction(p.x - e.x, p.z - e.z);
        e.x += d.x * e.speed * dt;
        e.z += d.z * e.speed * dt;
        if (distance(e, p) < e.radius + p.radius && p.hurtCooldown <= 0) {
          if (!c.invincible) p.hp = Math.max(0, p.hp - (e.boss ? 18 : 9));
          p.hurtCooldown = 0.7;
          this.emit("hurt");
        }
      }
      for (const s of this.shots) {
        const old = { x: s.x, z: s.z };
        s.x += s.vx * dt;
        s.z += s.vz * dt;
        s.life -= dt;
        for (const e of this.enemies) {
          if (e.hp <= 0) continue;
          // Closest point on the swept segment: fast shots do not tunnel through enemies.
          const dx = s.x - old.x,
            dz = s.z - old.z,
            len = dx * dx + dz * dz;
          const t = len
            ? clamp(((e.x - old.x) * dx + (e.z - old.z) * dz) / len, 0, 1)
            : 0;
          if (
            Math.hypot(e.x - old.x - dx * t, e.z - old.z - dz * t) <
            e.radius + s.radius
          ) {
            e.hp -= s.damage;
            s.life = 0;
            this.emit("hit");
            break;
          }
        }
      }
      for (const e of this.enemies)
        if (e.hp <= 0) {
          this.kills++;
          this.gems.push({
            id: ++this.serial,
            x: e.x,
            z: e.z,
            value: e.boss ? 10 : 1,
          });
          this.emit("kill");
          if (e.boss) this.emit("boss-down");
        }
      this.enemies = this.enemies.filter((e) => e.hp > 0);
      this.shots = this.shots.filter((s) => s.life > 0);
    }
    if (c.xp) {
      for (const gem of this.gems) {
        if (distance(gem, p) < c.pickupRadius) {
          this.xp += gem.value;
          gem.collected = true;
          this.emit("pickup");
        }
      }
      this.gems = this.gems.filter((g) => !g.collected);
      if (this.xp >= this.xpNext) {
        this.xp -= this.xpNext;
        this.level++;
        this.xpNext += 3;
        this.phase = "upgrade";
        this.emit("upgrade");
        if (c.evolution && this.level >= 3 && !this.evolved) {
          this.evolved = true;
          c.damage += 1;
          this.emit("evolve");
        }
      }
    }
    if (p.hp <= 0) {
      this.phase = "over";
      this.emit("end", { victory: false });
    } else if (this.time >= c.duration) {
      this.phase = "won";
      this.emit("end", { victory: true });
    }
  }
  chooseUpgrade(id) {
    if (this.phase !== "upgrade") return false;
    if (id === "power") this.config.damage += 1;
    else if (id === "haste")
      this.config.fireRate = Math.min(10, this.config.fireRate + 0.5);
    else if (id === "heal")
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
    else return false;
    this.phase = "play";
    return true;
  }
}
