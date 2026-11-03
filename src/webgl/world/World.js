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

    // Paso 1: Cascarón arquitectónico y Parquet
    this.floor = new Floor(this.scene);
    this.shell = new DioramaShell(this.scene);

    // Paso 2: Cerramientos, tabiques empotrados y alfombras
    this.carpets = new CarpetSystem(this.scene);
    this.glass = new GlassPartitions(this.scene, this.resources);
    this.interiorWalls = new InteriorWalls(this.scene);
  }

  update(delta) {
    // Listo para la cinemática del Paso 3
  }
}
