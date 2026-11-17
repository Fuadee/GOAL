import {
  AdditiveBlending, BufferGeometry, CanvasTexture, CatmullRomCurve3,
  Float32BufferAttribute, Group, InstancedMesh, LatheGeometry, Matrix4, Mesh,
  MeshBasicMaterial, MeshPhysicalMaterial, OrthographicCamera, PlaneGeometry,
  Quaternion, Sprite, SpriteMaterial, SRGBColorSpace, TubeGeometry, Vector2, Vector3
} from 'three';
import type { TrackNode } from './three.types';

/** Sculpted finish monument; all coordinates are relative to the real Level 10 podium. */
export class FinishGate3D extends Group {
  private readonly gold=new MeshPhysicalMaterial({color:0xc79a35,metalness:1,roughness:.27,envMapIntensity:.65,emissive:0x9b6409,emissiveIntensity:.26});
  private readonly light=new MeshBasicMaterial({color:0xd4ad3e,toneMapped:false});
  private readonly lime=new MeshBasicMaterial({color:0x97ad35,toneMapped:false});
  private readonly lettering:Mesh;
  private readonly glow:Sprite;
  private status:TrackNode['state']='locked';
  private age=0;

  constructor(){
    super();this.name='finish-gate-3d';
    // Pure metal avoids the white dielectric reflection that washed out the former arch.
    const black=new MeshPhysicalMaterial({color:0x3a453b,metalness:.94,roughness:.30,envMapIntensity:.65,clearcoat:.15,clearcoatRoughness:.3});
    const inset=new MeshPhysicalMaterial({color:0x050906,metalness:.98,roughness:.43,envMapIntensity:.25});
    const add=(parent:Group,geometry:BufferGeometry,material:MeshPhysicalMaterial|MeshBasicMaterial)=>{const mesh=new Mesh(geometry,material);parent.add(mesh);return mesh;};
    const turned=(profile:number[][],material:MeshPhysicalMaterial|MeshBasicMaterial,segments=28)=>{const g=new LatheGeometry(profile.map(([r,y])=>new Vector2(r,y)),segments);const p=g.attributes.position;for(let i=0;i<p.count;i++){const depth=.75-.13*Math.max(0,Math.min(1,(p.getY(i)+.15)/.30));p.setX(i,p.getX(i)*1.10);p.setZ(i,p.getZ(i)*depth);}g.computeVertexNormals();return add(this,g,material);};
    // Machined lower chamfer, recessed barrel, shoulder, gold inlays and upper collar.
    turned([[0,-.17],[.59,-.17],[.68,-.15],[.72,-.10],[.72,.035],[.69,.075],[.57,.12],[0,.12]],black);
    turned([[.59,-.172],[.68,-.152],[.715,-.112],[.718,-.088]],this.gold);
    turned([[.714,-.085],[.723,-.077],[.723,-.060],[.714,-.055]],this.light);
    turned([[.719,-.046],[.723,-.040],[.723,.018],[.719,.024]],inset);
    turned([[.714,-.052],[.724,-.048],[.724,-.035],[.714,-.031]],this.lime);
    turned([[.718,.023],[.721,.04],[.687,.079],[.659,.084]],this.gold);
    turned([[.49,.115],[.50,.175],[.56,.18],[.60,.155],[.60,.13]],this.gold);
    turned([[.505,.174],[.512,.185],[.563,.185],[.58,.171]],this.light);

    const facing=new Group();facing.position.set(0,.60,0);facing.rotation.x=-Math.atan2(11.65,10);this.add(facing);
    // A continuous tapered oval section: sculpted shoulders, no rectangular legs.
    const sweep=(offset:number,profile:number[][])=>{
      const positions:number[]=[],indices:number[]=[],steps=32;
      for(let i=0;i<=steps;i++){
        const a=-.48+i/steps*(Math.PI+.96),taper=.64+.36*Math.sin(Math.PI*i/steps);
        for(const [radial,depth] of profile){const r=.44+offset+radial*taper;positions.push(Math.cos(a)*r,Math.sin(a)*r,-.065+depth);}
      }
      const n=profile.length;
      for(let i=0;i<steps;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c);}
      const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
    };
    add(facing,sweep(0,[[-.025,-.035],[-.044,0],[-.025,.044],[.035,.050],[.065,.022],[.065,-.055],[.045,-.085],[-.015,-.085]]),black);
    add(facing,sweep(0,[[.035,.051],[.044,.054],[.055,.037],[.046,.035]]),this.gold);
    add(facing,sweep(0,[[-.030,.037],[-.024,.045],[-.018,.046],[-.023,.035]]),this.light);

