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
    // Escala estándar de proporción adulta para rig estilizado (1.50m)
    this.model.scale.setScalar(1.08);
    this.model.rotation.y = Math.PI;

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

  retargetClip(clip, newName) {
    if (!clip) return null;
    const retargeted = clip.clone();
    retargeted.name = newName;

    retargeted.tracks.forEach((track) => {
      track.name = track.name
        .replace(/.*mixamorig:?/i, "mixamorig")
        .replace(/^_*/, "");

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

    if (this.rawClips.typing) {
      const typingClip = this.retargetClip(this.rawClips.typing, "typing");
      const action = this.mixer.clipAction(typingClip);
      action.setLoop(THREE.LoopRepeat);
      action.timeScale = 0.95 + Math.random() * 0.12;
      this.actions.set("typing", action);
    }

    const startAction = this.actions.get("typing");
    if (startAction) {
      startAction.play();
      this.currentAction = startAction;
    }
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
