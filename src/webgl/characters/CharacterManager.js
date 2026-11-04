import { Character } from "./Character.js";

export class CharacterManager {
  constructor(experience) {
    this.experience = experience;
    this.characters = [];

    this.initAgents();
  }

  initAgents() {
    // 1. Dev 1 (Cian / Azul): Puesto Frontal Dev Pod tecleando
    const devBlue = new Character(this.experience, {
      name: "Dev-Blue",
      color: "#0284C7",
      position: { x: -6.4, y: 0.0, z: 5.45 },
      rotationY: 0, // Orientado hacia sus pantallas
      initialAnimation: "typing",
    });

    // 2. Dev 2 (Morado / Púrpura): Puesto Contiguo en Dev Pod
    const devPurple = new Character(this.experience, {
      name: "Dev-Purple",
      color: "#9333EA",
      position: { x: -5.3, y: 0.0, z: 5.45 },
      rotationY: 0,
      initialAnimation: "typing",
    });

    // 3. Dev 3 (Amarillo / Ámbar): Puesto Central en Pod individual
    const devYellow = new Character(this.experience, {
      name: "Dev-Yellow",
      color: "#EAB308",
      position: { x: -5.85, y: 0.0, z: 1.45 },
      rotationY: 0,
      initialAnimation: "typing",
    });

    // 4. Agente Peatonal (Naranja): Pasillo central de alfombra caminando
    const agentWalker = new Character(this.experience, {
      name: "Agent-Walker",
      color: "#EA580C",
      position: { x: -2.35, y: 0.0, z: 1.8 },
      rotationY: Math.PI / 2, // Caminando a lo largo del pasillo
      initialAnimation: "walking",
    });

    this.characters.push(devBlue, devPurple, devYellow, agentWalker);
  }

  update(delta) {
    for (let i = 0; i < this.characters.length; i++) {
      this.characters[i].update(delta);
    }
  }
}
