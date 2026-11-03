import * as THREE from "three";

export class AgentCharacter {
  constructor(config, model, rawClips = {}, onStatusChange = null) {
    this.config = config;
    this.model = model;
    this.rawClips = rawClips;
    this.onStatusChange = onStatusChange;

    // Alturas calibradas: sentado sobre el asiento vs pies en la cuadrícula del piso
    this.Y_SITTING = -0.02;
    this.Y_STANDING = -0.34;

    // Puntos de la estación en coordenadas locales
    this.SEAT_LOCAL_POS = new THREE.Vector3(-0.15, this.Y_SITTING, 0.46);
    this.STAND_LOCAL_POS = new THREE.Vector3(-0.15, this.Y_STANDING, 0.46);
    this.AISLE_LOCAL_POS = new THREE.Vector3(-0.15, this.Y_STANDING, 1.25);

    this.status = "WORKING";
    this.mixer = null;
    this.actions = new Map();
    this.currentAction = null;

    // Navegación por pasillos y velocidad realista
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.walkSpeed = 0.55; // Velocidad de paso de oficina (m/s)
    this.roamTarget = null;
    this.breakTimer = 0;
    this.transitionTimer = 0;
    this.isBlocked = false;
    this.destinationProvider = null;

    this.stateTimer = 14 + Math.random() * 10;
    this.roamCooldown = 45 + Math.random() * 35;

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

        // Elimina el salto horizontal de raíz en SitToStand y StandToSit
        if (newName === "sitToStand" || newName === "standToSit") {
          const x0 = track.values[0];
          const z0 = track.values[2];
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] = x0;
            track.values[i + 2] = z0;
          }
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

    registerLoop("typing", "typing", 0.95 + Math.random() * 0.12);
    registerLoop("sittingIdle", "sittingIdle", 0.85 + Math.random() * 0.15);
    registerOnce("sitToType", "sitToType", 1.0);
    registerOnce("typeToSit", "typeToSit", 1.0);
    registerOnce("sitToStand", "sitToStand", 1.0);
    registerOnce("standToSit", "standToSit", 1.0);
    registerLoop("standingIdle", "standingIdle", 0.85);
    registerLoop("walking", "walking", 0.85);

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

  playAction(name, crossFadeDuration = 0.25) {
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
    this.playAction("walking", 0.25);
    this.model.position.copy(this.STAND_LOCAL_POS);

    const parent = this.model.parent;
    if (!parent || !this.roamTarget) return;

    // Trazado de pasillo predefinido en coordenadas locales de la estación
    const aisleWorld = parent.localToWorld(this.AISLE_LOCAL_POS.clone());
    const centralHallwayWorld = new THREE.Vector3(
      aisleWorld.x * 0.3,
      0,
      aisleWorld.z * 0.3,
    );

    const aisleLocal = parent.worldToLocal(aisleWorld.clone());
    aisleLocal.y = this.Y_STANDING;

    const hallwayLocal = parent.worldToLocal(centralHallwayWorld.clone());
    hallwayLocal.y = this.Y_STANDING;

    const destLocal = parent.worldToLocal(this.roamTarget.worldPos.clone());
    destLocal.y = this.Y_STANDING;

    this.waypoints = [aisleLocal, hallwayLocal, destLocal];
    this.currentWaypointIndex = 0;
  }

  onSatDown() {
    this.model.position.copy(this.SEAT_LOCAL_POS);
    this.model.rotation.y = Math.PI;
    this.setStatus("WORKING");
  }

  getWorldPosition() {
    const worldPos = new THREE.Vector3();
    this.model.getWorldPosition(worldPos);
    return worldPos;
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Interpolación gradual de altura durante transiciones físicas de asiento
    if (this.status === "LEAVING_DESK") {
      this.transitionTimer += delta;
      const dur = this.actions.get("sitToStand")?.getClip().duration || 1.8;
      const t = Math.min(this.transitionTimer / (dur * 0.9), 1.0);
      this.model.position.y = THREE.MathUtils.lerp(
        this.Y_SITTING,
        this.Y_STANDING,
        t,
      );
    } else if (this.status === "SITTING_DOWN") {
      this.transitionTimer += delta;
      const dur = this.actions.get("standToSit")?.getClip().duration || 1.8;
      const t = Math.min(this.transitionTimer / (dur * 0.9), 1.0);
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
        this.model.position.copy(this.STAND_LOCAL_POS);
        this.model.rotation.y = Math.PI;
        this.playAction("standToSit", 0.25);
      }
      return;
    }

    const currentTarget = this.waypoints[this.currentWaypointIndex];
    const dir = new THREE.Vector3().subVectors(
      currentTarget,
      this.model.position,
    );
    dir.y = 0;
    const distance = dir.length();

    if (distance < 0.2) {
      this.currentWaypointIndex++;
      return;
    }

    dir.normalize();

    // Rotación suave orientada a la dirección de marcha
    const targetAngle = Math.atan2(dir.x, dir.z);
    let diff = targetAngle - this.model.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.model.rotation.y += diff * Math.min(delta * 6, 1);

    // Detención preventiva si hay otro agente delante
    if (this.isBlocked) {
      if (this.currentAction !== this.actions.get("standingIdle")) {
        this.playAction("standingIdle", 0.2);
      }
      return;
    } else {
      if (this.currentAction !== this.actions.get("walking")) {
        this.playAction("walking", 0.2);
      }
    }

    this.model.position.addScaledVector(dir, this.walkSpeed * delta);
  }

  startReturnToSeat() {
    this.setStatus("RETURNING");
    this.playAction("walking", 0.25);

    const parent = this.model.parent;
    if (!parent) return;

    const aisleWorld = parent.localToWorld(this.AISLE_LOCAL_POS.clone());
    const centralHallwayWorld = new THREE.Vector3(
      aisleWorld.x * 0.3,
      0,
      aisleWorld.z * 0.3,
    );

    const hallwayLocal = parent.worldToLocal(centralHallwayWorld.clone());
    hallwayLocal.y = this.Y_STANDING;

    const aisleLocal = parent.worldToLocal(aisleWorld.clone());
    aisleLocal.y = this.Y_STANDING;

    const standLocal = this.STAND_LOCAL_POS.clone();

    this.waypoints = [hallwayLocal, aisleLocal, standLocal];
    this.currentWaypointIndex = 0;
  }
}
