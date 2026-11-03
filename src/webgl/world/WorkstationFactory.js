import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";
import { AgentCharacter } from "../characters/AgentCharacter.js";

export class WorkstationFactory {
  constructor(resources) {
    this.resources = resources;
  }

  normalizeMaterials(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((mat) => {
            mat.flatShading = true;
            mat.roughness = 0.85;
            mat.metalness = 0.05;
            mat.needsUpdate = true;
          });
        }
      }
    });
    return model;
  }

  create(config) {
    const stationGroup = new THREE.Group();
    stationGroup.name = `station-${config.id}`;
    stationGroup.position.set(
      config.position.x,
      config.position.y,
      config.position.z,
    );
    stationGroup.rotation.y = config.rotation.y;
    stationGroup.userData = { agentId: config.id, config };

    const DESK_HEIGHT = 0.71;
    const WORK_X = -0.15;
    const SEAT_Z = 0.46;
    const MONITOR_Z = -0.32;

    // 1. Escritorio en L
    const deskRaw = this.resources.get("desk");
    if (deskRaw) {
      this.normalizeMaterials(deskRaw);
      const desk = fitModel(deskRaw, { height: DESK_HEIGHT });
      desk.rotation.y = -Math.PI / 2;
      desk.position.set(0, 0, 0);
      desk.userData = { agentId: config.id, type: "desk" };
      stationGroup.add(desk);
    }

    // 2. Configuración Dual Monitor Cóncava
    const monitorRaw = this.resources.get("monitor");
    if (monitorRaw) {
      const monitorLeft = fitModel(monitorRaw, { height: 0.44 });
      this.normalizeMaterials(monitorLeft);
      monitorLeft.rotation.y = Math.PI + 0.28;
      monitorLeft.position.set(WORK_X - 0.26, DESK_HEIGHT, MONITOR_Z);
      monitorLeft.userData = { agentId: config.id, type: "screen-left" };
      stationGroup.add(monitorLeft);

      const monitorRight = fitModel(this.resources.get("monitor"), {
        height: 0.44,
      });
      this.normalizeMaterials(monitorRight);
      monitorRight.rotation.y = Math.PI - 0.28;
      monitorRight.position.set(WORK_X + 0.26, DESK_HEIGHT, MONITOR_Z);
      monitorRight.userData = { agentId: config.id, type: "screen-right" };
      stationGroup.add(monitorRight);
    }

    // 3. Teclado
    const keyboardRaw = this.resources.get("keyboard");
    if (keyboardRaw) {
      this.normalizeMaterials(keyboardRaw);
      const keyboard = fitModel(keyboardRaw, { width: 0.38 });
      keyboard.rotation.y = 0;
      keyboard.position.set(WORK_X, DESK_HEIGHT + 0.003, -0.065);
      stationGroup.add(keyboard);
    }

    // 4. Mousepad y Mouse
    const mousepadRaw = this.resources.get("mousepad");
    if (mousepadRaw) {
      this.normalizeMaterials(mousepadRaw);
      const mousepad = fitModel(mousepadRaw, { width: 0.22 });
      mousepad.rotation.y = 0;
      mousepad.position.set(WORK_X + 0.32, DESK_HEIGHT + 0.005, 0.06);
      mousepad.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.color.set("#272E3E");
        }
      });
      stationGroup.add(mousepad);
    }

    const mouseRaw = this.resources.get("mouse");
    if (mouseRaw) {
      this.normalizeMaterials(mouseRaw);
      const mouse = fitModel(mouseRaw, { maxDim: 0.11 });
      mouse.rotation.y = Math.PI;
      mouse.position.set(WORK_X + 0.32, DESK_HEIGHT + 0.009, 0.06);
      stationGroup.add(mouse);
    }

    // 5. Silla de oficina
    const chairRaw = this.resources.get("chair");
    if (chairRaw) {
      this.normalizeMaterials(chairRaw);
      const chair = fitModel(chairRaw, { height: 0.9 });
      chair.rotation.y = Math.PI;
      chair.position.set(WORK_X, 0, SEAT_Z);
      stationGroup.add(chair);
    }

    // 6. Personaje Animado Autónomo
    let agentCharacter = null;
    const characterMesh = this.resources.getSkinned("character");

    const rawClips = {
      typing: this.resources.getAnimations("animTyping")[0] || null,
      sittingIdle: this.resources.getAnimations("animSittingIdle")[0] || null,
      sitToType: this.resources.getAnimations("animSitToType")[0] || null,
      typeToSit: this.resources.getAnimations("animTypeToSit")[0] || null,
      sitToStand: this.resources.getAnimations("animSitToStand")[0] || null,
      standToSit: this.resources.getAnimations("animStandToSit")[0] || null,
      standingIdle: this.resources.getAnimations("animStandingIdle")[0] || null,
      walking: this.resources.getAnimations("animWalking")[0] || null,
    };

    if (characterMesh) {
      this.normalizeMaterials(characterMesh);
      agentCharacter = new AgentCharacter(config, characterMesh, rawClips);
      agentCharacter.setWorldAnchors(stationGroup);
    }

    // 7. Anillo delimitador en el piso
    const markerGeo = new THREE.RingGeometry(1.2, 1.25, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: config.color,
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(WORK_X, 0.012, 0.16);
    stationGroup.add(marker);

    return {
      group: stationGroup,
      character: agentCharacter,
    };
  }
}
