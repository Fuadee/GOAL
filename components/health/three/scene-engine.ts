import {
  ACESFilmicToneMapping, AmbientLight, AnimationMixer, BoxGeometry,
  CylinderGeometry, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial,
  OrthographicCamera, PerspectiveCamera, Scene, TorusGeometry, WebGLRenderer
} from 'three';
import { disposeObject, HEALTH_MODELS, loadHealthModel } from './loaders';
import type { Anchor, QualityTier, SceneController, SceneKind } from './three.types';
import { createShoeStage } from './shoe-scene';
import { createResponsiveTrack } from './responsive-track';

const LIME = 0xc6ff38;
const surface = (color: number, glow = 0, metal = .55) => new MeshStandardMaterial({ color, metalness: metal, roughness: .36, emissive: color, emissiveIntensity: glow });
function mesh(parent: Group | Scene, geometry: import('three').BufferGeometry, material: MeshStandardMaterial, position = [0, 0, 0]) {
  const object = new Mesh(geometry, material); object.position.set(...position as [number, number, number]); parent.add(object); return object;
}

function medal(reduced: boolean) {
  const root = new Group(), gold = surface(0xc6e68b, .13, .85), lime = surface(LIME, .5), dark = surface(0x253d29);
  const disc = mesh(root, new CylinderGeometry(.79, .79, .17, reduced ? 32 : 64), gold); disc.rotation.x = Math.PI / 2;
  mesh(root, new TorusGeometry(.69, .035, 8, 64), lime, [0, 0, .11]);
  const inset = mesh(root, new CylinderGeometry(.6, .6, .02, 48), dark, [0, 0, .1]); inset.rotation.x = Math.PI / 2;
  const cup = mesh(root, new CylinderGeometry(.27, .14, .33, 24), gold, [0, .12, .19]);
  mesh(root, new BoxGeometry(.06, .23, .06), gold, [0, -.14, .21]);
  mesh(root, new BoxGeometry(.34, .06, .1), gold, [0, -.28, .21]);
  for (const x of [-.25, .25]) mesh(root, new TorusGeometry(.13, .026, 8, 24), gold, [x, .13, .2]);
  for (const x of [-.23, .23]) { const ribbon = mesh(root, new BoxGeometry(.25, .65, .04), lime, [x, .94, -.1]); ribbon.rotation.z = x > 0 ? -.27 : .27; }
  cup.rotation.z = 0; root.position.y = -.15;
  return root;
}

