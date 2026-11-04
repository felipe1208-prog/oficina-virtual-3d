import * as THREE from "three";

export class NavigationGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();

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
    // -------------------------------------------------------------
    // 1. PASILLO CENTRAL DE ALFOMBRA AZUL (EJE PRINCIPAL Z)
    // -------------------------------------------------------------
    this.addNode("corridor-south", -2.35, 7.1);
    this.addNode("corridor-mid-south", -2.35, 5.2);
    this.addNode("corridor-mid-north", -2.35, 3.2);
    this.addNode("corridor-hub", -2.35, 1.8); // Intersección central en T

    this.connect("corridor-south", "corridor-mid-south");
    this.connect("corridor-mid-south", "corridor-mid-north");
    this.connect("corridor-mid-north", "corridor-hub");

    // -------------------------------------------------------------
    // 2. SALIDAS SEGURAS DE DESARROLLO (DEV POD 2)
    // Pasillos traseros detrás de las sillas para no cortar escritorios
    // -------------------------------------------------------------
    // Pasillo Norte (detrás de Amarillo y Morado)
    this.addNode("dev2-aisle-nw", -6.7, 3.2);
    this.addNode("dev2-aisle-ne", -5.3, 3.2);
    this.addNode("dev2-exit-n", -3.8, 3.2);

    this.connect("dev2-aisle-nw", "dev2-aisle-ne");
    this.connect("dev2-aisle-ne", "dev2-exit-n");
    this.connect("dev2-exit-n", "corridor-mid-north");

    // Pasillo Sur (detrás de Naranja y Azul)
    this.addNode("dev2-aisle-sw", -6.7, 7.1);
    this.addNode("dev2-aisle-se", -5.3, 7.1);
    this.addNode("dev2-exit-s", -3.8, 7.1);

    this.connect("dev2-aisle-sw", "dev2-aisle-se");
    this.connect("dev2-aisle-se", "dev2-exit-s");
    this.connect("dev2-exit-s", "corridor-south");

    // -------------------------------------------------------------
    // 3. CRUCE ESTE-OESTE (PROMENADE CENTRAL LIBRE DE PAREDES)
    // -------------------------------------------------------------
    this.addNode("promenade-kitchen-entry", -0.8, 1.8);
    this.addNode("promenade-center", 1.6, 1.8);
    this.addNode("promenade-east", 4.8, 1.8);

    this.connect("corridor-hub", "promenade-kitchen-entry");
    this.connect("promenade-kitchen-entry", "promenade-center");
    this.connect("promenade-center", "promenade-east");

    // -------------------------------------------------------------
    // 4. COCINA Y COFFEE BAR (RODEANDO EL MURO X = -1.86 POR EL NORTE)
    // -------------------------------------------------------------
    // Pasillo frente a electrodomésticos (entre encimera y barra)
    this.addNode("kitchen-aisle-cooler", -0.8, 3.8);
    this.addNode("kitchen-aisle-drip", -0.8, 5.75);
    this.addNode("kitchen-aisle-espresso", -0.8, 6.45);
    this.addNode("kitchen-aisle-fridge", -0.8, 7.35);

    this.connect("promenade-kitchen-entry", "kitchen-aisle-cooler");
    this.connect("kitchen-aisle-cooler", "kitchen-aisle-drip");
    this.connect("kitchen-aisle-drip", "kitchen-aisle-espresso");
    this.connect("kitchen-aisle-espresso", "kitchen-aisle-fridge");

    // Pasillo exterior para los taburetes de la barra (al este de la barra)
    this.addNode("barstools-aisle-north", 1.6, 3.5);
    this.addNode("barstools-aisle-south", 1.6, 6.5);

    this.connect("promenade-center", "barstools-aisle-north");
    this.connect("barstools-aisle-north", "barstools-aisle-south");

    // -------------------------------------------------------------
    // 5. ZONA PING-PONG Y ARCADE (ACCESO SEGURO POR EL PORTAL X = 4.80)
    // -------------------------------------------------------------
    // Entrada sorteando el tabique de separación
    this.addNode("pingpong-door-outside", 4.8, 0.5);
    this.addNode("pingpong-door-inside", 4.8, -1.6);

    this.connect("promenade-east", "pingpong-door-outside");
    this.connect("pingpong-door-outside", "pingpong-door-inside");

    // Distribución interior de Ping-Pong
    this.addNode("pingpong-arcade-front", 6.2, -1.6);
    this.addNode("pingpong-vending-front", 9.5, -1.6);
    this.addNode("pingpong-table-south", 7.5, -2.6);
    this.addNode("pingpong-west-aisle", 5.6, -4.5);
    this.addNode("pingpong-table-north", 7.5, -6.6);
    this.addNode("pingpong-spectator-lounge", 9.8, -4.5);

    this.connect("pingpong-door-inside", "pingpong-arcade-front");
    this.connect("pingpong-arcade-front", "pingpong-vending-front");
    this.connect("pingpong-arcade-front", "pingpong-table-south");
    this.connect("pingpong-door-inside", "pingpong-west-aisle");
    this.connect("pingpong-west-aisle", "pingpong-table-north");
    this.connect("pingpong-table-south", "pingpong-spectator-lounge");
    this.connect("pingpong-spectator-lounge", "pingpong-vending-front");

    // -------------------------------------------------------------
    // 6. LOUNGE MULTIMEDIA (CIRCULACIÓN PERIMETRAL ALREDEDOR DEL SOFÁ)
    // -------------------------------------------------------------
    this.addNode("lounge-entry", 5.8, 2.4);
    this.addNode("lounge-north-aisle", 8.0, 2.4);
    this.addNode("lounge-east-aisle", 10.6, 4.15);
    this.addNode("lounge-south-aisle", 8.0, 6.8);
    this.addNode("lounge-west-aisle", 5.6, 4.15);

    this.connect("promenade-east", "lounge-entry");
    this.connect("lounge-entry", "lounge-north-aisle");
    this.connect("lounge-north-aisle", "lounge-east-aisle");
    this.connect("lounge-east-aisle", "lounge-south-aisle");
    this.connect("lounge-south-aisle", "lounge-west-aisle");
    this.connect("lounge-west-aisle", "lounge-entry");
  }

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
