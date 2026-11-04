import * as THREE from "three";

export class CharacterLocomotion {
  constructor(model, options = {}) {
    this.model = model;
    this.speed = options.speed || 0.65;
    this.waypoints = options.waypoints || [];
    this.currentWaypointIndex = 0;
    this.isPatrolling = options.isPatrolling ?? true;
  }

  update(delta) {
    if (this.waypoints.length === 0) return;

    const target = this.waypoints[this.currentWaypointIndex];
    const dir = new THREE.Vector3().subVectors(target, this.model.position);
    dir.y = 0;
    const distance = dir.length();

    if (distance < 0.2) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.waypoints.length) {
        if (this.isPatrolling) {
          this.waypoints.reverse();
          this.currentWaypointIndex = 0;
        }
      }
      return;
    }

    dir.normalize();

    // Giro suave hacia la dirección de avance
    const targetAngle = Math.atan2(dir.x, dir.z);
    let diff = targetAngle - this.model.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.model.rotation.y += diff * Math.min(delta * 7, 1);

    this.model.position.addScaledVector(dir, this.speed * delta);
  }
}
