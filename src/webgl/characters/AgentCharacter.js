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
    this.seatWorldRotationY = Math.PI;

    this.status = "WORKING";
    this.mixer = null;
    this.actions = new Map();
    this.currentAction = null;

    // Locomoción calibrada (+25% de velocidad adicional)
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.walkSpeed = 0.55; // Incrementada 25% (0.44 * 1.25)
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
        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set(this.config.color);
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      }
    });
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

        // Neutralizar desplazamiento horizontal de raíz
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
    registerLoop("walking", "walking", 1.1); // Cadencia sincronizada con 0.55 m/s

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

  startRoam(targetWorldPos, targetLabel = "Dispensador") {
    if (
      this.status.startsWith("LEAVING") ||
      this.status.startsWith("WALK") ||
      this.status === "BREAK" ||
      this.status === "RETURNING" ||
      this.status === "SITTING_DOWN"
    ) {
      return;
    }

    this.roamTarget = { worldPos: targetWorldPos, label: targetLabel };
    this.setStatus("LEAVING_DESK");
    this.transitionTimer = 0;
    this.playAction("sitToStand", 0.25);
  }

  onStoodUp() {
    this.setStatus("WALKING");
    this.playAction("walking", 0.22);
    this.model.position.copy(this.standWorldPos);

    if (this.routeGenerator) {
      this.waypoints = this.routeGenerator(
        this.config.id,
        this.roamTarget.worldPos,
      );
      this.currentWaypointIndex = 0;
    }
  }

  onSatDown() {
    this.model.position.copy(this.seatWorldPos);
    this.model.rotation.y = this.seatWorldRotationY;
    this.setStatus("WORKING");
  }

  getWorldPosition() {
    return this.model.position.clone();
  }

  updateProximitySensor(allCharacters) {
    this.avoidanceForce.set(0, 0, 0);
    if (this.status !== "WALKING" && this.status !== "RETURNING") return;

    const myPos = this.model.position;
    const myForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.model.rotation.y,
    );

    for (const other of allCharacters) {
      if (other === this) continue;
      const otherPos = other.model.position;
      const toOther = new THREE.Vector3().subVectors(otherPos, myPos);
      toOther.y = 0;
      const dist = toOther.length();

      if (dist < this.sensorRange) {
        toOther.normalize();
        const dot = myForward.dot(toOther);

        if (dot > 0.35) {
          const lateral = new THREE.Vector3(-myForward.z, 0, myForward.x);
          const side = toOther.dot(lateral) > 0 ? -1 : 1;
          const weight = (this.sensorRange - dist) / this.sensorRange;

          this.avoidanceForce.addScaledVector(lateral, side * weight * 1.5);

          if (dist < 0.45 && this.config.id > other.config.id) {
            this.yieldTimer = 0.3;
          }
        }
      }
    }
  }

  update(delta, allCharacters = []) {
    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.updateProximitySensor(allCharacters);

    if (this.yieldTimer > 0) {
      this.yieldTimer -= delta;
      if (this.currentAction !== this.actions.get("standingIdle")) {
        this.playAction("standingIdle", 0.2);
      }
      return;
    }

    if (this.status === "LEAVING_DESK") {
      this.transitionTimer += delta;
      const dur = this.actions.get("sitToStand")?.getClip().duration || 1.8;
      const t = Math.min(this.transitionTimer / (dur * 0.85), 1.0);
      this.model.position.y = THREE.MathUtils.lerp(
        this.Y_SITTING,
        this.Y_STANDING,
        t,
      );
    } else if (this.status === "SITTING_DOWN") {
      this.transitionTimer += delta;
      const dur = this.actions.get("standToSit")?.getClip().duration || 1.8;
      const t = Math.min(this.transitionTimer / (dur * 0.85), 1.0);
      this.model.position.y = THREE.MathUtils.lerp(
        this.Y_STANDING,
        this.Y_SITTING,
        t,
      );
    } else if (this.status === "WALKING" || this.status === "RETURNING") {
      this.model.position.y = this.Y_STANDING;
      this.navigateAlongPath(delta);
    } else if (this.status === "BREAK") {
      this.model.position.y = this.Y_STANDING;
      this.breakTimer -= delta;
      if (this.breakTimer <= 0) {
        this.startReturnToSeat();
      }
    } else if (
      this.status === "WORKING" ||
      this.status === "THINKING" ||
      this.status === "IDLE"
    ) {
      this.model.position.y = this.Y_SITTING;
      this.stateTimer -= delta;
      this.roamCooldown -= delta;

      if (this.roamCooldown <= 0 && this.destinationProvider) {
        this.roamCooldown = 55 + Math.random() * 35;
        const dest = this.destinationProvider();
        if (dest) this.startRoam(dest.position, dest.name);
      } else if (this.stateTimer <= 0) {
        this.stateTimer =
          this.status === "WORKING"
            ? 12 + Math.random() * 12
            : 5 + Math.random() * 6;
        this.setStatus(
          this.status === "WORKING"
            ? Math.random() > 0.5
              ? "THINKING"
              : "IDLE"
            : "WORKING",
        );
      }
    }
  }

  navigateAlongPath(delta) {
    if (this.currentWaypointIndex >= this.waypoints.length) {
      if (this.status === "WALKING") {
        this.setStatus("BREAK");
        this.playAction("standingIdle", 0.3);
        this.breakTimer = 6 + Math.random() * 4;
      } else if (this.status === "RETURNING") {
        this.setStatus("SITTING_DOWN");
        this.transitionTimer = 0;
        this.model.position.copy(this.standWorldPos);
        this.model.rotation.y = this.seatWorldRotationY;
        this.playAction("standToSit", 0.25);
      }
      return;
    }

    if (this.currentAction !== this.actions.get("walking")) {
      this.playAction("walking", 0.2);
    }

    const currentTarget = this.waypoints[this.currentWaypointIndex];
    const dir = new THREE.Vector3().subVectors(
      currentTarget,
      this.model.position,
    );
    dir.y = 0;
    const distance = dir.length();

    if (distance < 0.22) {
      this.currentWaypointIndex++;
      return;
    }

    dir.normalize();

    const steerDir = dir.clone().add(this.avoidanceForce).normalize();
    const targetAngle = Math.atan2(steerDir.x, steerDir.z);
    let diff = targetAngle - this.model.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.model.rotation.y += diff * Math.min(delta * 7, 1);

    this.model.position.addScaledVector(steerDir, this.walkSpeed * delta);
  }

  startReturnToSeat() {
    this.setStatus("RETURNING");
    this.playAction("walking", 0.22);

    if (this.returnRouteGenerator) {
      this.waypoints = this.returnRouteGenerator(this.config.id);
      this.currentWaypointIndex = 0;
    }
  }
}
