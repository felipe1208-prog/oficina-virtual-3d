export const DIORAMA_CONFIG = {
  wallHeight: 3.8,
  wallThickness: 0.35,
  baseboardHeight: 0.16,

  // Suelo escalonado completo
  floorPolygon: [
    { x: -12.0, z: 9.0 },
    { x: -12.0, z: -8.5 },
    { x: -4.5, z: -8.5 },
    { x: -4.5, z: -9.2 },
    { x: 4.2, z: -9.2 },
    { x: 4.2, z: -8.5 },
    { x: 12.0, z: -8.5 },
    { x: 12.0, z: 9.0 },
    { x: -12.0, z: 9.0 },
  ],

  // Muros perimetrales continuos
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
      windows: [], // Muro ciego para TV y pizarra
    },
    { p1: { x: 4.2, z: -9.2 }, p2: { x: 4.2, z: -8.5 }, windows: [] },
    {
      p1: { x: 4.2, z: -8.5 },
      p2: { x: 12.0, z: -8.5 },
      windows: [{ offset: 5.5, width: 3.4, height: 2.1 }],
    },
    {
      p1: { x: 12.0, z: -8.5 },
      p2: { x: 12.0, z: 9.0 },
      windows: [
        { offset: 4.5, width: 3.2, height: 2.1 },
        { offset: 11.5, width: 3.2, height: 2.1 },
      ],
    },
  ],

  // Mamparas acústicas frontales alineadas a Z: -2.8
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

  // Muros divisorios interiores
  interiorWalls: {
    kitchenWall: {
      x: -2.0,
      startZ: 3.2,
      endZ: 7.8,
      height: 2.1,
      thickness: 0.28,
    },
    loungeTVWall: {
      startX: 4.8,
      endX: 12.0,
      z: 0.2,
      height: 2.6,
      thickness: 0.3,
    },
  },

  // Alfombras de tránsito con tonos calibrados
  carpets: [
    { width: 2.4, length: 11.2, x: -3.3, z: 2.6, color: "#2B323D" }, // Corredor vertical
    { width: 10.5, length: 2.2, x: -1.5, z: -1.5, color: "#2B323D" }, // Corredor horizontal
    { width: 6.8, length: 4.8, x: 0.0, z: -6.0, color: "#383B44" }, // Reuniones (Gris carbón cálido con textura)
    { width: 3.8, length: 3.6, x: -8.2, z: 0.2, color: "#2E333D" }, // Pod 1
    { width: 3.8, length: 3.6, x: -8.2, z: 3.8, color: "#2E333D" }, // Pod 2
    { width: 6.4, length: 5.4, x: 8.2, z: 4.6, color: "#242B38" }, // Lounge
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
    position: { x: -8.2, y: 0, z: 3.8 },
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
    position: { x: -3.3, y: 0, z: 0.8 },
    rotation: { y: 0 },
  },
};
