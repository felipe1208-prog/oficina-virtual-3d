import * as THREE from "three";
import { WorkstationFactory } from "./WorkstationFactory.js";
import {
  AGENT_STATIONS,
  ZONE_PROPS,
  OFFICE_BOUNDS,
} from "../../config/officeLayout.js";

export class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.stations = new Map();
    this.characters = new Map();
    this.charactersList = [];
    this.ceilingFans = [];
    this.workstationFactory = new WorkstationFactory(this.resources);

    // Red de Pasillos de Navegación
    this.HALLWAY_Z = 0.0;
    this.HALLWAY_X_LEFT = -3.1;
    this.HALLWAY_X_RIGHT = 4.6;

    this.initCozyArchitecture();
    this.initCarpetPaths();
    this.initStations();
    this.initWindows();
    this.initCeilingEquipment();
    this.initLoungeZone();
    this.initKitchenZone();
    this.initPlants();
  }

  /**
   * Escalado proporcional seguro inmune a orientaciones arbitrarias del GLB
   */
  fitModelInstance(model, options = {}) {
    model.scale.set(1, 1, 1);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    let scale = 1;
    if (options.height && size.y > 0.001) {
      scale = options.height / size.y;
    } else if (options.maxDim) {
      const max = Math.max(size.x, size.y, size.z);
      if (max > 0.001) scale = options.maxDim / max;
    } else if (options.width) {
      const horiz = Math.max(size.x, size.z);
      if (horiz > 0.001) scale = options.width / horiz;
    }
    model.scale.setScalar(scale);
    return model;
  }

  placeFittedModel(assetName, position, fitOptions, rotationY = 0) {
    const raw = this.resources.get(assetName);
    if (!raw) return null;

    // Clonación profunda de nodos y mallas
    const model = raw.clone(true);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      }
    });

    this.fitModelInstance(model, fitOptions);
    model.position.set(position.x, position.y, position.z);
    model.rotation.y = rotationY;
    this.scene.add(model);
    return model;
  }

  createWoodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#684526";
    ctx.fillRect(0, 0, 1024, 1024);

    const plankHeight = 64;
    const plankWidth = 256;

    for (let y = 0; y < 1024; y += plankHeight) {
      const offsetX = (y / plankHeight) % 2 === 0 ? 0 : plankWidth / 2;
      for (let x = -plankWidth; x < 1024 + plankWidth; x += plankWidth) {
        const px = x + offsetX;
        const toneVar = Math.sin(x * 12.5 + y * 7.2) * 12;
        ctx.fillStyle = `rgb(${Math.min(255, 104 + toneVar)},${Math.min(255, 69 + toneVar * 0.8)},${Math.min(255, 38 + toneVar * 0.6)})`;
        ctx.fillRect(px, y, plankWidth - 2, plankHeight - 2);

        ctx.fillStyle = "rgba(40, 25, 12, 0.16)";
        ctx.fillRect(px, y + 18, plankWidth - 2, 2);
        ctx.fillRect(px, y + 42, plankWidth - 2, 1.5);
      }
    }

    ctx.strokeStyle = "rgba(25, 14, 6, 0.85)";
    ctx.lineWidth = 2;
    for (let y = 0; y <= 1024; y += plankHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 5);
    return texture;
  }

  initCozyArchitecture() {
    const { width, depth, wallHeight } = OFFICE_BOUNDS;

    // Parquet de Madera Cálida
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.createWoodTexture(),
      roughness: 0.65,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Paredes Arena / Lino Cálido con Zócalo de Madera Oscura
    const wallMat = new THREE.MeshStandardMaterial({
      color: "#D4C9BA",
      roughness: 0.92,
      metalness: 0.02,
    });
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: "#341D0D",
      roughness: 0.75,
    });

    const createWall = (w, h, px, py, pz, rotY) => {
      const g = new THREE.Group();
      g.position.set(px, py, pz);
      g.rotation.y = rotY;

      const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
      wall.position.y = h / 2;
      wall.receiveShadow = true;
      g.add(wall);

      const baseboard = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.14, 0.04),
        baseboardMat,
      );
      baseboard.position.set(0, 0.07, 0.02);
      g.add(baseboard);

      this.scene.add(g);
    };

    createWall(width, wallHeight, 0, 0, depth / 2, Math.PI);
    createWall(depth, wallHeight, -width / 2, 0, 0, Math.PI / 2);
    createWall(depth, wallHeight, width / 2, 0, 0, -Math.PI / 2);
    createWall(width, wallHeight, 0, 0, -depth / 2, 0);
  }

  initCarpetPaths() {
    const carpetGroup = new THREE.Group();
    const carpetMat = new THREE.MeshStandardMaterial({
      color: "#242B38",
      roughness: 0.95,
      metalness: 0.02,
    });
    const borderMat = new THREE.MeshBasicMaterial({ color: "#C4A472" });

    const addCarpet = (w, l, px, pz) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, l), carpetMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(px, 0.008, pz);
      mesh.receiveShadow = true;
      carpetGroup.add(mesh);

      const b1 = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.03), borderMat);
      b1.rotation.x = -Math.PI / 2;
      b1.position.set(px, 0.009, pz - l / 2 + 0.02);
      carpetGroup.add(b1);

      const b2 = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.03), borderMat);
      b2.rotation.x = -Math.PI / 2;
      b2.position.set(px, 0.009, pz + l / 2 - 0.02);
      carpetGroup.add(b2);
    };

    // Pasillo Central Horizontal
    addCarpet(14.4, 1.4, 0, this.HALLWAY_Z);
    // Ramal Pod de Desarrollo (izquierda)
    addCarpet(1.3, 4.8, this.HALLWAY_X_LEFT, 2.4);
    // Ramal Supervisor (derecha superior)
    addCarpet(1.3, 3.8, this.HALLWAY_X_RIGHT, -1.9);
    // Ramal Cocina / Break (derecha inferior)
    addCarpet(1.3, 4.8, this.HALLWAY_X_RIGHT, 2.4);
    // Ramal Lounge (izquierda superior)
    addCarpet(1.3, 3.8, this.HALLWAY_X_LEFT, -1.9);

    this.scene.add(carpetGroup);
  }

  initStations() {
    Object.values(AGENT_STATIONS).forEach((stationConfig) => {
      const { group, character } =
        this.workstationFactory.create(stationConfig);
      this.scene.add(group);
      this.stations.set(stationConfig.id, group);

      if (character) {
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

  initWindows() {
    const windows = ZONE_PROPS.windows || [];
    windows.forEach((win) => {
      // Escala humana: 1.45m de alto y rotación de 90° plana contra el muro
      this.placeFittedModel(
        "window",
        win.position,
        { height: 1.45 },
        Math.PI / 2,
      );
    });
  }

  initCeilingEquipment() {
    const fans = ZONE_PROPS.ceilingFans || [];
    fans.forEach((f) => {
      const fan = this.placeFittedModel("ceilingFan", f.position, {
        maxDim: 1.3,
      });
      if (fan) this.ceilingFans.push(fan);
    });

    const lights = ZONE_PROPS.ceilingLights || [];
    lights.forEach((l) => {
      this.placeFittedModel("ceilingLight", l.position, { maxDim: 0.65 });
      const point = new THREE.PointLight("#FFE6C0", 0.95, 7.5);
      point.position.set(l.position.x, l.position.y - 0.25, l.position.z);
      this.scene.add(point);
    });
  }

  initLoungeZone() {
    const lounge = ZONE_PROPS.lounge;
    if (!lounge) return;

    // Mesa de Ping-Pong reglamentaria
    this.placeFittedModel(
      "pingPongTable",
      lounge.pingPongTable.position,
      { height: 0.76 },
      lounge.pingPongTable.rotation.y,
    );
    this.placeFittedModel(
      "pingPongPaddle",
      {
        x: lounge.pingPongTable.position.x - 0.4,
        y: 0.77,
        z: lounge.pingPongTable.position.z,
      },
      { maxDim: 0.26 },
    );
    this.placeFittedModel(
      "pingPongPaddle",
      {
        x: lounge.pingPongTable.position.x + 0.4,
        y: 0.77,
        z: lounge.pingPongTable.position.z + 0.2,
      },
      { maxDim: 0.26 },
      Math.PI / 3,
    );
    this.placeFittedModel(
      "pingPongBall",
      {
        x: lounge.pingPongTable.position.x - 0.1,
        y: 0.77,
        z: lounge.pingPongTable.position.z - 0.1,
      },
      { maxDim: 0.04 },
    );

    // Sofás y Mesa de Centro
    this.placeFittedModel(
      "couchMedium",
      lounge.couchMedium.position,
      { height: 0.78 },
      lounge.couchMedium.rotation.y,
    );
    this.placeFittedModel(
      "couchSmall",
      lounge.couchSmall.position,
      { height: 0.78 },
      lounge.couchSmall.rotation.y,
    );
    this.placeFittedModel("tableCoffee", lounge.coffeeTable.position, {
      height: 0.42,
    });
    this.placeFittedModel(
      "tvRemote",
      {
        x: lounge.coffeeTable.position.x,
        y: 0.43,
        z: lounge.coffeeTable.position.z,
      },
      { maxDim: 0.16 },
    );
    this.placeFittedModel(
      "tvFlatScreen",
      lounge.tv.position,
      { height: 0.82 },
      lounge.tv.rotation.y,
    );
  }

  initKitchenZone() {
    const kitchen = ZONE_PROPS.kitchen;
    if (!kitchen) return;

    // Dispensador de Agua a escala de 1.35m
    this.placeFittedModel("waterCooler", kitchen.waterCooler.position, {
      height: 1.35,
    });
    this.placeFittedModel("trashcan", kitchen.trashcan.position, {
      height: 0.42,
    });

    // Encimera / Mostrador de Madera para la Cafetera
    const counterGroup = new THREE.Group();
    counterGroup.position.set(
      kitchen.counter.position.x,
      0,
      kitchen.counter.position.z,
    );

    const baseGeo = new THREE.BoxGeometry(1.6, 0.85, 0.65);
    const baseMat = new THREE.MeshStandardMaterial({
      color: "#2B1911",
      roughness: 0.75,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.85 / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    counterGroup.add(baseMesh);

    const topGeo = new THREE.BoxGeometry(1.66, 0.04, 0.71);
    const topMat = new THREE.MeshStandardMaterial({
      color: "#ECE5D8",
      roughness: 0.35,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.85 + 0.02;
    topMesh.castShadow = true;
    counterGroup.add(topMesh);
    this.scene.add(counterGroup);

    // Cafetera, Taza y Latas apoyadas sobre el mostrador a Y = 0.87m
    this.placeFittedModel(
      "coffeeMachine",
      { x: kitchen.counter.position.x, y: 0.87, z: kitchen.counter.position.z },
      { height: 0.38 },
    );
    this.placeFittedModel(
      "coffeeMug",
      {
        x: kitchen.counter.position.x + 0.45,
        y: 0.87,
        z: kitchen.counter.position.z,
      },
      { maxDim: 0.11 },
    );
    this.placeFittedModel(
      "sodaCan",
      {
        x: kitchen.counter.position.x - 0.45,
        y: 0.87,
        z: kitchen.counter.position.z - 0.1,
      },
      { maxDim: 0.12 },
    );
    this.placeFittedModel(
      "sodaCanCrushed",
      {
        x: kitchen.counter.position.x - 0.55,
        y: 0.87,
        z: kitchen.counter.position.z + 0.1,
      },
      { maxDim: 0.1 },
    );
  }

  initPlants() {
    const plants = ZONE_PROPS.plants || [];
    plants.forEach((plant) => {
      this.placeFittedModel("houseplant", plant.position, {
        height: plant.scale,
      });
    });
  }

  getWaterCoolerDestination(requestingAgentId) {
    const coolerPos = ZONE_PROPS.kitchen?.waterCooler?.position;
    if (!coolerPos) return null;

    const slots = [
      new THREE.Vector3(coolerPos.x - 0.5, 0, coolerPos.z + 0.85),
      new THREE.Vector3(coolerPos.x + 0.5, 0, coolerPos.z + 0.85),
    ];

    for (const slot of slots) {
      let isOccupied = false;
      for (const [id, char] of this.characters.entries()) {
        if (id === requestingAgentId) continue;
        if (
          char.status === "BREAK" ||
          (char.status === "WALKING" && char.roamTarget)
        ) {
          if (char.model.position.distanceTo(slot) < 0.55) {
            isOccupied = true;
            break;
          }
        }
      }
      if (!isOccupied) return { name: "Dispensador de Agua", position: slot };
    }

    return { name: "Dispensador de Agua", position: slots[0] };
  }

  generateCorridorRoute(agentId, targetPos) {
    const stationGroup = this.stations.get(agentId);
    const Y = -0.34;
    if (!stationGroup) return [targetPos];

    const stationPos = stationGroup.position;
    const isLeftSide = stationPos.x < 0;
    const branchX = isLeftSide ? this.HALLWAY_X_LEFT : this.HALLWAY_X_RIGHT;

    const sideClear = stationGroup.localToWorld(
      new THREE.Vector3(-0.65, Y, 0.46),
    );
    sideClear.y = Y;

    const branchPoint = new THREE.Vector3(
      branchX,
      Y,
      stationPos.z + (stationPos.z > 0 ? -0.7 : 0.7),
    );
    const mainAislePoint = new THREE.Vector3(branchX, Y, this.HALLWAY_Z);
    const targetBranchX =
      targetPos.x < 0 ? this.HALLWAY_X_LEFT : this.HALLWAY_X_RIGHT;
    const targetAislePoint = new THREE.Vector3(
      targetBranchX,
      Y,
      this.HALLWAY_Z,
    );
    const finalDest = targetPos.clone();
    finalDest.y = Y;

    return [
      sideClear,
      branchPoint,
      mainAislePoint,
      targetAislePoint,
      finalDest,
    ];
  }

  generateReturnCorridorRoute(agentId) {
    const stationGroup = this.stations.get(agentId);
    const Y = -0.34;
    if (!stationGroup) return [];

    const stationPos = stationGroup.position;
    const isLeftSide = stationPos.x < 0;
    const branchX = isLeftSide ? this.HALLWAY_X_LEFT : this.HALLWAY_X_RIGHT;

    const currentPos = this.characters.get(agentId).model.position;
    const returnStartAisle = new THREE.Vector3(
      currentPos.x > 0 ? this.HALLWAY_X_RIGHT : this.HALLWAY_X_LEFT,
      Y,
      this.HALLWAY_Z,
    );
    const targetMainAisle = new THREE.Vector3(branchX, Y, this.HALLWAY_Z);
    const branchPoint = new THREE.Vector3(
      branchX,
      Y,
      stationPos.z + (stationPos.z > 0 ? -0.7 : 0.7),
    );

    const sideClear = stationGroup.localToWorld(
      new THREE.Vector3(-0.65, Y, 0.46),
    );
    sideClear.y = Y;

    const standWorld = stationGroup.localToWorld(
      new THREE.Vector3(-0.15, Y, 0.46),
    );
    standWorld.y = Y;

    return [
      returnStartAisle,
      targetMainAisle,
      branchPoint,
      sideClear,
      standWorld,
    ];
  }

  update(delta) {
    this.ceilingFans.forEach((fan) => {
      fan.rotation.y += delta * 2.8;
    });

    this.charactersList.forEach((character) => {
      character.update(delta, this.charactersList);
    });
  }
}
