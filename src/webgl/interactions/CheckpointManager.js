import * as THREE from "three";
import { CHECKPOINTS, CHECKPOINT_TYPES } from "./checkpoints.config.js";

export class CheckpointManager {
  constructor() {
    // Clonar checkpoints para mutabilidad de estados en runtime
    this.checkpoints = JSON.parse(JSON.stringify(CHECKPOINTS));
    this.queues = new Map(); // checkpointId -> [agentId, ...]
    this.listeners = new Map(); // event -> [callbacks, ...]

    Object.keys(this.checkpoints).forEach((id) => {
      this.queues.set(id, []);
    });
  }

  get(checkpointId) {
    return this.checkpoints[checkpointId] || null;
  }

  // Intento de reserva inmediata (Locking at Intent)
  reserve(checkpointId, agentId) {
    const cp = this.checkpoints[checkpointId];
    if (!cp) return false;

    // Si ya está libre o reservado por el mismo agente
    if (!cp.isOccupied && (!cp.reservedBy || cp.reservedBy === agentId)) {
      cp.reservedBy = agentId;
      cp.isOccupied = true;
      return true;
    }

    // Si está ocupado por otro, encolar intención
    const queue = this.queues.get(checkpointId);
    if (!queue.includes(agentId)) {
      queue.push(agentId);
    }
    return false;
  }

  // Liberar checkpoint y notificar al siguiente agente en la cola
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

        this.emit(`checkpoint:${checkpointId}:granted`, {
          checkpointId,
          agentId: nextAgentId,
        });
      }
    }
  }

  // Busca el asiento de espera disponible más cercano que NO sea un escritorio
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

  // Sistema de suscripción a eventos
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
