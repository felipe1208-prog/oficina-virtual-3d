export const ASSETS_MANIFEST = [
  // Personajes y Animaciones Base
  {
    name: "character",
    type: "gltf",
    path: "/models/characters/character-hyper-casual.glb",
  },
  { name: "animTyping", type: "fbx", path: "/models/animations/Typing.fbx" },
  {
    name: "animSittingIdle",
    type: "fbx",
    path: "/models/animations/Sitting Idle.fbx",
  },
  {
    name: "animSitToType",
    type: "fbx",
    path: "/models/animations/Sit To Type.fbx",
  },
  {
    name: "animTypeToSit",
    type: "fbx",
    path: "/models/animations/Type To Sit.fbx",
  },
  {
    name: "animSitToStand",
    type: "fbx",
    path: "/models/animations/Sit To Stand.fbx",
  },
  {
    name: "animStandToSit",
    type: "fbx",
    path: "/models/animations/Stand To Sit.fbx",
  },
  {
    name: "animStandingIdle",
    type: "fbx",
    path: "/models/animations/Standing Idle.fbx",
  },
  { name: "animWalking", type: "fbx", path: "/models/animations/Walking.fbx" },

  // Nuevas Animaciones de Interacción y Ocio
  {
    name: "animButtonPushing",
    type: "fbx",
    path: "/models/animations/Button Pushing.fbx",
  },
  {
    name: "animSittingCheer",
    type: "fbx",
    path: "/models/animations/Cheering While Sitting.fbx",
  },
  {
    name: "animDrinking",
    type: "fbx",
    path: "/models/animations/Drinking.fbx",
  },
  {
    name: "animPointing",
    type: "fbx",
    path: "/models/animations/Pointing.fbx",
  },
  {
    name: "animSittingDisbelief",
    type: "fbx",
    path: "/models/animations/Sitting Disbelief.fbx",
  },
  {
    name: "animSittingTalking",
    type: "fbx",
    path: "/models/animations/Sitting Talking.fbx",
  },
  {
    name: "animTalking",
    type: "fbx",
    path: "/models/animations/Talking.fbx",
  },
  {
    name: "animTexting",
    type: "fbx",
    path: "/models/animations/Texting While Standing.fbx",
  },
  {
    name: "animWalkingTurn180",
    type: "fbx",
    path: "/models/animations/Walking Turn 180.fbx",
  },

  // Estaciones de Trabajo (Dev Pods y Supervisor)
  {
    name: "desk",
    type: "gltf",
    path: "/models/workstations/desk-adjustable.glb",
  },
  {
    name: "chair",
    type: "gltf",
    path: "/models/workstations/chair-office.glb",
  },
  { name: "monitor", type: "gltf", path: "/models/workstations/monitor.glb" },
  { name: "keyboard", type: "gltf", path: "/models/workstations/keyboard.glb" },
  { name: "mouse", type: "gltf", path: "/models/workstations/mouse.glb" },
  { name: "mousepad", type: "gltf", path: "/models/workstations/mousepad.glb" },

  // Arquitectura y Estructura
  {
    name: "doorwayOpen",
    type: "gltf",
    path: "/models/environment/doorway-open.glb",
  },
  {
    name: "doorwayClosed",
    type: "gltf",
    path: "/models/environment/doorway-closed.glb",
  },
  {
    name: "whiteboard",
    type: "gltf",
    path: "/models/environment/whiteboard.glb",
  },
  {
    name: "woolCarpetRed",
    type: "gltf",
    path: "/models/environment/wool-carpet-red.glb",
  },
  { name: "window", type: "gltf", path: "/models/environment/window.glb" },
  {
    name: "ceilingLight",
    type: "gltf",
    path: "/models/environment/ceiling-light.glb",
  },
  {
    name: "ceilingFan",
    type: "gltf",
    path: "/models/environment/ceiling-fan.glb",
  },
  {
    name: "lightSwitch",
    type: "gltf",
    path: "/models/environment/light-switch.glb",
  },
  { name: "trashcan", type: "gltf", path: "/models/environment/trashcan.glb" },

  // Vegetación de Interior
  {
    name: "houseplant",
    type: "gltf",
    path: "/models/environment/houseplant.glb",
  },
  {
    name: "plantFlowerPot",
    type: "gltf",
    path: "/models/environment/plant-flower-pot.glb",
  },
  {
    name: "plantFiddleLeaf",
    type: "gltf",
    path: "/models/environment/plant-fiddle-leaf.glb",
  },

  // Cocina y Cafetería
  {
    name: "coffeeMachine",
    type: "gltf",
    path: "/models/kitchen-stress/coffee-machine.glb",
  },
  {
    name: "coffeeMug",
    type: "gltf",
    path: "/models/kitchen-stress/coffee-mug.glb",
  },
  {
    name: "waterCooler",
    type: "gltf",
    path: "/models/kitchen-stress/water-cooler.glb",
  },
  {
    name: "waterGlass",
    type: "gltf",
    path: "/models/kitchen-stress/water-glass.glb",
  },
  {
    name: "sodaCan",
    type: "gltf",
    path: "/models/kitchen-stress/soda-can.glb",
  },
  {
    name: "sodaCanCrushed",
    type: "gltf",
    path: "/models/kitchen-stress/soda-can-crushed.glb",
  },
  { name: "fridge", type: "gltf", path: "/models/kitchen-stress/fridge.glb" },
  {
    name: "vendingMachine",
    type: "gltf",
    path: "/models/kitchen-stress/vending-machine.glb",
  },

  // Lounge y Recreación
  {
    name: "couchMedium",
    type: "gltf",
    path: "/models/lounge/couch-medium.glb",
  },
  { name: "couchSmall", type: "gltf", path: "/models/lounge/couch-small.glb" },
  {
    name: "tableCoffee",
    type: "gltf",
    path: "/models/lounge/table-coffee.glb",
  },
  {
    name: "tableSideRound",
    type: "gltf",
    path: "/models/lounge/table-side-round.glb",
  },
  {
    name: "tvFlatScreen",
    type: "gltf",
    path: "/models/lounge/tv-flat-screen.glb",
  },
  { name: "tvRemote", type: "gltf", path: "/models/lounge/tv-remote.glb" },
  {
    name: "cubeCabinet",
    type: "gltf",
    path: "/models/lounge/cube-cabinet.glb",
  },
  {
    name: "pingPongTable",
    type: "gltf",
    path: "/models/lounge/ping-pong-table.glb",
  },
  {
    name: "pingPongPaddle",
    type: "gltf",
    path: "/models/lounge/ping-pong-paddle.glb",
  },
  {
    name: "pingPongBall",
    type: "gltf",
    path: "/models/lounge/ping-pong-ball.glb",
  },
  {
    name: "arcadeMachine",
    type: "gltf",
    path: "/models/lounge/arcade-machine.glb",
  },
];
