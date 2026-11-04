export class CharacterModel {
  static create(resources, config) {
    let model = null;

    if (typeof resources.getSkinned === "function") {
      model = resources.getSkinned("character");
    } else {
      const raw = resources.get("character");
      model = (raw.scene || raw).clone(true);
    }

    if (!model) {
      console.warn(
        `[CharacterModel] No se pudo instanciar el modelo para ${config.id}`,
      );
      return null;
    }

    model.name = `character-${config.id}`;
    // 1.14 alarga torso y brazos para conectar cojín de silla y teclas del escritorio
    model.scale.setScalar(1.14);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;

        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set(config.color);
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      }
    });

    return model;
  }
}
