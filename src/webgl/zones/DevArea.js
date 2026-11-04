import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class DevArea {
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
    this.group.name = "zone-dev-area";

    // 1. Pod 1: Bancada Oeste (4 puestos)
    this.buildWorkbenchPod({
      podId: 1,
      centerX: -9.6,
      centerZ: 5.2,
      pairs: 2,
    });

    // 2. Pod 2: Bancada Central-Sur (4 puestos)
    this.buildWorkbenchPod({
      podId: 2,
      centerX: -6.0,
      centerZ: 5.2,
      pairs: 2,
    });

    // 3. Pod 3: Isla Norte (2 puestos)
    this.buildWorkbenchPod({
      podId: 3,
      centerX: -7.8,
      centerZ: 1.0,
      pairs: 1,
    });

    // 4. Vegetación perimetral calibrada en columnas ciegas
    this.initVegetation();

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

  // --- ESTRUCTURA DE LA BANCADA TÉCNICA ---
  buildWorkbenchPod({ podId, centerX, centerZ, pairs }) {
    const podGroup = new THREE.Group();
    const tableH = 0.75;
    const tableTopThickness = 0.045;
    const slotW = 1.4;
    const totalW = slotW * pairs;
    const totalD = 1.5;

    // Tablero principal en nogal satinado
    const topMat = new THREE.MeshStandardMaterial({
      color: "#382215",
      roughness: 0.42,
      metalness: 0.04,
    });
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(totalW, tableTopThickness, totalD),
      topMat,
    );
    deskTop.position.set(centerX, tableH - tableTopThickness / 2, centerZ);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    podGroup.add(deskTop);

    // Panel divisor acústico central
    const dividerMat = new THREE.MeshStandardMaterial({
      color: "#20242D",
      roughness: 0.85,
    });
    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(totalW - 0.04, 0.28, 0.025),
      dividerMat,
    );
    divider.position.set(centerX, tableH + 0.14, centerZ);
    divider.castShadow = true;
    podGroup.add(divider);

    // Notas Kanban asimétricas en ambas caras del divisor
    this.createDividerKanbanNotes(
      podGroup,
      centerX,
      tableH + 0.14,
      centerZ,
      totalW - 0.04,
    );

    // Estructura de patas tubulares
    const legMat = new THREE.MeshStandardMaterial({
      color: "#15171F",
      roughness: 0.38,
      metalness: 0.85,
    });

    const legPositionsX =
      pairs === 2
        ? [centerX - totalW / 2 + 0.05, centerX, centerX + totalW / 2 - 0.05]
        : [centerX - totalW / 2 + 0.05, centerX + totalW / 2 - 0.05];

    legPositionsX.forEach((lx) => {
      const legN = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, tableH - tableTopThickness, 0.05),
        legMat,
      );
      legN.position.set(
        lx,
        (tableH - tableTopThickness) / 2,
        centerZ - totalD / 2 + 0.06,
      );
      legN.castShadow = true;

      const legS = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, tableH - tableTopThickness, 0.05),
        legMat,
      );
      legS.position.set(
        lx,
        (tableH - tableTopThickness) / 2,
        centerZ + totalD / 2 - 0.06,
      );
      legS.castShadow = true;

      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.03, totalD - 0.08),
        legMat,
      );
      foot.position.set(lx, 0.015, centerZ);
      foot.castShadow = true;

      podGroup.add(legN, legS, foot);
    });

    // Papelera metálica de rejilla en el extremo exterior de la bancada
    if (podId === 1) {
      this.placeTrashcan(centerX - totalW / 2 - 0.18, 5.2);
    } else if (podId === 2) {
      this.placeTrashcan(centerX + totalW / 2 + 0.18, 5.2);
    }

    this.group.add(podGroup);

    // Equipamiento individual por puesto
    const slotCentersX =
      pairs === 2 ? [centerX - slotW / 2, centerX + slotW / 2] : [centerX];

    slotCentersX.forEach((sx, idx) => {
      const seatId = podId * 10 + idx * 2;

      // Puesto Norte (sentado al norte, mirando al sur)
      this.buildStationHardware({
        stationIndex: seatId,
        slotX: sx,
        centerZ: centerZ,
        isNorth: true,
        chairTone: idx % 2 === 0 ? "#22262E" : "#2A2F38",
      });

      // Puesto Sur (sentado al sur, mirando al norte)
      this.buildStationHardware({
        stationIndex: seatId + 1,
        slotX: sx,
        centerZ: centerZ,
        isNorth: false,
        chairTone: idx % 2 === 0 ? "#2A2F38" : "#22262E",
      });
    });
  }

  // --- POST-ITS / TARJETAS KANBAN EN EL FIELTRO CENTRAL ---
  createDividerKanbanNotes(
    parentGroup,
    centerX,
    dividerCenterY,
    centerZ,
    totalWidth,
  ) {
    const colors = ["#FBBF24", "#38BDF8", "#34D399", "#F472B6", "#FB923C"];
    const notesCount = Math.floor(totalWidth * 2.5);

    for (let i = 0; i < notesCount; i++) {
      const isNorthSide = i % 2 === 0;
      const xOffset = (Math.random() - 0.5) * (totalWidth - 0.2);
      const yOffset = (Math.random() - 0.5) * 0.18;
      const rotZ = (Math.random() - 0.5) * 0.12;

      const noteW = 0.055 + (i % 3) * 0.01;
      const noteH = 0.055 + (i % 2) * 0.015;

      const noteGeo = new THREE.PlaneGeometry(noteW, noteH);
      const noteMat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.8,
        side: THREE.DoubleSide,
      });

      const note = new THREE.Mesh(noteGeo, noteMat);
      const zPos = centerZ + (isNorthSide ? -0.0135 : 0.0135);

      note.position.set(centerX + xOffset, dividerCenterY + yOffset, zPos);
      note.rotation.z = rotZ;
      if (!isNorthSide) note.rotation.y = Math.PI;

      parentGroup.add(note);
    }
  }

  // --- HARDWARE, PERIFÉRICOS Y PAPELERÍA TÉCNICA POR PUESTO ---
  buildStationHardware({ stationIndex, slotX, centerZ, isNorth, chairTone }) {
    const tableY = 0.752;

    if (isNorth) {
      // === PUESTO NORTE (Usuario en Z < centerZ, mira al SUR +Z) ===

      // 1. Monitores duales cóncavos
      this.place(
        "monitor",
        { x: slotX - 0.28, y: 0.75, z: centerZ - 0.2 },
        { height: 0.44 },
        -0.26,
      );
      this.place(
        "monitor",
        { x: slotX + 0.28, y: 0.75, z: centerZ - 0.2 },
        { height: 0.44 },
        0.26,
      );

      // 2. Teclado
      this.place(
        "keyboard",
        { x: slotX, y: tableY, z: centerZ - 0.52 },
        { width: 0.36 },
        0,
      );

      // 3. Mousepad y Ratón a la derecha del usuario (-X)
      const pad = this.place(
        "mousepad",
        { x: slotX - 0.38, y: 0.751, z: centerZ - 0.52 },
        { width: 0.2 },
        0,
      );
      if (pad) {
        pad.traverse((c) => {
          if (c.isMesh && c.material) {
            c.material = c.material.clone();
            c.material.color.set("#161820");
            c.material.roughness = 0.85;
          }
        });
      }
      this.place(
        "mouse",
        { x: slotX - 0.38, y: 0.753, z: centerZ - 0.52 },
        { width: 0.08 },
        0,
      );

      // 4. Hidratación a la izquierda (+X): Taza de café o Botella térmica alternada
      if (stationIndex % 2 === 0) {
        this.place(
          "coffeeMug",
          { x: slotX + 0.44, y: tableY, z: centerZ - 0.48 },
          { maxDim: 0.1 },
        );
      } else {
        this.createThermalBottle(
          slotX + 0.44,
          tableY,
          centerZ - 0.48,
          stationIndex,
        );
      }

      // 5. Taco de Post-its entre el teclado y la taza
      if (stationIndex % 3 !== 0) {
        this.createPostItPad(
          slotX + 0.26,
          tableY,
          centerZ - 0.52,
          stationIndex % 2 === 0 ? "#FEF08A" : "#BAE6FD",
        );
      }

      // 6. Accesorio derecho detrás del ratón: Auriculares o Moleskine
      if (stationIndex % 3 === 1) {
        this.createHeadset(slotX - 0.55, tableY, centerZ - 0.38, 0.35);
      } else if (stationIndex % 3 === 2) {
        this.createNotebook(slotX - 0.55, tableY, centerZ - 0.38, -0.15, false);
      } else {
        this.createPencilCup(slotX + 0.56, tableY, centerZ - 0.36);
      }

      // 7. Torre PC y canaleta pasacables vertical
      this.createPcAndCableDrop(slotX + 0.52, centerZ - 0.35, true);

      // 8. Silla ergonómica
      const chair = this.place(
        "chair",
        { x: slotX, y: 0, z: centerZ - 0.94 },
        { height: 1.02 },
        0,
      );
      if (chair) {
        chair.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.set(chairTone);
            child.material.roughness = 0.52;
            child.material.metalness = 0.05;
          }
        });
      }
    } else {
      // === PUESTO SUR (Usuario en Z > centerZ, mira al NORTE -Z) ===

      // 1. Monitores duales cóncavos simétricos
      this.place(
        "monitor",
        { x: slotX - 0.28, y: 0.75, z: centerZ + 0.2 },
        { height: 0.44 },
        Math.PI + 0.26,
      );
      this.place(
        "monitor",
        { x: slotX + 0.28, y: 0.75, z: centerZ + 0.2 },
        { height: 0.44 },
        Math.PI - 0.26,
      );

      // 2. Teclado
      this.place(
        "keyboard",
        { x: slotX, y: tableY, z: centerZ + 0.52 },
        { width: 0.36 },
        Math.PI,
      );

      // 3. Mousepad y Ratón a la derecha del usuario (+X)
      const pad = this.place(
        "mousepad",
        { x: slotX + 0.38, y: 0.751, z: centerZ + 0.52 },
        { width: 0.2 },
        Math.PI,
      );
      if (pad) {
        pad.traverse((c) => {
          if (c.isMesh && c.material) {
            c.material = c.material.clone();
            c.material.color.set("#161820");
            c.material.roughness = 0.85;
          }
        });
      }
      this.place(
        "mouse",
        { x: slotX + 0.38, y: 0.753, z: centerZ + 0.52 },
        { width: 0.08 },
        Math.PI,
      );

      // 4. Hidratación a la izquierda (-X): Taza de café o Botella térmica alternada
      if (stationIndex % 2 === 1) {
        this.place(
          "coffeeMug",
          { x: slotX - 0.44, y: tableY, z: centerZ + 0.48 },
          { maxDim: 0.1 },
        );
      } else {
        this.createThermalBottle(
          slotX - 0.44,
          tableY,
          centerZ + 0.48,
          stationIndex,
        );
      }

      // 5. Taco de Post-its entre el teclado y la taza
      if (stationIndex % 3 !== 1) {
        this.createPostItPad(
          slotX - 0.26,
          tableY,
          centerZ + 0.52,
          stationIndex % 2 === 0 ? "#BAE6FD" : "#FEF08A",
        );
      }

      // 6. Accesorio derecho detrás del ratón: Auriculares o Moleskine
      if (stationIndex % 3 === 0) {
        this.createHeadset(slotX + 0.55, tableY, centerZ + 0.38, -0.25);
      } else if (stationIndex % 3 === 1) {
        this.createNotebook(slotX + 0.55, tableY, centerZ + 0.38, 0.2, true);
      } else {
        this.createPencilCup(slotX - 0.56, tableY, centerZ + 0.36);
      }

      // 7. Torre PC y canaleta pasacables vertical
      this.createPcAndCableDrop(slotX - 0.52, centerZ + 0.35, false);

      // 8. Silla ergonómica
      const chair = this.place(
        "chair",
        { x: slotX, y: 0, z: centerZ + 0.94 },
        { height: 1.02 },
        Math.PI,
      );
      if (chair) {
        chair.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.set(chairTone);
            child.material.roughness = 0.52;
            child.material.metalness = 0.05;
          }
        });
      }
    }
  }

  // --- ELEMENTOS DE PAPELERÍA Y ACCESORIOS PROCEDURALES ---
  createHeadset(x, y, z, rotY) {
    const headsetGroup = new THREE.Group();
    headsetGroup.position.set(x, y + 0.015, z);
    headsetGroup.rotation.y = rotY;

    const mat = new THREE.MeshStandardMaterial({
      color: "#181A20",
      roughness: 0.5,
      metalness: 0.3,
    });
    const cushionMat = new THREE.MeshStandardMaterial({
      color: "#0F1115",
      roughness: 0.85,
    });

    // Diadema curva apoyada plana en mesa
    const bandGeo = new THREE.TorusGeometry(0.075, 0.008, 12, 24, Math.PI);
    const band = new THREE.Mesh(bandGeo, mat);
    band.rotation.x = Math.PI / 2;
    headsetGroup.add(band);

    // Auricular Izquierdo
    const cupL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.024, 16),
      mat,
    );
    cupL.rotation.z = Math.PI / 2;
    cupL.position.set(-0.075, 0, 0);
    const padL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.01, 16),
      cushionMat,
    );
    padL.rotation.z = Math.PI / 2;
    padL.position.set(-0.065, 0, 0);
    headsetGroup.add(cupL, padL);

    // Auricular Derecho
    const cupR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.024, 16),
      mat,
    );
    cupR.rotation.z = Math.PI / 2;
    cupR.position.set(0.075, 0, 0);
    const padR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.01, 16),
      cushionMat,
    );
    padR.rotation.z = Math.PI / 2;
    padR.position.set(0.065, 0, 0);
    headsetGroup.add(cupR, padR);

    headsetGroup.traverse((c) => {
      if (c.isMesh) c.castShadow = true;
    });
    this.group.add(headsetGroup);
  }

  createNotebook(x, y, z, rotY, isOpen = false) {
    const bookGroup = new THREE.Group();
    bookGroup.position.set(x, y + 0.006, z);
    bookGroup.rotation.y = rotY;

    const coverMat = new THREE.MeshStandardMaterial({
      color: "#1E232B",
      roughness: 0.6,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: "#F8FAFC",
      roughness: 0.9,
    });

    if (isOpen) {
      const pageL = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.006, 0.19),
        paperMat,
      );
      pageL.position.set(-0.062, 0, 0);
      const pageR = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.006, 0.19),
        paperMat,
      );
      pageR.position.set(0.062, 0, 0);
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.002, 0.2),
        coverMat,
      );
      spine.position.set(0, -0.003, 0);
      bookGroup.add(pageL, pageR, spine);
    } else {
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.012, 0.21),
        coverMat,
      );
      const pages = new THREE.Mesh(
        new THREE.BoxGeometry(0.134, 0.009, 0.204),
        paperMat,
      );
      pages.position.set(0.003, 0, 0);
      bookGroup.add(cover, pages);
    }

    bookGroup.traverse((c) => {
      if (c.isMesh) c.castShadow = true;
    });
    this.group.add(bookGroup);
  }

  createPostItPad(x, y, z, colorHex) {
    const padMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.85,
    });
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.012, 0.075),
      padMat,
    );
    pad.position.set(x, y + 0.006, z);
    pad.castShadow = true;
    this.group.add(pad);
  }

  createPencilCup(x, y, z) {
    const cupGroup = new THREE.Group();
    cupGroup.position.set(x, y, z);

    const cupMat = new THREE.MeshStandardMaterial({
      color: "#1E293B",
      roughness: 0.35,
      metalness: 0.8,
    });
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.09, 16),
      cupMat,
    );
    cup.position.y = 0.045;
    cup.castShadow = true;
    cupGroup.add(cup);

    const penColors = ["#0284C7", "#EA580C", "#1E293B", "#16A34A"];
    for (let i = 0; i < 4; i++) {
      const penMat = new THREE.MeshStandardMaterial({
        color: penColors[i],
        roughness: 0.4,
      });
      const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.11, 8),
        penMat,
      );
      pen.position.set(
        (Math.random() - 0.5) * 0.03,
        0.07,
        (Math.random() - 0.5) * 0.03,
      );
      pen.rotation.set(
        (Math.random() - 0.5) * 0.25,
        0,
        (Math.random() - 0.5) * 0.25,
      );
      pen.castShadow = true;
      cupGroup.add(pen);
    }

    this.group.add(cupGroup);
  }

  createThermalBottle(x, y, z, seed) {
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(x, y, z);

    const colors = ["#0284C7", "#334155", "#475569", "#0D9488"];
    const color = colors[seed % colors.length];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.4,
      metalness: 0.2,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: "#0F172A",
      roughness: 0.3,
      metalness: 0.7,
    });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.17, 16),
      bodyMat,
    );
    body.position.y = 0.085;
    body.castShadow = true;

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, 0.025, 16),
      bodyMat,
    );
    neck.position.y = 0.18;
    neck.castShadow = true;

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.023, 0.023, 0.03, 16),
      capMat,
    );
    cap.position.y = 0.205;
    cap.castShadow = true;

    bottleGroup.add(body, neck, cap);
    this.group.add(bottleGroup);
  }

  createPcAndCableDrop(pcX, pcZ, isNorth) {
    // 1. Torre de PC en el suelo
    const pcMat = new THREE.MeshStandardMaterial({
      color: "#111317",
      roughness: 0.3,
      metalness: 0.85,
    });
    const pcCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.42, 0.42),
      pcMat,
    );
    pcCase.position.set(pcX, 0.21, pcZ);
    pcCase.castShadow = true;
    this.group.add(pcCase);

    // 2. Columna flexible pasacables (desde el tablero hasta la torre)
    const spineMat = new THREE.MeshStandardMaterial({
      color: "#181A22",
      roughness: 0.6,
    });
    const cableSpine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.32, 8),
      spineMat,
    );
    cableSpine.position.set(pcX + (isNorth ? -0.06 : 0.06), 0.58, pcZ);
    cableSpine.castShadow = true;
    this.group.add(cableSpine);
  }

  placeTrashcan(x, z) {
    const trash = this.place("trashcan", { x, y: 0, z }, { height: 0.38 });
    if (!trash) {
      const meshMat = new THREE.MeshStandardMaterial({
        color: "#1A1C23",
        roughness: 0.5,
        metalness: 0.7,
      });
      const fallbackTrash = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.11, 0.36, 16),
        meshMat,
      );
      fallbackTrash.position.set(x, 0.18, z);
      fallbackTrash.castShadow = true;
      this.group.add(fallbackTrash);
    }
  }

  // --- VEGETACIÓN EN COLUMNAS CIEGAS Y TRANSICIONES ---
  initVegetation() {
    // 1. Columna ciega 1 (Muro Oeste, entre Pod 3 y Pod 1)
    this.place("plantFiddleLeaf", { x: -11.45, y: 0, z: 3.2 }, { height: 1.5 });

    // 2. Columna ciega 2 (Muro Oeste, al sur de Pod 1)
    this.place("plantFlowerPot", { x: -11.45, y: 0, z: 7.2 }, { height: 1.15 });

    // 3. Esquina frontal libre suroeste
    this.place(
      "plantFiddleLeaf",
      { x: -11.45, y: 0, z: 8.4 },
      { height: 1.55 },
    );

    // 4. Cabecera este de la Isla Norte (suaviza la llegada al corredor vertical)
    this.place("plantFlowerPot", { x: -6.7, y: 0, z: 1.0 }, { height: 1.05 });
  }
}
