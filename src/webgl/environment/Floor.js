import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class Floor {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.init();
  }

  createWarmOakTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Base roble miel dorado cálido
    ctx.fillStyle = "#B87A44";
    ctx.fillRect(0, 0, 1024, 1024);

    const plankH = 28;
    const plankW = 256;

    for (let y = 0; y < 1024; y += plankH) {
      const offsetX = (y / plankH) % 2 === 0 ? 0 : plankW / 2;
      for (let x = -plankW; x < 1024 + plankW; x += plankW) {
        // Fallback seguro para iteración
      }
    }

    for (let y = 0; y < 1024; y += plankH) {
      const offsetX = (y / plankH) % 2 === 0 ? 0 : plankW / 2;
      for (let x = -plankW; x < 1024 + plankW; x += plankW) {
        const px = x + offsetX;
        const v = Math.sin(x * 13.7 + y * 8.1) * 16;
        const r = Math.min(255, Math.max(0, 188 + v));
        const g = Math.min(255, Math.max(0, 124 + v * 0.75));
        const b = Math.min(255, Math.max(0, 70 + v * 0.5));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px, y, plankW - 1.5, plankH - 1.5);

        // Veta cálida de madera
        ctx.fillStyle = "rgba(75, 35, 10, 0.12)";
        ctx.fillRect(px, y + 8, plankW - 2, 1.5);
        ctx.fillRect(px, y + 19, plankW - 2, 1);
      }
    }

    ctx.strokeStyle = "rgba(55, 25, 8, 0.55)";
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
    texture.repeat.set(0.45, 0.45);
    return texture;
  }

  init() {
    const pts = DIORAMA_CONFIG.floorPolygon;
    const shape = new THREE.Shape();

    // En Shape 2D usamos (x, -z) para que al rotar -90° en X coincida con (x, z) en 3D
    shape.moveTo(pts[0].x, -pts[0].z);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i].x, -pts[i].z);
    }
    shape.closePath();

    // 1. Superficie de parquet de roble cálido
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshStandardMaterial({
      map: this.createWarmOakTexture(),
      roughness: 0.42,
      metalness: 0.05,
    });

    const floorMesh = new THREE.Mesh(geo, mat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    this.group.add(floorMesh);

    // 2. Canto / Losa arquitectónica bajo el suelo (Grosor de maqueta de 25 cm)
    const slabGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.25,
      bevelEnabled: false,
    });
    const slabMat = new THREE.MeshStandardMaterial({
      color: "#6E4726",
      roughness: 0.7,
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.rotation.x = -Math.PI / 2;
    slabMesh.position.y = -0.25;
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    this.group.add(slabMesh);

    this.scene.add(this.group);
  }
}
