import * as THREE from "three";
import { navGraph } from "./NavigationGraph.js";

export class Pathfinding {
  static findPath(startPos, targetPos) {
    const startNodeId = navGraph.getClosestNodeId(startPos);
    const endNodeId = navGraph.getClosestNodeId(targetPos);

    if (!startNodeId || !endNodeId) {
      return [new THREE.Vector3(targetPos.x, -0.34, targetPos.z)];
    }

    if (startNodeId === endNodeId) {
      return [new THREE.Vector3(targetPos.x, -0.34, targetPos.z)];
    }

    // Algoritmo A* estándar sobre el grafo de navegación
    const openSet = [startNodeId];
    const cameFrom = new Map();

    const gScore = new Map();
    const fScore = new Map();

    for (const id of navGraph.nodes.keys()) {
      gScore.set(id, Infinity);
      fScore.set(id, Infinity);
    }

    gScore.set(startNodeId, 0);
    const endVec = navGraph.nodes.get(endNodeId);
    fScore.set(startNodeId, navGraph.nodes.get(startNodeId).distanceTo(endVec));

    while (openSet.length > 0) {
      // Obtener nodo con menor fScore
      let current = openSet[0];
      let lowestF = fScore.get(current);
      for (let i = 1; i < openSet.length; i++) {
        const score = fScore.get(openSet[i]);
        if (score < lowestF) {
          lowestF = score;
          current = openSet[i];
        }
      }

      if (current === endNodeId) {
        // Reconstrucción del camino
        const path = [];
        let curr = current;
        while (cameFrom.has(curr)) {
          path.unshift(navGraph.nodes.get(curr).clone());
          curr = cameFrom.get(curr);
        }
        // Añadir el destino final exacto
        path.push(new THREE.Vector3(targetPos.x, -0.34, targetPos.z));
        return path;
      }

      openSet.splice(openSet.indexOf(current), 1);
      const currentPos = navGraph.nodes.get(current);

      const neighbors = navGraph.edges.get(current) || [];
      for (const neighborId of neighbors) {
        const neighborPos = navGraph.nodes.get(neighborId);
        const tentativeG =
          gScore.get(current) + currentPos.distanceTo(neighborPos);

        if (tentativeG < gScore.get(neighborId)) {
          cameFrom.set(neighborId, current);
          gScore.set(neighborId, tentativeG);
          fScore.set(neighborId, tentativeG + neighborPos.distanceTo(endVec));

          if (!openSet.includes(neighborId)) {
            openSet.push(neighborId);
          }
        }
      }
    }

    return [new THREE.Vector3(targetPos.x, -0.34, targetPos.z)];
  }
}
