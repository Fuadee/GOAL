import {
  AdditiveBlending, BufferGeometry, CanvasTexture, CatmullRomCurve3, CubicBezierCurve3,
  Color, CylinderGeometry, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, OrthographicCamera, PlaneGeometry, PMREMGenerator, Shape,
  Quaternion, ShapeGeometry, SphereGeometry, Sprite, SpriteMaterial, TorusGeometry, TubeGeometry, Vector3,
  type Scene, type WebGLRenderer
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { disposeObject } from './loaders';
import { FinishGate3D } from './FinishGate3D';
import { mobileConnection, mobileStation } from './mobile-track-layout';
import type { Anchor, SceneState } from './three.types';

const LIME=0xc6ff38, GOLD=0xe8c957;
const metal=(color:number,roughness=.3)=>new MeshStandardMaterial({color,metalness:.85,roughness});
const neon=(color:number)=>new MeshBasicMaterial({color,toneMapped:false});

function radialTexture() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
  const context=canvas.getContext('2d');
  if(context){const gradient=context.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,255,255,.95)');gradient.addColorStop(.3,'rgba(255,255,255,.35)');gradient.addColorStop(1,'rgba(255,255,255,0)');context.fillStyle=gradient;context.fillRect(0,0,64,64);}
  return new CanvasTexture(canvas);
}

