import * as THREE from "../vendor/three.module.js";
// Original code-drawn pixel art. Replace the pattern with your own transparent PNG later.
const seedling = [
  "......gg........",
  ".....gggg.......",
  "......gg........",
  ".......g........",
  "....bbbbbb......",
  "...bbbbbbbb.....",
  "..bbbwwbbwwb....",
  "..bbbkkbbkkb....",
  "..bbbbbbbbbb....",
  "...bbyyyybb.....",
  "....bbbbbb......",
  "...bb.bbbb......",
  "..bb..bb.bb.....",
  "......bb........",
  ".....bbb........",
  "................",
];
const slime = [
  "................",
  "................",
  ".....rrrrr......",
  "....rrrrrrr.....",
  "...rrrrrrrrr....",
  "..rrrwwrrwwrr...",
  "..rrrkKrrkKrr...",
  "..rrrrrrrrrrr...",
  "...rrrppprrr....",
  "....rrrrrrr.....",
  "...rrrrrrrrr....",
  "..rrr.....rrr...",
  "................",
  "................",
  "................",
  "................",
];
export function pixelTexture(kind = "hero", evolved = false) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const palette = {
    g: "#85c86a",
    b: evolved ? "#e5b45f" : "#98c8a2",
    w: "#fff5d9",
    k: "#192f2b",
    K: "#192f2b",
    y: "#e4be61",
    r: "#c590bc",
    p: "#6d526f",
  };
  ctx.fillStyle = "#294839";
  (kind === "hero" ? seedling : slime).forEach((row, y) =>
    [...row].forEach((v, x) => {
      if (palette[v]) ctx.fillRect(x - 1, y - 1, 3, 3);
    }),
  );
  (kind === "hero" ? seedling : slime).forEach((row, y) =>
    [...row].forEach((v, x) => {
      if (palette[v]) {
        ctx.fillStyle = palette[v];
        ctx.fillRect(x, y, 1, 1);
      }
    }),
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
