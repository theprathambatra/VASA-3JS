import * as THREE from 'three';
import { GROOVE, INNER, OUTER, SPIRAL, type OutlinePoint } from './vasaIconOutline';

/**
 * Procedural, editable VASA icon. The frontal outline follows the supplied logo;
 * depth and the finish of the sides are visual interpretations of a flat graphic.
 *
 * The outline lives in source coordinates instead of a PNG or a textured plane.
 * A consumer can animate root, swap the materials, or export the resulting mesh.
 */
export function createVasaIconModel(options: { depth?: number } = {}) {
  const depth = options.depth ?? 0.14;
  const centerX = 86.8;
  const centerY = 71.4;
  const pixelsPerUnit = 49;
  const mapPoint = ([px, py]: OutlinePoint) =>
    new THREE.Vector2((px - centerX) / pixelsPerUnit, (centerY - py) / pixelsPerUnit);

  function ring(points: readonly OutlinePoint[]) {
    const path = new THREE.Path();
    const first = mapPoint(points[0]);
    path.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      const point = mapPoint(points[i]);
      path.lineTo(point.x, point.y);
    }
    path.closePath();
    return path;
  }

  const shape = new THREE.Shape();
  const first = mapPoint(OUTER[0]);
  shape.moveTo(first.x, first.y);
  for (let i = 1; i < OUTER.length; i++) {
    const point = mapPoint(OUTER[i]);
    shape.lineTo(point.x, point.y);
  }
  shape.closePath();
  // These three open spaces are part of the logo artwork, not surface decals.
  shape.holes.push(ring(GROOVE), ring(INNER), ring(SPIRAL));

  const bevel = Math.min(depth * 0.032, 0.0045);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 4,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelThickness: bevel,
    bevelSize: bevel,
    material: 0,
    extrudeMaterial: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();

  // The source face has a sampled median RGB of (166, 125, 68).
  // Metallic reflections intentionally make the rendered finish responsive to light.
  const face = new THREE.MeshPhysicalMaterial({
    color: 0xa67d44,
    metalness: 0.72,
    roughness: 0.32,
    clearcoat: 0.42,
    clearcoatRoughness: 0.22,
    side: THREE.DoubleSide,
  });
  const edge = new THREE.MeshPhysicalMaterial({
    color: 0x95642e,
    metalness: 0.85,
    roughness: 0.28,
    clearcoat: 0.38,
    clearcoatRoughness: 0.2,
  });
  const icon = new THREE.Mesh(geometry, [face, edge]);
  icon.name = 'VASA calligraphic icon';
  icon.userData.partId = 'icon';
  icon.castShadow = true;
  icon.receiveShadow = true;

  const root = new THREE.Group();
  root.name = 'VASA | icon mark';
  root.add(icon);
  root.userData.sculptRuntime = {
    parts: { icon },
    pivots: { rotation: root },
    approximateDimensions: new THREE.Vector3(2.27, 2.62, depth),
    inferredParts: ['side depth', 'metallic finish'],
  };
  return { root, icon, parts: { icon }, materials: { face, edge } };
}