    // Sculpted, ridged leaves, with a continuous curved stem on each side.
    const leafPositions:number[]=[],leafIndices:number[]=[],sections=5;
    for(let i=0;i<=sections;i++){
      const t=i/sections,w=Math.pow(Math.sin(Math.PI*t),.85)*.046,z=Math.sin(Math.PI*t)*.025;
      leafPositions.push(-w,t*.20,0,0,t*.20,z,w,t*.20,0,0,t*.20,-.008);
    }
    for(let i=0;i<sections;i++)for(const [a,b] of [[0,1],[1,2],[2,3],[3,0]]){const n=i*4;leafIndices.push(n+a,n+b,n+a+4,n+b,n+b+4,n+a+4);}
    const leafGeometry=new BufferGeometry();leafGeometry.setAttribute('position',new Float32BufferAttribute(leafPositions,3));leafGeometry.setIndex(leafIndices);leafGeometry.computeVertexNormals();
    const leaves=new InstancedMesh(leafGeometry,this.gold,16);facing.add(leaves);let leafIndex=0;
    for(const side of [-1,1]){
      const stem=new CatmullRomCurve3([new Vector3(side*.46,-.40,.015),new Vector3(side*.68,-.26,.015),new Vector3(side*.76,-.02,.015),new Vector3(side*.72,.31,.015)]);
      add(facing,new TubeGeometry(stem,20,.009,5,false),this.gold);
      for(let i=0;i<4;i++)for(const direction of [-1,1]){
        const t=.32+i*.16,p=stem.getPoint(t);p.z=.03;
        const angle=-side*(direction===1?.60:-.58),scale=direction===1?1:.82;
        leaves.setMatrixAt(leafIndex++,new Matrix4().compose(p,new Quaternion().setFromAxisAngle(new Vector3(0,0,1),angle),new Vector3(scale,scale,scale)));
      }
    }

