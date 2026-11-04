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

    // 1. Mesa de Ping-Pong reglamentaria 100% RECTA
    this.initStraightPingPongTable();
    this.initRefereeScoreboard();

    // 2. Zona de Juegos y Recreación: Futbolín y Arcade Retro
    this.initFoosballTable();
    this.initArcadeMachine();

    // 3. Estación Vending Doble y Taquillas (Muro Sur Z = 0)
    this.initVendingAndLockers();

    // 4. Muro Norte: Vitrina de Trofeos, Banco y Neón "GAME ON"
    this.initTrophyCaseAndNorthWall();

    // 5. Lounge VIP de Espectadores (Esquina Este ampliada)
    this.initSpectatorLounge();

    // 6. Pizarra de Torneo en mampara oeste
    this.initTournamentWhiteboard();

    // 7. Vegetación de gran porte
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

  // --- 1. MESA DE PING PONG OFICIAL ITTF 100% RECTA (X: 7.60, Z: -4.50) ---
  initStraightPingPongTable() {
    const tableGroup = new THREE.Group();
    const tX = 7.6;
    const tZ = -4.5;
    const tH = 0.76;
    const tL = 2.74; // Eje X: largo estrictamente horizontal
    const tW = 1.525; // Eje Z: ancho estrictamente perpendicular
    const topThickness = 0.035;

    tableGroup.position.set(tX, 0, tZ);

    // Tablero azul torneo mate
    const topMat = new THREE.MeshStandardMaterial({
      color: "#1D4ED8",
      roughness: 0.36,
      metalness: 0.04,
    });
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(tL, topThickness, tW),
      topMat,
    );
    tableTop.position.y = tH - topThickness / 2;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Líneas blancas oficiales (sin desfases)
    const lineMat = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });

    const borderN = new THREE.Mesh(new THREE.PlaneGeometry(tL, 0.02), lineMat);
    borderN.rotation.x = -Math.PI / 2;
    borderN.position.set(0, tH + 0.001, -tW / 2 + 0.01);

    const borderS = new THREE.Mesh(new THREE.PlaneGeometry(tL, 0.02), lineMat);
    borderS.rotation.x = -Math.PI / 2;
    borderS.position.set(0, tH + 0.001, tW / 2 - 0.01);

    const borderW = new THREE.Mesh(new THREE.PlaneGeometry(0.02, tW), lineMat);
    borderW.rotation.x = -Math.PI / 2;
    borderW.position.set(-tL / 2 + 0.01, tH + 0.001, 0);

    const borderE = new THREE.Mesh(new THREE.PlaneGeometry(0.02, tW), lineMat);
    borderE.rotation.x = -Math.PI / 2;
    borderE.position.set(tL / 2 - 0.01, tH + 0.001, 0);

    const centerLine = new THREE.Mesh(
      new THREE.PlaneGeometry(tL, 0.006),
      lineMat,
    );
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, tH + 0.001, 0);

    tableGroup.add(borderN, borderS, borderW, borderE, centerLine);

    // Red de malla vertical a lo largo del eje Z
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
    netMesh.rotation.y = Math.PI / 2;
    netMesh.position.set(0, tH + netH / 2, 0);
    netMesh.castShadow = true;

    const postMat = new THREE.MeshStandardMaterial({
      color: "#0F172A",
      roughness: 0.3,
      metalness: 0.85,
    });
    [-netSpan / 2, netSpan / 2].forEach((pz) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, netH + 0.03, 12),
        postMat,
      );
      post.position.set(0, tH + netH / 2, pz);
      post.castShadow = true;
      tableGroup.add(post);
    });
    tableGroup.add(netMesh);

    // Estructura tubular inferior de acero blanco con ruedas y tirantes
    const frameMat = new THREE.MeshStandardMaterial({
      color: "#E2E8F0",
      roughness: 0.35,
      metalness: 0.8,
    });
    const legPositions = [
      { x: -tL * 0.4, z: -tW * 0.42 },
      { x: -tL * 0.4, z: tW * 0.42 },
      { x: -tL * 0.12, z: -tW * 0.42 },
      { x: -tL * 0.12, z: tW * 0.42 },
      { x: tL * 0.12, z: -tW * 0.42 },
      { x: tL * 0.12, z: tW * 0.42 },
      { x: tL * 0.4, z: -tW * 0.42 },
      { x: tL * 0.4, z: tW * 0.42 },
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
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(lp.x, 0.025, lp.z);
      wheel.castShadow = true;

      tableGroup.add(leg, wheel);
    });

    // Travesaños longitudinales
    const barN = new THREE.Mesh(
      new THREE.BoxGeometry(tL * 0.84, 0.03, 0.03),
      frameMat,
    );
    barN.position.set(0, 0.22, -tW * 0.42);
    const barS = new THREE.Mesh(
      new THREE.BoxGeometry(tL * 0.84, 0.03, 0.03),
      frameMat,
    );
    barS.position.set(0, 0.22, tW * 0.42);
    tableGroup.add(barN, barS);

    this.group.add(tableGroup);

    // Palas y pelotas apoyadas en la mesa recta
    this.createPaddleProcedural(
      tX - 0.85,
      tH + 0.005,
      tZ - 0.35,
      0.35,
      "#DC2626",
    );
    this.createPaddleProcedural(
      tX - 0.7,
      tH + 0.005,
      tZ + 0.4,
      -0.2,
      "#1E293B",
    );
    this.createPaddleProcedural(
      tX + 0.85,
      tH + 0.005,
      tZ + 0.25,
      -0.45,
      "#DC2626",
    );
    this.createPaddleProcedural(
      tX + 0.7,
      tH + 0.005,
      tZ - 0.4,
      0.15,
      "#1E293B",
    );

    this.createBallProcedural(tX - 0.55, tH + 0.015, tZ - 0.2);
    this.createBallProcedural(tX + 0.6, tH + 0.015, tZ + 0.1);
    this.createBallProcedural(tX + 0.65, tH + 0.015, tZ + 0.16);
  }

  // --- MARCADOR DE TANTEO DE ÁRBITRO ---
  initRefereeScoreboard() {
    const stand = new THREE.Group();
    stand.position.set(7.6, 0, -6.15);

    const metalMat = new THREE.MeshStandardMaterial({
      color: "#1E293B",
      roughness: 0.3,
      metalness: 0.85,
    });
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.95, 12),
      metalMat,
    );
    pole.position.y = 0.475;
    pole.castShadow = true;

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24),
      metalMat,
    );
    base.position.y = 0.01;
    base.castShadow = true;

    // Marcador de tanteo de mesa giratorio («11 - 9»)
    const boardMat = new THREE.MeshStandardMaterial({
      color: "#0F172A",
      roughness: 0.4,
    });
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.24, 0.06),
      boardMat,
    );
    board.position.y = 1.02;
    board.castShadow = true;

    // Tarjetas roja (11) y azul (9)
    const cardRed = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.18),
      new THREE.MeshBasicMaterial({ color: "#EF4444" }),
    );
    cardRed.position.set(-0.09, 1.02, 0.032);

    const cardBlue = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.18),
      new THREE.MeshBasicMaterial({ color: "#3B82F6" }),
    );
    cardBlue.position.set(0.09, 1.02, 0.032);

    stand.add(pole, base, board, cardRed, cardBlue);
    this.group.add(stand);
  }

  // --- 2. FUTBOLÍN PROFESIONAL (X: 5.20, Z: -1.80) ---
  initFoosballTable() {
    const fGroup = new THREE.Group();
    const fX = 5.2,
      fZ = -1.8,
      fH = 0.88,
      fL = 1.4,
      fW = 0.75;
    fGroup.position.set(fX, 0, fZ);

    // Cajón de madera en nogal
    const woodMat = new THREE.MeshStandardMaterial({
      color: "#452210",
      roughness: 0.45,
    });
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(fL, 0.32, fW),
      woodMat,
    );
    cabinet.position.y = fH - 0.16;
    cabinet.castShadow = true;
    fGroup.add(cabinet);

    // Campo de juego verde césped con líneas blancas
    const fieldMat = new THREE.MeshStandardMaterial({
      color: "#15803D",
      roughness: 0.7,
    });
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(fL - 0.12, fW - 0.1),
      fieldMat,
    );
    field.rotation.x = -Math.PI / 2;
    field.position.y = fH - 0.05;
    field.receiveShadow = true;
    fGroup.add(field);

    // 8 barras de acero cromado transversales
    const chromeMat = new THREE.MeshStandardMaterial({
      color: "#F1F5F9",
      metalness: 0.95,
      roughness: 0.15,
    });
    const redMat = new THREE.MeshStandardMaterial({
      color: "#DC2626",
      roughness: 0.5,
    });
    const blueMat = new THREE.MeshStandardMaterial({
      color: "#2563EB",
      roughness: 0.5,
    });

    for (let i = 0; i < 8; i++) {
      const rx = -fL / 2 + 0.15 + i * 0.155;
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, fW + 0.36, 12),
        chromeMat,
      );
      rod.rotation.x = Math.PI / 2;
      rod.position.set(rx, fH + 0.02, 0);
      rod.castShadow = true;
      fGroup.add(rod);

      // Muñecos en la barra
      const isRedTeam = i % 2 === 0;
      const teamMat = isRedTeam ? redMat : blueMat;
      const playersCount = i === 0 || i === 7 ? 1 : i === 1 || i === 6 ? 2 : 3;
      for (let p = 0; p < playersCount; p++) {
        const pz = (p - (playersCount - 1) / 2) * 0.18;
        const player = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.065, 0.02),
          teamMat,
        );
        player.position.set(rx, fH - 0.01, pz);
        player.castShadow = true;
        fGroup.add(player);
      }
    }

    // 4 patas robustas de acero negro
    const legMat = new THREE.MeshStandardMaterial({
      color: "#111827",
      roughness: 0.4,
      metalness: 0.85,
    });
    [-fL / 2 + 0.08, fL / 2 - 0.08].forEach((lx) => {
      [-fW / 2 + 0.08, fW / 2 - 0.08].forEach((lz) => {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.07, fH - 0.32, 0.07),
          legMat,
        );
        leg.position.set(lx, (fH - 0.32) / 2, lz);
        leg.castShadow = true;
        fGroup.add(leg);
      });
    });

    this.group.add(fGroup);
  }

  // --- MÁQUINA ARCADE RETRO (X: 6.50, Z: -0.15) ---
  initArcadeMachine() {
    const arcGroup = new THREE.Group();
    arcGroup.position.set(6.5, 0, -0.15);

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

    // Marquesina superior iluminada "ARCADE RETRO"
    const marqueeMat = new THREE.MeshStandardMaterial({
      color: "#38BDF8",
      emissive: "#0284C7",
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });
    const marquee = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.04, 0.18, 0.04),
      marqueeMat,
    );
    marquee.position.set(0, h - 0.12, -d / 2 - 0.015);
    arcGroup.add(marquee);

    // Pantalla CRT inclinada con gráficos retro pixel art
    const screenMat = new THREE.MeshStandardMaterial({
      color: "#10B981",
      emissive: "#047857",
      emissiveIntensity: 0.45,
      roughness: 0.1,
    });
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.12, 0.42),
      screenMat,
    );
    screen.position.set(0, h * 0.64, -d / 2 - 0.02);
    screen.rotation.x = -0.22;
    arcGroup.add(screen);

    // Panel de mandos con joysticks y botones de colores
    const ctrlMat = new THREE.MeshStandardMaterial({
      color: "#1E293B",
      roughness: 0.5,
    });
    const ctrlPanel = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.04, 0.05, 0.28),
      ctrlMat,
    );
    ctrlPanel.position.set(0, h * 0.48, -d / 2 - 0.08);
    ctrlPanel.rotation.x = 0.18;
    arcGroup.add(ctrlPanel);

    // 2 joysticks rojos con bola superior
    [-0.18, 0.18].forEach((jx) => {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.07, 8),
        new THREE.MeshStandardMaterial({ color: "#CBD5E1", metalness: 0.9 }),
      );
      stick.position.set(jx, h * 0.52, -d / 2 - 0.08);
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 12, 12),
        new THREE.MeshStandardMaterial({ color: "#EF4444" }),
      );
      ball.position.set(jx, h * 0.56, -d / 2 - 0.08);
      arcGroup.add(stick, ball);
    });

    // Puerta de monedas con botones de rechazo
    const coinDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.38, 0.02),
      new THREE.MeshStandardMaterial({
        color: "#020617",
        roughness: 0.4,
        metalness: 0.8,
      }),
    );
    coinDoor.position.set(0, 0.26, -d / 2 - 0.01);
    arcGroup.add(coinDoor);

    this.group.add(arcGroup);
  }

  // --- 3. DOBLE VENDING MACHINE Y TAQUILLAS (MURO SUR) ---
  initVendingAndLockers() {
    const wallZ = -0.15;

    // Máquina de Snacks (X = 9.40)
    const snackVM = this.place(
      "vendingMachine",
      { x: 9.4, y: 0.0, z: wallZ },
      { height: 1.85 },
      0,
    );
    if (!snackVM)
      this.createProceduralVendingMachine(9.4, 0.0, wallZ, "snacks");

    // Máquina de Bebidas (X = 10.60)
    const drinkVM = this.place(
      "vendingMachine",
      { x: 10.6, y: 0.0, z: wallZ },
      { height: 1.85 },
      0,
    );
    if (!drinkVM)
      this.createProceduralVendingMachine(10.6, 0.0, wallZ, "drinks");

    // Papelera de reciclaje doble (X = 11.45)
    this.place("trashcan", { x: 11.45, y: 0.0, z: wallZ }, { height: 0.42 }, 0);

    // Latas en el suelo / zona de descanso
    this.place("sodaCan", { x: 9.95, y: 0.0, z: -0.45 }, { maxDim: 0.11 });
    this.place(
      "sodaCanCrushed",
      { x: 11.35, y: 0.0, z: -0.55 },
      { maxDim: 0.1 },
    );

    // Taquillero deportivo / Cube Cabinet (X = 7.90)
    const cabinet = this.place(
      "cubeCabinet",
      { x: 7.9, y: 0.0, z: wallZ },
      { height: 0.95, width: 1.3 },
      0,
    );
    if (!cabinet) this.createProceduralCubeCabinet(7.9, 0.0, wallZ);
  }

  // --- 4. MURO NORTE: VITRINA DE TROFEOS, BANCO Y NEÓN (Z = -8.45) ---
  initTrophyCaseAndNorthWall() {
    const wallZ = -8.45;

    // 1. Vitrina de Trofeos acristalada (X = 6.20)
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

    // Trofeos en las 3 baldas
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

    // 2. Banco corrido de calentamiento (X = 8.00)
    const benchGroup = new THREE.Group();
    benchGroup.position.set(8.0, 0, wallZ + 0.25);
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

    // Raquetero / Bolsa de deporte en el suelo
    const bagMat = new THREE.MeshStandardMaterial({
      color: "#0284C7",
      roughness: 0.65,
    });
    const gymBag = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.55, 16),
      bagMat,
    );
    gymBag.rotation.z = Math.PI / 2;
    gymBag.position.set(8.0, 0.14, wallZ + 0.65);
    gymBag.castShadow = true;
    this.group.add(gymBag);

    // 3. Cartel Neón Deportivo "GAME ON"
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

    // Perchero y Tabla decorativa en la pared
    const boardMat = new THREE.MeshStandardMaterial({
      color: "#06B6D4",
      roughness: 0.25,
      metalness: 0.15,
    });
    const board = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.95, 24),
      boardMat,
    );
    board.scale.set(1.0, 1.0, 0.12);
    board.position.set(9.4, 2.05, wallZ + 0.02);
    board.castShadow = true;
    this.group.add(board);

    const posterMat = new THREE.MeshStandardMaterial({
      color: "#F97316",
      roughness: 0.4,
    });
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 1.1),
      posterMat,
    );
    poster.position.set(10.6, 2.05, wallZ + 0.02);
    this.group.add(poster);
  }

  // --- 5. LOUNGE VIP DE ESPECTADORES (ESQUINA ESTE AMPLIADA) ---
  initSpectatorLounge() {
    const rugX = 10.6;
    const rugZ = -4.5;
    const rugW = 2.6;
    const rugL = 4.4;

    // Gran alfombra roja rubí texturizada
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

    const rugMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      map: tex,
      roughness: 0.85,
    });
    const rugMesh = new THREE.Mesh(new THREE.PlaneGeometry(rugW, rugL), rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.position.set(rugX, 0.012, rugZ);
    rugMesh.receiveShadow = true;
    this.group.add(rugMesh);

    // Sofá de 3 plazas principal mirando al Oeste hacia la mesa
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

    // Butaca individual Norte (mirando al Sur)
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

    // Butaca individual Sur (mirando al Norte)
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

    // 2 Puffs contemporáneos estilo Bean Bag en el borde de la alfombra
    this.createBeanBagPuff(9.5, -5.2, "#1E3A8A"); // Azul cobalto
    this.createBeanBagPuff(9.5, -3.8, "#D97706"); // Ámbar tostado

    // Mesa de centro de café con bebidas y revistas
    const ctTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.035, 0.55),
      new THREE.MeshStandardMaterial({ color: "#2B170B", roughness: 0.45 }),
    );
    ctTop.position.set(10.5, 0.36, -4.5);
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
        leg.position.set(10.5 + lx, 0.17, -4.5 + lz);
        leg.castShadow = true;
        this.group.add(leg);
      });
    });
    this.group.add(ctTop);

    this.place("waterGlass", { x: 10.35, y: 0.38, z: -4.6 }, { maxDim: 0.09 });
    this.place("sodaCan", { x: 10.65, y: 0.38, z: -4.4 }, { maxDim: 0.1 });

    // Lámpara de pie esbelta en la esquina este
    const lampGroup = new THREE.Group();
    lampGroup.position.set(11.45, 0.0, -6.4);
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
    const puffMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.85,
    });
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      puffMat,
    );
    puff.scale.set(1.2, 0.65, 1.2);
    puff.position.set(x, 0.2, z);
    puff.castShadow = true;
    this.group.add(puff);
  }

  // --- 6. PIZARRA TÁCTICA DE TORNEO (MAMPARA OESTE X = 4.55) ---
  initTournamentWhiteboard() {
    const boardGroup = new THREE.Group();
    boardGroup.position.set(4.55, 0, -4.5);
    boardGroup.rotation.y = Math.PI / 2;

    const frameMat = new THREE.MeshStandardMaterial({
      color: "#CBD5E1",
      metalness: 0.8,
      roughness: 0.2,
    });
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.1, 0.04),
      frameMat,
    );
    frame.position.y = 1.25;
    frame.castShadow = true;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 340;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 512, 340);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 22px Arial";
    ctx.fillText("🏆 TORNEO PING-PONG", 140, 42);

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
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(1.52, 1.02),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }),
    );
    board.position.set(0, 1.25, 0.022);

    boardGroup.add(frame, board);
    this.group.add(boardGroup);
  }

  // --- 7. VEGETACIÓN DE GRAN PORTE ---
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
    this.place(
      "plantFlowerPot",
      { x: 4.55, y: 0.0, z: -3.0 },
      { height: 1.05 },
    );
  }

  // --- MODELADOS PROCEDIMENTALES DE SOPORTE ---
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

  createProceduralVendingMachine(x, y, z, type) {
    const vmGroup = new THREE.Group();
    vmGroup.position.set(x, y, z);

    const w = 0.95,
      h = 1.85,
      d = 0.78;
    const bodyColor = type === "drinks" ? "#0F172A" : "#1E293B";
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.35,
      metalness: 0.75,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    vmGroup.add(body);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#FFFFFF",
      transmission: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.62, h * 0.55, 0.02),
      glassMat,
    );
    glass.position.set(-w * 0.14, h * 0.58, -d / 2 - 0.01);
    vmGroup.add(glass);

    // Productos internos (latas o snacks)
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

    const w = 1.3,
      h = 0.95,
      d = 0.4;
    const woodMat = new THREE.MeshStandardMaterial({
      color: "#2B170B",
      roughness: 0.45,
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodMat);
    frame.position.y = h / 2;
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
