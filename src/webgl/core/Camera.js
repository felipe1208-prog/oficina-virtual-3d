import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Camera {
  constructor(experience) {
    this.experience = experience;
    this.sizes = experience.sizes;
    this.scene = experience.scene;
    this.canvas = experience.canvas;

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    // FOV cerrado para emular vista ortogonal/isométrica limpia
    this.instance = new THREE.PerspectiveCamera(
      28,
      this.sizes.width / this.sizes.height,
      0.5,
      150,
    );
    // Coordenadas calculadas para ver la oficina exactamente desde la esquina frontal derecha
    this.instance.position.set(22.0, 24.0, 24.0);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0.5, 0);

    this.controls.maxPolarAngle = Math.PI / 2.35;
    this.controls.minDistance = 15.0;
    this.controls.maxDistance = 65.0;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }

  destroy() {
    this.controls.dispose();
  }
}
