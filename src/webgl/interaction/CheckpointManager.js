import * as THREE from "three";
import { CHECKPOINTS, CHECKPOINT_TYPES } from "./checkpoints.config.js";

export class CheckpointManager {
  constructor() {
    this.checkpoints = JSON.parse(JSON.stringify(CHECKPOINTS));
    this.queues = new Map();
    this.listeners = new Map();

    Object.keys(this.checkpoints).forEach((id) => {
      this.queues.set(id, []);
    });
  }

  get(checkpointId) {
    return this.checkpoints[checkpointId] || null;
  }

  reserve(checkpointId, agentId) {
    const cp = this.checkpoints[checkpointId];
    if (!cp) return false;

    if (!cp.isOccupied && (!cp.reservedBy || cp.reservedBy === agentId)) {
      cp.reservedBy = agentId;
      cp.isOccupied = true;
      return true;
    }

    const queue = this.queues.get(checkpointId);
    if (queue && !queue.includes(agentId)) {
      queue.push(agentId);
    }
    return false;
  }

  release(checkpointId, agentId) {
    const cp = this.checkpoints[checkpointId];
    if (!cp) return;

    if (cp.reservedBy === agentId) {
      cp.isOccupied = false;
      cp.reservedBy = null;

      const queue = this.queues.get(checkpointId);
      if (queue && queue.length > 0) {
        const nextAgentId = queue.shift();
        cp.reservedBy = nextAgentId;
        cp.isOccupied = true;

        // Evento global seguro: notifica a todos los agentes quién tiene el turno
        this.emit("turn:granted", {
          checkpointId,
          agentId: nextAgentId,
        });
      }
    }
  }

  removeFromQueue(checkpointId, agentId) {
    if (!checkpointId) return;
    const queue = this.queues.get(checkpointId);
    if (queue) {
      const idx = queue.indexOf(agentId);
      if (idx !== -1) {
        queue.splice(idx, 1);
      }
    }
  }

  getNearestAvailableWaitingSeat(fromPosition) {
    let nearestSeat = null;
    let minDist = Infinity;
    const fromVec = new THREE.Vector2(fromPosition.x, fromPosition.z);

    Object.values(this.checkpoints).forEach((cp) => {
      if (
        cp.type === CHECKPOINT_TYPES.WAITING_SEAT &&
        !cp.isOccupied &&
        !cp.reservedBy
      ) {
        const cpVec = new THREE.Vector2(cp.pos.x, cp.pos.z);
        const dist = fromVec.distanceTo(cpVec);
        if (dist < minDist) {
          minDist = dist;
          nearestSeat = cp;
        }
      }
    });

    return nearestSeat;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => cb(data));
    }
  }
}

export const checkpointManager = new CheckpointManager();
