'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRunMotion } from '../motion/RunMotionProvider';
import { chooseQuality } from './quality';
import type { QualityTier } from './three.types';
const Context = createContext<QualityTier>('fallback');
export const useHealth3D = () => useContext(Context);
export function Health3DProvider({ children }: { children: ReactNode }) {
  const { enabled, reduced } = useRunMotion();
  const [capability, setCapability] = useState({ webgl: false, compact: true, memory: undefined as number | undefined, cores: undefined as number | undefined, saveData: false });
  useEffect(() => {
    if (!enabled) return;
    const media = matchMedia('(max-width: 767px), (pointer: coarse)');
    const canvas = document.createElement('canvas');
    let webgl = false;
    try { const gl = canvas.getContext('webgl2'); webgl = !!gl; gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* DOM fallback */ }
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const update = () => setCapability({ webgl, compact: media.matches, memory: nav.deviceMemory, cores: nav.hardwareConcurrency, saveData: !!nav.connection?.saveData });
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [enabled]);
  const tier = chooseQuality({ ...capability, enabled, reducedMotion: reduced });
  return <Context.Provider value={tier}>{children}</Context.Provider>;
}
