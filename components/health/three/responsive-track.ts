import type { OrthographicCamera, Scene, WebGLRenderer } from 'three';
import type { Anchor, SceneState } from './three.types';
import { createTrackStage } from './track-scene';
import { createMobileTrackStage } from './mobile-track-scene';

/** Desktop keeps its existing factory; the mobile scene owns only the small-screen view. */
export function createResponsiveTrack(renderer:WebGLRenderer,scene:Scene,camera:OrthographicCamera,reduced:boolean,onAnchors:(a:Anchor[])=>void) {
  let state:SceneState={},mobile=false;
  let stage:{resize:(w:number,h:number)=>void;update:(state:SceneState)=>void;frame:(delta:number,time:number)=>void;pointer:(x:number,y:number)=>void;dispose:()=>void}|null=null;
  return {
    get animated(){return mobile;},
    update(next:SceneState){state=next;stage?.update(next);},
    resize(width:number,height:number){
      const nextMobile=matchMedia('(max-width:767px)').matches;
      if(!stage||mobile!==nextMobile){stage?.dispose();mobile=nextMobile;stage=mobile?createMobileTrackStage(renderer,scene,camera,onAnchors):createTrackStage(renderer,scene,camera,reduced,onAnchors);stage.update(state);}
      stage.resize(width,height);
    },
    frame(delta:number,time:number){stage?.frame(delta,time);},
    pointer(x:number,y:number){if(stage&&!mobile)stage.pointer(x,y);},
    dispose(){stage?.dispose();stage=null;}
  };
}
