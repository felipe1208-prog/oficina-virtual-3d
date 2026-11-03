export const DIORAMA_CONFIG = {
  wallHeight: 3.5,
  wallThickness: 0.28,
  baseboardHeight: 0.16,

  // Polígono exacto del suelo (Silueta escalonada igual al plano y render)
  // Recorrido en sentido horario desde la esquina inferior izquierda (Frente-Oeste)
  floorPolygon: [
    { x: -12.0, z: 9.0 }, // 1. Esquina Frontal Izquierda (Dev Area)
    { x: -12.0, z: -8.0 }, // 2. Sube por Pared Oeste hasta Supervisor
    { x: -5.0, z: -8.0 }, // 3. Muro Norte de Supervisor
    { x: -5.0, z: -5.5 }, // 4. Quiebre/Entrante entre Supervisor y Reuniones
    { x: -5.0, z: -9.5 }, // 5. Sube al Muro Norte de Sala de Reuniones
    { x: 3.5, z: -9.5 }, // 6. Esquina Norte de Sala de Reuniones
    { x: 3.5, z: -6.5 }, // 7. Quiebre/Entrante hacia zona de Ping Pong
    { x: 12.5, z: -6.5 }, // 8. Muro Norte de Ping Pong y Lounge Derecho
    { x: 12.5, z: 3.5 }, // 9. Pared Este (Derecha) detrás del Lounge
    { x: 6.5, z: 3.5 }, // 10. Escalón Frontal Derecho
    { x: 6.5, z: 9.0 }, // 11. Esquina Frontal Derecha (Lounge Principal)
    { x: -12.0, z: 9.0 }, // Cierre en Esquina Frontal Izquierda
  ],

  // Tramos de muros perimetrales escalonados con ventanales integrados
  perimeterWalls: [
    // Pared Oeste (Dev Area y Supervisor)
    {
      p1: { x: -12.0, z: 9.0 },
      p2: { x: -12.0, z: -8.0 },
      windows: [
        { offset: 3.2, width: 2.4, height: 1.9 },
        { offset: 7.5, width: 2.4, height: 1.9 },
        { offset: 13.0, width: 3.4, height: 2.0 },
      ],
    },
    // Pared Norte Supervisor
    {
      p1: { x: -12.0, z: -8.0 },
      p2: { x: -5.0, z: -8.0 },
      windows: [{ offset: 3.5, width: 3.2, height: 2.0 }],
    },
    // Muro de quiebre Supervisor -> Reuniones
    { p1: { x: -5.0, z: -8.0 }, p2: { x: -5.0, z: -9.5 }, windows: [] },
    // Pared Norte Sala de Reuniones
    {
      p1: { x: -5.0, z: -9.5 },
      p2: { x: 3.5, z: -9.5 },
      windows: [{ offset: 2.2, width: 3.4, height: 2.0 }],
    },
    // Muro de quiebre Reuniones -> Ping Pong
    { p1: { x: 3.5, z: -9.5 }, p2: { x: 3.5, z: -6.5 }, windows: [] },
    // Pared Norte Ping Pong y Lounge Derecho
    {
      p1: { x: 3.5, z: -6.5 },
      p2: { x: 12.5, z: -6.5 },
      windows: [{ offset: 6.8, width: 3.4, height: 2.0 }],
    },
    // Pared Este corta (Cierre derecho)
    { p1: { x: 12.5, z: -6.5 }, p2: { x: 12.5, z: 3.5 }, windows: [] },
  ],

  // Cerramientos de Cristal encajados en los entrantes de los muros
  glassRooms: {
    supervisor: {
      minX: -12.0,
      maxX: -5.0,
      minZ: -8.0,
      maxZ: -2.8,
      doorGap: { start: -7.5, end: -6.0 },
    },
    meeting: {
      minX: -5.0,
      maxX: 3.5,
      minZ: -9.5,
      maxZ: -3.2,
      doorGap: { start: -1.5, end: 0.2 },
    },
  },

  // Muros interiores independientes (Cocina y TV Lounge)
  interiorWalls: {
    kitchenWall: {
      x: -1.8,
      z: 4.5,
      width: 0.24,
      length: 4.8,
      height: 2.1,
      rotY: Math.PI / 4,
    }, // Alineado con la isla
    kitchenSimple: { x: -2.2, z: 4.2, width: 4.6, length: 0.24, height: 2.0 },
    loungeTVWall: { x: 5.2, z: 2.8, width: 0.26, length: 4.6, height: 2.6 },
  },

  // Caminos de Alfombra (Gris Carbón para Dev/Pasillos y Azul Marino para Reuniones/Lounge)
  carpets: [
    // Pasillos Gris Carbón cálido (#363B42)
    { width: 2.2, length: 10.5, x: -4.2, z: 2.8, color: "#363B42" },
    { width: 9.5, length: 2.0, x: -1.5, z: -1.6, color: "#363B42" },
    { width: 7.5, length: 1.8, x: -8.0, z: 1.8, color: "#363B42" },
    { width: 3.2, length: 3.0, x: -1.8, z: 1.8, color: "#363B42" },

    // Alfombra Azul Marino en Sala de Reuniones (#233656)
    { width: 6.4, length: 4.4, x: -0.8, z: -6.2, color: "#233656" },

    // Alfombra Azul Marino en T hacia el Lounge (#1E3252)
    { width: 2.2, length: 7.5, x: 1.8, z: 4.2, color: "#1E3252" },
    { width: 7.2, length: 2.2, x: 3.2, z: 1.2, color: "#1E3252" },

    // Alfombra Gris Topo bajo los sofás del Lounge (#4A4E54)
    { width: 4.6, length: 4.2, x: 3.5, z: 5.5, color: "#4A4E54" },

    // Alfombra Terracota en el segundo Lounge derecho (#9E4738)
    { width: 3.8, length: 3.4, x: 9.5, z: 0.5, color: "#9E4738" },
  ],
};

export const AGENT_STATIONS = {
  architect: {
    id: "architect",
    name: "Tech Lead / Supervisor",
    role: "Architecture & Supervision",
    color: "#8B5CF6",
    position: { x: -8.5, y: 0, z: -5.4 },
    rotation: { y: Math.PI },
  },
  backend: {
    id: "backend",
    name: "Backend Dev",
    role: "API & Business Logic",
    color: "#3B82F6",
    position: { x: -8.2, y: 0, z: 4.2 },
    rotation: { y: Math.PI },
  },
  frontend: {
    id: "frontend",
    name: "Frontend Dev",
    role: "UI/UX & WebGL",
    color: "#10B981",
    position: { x: -8.2, y: 0, z: 0.2 },
    rotation: { y: Math.PI },
  },
  qa: {
    id: "qa",
    name: "DevOps / QA",
    role: "Database & Reliability",
    color: "#F59E0B",
    position: { x: -3.2, y: 0, z: 0.8 },
    rotation: { y: 0 },
  },
};
