import * as THREE from "three";
import { WorkstationFactory } from "./WorkstationFactory.js";
import { fitModel } from "../utils/modelUtils.js";
import { AGENT_STATIONS, ZONE_PROPS } from "../../config/officeLayout.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.workstationFactory = new WorkstationFactory(this.resources);
    this.stations = new Map();
    this.characters = new Map();

    this.initStations();
    this.initKitchenZone();
    this.initLoungeZone();
    this.initEnvironmentProps();
  }

  initStations() {
    Object.values(AGENT_STATIONS).forEach((stationConfig) => {
      const { group, character } =
        this.workstationFactory.create(stationConfig);
      this.scene.add(group);
      this.stations.set(stationConfig.id, group);
      if (character) {
        this.characters.set(stationConfig.id, character);
      }
    });
  }

  initKitchenZone() {
    const { coffeeMachine, waterCooler, trashcan } = ZONE_PROPS.kitchen;
    this.placeFittedModel("coffeeMachine", coffeeMachine.position, {
      height: 0.42,
    });
    this.placeFittedModel("waterCooler", waterCooler.position, {
      height: 1.45,
    });
    this.placeFittedModel("trashcan", trashcan.position, { height: 0.4 });
  }

  initLoungeZone() {
    const { pingPongTable, couchMedium, tvScreen, coffeeTable } =
      ZONE_PROPS.lounge;
    this.placeFittedModel("pingPongTable", pingPongTable.position, {
      width: 2.74,
    });
    this.placeFittedModel(
      "couchMedium",
      couchMedium.position,
      { width: 1.9 },
      -Math.PI / 2,
    );
    this.placeFittedModel(
      "tvScreen",
      { ...tvScreen.position, y: 0.6 },
      { width: 1.2 },
      Math.PI / 2,
    );
    this.placeFittedModel("coffeeTable", coffeeTable.position, {
      height: 0.42,
    });
  }

  initEnvironmentProps() {
    const fanRaw = this.resources.get("ceilingFan");
    if (fanRaw) {
      this.workstationFactory.normalizeMaterials(fanRaw);
      const fan = fitModel(fanRaw, { width: 1.3 });
      fan.position.set(0, 4.5, 0);
      this.scene.add(fan);
      this.ceilingFan = fan;
    }

    ZONE_PROPS.environment.houseplants.forEach((plant) => {
      this.placeFittedModel("houseplant", plant.position, { height: 0.85 });
    });
  }

  placeFittedModel(assetKey, position, dimensions, rotationY = 0) {
    const raw = this.resources.get(assetKey);
    if (!raw) return;

    this.workstationFactory.normalizeMaterials(raw);
    const model = fitModel(raw, dimensions);
    model.position.set(position.x, position.y || 0, position.z);
    model.rotation.y = rotationY;
    this.scene.add(model);
    return model;
  }

  update(delta) {
    // 1. Rotación del ventilador
    if (this.ceilingFan) {
      this.ceilingFan.rotation.y += 0.8 * delta;
    }

    // 2. Actualizar la animación autónoma de cada agente
    this.characters.forEach((character) => {
      character.update(delta);
    });
  }
}
