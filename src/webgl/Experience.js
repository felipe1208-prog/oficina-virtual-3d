import * as THREE from "three";
import { Sizes } from "./core/Sizes.js";
import { Camera } from "./core/Camera.js";
import { Renderer } from "./core/Renderer.js";
import { OFFICE_BOUNDS } from "../config/officeLayout.js";

let instance = null;

export class Experience {
  constructor(canvas = null) {
    // Patrón Singleton para acceder a la experiencia globalmente
    if (instance) return instance;
    instance = this;

    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#0F1219"); // Fondo neutro mate

    this.sizes = new Sizes(this.canvas.parentElement);
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);

    this.initLighting();
    this.initBaseEnvironment();

    // Enlazar eventos de redimensionado
    this.sizes.addEventListener("resize", () => {
      this.camera.resize();
      this.renderer.resize();
    });

    // Bucle de animación (Tick)
    this.clock = new THREE.Clock();
    this.tick = this.tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  initLighting() {
    // 1. Luz ambiental para visibilidad uniforme de geometrías
    const ambientLight = new THREE.AmbientLight("#E8ECF5", 0.9);
    this.scene.add(ambientLight);

    // 2. Luz hemisférica: contraste sutil entre luz de techo y rebote de suelo
    const hemiLight = new THREE.HemisphereLight("#FFFFFF", "#242B3B", 0.5);
    this.scene.add(hemiLight);

    // 3. Luz direccional principal (simula ventanales)
    this.sunLight = new THREE.DirectionalLight("#FFF9F0", 1.6);
    this.sunLight.position.set(16, 22, 12);
    this.sunLight.castShadow = true;

    // Optimización de la caja de sombra para cubrir exactamente la oficina
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
    // Plataforma base de la oficina
    const floorGeo = new THREE.BoxGeometry(
      OFFICE_BOUNDS.width,
      OFFICE_BOUNDS.height,
      OFFICE_BOUNDS.depth,
    );
    const floorMat = new THREE.MeshStandardMaterial({
      color: OFFICE_BOUNDS.floorColor,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -OFFICE_BOUNDS.height / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Cuadrícula sutil de referencia arquitectónica
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
