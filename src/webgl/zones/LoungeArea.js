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

    // Generadores de Texturas Procedurales
    this.textures = this.initProceduralTextures();

    // 1. Frente Multimedia (Muro Z = 0.36): TV, consola baja texturizada, audio y plantas
    this.initMediaWallAndEntertainment();

    // 2. Alfombra interior textil y Living Room central
    this.initInnerRug();
    this.initLivingRoomSeating();

    // 3. Mesa de Centro de nogal texturizado con revistas y bebidas
    this.initCentralCoffeeTable();

    // 4. Mesas Auxiliares, iluminación ambiental de lino y puffs
    this.initSideTablesAndLighting();

    // 5. Muro Este: Mueble aparador modular bajo los ventanales
    this.initEastWallStorage();

    // 6. Vegetación perimetral
    this.initPerimeterVegetation();

    this.scene.add(this.group);
  }

  // --- GENERACIÓN DE TEXTURAS PROCEDURALES CANVAS 2D ---
  initProceduralTextures() {
    // 1. Veta de Madera de Nogal Oscuro (Walnut Grain)
    const woodCanvas = document.createElement("canvas");
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const wCtx = woodCanvas.getContext("2d");
    wCtx.fillStyle = "#2B180E";
    wCtx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y++) {
      const n = Math.sin(y * 0.06) * 12 + Math.cos(y * 0.02) * 20;
      const alpha = 0.04 + Math.sin(y * 0.2 + n * 0.1) * 0.03;
      wCtx.fillStyle = `rgba(18, 9, 4, ${Math.max(0, alpha)})`;
      wCtx.fillRect(0, y, 512, 1);

      if (y % 8 === 0) {
        wCtx.fillStyle = `rgba(88, 48, 26, 0.06)`;
        wCtx.fillRect(0, y + (Math.random() - 0.5) * 3, 512, 2);
      }
    }
    const woodTex = new THREE.CanvasTexture(woodCanvas);
    woodTex.wrapS = THREE.RepeatWrapping;
    woodTex.wrapT = THREE.RepeatWrapping;

    // 2. Tejido Textil de Alfombra / Tapicería (Fabric Weave)
    const rugCanvas = document.createElement("canvas");
    rugCanvas.width = 256;
    rugCanvas.height = 256;
    const rCtx = rugCanvas.getContext("2d");
    rCtx.fillStyle = "#18202C";
    rCtx.fillRect(0, 0, 256, 256);

    for (let x = 0; x < 256; x += 4) {
      for (let y = 0; y < 256; y += 4) {
        const isWeave = (x + y) % 8 === 0;
        rCtx.fillStyle = isWeave
          ? "rgba(40, 56, 76, 0.28)"
          : "rgba(10, 15, 22, 0.28)";
        rCtx.fillRect(x, y, 3, 3);
      }
    }
    const rugTex = new THREE.CanvasTexture(rugCanvas);
    rugTex.wrapS = THREE.RepeatWrapping;
    rugTex.wrapT = THREE.RepeatWrapping;
    rugTex.repeat.set(8, 6);

    // 3. Malla Acústica de Altavoces (Speaker Grille Micro-Mesh)
    const spkCanvas = document.createElement("canvas");
    spkCanvas.width = 128;
    spkCanvas.height = 128;
    const sCtx = spkCanvas.getContext("2d");
    sCtx.fillStyle = "#111317";
    sCtx.fillRect(0, 0, 128, 128);
    sCtx.fillStyle = "#060709";
    for (let x = 2; x < 128; x += 4) {
      for (let y = 2; y < 128; y += 4) {
        sCtx.beginPath();
        sCtx.arc(x, y, 1.2, 0, Math.PI * 2);
        sCtx.fill();
      }
    }
    const speakerTex = new THREE.CanvasTexture(spkCanvas);
    speakerTex.wrapS = THREE.RepeatWrapping;
    speakerTex.wrapT = THREE.RepeatWrapping;
    speakerTex.repeat.set(4, 8);

    // 4. Hojas Atigradas de Sansevieria (Snake Plant Leaf)
    const leafCanvas = document.createElement("canvas");
    leafCanvas.width = 128;
    leafCanvas.height = 512;
    const lCtx = leafCanvas.getContext("2d");
    lCtx.fillStyle = "#164E2A";
    lCtx.fillRect(0, 0, 128, 512);

    // Bandas transversales irregulares
    for (let y = 10; y < 500; y += 14) {
      lCtx.fillStyle = "#227A43";
      lCtx.beginPath();
      lCtx.moveTo(8, y);
      lCtx.bezierCurveTo(40, y - 6, 88, y + 6, 120, y);
      lCtx.lineTo(120, y + 6);
      lCtx.bezierCurveTo(88, y + 12, 40, y, 8, y + 6);
      lCtx.closePath();
      lCtx.fill();
    }
    // Bordes dorados característicos
    lCtx.fillStyle = "#FBBF24";
    lCtx.fillRect(0, 0, 8, 512);
    lCtx.fillRect(120, 0, 8, 512);
    const leafTex = new THREE.CanvasTexture(leafCanvas);

    // 5. Pantalla de Lámpara de Lino (Linen Lampshade)
    const linenCanvas = document.createElement("canvas");
    linenCanvas.width = 256;
    linenCanvas.height = 256;
    const lnCtx = linenCanvas.getContext("2d");
    lnCtx.fillStyle = "#FFFBEB";
    lnCtx.fillRect(0, 0, 256, 256);
    lnCtx.fillStyle = "rgba(217, 119, 6, 0.08)";
    for (let i = 0; i < 256; i += 3) {
      lnCtx.fillRect(i, 0, 1, 256);
      lnCtx.fillRect(0, i, 256, 1);
    }
    const linenTex = new THREE.CanvasTexture(linenCanvas);
    linenTex.wrapS = THREE.RepeatWrapping;
    linenTex.wrapT = THREE.RepeatWrapping;

    // 6. Portada de Revista Técnica (Magazine Graphic)
    const magCanvas = document.createElement("canvas");
    magCanvas.width = 256;
    magCanvas.height = 340;
    const mCtx = magCanvas.getContext("2d");
    mCtx.fillStyle = "#0F172A";
    mCtx.fillRect(0, 0, 256, 340);
    mCtx.fillStyle = "#38BDF8";
    mCtx.fillRect(20, 24, 216, 120);
    mCtx.fillStyle = "#FFFFFF";
    mCtx.font = "bold 22px Arial";
    mCtx.fillText("DEV ARCHITECTURE", 20, 180);
    mCtx.fillStyle = "#94A3B8";
    mCtx.font = "12px Arial";
    mCtx.fillText("ISSUE #42 — SYSTEMS DESIGN", 20, 205);
    mCtx.fillRect(20, 225, 140, 4);
    mCtx.fillRect(20, 240, 180, 4);
    mCtx.fillRect(20, 255, 110, 4);
    const magTex = new THREE.CanvasTexture(magCanvas);

    return { woodTex, rugTex, speakerTex, leafTex, linenTex, magTex };
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

  // --- 1. FRENTE MULTIMEDIA Y ENTRETENIMIENTO (Z = 0.36) ---
  initMediaWallAndEntertainment() {
    const tvGroup = new THREE.Group();
    const wallFaceZ = 0.36;
    const centerX = 8.0;
    const tvY = 1.48;

    // Televisor 75" montado en pared
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

    // Mueble bajo credenza multimedia en nogal texturizado
    const benchW = 2.2,
      benchH = 0.44,
      benchD = 0.44,
      benchZ = 0.64;
    const woodMat = new THREE.MeshStandardMaterial({
      map: this.textures.woodTex,
      roughness: 0.38,
      metalness: 0.04,
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

    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(benchW - 0.06, 0.02, benchD - 0.04),
      woodMat,
    );
    shelf.position.set(centerX, 0.2, benchZ);
    tvGroup.add(shelf);
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

    // Barra de sonido con malla acústica texturizada
    const soundbarMat = new THREE.MeshStandardMaterial({
      map: this.textures.speakerTex,
      roughness: 0.6,
    });
    const soundbar = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.05, 0.08),
      soundbarMat,
    );
    soundbar.position.set(centerX, benchH + 0.025, benchZ - 0.09);
    soundbar.castShadow = true;
    tvGroup.add(soundbar);

    // Consola gaming tech en blanco mate y grafito
    const cBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.08, 0.22),
      new THREE.MeshStandardMaterial({
        color: "#090B0F",
        roughness: 0.4,
        metalness: 0.7,
      }),
    );
    cBody.position.set(centerX - 0.62, benchH + 0.04, benchZ + 0.03);
    cBody.castShadow = true;

    const cPlateTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.33, 0.012, 0.23),
      new THREE.MeshStandardMaterial({ color: "#F8FAFC", roughness: 0.25 }),
    );
    cPlateTop.position.set(centerX - 0.62, benchH + 0.085, benchZ + 0.03);
    cPlateTop.castShadow = true;
    tvGroup.add(cBody, cPlateTop);

    // Torres Hi-Fi laterales con rejilla acústica texturizada
    [-benchW / 2 - 0.32, benchW / 2 + 0.32].forEach((spX) => {
      const spBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.98, 0.28),
        woodMat,
      );
      spBody.position.set(centerX + spX, 0.49, benchZ);
      spBody.castShadow = true;

      const grille = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 0.86),
        soundbarMat,
      );
      grille.position.set(centerX + spX, 0.49, benchZ + 0.142);

      tvGroup.add(spBody, grille);
    });

    this.group.add(tvGroup);

    // Plantas Sansevieria con hojas rayadas texturizadas
    this.createTexturedSnakePlant(centerX - benchW / 2 - 0.75, benchZ);
    this.createTexturedSnakePlant(centerX + benchW / 2 + 0.75, benchZ);
  }

  // --- 2. ALFOMBRA INTERIOR TEXTIL ---
  initInnerRug() {
    const rugMat = new THREE.MeshStandardMaterial({
      map: this.textures.rugTex,
      roughness: 0.85,
    });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.7), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(8.0, 0.014, 4.15);
    rug.receiveShadow = true;
    this.group.add(rug);
  }

  // --- LIVING ROOM CENTRAL EN U ---
  initLivingRoomSeating() {
    const couchW = 2.1;

    // Sofá 3 plazas al Sur (mirando al Norte hacia el TV)
    const couchSouth =
      this.place(
        "couchMedium",
        { x: 8.0, y: 0.0, z: 5.75 },
        { width: couchW },
        Math.PI,
      ) ||
      this.place(
        "couch-medium",
        { x: 8.0, y: 0.0, z: 5.75 },
        { width: couchW },
        Math.PI,
      );
    if (!couchSouth) this.createProceduralSofa(8.0, 5.75, Math.PI, couchW);

    // Sofá 2 plazas al Oeste (mirando al Este hacia el centro)
    const couchWest =
      this.place(
        "couchMedium",
        { x: 5.85, y: 0.0, z: 4.15 },
        { width: 1.65 },
        -Math.PI / 2,
      ) ||
      this.place(
        "couch-medium",
        { x: 5.85, y: 0.0, z: 4.15 },
        { width: 1.65 },
        -Math.PI / 2,
      );
    if (!couchWest) this.createProceduralSofa(5.85, 4.15, -Math.PI / 2, 1.65);

    // DOS butacas en el flanco Este AMBAS mirando al Oeste (-X) hacia la reunión
    const chairNE =
      this.place(
        "couchSmall",
        { x: 10.15, y: 0.0, z: 3.35 },
        { width: 0.88 },
        Math.PI / 2,
      ) ||
      this.place(
        "couch-small",
        { x: 10.15, y: 0.0, z: 3.35 },
        { width: 0.88 },
        Math.PI / 2,
      );
    if (!chairNE) this.createProceduralSofa(10.15, 3.35, Math.PI / 2, 0.88);

    const chairSE =
      this.place(
        "couchSmall",
        { x: 10.15, y: 0.0, z: 4.95 },
        { width: 0.88 },
        Math.PI / 2,
      ) ||
      this.place(
        "couch-small",
        { x: 10.15, y: 0.0, z: 4.95 },
        { width: 0.88 },
        Math.PI / 2,
      );
    if (!chairSE) this.createProceduralSofa(10.15, 4.95, Math.PI / 2, 0.88);

    // Puffs otomanos contemporáneos
    this.createBeanBagPuff(6.65, 2.45, "#D97706");
    this.createBeanBagPuff(9.35, 5.75, "#1E3A8A");
  }

  // --- 3. MESA DE CENTRO DE NOGAL TEXTURIZADO (ÚNICA Y CENTRADA) ---
  initCentralCoffeeTable() {
    const ctGroup = new THREE.Group();
    const ctX = 8.0,
      ctZ = 4.15,
      ctW = 1.35,
      ctD = 0.7,
      ctH = 0.38;
    ctGroup.position.set(ctX, 0, ctZ);

    const topMat = new THREE.MeshStandardMaterial({
      map: this.textures.woodTex,
      roughness: 0.38,
      metalness: 0.04,
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

    // Bandeja de servicio texturizada
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.02, 0.24),
      topMat,
    );
    tray.position.set(ctX - 0.28, ctH + 0.01, ctZ);
    tray.castShadow = true;
    this.group.add(tray);

    // Mando a distancia TV
    this.place(
      "tvRemote",
      { x: ctX - 0.28, y: ctH + 0.022, z: ctZ - 0.04 },
      { maxDim: 0.12 },
      0.25,
    );

    // Bebidas sobre la mesa
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

    // Maceta baja con suculenta
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

    // Revista con portada gráfica texturizada
    const mag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.29),
      new THREE.MeshStandardMaterial({
        map: this.textures.magTex,
        roughness: 0.4,
      }),
    );
    mag.rotation.x = -Math.PI / 2;
    mag.rotation.z = -0.25;
    mag.position.set(ctX + 0.3, ctH + 0.018, ctZ + 0.1);
    this.group.add(mag);
  }

  // --- 4. MESAS AUXILIARES E ILUMINACIÓN ---
  initSideTablesAndLighting() {
    const woodMat = new THREE.MeshStandardMaterial({
      map: this.textures.woodTex,
      roughness: 0.38,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: "#13151B",
      roughness: 0.35,
      metalness: 0.85,
    });

    // 1. Mesa Auxiliar Cuadrada en la esquina Suroeste (X = 5.85, Z = 5.75)
    const stSW = new THREE.Group();
    stSW.position.set(5.85, 0, 5.75);

    const tableTopSW = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.03, 0.55),
      woodMat,
    );
    tableTopSW.position.y = 0.48;
    tableTopSW.castShadow = true;

    const legSW = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.48, 12),
      metalMat,
    );
    legSW.position.y = 0.24;
    stSW.add(tableTopSW, legSW);

    // Lámpara de mesa con pantalla de lino cálido texturizada
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
      new THREE.MeshStandardMaterial({
        map: this.textures.linenTex,
        roughness: 0.5,
      }),
    );
    lampShade.position.y = 0.78;
    stSW.add(lampBase, lampStem, lampShade);
    this.group.add(stSW);

    // 2. Mesita redonda intermedia entre las butacas este (X = 10.15, Z = 4.15)
    const stE = new THREE.Group();
    stE.position.set(10.15, 0, 4.15);

    const topRound = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.025, 24),
      woodMat,
    );
    topRound.position.y = 0.46;
    topRound.castShadow = true;

    const legRound = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.46, 12),
      metalMat,
    );
    legRound.position.y = 0.23;
    legRound.castShadow = true;

    const baseRound = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.015, 24),
      metalMat,
    );
    baseRound.position.y = 0.008;

    stE.add(topRound, legRound, baseRound);
    this.group.add(stE);

    this.place("waterGlass", { x: 10.15, y: 0.48, z: 4.15 }, { maxDim: 0.09 });

    // Lámpara de pie de arco en el lateral este con pantalla de lino
    const arcLamp = new THREE.Group();
    arcLamp.position.set(11.25, 0.0, 5.8);
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
      new THREE.MeshStandardMaterial({
        map: this.textures.linenTex,
        roughness: 0.4,
      }),
    );
    aShade.position.y = 1.85;
    arcLamp.add(aBase, aPole, aShade);
    this.group.add(arcLamp);
  }

  // --- 5. MURO ESTE: APARADOR BAJO EN VENTANAL (X = 11.20) ---
  initEastWallStorage() {
    const wallX = 11.2;
    const cabinet = this.place(
      "cubeCabinet",
      { x: wallX, y: 0.0, z: 2.2 },
      { height: 0.95, width: 1.3 },
      -Math.PI / 2,
    );

    if (!cabinet) {
      const cabGroup = new THREE.Group();
      cabGroup.position.set(wallX, 0.0, 2.2);
      cabGroup.rotation.y = -Math.PI / 2;

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.95, 0.4),
        new THREE.MeshStandardMaterial({
          map: this.textures.woodTex,
          roughness: 0.4,
        }),
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

    this.place(
      "plantFlowerPot",
      { x: wallX, y: 0.95, z: 2.2 },
      { height: 0.45 },
    );
    this.place("trashcan", { x: 4.8, y: 0.0, z: 1.2 }, { height: 0.4 });
  }

  // --- 6. VEGETACIÓN PERIMETRAL ---
  initPerimeterVegetation() {
    this.place(
      "plantFiddleLeaf",
      { x: 11.35, y: 0.0, z: 7.1 },
      { height: 1.65 },
    );
    this.place("plantFlowerPot", { x: 5.0, y: 0.0, z: 7.1 }, { height: 1.1 });
  }

  // --- HELPERS PROCEDIMENTALES CON TEXTURA ---
  createTexturedSnakePlant(x, z) {
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
      map: this.textures.leafTex,
      roughness: 0.55,
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.68, 0.015),
        leafMat,
      );
      leaf.position.set(Math.cos(angle) * 0.07, 0.62, Math.sin(angle) * 0.07);
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
      new THREE.MeshStandardMaterial({
        color: colorHex,
        map: this.textures.rugTex,
        roughness: 0.85,
      }),
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
      map: this.textures.rugTex,
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
