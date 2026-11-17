import {
  AdditiveBlending, BufferGeometry, CanvasTexture, CylinderGeometry, DoubleSide,
  ExtrudeGeometry, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera, PlaneGeometry, PMREMGenerator,
  Points, PointsMaterial, Quaternion, ShaderMaterial, Shape, Sprite, SpriteMaterial, TorusGeometry, Vector3,
  type Scene, type WebGLRenderer
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { disposeObject } from './loaders';
import { staircasePoint } from './track-layout';
import type { Anchor, SceneState } from './three.types';

const LIME = 0xc6ff38;
const rounded = (width: number, depth: number, radius: number) => {
  const s = new Shape(), x=-width/2, y=-depth/2, r=radius;
  s.moveTo(x+r,y);s.lineTo(x+width-r,y);s.quadraticCurveTo(x+width,y,x+width,y+r);
  s.lineTo(x+width,y+depth-r);s.quadraticCurveTo(x+width,y+depth,x+width-r,y+depth);
  s.lineTo(x+r,y+depth);s.quadraticCurveTo(x,y+depth,x,y+depth-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
};
function slab(width: number, depth: number, height: number, bevel=.035) {
  const geometry=new ExtrudeGeometry(rounded(width,depth,.1),{depth:height,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:5});
  geometry.rotateX(-Math.PI/2);return geometry;
}
const material=(color:number,metalness=.7,roughness=.3,glow=0)=>new MeshStandardMaterial({color,metalness,roughness,emissive:color,emissiveIntensity:glow});

/** Beveled, connected staircase. Labels stay semantic DOM controls at projected anchors. */
export function createTrackStage(renderer:WebGLRenderer,scene:Scene,camera:OrthographicCamera,reduced:boolean,onAnchors:(a:Anchor[])=>void) {
  let root=new Group();scene.add(root);
  let compact=false,width=0,height=0,state:SceneState={},elapsed=0,selection=0;
  let rims:Mesh[]=[],halos:Mesh[]=[],links:Mesh[]=[],caps:Mesh[]=[],sparks:Mesh[]=[];
  let flag:Mesh|null=null,particles:Points|null=null,glows:Sprite[]=[];
  const pointer={x:0,y:0},smoothed={x:0,y:0};
  const room=new RoomEnvironment(),pmrem=new PMREMGenerator(renderer);
  const environment=pmrem.fromScene(room,.07);scene.environment=environment.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
  const position=(i:number)=>{const p=staircasePoint(i,compact);return new Vector3(p.x,p.y+(state.nodes?.[i]?.state==='available'?.07:0),p.z);};
  const top=(i:number)=>position(i).add(new Vector3(0,.16,0));
  const anchor=(i:number)=>top(i).add(new Vector3(0,compact?.32:.40,.04));
  const add=(geometry:BufferGeometry,mat:MeshStandardMaterial|MeshBasicMaterial|ShaderMaterial,p:Vector3)=>{const m=new Mesh(geometry,mat);m.position.copy(p);root.add(m);return m;};
  const tube=(a:Vector3,b:Vector3,mat:MeshStandardMaterial|MeshBasicMaterial,r=.018)=>{const delta=b.clone().sub(a);const m=add(new CylinderGeometry(r,r,delta.length(),6),mat,a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new Vector3(0,1,0),delta.normalize());return m;};
  function build() {
    scene.remove(root);disposeObject(root);root=new Group();scene.add(root);
    rims=[];halos=[];links=[];caps=[];sparks=[];glows=[];
    const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
    const glowContext=glowCanvas.getContext('2d');
    if(glowContext){const gradient=glowContext.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,255,255,.8)');gradient.addColorStop(.3,'rgba(255,255,255,.25)');gradient.addColorStop(1,'rgba(255,255,255,0)');glowContext.fillStyle=gradient;glowContext.fillRect(0,0,64,64);}
    const glowTexture=new CanvasTexture(glowCanvas);
    const w=compact?.50:1.05,d=compact?.65:1.05;
    const metal=material(0x323f36,.88,.26),dark=material(0x0c1712,.72,.38);
    const column=new InstancedMesh(slab(w*(compact?.45:.92),d*.92,1,.015),dark,10);
    const matrix=new Matrix4(),q=new Quaternion();
    for(let i=0;i<10;i++){const p=position(i);matrix.compose(new Vector3(p.x,-.3,0),q,new Vector3(1,p.y+.3,1));column.setMatrixAt(i,matrix);}root.add(column);
    const capGeometry=slab(w,d,.10),rimGeometry=slab(w+.08,d+.08,.035,.018);
    for(let i=0;i<10;i++){
      const p=position(i);
      const rimMaterial=new MeshBasicMaterial({color:0x718453,toneMapped:false,transparent:true});
      const rim=add(rimGeometry,rimMaterial,p.clone().add(new Vector3(0,.015,0)));rims.push(rim);
      caps.push(add(capGeometry,metal,p.clone().add(new Vector3(0,.045,0))));
      // Fine white-metal top edges catch the environment without expensive screen-space effects.
      const line=add(slab(w-.045,d-.045,.004,.007),material(0x59644f,.9,.22),p.clone().add(new Vector3(0,.15,0)));
      line.scale.set(.97,1,.97);
      add(slab(w-.10,d-.10,.006,.006),metal,p.clone().add(new Vector3(0,.158,0)));
      const halo=add(new TorusGeometry(compact?.34:.49,.012,6,48),material(LIME,.1,.45,1),top(i).add(new Vector3(0,.48,0)));halo.rotation.x=Math.PI/2;halos.push(halo);
      const glow=new Sprite(new SpriteMaterial({map:glowTexture,color:LIME,transparent:true,opacity:.4,blending:AdditiveBlending,depthWrite:false,toneMapped:false}));glow.position.copy(top(i));glow.scale.setScalar(compact?1.15:2.2);root.add(glow);glows.push(glow);
      // Vertical machined badge behind the accessible number button.
      const coin=add(new CylinderGeometry(compact?.20:.26,compact?.20:.26,.055,32),material(0x27351d,.8,.28),anchor(i));coin.rotation.x=Math.PI/2;
      if(i<9){
        const a=top(i).add(new Vector3(0,-.025,compact?.40:.64)),b=top(i+1).add(new Vector3(0,-.025,compact?.40:.64));
        links.push(tube(a,b,new MeshBasicMaterial({color:0x627447,toneMapped:false}),compact?.026:.023));
        const spark=add(new CylinderGeometry(.035,.035,.12,8),material(LIME,.1,.25,2),a);sparks.push(spark);
      }
    }
    // Soft, procedural contact shadow on the floor, shared by all ten columns.
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
    const ctx=canvas.getContext('2d');
    if(ctx){const gradient=ctx.createRadialGradient(32,32,2,32,32,31);gradient.addColorStop(0,'rgba(0,0,0,.85)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);}
    const shadow=new MeshBasicMaterial({map:new CanvasTexture(canvas),transparent:true,depthWrite:false});
    const shadowGeometry=new PlaneGeometry(w*2,d*2);
    for(let i=0;i<10;i++){const m=add(shadowGeometry,shadow,new Vector3(position(i).x,-.28,0));m.rotation.x=-Math.PI/2;}
    // Subtle wave grid is geometry with procedural lines, not a background screenshot.
    const gridGeometry=new PlaneGeometry(26,16,compact?24:64,compact?16:40);gridGeometry.rotateX(-Math.PI/2);
    const vertices=gridGeometry.attributes.position;
    for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),z=vertices.getZ(i);vertices.setY(i,-.42+(z<-1?Math.sin(x*.6+z*.45)*.35:0));}
    gridGeometry.computeVertexNormals();
    add(gridGeometry,new ShaderMaterial({transparent:true,depthWrite:false,side:DoubleSide,uniforms:{},vertexShader:'varying vec3 vWorld; void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vWorld;void main(){vec2 p=vWorld.xz*2.;vec2 g=abs(fract(p-.5)-.5)/max(fwidth(p),vec2(.001));float line=1.-min(min(g.x,g.y),1.);float fade=exp(-length(vWorld.xz)*.16);gl_FragColor=vec4(.43,.62,.17,line*fade*.21);}' }),new Vector3());
    const end=top(9),pole=end.clone().add(new Vector3(compact?.12:.24,.14,-.12));
    tube(pole,pole.clone().add(new Vector3(0,compact?.9:1.05,0)),material(0xb4dd70,.8,.23,.3),.018);
    const flagCanvas=document.createElement('canvas');flagCanvas.width=256;flagCanvas.height=128;
    const fc=flagCanvas.getContext('2d');if(fc){fc.fillStyle='#c6ff38';fc.fillRect(0,0,256,128);fc.fillStyle='#14210b';fc.font='italic 900 78px Arial';fc.textAlign='center';fc.fillText('5K',128,92);}
    const flagMat=new MeshBasicMaterial({map:new CanvasTexture(flagCanvas),toneMapped:false,side:DoubleSide});
    const fg=new PlaneGeometry(compact?.48:.65,compact?.30:.38,12,6);
    flag=add(fg,flagMat,pole.clone().add(new Vector3(compact?.24:.325,compact?.72:.84,0)));
    const count=reduced?12:36,positions=[];for(let i=0;i<count;i++)positions.push(Math.sin(i*17.3)*(compact?2:7),.2+(i%9)*.55,Math.cos(i*9.1)*1.7);
    const pg=new BufferGeometry();pg.setAttribute('position',new Float32BufferAttribute(positions,3));particles=new Points(pg,new PointsMaterial({color:LIME,size:compact?.025:.035,transparent:true,opacity:.38,blending:AdditiveBlending,depthWrite:false}));root.add(particles);
    update(state);
  }
  function project() {camera.updateMatrixWorld();onAnchors(Array.from({length:10},(_,i)=>{const p=anchor(i).project(camera);return{level:i+1,x:(p.x+1)*50,y:(1-p.y)*50};}));}
  function resize(w:number,h:number) {
    width=w;height=h;const nextCompact=w<400;
    if(!rims.length||compact!==nextCompact){compact=nextCompact;build();}
    camera.position.set(compact?1.8:-5,compact?10:7,compact?18:14);camera.lookAt(0,compact?2.8:1.85,0);
    camera.updateMatrixWorld();
    // Fixed mobile camera; fit the entire staircase, flag and touch controls within the frame.
    const extent=compact?3.9:13.8,vertical=compact?7.4:6.5,aspect=width/height;
    const halfWidth=Math.max(extent/2,vertical*aspect/2);
    camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth/aspect;camera.bottom=-camera.top;camera.updateProjectionMatrix();project();
  }
  function update(next:SceneState) {
    const previousCurrent=state.nodes?.find(n=>n.state==='available')?.level;
    state=next;
    if(rims.length&&previousCurrent!==next.nodes?.find(n=>n.state==='available')?.level){build();resize(width,height);return;}
    rims.forEach((rim,i)=>{const status=state.nodes?.[i]?.state;const mat=rim.material as MeshBasicMaterial;
      mat.color.setHex(status==='available'||status==='passed'?LIME:0x4e5a3d);mat.opacity=1;
      halos[i].visible=status==='available';
      glows[i].visible=status!=='locked'||i===9;glows[i].material.opacity=status==='available'?.65:status==='passed'?.25:.12;
      if(links[i]){const m=links[i].material as MeshBasicMaterial;m.color.setHex(status==='passed'?LIME:0x596b3d);sparks[i].visible=status==='passed';}
    });
  }
  function frame(delta:number,time:number) {
    elapsed=time;selection+=( (state.selected??0)-selection)*Math.min(1,delta*9);
    smoothed.x+=(pointer.x-smoothed.x)*Math.min(1,delta*3);smoothed.y+=(pointer.y-smoothed.y)*Math.min(1,delta*3);
    if(!compact&&!reduced){camera.position.x=-5+smoothed.x*.045+Math.sin(time*.18)*.018;camera.lookAt(0,1.85,0);}
    rims.forEach((rim,i)=>{const mat=rim.material as MeshBasicMaterial;const current=state.nodes?.[i]?.state==='available';
      if(current){mat.opacity=.88+Math.sin(time*1.6)*.12;halos[i].rotation.z=time*.3;halos[i].position.y=top(i).y+.48+Math.sin(time*1.5)*.025;}
      // Selection changes the cap reflection, never the actual current-level beacon.
      const selected=Math.max(0,1-Math.abs(selection-(i+1))),hovered=state.hovered===i+1?.02:0;caps[i].scale.set(1+selected*.025+hovered,1,1+selected*.025+hovered);
      if(sparks[i]?.visible){sparks[i].position.lerpVectors(top(i).add(new Vector3(0,-.025,compact?.40:.64)),top(i+1).add(new Vector3(0,-.025,compact?.40:.64)),(time*.45+i*.13)%1);}
    });
    if(flag){const p=flag.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*10-time*2)*.025*(p.getX(i)+(compact?.24:.325)));p.needsUpdate=true;}
    if(particles)particles.position.y=Math.sin(time*.35)*.09;
  }
  return {resize,update,frame,pointer(x:number,y:number){pointer.x=x;pointer.y=y;},dispose(){scene.remove(root);root.traverse(object=>{if(object instanceof InstancedMesh)object.dispose();});disposeObject(root);environment.dispose();if(scene.environment===environment.texture)scene.environment=null;},get compact(){return compact;},get elapsed(){return elapsed;}};
}