export function createHealthScene(host: HTMLElement, kind: SceneKind, tier: Exclude<QualityTier,'fallback'>, onAnchors: (anchors: Anchor[]) => void, onFailure: () => void): SceneController {
  const reduced = tier === 'reduced';
  const mobileShoe = kind==='shoe' && matchMedia('(max-width:767px)').matches;
  const renderer = new WebGLRenderer({ alpha: true, antialias: !reduced || mobileShoe || (kind==='track'&&matchMedia('(max-width:767px)').matches), powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, reduced && !mobileShoe ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0); renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.45;
  renderer.domElement.tabIndex = -1; host.appendChild(renderer.domElement);
  const scene = new Scene();
  const camera = kind === 'track' ? new OrthographicCamera(-5, 5, 3, -3, .1, 50) : new PerspectiveCamera(34, 1, .1, 50);
  if (kind === 'track') { camera.position.set(3, 8, 10); camera.lookAt(0, 0, 0); }
  else if (kind === 'shoe') { camera.position.set(2.1, 2.6, 6.7); camera.lookAt(0, 1.05, 0); renderer.toneMappingExposure=1.1; }
  else { camera.position.set(0, .3, 4.6); camera.lookAt(0, .2, 0); }
  scene.add(new HemisphereLight(0xeaffd2, 0x193d39, 2.4), new AmbientLight(0xffffff, .6));
  const key = new DirectionalLight(0xffffff, 3); key.position.set(3, 5, 5); scene.add(key);
  const rim = new DirectionalLight(LIME, 4); rim.position.set(-4, 3, -2); scene.add(rim);
  const content = new Group(); scene.add(content);
  const shoe = kind === 'shoe' ? createShoeStage(renderer,scene,reduced) : null;
  const track = kind === 'track' ? createResponsiveTrack(renderer,scene,camera as OrthographicCamera,reduced,onAnchors) : null;
  const award = kind === 'medal' ? medal(reduced) : null;
  if (award) content.add(award);
  let disposed = false, active = false, raf = 0, previous = 0, elapsed = 0, draws = 0;
  let mixer: AnimationMixer | null = null;
  let lastRotationCommand = 0;
  let model: Group | null = null;
  const url = kind === 'medal' ? HEALTH_MODELS.medal : null;
  if (url) void loadHealthModel(url, 2.2).then(loaded => {
    if (disposed) { disposeObject(loaded.root); return; }
    model = loaded.root; content.add(model);
    if (award) award.visible = false;
    if (loaded.animations.length && !reduced) { mixer = new AnimationMixer(model); mixer.clipAction(loaded.animations[0]).play(); }
    host.dataset.model = 'asset'; render();
  }).catch(() => { if (!disposed) host.dataset.model = 'placeholder-asset-unavailable'; });
  host.dataset.model = shoe ? 'gltf-loading' : track ? 'geometric-staircase' : 'procedural-placeholder';
  const ready = shoe?.ready.then(()=>{if(!disposed){host.dataset.model='gltf-shoe';render();}});
  function render() {
    if (disposed) return;
    renderer.render(scene, camera); draws++;
    host.dataset.frames = String(draws);
    host.dataset.triangles = String(renderer.info.render.triangles);
    host.dataset.drawCalls = String(renderer.info.render.calls);
    if(shoe){host.dataset.rotation=String(shoe.rotation.angle);host.dataset.dragging=String(shoe.rotation.dragging);}
  }
  function step(now: number) {
    if (!active || disposed) return;
    // Shoe retains its policy; the visible mobile track animates at a capped 20 FPS.
    if (now - previous >= (reduced && shoe ? 40 : track?.animated ? 50 : 32)) {
      const delta = previous ? Math.min((now - previous) / 1000, .05) : .016; previous = now; elapsed += delta;
      shoe?.update(delta,elapsed);
      if (award) { award.rotation.y = Math.sin(elapsed * .8) * .35; award.position.y = -.15 + Math.sin(elapsed * 1.6) * .045; }
      track?.frame(delta,elapsed);
      mixer?.update(delta); render();
    }
    raf = requestAnimationFrame(step);
  }
  function setActive(next: boolean) {
    if (disposed || active === next) return;
    active = next; host.dataset.rendering = next ? reduced ? shoe || track?.animated ? 'reduced-animated' : 'on-demand' : 'animated' : 'paused';
    cancelAnimationFrame(raf); previous = 0;
    if (next) { render(); if (!reduced || shoe || track?.animated) raf = requestAnimationFrame(step); }
  }
  const loss = (event: Event) => { event.preventDefault(); onFailure(); };
  renderer.domElement.addEventListener('webglcontextlost', loss);
  return {
    ready,
    update(next) {
      track?.update(next);
      if(shoe && next.rotationCommand && next.rotationCommand.id!==lastRotationCommand){lastRotationCommand=next.rotationCommand.id;shoe.rotation.nudge(next.rotationCommand.delta);}
      host.dataset.currentLevel = String(next.nodes?.find(node=>node.state==='available')?.level ?? '');
      host.dataset.selectedLevel = String(next.selected ?? '');
      host.dataset.levelStates = next.nodes?.map(node => `${node.level}:${node.state}`).join(',') ?? '';
      host.dataset.unlocked = next.unlocked?.join(',') ?? '';
      if (active) render();
    },
    resize(width, height) {
      if (disposed || !width || !height) return;
      renderer.setSize(width, height, false);
      if (camera instanceof PerspectiveCamera) camera.aspect = width / height;
      else { camera.left = -5; camera.right = 5; camera.top = 5 * height / width; camera.bottom = -camera.top; }
      camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      const previousTrackAnimation=track?.animated;
      track?.resize(width,height);
      if(track&&active&&previousTrackAnimation!==track.animated){setActive(false);setActive(true);}
      if(track){host.dataset.trackLayout=track.animated?'mobile-s':'desktop-staircase';host.dataset.model=track.animated?'geometric-s-track':'geometric-staircase';}
      if (active) render();
    },
    active: setActive,
    pointer(x,y){track?.pointer(x,y);if(track&&!reduced){key.position.x=3+x*1.5;key.position.z=5+y;}},
    dragStart(){shoe?.rotation.begin();if(shoe)host.dataset.dragging='true';},
    dragMove(deltaX,width,seconds){shoe?.rotation.drag(deltaX,width,seconds);if(active&&shoe){shoe.update(0,elapsed);render();}},
    dragEnd(){shoe?.rotation.end();if(shoe)host.dataset.dragging='false';},
    dispose() {
      if (disposed) return; disposed = true; active = false; cancelAnimationFrame(raf);
      mixer?.stopAllAction(); if (model) mixer?.uncacheRoot(model);
      shoe?.dispose();
      track?.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', loss);
      disposeObject(scene); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); host.dataset.rendering = 'disposed';
    }
  };
}
