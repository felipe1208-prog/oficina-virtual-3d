import * as THREE from "three";
import { WorkstationFactory } from "./WorkstationFactory.js";
import { fitModel } from "../utils/modelUtils.js";
import { AGENT_STATIONS, ZONE_PROPS } from "../../config/officeLayout.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.stations = new Map();
    this.characters = new Map();
    this.workstationFactory = new WorkstationFactory(this.resources);

    this.initStations();
    this.initKitchenZone();
    this.initLoungeZone();
    this.initPlants();
  }

  placeFittedModel(assetName, position, fitOptions, rotationY = 0) {
    const raw = this.resources.get(assetName);
    if (!raw) return null;

    raw.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          mats.forEach((m) => {
            m.flatShading = true;
            m.roughness = 0.85;
            m.metalness = 0.05;
            m.needsUpdate = true;
          });
        }
      }
    });

    const model = fitModel(raw, fitOptions);
    model.position.set(position.x, position.y, position.z);
    model.rotation.y = rotationY;
    this.scene.add(model);
    return model;
  }

  initStations() {
    Object.values(AGENT_STATIONS).forEach((stationConfig) => {
      const { group, character } =
        this.workstationFactory.create(stationConfig);
      this.scene.add(group);
      this.stations.set(stationConfig.id, group);

      if (character) {
        character.onStatusChange = (agentId, status) => {
          this.experience.onAgentStatusChange?.(agentId, status);
        };

        // Proveedor de destino con selección de ranura libre para evitar sobreposiciones
        character.destinationProvider = () =>
          this.getWaterCoolerDestination(stationConfig.id);
        this.characters.set(stationConfig.id, character);
      }
    });
  }

  getWaterCoolerDestination(requestingAgentId) {
    const coolerPos = ZONE_PROPS.kitchen?.waterCooler?.position;
    if (!coolerPos) return null;

    // Ranuras independientes frente al dispensador (lado izquierdo, lado derecho y espera)
    const slots = [
      new THREE.Vector3(coolerPos.x - 0.45, 0, coolerPos.z + 0.75),
      new THREE.Vector3(coolerPos.x + 0.45, 0, coolerPos.z + 0.75),
      new THREE.Vector3(coolerPos.x, 0, coolerPos.z + 1.35),
    ];

    for (const slot of slots) {
      let isOccupied = false;
      for (const [id, char] of this.characters.entries()) {
        if (id === requestingAgentId) continue;
        if (
          char.status === "BREAK" ||
          (char.status === "WALKING" && char.roamTarget)
        ) {
          const charPos = char.getWorldPosition();
          if (charPos.distanceTo(slot) < 0.5) {
            isOccupied = true;
            break;
          }
        }
      }
      if (!isOccupied) {
        return { name: "Dispensador de Agua", position: slot };
      }
    }

    return { name: "Dispensador de Agua", position: slots[0] };
  }

  checkAgentCollisions() {
    const charList = Array.from(this.characters.values());

    for (let i = 0; i < charList.length; i++) {
      const charA = charList[i];
      charA.isBlocked = false;

      if (charA.status !== "WALKING" && charA.status !== "RETURNING") continue;

      const posA = charA.getWorldPosition();

      for (let j = 0; j < charList.length; j++) {
        if (i === j) continue;
        const charB = charList[j];
        const posB = charB.getWorldPosition();
        const dist = posA.distanceTo(posB);

        // Si hay otro avatar a menos de 0.8m en el cono de avance, charA frena
        if (dist < 0.8) {
          const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            charA.model.rotation.y,
          );
          const toB = new THREE.Vector3().subVectors(posB, posA).normalize();
          if (forward.dot(toB) > 0.35) {
            charA.isBlocked = true;
            break;
          }
        }
      }
    }
  }

  initKitchenZone() {
    const kitchen = ZONE_PROPS.kitchen;
    if (!kitchen) return;

    if (kitchen.coffeeMachine) {
      this.placeFittedModel("coffeeMachine", kitchen.coffeeMachine.position, {
        height: 0.42,
      });
    }
    if (kitchen.waterCooler) {
      this.placeFittedModel("waterCooler", kitchen.waterCooler.position, {
        width: 0.38,
      });
    }
    if (kitchen.trashcan) {
      this.placeFittedModel("trashcan", kitchen.trashcan.position, {
        height: 0.4,
      });
    }
  }

  initLoungeZone() {
    const lounge = ZONE_PROPS.lounge;
    if (!lounge) return;

    if (lounge.sofa) {
      this.placeFittedModel(
        "sofa",
        lounge.sofa.position,
        { width: 1.8 },
        lounge.sofa.rotation?.y || 0,
      );
    }
    if (lounge.coffeeTable) {
      this.placeFittedModel("coffeeTable", lounge.coffeeTable.position, {
        width: 0.9,
      });
    }
    if (lounge.pingPongTable) {
      this.placeFittedModel("pingPongTable", lounge.pingPongTable.position, {
        width: 1.6,
      });
    }
  }

  initPlants() {
    const plants = ZONE_PROPS.plants || [];
    plants.forEach((plant) => {
      this.placeFittedModel("plant", plant.position, {
        height: plant.scale || 0.9,
      });
    });
  }

  update(delta) {
    this.checkAgentCollisions();
    this.characters.forEach((character) => {
      character.update(delta);
    });
  }
}
