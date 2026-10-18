import * as THREE from "../vendor/three.module.js";
import { pixelTexture } from "./art.js";
import { rng } from "./math.js";

export class View {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#b8cfbf");
    this.scene.fog = new THREE.Fog("#b8cfbf", 32, 66);
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    this.scene.add(new THREE.HemisphereLight("#fff5db", "#425b40", 2.2));
    const sun = new THREE.DirectionalLight("#fff4d2", 2.6);
    sun.position.set(-7, 16, 7);
    this.scene.add(sun);
    this.resources = [];
    this.materials = {};
    this.meshes = new Map();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(56, 56),
      new THREE.MeshStandardMaterial({ color: "#70956c", roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.03;
    this.scene.add(floor);
    const random = rng(17);
    const patchGeo = new THREE.CircleGeometry(1, 10),
      patchMat = new THREE.MeshBasicMaterial({
        color: "#819e71",
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      });
    const patches = new THREE.InstancedMesh(patchGeo, patchMat, 38),
      dummy = new THREE.Object3D();
    for (let i = 0; i < 38; i++) {
      dummy.position.set((random() - 0.5) * 46, 0.003, (random() - 0.5) * 46);
      dummy.rotation.x = -Math.PI / 2;
      dummy.scale.setScalar(1 + random() * 2.4);
      dummy.updateMatrix();
      patches.setMatrixAt(i, dummy.matrix);
    }
    this.scene.add(patches);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2,
        r = 23 + random() * 3;
      const tree = new THREE.Mesh(
        new THREE.ConeGeometry(1 + random() * 0.6, 3 + random() * 2, 5),
        new THREE.MeshStandardMaterial({
          color: i % 3 ? "#426c51" : "#57855d",
          flatShading: true,
        }),
      );
      tree.position.set(Math.cos(a) * r, 1.5, Math.sin(a) * r);
      this.scene.add(tree);
    }
    // A few decorative props frame the clearing. They are visual only, not colliders.
    const trunkGeo = new THREE.CylinderGeometry(0.16, 0.25, 1.8, 5),
      trunkMat = new THREE.MeshStandardMaterial({
        color: "#7a6650",
        flatShading: true,
      });
    const crownGeo = new THREE.IcosahedronGeometry(1.35, 0),
      crownMat = new THREE.MeshStandardMaterial({
        color: "#547f5b",
        flatShading: true,
      });
    for (const [x, z] of [
      [-10, -7],
      [9, -5],
      [-14, 6],
      [13, 10],
      [-7, 15],
      [6, -14],
    ]) {
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 0.9, z);
      this.scene.add(trunk);
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(x, 2.5, z);
      crown.scale.y = 1.2;
      this.scene.add(crown);
    }
    const rockGeo = new THREE.DodecahedronGeometry(0.45, 0),
      rockMat = new THREE.MeshStandardMaterial({
        color: "#8b9a89",
        flatShading: true,
      });
    for (const [x, z] of [
      [-5, -8],
      [8, 5],
      [-12, 3],
      [6, 12],
    ]) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, 0.25, z);
      rock.scale.set(1.2, 0.7, 1);
      this.scene.add(rock);
    }
    // Grass tufts share geometry/material; InstancedMesh batches their draw calls.
    const grass = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.08, 0.22, 3),
      new THREE.MeshStandardMaterial({ color: "#a0b881" }),
      300,
    );
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < 300; i++) {
      matrix.makeTranslation((random() - 0.5) * 44, 0.1, (random() - 0.5) * 44);
      grass.setMatrixAt(i, matrix);
    }
    this.scene.add(grass);
    this.grid = new THREE.GridHelper(48, 24, "#416b59", "#82a080");
    this.grid.position.y = 0.015;
    this.scene.add(this.grid);
    for (const kind of ["hero", "evolved", "enemy"]) {
      const texture = pixelTexture(
        kind === "enemy" ? "enemy" : "hero",
        kind === "evolved",
      );
      this.resources.push(texture);
      this.materials[kind] = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
    }
    this.materials.shot = new THREE.MeshBasicMaterial({ color: "#fff3b6" });
    this.materials.gem = new THREE.MeshStandardMaterial({
      color: "#89e1d2",
      emissive: "#164a41",
      metalness: 0.2,
    });
    this.shotGeo = new THREE.SphereGeometry(0.16, 6, 4);
    this.gemGeo = new THREE.OctahedronGeometry(0.22);
    this.hero = new THREE.Sprite(this.materials.hero);
    this.hero.center.set(0.5, 0.12);
    this.scene.add(this.hero);
    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.59, 32),
      new THREE.MeshBasicMaterial({ color: "#f9e8ac", side: THREE.DoubleSide }),
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.scene.add(this.ring);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
  }
  resize() {
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    if (w < 1 || h < 1) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  sync(world) {
    const p = world.player,
      c = world.config,
      t = world.time;
    this.hero.position.set(p.x, 0.05, p.z);
    this.hero.scale.setScalar(c.spriteScale * (world.evolved ? 1.4 : 1));
    this.hero.material = world.evolved
      ? this.materials.evolved
      : this.materials.hero;
    this.hero.visible =
      p.hurtCooldown <= 0 || c.reducedMotion || Math.floor(t * 12) % 2 === 0;
    this.ring.position.set(p.x, 0.035, p.z);
    this.grid.visible = c.grid;
    const angle = (c.cameraAngle * Math.PI) / 180;
    this.camera.position.set(
      p.x + Math.sin(angle) * 15,
      c.cameraHeight,
      p.z + Math.cos(angle) * 15,
    );
    this.camera.lookAt(p.x, 0, p.z);
    const seen = new Set();
    for (const [kind, list] of [
      ["enemy", world.enemies],
      ["shot", world.shots],
      ["gem", world.gems],
    ])
      for (const object of list) {
        const key = kind + object.id;
        seen.add(key);
        let mesh = this.meshes.get(key);
        if (!mesh) {
          mesh =
            kind === "enemy"
              ? new THREE.Sprite(this.materials.enemy)
              : new THREE.Mesh(
                  kind === "shot" ? this.shotGeo : this.gemGeo,
                  this.materials[kind],
                );
          if (kind === "enemy") mesh.center.set(0.5, 0.15);
          this.scene.add(mesh);
          this.meshes.set(key, mesh);
        }
        mesh.position.set(
          object.x,
          kind === "shot" ? 0.55 : kind === "gem" ? 0.3 : 0,
          object.z,
        );
        if (kind === "enemy") mesh.scale.setScalar(object.boss ? 3 : 1.15);
        if (kind === "gem" && !c.reducedMotion) mesh.rotation.y = t;
      }
    for (const [key, mesh] of this.meshes)
      if (!seen.has(key)) {
        this.scene.remove(mesh);
        this.meshes.delete(key);
      }
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.observer.disconnect();
    const geometries = new Set(),
      materials = new Set();
    this.scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    Object.values(this.materials).forEach((m) => materials.add(m));
    geometries.add(this.shotGeo);
    geometries.add(this.gemGeo);
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    this.resources.forEach((t) => t.dispose());
    this.renderer.dispose();
    // Course navigation creates a new canvas; release the old WebGL context now.
    this.renderer.forceContextLoss();
  }
}
