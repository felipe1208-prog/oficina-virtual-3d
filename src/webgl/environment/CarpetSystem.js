import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class CarpetSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.init();
  }

  createCarpetTexture(colorHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 256, 256);

    // Trama de tejido textil microfino
    for (let i = 0; i < 256; i += 4) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(i, 0, 2, 256);
      ctx.fillRect(0, i, 256, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  init() {
    DIORAMA_CONFIG.carpets.forEach((c) => {
      const mat = new THREE.MeshStandardMaterial({
        color: c.color,
        map: this.createCarpetTexture(c.color),
        roughness: 0.95,
        metalness: 0.02,
      });

      const geo = new THREE.PlaneGeometry(c.width, c.length);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(c.x, 0.012, c.z);
      mesh.receiveShadow = true;
      this.group.add(mesh);
    });

    this.scene.add(this.group);
  }
}
