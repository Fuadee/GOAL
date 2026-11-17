import { Box3, Group, Vector3, type Object3D } from 'three';

// Local, opt-in URLs only. No model fetch happens until a URL is configured.
export const HEALTH_MODELS: { medal: string | null; dracoPath: string | null } = { medal: null, dracoPath: null };
export async function loadHealthModel(url: string, height: number) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
  const loader = new GLTFLoader();
  const draco = HEALTH_MODELS.dracoPath ? new DRACOLoader().setDecoderPath(HEALTH_MODELS.dracoPath) : null;
  if (draco) loader.setDRACOLoader(draco);
  try {
    const gltf = await loader.loadAsync(url);
    const model = gltf.scene;
    const box = new Box3().setFromObject(model), size = box.getSize(new Vector3()), center = box.getCenter(new Vector3());
    const scale = height / Math.max(size.y, .001);
    model.scale.setScalar(scale); model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    const root = new Group(); root.add(model);
    return { root, animations: gltf.animations };
  } finally { draco?.dispose(); }
}
export function disposeObject(root: Object3D) {
  const disposed = new Set<unknown>();
  root.traverse(object => {
    const mesh = object as import('three').Mesh;
    if (mesh.geometry && !disposed.has(mesh.geometry)) { mesh.geometry.dispose(); disposed.add(mesh.geometry); }
    for (const material of mesh.material ? Array.isArray(mesh.material) ? mesh.material : [mesh.material] : []) {
      if (disposed.has(material)) continue;
      for (const value of Object.values(material)) {
        const texture = value as import('three').Texture | null;
        if (texture?.isTexture && !disposed.has(texture)) {
          const image = texture.image as ImageBitmap | undefined;
          if (image && typeof image.close === 'function' && !disposed.has(image)) { image.close(); disposed.add(image); }
          texture.dispose(); disposed.add(texture);
        }
      }
      material.dispose(); disposed.add(material);
    }
  });
}
