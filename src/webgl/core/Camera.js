import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

export class Camera {
  constructor(experience) {
    this.experience = experience;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.frustumSize = 20;
    this.defaultPosition = new THREE.Vector3(20, 20, 20);
    this.defaultTarget = new THREE.Vector3(0, 0, 0);
    this.defaultZoom = 1.0;

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

    this.instance.position.copy(this.defaultPosition);
    this.instance.lookAt(this.defaultTarget);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.defaultTarget);

    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minZoom = 0.6;
    this.controls.maxZoom = 6.0; // Permite acercarse libremente
  }

  focusOn(position) {
    gsap.killTweensOf(this.controls.target);
    gsap.killTweensOf(this.instance);

    // Enfocar a la altura del escritorio (0.75m)
    gsap.to(this.controls.target, {
      x: position.x,
      y: position.y + 0.75,
      z: position.z,
      duration: 1.2,
      ease: "power2.out",
    });

    // Zoom cerrado (3.8 cubre un encuadre de 5 metros)
    gsap.to(this.instance, {
      zoom: 3.8,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => this.instance.updateProjectionMatrix(),
    });
  }

  resetView() {
    gsap.killTweensOf(this.controls.target);
    gsap.killTweensOf(this.instance);

    gsap.to(this.controls.target, {
      x: this.defaultTarget.x,
      y: this.defaultTarget.y,
      z: this.defaultTarget.z,
      duration: 1.0,
      ease: "power2.out",
    });

    gsap.to(this.instance, {
      zoom: this.defaultZoom,
      duration: 1.0,
      ease: "power2.out",
      onUpdate: () => this.instance.updateProjectionMatrix(),
    });
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
