import * as THREE from "three";

export const CHECKPOINT_TYPES = {
  WORKSTATION: "workstation", // Escritorios principales
  ACTION_STATION: "action_station", // Cafeteras, nevera, arcade, ping pong, pizarras
  WAITING_SEAT: "waiting_seat", // Asientos de espera (Lounge, Taburetes, Puffs, Bancos)
  MEETING_SEAT: "meeting_seat", // Sillas de conferencia
};

export const CHECKPOINTS = {
  // ==========================================
  // 1. ZONA DESARROLLO (DevArea)
  // ==========================================
  // Pod 2 (Bancada Central)
  "dev-pod2-nw": {
    id: "dev-pod2-nw",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -6.7, y: 0.035, z: 4.18 },
    rotY: 0,
    actions: ["typing", "sittingIdle", "sitToType", "typeToSit"],
    isOccupied: false,
    reservedBy: null,
  },
  "dev-pod2-ne": {
    id: "dev-pod2-ne",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -5.3, y: 0.035, z: 4.18 },
    rotY: 0,
    actions: ["typing", "sittingIdle", "sitToType", "typeToSit"],
    isOccupied: false,
    reservedBy: null,
  },
  "dev-pod2-sw": {
    id: "dev-pod2-sw",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -6.7, y: 0.035, z: 6.22 },
    rotY: Math.PI,
    actions: ["typing", "sittingIdle", "sitToType", "typeToSit"],
    isOccupied: false,
    reservedBy: null,
  },
  "dev-pod2-se": {
    id: "dev-pod2-se",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -5.3, y: 0.035, z: 6.22 },
    rotY: Math.PI,
    actions: ["typing", "sittingIdle", "sitToType", "typeToSit"],
    isOccupied: false,
    reservedBy: null,
  },

  // Pod 1 (Bancada Oeste)
  "dev-pod1-nw": {
    id: "dev-pod1-nw",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -10.3, y: 0.035, z: 4.18 },
    rotY: 0,
    actions: ["typing", "sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "dev-pod1-ne": {
    id: "dev-pod1-ne",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -8.9, y: 0.035, z: 4.18 },
    rotY: 0,
    actions: ["typing", "sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "dev-pod1-sw": {
    id: "dev-pod1-sw",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -10.3, y: 0.035, z: 6.22 },
    rotY: Math.PI,
    actions: ["typing", "sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "dev-pod1-se": {
    id: "dev-pod1-se",
    zone: "dev-area",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -8.9, y: 0.035, z: 6.22 },
    rotY: Math.PI,
    actions: ["typing", "sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },

  // ==========================================
  // 2. COCINA & COFFEE BAR (CoffeeArea)
  // ==========================================
  // Estaciones de Acción (De pie)
  "kitchen-espresso": {
    id: "kitchen-espresso",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: -1.05, y: -0.34, z: 6.45 },
    rotY: -Math.PI / 2, // Mira hacia la encimera al Oeste
    actions: ["makeCoffee", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "kitchen-drip-coffee": {
    id: "kitchen-drip-coffee",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: -1.05, y: -0.34, z: 5.75 },
    rotY: -Math.PI / 2,
    actions: ["makeCoffee", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "kitchen-water-cooler": {
    id: "kitchen-water-cooler",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: -1.1, y: -0.34, z: 4.0 },
    rotY: -Math.PI / 2,
    actions: ["drinkWater", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "kitchen-fridge": {
    id: "kitchen-fridge",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: -1.05, y: -0.34, z: 7.38 },
    rotY: -Math.PI / 2,
    actions: ["openFridge", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "kitchen-sink": {
    id: "kitchen-sink",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: -1.05, y: -0.34, z: 4.95 },
    rotY: -Math.PI / 2,
    actions: ["washHands", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },

  // Asientos de Espera: Taburetes de la Barra[cite: 26]
  "barstool-1": {
    id: "barstool-1",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 0.78, y: 0.22, z: 5.05 },
    rotY: -Math.PI / 2, // Mirando al Oeste hacia la barra
    actions: ["sittingIdle", "drinkCoffee"],
    isOccupied: false,
    reservedBy: null,
  },
  "barstool-2": {
    id: "barstool-2",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 0.78, y: 0.22, z: 5.7 },
    rotY: -Math.PI / 2,
    actions: ["sittingIdle", "drinkCoffee"],
    isOccupied: false,
    reservedBy: null,
  },
  "barstool-3": {
    id: "barstool-3",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 0.78, y: 0.22, z: 6.35 },
    rotY: -Math.PI / 2,
    actions: ["sittingIdle", "drinkCoffee"],
    isOccupied: false,
    reservedBy: null,
  },
  "barstool-4": {
    id: "barstool-4",
    zone: "coffee-kitchen",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 0.78, y: 0.22, z: 7.0 },
    rotY: -Math.PI / 2,
    actions: ["sittingIdle", "drinkCoffee"],
    isOccupied: false,
    reservedBy: null,
  },

  // ==========================================
  // 3. MULTIMEDIA LOUNGE (LoungeArea)[cite: 28]
  // ==========================================
  // Sofá Sur (3 plazas)[cite: 28]
  "lounge-sofa-s1": {
    id: "lounge-sofa-s1",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 7.4, y: 0.035, z: 5.65 },
    rotY: Math.PI, // Mira al Norte hacia la TV
    actions: ["sittingIdle", "watchTV"],
    isOccupied: false,
    reservedBy: null,
  },
  "lounge-sofa-s2": {
    id: "lounge-sofa-s2",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 8.0, y: 0.035, z: 5.65 },
    rotY: Math.PI,
    actions: ["sittingIdle", "watchTV"],
    isOccupied: false,
    reservedBy: null,
  },
  "lounge-sofa-s3": {
    id: "lounge-sofa-s3",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 8.6, y: 0.035, z: 5.65 },
    rotY: Math.PI,
    actions: ["sittingIdle", "watchTV"],
    isOccupied: false,
    reservedBy: null,
  },

  // Sofá Oeste (2 plazas)[cite: 28]
  "lounge-sofa-w1": {
    id: "lounge-sofa-w1",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 5.95, y: 0.035, z: 3.8 },
    rotY: Math.PI / 2, // Mira al Este hacia la mesa de centro
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "lounge-sofa-w2": {
    id: "lounge-sofa-w2",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 5.95, y: 0.035, z: 4.5 },
    rotY: Math.PI / 2,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },

  // Butacas individuales Este[cite: 28]
  "lounge-armchair-ne": {
    id: "lounge-armchair-ne",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 10.05, y: 0.035, z: 3.35 },
    rotY: -Math.PI / 2, // Mira al Oeste
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "lounge-armchair-se": {
    id: "lounge-armchair-se",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 10.05, y: 0.035, z: 4.95 },
    rotY: -Math.PI / 2,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },

  // Puffs contemporáneos[cite: 28]
  "lounge-puff-orange": {
    id: "lounge-puff-orange",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 6.65, y: -0.15, z: 2.45 },
    rotY: 0,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "lounge-puff-blue": {
    id: "lounge-puff-blue",
    zone: "lounge-tv",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 9.35, y: -0.15, z: 5.75 },
    rotY: Math.PI,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },

  // ==========================================
  // 4. ZONA PING-PONG & OCIO (PingPongArea)[cite: 24]
  // ==========================================
  "pingpong-player-north": {
    id: "pingpong-player-north",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: 7.5, y: -0.34, z: -6.2 },
    rotY: 0, // Mira al Sur hacia la mesa
    actions: ["playPingPong", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "pingpong-player-south": {
    id: "pingpong-player-south",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: 7.5, y: -0.34, z: -2.8 },
    rotY: Math.PI, // Mira al Norte hacia la mesa
    actions: ["playPingPong", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "arcade-machine": {
    id: "arcade-machine",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: 6.2, y: -0.34, z: -0.85 },
    rotY: Math.PI, // Mira hacia la pared sur donde está la recreativa
    actions: ["playArcade", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "vending-snacks": {
    id: "vending-snacks",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: 9.2, y: -0.34, z: -0.85 },
    rotY: Math.PI,
    actions: ["buyVending", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "vending-drinks": {
    id: "vending-drinks",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: 10.45, y: -0.34, z: -0.85 },
    rotY: Math.PI,
    actions: ["buyVending", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "pingpong-whiteboard": {
    id: "pingpong-whiteboard",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: 4.85, y: -0.34, z: -4.5 },
    rotY: -Math.PI / 2, // Mira a la mampara acristalada
    actions: ["viewTournament", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },

  // Asientos de Espectador Ping-Pong[cite: 24]
  "pingpong-bench": {
    id: "pingpong-bench",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 8.1, y: -0.12, z: -8.0 },
    rotY: 0,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "pingpong-spectator-sofa": {
    id: "pingpong-spectator-sofa",
    zone: "ping-pong",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: 10.95, y: 0.035, z: -4.5 },
    rotY: -Math.PI / 2,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },

  // ==========================================
  // 5. SALA DE REUNIONES (MeetingRoom)[cite: 23]
  // ==========================================
  // Puesto de presentación frente a pantalla / pizarra[cite: 23]
  "meeting-presenter": {
    id: "meeting-presenter",
    zone: "meeting-room",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: 0.0, y: -0.34, z: -7.8 },
    rotY: 0, // Mirando a la mesa y a los participantes
    actions: ["presenting", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  // Sillas de conferencia[cite: 23]
  "meeting-chair-n1": {
    id: "meeting-chair-n1",
    zone: "meeting-room",
    type: CHECKPOINT_TYPES.MEETING_SEAT,
    pos: { x: -1.35, y: 0.035, z: -6.95 },
    rotY: 0,
    actions: ["sittingIdle", "listening"],
    isOccupied: false,
    reservedBy: null,
  },
  "meeting-chair-n2": {
    id: "meeting-chair-n2",
    zone: "meeting-room",
    type: CHECKPOINT_TYPES.MEETING_SEAT,
    pos: { x: 0.0, y: 0.035, z: -6.95 },
    rotY: 0,
    actions: ["sittingIdle", "listening"],
    isOccupied: false,
    reservedBy: null,
  },
  "meeting-chair-n3": {
    id: "meeting-chair-n3",
    zone: "meeting-room",
    type: CHECKPOINT_TYPES.MEETING_SEAT,
    pos: { x: 1.35, y: 0.035, z: -6.95 },
    rotY: 0,
    actions: ["sittingIdle", "listening"],
    isOccupied: false,
    reservedBy: null,
  },
  "meeting-chair-s1": {
    id: "meeting-chair-s1",
    zone: "meeting-room",
    type: CHECKPOINT_TYPES.MEETING_SEAT,
    pos: { x: -1.35, y: 0.035, z: -5.05 },
    rotY: Math.PI,
    actions: ["sittingIdle", "listening"],
    isOccupied: false,
    reservedBy: null,
  },
  "meeting-chair-s2": {
    id: "meeting-chair-s2",
    zone: "meeting-room",
    type: CHECKPOINT_TYPES.MEETING_SEAT,
    pos: { x: 0.0, y: 0.035, z: -5.05 },
    rotY: Math.PI,
    actions: ["sittingIdle", "listening"],
    isOccupied: false,
    reservedBy: null,
  },
  "meeting-chair-s3": {
    id: "meeting-chair-s3",
    zone: "meeting-room",
    type: CHECKPOINT_TYPES.MEETING_SEAT,
    pos: { x: 1.35, y: 0.035, z: -5.05 },
    rotY: Math.PI,
    actions: ["sittingIdle", "listening"],
    isOccupied: false,
    reservedBy: null,
  },

  // ==========================================
  // 6. OFICINA DE SUPERVISOR (SupervisorOffice)[cite: 25]
  // ==========================================
  "supervisor-desk": {
    id: "supervisor-desk",
    zone: "supervisor",
    type: CHECKPOINT_TYPES.WORKSTATION,
    pos: { x: -8.4, y: 0.035, z: -6.5 },
    rotY: 0,
    actions: ["typing", "sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "supervisor-guest-l": {
    id: "supervisor-guest-l",
    zone: "supervisor",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: -9.1, y: 0.035, z: -4.6 },
    rotY: Math.PI - 0.18,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "supervisor-guest-r": {
    id: "supervisor-guest-r",
    zone: "supervisor",
    type: CHECKPOINT_TYPES.WAITING_SEAT,
    pos: { x: -7.7, y: 0.035, z: -4.6 },
    rotY: Math.PI + 0.18,
    actions: ["sittingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
  "supervisor-bookcase": {
    id: "supervisor-bookcase",
    zone: "supervisor",
    type: CHECKPOINT_TYPES.ACTION_STATION,
    pos: { x: -5.5, y: -0.34, z: -7.3 },
    rotY: Math.PI,
    actions: ["browseBooks", "standingIdle"],
    isOccupied: false,
    reservedBy: null,
  },
};
