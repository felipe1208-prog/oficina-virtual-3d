import * as THREE from "three";

export class AgentCharacter {
  constructor(config, model, rawClips = {}) {
    this.config = config;
    this.model = model;
    this.rawClips = rawClips;

    this.mixer = null;
    this.actions = new Map();
    this.currentAction = null;

    this.initModel();
    this.initAnimations();
  }

  initModel() {
    this.model.name = `character-${this.config.id}`;
    this.model.scale.setScalar(0.78);
    this.model.rotation.y = Math.PI; // Orientado de frente al monitor (-Z)
    // El mocap de Mixamo sitúa al personaje sentado apoyado en el suelo
    this.model.position.set(0, 0, 0.6);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set(this.config.color);
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      }
    });
  }

  /**
   * Adapta las pistas del FBX de Mixamo a la jerarquía de huesos del modelo GLTF
   */
  retargetClip(clip, newName) {
    if (!clip) return null;
    const retargeted = clip.clone();
    retargeted.name = newName;

    retargeted.tracks.forEach((track) => {
      // Normalizar nombres como "mixamorig:Hips" o "mixamorig_Hips" a "mixamorigHips"
      track.name = track.name
        .replace(/.*mixamorig:?/i, "mixamorig")
        .replace(/^_*/, "");

      // Ajustar escala centimétrica de Mixamo FBX a escala métrica GLTF
      if (track.name.endsWith(".position")) {
        let hasLargeValues = false;
        for (let i = 0; i < track.values.length; i++) {
          if (Math.abs(track.values[i]) > 5) {
            hasLargeValues = true;
            break;
          }
        }
        if (hasLargeValues) {
          for (let i = 0; i < track.values.length; i++) {
            track.values[i] *= 0.01;
          }
        }
      }
    });

    return retargeted;
  }

  initAnimations() {
    this.mixer = new THREE.AnimationMixer(this.model);

    // 1. Retargeting y registro de animación de tecleo
    if (this.rawClips.typing) {
      const typingClip = this.retargetClip(this.rawClips.typing, "typing");
      const action = this.mixer.clipAction(typingClip);
      action.setLoop(THREE.LoopRepeat);
      // Ligera variación de cadencia para que no escriban como robots sincronizados
      action.timeScale = 0.95 + Math.random() * 0.15;
      this.actions.set("typing", action);
    }

    // 2. Transiciones opcionales
    if (this.rawClips.sitToType) {
      const sitToTypeClip = this.retargetClip(
        this.rawClips.sitToType,
        "sitToType",
      );
      const action = this.mixer.clipAction(sitToTypeClip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      this.actions.set("sitToType", action);
    }

    // Reproducir ciclo continuo de trabajo
    const startAction = this.actions.get("typing");
    if (startAction) {
      startAction.play();
      this.currentAction = startAction;
    }
  }

  playAnimation(name, duration = 0.3) {
    const nextAction = this.actions.get(name);
    if (!nextAction || nextAction === this.currentAction) return;

    if (this.currentAction) {
      this.currentAction.fadeOut(duration);
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
