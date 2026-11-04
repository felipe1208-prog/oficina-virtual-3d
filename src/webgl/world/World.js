import { Floor } from "../environment/Floor.js";
import { DioramaShell } from "../environment/DioramaShell.js";
import { CarpetSystem } from "../environment/CarpetSystem.js";
import { GlassPartitions } from "../environment/GlassPartitions.js";
import { InteriorWalls } from "../environment/InteriorWalls.js";
import { SupervisorOffice } from "../zones/SupervisorOffice.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Estructura arquitectónica aprobada
    this.floor = new Floor(this.scene);
    this.shell = new DioramaShell(this.scene);
    this.carpets = new CarpetSystem(this.scene);
    this.glass = new GlassPartitions(this.scene, this.resources);
    this.interiorWalls = new InteriorWalls(this.scene);

    // Despacho del Supervisor con circuito cerrado de TV activo
    this.supervisor = new SupervisorOffice(this.experience);
  }

  update(delta) {
    if (this.supervisor) {
      this.supervisor.update(delta);
    }
  }
}
