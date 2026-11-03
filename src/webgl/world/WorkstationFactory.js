import * as THREE from "three";
import { fitModel } from "../utils/modelUtils.js";

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

    const DESK_HEIGHT = 0.75; // Altura estándar del escritorio

    // 1. Escritorio (ancho 1.6m)
    const deskRaw = this.resources.get("desk");
    if (deskRaw) {
      this.normalizeMaterials(deskRaw);
      const desk = fitModel(deskRaw, { height: DESK_HEIGHT });
      stationGroup.add(desk);
    }

    // 2. Monitor (alto 0.45m) apoyado en el escritorio
    const monitorRaw = this.resources.get("monitor");
    if (monitorRaw) {
      this.normalizeMaterials(monitorRaw);
      const monitor = fitModel(monitorRaw, { height: 0.45 });
      monitor.position.set(0, DESK_HEIGHT, -0.25);
      stationGroup.add(monitor);
    }

    // 3. Mousepad (ancho 0.28m)
    const mousepadRaw = this.resources.get("mousepad");
    if (mousepadRaw) {
      this.normalizeMaterials(mousepadRaw);
      const mousepad = fitModel(mousepadRaw, { width: 0.28 });
      mousepad.position.set(0.35, DESK_HEIGHT + 0.002, 0.1);
      stationGroup.add(mousepad);
    }

    // 4. Mouse (largo 0.11m) apoyado sobre el mousepad
    const mouseRaw = this.resources.get("mouse");
    if (mouseRaw) {
      this.normalizeMaterials(mouseRaw);
      const mouse = fitModel(mouseRaw, { maxDim: 0.11 });
      mouse.position.set(0.35, DESK_HEIGHT + 0.005, 0.1);
      stationGroup.add(mouse);
    }

    // 5. Teclado (ancho 0.42m)
    const keyboardRaw = this.resources.get("keyboard");
    if (keyboardRaw) {
      this.normalizeMaterials(keyboardRaw);
      const keyboard = fitModel(keyboardRaw, { width: 0.42 });
      keyboard.position.set(0, DESK_HEIGHT + 0.002, 0.1);
      stationGroup.add(keyboard);
    }

    // 6. Silla de oficina (alto 0.95m)
    const chairRaw = this.resources.get("chair");
    if (chairRaw) {
      this.normalizeMaterials(chairRaw);
      const chair = fitModel(chairRaw, { height: 0.95 });
      chair.position.set(0, 0, 0.7);
      chair.rotation.y = Math.PI; // Orientada al escritorio
      stationGroup.add(chair);
    }

    // 7. Personaje del agente (alto 1.55m)
    const characterRaw = this.resources.get("character");
    if (characterRaw) {
      this.normalizeMaterials(characterRaw);
      const character = fitModel(characterRaw, { height: 1.55 });
      character.position.set(0, 0, 0.7);
      character.rotation.y = Math.PI;

      // Color de acento del rol en el torso
      character.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.9;
          if (
            child.name.toLowerCase().includes("body") ||
            child.name.toLowerCase().includes("shirt")
          ) {
            child.material.color.set(config.color);
          }
        }
      });

      stationGroup.add(character);
    }

    // 8. Marcador circular sutil en el piso
    const markerGeo = new THREE.RingGeometry(1.2, 1.25, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: config.color,
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.012;
    stationGroup.add(marker);

    return stationGroup;
  }
}
