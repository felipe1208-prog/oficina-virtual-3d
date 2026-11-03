import * as THREE from "three";
import { Sizes } from "./core/Sizes.js";
import { Camera } from "./core/Camera.js";
import { Renderer } from "./core/Renderer.js";
import { World } from "./world/World.js";

let instance = null;

export class Experience {
  constructor(canvas = null, resources = null) {
    if (instance) return instance;
    instance = this;

    this.canvas = canvas;
    this.resources = resources;

    this.scene = new THREE.Scene();
    // Fondo de estudio cálido claro idéntico a la imagen
    this.scene.background = new THREE.Color("#F7F5F2");

    this.sizes = new Sizes(this.canvas.parentElement);
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);

    this.dayNightCycle = 0.0;
    this.isAutoCycle = false;

    this.initLighting();
    this.world = new World(this);

    this.sizes.addEventListener("resize", () => {
      this.camera.resize();
      this.renderer.resize();
    });

    this.clock = new THREE.Clock();
    this.tick = this.tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  setDayNightFactor(factor, auto = false) {
    this.dayNightCycle = THREE.MathUtils.clamp(factor, 0.0, 1.0);
    this.isAutoCycle = auto;
  }

  initLighting() {
    // Luz ambiental crema cálida
    this.ambientLight = new THREE.AmbientLight("#FFF7EB", 0.95);
    this.scene.add(this.ambientLight);

    // Rebote cálido de roble y paredes
    this.hemiLight = new THREE.HemisphereLight("#FFFDF9", "#7A4B24", 0.55);
    this.scene.add(this.hemiLight);

    // Sol principal entrando por los ventanales con tono cálido matutino
    this.sunLight = new THREE.DirectionalLight("#FFEED4", 1.85);
    this.sunLight.position.set(-18, 25, -16);
    this.sunLight.target.position.set(0, 0, 0);
    this.scene.add(this.sunLight.target);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 65;

    const d = 18;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);
  }

  tick() {
    const delta = this.clock.getDelta();
    if (this.world) this.world.update(delta);
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
