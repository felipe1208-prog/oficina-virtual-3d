import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class LoungeArea {
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
    this.group.name = "zone-lounge-tv";

    // 1. Frente Multimedia: Televisor 75", mueble bajo, barra de sonido y torres Hi-Fi
    this.initMediaWallAndEntertainment();

    // 2. Living Central: Sofás en U, butacas y puffs sobre la alfombra azul
    this.initLivingRoomSeating();

    // 3. Mesa de Centro con decoración y accesorios
    this.initCentralCoffeeTable();

    // 4. Mesas Auxiliares, iluminación ambiental y detalles de confort
    this.initSideTablesAndLighting();

    // 5. Muro Este bajo ventanales: Taquillero modular y rincón de lectura
    this.initEastWallStorageAndReading();

    // 6. Vegetación perimetral calibrada
    this.initPerimeterVegetation();

    this.scene.add(this.group);
  }

  place(assetName, pos, fitOpts, rotY = 0) {
    const kebab = assetName.replace(/([A-Z])/g, "-$1").toLowerCase();
    const raw = this.resources.get(assetName) || this.resources.get(kebab);
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

  // --- 1. FRENTE MULTIMEDIA Y ENTRETENIMIENTO (MURO SUR Z = 0.36) ---
  initMediaWallAndEntertainment() {
    const tvGroup = new THREE.Group();
    const wallFaceZ = 0.36;
    const centerX = 8.0;
    const tvY = 1.48;

    // 1. Televisor 75" en standby puro montado en pared
    const tvModel =
      this.place(
        "tvFlatScreen",
        { x: centerX, y: tvY, z: wallFaceZ },
        { width: 1.65 },
        0,
      ) ||
      this.place(
        "tv-flat-screen",
        { x: centerX, y: tvY, z: wallFaceZ },
        { width: 1.65 },
        0,
      );

    if (!tvModel) {
      const tvFrameMat = new THREE.MeshStandardMaterial({
        color: "#090B0E",
        roughness: 0.25,
        metalness: 0.9,
      });
      const tvFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.96, 0.03),
        tvFrameMat,
      );
      tvFrame.position.set(centerX, tvY, wallFaceZ + 0.015);
      tvFrame.castShadow = true;

      const screenMat = new THREE.MeshStandardMaterial({
        color: "#030406",
        roughness: 0.12,
        metalness: 0.6,
      });
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.58, 0.89),
        screenMat,
      );
      screen.position.set(centerX, tvY, wallFaceZ + 0.032);

      tvGroup.add(tvFrame, screen);
    }

    // 2. Mueble bajo de TV en nogal satinado (Media Console 2.20m)
    const benchW = 2.2;
    const benchH = 0.44;
    const benchD = 0.44;
    const benchZ = 0.62;

    const woodMat = new THREE.MeshStandardMaterial({
      color: "#2C1B12",
      roughness: 0.42,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: "#11141B",
      roughness: 0.35,
      metalness: 0.85,
    });

    const benchTop = new THREE.Mesh(
      new THREE.BoxGeometry(benchW, 0.035, benchD),
      woodMat,
    );
    benchTop.position.set(centerX, benchH - 0.0175, benchZ);
    benchTop.castShadow = true;
    benchTop.receiveShadow = true;
    tvGroup.add(benchTop);

    // Estante divisor inferior
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(benchW - 0.06, 0.02, benchD - 0.04),
      woodMat,
    );
    shelf.position.set(centerX, 0.2, benchZ);
    tvGroup.add(shelf);

    // Patas metálicas tubulares
    [-benchW / 2 + 0.06, benchW / 2 - 0.06].forEach((lx) => {
      [-benchD / 2 + 0.06, benchD / 2 - 0.06].forEach((lz) => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.014, benchH - 0.035, 12),
          metalMat,
        );
        leg.position.set(centerX + lx, (benchH - 0.035) / 2, benchZ + lz);
        leg.castShadow = true;
        tvGroup.add(leg);
      });
    });

    // 3. Barra de sonido (Soundbar)
    const sbarMat = new THREE.MeshStandardMaterial({
      color: "#15171E",
      roughness: 0.5,
      metalness: 0.6,
    });
    const soundbar = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.05, 0.08),
      sbarMat,
    );
    soundbar.position.set(centerX, benchH + 0.025, benchZ - 0.09);
    soundbar.castShadow = true;
    tvGroup.add(soundbar);

    // 4. Consola de videojuegos tech moderna
    const consoleMatW = new THREE.MeshStandardMaterial({
      color: "#F8FAFC",
      roughness: 0.25,
    });
    const consoleMatB = new THREE.MeshStandardMaterial({
      color: "#090B0F",
      roughness: 0.35,
      metalness: 0.8,
    });

    const cBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.08, 0.22),
      consoleMatB,
    );
    cBody.position.set(centerX - 0.62, benchH + 0.04, benchZ + 0.03);
    cBody.castShadow = true;

    const cPlateTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.33, 0.012, 0.23),
      consoleMatW,
    );
    cPlateTop.position.set(centerX - 0.62, benchH + 0.085, benchZ + 0.03);
    cPlateTop.castShadow = true;
    tvGroup.add(cBody, cPlateTop);

    // Mandos inalámbricos en base de carga
    [-0.05, 0.05].forEach((gx) => {
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.03, 0.05),
        consoleMatW,
      );
      pad.position.set(centerX - 0.32 + gx, benchH + 0.015, benchZ + 0.03);
      pad.rotation.y = 0.15;
      tvGroup.add(pad);
    });

    // 5. Torres de altavoces Hi-Fi de suelo (Floor-standing speakers)
    [-benchW / 2 - 0.32, benchW / 2 + 0.32].forEach((spX) => {
      const spBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.98, 0.28),
        new THREE.MeshStandardMaterial({
          color: "#111318",
          roughness: 0.4,
          metalness: 0.7,
        }),
      );
      spBody.position.set(centerX + spX, 0.49, benchZ);
      spBody.castShadow = true;

      const spConeUpper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.01, 16),
        sbarMat,
      );
      spConeUpper.rotation.x = Math.PI / 2;
      spConeUpper.position.set(centerX + spX, 0.72, benchZ + 0.142);

      const spConeLower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.01, 16),
        sbarMat,
      );
      spConeLower.rotation.x = Math.PI / 2;
      spConeLower.position.set(centerX + spX, 0.42, benchZ + 0.142);

      tvGroup.add(spBody, spConeUpper, spConeLower);
    });

    this.group.add(tvGroup);

    // 6. Plantas Sansevieria en macetero cerámico alto flanqueando el mueble
    this.createSnakePlant(centerX - benchW / 2 - 0.75, benchZ);
    this.createSnakePlant(centerX + benchW / 2 + 0.75, benchZ);
  }

  // --- 2. LIVING ROOM CENTRAL: SOFÁS Y BUTACAS EN U ---
  initLivingRoomSeating() {
    const couchW = 2.1;

    // Sofá Principal de 3 Plazas (Sur, mirando hacia el televisor en -Z)
    const couchSouth =
      this.place(
        "couchMedium",
        { x: 8.0, y: 0.0, z: 5.6 },
        { width: couchW },
        Math.PI,
      ) ||
      this.place(
        "couch-medium",
        { x: 8.0, y: 0.0, z: 5.6 },
        { width: couchW },
        Math.PI,
      );
    if (!couchSouth) this.createProceduralSofa(8.0, 5.6, Math.PI, couchW);

    // Sofá Lateral de 2 Plazas (Oeste, mirando hacia el centro en +X)
    const couchWest =
      this.place(
        "couchMedium",
        { x: 5.8, y: 0.0, z: 3.6 },
        { width: 1.65 },
        -Math.PI / 2,
      ) ||
      this.place(
        "couch-medium",
        { x: 5.8, y: 0.0, z: 3.6 },
        { width: 1.65 },
        -Math.PI / 2,
      );
    if (!couchWest) this.createProceduralSofa(5.8, 3.6, -Math.PI / 2, 1.65);

    // Dos Butacas Individuales (Este, mirando hacia el living en -X)
    const chairN =
      this.place(
        "couchSmall",
        { x: 10.35, y: 0.0, z: 2.7 },
        { width: 0.88 },
        Math.PI / 2,
      ) ||
      this.place(
        "couch-small",
        { x: 10.35, y: 0.0, z: 2.7 },
        { width: 0.88 },
        Math.PI / 2,
      );
    if (!chairN) this.createProceduralSofa(10.35, 2.7, Math.PI / 2, 0.88);

    const chairS =
      this.place(
        "couchSmall",
        { x: 10.35, y: 0.0, z: 4.5 },
        { width: 0.88 },
        Math.PI / 2,
      ) ||
      this.place(
        "couch-small",
        { x: 10.35, y: 0.0, z: 4.5 },
        { width: 0.88 },
        Math.PI / 2,
      );
    if (!chairS) this.createProceduralSofa(10.35, 4.5, Math.PI / 2, 0.88);

    // Dos Puffs otomanos informales en los vértices del salón
    this.createBeanBagPuff(6.6, 2.1, "#D97706"); // Mostaza cálido
    this.createBeanBagPuff(9.4, 5.6, "#1E3A8A"); // Azul marino profundo
  }

  // --- 3. MESA DE CENTRO CON ACCESORIOS (X: 8.00, Z: 3.60) ---
  initCentralCoffeeTable() {
    const ctGroup = new THREE.Group();
    const ctX = 8.0;
    const ctZ = 3.6;
    const ctW = 1.25;
    const ctD = 0.68;
    const ctH = 0.38;

    ctGroup.position.set(ctX, 0, ctZ);

    const tableModel =
      this.place("tableCoffee", { x: ctX, y: 0, z: ctZ }, { width: ctW }, 0) ||
      this.place("table-coffee", { x: ctX, y: 0, z: ctZ }, { width: ctW }, 0);

    if (!tableModel) {
      const topMat = new THREE.MeshStandardMaterial({
        color: "#2F1D13",
        roughness: 0.42,
      });
      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(ctW, 0.035, ctD),
        topMat,
      );
      tableTop.position.y = ctH - 0.0175;
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      ctGroup.add(tableTop);

      const legMat = new THREE.MeshStandardMaterial({
        color: "#13151B",
        roughness: 0.35,
        metalness: 0.85,
      });
      [-ctW / 2 + 0.06, ctW / 2 - 0.06].forEach((lx) => {
        [-ctD / 2 + 0.06, ctD / 2 - 0.06].forEach((lz) => {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.014, ctH - 0.035, 12),
            legMat,
          );
          leg.position.set(lx, (ctH - 0.035) / 2, lz);
          leg.castShadow = true;
          ctGroup.add(leg);
        });
      });
      this.group.add(ctGroup);
    }

    // Bandeja de madera con mando a distancia
    const trayMat = new THREE.MeshStandardMaterial({
      color: "#4A2E1B",
      roughness: 0.5,
    });
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.02, 0.24),
      trayMat,
    );
    tray.position.set(ctX - 0.28, ctH + 0.01, ctZ);
    tray.castShadow = true;
    this.group.add(tray);

    const remote =
      this.place(
        "tvRemote",
        { x: ctX - 0.28, y: ctH + 0.022, z: ctZ - 0.04 },
        { maxDim: 0.12 },
        0.25,
      ) ||
      this.place(
        "tv-remote",
        { x: ctX - 0.28, y: ctH + 0.022, z: ctZ - 0.04 },
        { maxDim: 0.12 },
        0.25,
      );

    if (!remote) {
      const remMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.012, 0.12),
        new THREE.MeshStandardMaterial({ color: "#111419", roughness: 0.5 }),
      );
      remMesh.position.set(ctX - 0.28, ctH + 0.026, ctZ - 0.04);
      remMesh.rotation.y = 0.25;
      this.group.add(remMesh);
    }

    // Vasos de agua y lata de refresco
    this.place(
      "waterGlass",
      { x: ctX - 0.24, y: ctH + 0.022, z: ctZ + 0.05 },
      { maxDim: 0.09 },
    );
    this.place(
      "sodaCan",
      { x: ctX + 0.32, y: ctH + 0.005, z: ctZ - 0.12 },
      { maxDim: 0.1 },
    );

    // Maceta pequeña de cerámica con suculenta
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.035, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: "#F8FAFC", roughness: 0.3 }),
    );
    pot.position.set(ctX + 0.15, ctH + 0.03, ctZ + 0.08);
    pot.castShadow = true;

    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 12),
      new THREE.MeshStandardMaterial({ color: "#166534", roughness: 0.7 }),
    );
    plant.position.set(ctX + 0.15, ctH + 0.075, ctZ + 0.08);
    plant.scale.set(1.1, 0.6, 1.1);
    this.group.add(pot, plant);

    // Revistas técnicas de diseño
    const mag = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.008, 0.28),
      new THREE.MeshStandardMaterial({ color: "#E2E8F0", roughness: 0.85 }),
    );
    mag.position.set(ctX + 0.3, ctH + 0.004, ctZ + 0.1);
    mag.rotation.y = -0.22;
    this.group.add(mag);
  }

  // --- 4. MESAS AUXILIARES E ILUMINACIÓN ---
  initSideTablesAndLighting() {
    const metalMat = new THREE.MeshStandardMaterial({
      color: "#13151B",
      roughness: 0.35,
      metalness: 0.85,
    });

    // 1. Mesa Auxiliar Cuadrada en la esquina Suroeste (entre los dos sofás: X = 5.80, Z = 5.60)
    const stGroupSW = new THREE.Group();
    stGroupSW.position.set(5.8, 0, 5.6);

    const sideMat = new THREE.MeshStandardMaterial({
      color: "#2F1D13",
      roughness: 0.42,
    });
    const tableTopSW = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.03, 0.55),
      sideMat,
    );
    tableTopSW.position.y = 0.48;
    tableTopSW.castShadow = true;

    const legSW = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.48, 12),
      metalMat,
    );
    legSW.position.y = 0.24;
    stGroupSW.add(tableTopSW, legSW);

    // Lámpara de mesa moderna
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.03, 16),
      metalMat,
    );
    lampBase.position.y = 0.51;
    const lampStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.24, 12),
      metalMat,
    );
    lampStem.position.y = 0.63;
    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: "#FEF3C7", roughness: 0.4 }),
    );
    lampShade.position.y = 0.78;
    stGroupSW.add(lampBase, lampStem, lampShade);
    this.group.add(stGroupSW);

    // Cesto revistero / mantas junto al sofá sur
    const basketMat = new THREE.MeshStandardMaterial({
      color: "#78350F",
      roughness: 0.85,
    });
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, 0.28, 16),
      basketMat,
    );
    basket.position.set(6.75, 0.14, 5.75);
    basket.castShadow = true;
    this.group.add(basket);

    // 2. Mesa Auxiliar Redonda intermedia entre las dos butacas este (X = 10.35, Z = 3.60)
    const stEast =
      this.place(
        "tableSideRound",
        { x: 10.35, y: 0.0, z: 3.6 },
        { height: 0.48 },
        0,
      ) ||
      this.place(
        "table-side-round",
        { x: 10.35, y: 0.0, z: 3.6 },
        { height: 0.48 },
        0,
      );

    if (!stEast) {
      const stGroupE = new THREE.Group();
      stGroupE.position.set(10.35, 0.0, 3.6);
      const stTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24),
        sideMat,
      );
      stTop.position.y = 0.48;
      const stLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.48, 12),
        metalMat,
      );
      stLeg.position.y = 0.24;
      stGroupE.add(stTop, stLeg);
      this.group.add(stGroupE);
    }

    this.place("waterGlass", { x: 10.35, y: 0.5, z: 3.6 }, { maxDim: 0.09 });

    // Lámpara de pie de arco en el lateral este
    const arcLamp = new THREE.Group();
    arcLamp.position.set(11.45, 0.0, 5.8);
    const aBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.03, 24),
      metalMat,
    );
    aBase.position.y = 0.015;
    const aPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.85, 12),
      metalMat,
    );
    aPole.position.y = 0.925;
    const aShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.24, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: "#F8FAFC", roughness: 0.3 }),
    );
    aShade.position.y = 1.85;
    arcLamp.add(aBase, aPole, aShade);
    this.group.add(arcLamp);
  }

  // --- 5. MURO ESTE: ALMACENAJE Y RINCÓN DE LECTURA (X: 11.20) ---
  initEastWallStorageAndReading() {
    const wallX = 11.2;

    // Taquillero bajo modular (cube cabinet) adosado bajo el ventanal este
    const cabinet = this.place(
      "cubeCabinet",
      { x: wallX, y: 0.0, z: 1.4 },
      { height: 0.95, width: 1.3 },
      -Math.PI / 2,
    );
    if (!cabinet) {
      const cabGroup = new THREE.Group();
      cabGroup.position.set(wallX, 0.0, 1.4);
      cabGroup.rotation.y = -Math.PI / 2;

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.95, 0.4),
        new THREE.MeshStandardMaterial({ color: "#2B170B", roughness: 0.45 }),
      );
      frame.position.y = 0.475;
      frame.castShadow = true;
      cabGroup.add(frame);

      const darkMat = new THREE.MeshStandardMaterial({
        color: "#140D07",
        roughness: 0.8,
      });
      [-0.42, 0, 0.42].forEach((cx) => {
        [0.26, 0.68].forEach((cy) => {
          const cubby = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.34, 0.02),
            darkMat,
          );
          cubby.position.set(cx, cy, -0.201);
          cabGroup.add(cubby);
        });
      });
      this.group.add(cabGroup);
    }

    // Decoración sobre el taquillero
    this.place(
      "plantFlowerPot",
      { x: wallX, y: 0.95, z: 1.8 },
      { height: 0.45 },
    );

    // Papelera discreta en el corredor de acceso
    this.place("trashcan", { x: 5.2, y: 0.0, z: 1.2 }, { height: 0.4 });
  }

  // --- 6. VEGETACIÓN PERIMETRAL ---
  initPerimeterVegetation() {
    // Esquina sureste absoluta
    this.place(
      "plantFiddleLeaf",
      { x: 11.45, y: 0.0, z: 7.4 },
      { height: 1.65 },
    );

    // Planta media en la transición hacia el pasillo peatonal central
    this.place("plantFlowerPot", { x: 5.1, y: 0.0, z: 7.2 }, { height: 1.1 });
  }

  // --- HELPERS PROCEDIMENTALES ---
  createSnakePlant(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const potMat = new THREE.MeshStandardMaterial({
      color: "#F8FAFC",
      roughness: 0.3,
    });
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.48, 16),
      potMat,
    );
    pot.position.y = 0.24;
    pot.castShadow = true;

    const leafMat = new THREE.MeshStandardMaterial({
      color: "#166534",
      roughness: 0.6,
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.65, 0.015),
        leafMat,
      );
      leaf.position.set(Math.cos(angle) * 0.07, 0.6, Math.sin(angle) * 0.07);
      leaf.rotation.y = angle;
      leaf.rotation.z = (Math.random() - 0.5) * 0.15;
      leaf.castShadow = true;
      group.add(leaf);
    }

    group.add(pot);
    this.group.add(group);
  }

  createBeanBagPuff(x, z, colorHex) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 16),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.85 }),
    );
    puff.scale.set(1.2, 0.65, 1.2);
    puff.position.set(x, 0.21, z);
    puff.castShadow = true;
    this.group.add(puff);
  }

  createProceduralSofa(x, z, rotY, width) {
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(x, 0, z);
    sofaGroup.rotation.y = rotY;

    const fabricMat = new THREE.MeshStandardMaterial({
      color: "#1E293B",
      roughness: 0.75,
      metalness: 0.05,
    });
    const depth = 0.82;

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.22, depth),
      fabricMat,
    );
    seat.position.y = 0.28;
    seat.castShadow = true;

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.44, 0.18),
      fabricMat,
    );
    back.position.set(0, 0.53, -depth / 2 + 0.09);
    back.castShadow = true;

    const armW = 0.14;
    const armL = new THREE.Mesh(
      new THREE.BoxGeometry(armW, 0.34, depth),
      fabricMat,
    );
    armL.position.set(-width / 2 + armW / 2, 0.41, 0);
    armL.castShadow = true;

    const armR = new THREE.Mesh(
      new THREE.BoxGeometry(armW, 0.34, depth),
      fabricMat,
    );
    armR.position.set(width / 2 - armW / 2, 0.41, 0);
    armR.castShadow = true;

    sofaGroup.add(seat, back, armL, armR);
    this.group.add(sofaGroup);
  }
}
