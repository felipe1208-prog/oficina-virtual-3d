import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class CarpetSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "carpet-system";

    this.initTextileCarpets();
    this.scene.add(this.group);
  }

  createCarpetTexture(baseHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Tono base
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Patrón entrelazado de hilos textiles (Cross-weave)
    for (let x = 0; x < 512; x += 4) {
      for (let y = 0; y < 512; y += 4) {
        const noise = (Math.random() - 0.5) * 32;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 0.05 + noise / 450)})`;
        ctx.fillRect(x, y, 2, 4);

        ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, 0.1 - noise / 450)})`;
        ctx.fillRect(x + 2, y + 2, 2, 2);
      }
    }

    // Trama de telar comercial
    for (let i = 0; i < 512; i += 8) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.fillRect(i, 0, 1, 512);
      ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      ctx.fillRect(0, i, 512, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  initTextileCarpets() {
    DIORAMA_CONFIG.carpets.forEach((c) => {
      const carpetTexture = this.createCarpetTexture(c.color);

      const mat = new THREE.MeshStandardMaterial({
        color: c.color,
        map: carpetTexture,
        roughness: 0.84,
        metalness: 0.03,
      });

      const geo = new THREE.PlaneGeometry(c.width, c.length);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(c.x, 0.012, c.z);
      mesh.receiveShadow = true;
      this.group.add(mesh);
    });
  }
}
