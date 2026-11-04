import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class DevArea {
  constructor(experience) {
    if (experience && experience.scene) {
      this.experience = experience;
      this.scene = experience.scene;
      this.resources = experience.resources;
    } else {
      this.scene = arguments[0];
      this.resources = arguments[1];
      this.experience = arguments[2] || null;
    }

    this.group = new THREE.Group();
    this.group.name = "zone-dev-area";

    // 1. Pod 1: Bancada Oeste (2 parejas = 4 puestos enfrentados cara a cara)
    this.buildWorkbenchPod({
      centerX: -9.6,
      centerZ: 5.2,
      pairs: 2,
    });

    // 2. Pod 2: Bancada Central-Sur (2 parejas = 4 puestos enfrentados cara a cara)
    this.buildWorkbenchPod({
      centerX: -6.0,
      centerZ: 5.2,
      pairs: 2,
    });

    // 3. Pod 3: Isla Norte (1 pareja = 2 puestos enfrentados cara a cara, sin anillo amarillo)
    this.buildWorkbenchPod({
      centerX: -7.8,
      centerZ: 1.0,
      pairs: 1,
    });

    // 4. Vegetación decorativa
    this.initVegetation();

    this.scene.add(this.group);
  }

  place(assetName, pos, fitOpts, rotY = 0) {
    const raw = this.resources.get(assetName);
    if (!raw) return null;

    const model = raw.clone(true);
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const fitted = fitModel(model, fitOpts);
    fitted.position.set(pos.x, pos.y, pos.z);
    fitted.rotation.y = rotY;
    this.group.add(fitted);
    return fitted;
  }

  // --- CONSTRUCCIÓN DE ISLA TÉCNICA ("DE 2 EN 2") ---
  buildWorkbenchPod({ centerX, centerZ, pairs }) {
    const podGroup = new THREE.Group();
    const tableH = 0.75;
    const tableTopThickness = 0.045;
    const slotW = 1.4;
    const totalW = slotW * pairs;
    const totalD = 1.5; // 0.75m por lado enfrentado

    // 1. Tablero principal en nogal técnico satinado
    const topMat = new THREE.MeshStandardMaterial({
      color: "#3B2417",
      roughness: 0.42,
      metalness: 0.04,
    });
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(totalW, tableTopThickness, totalD),
      topMat,
    );
    deskTop.position.set(centerX, tableH - tableTopThickness / 2, centerZ);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    podGroup.add(deskTop);

    // 2. Panel divisor acústico central (separa a los desarrolladores enfrentados)
    const dividerMat = new THREE.MeshStandardMaterial({
      color: "#222731",
      roughness: 0.85,
    });
    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(totalW - 0.04, 0.28, 0.025),
      dividerMat,
    );
    divider.position.set(centerX, tableH + 0.14, centerZ);
    divider.castShadow = true;
    podGroup.add(divider);

    // 3. Estructura de patas tubulares en acero negro carbón
    const legMat = new THREE.MeshStandardMaterial({
      color: "#15171F",
      roughness: 0.38,
      metalness: 0.85,
    });

    const legPositionsX =
      pairs === 2
        ? [centerX - totalW / 2 + 0.05, centerX, centerX + totalW / 2 - 0.05]
        : [centerX - totalW / 2 + 0.05, centerX + totalW / 2 - 0.05];

    legPositionsX.forEach((lx) => {
      // Pata Norte
      const legN = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, tableH - tableTopThickness, 0.05),
        legMat,
      );
      legN.position.set(
        lx,
        (tableH - tableTopThickness) / 2,
        centerZ - totalD / 2 + 0.06,
      );
      legN.castShadow = true;

      // Pata Sur
      const legS = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, tableH - tableTopThickness, 0.05),
        legMat,
      );
      legS.position.set(
        lx,
        (tableH - tableTopThickness) / 2,
        centerZ + totalD / 2 - 0.06,
      );
      legS.castShadow = true;

      // Travesaño de base
      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.03, totalD - 0.08),
        legMat,
      );
      foot.position.set(lx, 0.015, centerZ);
      foot.castShadow = true;

      podGroup.add(legN, legS, foot);
    });

    this.group.add(podGroup);

    // 4. Equipamiento puesto por puesto (cara a cara)
    const slotCentersX =
      pairs === 2 ? [centerX - slotW / 2, centerX + slotW / 2] : [centerX];

    slotCentersX.forEach((sx, idx) => {
      // Puesto Norte (sentado al norte, mirando al sur)
      this.buildStationHardware({
        slotX: sx,
        centerZ: centerZ,
        facing: "south",
        chairTone: idx % 2 === 0 ? "#20242C" : "#282D36",
      });

      // Puesto Sur (sentado al sur, mirando al norte)
      this.buildStationHardware({
        slotX: sx,
        centerZ: centerZ,
        facing: "north",
        chairTone: idx % 2 === 0 ? "#282D36" : "#20242C",
      });
    });
  }

  // --- HARDWARE, MONITORES Y SILLA DE CADA PUESTO ---
  buildStationHardware({ slotX, centerZ, facing, chairTone }) {
    const isFacingNorth = facing === "north";
    const dir = isFacingNorth ? -1 : 1;
    const baseRot = isFacingNorth ? Math.PI : 0;

    // Monitores duales cóncavos enfrentados hacia el usuario
    const monZ = centerZ + 0.16 * dir;
    const monRotL = isFacingNorth ? Math.PI - 0.22 : 0.22;
    const monRotR = isFacingNorth ? Math.PI + 0.22 : -0.22;

    this.place(
      "monitor",
      { x: slotX - 0.26, y: 0.75, z: monZ },
      { height: 0.44 },
      monRotL,
    );
    this.place(
      "monitor",
      { x: slotX + 0.26, y: 0.75, z: monZ },
      { height: 0.44 },
      monRotR,
    );

    // Teclado
    const hwZ = centerZ + 0.38 * dir;
    this.place(
      "keyboard",
      { x: slotX, y: 0.752, z: hwZ },
      { width: 0.36 },
      baseRot,
    );

    // Mousepad de 20cm y ratón a la derecha del usuario
    const mouseX = isFacingNorth ? slotX + 0.36 : slotX - 0.36;
    const pad = this.place(
      "mousepad",
      { x: mouseX, y: 0.751, z: hwZ },
      { width: 0.2 },
      0,
    );
    if (pad) {
      pad.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.color.set("#161820");
          c.material.roughness = 0.85;
        }
      });
    }
    this.place(
      "mouse",
      { x: mouseX, y: 0.753, z: hwZ },
      { width: 0.08 },
      baseRot,
    );

    // Taza de café a la izquierda del usuario
    const mugX = isFacingNorth ? slotX - 0.44 : slotX + 0.44;
    this.place("coffeeMug", { x: mugX, y: 0.752, z: hwZ }, { maxDim: 0.1 });

    // Torre de PC bajo mesa
    const pcMat = new THREE.MeshStandardMaterial({
      color: "#111317",
      roughness: 0.3,
      metalness: 0.85,
    });
    const pcCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.42, 0.42),
      pcMat,
    );
    const pcX = isFacingNorth ? slotX + 0.52 : slotX - 0.52;
    pcCase.position.set(pcX, 0.21, centerZ + 0.24 * dir);
    pcCase.castShadow = true;
    this.group.add(pcCase);

    // Silla ergonómica corporativa en tono oscuro normal
    const chairZ = centerZ + 0.72 * dir;
    const chair = this.place(
      "chair",
      { x: slotX, y: 0, z: chairZ },
      { height: 1.02 },
      baseRot,
    );
    if (chair) {
      chair.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color.set(chairTone);
          child.material.roughness = 0.52;
          child.material.metalness = 0.05;
        }
      });
    }
  }

  initVegetation() {
    this.place("plantFiddleLeaf", { x: -11.4, y: 0, z: 2.5 }, { height: 1.45 });
    this.place("plantFlowerPot", { x: -7.8, y: 0, z: 3.3 }, { height: 1.1 });
    this.place("plantFlowerPot", { x: -4.4, y: 0, z: 2.2 }, { height: 1.1 });
    this.place("plantFiddleLeaf", { x: -11.4, y: 0, z: 7.8 }, { height: 1.5 });
  }
}
