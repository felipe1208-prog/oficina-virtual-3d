import * as THREE from "three";

export class WorkstationFactory {
  constructor(resources) {
    this.resources = resources;
  }

  /**
   * Limpia materiales de terceros forzando sombreado plano mate y sombras
   */
  normalizeMaterials(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          // Si el mesh tiene múltiples materiales
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
   * Ensambla una estación de trabajo completa para un agente
   */
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

    // 1. Escritorio (Base)
    const desk = this.resources.get("desk");
    if (desk) {
      this.normalizeMaterials(desk);
      desk.scale.setScalar(1.0);
      stationGroup.add(desk);
    }

    // 2. Monitor sobre el escritorio
    const monitor = this.resources.get("monitor");
    if (monitor) {
      this.normalizeMaterials(monitor);
      monitor.position.set(0, 0.75, -0.2);
      monitor.scale.setScalar(0.9);
      stationGroup.add(monitor);
    }

    // 3. Teclado
    const keyboard = this.resources.get("keyboard");
    if (keyboard) {
      this.normalizeMaterials(keyboard);
      keyboard.position.set(0, 0.76, 0.1);
      keyboard.scale.setScalar(0.8);
      stationGroup.add(keyboard);
    }

    // 4. Mousepad y Mouse
    const mousepad = this.resources.get("mousepad");
    if (mousepad) {
      this.normalizeMaterials(mousepad);
      mousepad.position.set(0.35, 0.755, 0.1);
      mousepad.scale.setScalar(0.7);
      stationGroup.add(mousepad);
    }

    const mouse = this.resources.get("mouse");
    if (mouse) {
      this.normalizeMaterials(mouse);
      mouse.position.set(0.35, 0.76, 0.1);
      mouse.scale.setScalar(0.7);
      stationGroup.add(mouse);
    }

    // 5. Silla de oficina
    const chair = this.resources.get("chair");
    if (chair) {
      this.normalizeMaterials(chair);
      chair.position.set(0, 0, 0.6);
      chair.rotation.y = Math.PI; // Mirando al escritorio
      chair.scale.setScalar(0.9);
      stationGroup.add(chair);
    }

    // 6. Personaje del agente (J-Toastie)
    const character = this.resources.get("character");
    if (character) {
      this.normalizeMaterials(character);
      character.position.set(0, 0.42, 0.55);
      character.rotation.y = Math.PI;
      character.scale.setScalar(0.85);

      // Color identificador del área en el torso/ropa (mate sobrio)
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

    // 7. Base de acento sobria en el suelo (indica el área del agente)
    const markerGeo = new THREE.RingGeometry(1.3, 1.35, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: config.color,
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.015;
    stationGroup.add(marker);

    return stationGroup;
  }
}
