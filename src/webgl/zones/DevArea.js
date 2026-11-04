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

    // 1. Pod 1: Bancada Oeste (2 parejas = 4 puestos)
    this.buildWorkbenchPod({
      centerX: -9.6,
      centerZ: 5.2,
      pairs: 2,
    });

    // 2. Pod 2: Bancada Central-Sur (2 parejas = 4 puestos)
    this.buildWorkbenchPod({
      centerX: -6.0,
      centerZ: 5.2,
      pairs: 2,
    });

    // 3. Pod 3: Isla Norte (1 pareja = 2 puestos)
    this.buildWorkbenchPod({
      centerX: -7.8,
      centerZ: 1.0,
      pairs: 1,
    });

    // 4. Vegetación perimetral (pasillos 100% libres)
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

  // --- ESTRUCTURA DE LA BANCADA TÉCNICA ---
  buildWorkbenchPod({ centerX, centerZ, pairs }) {
    const podGroup = new THREE.Group();
    const tableH = 0.75;
    const tableTopThickness = 0.045;
    const slotW = 1.4;
    const totalW = slotW * pairs;
    const totalD = 1.5; // 0.75m por lado

    // 1. Tablero principal en nogal satinado
    const topMat = new THREE.MeshStandardMaterial({
      color: "#382215",
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

    // 2. Panel divisor acústico central
    const dividerMat = new THREE.MeshStandardMaterial({
      color: "#20242D",
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

      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.03, totalD - 0.08),
        legMat,
      );
      foot.position.set(lx, 0.015, centerZ);
      foot.castShadow = true;

      podGroup.add(legN, legS, foot);
    });

    this.group.add(podGroup);

    // 4. Equipamiento en ambos lados (Norte y Sur)
    const slotCentersX =
      pairs === 2 ? [centerX - slotW / 2, centerX + slotW / 2] : [centerX];

    slotCentersX.forEach((sx, idx) => {
      // Puesto Fila Norte (sentado al norte, mirando al sur)
      this.buildStationHardware({
        slotX: sx,
        centerZ: centerZ,
        isNorth: true,
        chairTone: idx % 2 === 0 ? "#22262E" : "#2A2F38",
      });

      // Puesto Fila Sur (sentado al sur, mirando al norte)
      this.buildStationHardware({
        slotX: sx,
        centerZ: centerZ,
        isNorth: false,
        chairTone: idx % 2 === 0 ? "#2A2F38" : "#22262E",
      });
    });
  }

  // --- HARDWARE, MONITORES Y SILLA POR PUESTO ---
  buildStationHardware({ slotX, centerZ, isNorth, chairTone }) {
    if (isNorth) {
      // === PUESTO NORTE (Usuario en Z < centerZ, mira al SUR +Z) ===

      // 1. Doble Monitor: caras mirando al Norte (-Z) hacia el usuario, cóncavos hacia el centro
      this.place(
        "monitor",
        { x: slotX + 0.28, y: 0.75, z: centerZ - 0.2 },
        { height: 0.44 },
        -0.24,
      );
      this.place(
        "monitor",
        { x: slotX - 0.28, y: 0.75, z: centerZ - 0.2 },
        { height: 0.44 },
        0.24,
      );

      // 2. Teclado frente al usuario
      this.place(
        "keyboard",
        { x: slotX, y: 0.752, z: centerZ - 0.52 },
        { width: 0.36 },
        0,
      );

      // 3. Mousepad y Mouse en la mano derecha del usuario (hacia -X)
      const pad = this.place(
        "mousepad",
        { x: slotX - 0.38, y: 0.751, z: centerZ - 0.52 },
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
        { x: slotX - 0.38, y: 0.753, z: centerZ - 0.52 },
        { width: 0.08 },
        0,
      );

      // 4. Taza de café en la mano izquierda del usuario (hacia +X)
      this.place(
        "coffeeMug",
        { x: slotX + 0.44, y: 0.752, z: centerZ - 0.48 },
        { maxDim: 0.1 },
      );

      // 5. Torre PC bajo la mesa
      const pcMat = new THREE.MeshStandardMaterial({
        color: "#111317",
        roughness: 0.3,
        metalness: 0.85,
      });
      const pcCase = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.42, 0.42),
        pcMat,
      );
      pcCase.position.set(slotX + 0.52, 0.21, centerZ - 0.35);
      pcCase.castShadow = true;
      this.group.add(pcCase);

      // 6. Silla Ergonómica extraída (Z = centerZ - 1.12m, mirando al Sur rotY = 0)
      const chair = this.place(
        "chair",
        { x: slotX, y: 0, z: centerZ - 1.12 },
        { height: 1.02 },
        0,
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
    } else {
      // === PUESTO SUR (Usuario en Z > centerZ, mira al NORTE -Z) ===

      // 1. Doble Monitor: caras mirando al Sur (+Z) hacia el usuario, cóncavos hacia el centro
      this.place(
        "monitor",
        { x: slotX - 0.28, y: 0.75, z: centerZ + 0.2 },
        { height: 0.44 },
        Math.PI - 0.24,
      );
      this.place(
        "monitor",
        { x: slotX + 0.28, y: 0.75, z: centerZ + 0.2 },
        { height: 0.44 },
        Math.PI + 0.24,
      );

      // 2. Teclado frente al usuario
      this.place(
        "keyboard",
        { x: slotX, y: 0.752, z: centerZ + 0.52 },
        { width: 0.36 },
        Math.PI,
      );

      // 3. Mousepad y Mouse en la mano derecha del usuario (hacia +X)
      const pad = this.place(
        "mousepad",
        { x: slotX + 0.38, y: 0.751, z: centerZ + 0.52 },
        { width: 0.2 },
        Math.PI,
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
        { x: slotX + 0.38, y: 0.753, z: centerZ + 0.52 },
        { width: 0.08 },
        Math.PI,
      );

      // 4. Taza de café en la mano izquierda del usuario (hacia -X)
      this.place(
        "coffeeMug",
        { x: slotX - 0.44, y: 0.752, z: centerZ + 0.48 },
        { maxDim: 0.1 },
      );

      // 5. Torre PC bajo la mesa
      const pcMat = new THREE.MeshStandardMaterial({
        color: "#111317",
        roughness: 0.3,
        metalness: 0.85,
      });
      const pcCase = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.42, 0.42),
        pcMat,
      );
      pcCase.position.set(slotX - 0.52, 0.21, centerZ + 0.35);
      pcCase.castShadow = true;
      this.group.add(pcCase);

      // 6. Silla Ergonómica extraída (Z = centerZ + 1.12m, mirando al Norte rotY = Math.PI)
      const chair = this.place(
        "chair",
        { x: slotX, y: 0, z: centerZ + 1.12 },
        { height: 1.02 },
        Math.PI,
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
  }

  initVegetation() {
    // Esquina entre Pod 3 y el ventanal oeste
    this.place("plantFiddleLeaf", { x: -11.4, y: 0, z: 0.0 }, { height: 1.45 });

    // Ventanal entre Pod 1 y la fachada oeste
    this.place("plantFlowerPot", { x: -11.4, y: 0, z: 3.5 }, { height: 1.1 });

    // Esquina frontal suroeste
    this.place("plantFiddleLeaf", { x: -11.4, y: 0, z: 8.0 }, { height: 1.5 });

    // Esquina lateral junto al pasillo principal
    this.place("plantFlowerPot", { x: -4.0, y: 0, z: 2.5 }, { height: 1.1 });
  }
}
