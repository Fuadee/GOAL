'use client';

import { ReactNode } from 'react';

type MotionRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function MotionReveal({ children, delay = 0, className }: MotionRevealProps) {
  return (
    <div className={`motion-reveal ${className ?? ''}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

export function FloatMotion({ children, className }: MotionRevealProps) {
  return <div className={`float-motion ${className ?? ''}`}>{children}</div>;
}
