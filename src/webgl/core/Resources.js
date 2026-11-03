import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

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
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");

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
          console.warn(`[Resources] Error cargando "${asset.name}":`, error);
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

  createFallbackModel(name) {
    const group = new THREE.Group();
    group.name = `fallback-${name}`;
    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x444d5d,
      roughness: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.25;
    group.add(mesh);
    return group;
  }

  /**
   * Clona objetos estáticos normales (muebles, props)
   */
  get(name) {
    const resource = this.items.get(name);
    if (!resource) return null;
    return resource.scene.clone(true);
  }

  /**
   * Clona modelos con esqueleto/huesos (personajes) sin que colapsen entre sí
   */
  getSkinned(name) {
    const resource = this.items.get(name);
    if (!resource) return null;
    return SkeletonUtils.clone(resource.scene);
  }

  destroy() {
    this.dracoLoader.dispose();
    this.items.clear();
  }
}
