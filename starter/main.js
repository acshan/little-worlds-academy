const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const player = { x: 360, y: 210, speed: 120 };
const keys = new Set();
let last = 0;

// TODO 1：keydown 时把 event.code 加进 keys；keyup 时删除。
// 提示：window.addEventListener('keydown', event => { ... });

function update(dt) {
  // TODO 2：按 D 向右移动，按 A 向左移动。
  // 提示：if (keys.has('KeyD')) player.x += player.speed * dt;
  // 这里的速度单位是像素/秒；后面的 3D 项目会改成世界单位/秒。
}

function draw() {
  context.fillStyle = "#203f34";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#e3bd74";
  context.fillRect(player.x - 10, player.y - 10, 20, 20);
}

function frame(now) {
  // TODO 3：算出 dt（秒），再在 draw 前调用 update(dt)。
  // 提示：const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
  last = now;
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
