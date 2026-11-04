import { Floor } from "../environment/Floor.js";
import { DioramaShell } from "../environment/DioramaShell.js";
import { CarpetSystem } from "../environment/CarpetSystem.js";
import { GlassPartitions } from "../environment/GlassPartitions.js";
import { InteriorWalls } from "../environment/InteriorWalls.js";
import { SupervisorOffice } from "../zones/SupervisorOffice.js";
import { MeetingRoom } from "../zones/MeetingRoom.js";
import { DevArea } from "../zones/DevArea.js";
import { CoffeeArea } from "../zones/CoffeeArea.js";
import { PingPongArea } from "../zones/PingPongArea.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // 1. Estructura y cerramientos
    this.floor = new Floor(this.scene);
    this.shell = new DioramaShell(this.scene);
    this.carpets = new CarpetSystem(this.scene);
    this.glass = new GlassPartitions(this.scene, this.resources);
    this.interiorWalls = new InteriorWalls(this.scene);

    // 2. Zonas Amuebladas
    this.supervisor = new SupervisorOffice(this.experience);
    this.meeting = new MeetingRoom(this.experience);
    this.devArea = new DevArea(this.experience);
    this.coffeeArea = new CoffeeArea(this.experience);
    this.pingPong = new PingPongArea(this.experience);
  }

  update(delta) {
    if (this.supervisor) this.supervisor.update(delta);
  }
}
