'use client';
import { useEffect, useRef, useState } from 'react';
import { useHealth3D } from './Health3DProvider';
import type { Anchor, SceneController, SceneKind, SceneState } from './three.types';
import styles from './three.module.css';

/** The renderer is imported only when enabled and first in view. All failure paths retain DOM. */
export function Health3DScene({ kind, state, onAnchors, onReady }: { kind: SceneKind; state?: SceneState; onAnchors?: (anchors: Anchor[]) => void; onReady?: (ready: boolean) => void }) {
  const tier = useHealth3D();
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const latest = useRef(state); latest.current = state;
  const callbacks = useRef({ onAnchors, onReady }); callbacks.current = { onAnchors, onReady };
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { controller.current?.update(state ?? {}); }, [state]);
  useEffect(() => {
    const element = host.current;
    if (!element || tier === 'fallback' || failed) return;
    let cancelled = false, visible = false, loading = false;
    let scene: SceneController | null = null;
    const active = () => scene?.active(visible && !document.hidden);
    const fail = () => {
      scene?.dispose(); scene = null; controller.current = null;
      if (!cancelled) { setFailed(true); setReady(false); callbacks.current.onReady?.(false); }
    };
    const load = async () => {
      if (scene || loading) return;
      loading = true;
      try {
        const { createHealthScene } = await import('./scene-engine');
        if (cancelled) return;
        scene = createHealthScene(element, kind, tier, anchors => callbacks.current.onAnchors?.(anchors), fail);
        controller.current = scene;
        scene.update(latest.current ?? {});
        scene.resize(element.clientWidth, element.clientHeight);
        await scene.ready;
        if (cancelled || !scene) return;
        setReady(true); callbacks.current.onReady?.(true); active();
      } catch { fail(); }
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      element.dataset.active = String(visible && !document.hidden);
      if (visible) void load(); active();
    }, { threshold: .01 });
    observer.observe(element);
    const resize = new ResizeObserver(() => scene?.resize(element.clientWidth, element.clientHeight)); resize.observe(element);
    const visibility = () => { element.dataset.active = String(visible && !document.hidden); active(); };
    document.addEventListener('visibilitychange', visibility);
    let pointerId: number | null = null, lastX=0, lastTime=0, dragWidth=1;
    const down = (event: PointerEvent) => {
      if(kind!=='shoe'||!scene||pointerId!==null||event.button!==0)return;
      pointerId=event.pointerId;lastX=event.clientX;lastTime=event.timeStamp;dragWidth=element.clientWidth;
      element.setPointerCapture(event.pointerId);scene.dragStart?.();
    };
    const move = (event: PointerEvent) => {
      if(kind==='track'){const bounds=element.getBoundingClientRect();scene?.pointer?.((event.clientX-bounds.left)/bounds.width*2-1,(event.clientY-bounds.top)/bounds.height*2-1);}
      if(event.pointerId!==pointerId)return;
      scene?.dragMove?.(event.clientX-lastX,dragWidth,(event.timeStamp-lastTime)/1000);lastX=event.clientX;lastTime=event.timeStamp;
    };
    const end = (event: PointerEvent) => {
      if(event.pointerId!==pointerId)return;
      pointerId=null;scene?.dragEnd?.();if(element.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);
    };
    element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);
    element.addEventListener('pointerup',end);element.addEventListener('pointercancel',end);element.addEventListener('lostpointercapture',end);
    const resetPointer=()=>scene?.pointer?.(0,0);
    element.addEventListener('pointerleave',resetPointer);
    return () => {
      cancelled = true; observer.disconnect(); resize.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);
      element.removeEventListener('pointerup',end);element.removeEventListener('pointercancel',end);element.removeEventListener('lostpointercapture',end);
      element.removeEventListener('pointerleave',resetPointer);
      scene?.dispose(); controller.current = null; callbacks.current.onReady?.(false); setReady(false);
    };
  }, [kind, tier, failed]);
  return <div ref={host} className={styles.canvas} data-three-scene={kind} data-quality={tier} data-three-ready={ready && tier !== 'fallback' && !failed} data-three-failed={failed} aria-hidden="true"/>;
}
