import * as THREE from "three";

// Catálogo extensible para registrar 20+ animaciones
export const ANIMATION_DEFS = {
  typing: { resource: "animTyping", loop: THREE.LoopRepeat, speed: 1.0 },
  sittingIdle: {
    resource: "animSittingIdle",
    loop: THREE.LoopRepeat,
    speed: 0.85,
  },
  standingIdle: {
    resource: "animStandingIdle",
    loop: THREE.LoopRepeat,
    speed: 0.85,
  },
  walking: { resource: "animWalking", loop: THREE.LoopRepeat, speed: 1.15 },
  sitToType: {
    resource: "animSitToType",
    loop: THREE.LoopOnce,
    speed: 1.0,
    next: "typing",
  },
  typeToSit: {
    resource: "animTypeToSit",
    loop: THREE.LoopOnce,
    speed: 1.0,
    next: "sittingIdle",
  },
  sitToStand: { resource: "animSitToStand", loop: THREE.LoopOnce, speed: 1.0 },
  standToSit: { resource: "animStandToSit", loop: THREE.LoopOnce, speed: 1.0 },
};

// Configuración matemática de los agentes en base a DevArea.js
export const AGENTS_CONFIG = [
  {
    id: "dev-yellow",
    color: "#EAB308",
    role: "seated",
    initialAnimation: "typing",
    // Pod 2, Puesto Norte-Oeste: slotX = -6.70, chairZ = 4.26, mira al Sur (+Z)
    seat: { x: -6.7, y: -0.02, z: 4.26, rotY: 0 },
  },
  {
    id: "dev-purple",
    color: "#9333EA",
    role: "seated",
    initialAnimation: "typing",
    // Pod 2, Puesto Norte-Este: slotX = -5.30, chairZ = 4.26, mira al Sur (+Z)
    seat: { x: -5.3, y: -0.02, z: 4.26, rotY: 0 },
  },
  {
    id: "dev-blue",
    color: "#0284C7",
    role: "seated",
    initialAnimation: "typing",
    // Pod 2, Puesto Sur-Este: slotX = -5.30, chairZ = 6.14, mira al Norte (-Z)
    seat: { x: -5.3, y: -0.02, z: 6.14, rotY: Math.PI },
  },
  {
    id: "agent-walker",
    color: "#EA580C",
    role: "patrol",
    initialAnimation: "walking",
    // Eje central de la alfombra azul vertical (X = -2.35)
    patrol: {
      speed: 0.65,
      y: -0.34,
      waypoints: [
        new THREE.Vector3(-2.35, -0.34, 1.2),
        new THREE.Vector3(-2.35, -0.34, 6.2),
      ],
    },
  },
];
