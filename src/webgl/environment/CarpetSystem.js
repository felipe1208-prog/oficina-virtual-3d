import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";
import { fitModel } from "../utils/modelUtils.js";

export class CarpetSystem {
  constructor(scene, resources) {
    this.scene = scene;
    this.resources = resources;
    this.group = new THREE.Group();
    this.group.name = "carpet-system";

    this.initTextileCarpets();
    this.initWoolCarpet();
    this.scene.add(this.group);
  }

  createCarpetTexture(colorHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 256; i += 4) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
      ctx.fillRect(i, 0, 2, 256);
      ctx.fillRect(0, i, 256, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  initTextileCarpets() {
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
  }

  initWoolCarpet() {
    const rawWoolCarpet = this.resources.get("woolCarpetRed");
    if (!rawWoolCarpet) return;

    const carpet = rawWoolCarpet.clone(true);
    carpet.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set("#A8382C");
          child.material.roughness = 0.95;
        }
      }
    });

    const fitted = fitModel(carpet, { width: 3.6 });
    // Posición en la esquina superior derecha (junto a ping-pong)
    fitted.position.set(9.6, 0.012, -4.8);
    this.group.add(fitted);
  }
}
