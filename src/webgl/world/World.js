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

    // 1. Estructura base ya aprobada
    this.floor = new Floor(this.scene);
    this.shell = new DioramaShell(this.scene);
    this.carpets = new CarpetSystem(this.scene);
    this.glass = new GlassPartitions(this.scene, this.resources);
    this.interiorWalls = new InteriorWalls(this.scene);

    // 2. ÚNICA ZONA ACTIVA: Despacho del Supervisor
    this.supervisor = new SupervisorOffice(this.scene, this.resources);
  }

  update(delta) {
    // Listo para cuando integremos cinemática o agentes
  }
}
