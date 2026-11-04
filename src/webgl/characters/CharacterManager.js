import { AGENTS_CONFIG } from "./agents.config.js";
import { AgentCharacter } from "./AgentCharacter.js";

export class CharacterManager {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.characters = [];

    this.initAgents();
  }

  initAgents() {
    AGENTS_CONFIG.forEach((cfg) => {
      const agent = new AgentCharacter(cfg, this.resources);
      if (agent.model) {
        this.scene.add(agent.model);
        this.characters.push(agent);
      }
    });
  }

  update(delta) {
    for (let i = 0; i < this.characters.length; i++) {
      this.characters[i].update(delta);
    }
  }
}
