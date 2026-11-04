import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class SupervisorOffice {
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
    this.group.name = "zone-supervisor";

    // 1. Mobiliario e infraestructura existente (Intacto)
    this.initExecutiveDesk();
    this.initChairs();
    this.initStorageAndShelves();
    this.initPlants();
    this.initGlassWallTV();

    // 2. Nueva ambientación y accesorios
    this.initCabinetBooks();
    this.initTrashcan();
    this.initDeskAndWallDecor();

    // 3. Sistema CCTV en tiempo real en la pantalla
    this.initCCTVSurveillance();

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

  // --- MOBILIARIO INTACTO ---
  initExecutiveDesk() {
    const desk = this.place(
      "desk",
      { x: -8.4, y: 0, z: -5.6 },
      { height: 0.75 },
      Math.PI / 2,
    );
    if (desk) {
      desk.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          const name = child.name.toLowerCase();
          if (
            name.includes("leg") ||
            name.includes("frame") ||
            name.includes("metal")
          ) {
            child.material.color.set("#1E2129");
            child.material.roughness = 0.4;
            child.material.metalness = 0.8;
          } else {
            child.material.color.set("#4A2E1B");
            child.material.roughness = 0.42;
            child.material.metalness = 0.04;
          }
        }
      });
    }

    // Monitores 10% más grandes con curvatura cóncava y materiales originales
    this.place(
      "monitor",
      { x: -8.67, y: 0.75, z: -5.26 },
      { height: 0.485 },
      -0.26,
    );
    this.place(
      "monitor",
      { x: -8.13, y: 0.75, z: -5.26 },
      { height: 0.485 },
      0.26,
    );

    // Hardware adelantado
    this.place("keyboard", { x: -8.4, y: 0.752, z: -5.58 }, { width: 0.38 }, 0);

    const mousepad = this.place(
      "mousepad",
      { x: -8.06, y: 0.751, z: -5.58 },
      { width: 0.2 },
      0,
    );
    if (mousepad) {
      mousepad.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.color.set("#181A22");
          c.material.roughness = 0.85;
        }
      });
    }

    this.place("mouse", { x: -8.06, y: 0.753, z: -5.58 }, { width: 0.08 }, 0);
    this.place("coffeeMug", { x: -7.78, y: 0.752, z: -5.38 }, { maxDim: 0.11 });
  }

  initChairs() {
    const bossChair = this.place(
      "chair",
      { x: -8.4, y: 0, z: -6.5 },
      { height: 1.1 },
      0,
    );
    if (bossChair) {
      bossChair.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color.set("#1A1C22");
          child.material.roughness = 0.5;
        }
      });
    }

    const guestL = this.place(
      "chair",
      { x: -9.1, y: 0, z: -4.6 },
      { height: 0.98 },
      Math.PI - 0.18,
    );
    const guestR = this.place(
      "chair",
      { x: -7.7, y: 0, z: -4.6 },
      { height: 0.98 },
      Math.PI + 0.18,
    );

    [guestL, guestR].forEach((c) => {
      if (c) {
        c.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.set("#263242");
            child.material.roughness = 0.6;
          }
        });
      }
    });
  }

  initStorageAndShelves() {
    const northBookcase = this.place(
      "cubeCabinet",
      { x: -5.5, y: 0, z: -8.0 },
      { height: 2.1 },
      Math.PI,
    );
    const westCredenza = this.place(
      "cubeCabinet",
      { x: -11.4, y: 0, z: -6.0 },
      { height: 1.45 },
      -Math.PI / 2,
    );

    [northBookcase, westCredenza].forEach((cabinet) => {
      if (cabinet) {
        cabinet.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.set("#4E301D");
            child.material.roughness = 0.45;
            child.material.metalness = 0.04;
          }
        });
      }
    });
  }

  initPlants() {
    this.place(
      "plantFiddleLeaf",
      { x: -11.2, y: 0, z: -3.8 },
      { height: 1.45 },
    );
    this.place("plantFlowerPot", { x: -11.2, y: 0, z: -7.8 }, { height: 0.95 });
  }

  initGlassWallTV() {
    const tvPos = { x: -8.4, y: 2.05, z: -2.85 };
    const tv = this.place("tvFlatScreen", tvPos, { height: 0.95 }, Math.PI);
    if (tv) {
      tv.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.color.set("#12141A");
          c.material.roughness = 0.35;
          c.material.metalness = 0.8;
        }
      });
    }

    const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.25, 16);
    const poleMat = new THREE.MeshStandardMaterial({
      color: "#15171E",
      roughness: 0.35,
      metalness: 0.85,
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(tvPos.x, tvPos.y + 0.55, tvPos.z + 0.05);
    pole.castShadow = true;
    this.group.add(pole);
  }

  // --- NUEVA DECORACIÓN: LIBROS EN GABINETES ---
  createBookRow(startX, y, startZ, totalWidth, depth, rotY = 0) {
    const rowGroup = new THREE.Group();
    rowGroup.position.set(startX, y, startZ);
    rowGroup.rotation.y = rotY;

    const bookColors = [
      "#7F1D1D",
      "#1E3A8A",
      "#14532D",
      "#78350F",
      "#1F2937",
      "#B45309",
      "#312E81",
    ];
    let curX = -totalWidth / 2 + 0.04;
    let idx = 0;

    while (curX < totalWidth / 2 - 0.04) {
      const bookW = 0.032 + (idx % 3) * 0.012;
      const bookH = 0.22 + (idx % 4) * 0.018;
      const bookD = depth - 0.03;

      const mat = new THREE.MeshStandardMaterial({
        color: bookColors[idx % bookColors.length],
        roughness: 0.55,
        metalness: 0.05,
      });

      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bookW, bookH, bookD),
        mat,
      );
      book.position.set(curX + bookW / 2, bookH / 2, 0);
      book.castShadow = true;

      // Inclinación realista en el extremo de la balda
      if (curX > totalWidth / 2 - 0.12 && idx % 2 === 0) {
        book.rotation.z = -0.16;
        book.position.y -= 0.01;
      }

      rowGroup.add(book);
      curX += bookW + 0.004;
      idx++;
    }

    this.group.add(rowGroup);
  }

  createBookStack(x, y, z, count = 3, rotY = 0) {
    const stackGroup = new THREE.Group();
    stackGroup.position.set(x, y, z);
    stackGroup.rotation.y = rotY;

    const colors = ["#831843", "#1E40AF", "#15803D", "#B45309"];
    let curY = 0;
    for (let i = 0; i < count; i++) {
      const w = 0.22 - i * 0.015;
      const h = 0.038;
      const d = 0.16 - i * 0.01;
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.5,
      });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      b.position.set(0, curY + h / 2, 0);
      b.rotation.y = i % 2 === 0 ? 0.04 : -0.05;
      b.castShadow = true;
      stackGroup.add(b);
      curY += h;
    }
    this.group.add(stackGroup);
  }

  initCabinetBooks() {
    // 1. Libros en la Librería Alta Norte (3 baldas equipadas)
    this.createBookRow(-5.5, 0.42, -7.95, 0.88, 0.24, 0);
    this.createBookRow(-5.5, 0.88, -7.95, 0.9, 0.24, 0);
    this.createBookRow(-5.5, 1.34, -7.95, 0.86, 0.24, 0);

    // 2. Libros en el Aparador Oeste
    this.createBookRow(-11.35, 0.4, -6.0, 0.82, 0.24, Math.PI / 2);
    this.createBookStack(-11.35, 0.86, -5.75, 4, Math.PI / 2);
    this.createBookStack(-11.35, 1.45, -6.25, 3, Math.PI / 2);
  }

  // --- NUEVA DECORACIÓN: PAPELERA EN ESQUINA ---
  initTrashcan() {
    // Esquina norte protegida junto a la librería
    this.place("trashcan", { x: -4.88, y: 0, z: -7.85 }, { height: 0.38 });
  }

  // --- DETALLES DE AMBIENTACIÓN ADICIONALES ---
  initDeskAndWallDecor() {
    // Carpeta de cuero ejecutivo en la mesa
    const padMat = new THREE.MeshStandardMaterial({
      color: "#1E1B18",
      roughness: 0.6,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: "#F8FAFC",
      roughness: 0.9,
    });
    const portfolio = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.008, 0.32),
      padMat,
    );
    portfolio.position.set(-8.85, 0.752, -5.55);
    portfolio.castShadow = true;
    const sheet = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.002, 0.28),
      paperMat,
    );
    sheet.position.set(-8.85, 0.756, -5.55);
    this.group.add(portfolio, sheet);

    // Cubilete con bolígrafos
    const cupMat = new THREE.MeshStandardMaterial({
      color: "#1E293B",
      roughness: 0.3,
      metalness: 0.8,
    });
    const penCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.08, 16),
      cupMat,
    );
    penCup.position.set(-7.58, 0.79, -5.45);
    penCup.castShadow = true;
    this.group.add(penCup);

    // Cuadro esquemático enmarcado en el muro oeste
    const frameMat = new THREE.MeshStandardMaterial({
      color: "#3E2415",
      roughness: 0.5,
    });
    const canvasMat = new THREE.MeshStandardMaterial({
      color: "#1E293B",
      emissive: new THREE.Color("#0369A1"),
      emissiveIntensity: 0.2,
    });
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.95, 1.4),
      frameMat,
    );
    frame.position.set(-11.96, 2.35, -5.8);
    const art = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.85, 1.3),
      canvasMat,
    );
    art.position.set(-11.96, 2.35, -5.8);
    this.group.add(frame, art);
  }

  // --- SISTEMA CCTV EN TIEMPO REAL ---
  initCCTVSurveillance() {
    // Dimensiones de pantalla 16:9 montada sobre la mampara
    const screenW = 1.36;
    const screenH = 0.76;
    const tvPos = { x: -8.4, y: 2.05, z: -2.88 };

    // RenderTarget de alta fidelidad 16:9
    this.cctvRenderTarget = new THREE.WebGLRenderTarget(1024, 576, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    // Cámara de vigilancia dedicada con FOV de seguridad (48°)
    this.cctvCamera = new THREE.PerspectiveCamera(48, 16 / 9, 0.5, 60);

    // Posiciones estratégicas de las 4 cámaras en la oficina
    this.cctvFeeds = [
      {
        name: "CAM 01 - AREA DE DESARROLLO",
        pos: new THREE.Vector3(-11.2, 3.5, 8.2),
        target: new THREE.Vector3(-7.5, 0.8, 2.0),
      },
      {
        name: "CAM 02 - SALA DE REUNIONES",
        pos: new THREE.Vector3(3.6, 3.4, -8.6),
        target: new THREE.Vector3(0.0, 0.8, -6.0),
      },
      {
        name: "CAM 03 - SALON PRINCIPAL Y TV",
        pos: new THREE.Vector3(11.2, 3.4, 8.2),
        target: new THREE.Vector3(8.0, 0.8, 4.2),
      },
      {
        name: "CAM 04 - CAFETERIA & PING-PONG",
        pos: new THREE.Vector3(3.6, 3.4, -4.5),
        target: new THREE.Vector3(7.2, 0.75, -5.2),
      },
    ];

    this.currentCamIndex = 0;
    this.cctvTimer = 0;
    this.cctvCycleInterval = 5.0; // Rota cada 5 segundos
    this.renderThrottleTimer = 0;

    // Pantalla de video en vivo (muestra el render del 3D en tiempo real)
    const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.cctvRenderTarget.texture,
    });
    this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
    this.screenMesh.position.set(tvPos.x, tvPos.y, tvPos.z);
    this.screenMesh.rotation.y = Math.PI; // De cara al supervisor
    this.group.add(this.screenMesh);

    // Capa de interfaz gráfica OSD (Reloj, [REC], Cámara activa)
    this.hudCanvas = document.createElement("canvas");
    this.hudCanvas.width = 1024;
    this.hudCanvas.height = 576;
    this.hudCtx = this.hudCanvas.getContext("2d");

    this.hudTexture = new THREE.CanvasTexture(this.hudCanvas);
    const hudMat = new THREE.MeshBasicMaterial({
      map: this.hudTexture,
      transparent: true,
      opacity: 0.96,
    });

    this.hudMesh = new THREE.Mesh(screenGeo, hudMat);
    this.hudMesh.position.set(tvPos.x, tvPos.y, tvPos.z - 0.003); // Apenas frente al video
    this.hudMesh.rotation.y = Math.PI;
    this.group.add(this.hudMesh);

    this.updateHUD();
  }

  updateHUD() {
    const ctx = this.hudCtx;
    const w = 1024;
    const h = 576;
    const feed = this.cctvFeeds[this.currentCamIndex];

    ctx.clearRect(0, 0, w, h);

    // Esquinas de visor de cámara CCTV
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 3;
    const bLen = 32;
    // Sup-Izq
    ctx.beginPath();
    ctx.moveTo(40, 40 + bLen);
    ctx.lineTo(40, 40);
    ctx.lineTo(40 + bLen, 40);
    ctx.stroke();
    // Sup-Der
    ctx.beginPath();
    ctx.moveTo(w - 40 - bLen, 40);
    ctx.lineTo(w - 40, 40);
    ctx.lineTo(w - 40, 40 + bLen);
    ctx.stroke();
    // Inf-Izq
    ctx.beginPath();
    ctx.moveTo(40, h - 40 - bLen);
    ctx.lineTo(40, h - 40);
    ctx.lineTo(40 + bLen, h - 40);
    ctx.stroke();
    // Inf-Der
    ctx.beginPath();
    ctx.moveTo(w - 40 - bLen, h - 40);
    ctx.lineTo(w - 40, h - 40);
    ctx.lineTo(w - 40, h - 40 - bLen);
    ctx.stroke();

    // Indicador REC parpadeante
    const isBlink = Math.floor(Date.now() / 600) % 2 === 0;
    if (isBlink) {
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(60, 68, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#EF4444";
    ctx.font = "bold 22px monospace";
    ctx.fillText("REC", 78, 76);

    // Nombre de la cámara activa
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fillRect(140, 52, 400, 34);
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 20px monospace";
    ctx.fillText(feed.name, 155, 76);

    // Reloj digital en vivo
    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-ES", { hour12: false });
    const dateStr = now.toISOString().slice(0, 10);
    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 22px monospace";
    ctx.fillText(`${dateStr}  ${timeStr}`, w - 340, 76);

    // Pie de estado
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fillRect(40, h - 72, 360, 32);
    ctx.fillStyle = "#10B981";
    ctx.font = "16px monospace";
    ctx.fillText(
      `CH 0${this.currentCamIndex + 1}/04  |  1080p 30FPS  |  LIVE`,
      55,
      h - 51,
    );

    this.hudTexture.needsUpdate = true;
  }

  update(delta) {
    if (!this.cctvRenderTarget) return;

    // Ciclo de rotación de cámaras
    this.cctvTimer += delta;
    if (this.cctvTimer >= this.cctvCycleInterval) {
      this.cctvTimer = 0;
      this.currentCamIndex = (this.currentCamIndex + 1) % this.cctvFeeds.length;
    }

    // Actualizar reloj y parpadeo cada 0.3s
    this.hudClockTimer = (this.hudClockTimer || 0) + delta;
    if (this.hudClockTimer >= 0.3) {
      this.hudClockTimer = 0;
      this.updateHUD();
    }

    // Renderizar la toma de seguridad a 30 FPS auténticos
    this.renderThrottleTimer += delta;
    if (this.renderThrottleTimer >= 0.033) {
      this.renderThrottleTimer = 0;
      this.renderCCTVFeed();
    }
  }

  renderCCTVFeed() {
    const renderer =
      this.experience?.renderer?.instance || this.experience?.renderer;
    const scene = this.experience?.scene || this.scene;
    if (!renderer || !scene) return;

    const feed = this.cctvFeeds[this.currentCamIndex];
    this.cctvCamera.position.copy(feed.pos);
    this.cctvCamera.lookAt(feed.target);

    // Ocultar temporalmente los planos del televisor para evitar autorrenderizado
    this.screenMesh.visible = false;
    this.hudMesh.visible = false;

    const currentRT = renderer.getRenderTarget();
    renderer.setRenderTarget(this.cctvRenderTarget);
    renderer.render(scene, this.cctvCamera);
    renderer.setRenderTarget(currentRT);

    this.screenMesh.visible = true;
    this.hudMesh.visible = true;
  }
}
