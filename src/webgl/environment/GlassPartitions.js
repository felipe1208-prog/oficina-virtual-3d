import * as THREE from "three";
import { DIORAMA_CONFIG } from "../../config/officeLayout.js";
import { fitModel } from "../utils/modelUtils.js";

export class GlassPartitions {
  constructor(scene, resources) {
    this.scene = scene;
    this.resources = resources;
    this.group = new THREE.Group();
    this.group.name = "acoustic-glass-system";

    this.initMaterials();
    this.buildSupervisorRoom();
    this.buildMeetingRoom();
    this.buildPlanterBoxes();

    this.scene.add(this.group);
  }

  initMaterials() {
    // Acero negro industrial carbón mate (#12141A)
    this.frameMat = new THREE.MeshStandardMaterial({
      color: "#12141A",
      roughness: 0.35,
      metalness: 0.82,
    });

    // Cristal físico de alta pureza y transmisión lumínica
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: "#E8F3FA",
      transparent: true,
      opacity: 0.22,
      transmission: 0.88,
      roughness: 0.04,
      metalness: 0.05,
      ior: 1.5,
      side: THREE.DoubleSide,
    });

    this.planterMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      roughness: 0.4,
    });

    this.foliageMat = new THREE.MeshStandardMaterial({
      color: "#28622A",
      roughness: 0.75,
    });
  }

  createGlassSpan(p1, p2, height = 3.2, cols = 2) {
    const len = p1.distanceTo(p2);
    const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);

    const panel = new THREE.Group();
    panel.position.set(center.x, 0, center.z);
    panel.rotation.y = -angle;

    // Paño de vidrio templado
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(len, height),
      this.glassMat,
    );
    glass.position.y = height / 2;
    panel.add(glass);

    // Perfiles estructurales gruesos de 12cm
    const frameW = 0.11;
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(len, frameW, frameW),
      this.frameMat,
    );
    bottom.position.y = frameW / 2;

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(len, frameW, frameW),
      this.frameMat,
    );
    top.position.y = height - frameW / 2;
    panel.add(bottom, top);

    // Montantes verticales
    for (let i = 0; i <= cols; i++) {
      const px = -len / 2 + (len / cols) * i;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(frameW, height, frameW),
        this.frameMat,
      );
      post.position.set(px, height / 2, 0);
      panel.add(post);
    }

    return panel;
  }

  createFramedPortal(doorX, z, doorWidth = 1.45, height = 3.2) {
    const portalGroup = new THREE.Group();
    const frameW = 0.11;
    const doorHeight = 2.35;

    // Jambas izquierda y derecha
    const jambL = new THREE.Mesh(
      new THREE.BoxGeometry(frameW, height, frameW),
      this.frameMat,
    );
    jambL.position.set(doorX - doorWidth / 2, height / 2, z);

    const jambR = new THREE.Mesh(
      new THREE.BoxGeometry(frameW, height, frameW),
      this.frameMat,
    );
    jambR.position.set(doorX + doorWidth / 2, height / 2, z);

    // Dintel intermedio de la puerta
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth, frameW, frameW),
      this.frameMat,
    );
    lintel.position.set(doorX, doorHeight, z);

    // Viga superior del techo
    const header = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth, frameW, frameW),
      this.frameMat,
    );
    header.position.set(doorX, height - frameW / 2, z);

    // Cristal fijo superior sobre la puerta
    const glassTop = new THREE.Mesh(
      new THREE.PlaneGeometry(doorWidth, height - doorHeight - frameW),
      this.glassMat,
    );
    glassTop.position.set(doorX, doorHeight + (height - doorHeight) / 2, z);

    portalGroup.add(jambL, jambR, lintel, header, glassTop);
    return portalGroup;
  }

  buildSupervisorRoom() {
    const s = DIORAMA_CONFIG.glassRooms.supervisor;
    const H = 3.2;
    const doorX = (s.doorGap.start + s.doorGap.end) / 2;
    const doorW = s.doorGap.end - s.doorGap.start;

    // Fachada Frontal (Sur) continua
    this.group.add(this.createFramedPortal(doorX, s.maxZ, doorW, H));

    const pLeft1 = new THREE.Vector3(s.minX, 0, s.maxZ);
    const pLeft2 = new THREE.Vector3(s.doorGap.start, 0, s.maxZ);
    this.group.add(this.createGlassSpan(pLeft1, pLeft2, H, 2));

    const pRight1 = new THREE.Vector3(s.doorGap.end, 0, s.maxZ);
    const pRight2 = new THREE.Vector3(s.maxX, 0, s.maxZ);
    this.group.add(this.createGlassSpan(pRight1, pRight2, H, 1));

    // Cerramiento lateral Este
    const pEast1 = new THREE.Vector3(s.maxX, 0, s.minZ);
    const pEast2 = new THREE.Vector3(s.maxX, 0, s.maxZ);
    this.group.add(this.createGlassSpan(pEast1, pEast2, H, 2));
  }

  buildMeetingRoom() {
    const m = DIORAMA_CONFIG.glassRooms.meeting;
    const H = 3.2;
    const doorX = (m.doorGap.start + m.doorGap.end) / 2;
    const doorW = m.doorGap.end - m.doorGap.start;

    // Fachada Frontal (Sur) alineada exactamente a Z = -2.8
    this.group.add(this.createFramedPortal(doorX, m.maxZ, doorW, H));

    const pLeft1 = new THREE.Vector3(m.minX, 0, m.maxZ);
    const pLeft2 = new THREE.Vector3(m.doorGap.start, 0, m.maxZ);
    this.group.add(this.createGlassSpan(pLeft1, pLeft2, H, 2));

    const pRight1 = new THREE.Vector3(m.doorGap.end, 0, m.maxZ);
    const pRight2 = new THREE.Vector3(m.maxX, 0, m.maxZ);
    this.group.add(this.createGlassSpan(pRight1, pRight2, H, 2));

    // Mamparas laterales Oeste y Este
    const pWest1 = new THREE.Vector3(m.minX, 0, -8.5);
    const pWest2 = new THREE.Vector3(m.minX, 0, m.maxZ);
    this.group.add(this.createGlassSpan(pWest1, pWest2, H, 2));

    const pEast1 = new THREE.Vector3(m.maxX, 0, -8.5);
    const pEast2 = new THREE.Vector3(m.maxX, 0, m.maxZ);
    this.group.add(this.createGlassSpan(pEast1, pEast2, H, 2));

    // // Pizarra de conferencias empotrada
    // const rawWhiteboard = this.resources.get("whiteboard");
    // if (rawWhiteboard) {
    //   const wb = rawWhiteboard.clone(true);
    //   const fitted = fitModel(wb, { height: 1.45 });
    //   fitted.position.set(2.4, 1.95, -9.05);
    //   this.group.add(fitted);
    // }
  }

  buildPlanterBoxes() {
    const addPlanter = (x, z, w, d) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.32, d),
        this.planterMat,
      );
      box.position.set(x, 0.16, z);
      box.castShadow = true;

      const leaves = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.1, 0.24, d - 0.1),
        this.foliageMat,
      );
      leaves.position.set(x, 0.34, z);
      this.group.add(box, leaves);
    };

    // Jardineras decorativas a los pies de la fachada de reuniones
    addPlanter(4.35, -5.5, 0.45, 2.0);
    addPlanter(4.35, -3.4, 0.45, 1.6);
  }
}
