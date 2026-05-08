import { ReactNode } from 'react';

export type LatestUpdateStatus = 'waiting' | 'blocked' | 'info' | 'done';

type LatestUpdateBoxProps = {
  status: LatestUpdateStatus;
  text: string;
};

type StatusConfig = {
  icon: string;
  label: string;
  className: string;
};

const STATUS_CONFIG: Record<LatestUpdateStatus, StatusConfig> = {
  waiting: {
    icon: '⚠️',
    label: '⚠️ Waiting on external',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.16)]'
  },
  blocked: {
    icon: '⛔',
    label: '🚫 Blocked',
    className: 'border-red-500/40 bg-red-500/10 text-red-100 shadow-[0_0_0_1px_rgba(239,68,68,0.18)]'
  },
  info: {
    icon: 'ℹ️',
    label: 'ℹ️ Info',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-100 shadow-[0_0_0_1px_rgba(59,130,246,0.16)]'
  },
  done: {
    icon: '✅',
    label: '✅ Clear',
    className: 'border-green-500/30 bg-green-500/10 text-green-100 shadow-[0_0_0_1px_rgba(34,197,94,0.16)]'
  }
};

const HIGHLIGHT_PATTERN = /(ขาด|รอ|ติด)/g;

function renderHighlightedText(text: string): ReactNode {
  const segments = text.split(HIGHLIGHT_PATTERN);

  return segments.map((segment, index) => {
    if (segment.match(HIGHLIGHT_PATTERN)) {
      return (
        <span key={`${segment}-${index}`} className="font-semibold text-white">
          {segment}
        </span>
      );
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
}

export function LatestUpdateBox({ status, text }: LatestUpdateBoxProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`w-full rounded-xl border px-4 py-3 ${config.className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">{config.label}</p>
      <p className="mt-1 text-xs text-white/65">Latest update:</p>
      <p className="mt-1 flex items-start gap-2 text-base font-medium leading-relaxed text-white">
        <span aria-hidden="true" className="leading-none">
          {config.icon}
        </span>
        <span>{renderHighlightedText(text)}</span>
      </p>
    </div>
  );
}
