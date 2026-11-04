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

    // 1. Pod 1: Bancada Oeste (4 puestos junto a ventanas)
    this.buildFourSeatPod({
      centerX: -9.6,
      centerZ: 5.2,
    });

    // 2. Pod 2: Bancada Central-Sur (4 puestos)
    this.buildFourSeatPod({
      centerX: -6.0,
      centerZ: 5.2,
    });

    // 3. Pod 3: Isla Focal Norte (2 puestos con anillo holográfico)
    this.buildTwoSeatPod({
      centerX: -7.8,
      centerZ: 1.0,
      hasSelectionRing: true,
    });

    // 4. Vegetación perimetral
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

  // --- ESTACIÓN INDIVIDUAL ROTADA 90° (MIRA AL NORTE O AL SUR) ---
  buildSingleStation(deskCenter, facingDirection, chairTone = "#20242C") {
    const isFacingNorth = facingDirection === "north"; // Mira a -Z (hacia el supervisor)
    const baseRot = isFacingNorth ? Math.PI : 0;
    const dirSign = isFacingNorth ? -1 : 1; // -1 si mira a -Z, +1 si mira a +Z

    // 1. Escritorio individual (ancho 1.40m a lo largo del eje X)
    const desk = this.place(
      "desk",
      { x: deskCenter.x, y: 0, z: deskCenter.z },
      { height: 0.75, width: 1.4 },
      baseRot,
    );
    if (desk) {
      desk.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          const n = child.name.toLowerCase();
          if (n.includes("leg") || n.includes("frame") || n.includes("metal")) {
            child.material.color.set("#181A20");
            child.material.roughness = 0.4;
            child.material.metalness = 0.85;
          } else {
            child.material.color.set("#3A2417"); // Nogal técnico cálido
            child.material.roughness = 0.44;
            child.material.metalness = 0.03;
          }
        }
      });
    }

    // 2. Doble Monitor Profesional (cóncavos hacia el desarrollador)
    const monZ = deskCenter.z + 0.2 * dirSign;
    const monLRot = isFacingNorth ? Math.PI - 0.22 : -0.22;
    const monRRot = isFacingNorth ? Math.PI + 0.22 : 0.22;

    this.place(
      "monitor",
      { x: deskCenter.x - 0.28, y: 0.75, z: monZ },
      { height: 0.44 },
      monLRot,
    );
    this.place(
      "monitor",
      { x: deskCenter.x + 0.28, y: 0.75, z: monZ },
      { height: 0.44 },
      monRRot,
    );

    // 3. Hardware en mesa (Teclado centrado + Mousepad 20cm + Ratón a la derecha)
    const hwZ = deskCenter.z - 0.16 * dirSign;
    this.place(
      "keyboard",
      { x: deskCenter.x, y: 0.752, z: hwZ },
      { width: 0.36 },
      isFacingNorth ? Math.PI : 0,
    );

    // Ratón a la derecha del usuario
    const mouseX = isFacingNorth ? deskCenter.x + 0.38 : deskCenter.x - 0.38;
    const mousepad = this.place(
      "mousepad",
      { x: mouseX, y: 0.751, z: hwZ },
      { width: 0.2 },
      0,
    );
    if (mousepad) {
      mousepad.traverse((c) => {
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
      isFacingNorth ? Math.PI : 0,
    );

    // Taza de café a la izquierda del usuario
    const mugX = isFacingNorth ? deskCenter.x - 0.45 : deskCenter.x + 0.45;
    this.place("coffeeMug", { x: mugX, y: 0.752, z: hwZ }, { maxDim: 0.1 });

    // 4. Torre de Computadora en el suelo bajo la mesa
    const pcMat = new THREE.MeshStandardMaterial({
      color: "#111317",
      roughness: 0.3,
      metalness: 0.85,
    });
    const pcCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.42, 0.44),
      pcMat,
    );
    pcCase.position.set(deskCenter.x + 0.45, 0.21, deskCenter.z);
    pcCase.castShadow = true;
    this.group.add(pcCase);

    // 5. Silla Ergonómica en color corporativo normal (Grafito / Carbón)
    const chairZ = deskCenter.z - 0.75 * dirSign;
    const chairRot = isFacingNorth ? Math.PI : 0;
    const chair = this.place(
      "chair",
      { x: deskCenter.x, y: 0, z: chairZ },
      { height: 1.02 },
      chairRot,
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

  // --- BANCADA DE 4 PUESTOS (2 AL NORTE ENFRENTADOS A 2 AL SUR) ---
  buildFourSeatPod({ centerX, centerZ }) {
    const spacingX = 0.72;
    const spacingZ = 0.4;

    // Fila Norte: mirando al Sur (+Z)
    this.buildSingleStation(
      { x: centerX - spacingX, z: centerZ - spacingZ },
      "south",
      "#20242C",
    );
    this.buildSingleStation(
      { x: centerX + spacingX, z: centerZ - spacingZ },
      "south",
      "#282D36",
    );

    // Fila Sur: mirando al Norte (-Z)
    this.buildSingleStation(
      { x: centerX - spacingX, z: centerZ + spacingZ },
      "north",
      "#282D36",
    );
    this.buildSingleStation(
      { x: centerX + spacingX, z: centerZ + spacingZ },
      "north",
      "#20242C",
    );
  }

  // --- ISLA DE 2 PUESTOS (1 AL NORTE ENFRENTADO A 1 AL SUR) ---
  buildTwoSeatPod({ centerX, centerZ, hasSelectionRing }) {
    const spacingZ = 0.4;

    // Puesto Norte: mirando al Sur (+Z)
    this.buildSingleStation(
      { x: centerX, z: centerZ - spacingZ },
      "south",
      "#242932",
    );

    // Puesto Sur: mirando al Norte (-Z)
    this.buildSingleStation(
      { x: centerX, z: centerZ + spacingZ },
      "north",
      "#20242C",
    );

    // Anillo holográfico de agente activo alrededor de la silla sur
    if (hasSelectionRing) {
      const ringGeo = new THREE.RingGeometry(0.85, 0.9, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: "#F59E0B",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(centerX, 0.015, centerZ + spacingZ + 0.75);
      this.group.add(ring);
    }
  }

  initVegetation() {
    this.place("plantFiddleLeaf", { x: -11.4, y: 0, z: 2.5 }, { height: 1.45 });
    this.place("plantFlowerPot", { x: -7.8, y: 0, z: 3.5 }, { height: 1.1 });
    this.place("plantFlowerPot", { x: -4.4, y: 0, z: 2.2 }, { height: 1.1 });
    this.place("plantFiddleLeaf", { x: -11.4, y: 0, z: 7.8 }, { height: 1.5 });
  }
}
