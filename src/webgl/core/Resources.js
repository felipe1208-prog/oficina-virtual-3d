import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export class Resources extends EventTarget {
  constructor(assetsList = []) {
    super();
    this.assetsList = assetsList;
    this.items = new Map();
    this.toLoad = this.assetsList.length;
    this.loaded = 0;

    this.initLoaders();
  }

  initLoaders() {
    // Configuración del decodificador Draco local
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");

    // Cargador principal GLTF/GLB
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  startLoading() {
    if (this.toLoad === 0) {
      this.dispatchEvent(new CustomEvent("ready"));
      return;
    }

    for (const asset of this.assetsList) {
      this.gltfLoader.load(
        asset.path,
        (gltf) => {
          this.onItemLoaded(asset.name, gltf);
        },
        undefined,
        (error) => {
          console.warn(
            `[Resources] Error cargando asset "${asset.name}" en ${asset.path}:`,
            error,
          );
          // Fallback: Genera un cubo neutro para evitar bloquear el arranque
          const fallback = this.createFallbackModel(asset.name);
          this.onItemLoaded(asset.name, { scene: fallback, isFallback: true });
        },
      );
    }
  }

  onItemLoaded(name, resource) {
    this.items.set(name, resource);
    this.loaded++;

    const progressRatio = this.loaded / this.toLoad;

    this.dispatchEvent(
      new CustomEvent("progress", {
        detail: {
          name,
          loaded: this.loaded,
          total: this.toLoad,
          progress: progressRatio,
        },
      }),
    );

    if (this.loaded === this.toLoad) {
      this.dispatchEvent(new CustomEvent("ready"));
    }
  }

  /**
   * Genera un marcador visual procedural si un .glb no se encuentra
   */
  createFallbackModel(name) {
    const group = new THREE.Group();
    group.name = `fallback-${name}`;

    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.25;
    group.add(mesh);

    return group;
  }

  /**
   * Obtiene la escena clonada de un modelo cargado
   */
  get(name) {
    const resource = this.items.get(name);
    if (!resource) {
      console.error(`[Resources] Asset "${name}" no encontrado en la caché.`);
      return null;
    }
    // Retorna un clon del objeto para permitir múltiples instancias en escena
    return resource.scene.clone(true);
  }

  /**
   * Obtiene animaciones de un modelo (ej. character-hyper-casual)
   */
  getAnimations(name) {
    const resource = this.items.get(name);
    return resource?.animations || [];
  }

  destroy() {
    this.dracoLoader.dispose();
    this.items.clear();
  }
}
