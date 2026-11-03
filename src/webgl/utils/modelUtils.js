import * as THREE from "three";

/**
 * Escala un modelo a dimensiones métricas reales y alinea su base en y = 0
 * @param {THREE.Object3D} model - Modelo a normalizar
 * @param {Object} options - Restricciones de tamaño en metros (Three.js units)
 * @param {number} [options.height] - Altura objetivo
 * @param {number} [options.width] - Ancho objetivo
 * @param {number} [options.depth] - Profundidad objetivo
 * @param {number} [options.maxDim] - Dimensión máxima (eje mayor)
 * @returns {THREE.Group} Contenedor con pivote en la base central
 */
export function fitModel(model, { height, width, depth, maxDim } = {}) {
  const wrapper = new THREE.Group();
  wrapper.add(model);

  // 1. Calcular caja envolvente inicial
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  // 2. Determinar factor de escala
  let scaleFactor = 1;

  if (height && size.y > 0) {
    scaleFactor = height / size.y;
  } else if (width && size.x > 0) {
    scaleFactor = width / size.x;
  } else if (depth && size.z > 0) {
    scaleFactor = depth / size.z;
  } else if (maxDim) {
    const max = Math.max(size.x, size.y, size.z);
    if (max > 0) scaleFactor = maxDim / max;
  }

  model.scale.setScalar(scaleFactor);

  // 3. Recalcular caja tras escalar
  box.setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // 4. Desplazar modelo interno para que la base del wrapper quede en (0, 0, 0)
  model.position.x = -center.x;
  model.position.y = -box.min.y; // Apoya exactamente en la base
  model.position.z = -center.z;

  return wrapper;
}
