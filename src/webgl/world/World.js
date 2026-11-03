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
    this.charactersList = [];
    this.workstationFactory = new WorkstationFactory(this.resources);

    // Coordenada Z del pasillo principal
    this.HALLWAY_Z = 0.55;

    this.initVisibleCorridors();
    this.initStations();
    this.initKitchenZone();
    this.initLoungeZone();
    this.initPlants();
  }

  /**
   * Construye pasillos visibles con baldosas oscuras y líneas guía
   */
  initVisibleCorridors() {
    const corridorGroup = new THREE.Group();
    corridorGroup.name = "office-corridors";

    const corridorMat = new THREE.MeshStandardMaterial({
      color: "#151922",
      roughness: 0.85,
      metalness: 0.1,
    });

    const borderMat = new THREE.MeshBasicMaterial({
      color: "#283347",
    });

    const lineMat = new THREE.MeshBasicMaterial({
      color: "#38BDF8",
      transparent: true,
      opacity: 0.35,
    });

    const createPathSegment = (
      width,
      length,
      posX,
      posZ,
      isVertical = false,
    ) => {
      const geo = new THREE.PlaneGeometry(width, length);
      const mesh = new THREE.Mesh(geo, corridorMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(posX, 0.012, posZ);
      mesh.receiveShadow = true;
      corridorGroup.add(mesh);

      // Línea guía central
      const guideGeo = new THREE.PlaneGeometry(
        isVertical ? 0.04 : width * 0.95,
        isVertical ? length * 0.95 : 0.04,
      );
      const guide = new THREE.Mesh(guideGeo, lineMat);
      guide.rotation.x = -Math.PI / 2;
      guide.position.set(posX, 0.014, posZ);
      corridorGroup.add(guide);
    };

    // Pasillo principal horizontal
    createPathSegment(9.6, 1.25, 0, this.HALLWAY_Z, false);

    // Ramales hacia los escritorios
    createPathSegment(0.9, 1.2, -2.6, 1.35, true); // Cluster izquierdo
    createPathSegment(0.9, 1.2, 0.2, 1.35, true); // Centro
    createPathSegment(0.9, 1.2, 3.2, 1.35, true); // Derecha

    // Ramal hacia la zona de agua
    createPathSegment(1.0, 1.5, 0.9, 1.55, true);

    this.scene.add(corridorGroup);
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
        // El modelo del personaje se agrega a la escena en coordenadas de mundo
        this.scene.add(character.model);

        character.onStatusChange = (agentId, status) => {
          this.experience.onAgentStatusChange?.(agentId, status);
        };

        character.destinationProvider = () =>
          this.getWaterCoolerDestination(stationConfig.id);
        character.routeGenerator = (id, targetPos) =>
          this.generateCorridorRoute(id, targetPos);
        character.returnRouteGenerator = (id) =>
          this.generateReturnCorridorRoute(id);

        this.characters.set(stationConfig.id, character);
        this.charactersList.push(character);
      }
    });
  }

  getWaterCoolerDestination(requestingAgentId) {
    const coolerPos = ZONE_PROPS.kitchen?.waterCooler?.position;
    if (!coolerPos) return null;

    const slots = [
      new THREE.Vector3(coolerPos.x - 0.4, 0, coolerPos.z + 0.85),
      new THREE.Vector3(coolerPos.x + 0.4, 0, coolerPos.z + 0.85),
      new THREE.Vector3(coolerPos.x, 0, coolerPos.z + 1.45),
    ];

    for (const slot of slots) {
      let isOccupied = false;
      for (const [id, char] of this.characters.entries()) {
        if (id === requestingAgentId) continue;
        if (
          char.status === "BREAK" ||
          (char.status === "WALKING" && char.roamTarget)
        ) {
          if (char.model.position.distanceTo(slot) < 0.5) {
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

  /**
   * Genera los waypoints estrictos siguiendo la red de pasillos
   */
  generateCorridorRoute(agentId, targetPos) {
    const stationGroup = this.stations.get(agentId);
    const Y = -0.34;
    if (!stationGroup) return [targetPos];

    // 1. Despeje lateral de la silla
    const sideClearWorld = stationGroup.localToWorld(
      new THREE.Vector3(-0.65, Y, 0.46),
    );
    sideClearWorld.y = Y;

    // 2. Salida hacia el ramal del escritorio
    const aisleWorld = stationGroup.localToWorld(
      new THREE.Vector3(-0.65, Y, 1.3),
    );
    aisleWorld.y = Y;

    // 3. Conexión con el pasillo central
    const hallwayEntry = new THREE.Vector3(aisleWorld.x, Y, this.HALLWAY_Z);

    // 4. Avance por el pasillo principal hasta la altura del objetivo
    const hallwayExit = new THREE.Vector3(targetPos.x, Y, this.HALLWAY_Z);

    // 5. Destino final
    const finalDest = targetPos.clone();
    finalDest.y = Y;

    return [sideClearWorld, aisleWorld, hallwayEntry, hallwayExit, finalDest];
  }

  generateReturnCorridorRoute(agentId) {
    const stationGroup = this.stations.get(agentId);
    const Y = -0.34;
    if (!stationGroup) return [];

    const sideClearWorld = stationGroup.localToWorld(
      new THREE.Vector3(-0.65, Y, 0.46),
    );
    sideClearWorld.y = Y;

    const aisleWorld = stationGroup.localToWorld(
      new THREE.Vector3(-0.65, Y, 1.3),
    );
    aisleWorld.y = Y;

    const hallwayEntry = new THREE.Vector3(aisleWorld.x, Y, this.HALLWAY_Z);
    const currentPos = this.characters.get(agentId).model.position;
    const hallwayStart = new THREE.Vector3(currentPos.x, Y, this.HALLWAY_Z);

    const standWorld = stationGroup.localToWorld(
      new THREE.Vector3(-0.15, Y, 0.46),
    );
    standWorld.y = Y;

    return [hallwayStart, hallwayEntry, aisleWorld, sideClearWorld, standWorld];
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
    this.charactersList.forEach((character) => {
      character.update(delta, this.charactersList);
    });
  }
}
