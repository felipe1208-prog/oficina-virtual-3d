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

    // Ribete perimetral sutil (bordes de alfombra)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 500);

    // Patrón entrelazado de microfibras textiles
    for (let x = 12; x < 500; x += 4) {
      for (let y = 12; y < 500; y += 4) {
        const noise = (Math.random() - 0.5) * 36;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 0.06 + noise / 400)})`;
        ctx.fillRect(x, y, 2, 4);

        ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, 0.08 - noise / 400)})`;
        ctx.fillRect(x + 2, y + 2, 2, 2);
      }
    }

    // Trama de telar horizontal/vertical
    for (let i = 12; i < 500; i += 8) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fillRect(i, 12, 1, 488);
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(12, i, 488, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  initTextileCarpets() {
    DIORAMA_CONFIG.carpets.forEach((c) => {
      const carpetTexture = this.createCarpetTexture(c.color);

      // Se usa color blanco para respetar los tonos y texturas del canvas sin oscurecer
      const mat = new THREE.MeshStandardMaterial({
        color: "#FFFFFF",
        map: carpetTexture,
        roughness: 0.85,
        metalness: 0.02,
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
