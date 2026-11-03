import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class Floor {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "diorama-floor-system";
    this.init();
  }

  createWarmOakTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Tono roble miel dorado cálido
    ctx.fillStyle = "#C48248";
    ctx.fillRect(0, 0, 1024, 1024);

    const plankH = 32;
    const plankW = 256;

    for (let y = 0; y < 1024; y += plankH) {
      const offsetX = (y / plankH) % 2 === 0 ? 0 : plankW / 2;
      for (let x = -plankW; x < 1024 + plankW; x += plankW) {
        const px = x + offsetX;
        const v = Math.sin(x * 12.5 + y * 7.8) * 14;
        const r = Math.min(255, Math.max(0, 196 + v));
        const g = Math.min(255, Math.max(0, 132 + v * 0.78));
        const b = Math.min(255, Math.max(0, 76 + v * 0.55));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px, y, plankW - 1.5, plankH - 1.5);

        // Vetas sutiles de madera
        ctx.fillStyle = "rgba(70, 32, 10, 0.10)";
        ctx.fillRect(px, y + 10, plankW - 2, 1.5);
        ctx.fillRect(px, y + 22, plankW - 2, 1);
      }
    }

    // Juntas finas entre listones
    ctx.strokeStyle = "rgba(50, 22, 8, 0.55)";
    ctx.lineWidth = 1.2;
    for (let y = 0; y <= 1024; y += plankH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Escala métrica real: tablas de 1.0 m x 11 cm
    texture.repeat.set(0.25, 0.25);
    return texture;
  }

  init() {
    const pts = DIORAMA_CONFIG.floorPolygon;
    const shape = new THREE.Shape();

    shape.moveTo(pts[0].x, -pts[0].z);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i].x, -pts[i].z);
    }
    shape.closePath();

    // Material 0: Parquet de madera superior
    const parquetMat = new THREE.MeshStandardMaterial({
      map: this.createWarmOakTexture(),
      roughness: 0.38,
      metalness: 0.03,
    });

    // Material 1: Canto perimetral de la losa
    const slabSidesMat = new THREE.MeshStandardMaterial({
      color: "#4E2C14",
      roughness: 0.75,
    });

    // Una sola geometría extruida con multi-material (cero Z-fighting)
    const slabGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.25,
      bevelEnabled: false,
    });

    const floorMesh = new THREE.Mesh(slabGeo, [parquetMat, slabSidesMat]);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.25;
    floorMesh.receiveShadow = true;

    this.group.add(floorMesh);
    this.scene.add(this.group);
  }
}
