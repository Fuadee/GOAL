'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { LazyMotion, domMax, MotionConfig } from 'framer-motion';
import styles from '../running.module.css';

const Context = createContext({ enabled: false, ready: false, reduced: false, toggle: () => {} });
export const useRunMotion = () => useContext(Context);

export function RunMotionProvider({ children }: { children: ReactNode }) {
  const [preferred, setPreferred] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    try { setPreferred(localStorage.getItem('goal-running-effects') !== 'off'); } catch { setPreferred(true); }
    setReady(true);
    query.addEventListener('change', update);
    const visibility = () => root.current?.setAttribute('data-page-active', document.hidden ? 'false' : 'true');
    visibility(); document.addEventListener('visibilitychange', visibility);
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    root.current?.setAttribute('data-ambient', nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory <= 4) || navigator.hardwareConcurrency <= 4 ? 'low' : 'full');
    return () => { query.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    const regions = root.current?.querySelectorAll<HTMLElement>('[data-motion-region]');
    if (!regions) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        element.dataset.visible = entry.isIntersecting ? 'true' : 'false';
        if (entry.isIntersecting) element.dataset.entered = 'true';
      }
    }, { threshold: 0.04 });
    regions.forEach(region => observer.observe(region));
    return () => observer.disconnect();
  }, []);
  const toggle = useCallback(() => setPreferred(previous => {
    const next = !previous;
    try { localStorage.setItem('goal-running-effects', next ? 'on' : 'off'); } catch {}
    return next;
  }), []);
  const enabled = ready && preferred && !reduced;
  return <Context.Provider value={{ enabled, ready, reduced, toggle }}>
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion={enabled ? 'never' : 'always'} transition={{ duration: enabled ? 0.3 : 0 }}>
        <div ref={root} className={styles.dashboard} data-effects={enabled ? 'on' : 'off'} data-motion-ready={ready}>
          {children}
        </div>
      </MotionConfig>
    </LazyMotion>
  </Context.Provider>;
}
