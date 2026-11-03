/**
 * Configuración espacial y coordenadas del diorama de la oficina.
 * Dimensiones base: 18 unidades de ancho (X) x 14 unidades de profundidad (Z).
 */

export const OFFICE_BOUNDS = {
  width: 18,
  depth: 14,
  height: 0.6,
  floorColor: "#1A1E29", // Gris azulado mate
  gridColor: "#2C3446",
};

export const AGENT_STATIONS = {
  backend: {
    id: "backend",
    name: "Backend Dev",
    role: "C# ASP.NET Core & APIs",
    color: "#3B82F6", // Azul mate
    position: { x: -4, y: 0, z: 2 },
    rotation: { y: 0 },
  },
  frontend: {
    id: "frontend",
    name: "Frontend Dev",
    role: "Vue 3 + Tailwind CSS",
    color: "#10B981", // Verde esmeralda mate
    position: { x: 0, y: 0, z: 2 },
    rotation: { y: 0 },
  },
  devops: {
    id: "devops",
    name: "Database / DevOps",
    role: "Migrations, Docker & CI/CD",
    color: "#F59E0B", // Ámbar mate
    position: { x: -2, y: 0, z: 5 },
    rotation: { y: Math.PI },
  },
  supervisor: {
    id: "supervisor",
    name: "Supervisor IA",
    role: "Task Reviewer & Orchestrator",
    color: "#8B5CF6", // Púrpura mate
    position: { x: 5.5, y: 0, z: -3 }, // Puesto alejado con vista panorámica
    rotation: { y: -Math.PI / 4 },
  },
};

export const ZONE_PROPS = {
  kitchen: {
    coffeeMachine: {
      position: { x: 6.5, y: 0, z: 3.5 },
    },
    waterCooler: {
      position: { x: 7.2, y: 0, z: 2.0 },
    },
    trashcan: {
      position: { x: 5.5, y: 0, z: 4.8 },
    },
  },
  lounge: {
    pingPongTable: {
      position: { x: -5.5, y: 0, z: -3.5 },
    },
    couchMedium: {
      position: { x: -2.0, y: 0, z: -5.0 },
    },
    tvScreen: {
      position: { x: -2.0, y: 0, z: -6.2 },
    },
    coffeeTable: {
      position: { x: -2.0, y: 0, z: -3.8 },
    },
  },
  environment: {
    houseplants: [
      { position: { x: 4.5, y: 0, z: -5.0 }, scale: 1.0 },
      { position: { x: -7.5, y: 0, z: 5.0 }, scale: 1.0 },
    ],
  },
};
