import * as THREE from "three";
import { WorkstationFactory } from "./WorkstationFactory.js";
import { AGENT_STATIONS, ZONE_PROPS } from "../../config/officeLayout.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.workstationFactory = new WorkstationFactory(this.resources);
    this.stations = new Map();

    this.initStations();
    this.initKitchenZone();
    this.initLoungeZone();
    this.initEnvironmentProps();
  }

  initStations() {
    Object.values(AGENT_STATIONS).forEach((stationConfig) => {
      const station = this.workstationFactory.create(stationConfig);
      this.scene.add(station);
      this.stations.set(stationConfig.id, station);
    });
  }

  initKitchenZone() {
    const { coffeeMachine, waterCooler, trashcan } = ZONE_PROPS.kitchen;

    this.placeModel("coffeeMachine", coffeeMachine.position, 0.9);
    this.placeModel("waterCooler", waterCooler.position, 1.0);
    this.placeModel("trashcan", trashcan.position, 0.8);
  }

  initLoungeZone() {
    const { pingPongTable, couchMedium, tvScreen, coffeeTable } =
      ZONE_PROPS.lounge;

    this.placeModel("pingPongTable", pingPongTable.position, 1.0);
    this.placeModel("couchMedium", couchMedium.position, 1.0, -Math.PI / 2);
    this.placeModel("tvScreen", tvScreen.position, 1.0, Math.PI / 2);
    this.placeModel("coffeeTable", coffeeTable.position, 0.85);
  }

  initEnvironmentProps() {
    // Ventilador de techo
    const fanModel = this.resources.get("ceilingFan");
    if (fanModel) {
      this.workstationFactory.normalizeMaterials(fanModel);
      fanModel.position.set(0, 4.2, 0);
      fanModel.scale.setScalar(1.2);
      this.scene.add(fanModel);
      this.ceilingFan = fanModel;
    }

    // Plantas decorativas
    ZONE_PROPS.environment.houseplants.forEach((plant) => {
      this.placeModel("houseplant", plant.position, plant.scale);
    });
  }

  placeModel(assetKey, position, scale = 1, rotationY = 0) {
    const model = this.resources.get(assetKey);
    if (!model) return;

    this.workstationFactory.normalizeMaterials(model);
    model.position.set(position.x, position.y, position.z);
    model.rotation.y = rotationY;
    model.scale.setScalar(scale);
    this.scene.add(model);
    return model;
  }

  update(delta) {
    // Rotación suave del ventilador de techo
    if (this.ceilingFan) {
      this.ceilingFan.rotation.y += 0.8 * delta;
    }
  }
}
