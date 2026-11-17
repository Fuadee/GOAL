import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, PMREMGenerator, TorusGeometry, type WebGLRenderer, type Scene, type WebGLRenderTarget } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { disposeObject, loadHealthModel } from './loaders';
import { ShoeRotation } from './shoe-rotation';

export function createShoeStage(renderer: WebGLRenderer, scene: Scene, reduced: boolean) {
  const root = new Group(), spin = new Group(); root.add(spin); scene.add(root);
  const rotation = new ShoeRotation();
  const material=(color:number,metalness=.65,roughness=.3,emissiveIntensity=0)=>new MeshStandardMaterial({color,metalness,roughness,emissive:color,emissiveIntensity});
  const dark=material(0x070e0b),metal=material(0x273b30,.85,.27),lime=material(0xc6ff38,.2,.3,.8);
  const add=(geometry:import('three').BufferGeometry,mat:MeshStandardMaterial,y:number)=>{const mesh=new Mesh(geometry,mat);mesh.position.y=y;root.add(mesh);return mesh;};
  add(new CylinderGeometry(1.6,1.7,.15,64),dark,-.08);
  add(new CylinderGeometry(1.48,1.6,.12,64),metal,.05);
  add(new CylinderGeometry(1.42,1.48,.08,64),dark,.15);
  for(const [radius,y] of [[1.62,-.03],[1.48,.11],[1.32,.2],[1.06,.205]]) {const ring=add(new TorusGeometry(radius,.013,8,96),lime,y);ring.rotation.x=Math.PI/2;}
  for(let i=0;i<12;i++){const tick=add(new BoxGeometry(.15,.035,.035),i%3===0?lime:metal,.05);tick.position.set(Math.cos(i*Math.PI/6)*1.59,.05,Math.sin(i*Math.PI/6)*1.59);tick.rotation.y=-i*Math.PI/6;}
  const mobile=matchMedia('(max-width:767px)').matches;
  const orbit=new Group();orbit.position.set(0,1.25,-.78);root.add(orbit);
  for(let i=0;i<3;i++){
    // At phone sizes the former 0.008-unit tube was subpixel and broke up without MSAA.
    // Keep desktop geometry/materials intact; the primary mobile orbit is a closed mesh.
    const primary=mobile&&i===0;
    const geometry=new TorusGeometry(1.68+i*.065,mobile?(primary?.019:.012):.008,mobile?8:6,mobile?192:80,primary?Math.PI*2:Math.PI*(i===0?1.65:.65));
    const core=primary?new MeshBasicMaterial({color:0xc6ff38,toneMapped:false}):i===0?lime:metal;
    const arc=new Mesh(geometry,core);arc.rotation.z=i*2.4;orbit.add(arc);
    if(primary){
      const glow=new Mesh(new TorusGeometry(1.68,.034,8,192),new MeshBasicMaterial({color:0xb8ed38,transparent:true,opacity:.09,depthWrite:false,toneMapped:false}));
      orbit.add(glow);
    }
  }

  let disposed=false,environment:WebGLRenderTarget|null=null;
  const room=new RoomEnvironment();const pmrem=new PMREMGenerator(renderer);
  environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
  const ready=loadHealthModel('/health/models/goal-shoe.glb',1.4).then(({root:model})=>{
    if(disposed){disposeObject(model);return;}
    model.traverse(object=>{
      const mesh=object as Mesh;if(!mesh.isMesh)return;
      const mat=mesh.material as MeshStandardMaterial;
      mat.roughness=.8;mat.metalness=.35;mat.envMapIntensity=.8;
      mat.onBeforeCompile=shader=>{
        shader.vertexShader='varying float vGoalHeight;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGoalHeight = position.y;');
        shader.fragmentShader='varying float vGoalHeight;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
          float goalAccent = smoothstep(0.012, 0.09, diffuseColor.b - diffuseColor.r);
          float goalShade = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
          float goalBand = (1.0-smoothstep(-0.38,-0.30,vGoalHeight))*smoothstep(-0.51,-0.47,vGoalHeight);
          float goalEnergy = max(goalBand, goalAccent*smoothstep(0.22,0.38,vGoalHeight));
          diffuseColor.rgb = mix(vec3(goalShade*0.095)*vec3(0.85,1.0,0.92),vec3(0.54,0.9,0.018)*(0.4+goalShade*0.3),goalEnergy);
        `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
          totalEmissiveRadiance += vec3(0.31, 0.55, 0.008) * goalEnergy * 0.3;
        `);
      };
      mat.customProgramCacheKey=()=> 'goal-shoe-lime-v2';
    });
    spin.add(model);spin.position.y=.75;spin.rotation.y=rotation.angle;spin.rotation.z=-.06;
  });
  return { root, ready, rotation,
    update(seconds:number,time:number){rotation.step(seconds);spin.rotation.y=rotation.angle;spin.position.y=.75+Math.sin(time*1.4)*.04;orbit.rotation.z=time*.12;},
    dispose(){disposed=true;scene.environment=null;environment?.dispose();environment=null;},
    reduced
  };
}
