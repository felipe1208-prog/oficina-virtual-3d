import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Camera {
  constructor(experience) {
    this.experience = experience;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    // Tamaño del campo visual ortográfico
    this.frustumSize = 20;

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    const aspect = this.sizes.width / this.sizes.height;
    const halfH = this.frustumSize / 2;
    const halfW = halfH * aspect;

    this.instance = new THREE.OrthographicCamera(
      -halfW,
      halfW,
      halfH,
      -halfH,
      0.1,
      100,
    );

    // Posición isométrica diagonal estándar
    this.instance.position.set(20, 20, 20);
    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);

    // Restricciones para mantener la vista aérea limpia
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minZoom = 0.6;
    this.controls.maxZoom = 2.2;
  }

  resize() {
    const aspect = this.sizes.width / this.sizes.height;
    const halfH = this.frustumSize / 2;
    const halfW = halfH * aspect;

    this.instance.left = -halfW;
    this.instance.right = halfW;
    this.instance.top = halfH;
    this.instance.bottom = -halfH;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }

  destroy() {
    this.controls.dispose();
  }
}
