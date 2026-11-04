import * as THREE from "three";

export class CharacterLocomotion {
  constructor(model, options = {}) {
    this.model = model;
    this.speed = options.speed || 0.65;
    this.waypoints = options.waypoints || [];
    this.currentWaypointIndex = 0;
    this.onArrival = options.onArrival || null;

    // Sensor de evasión lateral para no atravesarse entre agentes
    this.sensorRange = 1.1;
    this.avoidanceForce = new THREE.Vector3();
  }

  setPath(waypoints, onArrival = null) {
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.onArrival = onArrival;
  }

  updateProximity(allCharacters, currentAgentId) {
    this.avoidanceForce.set(0, 0, 0);
    if (this.waypoints.length === 0) return;

    const myPos = this.model.position;
    const myForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.model.rotation.y,
    );

    for (const other of allCharacters) {
      if (other.config.id === currentAgentId) continue;
      const otherPos = other.model.position;
      const dist = myPos.distanceTo(otherPos);

      if (dist < this.sensorRange) {
        const toOther = new THREE.Vector3().subVectors(otherPos, myPos);
        toOther.y = 0;
        toOther.normalize();

        // Si están de frente, generar desvío hacia la derecha
        const lateral = new THREE.Vector3(-myForward.z, 0, myForward.x);
        const weight = (this.sensorRange - dist) / this.sensorRange;
        this.avoidanceForce.addScaledVector(lateral, weight * 0.45);
      }
    }
  }

  update(delta) {
    if (this.currentWaypointIndex >= this.waypoints.length) return;

    const target = this.waypoints[this.currentWaypointIndex];
    const dir = new THREE.Vector3().subVectors(target, this.model.position);
    dir.y = 0;
    const distance = dir.length();

    if (distance < 0.22) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.waypoints.length) {
        if (this.onArrival) this.onArrival();
      }
      return;
    }

    dir.normalize();
    const steerDir = dir.clone().add(this.avoidanceForce).normalize();

    // Rotación suave hacia el vector resultante
    const targetAngle = Math.atan2(steerDir.x, steerDir.z);
    let diff = targetAngle - this.model.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.model.rotation.y += diff * Math.min(delta * 7.5, 1);

    this.model.position.addScaledVector(steerDir, this.speed * delta);
  }
}
