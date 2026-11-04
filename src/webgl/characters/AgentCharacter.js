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
    this.activityTimer = 20 + Math.random() * 15; // Tiempo de trabajo antes de buscar ocio/café

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
    // Escuchar si se libera una estación a la que este agente esperaba
    checkpointManager.on(
      `checkpoint:${this.targetCheckpointId}:granted`,
      (data) => {
        if (data.agentId === this.config.id && this.state === "WAITING") {
          this.leaveWaitingSeatAndProceedToTarget();
        }
      },
    );
  }

  // Deseo de interactuar con un checkpoint
  requestAction(checkpointId) {
    this.targetCheckpointId = checkpointId;
    const targetCP = checkpointManager.get(checkpointId);
    if (!targetCP) return;

    const success = checkpointManager.reserve(checkpointId, this.config.id);

    if (success) {
      // Estación libre: levantarse y caminar directamente
      this.transitionToWalk(() => {
        this.navigateTo(targetCP.pos, () => {
          this.arriveAtActionStation(targetCP);
        });
      });
    } else {
      // Ocupada: buscar asiento de espera disponible
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
      }
    }
  }

  transitionToWalk(onStoodUp) {
    this.state = "TRAVELING";
    // Liberar el checkpoint actual en el que estaba sentado
    if (this.currentCheckpointId) {
      checkpointManager.release(this.currentCheckpointId, this.config.id);
      this.currentCheckpointId = null;
    }

    this.animator.play("sitToStand", 0.2);
    setTimeout(() => {
      this.model.position.y = -0.34;
      this.animator.play("walking", 0.2);
      if (onStoodUp) onStoodUp();
    }, 900);
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

    const actionAnim = cp.actions[0] || "standingIdle";
    this.animator.play(actionAnim, 0.25);

    // Tiempo de duración de la actividad (ej. servirse café dura 8 segundos)
    setTimeout(() => {
      this.returnHome();
    }, 8000);
  }

  arriveAtWaitingSeat(seat) {
    this.currentCheckpointId = seat.id;
    this.state = "WAITING";
    this.model.position.set(seat.pos.x, seat.pos.y, seat.pos.z);
    this.model.rotation.y = seat.rotY;
    this.animator.play("sittingIdle", 0.25);
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

  returnHome() {
    if (!this.homeCheckpointId) return;

    // Liberar la estación de acción
    if (this.currentCheckpointId) {
      checkpointManager.release(this.currentCheckpointId, this.config.id);
      this.currentCheckpointId = null;
    }

    const home = checkpointManager.get(this.homeCheckpointId);
    checkpointManager.reserve(this.homeCheckpointId, this.config.id);

    this.animator.play("walking", 0.2);
    this.model.position.y = -0.34;

    this.navigateTo(home.pos, () => {
      this.currentCheckpointId = home.id;
      this.state = "WORKING";
      this.model.position.set(home.pos.x, home.pos.y, home.pos.z);
      this.model.rotation.y = home.rotY;
      this.animator.play("typing", 0.25);
      this.activityTimer = 25 + Math.random() * 20;
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
        // Disparar deseo aleatorio: ir a por café a la espresso o al agua
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
    }
  }
}
