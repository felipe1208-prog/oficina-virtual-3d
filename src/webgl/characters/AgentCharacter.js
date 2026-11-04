import * as THREE from "three";

export class AgentCharacter {
  constructor(config, model, rawClips = {}, onStatusChange = null) {
    this.config = config;
    this.model = model;
    this.rawClips = rawClips;
    this.onStatusChange = onStatusChange;

    // Alturas calibradas
    this.Y_SITTING = -0.02;
    this.Y_STANDING = -0.34;

    this.seatWorldPos = new THREE.Vector3();
    this.standWorldPos = new THREE.Vector3();
    this.seatWorldRotationY = 0;

    this.status = "WORKING";
    this.mixer = null;
    this.actions = new Map();
    this.currentAction = null;

    // Locomoción calibrada
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.walkSpeed = 0.55;
    this.roamTarget = null;
    this.breakTimer = 0;
    this.transitionTimer = 0;
    this.destinationProvider = null;

    // Sensor de evasión lateral
    this.sensorRange = 1.2;
    this.avoidanceForce = new THREE.Vector3();
    this.yieldTimer = 0;

    this.stateTimer = 16 + Math.random() * 12;
    this.roamCooldown = 50 + Math.random() * 30;

    this.initModel();
    this.initAnimations();
  }

  initModel() {
    this.model.name = `character-${this.config.id}`;
    this.model.scale.setScalar(1.08);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set(this.config.color);
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      }
    });
  }

  setSeatPosition(x, z, rotY = 0) {
    this.seatWorldPos.set(x, this.Y_SITTING, z);
    this.standWorldPos.set(x, this.Y_STANDING, z);
    this.seatWorldRotationY = rotY;

    this.model.position.copy(this.seatWorldPos);
    this.model.rotation.y = this.seatWorldRotationY;
    this.setStatus("WORKING");
  }

  setWalkingPosition(x, z, rotY = Math.PI / 2) {
    this.model.position.set(x, this.Y_STANDING, z);
    this.model.rotation.y = rotY;
    this.setStatus("WALKING");
    this.playAction("walking", 0.1);
  }

  setWorldAnchors(stationGroup) {
    stationGroup.updateMatrixWorld(true);
    this.seatWorldPos = stationGroup.localToWorld(
      new THREE.Vector3(-0.15, this.Y_SITTING, 0.46),
    );
    this.standWorldPos = stationGroup.localToWorld(
      new THREE.Vector3(-0.15, this.Y_STANDING, 0.46),
    );
    this.seatWorldRotationY = stationGroup.rotation.y + Math.PI;

    this.model.position.copy(this.seatWorldPos);
    this.model.rotation.y = this.seatWorldRotationY;
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

  initAnimations() {
    this.mixer = new THREE.AnimationMixer(this.model);

    const registerLoop = (key, name, speed = 1.0) => {
      if (!this.rawClips[key]) return;
      const clip = this.retargetClip(this.rawClips[key], name);
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat);
      action.timeScale = speed;
      this.actions.set(name, action);
    };

    const registerOnce = (key, name, speed = 1.0) => {
      if (!this.rawClips[key]) return;
      const clip = this.retargetClip(this.rawClips[key], name);
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.timeScale = speed;
      this.actions.set(name, action);
    };

    registerLoop("typing", "typing", 1.0);
    registerLoop("sittingIdle", "sittingIdle", 0.85);
    registerOnce("sitToType", "sitToType", 1.0);
    registerOnce("typeToSit", "typeToSit", 1.0);
    registerOnce("sitToStand", "sitToStand", 1.0);
    registerOnce("standToSit", "standToSit", 1.0);
    registerLoop("standingIdle", "standingIdle", 0.85);
    registerLoop("walking", "walking", 1.1);

    this.mixer.addEventListener("finished", (e) => {
      const finishedAction = e.action;
      if (finishedAction === this.actions.get("sitToType")) {
        this.playAction("typing", 0.2);
      } else if (finishedAction === this.actions.get("typeToSit")) {
        this.playAction("sittingIdle", 0.25);
      } else if (finishedAction === this.actions.get("sitToStand")) {
        this.onStoodUp();
      } else if (finishedAction === this.actions.get("standToSit")) {
        this.onSatDown();
      }
    });

    this.playAction("typing", 0.1);
  }

  playAction(name, crossFadeDuration = 0.22) {
    const nextAction = this.actions.get(name);
    if (!nextAction) return;

    if (this.currentAction && this.currentAction !== nextAction) {
      this.currentAction.fadeOut(crossFadeDuration);
    }

    nextAction.reset().fadeIn(crossFadeDuration).play();
    this.currentAction = nextAction;
  }

  setStatus(newStatus) {
    if (this.status === newStatus) return;
    const prevStatus = this.status;
    this.status = newStatus;

    if (this.onStatusChange) {
      this.onStatusChange(this.config.id, newStatus);
    }

    if (newStatus === "WORKING") {
      if (this.actions.has("sitToType")) {
        this.playAction("sitToType", 0.25);
      } else {
        this.playAction("typing", 0.35);
      }
    } else if (newStatus === "THINKING" || newStatus === "IDLE") {
      if (prevStatus === "WORKING" && this.actions.has("typeToSit")) {
        this.playAction("typeToSit", 0.25);
      } else {
        this.playAction("sittingIdle", 0.35);
      }
    }
  }

  onStoodUp() {
    this.setStatus("WALKING");
    this.playAction("walking", 0.22);
    this.model.position.copy(this.standWorldPos);
  }

  onSatDown() {
    this.model.position.copy(this.seatWorldPos);
    this.model.rotation.y = this.seatWorldRotationY;
    this.setStatus("WORKING");
  }

  update(delta, allCharacters = []) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
