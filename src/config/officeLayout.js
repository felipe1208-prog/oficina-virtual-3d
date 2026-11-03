export const DIORAMA_CONFIG = {
  wallHeight: 3.8,
  wallThickness: 0.35,
  baseboardHeight: 0.16,

  // Polígono escalonado exacto de la planta
  floorPolygon: [
    { x: -12.0, z: 9.0 }, // Esquina Frontal Izquierda
    { x: -12.0, z: -8.5 }, // Muro Oeste continuo
    { x: -4.5, z: -8.5 }, // Muro Norte Supervisor
    { x: -4.5, z: -9.2 }, // Retranqueo sutil hacia Sala de Reuniones
    { x: 4.2, z: -9.2 }, // Muro Norte Sala de Reuniones
    { x: 4.2, z: -8.5 }, // Quiebre hacia zona de Ping-Pong
    { x: 12.0, z: -8.5 }, // Muro Norte Ping-Pong y Lounge Derecho
    { x: 12.0, z: 3.5 }, // Cierre Muro Este
    { x: 7.0, z: 3.5 }, // Escalón frontal Lounge
    { x: 7.0, z: 9.0 }, // Esquina Frontal Derecha
    { x: -12.0, z: 9.0 }, // Cierre
  ],

  // Muros perimetrales con ventanales panorámicos
  perimeterWalls: [
    {
      p1: { x: -12.0, z: 9.0 },
      p2: { x: -12.0, z: -8.5 },
      windows: [
        { offset: 3.2, width: 2.8, height: 2.1 },
        { offset: 8.0, width: 2.8, height: 2.1 },
        { offset: 13.5, width: 3.4, height: 2.1 },
      ],
    },
    {
      p1: { x: -12.0, z: -8.5 },
      p2: { x: -4.5, z: -8.5 },
      windows: [{ offset: 3.8, width: 3.4, height: 2.1 }],
    },
    { p1: { x: -4.5, z: -8.5 }, p2: { x: -4.5, z: -9.2 }, windows: [] },
    {
      p1: { x: -4.5, z: -9.2 },
      p2: { x: 4.2, z: -9.2 },
      windows: [{ offset: 4.35, width: 3.6, height: 2.1 }],
    },
    { p1: { x: 4.2, z: -9.2 }, p2: { x: 4.2, z: -8.5 }, windows: [] },
    {
      p1: { x: 4.2, z: -8.5 },
      p2: { x: 12.0, z: -8.5 },
      windows: [{ offset: 5.5, width: 3.4, height: 2.1 }],
    },
    {
      p1: { x: 12.0, z: -8.5 },
      p2: { x: 12.0, z: 3.5 },
      windows: [{ offset: 6.0, width: 2.8, height: 2.1 }],
    },
  ],

  // Cerramientos de Cristal con fachada frontal continua en Z = -2.8
  glassRooms: {
    supervisor: {
      minX: -12.0,
      maxX: -4.8,
      minZ: -8.5,
      maxZ: -2.8,
      doorGap: { start: -7.5, end: -5.9 },
    },
    meeting: {
      minX: -4.2,
      maxX: 4.2,
      minZ: -9.2,
      maxZ: -2.8,
      doorGap: { start: -0.8, end: 0.8 },
    },
  },

  // Muros Interiores con orientación corregida
  interiorWalls: {
    // Corre a lo largo del eje Z (paralelo al muro izquierdo)
    kitchenWall: {
      x: -2.2,
      z: 5.2,
      width: 0.28,
      height: 2.1,
      depth: 4.6,
    },
    // Corre a lo largo del eje X (paralelo al muro del fondo)
    loungeTVWall: {
      x: 7.2,
      z: 0.8,
      width: 5.4,
      height: 2.6,
      depth: 0.3,
    },
  },

  // Red de alfombras limpias continuas
  carpets: [
    // Corredor peatonal gris grafito en L
    { width: 2.4, length: 11.2, x: -3.4, z: 3.2, color: "#2B323D" },
    { width: 11.5, length: 2.2, x: -1.5, z: -1.5, color: "#2B323D" },

    // Alfombra azul marino de la Sala de Reuniones
    { width: 6.8, length: 4.8, x: 0.0, z: -6.0, color: "#1B2C4E" },

    // Alfombras bajo las islas de computación
    { width: 3.8, length: 5.2, x: -8.2, z: 3.5, color: "#222832" },
    { width: 3.4, length: 3.6, x: -8.2, z: -0.8, color: "#222832" },

    // Alfombra azul marino del salón principal (Lounge)
    { width: 7.4, length: 5.8, x: 7.0, z: 4.6, color: "#182846" },
  ],
};

export const AGENT_STATIONS = {
  architect: {
    id: "architect",
    name: "Tech Lead / Supervisor",
    role: "Architecture & Supervision",
    color: "#8B5CF6",
    position: { x: -8.5, y: 0, z: -5.8 },
    rotation: { y: Math.PI },
  },
  backend: {
    id: "backend",
    name: "Backend Dev",
    role: "API & Business Logic",
    color: "#3B82F6",
    position: { x: -8.2, y: 0, z: 4.5 },
    rotation: { y: Math.PI },
  },
  frontend: {
    id: "frontend",
    name: "Frontend Dev",
    role: "UI/UX & WebGL",
    color: "#10B981",
    position: { x: -8.2, y: 0, z: 1.5 },
    rotation: { y: Math.PI },
  },
  qa: {
    id: "qa",
    name: "DevOps / QA",
    role: "Database & Reliability",
    color: "#F59E0B",
    position: { x: -3.3, y: 0, z: 0.8 },
    rotation: { y: 0 },
  },
};
