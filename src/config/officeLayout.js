export const OFFICE_BOUNDS = {
  width: 17.0,
  height: 0.3,
  depth: 13.0,
  wallHeight: 3.4,
};

// Estaciones de trabajo distribuidas según el plano
export const AGENT_STATIONS = {
  // Cuadrante Superior Derecho: Supervisor rotado 30°
  architect: {
    id: "architect",
    name: "Tech Lead / Supervisor",
    role: "Architecture & Supervision",
    color: "#8B5CF6",
    position: { x: 4.6, y: 0, z: -3.2 },
    rotation: { y: Math.PI + (30 * Math.PI) / 180 }, // Inclinado 30° hacia el pasillo
  },

  // Cuadrante Inferior Izquierdo: Pod de Desarrollo
  backend: {
    id: "backend",
    name: "Backend Dev",
    role: "API & Business Logic",
    color: "#3B82F6",
    position: { x: -4.4, y: 0, z: 2.2 },
    rotation: { y: Math.PI },
  },
  frontend: {
    id: "frontend",
    name: "Frontend Dev",
    role: "UI/UX & 3D Shaders",
    color: "#10B981",
    position: { x: -1.8, y: 0, z: 2.2 },
    rotation: { y: Math.PI },
  },
  qa: {
    id: "qa",
    name: "DevOps / Database",
    role: "Database & Infrastructure",
    color: "#F59E0B",
    position: { x: -3.1, y: 0, z: 4.7 },
    rotation: { y: 0 }, // Frente a Backend y Frontend
  },
};

// Mobiliario con cotas de la vida real
export const ZONE_PROPS = {
  // Cuadrante Superior Izquierdo: Lounge
  lounge: {
    couchMedium: {
      position: { x: -5.4, y: 0, z: -4.2 },
      rotation: { y: Math.PI / 2 },
    },
    couchSmall: {
      position: { x: -3.6, y: 0, z: -5.4 },
      rotation: { y: Math.PI },
    },
    coffeeTable: { position: { x: -3.8, y: 0, z: -4.2 } },
    tv: {
      position: { x: -7.6, y: 1.5, z: -4.2 },
      rotation: { y: Math.PI / 2 },
    },
    pingPongTable: { position: { x: -4.2, y: 0, z: -1.4 }, rotation: { y: 0 } },
  },

  // Cuadrante Inferior Derecho: Break / Cocina
  kitchen: {
    waterCooler: { position: { x: 5.2, y: 0, z: 4.6 } },
    counter: { position: { x: 3.4, y: 0, z: 4.6 } },
    trashcan: { position: { x: 6.0, y: 0, z: 4.8 } },
  },

  // Pared Posterior: 4 Ventanales a altura de ojos
  windows: [
    { position: { x: -5.2, y: 1.75, z: -6.44 } },
    { position: { x: -1.8, y: 1.75, z: -6.44 } },
    { position: { x: 1.8, y: 1.75, z: -6.44 } },
    { position: { x: 5.2, y: 1.75, z: -6.44 } },
  ],

  // Techo: Climatización y Luminarias
  ceilingFans: [
    { position: { x: -3.6, y: 3.05, z: -3.2 } },
    { position: { x: 3.6, y: 3.05, z: -3.2 } },
    { position: { x: -3.6, y: 3.05, z: 3.2 } },
    { position: { x: 3.6, y: 3.05, z: 3.2 } },
  ],

  ceilingLights: [
    { position: { x: -3.6, y: 3.32, z: 0 } },
    { position: { x: 3.6, y: 3.32, z: 0 } },
    { position: { x: 0, y: 3.32, z: -3.2 } },
    { position: { x: 0, y: 3.32, z: 3.2 } },
  ],

  plants: [
    { position: { x: -7.6, y: 0, z: -5.8 }, scale: 1.3 },
    { position: { x: 7.6, y: 0, z: -5.8 }, scale: 1.3 },
    { position: { x: -0.6, y: 0, z: 4.6 }, scale: 1.1 },
    { position: { x: 7.2, y: 0, z: 2.2 }, scale: 1.2 },
  ],
};
