import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

export class Character {
  constructor(experience, options = {}) {
    this.experience = experience;
    this.scene = experience.scene;
    this.resources = experience.resources;

    this.name = options.name || "Agent";
    this.color = options.color || "#0284C7";
    this.scale = options.scale || 0.0095; // Calibrado para la escala hyper-casual del diorama
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.rotationY = options.rotationY || 0;

    this.actions = {};
    this.currentAction = null;

    this.initModel();
    this.initAnimations(options.initialAnimation || "sittingIdle");
  }

  initModel() {
    const rawGltf = this.resources.get("character");
    if (!rawGltf) {
      console.warn(
        `[Character] No se encontró el recurso 'character' en resources.`,
      );
      return;
    }

    // SkeletonUtils es indispensable para clonar SkinnedMesh sin romper el rig
    const rawScene = rawGltf.scene ? rawGltf.scene : rawGltf;
    this.model = SkeletonUtils.clone(rawScene);
    this.model.name = `character-${this.name}`;

    // Material plano y satinado estilizado monocromático (azul, púrpura, amarillo, etc.)
    const charMat = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.35,
      metalness: 0.05,
    });

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = charMat;
      }
    });

    this.model.scale.setScalar(this.scale);
    this.model.position.set(this.position.x, this.position.y, this.position.z);
    this.model.rotation.y = this.rotationY;

    this.scene.add(this.model);
  }

  initAnimations(defaultAnimName) {
    if (!this.model) return;

    this.mixer = new THREE.AnimationMixer(this.model);

    // Mapa de animaciones registradas en el ASSETS_MANIFEST
    const animMap = {
      typing: "animTyping",
      sittingIdle: "animSittingIdle",
      walking: "animWalking",
      standingIdle: "animStandingIdle",
      sitToType: "animSitToType",
      typeToSit: "animTypeToSit",
      sitToStand: "animSitToStand",
      standToSit: "animStandToSit",
    };

    // Carga de clips FBX en el AnimationMixer del personaje
    Object.entries(animMap).forEach(([key, resourceName]) => {
      const fbx = this.resources.get(resourceName);
      if (fbx && fbx.animations && fbx.animations.length > 0) {
        const clip = fbx.animations[0].clone();
        clip.name = key;
        this.actions[key] = this.mixer.clipAction(clip);
      }
    });

    this.playAnimation(defaultAnimName);
  }

  playAnimation(name, duration = 0.4) {
    if (!this.actions[name]) {
      console.warn(
        `[Character] Animación '${name}' no disponible para ${this.name}`,
      );
      return;
    }

    const prevAction = this.currentAction;
    const nextAction = this.actions[name];

    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(duration);
    }

    nextAction.reset().fadeIn(duration).play();
    this.currentAction = nextAction;
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
