import { ReactNode } from 'react';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx('app-shell', className)}>{children}</main>;
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx('hero-panel space-y-4', className)}>
      <div className="space-y-2">
        {kicker ? <p className="page-kicker">{kicker}</p> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="max-w-3xl text-base text-[color:var(--text-secondary)] md:text-lg">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  titleClassName,
  subtitleClassName
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className={cx('section-title', titleClassName)}>{title}</h2>
        {subtitle ? <p className={cx('mt-1 text-sm text-[color:var(--text-secondary)]', subtitleClassName)}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PremiumCard({ children, className }: { children: ReactNode; className?: string }) {
  return <article className={cx('premium-card', className)}>{children}</article>;
}

export function StatusBadge({ label, tone = 'info' }: { label: string; tone?: 'critical' | 'warning' | 'info' | 'success' | 'waiting' | 'active' | 'completed' | 'blocked' | 'planned' }) {
  return <span className={cx('status-badge', `status-${tone}`)}>{label}</span>;
}
