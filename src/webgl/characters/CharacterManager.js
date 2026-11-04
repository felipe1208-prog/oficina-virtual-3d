import * as THREE from "three";
import { AgentCharacter } from "./AgentCharacter.js";

export class CharacterManager {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.characters = [];

    this.initAgents();
  }

  getModel() {
    if (typeof this.resources.getSkinned === "function") {
      return this.resources.getSkinned("character");
    }
    const raw = this.resources.get("character");
    return (raw.scene || raw).clone(true);
  }

  getClips() {
    const getClip = (key) => {
      if (typeof this.resources.getAnimations === "function") {
        const list = this.resources.getAnimations(key);
        if (list && list[0]) return list[0];
      }
      const raw = this.resources.get(key);
      return raw?.animations?.[0] || null;
    };

    return {
      typing: getClip("animTyping"),
      sittingIdle: getClip("animSittingIdle"),
      sitToType: getClip("animSitToType"),
      typeToSit: getClip("animTypeToSit"),
      sitToStand: getClip("animSitToStand"),
      standToSit: getClip("animStandToSit"),
      standingIdle: getClip("animStandingIdle"),
      walking: getClip("animWalking"),
    };
  }

  initAgents() {
    const rawClips = this.getClips();

    // 1. Detectar estaciones de trabajo existentes en la escena
    const stations = [];
    this.scene.traverse((obj) => {
      if (
        obj.isGroup &&
        (obj.name.startsWith("station-") || obj.userData?.agentId)
      ) {
        stations.push(obj);
      }
    });

    // Coordenadas manuales calibradas de respaldo (Sillas del Dev Pod)
    // Columna Oeste (miran a +X): X = -6.50 | Columna Este (miran a -X): X = -5.30
    const devConfigs = [
      {
        id: "dev-purple",
        color: "#9333EA", // Morado: Fila Norte, Columna Este (mira al Oeste)
        pos: { x: -5.3, z: 4.2 },
        rotY: Math.PI,
      },
      {
        id: "dev-blue",
        color: "#0284C7", // Cian: Fila Sur, Columna Este (mira al Oeste)
        pos: { x: -5.3, z: 5.6 },
        rotY: Math.PI,
      },
      {
        id: "dev-yellow",
        color: "#EAB308", // Amarillo: Fila Norte, Columna Oeste (mira al Este)
        pos: { x: -6.5, z: 4.2 },
        rotY: 0,
      },
    ];

    devConfigs.forEach((cfg, idx) => {
      const char = new AgentCharacter(
        { id: cfg.id, color: cfg.color },
        this.getModel(),
        rawClips,
      );

      if (stations[idx]) {
        // Anclaje automático nativo a la silla del escritorio
        char.setWorldAnchors(stations[idx]);
      } else {
        // Fallback manual con rotación hacia sus monitores
        char.setSeatPosition(cfg.pos.x, cfg.pos.z, cfg.rotY);
      }

      this.scene.add(char.model);
      this.characters.push(char);
    });

    // 2. Agente Peatonal (Naranja): Patrulla continua de ida y vuelta por el pasillo central
    const agentWalker = new AgentCharacter(
      { id: "agent-walker", color: "#EA580C" },
      this.getModel(),
      rawClips,
    );

    // Posición inicial y waypoints de patrulla a lo largo de la alfombra azul (Z = 1.80)
    agentWalker.model.position.set(-5.5, -0.34, 1.8);
    agentWalker.waypoints = [
      new THREE.Vector3(2.2, -0.34, 1.8),
      new THREE.Vector3(-5.5, -0.34, 1.8),
    ];
    agentWalker.isPatrolling = true;
    agentWalker.currentWaypointIndex = 0;
    agentWalker.setStatus("WALKING");
    agentWalker.playAction("walking", 0.1);

    this.scene.add(agentWalker.model);
    this.characters.push(agentWalker);
  }

  update(delta) {
    for (let i = 0; i < this.characters.length; i++) {
      this.characters[i].update(delta, this.characters);
    }
  }
}