/** A solid track ribbon: top, underside and both vertical sides, not a flat line. */
function ribbon(curve:CubicBezierCurve3,halfWidth:number) {
  const vertices:number[]=[],indices:number[]=[],count=24;
  for(let i=0;i<=count;i++){
    const point=curve.getPoint(i/count),tangent=curve.getTangent(i/count),normal=new Vector3(tangent.z,0,-tangent.x).normalize();
    for(const [side,drop] of [[-1,0],[1,0],[-1,-.16],[1,-.16]]){const p=point.clone().addScaledVector(normal,side*halfWidth);vertices.push(p.x,p.y+drop,p.z);}
    if(i<count){const a=i*4,b=a+4;indices.push(a,b,a+1,a+1,b,b+1,a+2,a+3,b+2,a+3,b+3,b+2,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,a+3,b+1,b+3);}
  }
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

export function createMobileTrackStage(renderer:WebGLRenderer,scene:Scene,camera:OrthographicCamera,onAnchors:(anchors:Anchor[])=>void) {
  let root=new Group();scene.add(root);
  let width=0,height=0,stride=2.5,state:SceneState={},disposed=false;
  let platforms:Group[]=[],rings:Mesh[]=[],halos:Mesh[]=[],glows:Sprite[]=[],beams:Sprite[]=[],edges:MeshBasicMaterial[]=[],flows:Mesh[]=[],curves:CubicBezierCurve3[]=[],selection:Mesh[]=[];
  let bodies:{mesh:InstancedMesh;offsetY:number;stretchY:number}[]=[],arrows:InstancedMesh|null=null;
  let finishGate:FinishGate3D|null=null;
  const room=new RoomEnvironment(),pmrem=new PMREMGenerator(renderer),environment=pmrem.fromScene(room,.06);
  scene.environment=environment.texture;scene.environmentIntensity=.75;room.dispose();pmrem.dispose();
  const station=(i:number)=>{const p=mobileStation(i,stride);return new Vector3(p.x,p.y,p.z);};
  const anchor=(i:number)=>station(i).add(new Vector3(0,.66,0));
  const add=(parent:Group,geometry:BufferGeometry,material:MeshStandardMaterial|MeshBasicMaterial,position=new Vector3())=>{const mesh=new Mesh(geometry,material);mesh.position.copy(position);parent.add(mesh);return mesh;};
  function releaseRoot(){root.traverse(object=>{if(object instanceof InstancedMesh)object.dispose();});disposeObject(root);}

  function build() {
    scene.remove(root);releaseRoot();root=new Group();scene.add(root);
    platforms=[];rings=[];halos=[];glows=[];beams=[];edges=[];flows=[];curves=[];selection=[];bodies=[];
    const dark=metal(0x101b19,.32),steel=metal(0x526460,.24),top=metal(0x25322a,.27),glowTexture=radialTexture();
    // Four rows, three U-turns; every segment has exactly one numeric successor.
    const arrowShape=new Shape();arrowShape.moveTo(-.10,-.13);arrowShape.lineTo(.03,0);arrowShape.lineTo(-.10,.13);arrowShape.lineTo(-.03,.13);arrowShape.lineTo(.10,0);arrowShape.lineTo(-.03,-.13);arrowShape.closePath();
    const arrowGeometry=new ShapeGeometry(arrowShape);arrowGeometry.rotateX(-Math.PI/2);
    arrows=new InstancedMesh(arrowGeometry,neon(0xffffff),18);root.add(arrows);
    for(let i=0;i<9;i++){
      const p=mobileConnection(i,stride).points.map(p=>new Vector3(p.x,p.y,p.z));
      const curve=new CubicBezierCurve3(p[0],p[1],p[2],p[3]);curves.push(curve);
      add(root,ribbon(curve,.27),dark);
      const edgeMaterial=neon(0x709a2b);edges.push(edgeMaterial);
      for(const side of [-1,1]){
        const points=Array.from({length:25},(_,j)=>{const t=j/24,p=curve.getPoint(t),d=curve.getTangent(t);return p.addScaledVector(new Vector3(d.z,0,-d.x).normalize(),side*.27).add(new Vector3(0,.015,0));});
        add(root,new TubeGeometry(new CatmullRomCurve3(points),24,.018,6,false),edgeMaterial);
      }
      const middle=curve.getPoint(.5),direction=curve.getTangent(.5);
      for(const [j,offset] of [-.09,.09].entries()){const matrix=new Matrix4().compose(middle.clone().addScaledVector(direction,offset).add(new Vector3(0,.022,0)),new Quaternion().setFromAxisAngle(new Vector3(0,1,0),-Math.atan2(direction.z,direction.x)),new Vector3(1,1,1));arrows.setMatrixAt(i*2+j,matrix);arrows.setColorAt(i*2+j,new Color(0x759c28));}
      const flow=add(root,new SphereGeometry(.045,8,6),neon(LIME),middle);flows.push(flow);
    }
    const baseGeometry=new CylinderGeometry(.51,.53,.17,40),capGeometry=new CylinderGeometry(.46,.49,.055,40),discGeometry=new CylinderGeometry(.40,.42,.035,40);
    const rimGeometry=new TorusGeometry(.455,.018,6,48),haloGeometry=new TorusGeometry(.53,.010,6,48);
    const shadowMaterial=new MeshBasicMaterial({map:glowTexture,color:0x000000,transparent:true,opacity:.85,depthWrite:false});
    const shadows=new InstancedMesh(new PlaneGeometry(1.5,1.5),shadowMaterial,10);root.add(shadows);
    for(const [geometry,mat,offsetY,stretchY] of [[baseGeometry,dark,-.02,1],[capGeometry,steel,.09,1],[discGeometry,top,.135,1],[new SphereGeometry(.29,24,12,0,Math.PI*2,0,Math.PI/2),dark,.16,1.3]] as const){const mesh=new InstancedMesh(geometry,mat,10);root.add(mesh);bodies.push({mesh,offsetY,stretchY});}
    for(let i=0;i<10;i++){
      const p=station(i),platform=new Group();platform.position.copy(p);root.add(platform);platforms.push(platform);
      const ring=add(platform,rimGeometry,neon(i===9?GOLD:0x8e9b64),new Vector3(0,.13,0));ring.rotation.x=Math.PI/2;rings.push(ring);
      const selected=add(platform,new TorusGeometry(.51,.009,5,48),new MeshBasicMaterial({color:0xf2ffe1,transparent:true,opacity:0,toneMapped:false}),new Vector3(0,.16,0));selected.rotation.x=Math.PI/2;selected.visible=false;selection.push(selected);
      const halo=add(platform,haloGeometry,new MeshBasicMaterial({color:LIME,transparent:true,opacity:.45,toneMapped:false}),new Vector3(0,.20,0));halo.rotation.x=Math.PI/2;halos.push(halo);
      const glow=new Sprite(new SpriteMaterial({map:glowTexture,color:i===9?GOLD:LIME,transparent:true,opacity:.35,depthTest:false,depthWrite:false,blending:AdditiveBlending,toneMapped:false}));glow.position.copy(p).add(new Vector3(0,.25,0));glow.scale.setScalar(1.65);root.add(glow);glows.push(glow);
      const beam=new Sprite(new SpriteMaterial({map:glowTexture,color:LIME,transparent:true,opacity:.07,depthWrite:false,blending:AdditiveBlending,toneMapped:false}));beam.position.copy(p).add(new Vector3(0,.66,0));beam.scale.set(.42,1.45,1);root.add(beam);beams.push(beam);
      shadows.setMatrixAt(i,new Matrix4().compose(new Vector3(p.x,-.205,p.z),new Quaternion().setFromAxisAngle(new Vector3(1,0,0),-Math.PI/2),new Vector3(1,1,1)));
    }
    const floor=add(root,new PlaneGeometry(6.5,stride*4.6),metal(0x0b1710,.44),new Vector3(0,-.22,0));floor.rotation.x=-Math.PI/2;
    // Fine geometric terrain is kept at the perimeter; it never blocks a checkpoint.
    for(const end of [-1,1]){
      const geometry=new PlaneGeometry(6.2,1.8,28,8);geometry.rotateX(-Math.PI/2);const positions=geometry.attributes.position;
      for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);const ridge=Math.exp(-Math.pow(x+1.9,2)/.42)*.95+Math.exp(-Math.pow(x-1.4,2)/.65)*.65;positions.setY(i,ridge*(.6+Math.cos(z*2)*.3)+Math.sin(x*7+z*3)*.035);}
      geometry.computeVertexNormals();
      const terrain=add(root,geometry,new MeshBasicMaterial({color:0x9acb2d,wireframe:true,transparent:true,opacity:.065,depthWrite:false}),new Vector3(0,-.25,end*(stride*1.5+1.15)));terrain.renderOrder=1;
    }
    finishGate=new FinishGate3D();platforms[9].add(finishGate);
    update(state);
  }

  function resize(w:number,h:number) {
    if(!w||!h)return;
    const nextStride=h/w*1.45;const rebuild=!platforms.length||Math.abs(nextStride-stride)>.001;
    width=w;height=h;stride=nextStride;if(rebuild)build();
    // Fixed angle: only projection/framing responds to card dimensions, never gestures.
    camera.position.set(0,12,10);camera.lookAt(0,.35,0);camera.left=-2.9;camera.right=2.9;camera.top=2.9*height/width;camera.bottom=-camera.top;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    if(finishGate)renderer.domElement.parentElement?.setAttribute('data-finish-gate-bounds',JSON.stringify(finishGate.projectedBounds(camera)));
    onAnchors(Array.from({length:10},(_,i)=>{const p=anchor(i).project(camera);return{level:i+1,x:(p.x+1)*50,y:(1-p.y)*50};}));
  }
  function update(next:SceneState) {
    state=next;
    platforms.forEach((platform,i)=>{
      const status=state.nodes?.[i]?.state,current=status==='available',passed=status==='passed';
      (rings[i].material as MeshBasicMaterial).color.setHex(current||passed?LIME:i===9?0x807849:0x42533b);
      platform.scale.setScalar(current?1.09:1);beams[i].visible=current;halos[i].visible=current;glows[i].visible=current||passed||i===9;glows[i].material.opacity=current?.50:passed?.28:.045;
      glows[i].scale.setScalar(current?1.9:1.5);
      if(edges[i]){edges[i].color.setHex(passed?LIME:0x344523);flows[i].visible=passed;arrows?.setColorAt(i*2,new Color(passed?LIME:0x344523));arrows?.setColorAt(i*2+1,new Color(passed?LIME:0x344523));}
    });
    if(arrows?.instanceColor)arrows.instanceColor.needsUpdate=true;
    bodies.forEach(({mesh,offsetY,stretchY})=>{for(let i=0;i<10;i++){const status=state.nodes?.[i]?.state;const scale=status==='available'?1.09:1;mesh.setColorAt(i,new Color(status==='locked'?0x78847b:status==='passed'?0xd5efad:0xffffff));mesh.setMatrixAt(i,new Matrix4().compose(station(i).add(new Vector3(0,offsetY*scale,0)),new Quaternion(),new Vector3(scale,scale*stretchY,scale)));}mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;});
    finishGate?.update(state.nodes?.[9]?.state??'locked');
  }
  function frame(delta:number,time:number) {
    platforms.forEach((_,i)=>{
      const current=state.nodes?.[i]?.state==='available';
      const mat=selection[i].material as MeshBasicMaterial;const target=state.selected===i+1?1:0;mat.opacity+=(target-mat.opacity)*Math.min(1,delta*8);selection[i].visible=!current&&mat.opacity>.01;
      if(current){glows[i].material.opacity=.48+Math.sin(time*1.6)*.06;beams[i].material.opacity=.13+Math.sin(time*1.6)*.02;halos[i].position.y=.20+Math.sin(time*1.4)*.012;halos[i].rotation.z=time*.35;}
      if(flows[i]?.visible)flows[i].position.copy(curves[i].getPoint((time*.22+i*.17)%1)).add(new Vector3(0,.05,0));
    });
    finishGate?.frame(delta,time);
  }
  return {resize,update,frame,pointer(){/* Mobile camera is intentionally fixed. */},dispose(){if(disposed)return;disposed=true;scene.remove(root);releaseRoot();environment.dispose();if(scene.environment===environment.texture)scene.environment=null;}};
}
