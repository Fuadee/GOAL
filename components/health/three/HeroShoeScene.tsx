'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Rotate3D } from 'lucide-react';
import { Health3DScene } from './Health3DScene';
import { useHealth3D } from './Health3DProvider';
import styles from './three.module.css';
export function HeroShoeScene() {
  const tier=useHealth3D();
  const [ready,setReady]=useState(false);
  const [command,setCommand]=useState({id:0,delta:0});
  const state=useMemo(()=>({rotationCommand:command}),[command]);
  const live=ready&&tier!=='fallback';
  return <div className={styles.shoeHero} data-shoe-hero data-shoe-visible={live}>
    <div className={styles.shoeFallback} data-visible={!live} aria-hidden="true"><Image src="/health/shoe-poster.png" alt="" fill priority unoptimized sizes="(max-width:580px) 90vw, 500px"/></div>
    <Health3DScene kind="shoe" state={state} onReady={setReady}/>
    <div className={styles.shoeControls} role="group" aria-label="ควบคุมมุมมองรองเท้า">
      {live ? <>
        <button type="button" aria-label="หมุนรองเท้าไปทางซ้าย" onClick={()=>setCommand(old=>({id:old.id+1,delta:-Math.PI/4}))}><ChevronLeft size={16}/></button>
        <span><Rotate3D size={15}/> 360° · ลากเพื่อหมุน</span>
        <button type="button" aria-label="หมุนรองเท้าไปทางขวา" onClick={()=>setCommand(old=>({id:old.id+1,delta:Math.PI/4}))}><ChevronRight size={16}/></button>
      </> : <span>ROAD TO 5K / PERFORMANCE FOOTWEAR</span>}
    </div>
    <a className={styles.shoeCredit} href="/health/models/SHOE-LICENSE.txt" target="_blank" rel="noreferrer">Shoe © Shopify · CC BY 4.0 · adapted</a>
  </div>;
}
