import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class SupervisorOffice {
  constructor(scene, resources) {
    this.scene = scene;
    this.resources = resources;
    this.group = new THREE.Group();
    this.group.name = "zone-supervisor";

    this.initExecutiveDesk();
    this.initChairs();
    this.initStorageAndShelves();
    this.initPlants();
    this.initGlassWallTV();

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

  initExecutiveDesk() {
    // 1. Escritorio Ejecutivo (Intacto en posición y rotación)
    const desk = this.place(
      "desk",
      { x: -8.4, y: 0, z: -5.6 },
      { height: 0.75 },
      Math.PI / 2,
    );
    if (desk) {
      desk.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          const name = child.name.toLowerCase();
          if (
            name.includes("leg") ||
            name.includes("frame") ||
            name.includes("metal")
          ) {
            child.material.color.set("#1E2129");
            child.material.roughness = 0.4;
            child.material.metalness = 0.8;
          } else {
            child.material.color.set("#4A2E1B");
            child.material.roughness = 0.42;
            child.material.metalness = 0.04;
          }
        }
      });
    }

    // 2. Doble Monitor: 10% más grandes (0.485m), separados y enfocados al supervisor
    // Monitor Izquierdo (orientado al centro)
    this.place(
      "monitor",
      { x: -8.67, y: 0.75, z: -5.26 },
      { height: 0.485 },
      -0.26,
    );

    // Monitor Derecho (orientado al centro)
    this.place(
      "monitor",
      { x: -8.13, y: 0.75, z: -5.26 },
      { height: 0.485 },
      0.26,
    );

    // 3. Hardware desplazado hacia adelante (hacia los monitores, liberando el borde inferior)
    this.place("keyboard", { x: -8.4, y: 0.752, z: -5.58 }, { width: 0.38 }, 0);

    // 4. Mousepad pequeño a escala del ratón (20cm) adelantado
    const mousepad = this.place(
      "mousepad",
      { x: -8.06, y: 0.751, z: -5.58 },
      { width: 0.2 },
      0,
    );
    if (mousepad) {
      mousepad.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.color.set("#181A22");
          c.material.roughness = 0.85;
        }
      });
    }

    // 5. Mouse apoyado encima del mousepad
    this.place("mouse", { x: -8.06, y: 0.753, z: -5.58 }, { width: 0.08 }, 0);

    // 6. Taza de café adelantada en el tablero seguro
    this.place("coffeeMug", { x: -7.78, y: 0.752, z: -5.38 }, { maxDim: 0.11 });
  }

  initChairs() {
    // Silla Ejecutiva y Sillas de Visitas (Intactas)
    const bossChair = this.place(
      "chair",
      { x: -8.4, y: 0, z: -6.5 },
      { height: 1.1 },
      0,
    );
    if (bossChair) {
      bossChair.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color.set("#1A1C22");
          child.material.roughness = 0.5;
        }
      });
    }

    const guestL = this.place(
      "chair",
      { x: -9.1, y: 0, z: -4.6 },
      { height: 0.98 },
      Math.PI - 0.18,
    );
    const guestR = this.place(
      "chair",
      { x: -7.7, y: 0, z: -4.6 },
      { height: 0.98 },
      Math.PI + 0.18,
    );

    [guestL, guestR].forEach((c) => {
      if (c) {
        c.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.set("#263242");
            child.material.roughness = 0.6;
          }
        });
      }
    });
  }

  initStorageAndShelves() {
    const northBookcase = this.place(
      "cubeCabinet",
      { x: -5.5, y: 0, z: -8.0 },
      { height: 2.1 },
      Math.PI,
    );
    const westCredenza = this.place(
      "cubeCabinet",
      { x: -11.4, y: 0, z: -6.0 },
      { height: 1.45 },
      -Math.PI / 2,
    );

    [northBookcase, westCredenza].forEach((cabinet) => {
      if (cabinet) {
        cabinet.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.set("#4E301D");
            child.material.roughness = 0.45;
            child.material.metalness = 0.04;
          }
        });
      }
    });
  }

  initPlants() {
    this.place(
      "plantFiddleLeaf",
      { x: -11.2, y: 0, z: -3.8 },
      { height: 1.45 },
    );
    this.place("plantFlowerPot", { x: -11.2, y: 0, z: -7.8 }, { height: 0.95 });
  }

  initGlassWallTV() {
    const tvPos = { x: -8.4, y: 2.05, z: -2.85 };
    const tv = this.place("tvFlatScreen", tvPos, { height: 0.95 }, Math.PI);
    if (tv) {
      tv.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          if (c.name.toLowerCase().includes("screen")) {
            c.material.color.set("#0A0C12");
            c.material.roughness = 0.15;
          } else {
            c.material.color.set("#12141A");
            c.material.roughness = 0.35;
            c.material.metalness = 0.8;
          }
        }
      });
    }

    const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.25, 16);
    const poleMat = new THREE.MeshStandardMaterial({
      color: "#15171E",
      roughness: 0.35,
      metalness: 0.85,
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(tvPos.x, tvPos.y + 0.55, tvPos.z + 0.05);
    pole.castShadow = true;
    this.group.add(pole);
  }
}
