import * as THREE from "three";

export class AgentCharacter {
  constructor(config, model, rawClips = {}, onStatusChange = null) {
    this.config = config;
    this.model = model;
    this.rawClips = rawClips;
    this.onStatusChange = onStatusChange;

    this.status = "WORKING"; // 'WORKING' | 'THINKING' | 'IDLE'
    this.mixer = null;
    this.actions = new Map();
    this.currentAction = null;

    // Temporizador desincronizado para alternancia autónoma
    this.stateTimer = 8 + Math.random() * 12;

    this.initModel();
    this.initAnimations();
  }

  initModel() {
    this.model.name = `character-${this.config.id}`;
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

    // 1. Clip de tecleo continuo
    if (this.rawClips.typing) {
      const clip = this.retargetClip(this.rawClips.typing, "typing");
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat);
      action.timeScale = 0.95 + Math.random() * 0.12;
      this.actions.set("typing", action);
    }

    // 2. Clip de reposo sentado
    if (this.rawClips.sittingIdle) {
      const clip = this.retargetClip(this.rawClips.sittingIdle, "sittingIdle");
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat);
      action.timeScale = 0.85 + Math.random() * 0.15;
      this.actions.set("sittingIdle", action);
    }

    // 3. Transición: Retirar manos de las teclas hacia el reposo
    if (this.rawClips.typeToSit) {
      const clip = this.retargetClip(this.rawClips.typeToSit, "typeToSit");
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      this.actions.set("typeToSit", action);
    }

    // 4. Transición: Posar manos desde el reposo sobre el teclado
    if (this.rawClips.sitToType) {
      const clip = this.retargetClip(this.rawClips.sitToType, "sitToType");
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      this.actions.set("sitToType", action);
    }

    // Listener para encadenar transiciones en cuanto finalicen
    this.mixer.addEventListener("finished", (e) => {
      if (e.action === this.actions.get("sitToType")) {
        this.playAction("typing", 0.2);
      } else if (e.action === this.actions.get("typeToSit")) {
        this.playAction("sittingIdle", 0.25);
      }
    });

    // Iniciar con tecleo
    this.playAction("typing", 0.1);
  }

  playAction(name, crossFadeDuration = 0.3) {
    const nextAction = this.actions.get(name);
    if (!nextAction) return;

    if (this.currentAction && this.currentAction !== nextAction) {
      this.currentAction.fadeOut(crossFadeDuration);
    }

    nextAction.reset().fadeIn(crossFadeDuration).play();
    this.currentAction = nextAction;
  }

  /**
   * Cambia de estado gestionando las transiciones intermedias
   */
  setStatus(newStatus) {
    if (this.status === newStatus) return;
    const prevStatus = this.status;
    this.status = newStatus;

    // Resetear temporizador aleatorio según el nuevo estado
    this.stateTimer =
      newStatus === "WORKING" ? 12 + Math.random() * 14 : 5 + Math.random() * 6;

    if (this.onStatusChange) {
      this.onStatusChange(this.config.id, newStatus);
    }

    if (newStatus === "WORKING") {
      if (this.actions.has("sitToType")) {
        this.playAction("sitToType", 0.25);
      } else {
        this.playAction("typing", 0.4);
      }
    } else {
      // THINKING o IDLE
      if (prevStatus === "WORKING" && this.actions.has("typeToSit")) {
        this.playAction("typeToSit", 0.25);
      } else {
        this.playAction("sittingIdle", 0.4);
      }
    }
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Alternancia de ciclo autónomo
    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      if (this.status === "WORKING") {
        const next = Math.random() > 0.45 ? "THINKING" : "IDLE";
        this.setStatus(next);
      } else {
        this.setStatus("WORKING");
      }
    }
  }
}
