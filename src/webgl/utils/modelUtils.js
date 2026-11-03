import * as THREE from "three";

/**
 * Escala un modelo estático a dimensiones métricas y apoya su base en y = 0
 */
export function fitModel(model, { height, width, depth, maxDim } = {}) {
  const wrapper = new THREE.Group();
  wrapper.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

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

  box.setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);

  model.position.x = -center.x;
  model.position.y = -box.min.y;
  model.position.z = -center.z;

  return wrapper;
}
