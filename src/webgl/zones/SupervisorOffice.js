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
    // 1. Escritorio Ejecutivo (Intacto en posición y rotación Math.PI / 2)
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

    // 2. Doble Monitor Profesional (Negro grafito antirreflejo, sin luz azul)
    const setupMonitor = (m) => {
      if (!m) return;
      m.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.color.set("#14171E");
          c.material.roughness = 0.35;
          c.material.metalness = 0.2;
          if (c.material.emissive) {
            c.material.emissive.set("#000000");
            c.material.emissiveIntensity = 0.0;
          }
        }
      });
    };

    // Monitor Izquierdo (ligero ángulo hacia el centro)
    const monL = this.place(
      "monitor",
      { x: -8.62, y: 0.75, z: -5.4 },
      { height: 0.44 },
      0.12,
    );
    setupMonitor(monL);

    // Monitor Derecho (ligero ángulo hacia el centro)
    const monR = this.place(
      "monitor",
      { x: -8.2, y: 0.75, z: -5.4 },
      { height: 0.44 },
      -0.12,
    );
    setupMonitor(monR);

    // 3. Teclado centrado frente al supervisor
    this.place("keyboard", { x: -8.42, y: 0.753, z: -5.85 }, { width: 0.4 }, 0);

    // 4. Mousepad pequeño exclusivo para el ratón (22cm x 22cm) a la derecha del teclado
    const mousepad = this.place(
      "mousepad",
      { x: -7.98, y: 0.752, z: -5.85 },
      { width: 0.22 },
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

    // 5. Mouse apoyado encima del mousepad pequeño
    this.place("mouse", { x: -7.98, y: 0.755, z: -5.85 }, { width: 0.08 }, 0);

    // 6. Taza de café colocada en el lateral despejado del escritorio
    this.place("coffeeMug", { x: -7.6, y: 0.753, z: -5.55 }, { maxDim: 0.11 });
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
    // Televisor montado en la mampara de cristal sur (frente a la vista del supervisor)
    const tvPos = { x: -8.4, y: 1.95, z: -2.92 };
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

    // Columna de montaje de acero estructural empotrada a la viga de la mampara
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
