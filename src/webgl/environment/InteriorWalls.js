import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class InteriorWalls {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "interior-walls-system";

    this.initMaterials();
    this.buildWalls();
    this.scene.add(this.group);
  }

  initMaterials() {
    this.wallMat = new THREE.MeshStandardMaterial({
      color: "#F5ECE2", // Blanco arena cálido
      roughness: 0.86,
      metalness: 0.02,
    });

    this.baseboardMat = new THREE.MeshStandardMaterial({
      color: "#523018",
      roughness: 0.65,
    });
  }

  buildWalls() {
    const { kitchenWall, loungeTVWall } = DIORAMA_CONFIG.interiorWalls;

    // 1. Muro de la Cocina (Orientado sobre el eje Z, paralelo al pasillo central)
    const kwLength = Math.abs(kitchenWall.endZ - kitchenWall.startZ);
    const kwCenterZ = (kitchenWall.startZ + kitchenWall.endZ) / 2;

    const kw = new THREE.Mesh(
      new THREE.BoxGeometry(
        kitchenWall.thickness,
        kitchenWall.height,
        kwLength,
      ),
      this.wallMat,
    );
    kw.position.set(kitchenWall.x, kitchenWall.height / 2, kwCenterZ);
    kw.castShadow = true;
    kw.receiveShadow = true;
    this.group.add(kw);

    const kb = new THREE.Mesh(
      new THREE.BoxGeometry(
        kitchenWall.thickness + 0.04,
        0.16,
        kwLength + 0.02,
      ),
      this.baseboardMat,
    );
    kb.position.set(kitchenWall.x, 0.08, kwCenterZ);
    this.group.add(kb);

    // 2. Muro de la TV (Orientado sobre el eje X, empotrado en la pared este)
    const lwWidth = Math.abs(loungeTVWall.endX - loungeTVWall.startX);
    const lwCenterX = (loungeTVWall.startX + loungeTVWall.endX) / 2;

    const lw = new THREE.Mesh(
      new THREE.BoxGeometry(
        lwWidth,
        loungeTVWall.height,
        loungeTVWall.thickness,
      ),
      this.wallMat,
    );
    lw.position.set(lwCenterX, loungeTVWall.height / 2, loungeTVWall.z);
    lw.castShadow = true;
    lw.receiveShadow = true;
    this.group.add(lw);

    const lb = new THREE.Mesh(
      new THREE.BoxGeometry(lwWidth, 0.16, loungeTVWall.thickness + 0.04),
      this.baseboardMat,
    );
    lb.position.set(lwCenterX, 0.08, loungeTVWall.z);
    this.group.add(lb);
  }
}
