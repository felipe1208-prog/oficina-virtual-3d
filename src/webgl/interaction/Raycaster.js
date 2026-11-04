import * as THREE from "three";

export class RaycasterHandler {
  constructor(experience, onSelect) {
    this.experience = experience;
    this.camera = this.experience.camera.instance;
    this.canvas = this.experience.canvas;
    this.onSelect = onSelect;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.pointerStartPos = { x: 0, y: 0 };
    this.isDragging = false;

    this.bindEvents();
  }

  bindEvents() {
    this.onPointerDown = (e) => {
      this.pointerStartPos = { x: e.clientX, y: e.clientY };
      this.isDragging = false;
    };

    this.onPointerMove = (e) => {
      const dist = Math.hypot(
        e.clientX - this.pointerStartPos.x,
        e.clientY - this.pointerStartPos.y,
      );
      if (dist > 5) {
        this.isDragging = true; // El usuario está orbitando la cámara, no seleccionando
      }
    };

    this.onPointerUp = (e) => {
      if (this.isDragging) return; // Ignorar si fue arrastre

      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.checkIntersection();
    };

    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
  }

  checkIntersection() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.experience.scene.children,
      true,
    );

    if (intersects.length > 0) {
      // Buscar el contenedor padre que tenga el ID del agente
      let current = intersects[0].object;
      let foundAgentId = null;

      while (current && current.parent) {
        if (current.userData && current.userData.agentId) {
          foundAgentId = current.userData.agentId;
          break;
        }
        current = current.parent;
      }

      if (foundAgentId && this.onSelect) {
        this.onSelect(foundAgentId);
      } else if (!foundAgentId && this.onSelect) {
        this.onSelect(null); // Clic en el suelo o espacio vacío: deseleccionar
      }
    } else if (this.onSelect) {
      this.onSelect(null);
    }
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
  }
}
