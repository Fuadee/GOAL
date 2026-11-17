'use client';
import { useMemo } from 'react';
import { Health3DScene } from './Health3DScene';
import { useHealth3D } from './Health3DProvider';
import styles from './three.module.css';
export function UnlockMedalScene({ levels }: { levels: number[] }) {
  const tier = useHealth3D();
  const state = useMemo(()=>({unlocked:levels}),[levels]);
  if (!levels.length || tier==='fallback') return null;
  return <div className={styles.medal} data-unlock-medal={levels.join(',')}><Health3DScene kind="medal" state={state}/></div>;
}
