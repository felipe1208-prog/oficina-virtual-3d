import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class DioramaShell {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "diorama-perimeter-shell";

    this.initMaterials();
    this.buildWalls();
    this.scene.add(this.group);
  }

  initMaterials() {
    this.wallMat = new THREE.MeshStandardMaterial({
      color: "#F5ECE2", // Crema marfil cálido de estudio
      roughness: 0.88,
      metalness: 0.02,
    });

    this.capMat = new THREE.MeshStandardMaterial({
      color: "#FCF9F5",
      roughness: 0.55,
    });

    this.woodFrameMat = new THREE.MeshStandardMaterial({
      color: "#523018", // Madera nogal cálida para marcos y zócalos
      roughness: 0.55,
      metalness: 0.05,
    });

    this.windowGlassMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      emissive: new THREE.Color("#FFF5E6"),
      emissiveIntensity: 0.45,
      roughness: 0.08,
    });
  }

  buildWalls() {
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

      // Muro sólido estructural
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

      // Remate superior limpio
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(
          length + wallThickness + 0.02,
          0.05,
          wallThickness + 0.02,
        ),
        this.capMat,
      );
      cap.position.y = wallHeight + 0.025;
      wallGroup.add(cap);

      // Zócalo inferior
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(
          length + wallThickness,
          baseboardHeight,
          wallThickness + 0.06,
        ),
        this.woodFrameMat,
      );
      base.position.y = baseboardHeight / 2;
      wallGroup.add(base);

      // Ventanales panorámicos de gran tamaño
      if (seg.windows && seg.windows.length > 0) {
        seg.windows.forEach((win) => {
          const localX = -length / 2 + win.offset;
          const windowNode = this.createPanoramicWindow(
            win.width,
            win.height,
            wallThickness,
          );
          windowNode.position.set(localX, 1.95, 0);
          wallGroup.add(windowNode);
        });
      }

      this.group.add(wallGroup);
    });
  }

  createPanoramicWindow(w, h, wallThickness) {
    const winGroup = new THREE.Group();
    const depth = wallThickness + 0.08;

    // Superficie luminosa
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.12, h - 0.12, depth - 0.02),
      this.windowGlassMat,
    );
    winGroup.add(glass);

    // Marco exterior de madera
    const frameT = 0.08;
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, frameT, depth),
      this.woodFrameMat,
    );
    top.position.y = h / 2 - frameT / 2;

    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.1, frameT + 0.04, depth + 0.06),
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

    // Cuadrícula interior (3 columnas x 2 filas)
    const mullionH = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.1, 0.05, depth),
      this.woodFrameMat,
    );
    mullionH.position.y = 0.15;
    winGroup.add(mullionH);

    for (let i = 1; i <= 2; i++) {
      const mx = -w / 2 + (w / 3) * i;
      const mullionV = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, h - 0.1, depth),
        this.woodFrameMat,
      );
      mullionV.position.x = mx;
      winGroup.add(mullionV);
    }

    return winGroup;
  }
}
