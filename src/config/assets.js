/**
 * Catálogo declarativo de assets 3D de la oficina.
 * Rutas relativas servidas estáticamente desde /public/
 */

export const ASSETS_MANIFEST = [
  // Personaje
  { name: "character", path: "/models/characters/character-hyper-casual.glb" },

  // Estaciones de trabajo
  { name: "desk", path: "/models/workstations/desk-adjustable.glb" },
  { name: "chair", path: "/models/workstations/chair-office.glb" },
  { name: "monitor", path: "/models/workstations/monitor.glb" },
  { name: "keyboard", path: "/models/workstations/keyboard.glb" },
  { name: "mouse", path: "/models/workstations/mouse.glb" },
  { name: "mousepad", path: "/models/workstations/mousepad.glb" },

  // Cocina & Estrés
  { name: "coffeeMachine", path: "/models/kitchen-stress/coffee-machine.glb" },
  { name: "coffeeMug", path: "/models/kitchen-stress/coffee-mug.glb" },
  { name: "waterCooler", path: "/models/kitchen-stress/water-cooler.glb" },
  { name: "sodaCan", path: "/models/kitchen-stress/soda-can.glb" },
  {
    name: "sodaCanCrushed",
    path: "/models/kitchen-stress/soda-can-crushed.glb",
  },

  // Zona Lounge & Ocio
  { name: "pingPongTable", path: "/models/lounge/ping-pong-table.glb" },
  { name: "pingPongPaddle", path: "/models/lounge/ping-pong-paddle.glb" },
  { name: "pingPongBall", path: "/models/lounge/ping-pong-ball.glb" },
  { name: "couchMedium", path: "/models/lounge/couch-medium.glb" },
  { name: "couchSmall", path: "/models/lounge/couch-small.glb" },
  { name: "tvScreen", path: "/models/lounge/tv-flat-screen.glb" },
  { name: "tvRemote", path: "/models/lounge/tv-remote.glb" },
  { name: "coffeeTable", path: "/models/lounge/table-coffee.glb" },

  // Entorno y Props
  { name: "ceilingFan", path: "/models/environment/ceiling-fan.glb" },
  { name: "ceilingLight", path: "/models/environment/ceiling-light.glb" },
  { name: "lightSwitch", path: "/models/environment/light-switch.glb" },
  { name: "trashcan", path: "/models/environment/trashcan.glb" },
  { name: "window", path: "/models/environment/window.glb" },
  { name: "houseplant", path: "/models/environment/houseplant.glb" },
  {
    name: "animTyping",
    type: "fbx",
    path: "/models/animations/Typing.fbx",
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
];
