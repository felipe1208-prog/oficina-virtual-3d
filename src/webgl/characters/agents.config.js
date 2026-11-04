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

export const AGENTS_CONFIG = [
  {
    id: "dev-yellow",
    color: "#EAB308",
    homeCheckpointId: "dev-pod2-nw",
    initialAnimation: "typing",
  },
  {
    id: "dev-purple",
    color: "#9333EA",
    homeCheckpointId: "dev-pod2-ne",
    initialAnimation: "typing",
  },
  {
    id: "dev-blue",
    color: "#0284C7",
    homeCheckpointId: "dev-pod2-se",
    initialAnimation: "typing",
  },
  {
    id: "dev-orange",
    color: "#EA580C",
    homeCheckpointId: "dev-pod2-sw",
    initialAnimation: "typing",
  },
];
