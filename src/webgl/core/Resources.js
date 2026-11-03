import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
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

    this.fbxLoader = new FBXLoader();
  }

  startLoading() {
    if (this.toLoad === 0) {
      this.dispatchEvent(new CustomEvent("ready"));
      return;
    }

    for (const asset of this.assetsList) {
      if (asset.type === "fbx") {
        this.fbxLoader.load(
          asset.path,
          (fbx) => this.onItemLoaded(asset.name, fbx),
          undefined,
          (error) => this.handleError(asset.name, error),
        );
      } else {
        this.gltfLoader.load(
          asset.path,
          (gltf) => this.onItemLoaded(asset.name, gltf),
          undefined,
          (error) => this.handleError(asset.name, error),
        );
      }
    }
  }

  handleError(name, error) {
    console.warn(`[Resources] Error cargando "${name}":`, error);
    const fallback = this.createFallbackModel(name);
    this.onItemLoaded(name, {
      scene: fallback,
      isFallback: true,
      animations: [],
    });
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

  get(name) {
    const resource = this.items.get(name);
    if (!resource) return null;
    return resource.scene ? resource.scene.clone(true) : resource.clone(true);
  }

  getSkinned(name) {
    const resource = this.items.get(name);
    if (!resource) return null;
    return SkeletonUtils.clone(resource.scene || resource);
  }

  getAnimations(name) {
    const resource = this.items.get(name);
    return resource?.animations || [];
  }

  destroy() {
    this.dracoLoader.dispose();
    this.items.clear();
  }
}
