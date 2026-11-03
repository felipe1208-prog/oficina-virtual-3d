import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";

export class GlassPartitions {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    this.initMaterials();
    this.buildSupervisorEnclosure();
    this.buildMeetingEnclosure();
    this.buildInteriorWalls();
    this.buildPlanters();

    this.scene.add(this.group);
  }

  initMaterials() {
    this.frameMat = new THREE.MeshStandardMaterial({
      color: "#181A20",
      roughness: 0.3,
      metalness: 0.85,
    });

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: "#EDF6FC",
      transparent: true,
      opacity: 0.24,
      transmission: 0.86,
      roughness: 0.05,
      metalness: 0.08,
      ior: 1.5,
      side: THREE.DoubleSide,
    });

    this.wallMat = new THREE.MeshStandardMaterial({
      color: "#F5EDE2",
      roughness: 0.85,
    });

    this.baseboardMat = new THREE.MeshStandardMaterial({
      color: "#5C381E",
      roughness: 0.6,
    });
  }

  createGlassWall(p1, p2, height = 3.1, mullions = 3) {
    const len = p1.distanceTo(p2);
    const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);

    const panel = new THREE.Group();
    panel.position.set(center.x, 0, center.z);
    panel.rotation.y = -angle;

    // Cristal
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(len, height),
      this.glassMat,
    );
    glass.position.y = height / 2;
    panel.add(glass);

    // Riel inferior y viga superior negra
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.06, 0.06),
      this.frameMat,
    );
    bottom.position.y = 0.03;
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.07, 0.07),
      this.frameMat,
    );
    top.position.y = height - 0.035;
    panel.add(bottom, top);

    // Columnas divisorias verticales de aluminio negro
    for (let i = 0; i <= mullions; i++) {
      const px = -len / 2 + (len / mullions) * i;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, height, 0.06),
        this.frameMat,
      );
      post.position.set(px, height / 2, 0);
      panel.add(post);
    }

    this.group.add(panel);
  }

  buildSupervisorEnclosure() {
    const s = DIORAMA_CONFIG.glassRooms.supervisor;
    const H = 3.1;

    // Fachada Sur con puerta abierta
    this.createGlassWall(
      new THREE.Vector3(s.minX, 0, s.maxZ),
      new THREE.Vector3(s.doorGap.start, 0, s.maxZ),
      H,
      2,
    );
    this.createGlassWall(
      new THREE.Vector3(s.doorGap.end, 0, s.maxZ),
      new THREE.Vector3(s.maxX, 0, s.maxZ),
      H,
      1,
    );

    // Viga continua superior sobre la puerta
    const doorW = s.doorGap.end - s.doorGap.start;
    const header = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, 0.07, 0.07),
      this.frameMat,
    );
    header.position.set(
      (s.doorGap.start + s.doorGap.end) / 2,
      H - 0.035,
      s.maxZ,
    );
    this.group.add(header);

    // Cerramiento Este (Conecta con el muro escalonado)
    this.createGlassWall(
      new THREE.Vector3(s.maxX, 0, s.minZ),
      new THREE.Vector3(s.maxX, 0, s.maxZ),
      H,
      2,
    );
  }

  buildMeetingEnclosure() {
    const m = DIORAMA_CONFIG.glassRooms.meeting;
    const H = 3.1;

    // Fachada Sur con puerta abierta
    this.createGlassWall(
      new THREE.Vector3(m.minX, 0, m.maxZ),
      new THREE.Vector3(m.doorGap.start, 0, m.maxZ),
      H,
      2,
    );
    this.createGlassWall(
      new THREE.Vector3(m.doorGap.end, 0, m.maxZ),
      new THREE.Vector3(m.maxX, 0, m.maxZ),
      H,
      2,
    );

    const doorW = m.doorGap.end - m.doorGap.start;
    const header = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, 0.07, 0.07),
      this.frameMat,
    );
    header.position.set(
      (m.doorGap.start + m.doorGap.end) / 2,
      H - 0.035,
      m.maxZ,
    );
    this.group.add(header);

    // Cerramiento Oeste y Este
    this.createGlassWall(
      new THREE.Vector3(m.minX, 0, -8.0),
      new THREE.Vector3(m.minX, 0, m.maxZ),
      H,
      2,
    );
    this.createGlassWall(
      new THREE.Vector3(m.maxX, 0, -6.5),
      new THREE.Vector3(m.maxX, 0, m.maxZ),
      H,
      2,
    );
  }

  buildInteriorWalls() {
    const { kitchenSimple, loungeTVWall } = DIORAMA_CONFIG.interiorWalls;

    // 1. Muro de media altura de la Cocina
    const kw = new THREE.Mesh(
      new THREE.BoxGeometry(
        kitchenSimple.width,
        kitchenSimple.height,
        kitchenSimple.length,
      ),
      this.wallMat,
    );
    kw.position.set(kitchenSimple.x, kitchenSimple.height / 2, kitchenSimple.z);
    kw.castShadow = true;
    kw.receiveShadow = true;
    this.group.add(kw);

    const kb = new THREE.Mesh(
      new THREE.BoxGeometry(
        kitchenSimple.width + 0.02,
        0.14,
        kitchenSimple.length + 0.04,
      ),
      this.baseboardMat,
    );
    kb.position.set(kitchenSimple.x, 0.07, kitchenSimple.z);
    this.group.add(kb);

    // 2. Muro divisor de TV en el Lounge
    const lw = new THREE.Mesh(
      new THREE.BoxGeometry(
        loungeTVWall.width,
        loungeTVWall.height,
        loungeTVWall.length,
      ),
      this.wallMat,
    );
    lw.position.set(loungeTVWall.x, loungeTVWall.height / 2, loungeTVWall.z);
    lw.castShadow = true;
    lw.receiveShadow = true;
    this.group.add(lw);

    const lb = new THREE.Mesh(
      new THREE.BoxGeometry(
        loungeTVWall.width + 0.04,
        0.14,
        loungeTVWall.length + 0.02,
      ),
      this.baseboardMat,
    );
    lb.position.set(loungeTVWall.x, 0.07, loungeTVWall.z);
    this.group.add(lb);
  }

  buildPlanters() {
    const planterMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      roughness: 0.4,
    });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: "#407A3E",
      roughness: 0.75,
    });

    const addPlanter = (x, z, w, d) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), planterMat);
      box.position.set(x, 0.14, z);
      box.castShadow = true;
      const leaves = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.12, 0.22, d - 0.12),
        foliageMat,
      );
      leaves.position.set(x, 0.3, z);
      this.group.add(box, leaves);
    };

    // Jardineras blancas exteriores junto a la sala de reuniones (igual que en el render)
    addPlanter(3.85, -5.5, 0.4, 1.8);
    addPlanter(3.85, -3.6, 0.4, 1.6);
  }
}
