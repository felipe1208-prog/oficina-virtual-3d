import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class MeetingRoom {
  constructor(experience) {
    if (experience && experience.scene) {
      this.experience = experience;
      this.scene = experience.scene;
      this.resources = experience.resources;
    } else {
      this.scene = arguments[0];
      this.resources = arguments[1];
      this.experience = arguments[2] || null;
    }

    this.group = new THREE.Group();
    this.group.name = "zone-meeting-room";

    // 1. Mobiliario e infraestructura existente (100% Intacto)
    this.initConferenceTable();
    this.initChairs();
    this.initTableProps();
    this.initPlantsAndDecor();

    // 2. Muro Norte: Pantalla en negro y pizarra a altura corregida
    this.initWallTV();
    this.initWhiteboard();

    this.scene.add(this.group);
  }

  place(assetName, pos, fitOpts, rotY = 0) {
    const raw = this.resources.get(assetName);
    if (!raw) return null;

    const model = raw.clone(true);
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const fitted = fitModel(model, fitOpts);
    fitted.position.set(pos.x, pos.y, pos.z);
    fitted.rotation.y = rotY;
    this.group.add(fitted);
    return fitted;
  }

  initConferenceTable() {
    const tableGroup = new THREE.Group();
    const tableY = 0.75;
    const tWidth = 4.4;
    const tDepth = 1.6;
    const tThickness = 0.055;

    const topMat = new THREE.MeshStandardMaterial({
      color: "#3B2215",
      roughness: 0.38,
      metalness: 0.04,
    });
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(tWidth, tThickness, tDepth),
      topMat,
    );
    tableTop.position.set(0.0, tableY - tThickness / 2, -6.0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    const grommetMat = new THREE.MeshStandardMaterial({
      color: "#15171E",
      roughness: 0.35,
      metalness: 0.85,
    });
    const grommet = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.005, 0.22),
      grommetMat,
    );
    grommet.position.set(0.0, tableY + 0.001, -6.0);
    tableGroup.add(grommet);

    const legMat = new THREE.MeshStandardMaterial({
      color: "#181A20",
      roughness: 0.45,
      metalness: 0.8,
    });

    const legGeo = new THREE.CylinderGeometry(
      0.24,
      0.28,
      tableY - tThickness,
      24,
    );
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-1.35, (tableY - tThickness) / 2, -6.0);
    legL.castShadow = true;

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(1.35, (tableY - tThickness) / 2, -6.0);
    legR.castShadow = true;

    tableGroup.add(legL, legR);
    this.group.add(tableGroup);
  }

  initChairs() {
    const chairHeight = 1.02;
    const setupChairMat = (chairMesh) => {
      if (!chairMesh) return;
      chairMesh.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color.set("#D9DFE8");
          child.material.roughness = 0.55;
          child.material.metalness = 0.05;
        }
      });
    };

    const northX = [-1.35, 0.0, 1.35];
    northX.forEach((x, i) => {
      const rotJitter = i === 1 ? 0 : i === 0 ? 0.06 : -0.06;
      const c = this.place(
        "chair",
        { x, y: 0, z: -6.95 },
        { height: chairHeight },
        rotJitter,
      );
      setupChairMat(c);
    });

    const southX = [-1.35, 0.0, 1.35];
    southX.forEach((x, i) => {
      const rotJitter = i === 1 ? Math.PI : Math.PI + (i === 0 ? -0.06 : 0.06);
      const c = this.place(
        "chair",
        { x, y: 0, z: -5.05 },
        { height: chairHeight },
        rotJitter,
      );
      setupChairMat(c);
    });

    const cWest = this.place(
      "chair",
      { x: -2.42, y: 0, z: -6.0 },
      { height: chairHeight },
      Math.PI / 2,
    );
    setupChairMat(cWest);

    const cEast = this.place(
      "chair",
      { x: 2.42, y: 0, z: -6.0 },
      { height: chairHeight },
      -Math.PI / 2,
    );
    setupChairMat(cEast);
  }

  initTableProps() {
    const tableY = 0.752;

    this.place(
      "plantFlowerPot",
      { x: 0.0, y: tableY, z: -6.0 },
      { height: 0.28 },
    );

    // Control remoto de TV sobre la mesa junto a la bandeja central
    this.place(
      "tvRemote",
      { x: 0.45, y: tableY, z: -5.85 },
      { maxDim: 0.16 },
      0.25,
    );

    const glassPositions = [
      { x: -1.35, z: -6.55 },
      { x: 1.35, z: -6.55 },
      { x: -1.35, z: -5.45 },
      { x: 1.35, z: -5.45 },
      { x: -2.0, z: -6.0 },
    ];
    glassPositions.forEach((pos) => {
      const g = this.place(
        "waterGlass",
        { x: pos.x, y: tableY, z: pos.z },
        { maxDim: 0.1 },
      );
      if (!g) {
        const geo = new THREE.CylinderGeometry(0.035, 0.03, 0.1, 16);
        const mat = new THREE.MeshPhysicalMaterial({
          color: "#E8F3FA",
          transmission: 0.9,
          roughness: 0.05,
          transparent: true,
          opacity: 0.35,
        });
        const glass = new THREE.Mesh(geo, mat);
        glass.position.set(pos.x, tableY + 0.05, pos.z);
        this.group.add(glass);
      }
    });

    const folderMat = new THREE.MeshStandardMaterial({
      color: "#1A1C23",
      roughness: 0.55,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: "#F1F5F9",
      roughness: 0.9,
    });

    const addFolder = (x, z, rot) => {
      const f = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.006, 0.32),
        folderMat,
      );
      f.position.set(x, tableY + 0.003, z);
      f.rotation.y = rot;
      f.castShadow = true;

      const p = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.002, 0.28),
        paperMat,
      );
      p.position.set(x, tableY + 0.007, z);
      p.rotation.y = rot;
      this.group.add(f, p);
    };

    addFolder(-1.35, -6.4, 0);
    addFolder(1.35, -6.4, 0);
    addFolder(0.0, -5.6, Math.PI);
    addFolder(-2.0, -6.0, Math.PI / 2);
  }

  initPlantsAndDecor() {
    this.place(
      "plantFiddleLeaf",
      { x: -3.55, y: 0, z: -8.45 },
      { height: 1.55 },
    );
    this.place("plantFlowerPot", { x: 3.55, y: 0, z: -8.45 }, { height: 1.15 });
    this.place("trashcan", { x: 3.55, y: 0, z: -3.45 }, { height: 0.4 });
  }

  initWallTV() {
    const tvW = 2.45;
    const tvH = 1.4;
    const tvX = -1.8;
    const tvY = 2.15;
    const wallZ = -8.99;

    const frameGeo = new THREE.BoxGeometry(tvW + 0.04, tvH + 0.04, 0.035);
    const frameMat = new THREE.MeshStandardMaterial({
      color: "#12141A",
      roughness: 0.35,
      metalness: 0.85,
    });
    const tvFrame = new THREE.Mesh(frameGeo, frameMat);
    tvFrame.position.set(tvX, tvY, wallZ);
    tvFrame.castShadow = true;
    this.group.add(tvFrame);

    const screenGeo = new THREE.PlaneGeometry(tvW, tvH);
    const screenMat = new THREE.MeshStandardMaterial({
      color: "#07080B",
      roughness: 0.12,
      metalness: 0.2,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(tvX, tvY, wallZ + 0.019);
    this.group.add(screenMesh);
  }

  initWhiteboard() {
    // Pizarra bajada de Y=2.15 a Y=1.75 a escala ergonómica natural
    const wb = this.place(
      "whiteboard",
      { x: 1.85, y: 1.75, z: -8.99 },
      { height: 1.35 },
      0,
    );
    if (wb) {
      wb.rotation.y = 0;
    }
  }
}
