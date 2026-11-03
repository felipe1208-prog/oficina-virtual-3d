import { Floor } from "../environment/Floor.js";
import { DioramaShell } from "../environment/DioramaShell.js";
import { CarpetSystem } from "../environment/CarpetSystem.js";
import { GlassPartitions } from "../environment/GlassPartitions.js";
import { InteriorWalls } from "../environment/InteriorWalls.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Paso 1: Cascarón y Suelo
    this.floor = new Floor(this.scene);
    this.shell = new DioramaShell(this.scene);

    // Paso 2: Mamparas con marcos 3D, pizarra, tapetes y muros divisorios
    this.carpets = new CarpetSystem(this.scene, this.resources);
    this.glass = new GlassPartitions(this.scene, this.resources);
    this.interiorWalls = new InteriorWalls(this.scene);
  }

  update(delta) {
    // Listo para cinemática en el Paso 3 y Paso 4
  }
}
