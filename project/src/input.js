export function createInput(canvas) {
  const held = new Set();
  let touch = { x: 0, z: 0 };
  const keys = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowLeft",
    "ArrowDown",
    "ArrowRight",
  ];
  const down = (e) => {
    if (keys.includes(e.code)) {
      e.preventDefault();
      held.add(e.code);
    }
  };
  const up = (e) => held.delete(e.code);
  const clear = () => {
    held.clear();
    touch = { x: 0, z: 0 };
  };
  const focus = () => canvas.focus({ preventScroll: true });
  canvas.addEventListener("pointerdown", focus);
  canvas.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  canvas.addEventListener("blur", clear);
  return {
    read: () => ({
      x:
        Number(held.has("KeyD") || held.has("ArrowRight")) -
        Number(held.has("KeyA") || held.has("ArrowLeft")) +
        touch.x,
      z:
        Number(held.has("KeyS") || held.has("ArrowDown")) -
        Number(held.has("KeyW") || held.has("ArrowUp")) +
        touch.z,
    }),
    touch: (x, z) => {
      touch = { x, z };
    },
    clear,
    dispose() {
      canvas.removeEventListener("pointerdown", focus);
      canvas.removeEventListener("keydown", down);
      canvas.removeEventListener("blur", clear);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    },
  };
}
