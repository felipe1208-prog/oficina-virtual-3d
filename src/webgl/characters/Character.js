import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

export class Character {
  constructor(experience, options = {}) {
    this.experience = experience;
    this.scene = experience.scene;
    this.resources = experience.resources;

    this.name = options.name || "Agent";
    this.color = options.color || "#0284C7";
    this.scale = options.scale || 1.08; // Escala exacta calibrada de AgentCharacter
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.rotationY = options.rotationY || 0;

    this.actions = {};
    this.currentAction = null;

    this.initModel();
    this.initAnimations(options.initialAnimation || "sittingIdle");
  }

  initModel() {
    const rawGltf = this.resources.get("character");
    if (!rawGltf) {
      console.warn(
        `[Character] No se encontró el recurso 'character' en resources.`,
      );
      return;
    }

    const sourceScene = rawGltf.scene ? rawGltf.scene : rawGltf;
    this.model = SkeletonUtils.clone(sourceScene);
    this.model.name = `character-${this.name}`;

    // Mapeo e indexación de huesos existentes
    this.existingNodeNames = new Set();
    this.model.traverse((child) => {
      if (child.name) {
        this.existingNodeNames.add(child.name);
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Evita que Three.js oculte la malla animada

        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set(this.color);
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      }
    });

    // Reparación de esqueleto (blindaje contra undefined en bones)
    this.model.traverse((child) => {
      if (child.isSkinnedMesh && child.skeleton) {
        const bones = child.skeleton.bones;
        for (let i = 0; i < bones.length; i++) {
          if (!bones[i]) {
            const fallbackBone =
              this.model.getObjectByProperty("isBone", true) ||
              new THREE.Bone();
            if (!fallbackBone.parent) {
              this.model.add(fallbackBone);
            }
            bones[i] = fallbackBone;
          }
        }
        child.skeleton.update();
      }
    });

    this.model.scale.setScalar(this.scale);
    this.model.position.set(this.position.x, this.position.y, this.position.z);
    this.model.rotation.y = this.rotationY;

    this.model.updateWorldMatrix(true, true);
    this.scene.add(this.model);
  }

  // Normaliza nombres de huesos de Mixamo y escala las posiciones de cm a metros
  retargetClip(clip, newName) {
    if (!clip) return null;
    const retargeted = clip.clone();
    retargeted.name = newName;

    retargeted.tracks = retargeted.tracks.filter((track) => {
      // Normalizar nombre de hueso eliminando prefijos de Mixamo
      track.name = track.name
        .replace(/.*mixamorig:?/i, "mixamorig")
        .replace(/^_*/, "");

      const targetNode = track.name.split(".")[0];
      return this.existingNodeNames.has(targetNode);
    });

    retargeted.tracks.forEach((track) => {
      if (track.name.endsWith(".position")) {
        let hasLargeValues = false;
        for (let i = 0; i < track.values.length; i++) {
          if (Math.abs(track.values[i]) > 5) {
            hasLargeValues = true;
            break;
          }
        }
        // Conversión de centímetros Mixamo a metros Three.js
        if (hasLargeValues) {
          for (let i = 0; i < track.values.length; i++) {
            track.values[i] *= 0.01;
          }
        }

        // Neutralizar desplazamiento horizontal de cadera (evita que se caiga de la silla)
        const x0 = track.values[0];
        const z0 = track.values[2];
        for (let i = 0; i < track.values.length; i += 3) {
          track.values[i] = x0;
          track.values[i + 2] = z0;
        }
      }
    });

    return retargeted;
  }

  initAnimations(defaultAnimName) {
    if (!this.model) return;

    this.mixer = new THREE.AnimationMixer(this.model);

    const animMap = {
      typing: "animTyping",
      sittingIdle: "animSittingIdle",
      walking: "animWalking",
      standingIdle: "animStandingIdle",
      sitToType: "animSitToType",
      typeToSit: "animTypeToSit",
      sitToStand: "animSitToStand",
      standToSit: "animStandToSit",
    };

    Object.entries(animMap).forEach(([key, resourceName]) => {
      const fbx = this.resources.get(resourceName);
      if (fbx && fbx.animations && fbx.animations.length > 0) {
        const processedClip = this.retargetClip(fbx.animations[0], key);
        if (processedClip) {
          this.actions[key] = this.mixer.clipAction(processedClip);
        }
      }
    });

    this.playAnimation(defaultAnimName);
  }

  playAnimation(name, duration = 0.25) {
    if (!this.actions[name]) {
      console.warn(
        `[Character] Animación '${name}' no disponible para ${this.name}`,
      );
      return;
    }

    const prevAction = this.currentAction;
    const nextAction = this.actions[name];

    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(duration);
    }

    nextAction.reset().fadeIn(duration).play();
    this.currentAction = nextAction;
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
