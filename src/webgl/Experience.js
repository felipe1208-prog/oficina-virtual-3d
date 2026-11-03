import * as THREE from "three";
import { Sizes } from "./core/Sizes.js";
import { Camera } from "./core/Camera.js";
import { Renderer } from "./core/Renderer.js";
import { World } from "./world/World.js";
import { OFFICE_BOUNDS } from "../config/officeLayout.js";

let instance = null;

export class Experience {
  constructor(canvas = null, resources = null) {
    if (instance) return instance;
    instance = this;

    this.canvas = canvas;
    this.resources = resources;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#0F1219");

    this.sizes = new Sizes(this.canvas.parentElement);
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);

    this.initLighting();
    this.initBaseEnvironment();

    // Instanciar el mundo con las estaciones y objetos
    this.world = new World(this);

    this.sizes.addEventListener("resize", () => {
      this.camera.resize();
      this.renderer.resize();
    });

    this.clock = new THREE.Clock();
    this.tick = this.tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight("#E8ECF5", 0.85);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight("#FFFFFF", "#242B3B", 0.45);
    this.scene.add(hemiLight);

    this.sunLight = new THREE.DirectionalLight("#FFF9F0", 1.7);
    this.sunLight.position.set(16, 22, 12);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 50;

    const d = 12;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;

    this.scene.add(this.sunLight);
  }

  initBaseEnvironment() {
    const floorGeo = new THREE.BoxGeometry(
      OFFICE_BOUNDS.width,
      OFFICE_BOUNDS.height,
      OFFICE_BOUNDS.depth,
    );
    const floorMat = new THREE.MeshStandardMaterial({
      color: OFFICE_BOUNDS.floorColor,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -OFFICE_BOUNDS.height / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(
      Math.max(OFFICE_BOUNDS.width, OFFICE_BOUNDS.depth),
      Math.max(OFFICE_BOUNDS.width, OFFICE_BOUNDS.depth),
      OFFICE_BOUNDS.gridColor,
      "#1E2433",
    );
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  tick() {
    const delta = this.clock.getDelta();

    // Actualizar animaciones del mundo (rotación de aspas, etc.)
    if (this.world) {
      this.world.update(delta);
    }

    this.camera.update();
    this.renderer.update();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    this.sizes.destroy();
    this.camera.destroy();
    this.renderer.destroy();
    instance = null;
  }
}
