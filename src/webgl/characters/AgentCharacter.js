import * as THREE from "three";
import { CharacterModel } from "./CharacterModel.js";
import { CharacterAnimator } from "./CharacterAnimator.js";
import { CharacterLocomotion } from "./CharacterLocomotion.js";
import { checkpointManager } from "../interaction/CheckpointManager.js";
import { Pathfinding } from "../navigation/Pathfinding.js";

export class AgentCharacter {
  constructor(config, resources) {
    this.config = config;
    this.resources = resources;

    this.model = CharacterModel.create(resources, config);
    this.animator = new CharacterAnimator(this.model, resources);
    this.locomotion = new CharacterLocomotion(this.model);

    this.homeCheckpointId = config.homeCheckpointId || null;
    this.currentCheckpointId = null;
    this.targetCheckpointId = null;
    this.waitingSeatId = null;

    this.state = "WORKING"; // WORKING | TRAVELING | WAITING | INTERACTING
    this.activityTimer = 20 + Math.random() * 15;
    this.interactionTimer = 0;
    this.waitingTimer = 0;

    this.initHome();
    this.bindEvents();
  }

  initHome() {
    if (this.homeCheckpointId) {
      const home = checkpointManager.get(this.homeCheckpointId);
      if (home) {
        checkpointManager.reserve(this.homeCheckpointId, this.config.id);
        this.currentCheckpointId = this.homeCheckpointId;
        this.model.position.set(home.pos.x, home.pos.y, home.pos.z);
        this.model.rotation.y = home.rotY;
        this.animator.play(this.config.initialAnimation || "typing", 0.1);
      }
    }
  }

  bindEvents() {
    checkpointManager.on("turn:granted", (data) => {
      if (data.agentId === this.config.id && this.state === "WAITING") {
        this.targetCheckpointId = data.checkpointId;
        this.leaveWaitingSeatAndProceedToTarget();
      }
    });
  }

  requestAction(checkpointId) {
    this.targetCheckpointId = checkpointId;
    const targetCP = checkpointManager.get(checkpointId);
    if (!targetCP) return;

    const success = checkpointManager.reserve(checkpointId, this.config.id);

    if (success) {
      this.transitionToWalk(() => {
        this.navigateTo(targetCP.pos, () => {
          this.arriveAtActionStation(targetCP);
        });
      });
    } else {
      const waitSeat = checkpointManager.getNearestAvailableWaitingSeat(
        this.model.position,
      );
      if (waitSeat) {
        checkpointManager.reserve(waitSeat.id, this.config.id);
        this.waitingSeatId = waitSeat.id;

        this.transitionToWalk(() => {
          this.navigateTo(waitSeat.pos, () => {
            this.arriveAtWaitingSeat(waitSeat);
          });
        });
      } else {
        this.activityTimer = 8 + Math.random() * 6;
      }
    }
  }

  // De estar sentado en la mesa o sofá a levantarse y caminar
  transitionToWalk(onStoodUp) {
    this.state = "TRAVELING";
    this.locomotion.setPath([]); // Evita desplazamiento durante el levantamiento

    if (this.currentCheckpointId) {
      checkpointManager.release(this.currentCheckpointId, this.config.id);
      this.currentCheckpointId = null;
    }

    this.animator.play("sitToStand", 0.2);
    setTimeout(() => {
      this.model.position.y = -0.34;
      this.animator.play("walking", 0.2);
      if (onStoodUp) onStoodUp();
    }, 750);
  }

  navigateTo(destination, onArrival) {
    const path = Pathfinding.findPath(this.model.position, destination);
    this.locomotion.setPath(path, onArrival);
  }

  arriveAtActionStation(cp) {
    this.currentCheckpointId = cp.id;
    this.state = "INTERACTING";
    this.model.position.set(cp.pos.x, cp.pos.y, cp.pos.z);
    this.model.rotation.y = cp.rotY;

    let actionAnim = cp.actions[0] || "standingIdle";
    if (!this.animator.actions.has(actionAnim)) {
      actionAnim = "standingIdle";
    }
    this.animator.play(actionAnim, 0.25);

    // Tiempo de permanencia en la actividad (entre 6 y 9 segundos)
    this.interactionTimer = 6 + Math.random() * 3;
  }

  arriveAtWaitingSeat(seat) {
    this.currentCheckpointId = seat.id;
    this.state = "WAITING";
    this.model.position.set(seat.pos.x, seat.pos.y, seat.pos.z);
    this.model.rotation.y = seat.rotY;

    let waitAnim = seat.actions[0] || "sittingIdle";
    if (!this.animator.actions.has(waitAnim)) {
      waitAnim = "sittingIdle";
    }
    this.animator.play(waitAnim, 0.25);

    this.waitingTimer = 14 + Math.random() * 6;
  }

  leaveWaitingSeatAndProceedToTarget() {
    const targetCP = checkpointManager.get(this.targetCheckpointId);
    if (!targetCP) return;

    this.transitionToWalk(() => {
      if (this.waitingSeatId) {
        checkpointManager.release(this.waitingSeatId, this.config.id);
        this.waitingSeatId = null;
      }
      this.navigateTo(targetCP.pos, () => {
        this.arriveAtActionStation(targetCP);
      });
    });
  }

  abandonWaitingAndReturnHome() {
    checkpointManager.removeFromQueue(this.targetCheckpointId, this.config.id);
    this.targetCheckpointId = null;

    this.transitionToWalk(() => {
      this.returnHome();
    });
  }

  returnHome() {
    if (!this.homeCheckpointId) return;

    // Activación obligatoria del estado de viaje
    this.state = "TRAVELING";
    this.interactionTimer = 0;

    if (this.currentCheckpointId) {
      checkpointManager.release(this.currentCheckpointId, this.config.id);
      this.currentCheckpointId = null;
    }

    if (this.waitingSeatId) {
      checkpointManager.release(this.waitingSeatId, this.config.id);
      this.waitingSeatId = null;
    }

    const home = checkpointManager.get(this.homeCheckpointId);
    if (!home) return;

    checkpointManager.reserve(this.homeCheckpointId, this.config.id);

    this.animator.play("walking", 0.2);
    this.model.position.y = -0.34;

    this.navigateTo(home.pos, () => {
      this.currentCheckpointId = home.id;
      this.state = "WORKING";
      this.model.position.set(home.pos.x, home.pos.y, home.pos.z);
      this.model.rotation.y = home.rotY;
      this.animator.play("typing", 0.25);
      this.activityTimer = 22 + Math.random() * 18;
    });
  }

  update(delta, allCharacters = []) {
    this.animator.update(delta);

    if (this.state === "TRAVELING") {
      this.locomotion.updateProximity(allCharacters, this.config.id);
      this.locomotion.update(delta);
    } else if (this.state === "WORKING") {
      this.activityTimer -= delta;
      if (this.activityTimer <= 0) {
        const leisureDestinations = [
          "kitchen-espresso",
          "kitchen-water-cooler",
          "arcade-machine",
        ];
        const pick =
          leisureDestinations[
            Math.floor(Math.random() * leisureDestinations.length)
          ];
        this.requestAction(pick);
      }
    } else if (this.state === "INTERACTING") {
      this.interactionTimer -= delta;
      if (this.interactionTimer <= 0) {
        this.returnHome();
      }
    } else if (this.state === "WAITING") {
      this.waitingTimer -= delta;
      if (this.waitingTimer <= 0) {
        this.abandonWaitingAndReturnHome();
      }
    }
  }
}
