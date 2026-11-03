import { Floor } from "../environment/Floor.js";
import { DioramaShell } from "../environment/DioramaShell.js";
import { CarpetSystem } from "../environment/CarpetSystem.js";
import { GlassPartitions } from "../environment/GlassPartitions.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Inicialización por capas ordenadas
    this.floor = new Floor(this.scene);
    this.shell = new DioramaShell(this.scene, this.resources);
    this.carpets = new CarpetSystem(this.scene);
    this.glass = new GlassPartitions(this.scene);
  }

  update(delta) {
    // Próximo paso: actualización de agentes y animaciones
  }
}
