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

    // 1. Dev 1 (Cian / Azul): Pod frontal, sentado en la silla frente al monitor
    const devBlue = new AgentCharacter(
      { id: "dev-blue", color: "#0284C7" },
      this.getModel(),
      rawClips,
    );
    devBlue.setSeatPosition(-6.4, 5.95, 0); // rotY = 0 mira al Norte hacia las pantallas
    this.scene.add(devBlue.model);

    // 2. Dev 2 (Morado): Puesto contiguo derecho
    const devPurple = new AgentCharacter(
      { id: "dev-purple", color: "#9333EA" },
      this.getModel(),
      rawClips,
    );
    devPurple.setSeatPosition(-5.3, 5.95, 0);
    this.scene.add(devPurple.model);

    // 3. Dev 3 (Amarillo): Pod central, sentado en su silla
    const devYellow = new AgentCharacter(
      { id: "dev-yellow", color: "#EAB308" },
      this.getModel(),
      rawClips,
    );
    devYellow.setSeatPosition(-5.85, 3.5, 0);
    this.scene.add(devYellow.model);

    // 4. Agente Peatonal (Naranja): Pasillo central caminando
    const agentWalker = new AgentCharacter(
      { id: "agent-walker", color: "#EA580C" },
      this.getModel(),
      rawClips,
    );
    agentWalker.setWalkingPosition(-2.35, 1.8, Math.PI / 2);
    this.scene.add(agentWalker.model);

    this.characters.push(devBlue, devPurple, devYellow, agentWalker);
  }

  update(delta) {
    for (let i = 0; i < this.characters.length; i++) {
      this.characters[i].update(delta, this.characters);
    }
  }
}
