import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

export class CoffeeArea {
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
    this.group.name = "zone-coffee-kitchen";

    // 1. Frente de Cocina y Encimera (Z: 4.45 a Z: 6.95)
    this.initMainCounter();
    this.initCounterAppliancesAndProps();

    // 2. Nevera Ejecutiva (Z: 7.00 a Z: 7.75)
    this.initRefrigerator();

    // 3. Estantes Flotantes en Pared
    this.initFloatingShelves();

    // 4. Estación de Agua y Papelera (Rotada 90°)
    this.initWaterStationAndTrash();

    // 5. Barra de Desayuno y Taburetes
    this.initBarIsland();
    this.initBarstools();

    // 6. Vegetación
    this.initPlants();

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

  // --- 1. MUEBLE DE COCINA Y GRIFO CORREGIDO ---
  initMainCounter() {
    const counterGroup = new THREE.Group();

    const wallFaceX = -1.86;
    const cWidth = 0.65;
    const cLength = 2.5;
    const cHeight = 0.9;
    const centerX = wallFaceX + cWidth / 2; // -1.535
    const centerZ = 5.7;

    // Base de armarios en nogal oscuro
    const woodMat = new THREE.MeshStandardMaterial({
      color: "#342217",
      roughness: 0.45,
      metalness: 0.04,
    });
    const baseCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(cWidth - 0.04, cHeight - 0.04, cLength),
      woodMat,
    );
    baseCabinet.position.set(centerX - 0.02, (cHeight - 0.04) / 2, centerZ);
    baseCabinet.castShadow = true;
    baseCabinet.receiveShadow = true;
    counterGroup.add(baseCabinet);

