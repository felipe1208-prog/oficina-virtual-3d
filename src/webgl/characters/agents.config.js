import * as THREE from "three";

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

const SEAT_Y = 0.035;

export const AGENTS_CONFIG = [
  // 1. Pod 2 - Puesto Noroeste (Fila Norte, mirando al Sur +Z)
  {
    id: "dev-yellow",
    color: "#EAB308",
    role: "seated",
    initialAnimation: "typing",
    seat: { x: -6.7, y: SEAT_Y, z: 4.18, rotY: 0 },
  },
  // 2. Pod 2 - Puesto Noreste (Fila Norte, mirando al Sur +Z)
  {
    id: "dev-purple",
    color: "#9333EA",
    role: "seated",
    initialAnimation: "typing",
    seat: { x: -5.3, y: SEAT_Y, z: 4.18, rotY: 0 },
  },
  // 3. Pod 2 - Puesto Sureste (Fila Sur, mirando al Norte -Z)
  {
    id: "dev-blue",
    color: "#0284C7",
    role: "seated",
    initialAnimation: "typing",
    seat: { x: -5.3, y: SEAT_Y, z: 6.22, rotY: Math.PI },
  },
  // 4. Pod 2 - Puesto Suroeste (Fila Sur, mirando al Norte -Z)
  {
    id: "dev-orange",
    color: "#EA580C",
    role: "seated",
    initialAnimation: "typing",
    seat: { x: -6.7, y: SEAT_Y, z: 6.22, rotY: Math.PI },
  },
];
