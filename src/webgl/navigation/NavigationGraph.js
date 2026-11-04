import * as THREE from "three";

export class NavigationGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map(); // nodeId -> [neighborId, ...]

    this.initGraph();
  }

  addNode(id, x, z) {
    this.nodes.set(id, new THREE.Vector3(x, -0.34, z));
    this.edges.set(id, []);
  }

  connect(idA, idB) {
    if (this.edges.has(idA) && this.edges.has(idB)) {
      this.edges.get(idA).push(idB);
      this.edges.get(idB).push(idA);
    }
  }

  initGraph() {
    // 1. Eje Central de Alfombra en "T" (Corredores libres de la oficina)[cite: 20, 28]
    this.addNode("corridor-center-north", -2.35, 1.8);
    this.addNode("corridor-center-mid", -2.35, 4.2);
    this.addNode("corridor-center-south", -2.35, 6.5);

    this.connect("corridor-center-north", "corridor-center-mid");
    this.connect("corridor-center-mid", "corridor-center-south");

    // 2. Corredor Este-Oeste Principal[cite: 20, 28]
    this.addNode("corridor-junction-dev", -4.5, 1.8);
    this.addNode("corridor-junction-mid", 0.5, 1.8);
    this.addNode("corridor-junction-lounge", 4.5, 1.8);

    this.connect("corridor-junction-dev", "corridor-center-north");
    this.connect("corridor-center-north", "corridor-junction-mid");
    this.connect("corridor-junction-mid", "corridor-junction-lounge");

    // 3. Pasillos Internos de DevArea[cite: 20]
    this.addNode("dev-aisle-pod2-north", -6.0, 3.2);
    this.addNode("dev-aisle-pod2-south", -6.0, 7.2);
    this.addNode("dev-aisle-pod1-north", -9.6, 3.2);
    this.addNode("dev-aisle-pod1-south", -9.6, 7.2);

    this.connect("corridor-junction-dev", "dev-aisle-pod2-north");
    this.connect("dev-aisle-pod2-north", "dev-aisle-pod1-north");
    this.connect("corridor-center-south", "dev-aisle-pod2-south");
    this.connect("dev-aisle-pod2-south", "dev-aisle-pod1-south");

    // 4. Pasillo Cocina & Bar[cite: 26]
    this.addNode("kitchen-entry", -0.5, 3.5);
    this.addNode("kitchen-aisle-mid", -0.5, 5.7);
    this.addNode("kitchen-aisle-south", -0.5, 7.2);

    this.connect("corridor-junction-mid", "kitchen-entry");
    this.connect("kitchen-entry", "kitchen-aisle-mid");
    this.connect("kitchen-aisle-mid", "kitchen-aisle-south");
    this.connect("corridor-center-mid", "kitchen-aisle-mid");

    // 5. Entrada y Puerta Sala de Reuniones[cite: 23]
    this.addNode("meeting-door-outside", 0.0, -2.5);
    this.addNode("meeting-door-inside", 0.0, -3.8);
    this.addNode("meeting-inside-west", -2.2, -6.0);
    this.addNode("meeting-inside-east", 2.2, -6.0);
    this.addNode("meeting-inside-stage", 0.0, -7.5);

    this.connect("corridor-junction-mid", "meeting-door-outside");
    this.connect("meeting-door-outside", "meeting-door-inside");
    this.connect("meeting-door-inside", "meeting-inside-west");
    this.connect("meeting-door-inside", "meeting-inside-east");
    this.connect("meeting-door-inside", "meeting-inside-stage");

    // 6. Entrada Oficina Supervisor[cite: 25]
    this.addNode("supervisor-door-outside", -4.8, -2.5);
    this.addNode("supervisor-inside-aisle", -6.5, -4.5);

    this.connect("corridor-junction-dev", "supervisor-door-outside");
    this.connect("supervisor-door-outside", "supervisor-inside-aisle");

    // 7. Acceso y Tránsito Ping-Pong[cite: 24]
    this.addNode("pingpong-entry", 4.5, -1.8);
    this.addNode("pingpong-aisle-west", 6.0, -4.5);
    this.addNode("pingpong-aisle-east", 9.5, -4.5);
    this.addNode("pingpong-aisle-north", 7.5, -7.5);

    this.connect("corridor-junction-lounge", "pingpong-entry");
    this.connect("pingpong-entry", "pingpong-aisle-west");
    this.connect("pingpong-aisle-west", "pingpong-aisle-east");
    this.connect("pingpong-aisle-west", "pingpong-aisle-north");

    // 8. Tránsito y Pasillos Lounge[cite: 28]
    this.addNode("lounge-entry", 5.5, 2.5);
    this.addNode("lounge-aisle-center", 8.0, 2.5);
    this.addNode("lounge-aisle-east", 10.0, 2.5);
    this.addNode("lounge-aisle-south", 8.0, 7.0);

    this.connect("corridor-junction-lounge", "lounge-entry");
    this.connect("lounge-entry", "lounge-aisle-center");
    this.connect("lounge-aisle-center", "lounge-aisle-east");
    this.connect("lounge-aisle-center", "lounge-aisle-south");
  }

  // Encuentra el nodo más cercano a cualquier coordenada (X, Z) del diorama
  getClosestNodeId(pos) {
    let closestId = null;
    let minDist = Infinity;
    const p = new THREE.Vector2(pos.x, pos.z);

    for (const [id, vec] of this.nodes.entries()) {
      const dist = p.distanceTo(new THREE.Vector2(vec.x, vec.z));
      if (dist < minDist) {
        minDist = dist;
        closestId = id;
      }
    }
    return closestId;
  }
}

export const navGraph = new NavigationGraph();