    // A curved, chamfered fascia is part of the podium's front barrel, not a floating label.
    const sign=new Group();sign.position.set(0,.04,.55);sign.rotation.x=-Math.atan2(11.65,10);this.add(sign);
    const fascia=(halfHeight:number,front:number,halfWidth:number)=>{
      const p:number[]=[],uv:number[]=[],idx:number[]=[],steps=32;
      for(let i=0;i<=steps;i++){
        const u=i/steps,x=(u-.5)*2*halfWidth,curve=-.09*Math.pow(x/halfWidth,2);
        p.push(x,-halfHeight,curve+front,x,halfHeight,curve+front);uv.push(u,0,u,1);
        if(i<steps){const n=i*2;idx.push(n,n+2,n+1,n+1,n+2,n+3);}
      }
      const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
    };
    // Overlapping curved shells form a fine gold bevel and recessed black enamel face.
    add(sign,fascia(.156,0,.65),this.gold);
    add(sign,fascia(.132,.009,.628),inset);
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=200;const ctx=canvas.getContext('2d');
    if(ctx){ctx.clearRect(0,0,1024,200);ctx.font='800 148px Arial';ctx.textBaseline='middle';ctx.textAlign='left';const first=ctx.measureText('FINISH ').width,last=ctx.measureText('5K').width;ctx.translate(512-(first+last)/2,106);ctx.fillStyle='#f4df9a';ctx.fillText('FINISH ',0,0);ctx.fillStyle='#c6eb58';ctx.fillText('5K',first,0);}
    const text=new CanvasTexture(canvas);text.colorSpace=SRGBColorSpace;
    this.lettering=add(sign,fascia(.119,.013,.603),new MeshBasicMaterial({map:text,transparent:true,depthWrite:false,toneMapped:false}));this.lettering.name='integrated-finish-5k';
    for(const side of [-1,1]){
      const seam=new CatmullRomCurve3([new Vector3(side*.66,-.13,-.08),new Vector3(side*.69,-.09,-.065),new Vector3(side*.69,.095,-.065),new Vector3(side*.66,.14,-.08)]);
      add(sign,new TubeGeometry(seam,8,.013,5,false),this.gold);
      const slot=add(sign,new TubeGeometry(new CatmullRomCurve3([new Vector3(side*.68,-.045,-.056),new Vector3(side*.68,.035,-.056)]),1,.009,4,false),this.light);slot.name='podium-light-slot';
    }
    const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;const hc=haloCanvas.getContext('2d');
    if(hc){const g=hc.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.4,'#ffffff55');g.addColorStop(1,'#ffffff00');hc.fillStyle=g;hc.fillRect(0,0,64,64);}
    const haloTexture=new CanvasTexture(haloCanvas);
    this.glow=new Sprite(new SpriteMaterial({map:haloTexture,color:0xd7a329,transparent:true,opacity:.09,depthWrite:false,blending:AdditiveBlending,toneMapped:false}));this.glow.position.set(0,.18,.02);this.glow.scale.set(1.45,.85,1);this.add(this.glow);
    const contact=add(this,new PlaneGeometry(1.85,1.65),new MeshBasicMaterial({map:haloTexture,color:0x000000,transparent:true,opacity:.7,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=-.19;contact.name='podium-contact-shadow';
    this.update('locked');
  }

  update(status:TrackNode['state']){
    this.status=status;this.gold.emissiveIntensity=status==='passed'?.40:.26;
    this.light.color.setHex(status==='passed'?0xf1cb52:0xd4ad3e);
    this.lime.color.setHex(status==='locked'?0x97ad35:0xc6ed48);
  }
  frame(delta:number,time:number){
    this.age=Math.min(1,this.age+delta/.65);const reveal=.55+.45*(1-Math.pow(1-this.age,3));
    this.gold.emissiveIntensity=reveal*((this.status==='passed'?.40:.26)+Math.sin(time*.8)*.018);
    this.glow.material.opacity=reveal*((this.status==='passed'?.17:.09)+Math.sin(time*.8)*.012);
  }
  projectedBounds(camera:OrthographicCamera){
    this.updateWorldMatrix(true,true);
    const project=(points:Vector3[])=>({left:(Math.min(...points.map(p=>p.x))+1)*50,right:(Math.max(...points.map(p=>p.x))+1)*50,top:(1-Math.max(...points.map(p=>p.y)))*50,bottom:(1-Math.min(...points.map(p=>p.y)))*50});
    const gatePoints:Vector3[]=[];
    this.traverse(object=>{if(!(object instanceof Mesh)||object.name==='podium-contact-shadow')return;const positions=object.geometry.attributes.position,instance=new Matrix4();for(let n=0;n<(object instanceof InstancedMesh?object.count:1);n++){if(object instanceof InstancedMesh)object.getMatrixAt(n,instance);for(let i=0;i<positions.count;i++)gatePoints.push(new Vector3().fromBufferAttribute(positions,i).applyMatrix4(instance).applyMatrix4(object.matrixWorld).project(camera));}});
    const positions=this.lettering.geometry.attributes.position,points=Array.from({length:positions.count},(_,i)=>this.lettering.localToWorld(new Vector3().fromBufferAttribute(positions,i)).project(camera));
    return {gate:project(gatePoints),lettering:project(points)};
  }
}
