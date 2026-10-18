/** x,z are world coordinates. All speeds are units per second. */
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export function direction(x, z) {
  const length = Math.hypot(x, z);
  return length > 0 ? { x: x / length, z: z / length } : { x: 0, z: 0 };
}
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function rng(seed = 42) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function nearest(origin, targets) {
  let best = null,
    d = Infinity;
  for (const target of targets) {
    const n = distance(origin, target);
    if (target.hp > 0 && n < d) {
      best = target;
      d = n;
    }
  }
  return best;
}
