import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class PingPongArea {
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
    this.group.name = "zone-ping-pong";

    // 1. Mesa de Ping-Pong reglamentaria (Eje longitudinal Norte-Sur)
    this.initRotatedPingPongTable();

    // 2. Pizarra de torneo fijada al cristal
    this.initGlassMountedWhiteboard();

    // 3. Arcade GLB (rotado 90° de espaldas a la pared), Doble Vending y Taquillas
    this.initSouthArcadeAndVending();

    // 4. Muro Norte: Vitrina de Trofeos, Banco y Cuadros deportivos
    this.initNorthWallSportsDecor();

    // 5. Lounge VIP de Espectadores (Mesa de café rotada 90°)
    this.initSpectatorLounge();

    // 6. Vegetación perimetral
    this.initVegetation();

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

  // --- 1. MESA DE PING PONG OFICIAL (X: 7.50, Z: -4.50) ---
  initRotatedPingPongTable() {
    const tableGroup = new THREE.Group();
    const tX = 7.5;
    const tZ = -4.5;
    const tH = 0.76;
    const tL = 2.74; // Eje Z (Norte-Sur)
    const tW = 1.525; // Eje X (Este-Oeste)
    const topThickness = 0.035;

    tableGroup.position.set(tX, 0, tZ);

    const topMat = new THREE.MeshStandardMaterial({
      color: "#1D4ED8",
      roughness: 0.36,
      metalness: 0.04,
    });
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(tW, topThickness, tL),
      topMat,
    );
    tableTop.position.y = tH - topThickness / 2;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Líneas blancas reglamentarias
    const lineMat = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });

    const borderW = new THREE.Mesh(new THREE.PlaneGeometry(0.02, tL), lineMat);
    borderW.rotation.x = -Math.PI / 2;
    borderW.position.set(-tW / 2 + 0.01, tH + 0.001, 0);

    const borderE = new THREE.Mesh(new THREE.PlaneGeometry(0.02, tL), lineMat);
    borderE.rotation.x = -Math.PI / 2;
    borderE.position.set(tW / 2 - 0.01, tH + 0.001, 0);

    const borderN = new THREE.Mesh(new THREE.PlaneGeometry(tW, 0.02), lineMat);
    borderN.rotation.x = -Math.PI / 2;
    borderN.position.set(0, tH + 0.001, -tL / 2 + 0.01);

    const borderS = new THREE.Mesh(new THREE.PlaneGeometry(tW, 0.02), lineMat);
    borderS.rotation.x = -Math.PI / 2;
    borderS.position.set(0, tH + 0.001, tL / 2 - 0.01);

    const centerLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.006, tL),
      lineMat,
    );
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, tH + 0.001, 0);

    tableGroup.add(borderW, borderE, borderN, borderS, centerLine);

    // Red reglamentaria central tendida a lo largo de X
    const netH = 0.1525;
    const netSpan = tW + 0.16;
    const netMat = new THREE.MeshStandardMaterial({
      color: "#F8FAFC",
      roughness: 0.75,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const netMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(netSpan, netH),
      netMat,
    );
    netMesh.position.set(0, tH + netH / 2, 0);
    netMesh.castShadow = true;

    const postMat = new THREE.MeshStandardMaterial({
      color: "#0F172A",
      roughness: 0.3,
      metalness: 0.85,
    });
    [-netSpan / 2, netSpan / 2].forEach((px) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, netH + 0.03, 12),
        postMat,
      );
      post.position.set(px, tH + netH / 2, 0);
      post.castShadow = true;
      tableGroup.add(post);
    });
    tableGroup.add(netMesh);

    // Estructura tubular inferior de acero
    const frameMat = new THREE.MeshStandardMaterial({
      color: "#E2E8F0",
      roughness: 0.35,
      metalness: 0.8,
    });
    const legPositions = [
      { x: -tW * 0.42, z: -tL * 0.4 },
      { x: tW * 0.42, z: -tL * 0.4 },
      { x: -tW * 0.42, z: -tL * 0.12 },
      { x: tW * 0.42, z: -tL * 0.12 },
      { x: -tW * 0.42, z: tL * 0.12 },
      { x: tW * 0.42, z: tL * 0.12 },
      { x: -tW * 0.42, z: tL * 0.4 },
      { x: tW * 0.42, z: tL * 0.4 },
    ];

    legPositions.forEach((lp) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, tH - topThickness, 12),
        frameMat,
      );
      leg.position.set(lp.x, (tH - topThickness) / 2, lp.z);
      leg.castShadow = true;

      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12),
        postMat,
      );
      wheel.position.set(lp.x, 0.025, lp.z);
      wheel.castShadow = true;

      tableGroup.add(leg, wheel);
    });

    const barW_leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.03, tL * 0.84),
      frameMat,
    );
    barW_leg.position.set(-tW * 0.42, 0.22, 0);
    const barE_leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.03, tL * 0.84),
      frameMat,
    );
    barE_leg.position.set(tW * 0.42, 0.22, 0);
    tableGroup.add(barW_leg, barE_leg);

    this.group.add(tableGroup);

    // Palas y pelotas
    this.createPaddleProcedural(
      tX - 0.35,
      tH + 0.005,
      tZ - 0.85,
      0.2,
      "#DC2626",
    );
    this.createPaddleProcedural(
      tX + 0.35,
      tH + 0.005,
      tZ - 0.65,
      -0.35,
      "#1E293B",
    );
    this.createPaddleProcedural(
      tX + 0.25,
      tH + 0.005,
      tZ + 0.85,
      0.45,
      "#DC2626",
    );
    this.createPaddleProcedural(
      tX - 0.3,
      tH + 0.005,
      tZ + 0.7,
      -0.15,
      "#1E293B",
    );

    this.createBallProcedural(tX - 0.18, tH + 0.015, tZ - 0.5);
    this.createBallProcedural(tX + 0.15, tH + 0.015, tZ + 0.55);
    this.createBallProcedural(tX + 0.22, tH + 0.015, tZ + 0.6);
  }

  // --- 2. PIZARRA ADOSADA AL CRISTAL (X = 4.24) ---
  initGlassMountedWhiteboard() {
    const boardGroup = new THREE.Group();
    boardGroup.position.set(4.24, 0.0, -4.5);
    boardGroup.rotation.y = Math.PI / 2;

    const frameMat = new THREE.MeshStandardMaterial({
      color: "#E2E8F0",
      metalness: 0.85,
      roughness: 0.2,
    });
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.1, 0.03),
      frameMat,
    );
    frame.position.y = 1.35;
    frame.castShadow = true;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 340;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 512, 340);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 22px Arial";
    ctx.fillText("🏆 TORNEO PING-PONG", 130, 44);

    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 3;
    [80, 140, 200, 260].forEach((ly) => {
      ctx.beginPath();
      ctx.moveTo(50, ly);
      ctx.lineTo(150, ly);
      ctx.stroke();
    });
    [110, 230].forEach((my, idx) => {
      ctx.beginPath();
      ctx.moveTo(150, 80 + idx * 120);
      ctx.lineTo(150, 140 + idx * 120);
      ctx.lineTo(260, my);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(260, 110);
    ctx.lineTo(260, 230);
    ctx.lineTo(370, 170);
    ctx.lineTo(440, 170);
    ctx.stroke();

    ctx.fillStyle = "#DC2626";
    ctx.font = "bold 18px Arial";
    ctx.fillText("FINAL", 380, 160);

    const tex = new THREE.CanvasTexture(canvas);
    const boardSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(1.52, 1.02),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 }),
    );
    boardSurface.position.set(0, 1.35, 0.018);

    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.02, 0.06),
      frameMat,
    );
    tray.position.set(0, 0.79, 0.03);

    boardGroup.add(frame, boardSurface, tray);
    this.group.add(boardGroup);
  }

  // --- 3. ARCADE GLB ROTADO 90° DE ESPALDAS A LA PARED (Z = -0.18) ---
  initSouthArcadeAndVending() {
    const wallZ = -0.18;

    // Arcade rotado 90° (Math.PI / 2) con la espalda adosada al tabique sur
    const arcade =
      this.place(
        "arcadeMachine",
        { x: 6.2, y: 0.0, z: wallZ },
        { height: 1.78 },
        Math.PI / 2,
      ) ||
      this.place(
        "arcade-machine",
        { x: 6.2, y: 0.0, z: wallZ },
        { height: 1.78 },
        Math.PI / 2,
      );

    if (!arcade) {
      this.createProceduralArcade(6.2, 0.0, wallZ);
    }

    // Taquillas
    const cabinet = this.place(
      "cubeCabinet",
      { x: 7.7, y: 0.0, z: wallZ },
      { height: 0.95, width: 1.25 },
      Math.PI,
    );
    if (!cabinet) {
      this.createProceduralCubeCabinet(7.7, 0.0, wallZ);
    }

    // Máquinas expendedoras rotadas hacia la sala
    const snackVM = this.place(
      "vendingMachine",
      { x: 9.2, y: 0.0, z: wallZ },
      { height: 1.85 },
      Math.PI,
    );
    if (!snackVM) {
      this.createProceduralVendingMachine(9.2, 0.0, wallZ, "snacks");
    }

    const drinkVM = this.place(
      "vendingMachine",
      { x: 10.45, y: 0.0, z: wallZ },
      { height: 1.85 },
      Math.PI,
    );
    if (!drinkVM) {
      this.createProceduralVendingMachine(10.45, 0.0, wallZ, "drinks");
    }

    // Papelera metálica de reciclaje
    this.place(
      "trashcan",
      { x: 11.45, y: 0.0, z: wallZ },
      { height: 0.42 },
      Math.PI,
    );

    // Latas de refresco
    this.place("sodaCan", { x: 9.75, y: 0.0, z: -0.45 }, { maxDim: 0.11 });
    this.place(
      "sodaCanCrushed",
      { x: 11.35, y: 0.0, z: -0.55 },
      { maxDim: 0.1 },
    );
  }

  // --- 4. MURO NORTE DEPORTIVO (Z = -8.45) ---
  initNorthWallSportsDecor() {
    const wallZ = -8.45;

    // Vitrina de Trofeos acristalada
    const trophyCase = new THREE.Group();
    trophyCase.position.set(6.2, 0, wallZ + 0.22);

    const caseMat = new THREE.MeshStandardMaterial({
      color: "#2B170B",
      roughness: 0.45,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#FFFFFF",
      transmission: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: "#F59E0B",
      metalness: 0.9,
      roughness: 0.25,
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: "#E2E8F0",
      metalness: 0.9,
      roughness: 0.25,
    });

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.8, 0.42),
      caseMat,
    );
    frame.position.y = 0.9;
    frame.castShadow = true;
    trophyCase.add(frame);

    const glassDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 1.68, 0.02),
      glassMat,
    );
    glassDoor.position.set(0, 0.9, 0.21);
    trophyCase.add(glassDoor);
    [0.45, 0.95, 1.4].forEach((shelfY, sIdx) => {
      [-0.32, 0, 0.32].forEach((tx, tIdx) => {
        const mat = (sIdx + tIdx) % 2 === 0 ? goldMat : silverMat;
        const cupBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.05, 0.04, 16),
          caseMat,
        );
        cupBase.position.set(tx, shelfY + 0.02, 0.05);
        const cupStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.08, 12),
          mat,
        );
        cupStem.position.set(tx, shelfY + 0.08, 0.05);
        const cupBowl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.025, 0.1, 16),
          mat,
        );
        cupBowl.position.set(tx, shelfY + 0.15, 0.05);
        trophyCase.add(cupBase, cupStem, cupBowl);
      });
    });
    this.group.add(trophyCase);

    // Banco de descanso corrido en nogal
    const benchGroup = new THREE.Group();
    benchGroup.position.set(8.1, 0, wallZ + 0.25);
    const bTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.04, 0.42),
      caseMat,
    );
    bTop.position.y = 0.42;
    bTop.castShadow = true;
    benchGroup.add(bTop);

    const legMat = new THREE.MeshStandardMaterial({
      color: "#111827",
      roughness: 0.4,
      metalness: 0.85,
    });
    [-0.72, 0.72].forEach((bx) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.4, 0.36),
        legMat,
      );
      leg.position.set(bx, 0.2, 0);
      leg.castShadow = true;
      benchGroup.add(leg);
    });
    this.group.add(benchGroup);

    // Bolsa deportiva en el suelo
    const gymBag = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.55, 16),
      new THREE.MeshStandardMaterial({ color: "#0284C7", roughness: 0.65 }),
    );
    gymBag.rotation.z = Math.PI / 2;
    gymBag.position.set(8.1, 0.14, wallZ + 0.65);
    gymBag.castShadow = true;
    this.group.add(gymBag);

    // Cartel luminoso "GAME ON"
    const neonMat = new THREE.MeshStandardMaterial({
      color: "#06B6D4",
      emissive: "#0891B2",
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const neonBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.32, 0.02),
      new THREE.MeshStandardMaterial({ color: "#0F172A" }),
    );
    neonBox.position.set(7.6, 2.75, wallZ + 0.02);

    const neonSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.24, 0.025),
      neonMat,
    );
    neonSign.position.set(7.6, 2.75, wallZ + 0.035);
    this.group.add(neonBox, neonSign);

    // Tabla decorativa y póster mural
    const board = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.95, 24),
      new THREE.MeshStandardMaterial({
        color: "#06B6D4",
        roughness: 0.25,
        metalness: 0.15,
      }),
    );
    board.scale.set(1.0, 1.0, 0.12);
    board.position.set(9.4, 2.05, wallZ + 0.02);
    board.castShadow = true;
    this.group.add(board);

    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 1.1),
      new THREE.MeshStandardMaterial({ color: "#F97316", roughness: 0.4 }),
    );
    poster.position.set(10.6, 2.05, wallZ + 0.02);
    this.group.add(poster);
  }

  // --- 5. LOUNGE VIP DE ESPECTADORES ---
  initSpectatorLounge() {
    const rugX = 10.6;
    const rugZ = -4.5;
    const rugW = 2.6;
    const rugL = 4.4;

    // Alfombra roja texturizada
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#881337";
    ctx.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 4) {
      for (let y = 0; y < 256; y += 4) {
        const n = (Math.random() - 0.5) * 35;
        ctx.fillStyle = `rgba(255, 180, 200, ${Math.max(0, 0.06 + n / 400)})`;
        ctx.fillRect(x, y, 2, 4);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 4);

    const rugMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(rugW, rugL),
      new THREE.MeshStandardMaterial({
        color: "#FFFFFF",
        map: tex,
        roughness: 0.85,
      }),
    );
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.position.set(rugX, 0.012, rugZ);
    rugMesh.receiveShadow = true;
    this.group.add(rugMesh);

    // Sofá de 3 plazas mirando al Oeste hacia la mesa
    const couch =
      this.place(
        "couchMedium",
        { x: 11.35, y: 0.0, z: -4.5 },
        { width: 1.85 },
        -Math.PI / 2,
      ) ||
      this.place(
        "couch-medium",
        { x: 11.35, y: 0.0, z: -4.5 },
        { width: 1.85 },
        -Math.PI / 2,
      );
    if (!couch) this.createProceduralSofa(11.35, -4.5, -Math.PI / 2, 1.85);

    // Butaca individual Norte
    const armN =
      this.place(
        "couchSmall",
        { x: 10.6, y: 0.0, z: -6.1 },
        { width: 0.88 },
        0,
      ) ||
      this.place(
        "couch-small",
        { x: 10.6, y: 0.0, z: -6.1 },
        { width: 0.88 },
        0,
      );
    if (!armN) this.createProceduralSofa(10.6, -6.1, 0, 0.88);

    // Butaca individual Sur
    const armS =
      this.place(
        "couchSmall",
        { x: 10.6, y: 0.0, z: -2.9 },
        { width: 0.88 },
        Math.PI,
      ) ||
      this.place(
        "couch-small",
        { x: 10.6, y: 0.0, z: -2.9 },
        { width: 0.88 },
        Math.PI,
      );
    if (!armS) this.createProceduralSofa(10.6, -2.9, Math.PI, 0.88);

    // Puffs Bean Bag contemporáneos
    this.createBeanBagPuff(9.5, -5.2, "#1E3A8A");
    this.createBeanBagPuff(9.5, -3.8, "#D97706");

    // Mesa de centro rotada 90°
    const coffeeTableGroup = new THREE.Group();
    coffeeTableGroup.position.set(10.5, 0.0, -4.5);
    coffeeTableGroup.rotation.y = Math.PI / 2;

    const glbCoffeeTable =
      this.place("tableCoffee", { x: 0, y: 0, z: 0 }, { width: 0.95 }, 0) ||
      this.place("table-coffee", { x: 0, y: 0, z: 0 }, { width: 0.95 }, 0);

    if (glbCoffeeTable) {
      coffeeTableGroup.add(glbCoffeeTable);
    } else {
      const ctTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.035, 0.55),
        new THREE.MeshStandardMaterial({ color: "#2B170B", roughness: 0.45 }),
      );
      ctTop.position.y = 0.36;
      ctTop.castShadow = true;

      const legMat = new THREE.MeshStandardMaterial({
        color: "#15171F",
        roughness: 0.3,
        metalness: 0.85,
      });
      [-0.42, 0.42].forEach((lx) => {
        [-0.22, 0.22].forEach((lz) => {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.34, 12),
            legMat,
          );
          leg.position.set(lx, 0.17, lz);
          leg.castShadow = true;
          coffeeTableGroup.add(leg);
        });
      });
      coffeeTableGroup.add(ctTop);
    }

    const glass = this.place(
      "waterGlass",
      { x: -0.15, y: 0.38, z: 0.06 },
      { maxDim: 0.09 },
    );
    const can = this.place(
      "sodaCan",
      { x: 0.16, y: 0.38, z: -0.06 },
      { maxDim: 0.1 },
    );
    if (glass) coffeeTableGroup.add(glass);
    if (can) coffeeTableGroup.add(can);

    this.group.add(coffeeTableGroup);

    // Lámpara de pie
    const lampGroup = new THREE.Group();
    lampGroup.position.set(11.45, 0.0, -6.4);
    const legMat = new THREE.MeshStandardMaterial({
      color: "#15171F",
      roughness: 0.3,
      metalness: 0.85,
    });
    const lampPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.7, 12),
      legMat,
    );
    lampPole.position.y = 0.85;
    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.26, 0.28, 16),
      new THREE.MeshStandardMaterial({ color: "#F8FAFC", roughness: 0.3 }),
    );
    lampShade.position.y = 1.65;
    lampGroup.add(lampPole, lampShade);
    this.group.add(lampGroup);
  }

  createBeanBagPuff(x, z, colorHex) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.85 }),
    );
    puff.scale.set(1.2, 0.65, 1.2);
    puff.position.set(x, 0.2, z);
    puff.castShadow = true;
    this.group.add(puff);
  }

  // --- 6. VEGETACIÓN ---
  initVegetation() {
    this.place(
      "plantFiddleLeaf",
      { x: 11.45, y: 0.0, z: -8.1 },
      { height: 1.6 },
    );
    this.place(
      "plantFlowerPot",
      { x: 4.8, y: 0.0, z: -8.15 },
      { height: 1.15 },
    );
    this.place(
      "plantFiddleLeaf",
      { x: 11.45, y: 0.0, z: -0.5 },
      { height: 1.55 },
    );
  }

  // --- MODELADOS PROCEDIMENTALES DE RESPALDO ---
  createPaddleProcedural(x, y, z, rotY, rubberHex) {
    const padGroup = new THREE.Group();
    padGroup.position.set(x, y, z);
    padGroup.rotation.y = rotY;

    const blade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.01, 24),
      new THREE.MeshStandardMaterial({ color: rubberHex, roughness: 0.5 }),
    );
    blade.position.set(0, 0.005, 0);
    blade.castShadow = true;

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.012, 0.1),
      new THREE.MeshStandardMaterial({ color: "#D97706", roughness: 0.6 }),
    );
    handle.position.set(0, 0.006, 0.12);
    handle.castShadow = true;

    padGroup.add(blade, handle);
    this.group.add(padGroup);
  }

  createBallProcedural(x, y, z) {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 16, 16),
      new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.35 }),
    );
    ball.position.set(x, y, z);
    ball.castShadow = true;
    this.group.add(ball);
  }

  createProceduralArcade(x, y, z) {
    const arcGroup = new THREE.Group();
    arcGroup.position.set(x, y, z);
    arcGroup.rotation.y = 0;

    const w = 0.72,
      h = 1.78,
      d = 0.75;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: "#0F172A",
      roughness: 0.35,
      metalness: 0.6,
    });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    mainBody.position.y = h / 2;
    mainBody.castShadow = true;
    arcGroup.add(mainBody);

    const marquee = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.04, 0.18, 0.04),
      new THREE.MeshStandardMaterial({
        color: "#38BDF8",
        emissive: "#0284C7",
        emissiveIntensity: 0.65,
        roughness: 0.2,
      }),
    );
    marquee.position.set(0, h - 0.12, -d / 2 - 0.015);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.12, 0.42),
      new THREE.MeshStandardMaterial({
        color: "#10B981",
        emissive: "#047857",
        emissiveIntensity: 0.45,
        roughness: 0.1,
      }),
    );
    screen.position.set(0, h * 0.64, -d / 2 - 0.02);
    screen.rotation.x = -0.22;

    const ctrlPanel = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.04, 0.05, 0.28),
      new THREE.MeshStandardMaterial({ color: "#1E293B", roughness: 0.5 }),
    );
    ctrlPanel.position.set(0, h * 0.48, -d / 2 - 0.08);
    ctrlPanel.rotation.x = 0.18;

    arcGroup.add(marquee, screen, ctrlPanel);
    this.group.add(arcGroup);
  }

  createProceduralVendingMachine(x, y, z, type) {
    const vmGroup = new THREE.Group();
    vmGroup.position.set(x, y, z);
    vmGroup.rotation.y = Math.PI;

    const w = 0.95,
      h = 1.85,
      d = 0.78;
    const bodyColor = type === "drinks" ? "#0F172A" : "#1E293B";
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.35,
        metalness: 0.75,
      }),
    );
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    vmGroup.add(body);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.62, h * 0.55, 0.02),
      new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        transmission: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
      }),
    );
    glass.position.set(-w * 0.14, h * 0.58, -d / 2 - 0.01);
    vmGroup.add(glass);

    const colors =
      type === "drinks"
        ? ["#DC2626", "#2563EB", "#16A34A", "#F59E0B"]
        : ["#F97316", "#EAB308", "#84CC16", "#EC4899"];
    for (let shelf = 0; shelf < 3; shelf++) {
      const sy = h * 0.38 + shelf * 0.22;
      for (let c = 0; c < 4; c++) {
        const item =
          type === "drinks"
            ? new THREE.Mesh(
                new THREE.CylinderGeometry(0.028, 0.028, 0.09, 12),
                new THREE.MeshStandardMaterial({
                  color: colors[(shelf + c) % colors.length],
                  roughness: 0.3,
                  metalness: 0.6,
                }),
              )
            : new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.08, 0.03),
                new THREE.MeshStandardMaterial({
                  color: colors[(shelf + c) % colors.length],
                  roughness: 0.6,
                }),
              );
        item.position.set(-w * 0.32 + c * 0.12, sy, -d * 0.22);
        vmGroup.add(item);
      }
    }

    const keypad = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.34, 0.02),
      new THREE.MeshStandardMaterial({ color: "#020617", roughness: 0.5 }),
    );
    keypad.position.set(w * 0.32, h * 0.65, -d / 2 - 0.01);

    const pickupFlap = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.75, 0.22, 0.02),
      new THREE.MeshStandardMaterial({ color: "#090D16", roughness: 0.6 }),
    );
    pickupFlap.position.set(0, 0.2, -d / 2 - 0.01);

    vmGroup.add(keypad, pickupFlap);
    this.group.add(vmGroup);
  }

  createProceduralCubeCabinet(x, y, z) {
    const cabGroup = new THREE.Group();
    cabGroup.position.set(x, y, z);
    cabGroup.rotation.y = Math.PI;

    const w = 1.25,
      h = 0.95,
      d = 0.4;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: "#2B170B", roughness: 0.45 }),
    );
    frame.position.y = h / 2;
    frame.castShadow = true;
    cabGroup.add(frame);

    const darkMat = new THREE.MeshStandardMaterial({
      color: "#140D07",
      roughness: 0.8,
    });
    [-0.4, 0, 0.4].forEach((cx) => {
      [0.26, 0.68].forEach((cy) => {
        const cubby = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.34, 0.02),
          darkMat,
        );
        cubby.position.set(cx, cy, -d / 2 - 0.001);
        cabGroup.add(cubby);
      });
    });

    this.group.add(cabGroup);
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
    const depth = 0.78;

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.22, depth),
      fabricMat,
    );
    seat.position.y = 0.28;
    seat.castShadow = true;

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.42, 0.18),
      fabricMat,
    );
    back.position.set(0, 0.52, -depth / 2 + 0.09);
    back.castShadow = true;

    const armW = 0.12;
    const armL = new THREE.Mesh(
      new THREE.BoxGeometry(armW, 0.32, depth),
      fabricMat,
    );
    armL.position.set(-width / 2 + armW / 2, 0.4, 0);
    armL.castShadow = true;

    const armR = new THREE.Mesh(
      new THREE.BoxGeometry(armW, 0.32, depth),
      fabricMat,
    );
    armR.position.set(width / 2 - armW / 2, 0.4, 0);
    armR.castShadow = true;

    sofaGroup.add(seat, back, armL, armR);
    this.group.add(sofaGroup);
  }
}
