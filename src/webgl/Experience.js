import * as THREE from "three";
import { Sizes } from "./core/Sizes.js";
import { Camera } from "./core/Camera.js";
import { Renderer } from "./core/Renderer.js";
import { World } from "./world/World.js";
import { RaycasterHandler } from "./interactions/Raycaster.js";
import { AGENT_STATIONS } from "../config/officeLayout.js";

let instance = null;

export class Experience {
  constructor(
    canvas = null,
    resources = null,
    onSelectStation = null,
    onAgentStatusChange = null,
  ) {
    if (instance) return instance;
    instance = this;

    this.canvas = canvas;
    this.resources = resources;
    this.onSelectStation = onSelectStation;
    this.onAgentStatusChange = onAgentStatusChange;

    this.scene = new THREE.Scene();
    // Tono crepuscular acogedor de fondo
    this.scene.background = new THREE.Color("#141824");

    this.sizes = new Sizes(this.canvas.parentElement);
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);

    this.initLighting();

    this.world = new World(this);

    this.raycasterHandler = new RaycasterHandler(this, (agentId) => {
      this.handleStationSelect(agentId);
    });

    this.sizes.addEventListener("resize", () => {
      this.camera.resize();
      this.renderer.resize();
    });

    this.clock = new THREE.Clock();
    this.tick = this.tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  handleStationSelect(agentId) {
    if (agentId && AGENT_STATIONS[agentId]) {
      const stationPos = AGENT_STATIONS[agentId].position;
      this.camera.focusOn(stationPos);
    } else {
      this.camera.resetView();
    }

    if (this.onSelectStation) {
      this.onSelectStation(agentId);
    }
  }

  setAgentStatus(agentId, status) {
    const character = this.world?.characters.get(agentId);
    if (character) {
      character.setStatus(status);
    }
  }

  sendAgentToWater(agentId) {
    const character = this.world?.characters.get(agentId);
    if (character && character.destinationProvider) {
      const dest = character.destinationProvider();
      if (dest) {
        character.startRoam(dest.position, dest.name);
      }
    }
  }

  initLighting() {
    // 1. Luz Ambiental cálida de relleno
    const ambientLight = new THREE.AmbientLight("#F3EBDD", 0.65);
    this.scene.add(ambientLight);

    // 2. Luz Hemisférica (cielo cálido / rebote de piso de madera)
    const hemiLight = new THREE.HemisphereLight("#FFF2DE", "#4A2A14", 0.45);
    this.scene.add(hemiLight);

    // 3. Luz Solar Directa a través de las ventanas posteriores (sombras largas)
    this.sunLight = new THREE.DirectionalLight("#FFF3DB", 1.85);
    this.sunLight.position.set(-6, 12, -14);
    this.sunLight.target.position.set(0, 0, 0);
    this.scene.add(this.sunLight.target);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 40;

    const d = 11;
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
    this.raycasterHandler?.destroy();
    this.sizes.destroy();
    this.camera.destroy();
    this.renderer.destroy();
    instance = null;
  }
}
