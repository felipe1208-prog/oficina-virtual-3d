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

    const DESK_HEIGHT = 0.75;

    // 1. Escritorio en L (orientación natural con ala a la izquierda)
    const deskRaw = this.resources.get("desk");
    if (deskRaw) {
      this.normalizeMaterials(deskRaw);
      const desk = fitModel(deskRaw, { height: DESK_HEIGHT });
      desk.rotation.y = Math.PI / 2;
      desk.position.set(0, 0, 0);
      desk.userData = { agentId: config.id, type: "desk" };
      stationGroup.add(desk);
    }

    // 2. Monitor (centrado al fondo frente a la silla)
    const monitorRaw = this.resources.get("monitor");
    if (monitorRaw) {
      this.normalizeMaterials(monitorRaw);
      const monitor = fitModel(monitorRaw, { height: 0.45 });
      monitor.rotation.y = 0;
      monitor.position.set(0, DESK_HEIGHT, -0.2);
      monitor.userData = { agentId: config.id, type: "screen" };
      stationGroup.add(monitor);
    }

    // 3. Teclado
    const keyboardRaw = this.resources.get("keyboard");
    if (keyboardRaw) {
      this.normalizeMaterials(keyboardRaw);
      const keyboard = fitModel(keyboardRaw, { width: 0.42 });
      keyboard.rotation.y = 0;
      keyboard.position.set(-0.04, DESK_HEIGHT + 0.002, 0.1);
      stationGroup.add(keyboard);
    }

    // 4. Mousepad y Mouse
    const mousepadRaw = this.resources.get("mousepad");
    if (mousepadRaw) {
      this.normalizeMaterials(mousepadRaw);
      const mousepad = fitModel(mousepadRaw, { width: 0.24 });
      mousepad.rotation.y = 0;
      mousepad.position.set(0.26, DESK_HEIGHT + 0.002, 0.1);
      stationGroup.add(mousepad);
    }

    const mouseRaw = this.resources.get("mouse");
    if (mouseRaw) {
      this.normalizeMaterials(mouseRaw);
      const mouse = fitModel(mouseRaw, { maxDim: 0.11 });
      mouse.rotation.y = 0;
      mouse.position.set(0.26, DESK_HEIGHT + 0.005, 0.1);
      stationGroup.add(mouse);
    }

    // 5. Silla de oficina (centrada en X = 0, orientada al monitor)
    const chairRaw = this.resources.get("chair");
    if (chairRaw) {
      this.normalizeMaterials(chairRaw);
      const chair = fitModel(chairRaw, { height: 0.95 });
      chair.rotation.y = -Math.PI / 2;
      chair.position.set(0, 0, 0.6);
      stationGroup.add(chair);
    }

    // 6. Personaje Animado Autónomo con AnimationMixer y FBX
    let agentCharacter = null;
    const characterMesh = this.resources.getSkinned("character");

    // Extraer clips de los archivos FBX
    const typingClips = this.resources.getAnimations("animTyping");
    const sitToTypeClips = this.resources.getAnimations("animSitToType");
    const typeToSitClips = this.resources.getAnimations("animTypeToSit");

    const rawClips = {
      typing: typingClips[0] || null,
      sitToType: sitToTypeClips[0] || null,
      typeToSit: typeToSitClips[0] || null,
    };

    if (characterMesh) {
      this.normalizeMaterials(characterMesh);
      agentCharacter = new AgentCharacter(config, characterMesh, rawClips);
      stationGroup.add(agentCharacter.model);
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

    return {
      group: stationGroup,
      character: agentCharacter,
    };
  }
}
