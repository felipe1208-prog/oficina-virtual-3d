import { CharacterModel } from "./CharacterModel.js";
import { CharacterAnimator } from "./CharacterAnimator.js";
import { CharacterLocomotion } from "./CharacterLocomotion.js";

export class AgentCharacter {
  constructor(config, resources) {
    this.config = config;
    this.model = CharacterModel.create(resources, config);
    this.animator = new CharacterAnimator(this.model, resources);
    this.locomotion = null;
    this.status = config.role === "patrol" ? "WALKING" : "WORKING";

    this.initRole();
  }

  initRole() {
    if (this.config.role === "seated") {
      const { x, y, z, rotY } = this.config.seat;
      this.model.position.set(x, y, z);
      this.model.rotation.y = rotY;
      this.animator.play(this.config.initialAnimation || "typing", 0.1);
    } else if (this.config.role === "patrol") {
      const { waypoints, speed, y } = this.config.patrol;
      if (waypoints && waypoints.length > 0) {
        this.model.position.copy(waypoints[0]);
        this.model.position.y = y;
      }
      this.locomotion = new CharacterLocomotion(this.model, {
        speed,
        waypoints,
      });
      this.animator.play("walking", 0.1);
    }
  }

  update(delta) {
    this.animator.update(delta);
    if (this.locomotion) {
      this.locomotion.update(delta);
    }
  }
}
