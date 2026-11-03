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

  /**
   * Articula los huesos de la cadera y rodillas con simetría espejada
   */
  applySittingPose(characterGroup) {
    characterGroup.traverse((child) => {
      if (child.isBone) {
        const name = child.name.toLowerCase();

        // Detección estricta de lateralidad (evita falsos positivos con la 'l' de 'leg')
        const isLeft =
          name.includes("left") ||
          name.endsWith(".l") ||
          name.endsWith("_l") ||
          name.includes("_l_") ||
          name.includes(".l.");

        const isRight =
          name.includes("right") ||
          name.endsWith(".r") ||
          name.endsWith("_r") ||
          name.includes("_r_") ||
          name.includes(".r.");

        // Muslo superior estricto
        const isUpperLeg =
          name.includes("thigh") ||
          name.includes("upleg") ||
          name.includes("upperleg");

        // Pierna inferior / rodilla / espinilla
        const isLowerLeg =
          name.includes("shin") ||
          name.includes("calf") ||
          name.includes("knee") ||
          name.includes("lowerleg") ||
          (name.includes("leg") && !isUpperLeg);

        // Ángulo de flexión (~80 grados)
        const bendAngle = Math.PI / 2.25;

        if (isUpperLeg) {
          // El muslo derecho flexiona en positivo; el izquierdo, por simetría de rig, en negativo
          const sign = isLeft ? -1 : 1;
          child.rotation.x = sign * bendAngle;
          child.rotation.y = 0;
          child.rotation.z = isLeft ? -0.04 : 0.04; // Separación natural de piernas
        } else if (isLowerLeg) {
          // La rodilla flexiona hacia abajo para dejar caer las pantorrillas al piso
          const sign = isLeft ? 1 : -1;
          child.rotation.x = sign * bendAngle;
          child.rotation.y = 0;
          child.rotation.z = 0;
        } else if (name.includes("spine") || name.includes("chest")) {
          // Ligera inclinación ergonómica del torso hacia el teclado (~4 grados)
          child.rotation.x = 0.07;
        }
      }
    });
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

    const DESK_HEIGHT = 0.75;

    // 1. Escritorio (ancho alineado a lo largo del eje X)
    const deskRaw = this.resources.get("desk");
    if (deskRaw) {
      this.normalizeMaterials(deskRaw);
      const desk = fitModel(deskRaw, { height: DESK_HEIGHT });
      desk.rotation.y = Math.PI / 2;
      desk.userData = { agentId: config.id, type: "desk" };
      stationGroup.add(desk);
    }

    // 2. Monitor (centrado al fondo del escritorio, pantalla orientada hacia el usuario en +Z)
    const monitorRaw = this.resources.get("monitor");
    if (monitorRaw) {
      this.normalizeMaterials(monitorRaw);
      const monitor = fitModel(monitorRaw, { height: 0.45 });
      monitor.rotation.y = -Math.PI / 2;
      monitor.position.set(0, DESK_HEIGHT, -0.22);
      monitor.userData = { agentId: config.id, type: "screen" };
      stationGroup.add(monitor);
    }

    // 3. Teclado (frente al monitor, teclas orientadas al usuario en +Z)
    const keyboardRaw = this.resources.get("keyboard");
    if (keyboardRaw) {
      this.normalizeMaterials(keyboardRaw);
      const keyboard = fitModel(keyboardRaw, { width: 0.42 });
      keyboard.rotation.y = -Math.PI / 2;
      keyboard.position.set(0, DESK_HEIGHT + 0.002, 0.08);
      stationGroup.add(keyboard);
    }

    // 4. Mousepad y Mouse (a la derecha del teclado)
    const mousepadRaw = this.resources.get("mousepad");
    if (mousepadRaw) {
      this.normalizeMaterials(mousepadRaw);
      const mousepad = fitModel(mousepadRaw, { width: 0.28 });
      mousepad.rotation.y = -Math.PI / 2;
      mousepad.position.set(0.35, DESK_HEIGHT + 0.002, 0.08);
      stationGroup.add(mousepad);
    }

    const mouseRaw = this.resources.get("mouse");
    if (mouseRaw) {
      this.normalizeMaterials(mouseRaw);
      const mouse = fitModel(mouseRaw, { maxDim: 0.11 });
      mouse.rotation.y = -Math.PI / 2;
      mouse.position.set(0.35, DESK_HEIGHT + 0.005, 0.08);
      stationGroup.add(mouse);
    }

    // 5. Silla de oficina (orientada hacia el escritorio en -Z, respaldo atrás en +Z)
    const chairRaw = this.resources.get("chair");
    if (chairRaw) {
      this.normalizeMaterials(chairRaw);
      const chair = fitModel(chairRaw, { height: 0.95 });
      chair.rotation.y = -Math.PI / 2;
      chair.position.set(0, 0, 0.52);
      stationGroup.add(chair);
    }

    // 6. Avatar del Agente (sentado sobre la silla, orientado de frente al monitor)
    const character = this.resources.getSkinned("character");
    if (character) {
      this.normalizeMaterials(character);
      character.scale.setScalar(0.78);

      // Orientar de frente al monitor (-Z) y posicionar sobre el asiento
      character.rotation.y = -Math.PI / 2;
      character.position.set(0, 0.4, 0.52);

      // Aplicar flexión de cadera y rodillas
      this.applySittingPose(character);

      // Asignar color de rol mate al personaje
      character.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color.set(config.color);
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      });

      stationGroup.add(character);
    }

    // 7. Anillo delimitador en el piso
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
