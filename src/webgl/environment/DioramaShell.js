import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class DioramaShell {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.initMaterials();
    this.buildSteppedWalls();
    this.scene.add(this.group);
  }

  initMaterials() {
    // Muro crema/marfil cálido idéntico al render
    this.wallMat = new THREE.MeshStandardMaterial({
      color: "#F5EDE2",
      roughness: 0.85,
      metalness: 0.02,
    });

    // Coronación superior del muro cortado
    this.capMat = new THREE.MeshStandardMaterial({
      color: "#FDFBF7",
      roughness: 0.6,
    });

    // Zócalo y marcos de ventana en madera nogal cálida
    this.woodFrameMat = new THREE.MeshStandardMaterial({
      color: "#5C381E",
      roughness: 0.55,
      metalness: 0.05,
    });

    // Cristal luminoso de ventanal exterior
    this.windowGlassMat = new THREE.MeshStandardMaterial({
      color: "#FFFDF9",
      emissive: new THREE.Color("#FFF8EB"),
      emissiveIntensity: 0.45,
      roughness: 0.1,
    });
  }

  buildSteppedWalls() {
    const { wallHeight, wallThickness, baseboardHeight, perimeterWalls } =
      DIORAMA_CONFIG;

    perimeterWalls.forEach((seg) => {
      const p1 = new THREE.Vector3(seg.p1.x, 0, seg.p1.z);
      const p2 = new THREE.Vector3(seg.p2.x, 0, seg.p2.z);
      const length = p1.distanceTo(p2);
      const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);

      const wallGroup = new THREE.Group();
      wallGroup.position.set(center.x, 0, center.z);
      wallGroup.rotation.y = -angle;

      // Cuerpo del muro
      const wallMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          length + wallThickness,
          wallHeight,
          wallThickness,
        ),
        this.wallMat,
      );
      wallMesh.position.y = wallHeight / 2;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallGroup.add(wallMesh);

      // Tapa superior limpia del corte arquitectónico
      const capMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          length + wallThickness + 0.02,
          0.04,
          wallThickness + 0.02,
        ),
        this.capMat,
      );
      capMesh.position.y = wallHeight + 0.02;
      wallGroup.add(capMesh);

      // Zócalo inferior de madera cálida
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          length + wallThickness,
          baseboardHeight,
          wallThickness + 0.05,
        ),
        this.woodFrameMat,
      );
      baseMesh.position.y = baseboardHeight / 2;
      wallGroup.add(baseMesh);

      // Ventanales panorámicos empotrados perfectamente al ras del muro
      if (seg.windows && seg.windows.length > 0) {
        seg.windows.forEach((win) => {
          const localX = -length / 2 + win.offset;
          const winNode = this.createArchitecturalWindow(
            win.width,
            win.height,
            wallThickness,
          );
          winNode.position.set(localX, 1.85, 0);
          wallGroup.add(winNode);
        });
      }

      this.group.add(wallGroup);
    });
  }

  createArchitecturalWindow(w, h, wallThickness) {
    const winGroup = new THREE.Group();
    const depth = wallThickness + 0.06;

    // Panel de luz solar (cristal)
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.12, h - 0.12, depth - 0.02),
      this.windowGlassMat,
    );
    winGroup.add(glass);

    // Marco perimetral de madera cálida
    const frameT = 0.07;
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, frameT, depth),
      this.woodFrameMat,
    );
    top.position.y = h / 2 - frameT / 2;
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.08, frameT + 0.02, depth + 0.04),
      this.woodFrameMat,
    );
    bottom.position.y = -h / 2 + frameT / 2;

    const left = new THREE.Mesh(
      new THREE.BoxGeometry(frameT, h, depth),
      this.woodFrameMat,
    );
    left.position.x = -w / 2 + frameT / 2;
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(frameT, h, depth),
      this.woodFrameMat,
    );
    right.position.x = w / 2 - frameT / 2;

    winGroup.add(top, bottom, left, right);

    // Travesaños internos estilo ventanal moderno (2 horizontales, 2 verticales)
    const mullionH = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.1, 0.04, depth),
      this.woodFrameMat,
    );
    mullionH.position.y = 0.25;
    winGroup.add(mullionH);

    const cols = w > 2.8 ? 3 : 2;
    for (let i = 1; i < cols; i++) {
      const mx = -w / 2 + (w / cols) * i;
      const mullionV = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, h - 0.1, depth),
        this.woodFrameMat,
      );
      mullionV.position.x = mx;
      winGroup.add(mullionV);
    }

    return winGroup;
  }
}