    // Rodapié rehundido
    const toeMat = new THREE.MeshStandardMaterial({
      color: "#14161C",
      roughness: 0.6,
    });
    const toekick = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, cLength - 0.06),
      toeMat,
    );
    toekick.position.set(centerX + cWidth / 2 - 0.05, 0.04, centerZ);
    counterGroup.add(toekick);

    // Encimera continua de cuarzo blanco satinado
    const topMat = new THREE.MeshStandardMaterial({
      color: "#F8FAFC",
      roughness: 0.22,
      metalness: 0.05,
    });
    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(cWidth, 0.04, cLength),
      topMat,
    );
    counterTop.position.set(centerX, cHeight - 0.02, centerZ);
    counterTop.castShadow = true;
    counterTop.receiveShadow = true;
    counterGroup.add(counterTop);

    // Fregadero de acero inoxidable encastrado (Z = 4.95)
    const sinkMat = new THREE.MeshStandardMaterial({
      color: "#CBD5E1",
      roughness: 0.28,
      metalness: 0.85,
    });
    const sinkBasin = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.005, 0.52),
      sinkMat,
    );
    sinkBasin.position.set(centerX + 0.02, cHeight + 0.001, 4.95);
    counterGroup.add(sinkBasin);

    // Grifo monomando de cuello de cisne elegante (curvado hacia el interior del seno en +X)
    const tapMat = new THREE.MeshStandardMaterial({
      color: "#E2E8F0",
      roughness: 0.15,
      metalness: 0.95,
    });

    const faucetX = centerX - 0.15;
    const faucetZ = 4.95;

    // Base cilíndrica del grifo
    const baseRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.025, 0.03, 16),
      tapMat,
    );
    baseRing.position.set(faucetX, cHeight + 0.015, faucetZ);
    baseRing.castShadow = true;

    // Tubo arqueado fluido continuo en +X
    const faucetCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(faucetX, cHeight + 0.02, faucetZ),
      new THREE.Vector3(faucetX, cHeight + 0.22, faucetZ),
      new THREE.Vector3(faucetX + 0.03, cHeight + 0.32, faucetZ),
      new THREE.Vector3(faucetX + 0.13, cHeight + 0.31, faucetZ),
      new THREE.Vector3(faucetX + 0.16, cHeight + 0.22, faucetZ),
    ]);
    const faucetGeo = new THREE.TubeGeometry(faucetCurve, 24, 0.011, 12, false);
    const faucetMesh = new THREE.Mesh(faucetGeo, tapMat);
    faucetMesh.castShadow = true;

    // Boquilla / Aireador vertical
    const aerator = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.025, 12),
      tapMat,
    );
    aerator.position.set(faucetX + 0.16, cHeight + 0.21, faucetZ);
    aerator.castShadow = true;

    // Maneta monomando lateral
    const leverBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.02, 12),
      tapMat,
    );
    leverBase.rotation.x = Math.PI / 2;
    leverBase.position.set(faucetX, cHeight + 0.08, faucetZ + 0.025);

    const leverHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.07, 8),
      tapMat,
    );
    leverHandle.rotation.z = -0.45;
    leverHandle.position.set(faucetX + 0.02, cHeight + 0.11, faucetZ + 0.032);
    leverHandle.castShadow = true;

    counterGroup.add(baseRing, faucetMesh, aerator, leverBase, leverHandle);
    this.group.add(counterGroup);
  }

  // --- 2. ELECTRODOMÉSTICOS Y DETALLES SOBRE ENCIMERA ---
  initCounterAppliancesAndProps() {
    const tableY = 0.9;
    const cX = -1.535;

    // Cafetera 1: Máquina de filtro con jarra (Z = 5.75, mirando al Este +X)
    const coffee1 = this.place(
      "coffeeMachine",
      { x: cX, y: tableY, z: 5.75 },
      { height: 0.42 },
      Math.PI / 2,
    );
    if (!coffee1) {
      this.createProceduralDripMaker(cX, tableY, 5.75);
    }

    // Cafetera 2: Estación Espresso Barista orientada hacia el frente (+X)
    const coffee2 =
      this.place(
        "coffeeMachine2",
        { x: cX, y: tableY, z: 6.45 },
        { height: 0.44 },
        0,
      ) ||
      this.place(
        "coffee-machine-2",
        { x: cX, y: tableY, z: 6.45 },
        { height: 0.44 },
        0,
      ) ||
      this.place(
        "espressoMachine",
        { x: cX, y: tableY, z: 6.45 },
        { height: 0.44 },
        0,
      );

    if (!coffee2) {
      this.createProceduralEspressoBar(cX, tableY, 6.45);
    }

    // Tazas de café sobre la encimera
    this.place(
      "coffeeMug",
      { x: cX + 0.12, y: tableY, z: 5.42 },
      { maxDim: 0.1 },
    );
    this.place(
      "coffeeMug",
      { x: cX + 0.1, y: tableY, z: 6.1 },
      { maxDim: 0.1 },
    );

    // Botellas de sirope gourmet
    const syrupColors = ["#B45309", "#78350F", "#D97706"];
    syrupColors.forEach((col, i) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(cX - 0.16, tableY, 6.72 + i * 0.07);

      const bMat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85,
      });
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.024, 0.18, 16),
        bMat,
      );
      bottle.position.y = 0.09;
      bottle.castShadow = true;

      const spoutMat = new THREE.MeshStandardMaterial({
        color: "#CBD5E1",
        metalness: 0.9,
        roughness: 0.2,
      });
      const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.008, 0.05, 8),
        spoutMat,
      );
      spout.position.y = 0.2;
      spout.castShadow = true;

      bGroup.add(bottle, spout);
      this.group.add(bGroup);
    });

    // Dispensador de jabón junto al fregadero
    const soapMat = new THREE.MeshStandardMaterial({
      color: "#E0E7FF",
      roughness: 0.2,
      metalness: 0.6,
    });
    const soap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.12, 16),
      soapMat,
    );
    soap.position.set(cX - 0.15, tableY + 0.06, 4.65);
    soap.castShadow = true;
    this.group.add(soap);
  }

  // --- 3. NEVERA (Z = 7.38) ---
  initRefrigerator() {
    const fridgeX = -1.535;
    const fridgeZ = 7.38;

    const fridge =
      this.place(
        "fridge",
        { x: fridgeX, y: 0.0, z: fridgeZ },
        { height: 1.55, depth: 0.62 },
        Math.PI / 2,
      ) ||
      this.place(
        "kitchenFridge",
        { x: fridgeX, y: 0.0, z: fridgeZ },
        { height: 1.55, depth: 0.62 },
        Math.PI / 2,
      );

    if (!fridge) {
      const fridgeGroup = new THREE.Group();
      fridgeGroup.position.set(fridgeX, 0.0, fridgeZ);

      const steelMat = new THREE.MeshStandardMaterial({
        color: "#282C35",
        roughness: 0.35,
        metalness: 0.8,
      });
      const chromeMat = new THREE.MeshStandardMaterial({
        color: "#E2E8F0",
        roughness: 0.2,
        metalness: 0.95,
      });

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 1.55, 0.68),
        steelMat,
      );
      body.position.y = 0.775;
      body.castShadow = true;
      body.receiveShadow = true;
      fridgeGroup.add(body);

      const doorTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.52, 0.66),
        steelMat,
      );
      doorTop.position.set(0.31, 1.25, 0);
      doorTop.castShadow = true;

      const doorBottom = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.94, 0.66),
        steelMat,
      );
      doorBottom.position.set(0.31, 0.49, 0);
      doorBottom.castShadow = true;

      const handleTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.32, 12),
        chromeMat,
      );
      handleTop.position.set(0.33, 1.15, -0.26);
      handleTop.castShadow = true;

      const handleBottom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.55, 12),
        chromeMat,
      );
      handleBottom.position.set(0.33, 0.65, -0.26);
      handleBottom.castShadow = true;

      fridgeGroup.add(doorTop, doorBottom, handleTop, handleBottom);
      this.group.add(fridgeGroup);
    }
  }

  // --- 4. ESTANTES FLOTANTES EN PARED ---
  initFloatingShelves() {
    const wallX = -1.86;
    const shelfMat = new THREE.MeshStandardMaterial({
      color: "#442817",
      roughness: 0.42,
    });

    const sLength = 2.1;
    const sDepth = 0.22;
    const sThick = 0.032;
    const sX = wallX + sDepth / 2;
    const sZ = 5.7;

    [1.35, 1.68].forEach((yPos, shelfIdx) => {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(sDepth, sThick, sLength),
        shelfMat,
      );
      shelf.position.set(sX, yPos, sZ);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      this.group.add(shelf);

      for (let i = 0; i < 5; i++) {
        const itemZ = sZ - sLength / 2 + 0.22 + i * 0.42;

        if (shelfIdx === 1 && i % 2 === 0) {
          const jarGroup = new THREE.Group();
          jarGroup.position.set(sX, yPos + sThick / 2, itemZ);

          const glassMat = new THREE.MeshPhysicalMaterial({
            color: "#FFFFFF",
            transmission: 0.88,
            roughness: 0.1,
          });
          const jar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 0.12, 16),
            glassMat,
          );
          jar.position.y = 0.06;

          const lid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.048, 0.048, 0.02, 16),
            new THREE.MeshStandardMaterial({
              color: "#D97706",
              roughness: 0.5,
            }),
          );
          lid.position.y = 0.13;

          const beans = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.09, 16),
            new THREE.MeshStandardMaterial({
              color: "#3E2415",
              roughness: 0.9,
            }),
          );
          beans.position.y = 0.05;

          jarGroup.add(jar, lid, beans);
          this.group.add(jarGroup);
        } else {
          this.place(
            "coffeeMug",
            { x: sX, y: yPos + sThick / 2 + 0.002, z: itemZ },
            { maxDim: 0.09 },
          );
        }
      }
    });
  }

  // --- 5. ESTACIÓN DE AGUA Y PAPELERA (ROTADA 90°) ---
  initWaterStationAndTrash() {
    const cooler = this.place(
      "waterCooler",
      { x: -1.55, y: 0.0, z: 4.0 },
      { height: 1.4 },
      0,
    );
    if (!cooler) {
      const coolerGroup = new THREE.Group();
      coolerGroup.position.set(-1.55, 0, 4.0);

      const bodyMat = new THREE.MeshStandardMaterial({
        color: "#F8FAFC",
        roughness: 0.35,
      });
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.95, 0.36),
        bodyMat,
      );
      body.position.y = 0.475;
      body.castShadow = true;

      const recessMat = new THREE.MeshStandardMaterial({
        color: "#CBD5E1",
        roughness: 0.5,
      });
      const recess = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.26, 0.22),
        recessMat,
      );
      recess.position.set(0.17, 0.65, 0);

      const btnRed = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.04, 0.03),
        new THREE.MeshStandardMaterial({ color: "#EF4444" }),
      );
      btnRed.position.set(0.18, 0.72, -0.04);

      const btnBlue = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.04, 0.03),
        new THREE.MeshStandardMaterial({ color: "#3B82F6" }),
      );
      btnBlue.position.set(0.18, 0.72, 0.04);

      const jugMat = new THREE.MeshPhysicalMaterial({
        color: "#0284C7",
        transmission: 0.75,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const jug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.38, 16),
        jugMat,
      );
      jug.position.y = 1.15;
      jug.castShadow = true;

      coolerGroup.add(body, recess, btnRed, btnBlue, jug);
      this.group.add(coolerGroup);
    }

    // Papelera rotada 90° (Math.PI / 2) alineada en paralelo al tabique
    const trash = this.place(
      "trashcan",
      { x: -1.55, y: 0.0, z: 3.45 },
      { height: 0.42 },
      Math.PI / 2,
    );
    if (!trash) {
      const meshMat = new THREE.MeshStandardMaterial({
        color: "#1A1C23",
        roughness: 0.5,
        metalness: 0.7,
      });
      const fallbackTrash = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.38, 0.36),
        meshMat,
      );
      fallbackTrash.position.set(-1.55, 0.19, 3.45);
      fallbackTrash.castShadow = true;
      this.group.add(fallbackTrash);
    }
  }

  // --- 6. BARRA DE CAFETERÍA ---
  initBarIsland() {
    const barGroup = new THREE.Group();

    const barW = 0.72;
    const barL = 2.6;
    const barH = 1.05;
    const barX = 0.15;
    const barZ = 6.0;

    const woodMat = new THREE.MeshStandardMaterial({
      color: "#2C1B12",
      roughness: 0.45,
    });
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(barW - 0.15, barH - 0.05, barL),
      woodMat,
    );
    baseMesh.position.set(barX - 0.075, (barH - 0.05) / 2, barZ);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    barGroup.add(baseMesh);

    const topMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      roughness: 0.2,
      metalness: 0.05,
    });
    const barTop = new THREE.Mesh(
      new THREE.BoxGeometry(barW, 0.05, barL),
      topMat,
    );
    barTop.position.set(barX, barH - 0.025, barZ);
    barTop.castShadow = true;
    barTop.receiveShadow = true;
    barGroup.add(barTop);

    this.group.add(barGroup);

    this.place("waterGlass", { x: barX, y: barH, z: 5.4 }, { maxDim: 0.1 });
    this.place(
      "waterGlass",
      { x: barX - 0.08, y: barH, z: 6.55 },
      { maxDim: 0.1 },
    );
    this.place(
      "sodaCan",
      { x: barX + 0.08, y: barH, z: 6.1 },
      { maxDim: 0.11 },
    );

    const bowlMat = new THREE.MeshStandardMaterial({
      color: "#E2E8F0",
      roughness: 0.2,
      metalness: 0.3,
    });
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.06, 0.06, 16),
      bowlMat,
    );
    bowl.position.set(barX, barH + 0.03, barZ);
    bowl.castShadow = true;
    this.group.add(bowl);
  }

  // --- 7. TABURETES ALTOS ---
  initBarstools() {
    const stoolZPositions = [5.05, 5.7, 6.35, 7.0];
    const stoolX = 0.78;
    const seatH = 0.75;

    stoolZPositions.forEach((zPos, i) => {
      const stoolGroup = new THREE.Group();
      const rotY = -Math.PI / 2 + (i % 2 === 0 ? 0.08 : -0.08);
      stoolGroup.position.set(stoolX, 0, zPos);
      stoolGroup.rotation.y = rotY;

      const legMat = new THREE.MeshStandardMaterial({
        color: "#14161C",
        roughness: 0.4,
        metalness: 0.85,
      });
      const legGeo = new THREE.CylinderGeometry(0.014, 0.016, seatH, 8);

      const legOffsets = [
        { x: -0.14, z: -0.14 },
        { x: 0.14, z: -0.14 },
        { x: -0.14, z: 0.14 },
        { x: 0.14, z: 0.14 },
      ];
      legOffsets.forEach((off) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(off.x, seatH / 2, off.z);
        leg.castShadow = true;
        stoolGroup.add(leg);
      });

      const ringGeo = new THREE.TorusGeometry(0.16, 0.01, 8, 16);
      const ring = new THREE.Mesh(ringGeo, legMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.24;
      stoolGroup.add(ring);

      const seatMat = new THREE.MeshStandardMaterial({
        color: "#6A3D1E",
        roughness: 0.45,
      });
      const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.17, 0.045, 24),
        seatMat,
      );
      seat.position.y = seatH + 0.022;
      seat.castShadow = true;
      stoolGroup.add(seat);

      this.group.add(stoolGroup);
    });
  }

  // --- 8. VEGETACIÓN ---
  initPlants() {
    this.place("plantFiddleLeaf", { x: 0.4, y: 0.0, z: 7.75 }, { height: 1.5 });
    this.place(
      "plantFlowerPot",
      { x: -1.86, y: 0.0, z: 3.1 },
      { height: 0.95 },
    );
  }

  createProceduralDripMaker(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = Math.PI / 2;

    const mMat = new THREE.MeshStandardMaterial({
      color: "#1E222A",
      roughness: 0.35,
      metalness: 0.8,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.26), mMat);
    base.position.y = 0.19;
    base.castShadow = true;

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.16, 16),
      new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        transmission: 0.9,
        roughness: 0.1,
      }),
    );
    glass.position.set(0.05, 0.12, 0);

    group.add(base, glass);
    this.group.add(group);
  }

  createProceduralEspressoBar(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = 0;

    const widthZ = 0.38;
    const depthX = 0.32;
    const heightY = 0.38;

    const chromeMat = new THREE.MeshStandardMaterial({
      color: "#E2E8F0",
      roughness: 0.18,
      metalness: 0.92,
    });
    const bodyMat = new THREE.MeshStandardMaterial({
      color: "#1E232A",
      roughness: 0.45,
      metalness: 0.6,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#FFFFFF",
      transmission: 0.85,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const beanMat = new THREE.MeshStandardMaterial({
      color: "#3A2012",
      roughness: 0.85,
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(depthX, heightY, widthZ),
      bodyMat,
    );
    body.position.set(0, heightY / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const frontFaceX = depthX / 2 + 0.005;
    const frontPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, heightY * 0.55, widthZ - 0.04),
      chromeMat,
    );
    frontPanel.position.set(frontFaceX, heightY * 0.65, 0);
    group.add(frontPanel);

    const dripTray = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.03, widthZ - 0.02),
      chromeMat,
    );
    dripTray.position.set(frontFaceX + 0.045, 0.015, 0);
    dripTray.castShadow = true;
    group.add(dripTray);

    const groupZOffsets = [-0.08, 0.08];
    groupZOffsets.forEach((gz) => {
      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.026, 0.06, 16),
        chromeMat,
      );
      head.position.set(frontFaceX + 0.03, heightY * 0.52, gz);
      head.castShadow = true;

      const portafilter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.03, 16),
        chromeMat,
      );
      portafilter.position.set(frontFaceX + 0.03, heightY * 0.47, gz);

      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.009, 0.1, 12),
        bodyMat,
      );
      handle.rotation.z = Math.PI / 2;
      handle.position.set(frontFaceX + 0.09, heightY * 0.47, gz);
      handle.castShadow = true;

      group.add(head, portafilter, handle);
    });
    [-0.03, 0.03].forEach((gz) => {
      const gauge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.006, 16),
        chromeMat,
      );
      gauge.rotation.z = Math.PI / 2;
      gauge.position.set(frontFaceX + 0.008, heightY * 0.78, gz);
      group.add(gauge);
    });

    const wand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.14, 8),
      chromeMat,
    );
    wand.rotation.z = -0.35;
    wand.position.set(frontFaceX + 0.04, heightY * 0.42, 0.14);
    group.add(wand);

    const hopper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.05, 0.12, 16),
      glassMat,
    );
    hopper.position.set(-0.04, heightY + 0.06, -0.07);
    hopper.castShadow = true;

    const beans = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.045, 0.09, 16),
      beanMat,
    );
    beans.position.set(-0.04, heightY + 0.05, -0.07);

    const hopperLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.068, 0.015, 16),
      chromeMat,
    );
    hopperLid.position.set(-0.04, heightY + 0.125, -0.07);

    group.add(hopper, beans, hopperLid);
    [-0.02, 0.06].forEach((tz) => {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.015, 0.035, 12),
        new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.3 }),
      );
      cup.position.set(0.04, heightY + 0.018, tz);
      cup.castShadow = true;
      group.add(cup);
    });

    this.group.add(group);
  }
}
