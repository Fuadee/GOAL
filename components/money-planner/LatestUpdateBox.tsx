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
    label: 'รอข้อมูลภายนอก',
    className: 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm'
  },
  blocked: {
    icon: '⛔',
    label: 'ติดขัด',
    className: 'border-red-200 bg-red-50 text-red-700 shadow-sm'
  },
  info: {
    icon: 'ℹ️',
    label: 'ข้อมูลล่าสุด',
    className: 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
  },
  done: {
    icon: '✅',
    label: 'เรียบร้อย',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
  }
};

const HIGHLIGHT_PATTERN = /(ขาด|รอ|ติด)/g;

function renderHighlightedText(text: string): ReactNode {
  const segments = text.split(HIGHLIGHT_PATTERN);

  return segments.map((segment, index) => {
    if (segment.match(HIGHLIGHT_PATTERN)) {
      return (
        <span key={`${segment}-${index}`} className="font-semibold text-[color:var(--text-primary)]">
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
      <p className="text-[11px] font-semibold tracking-[0.01em]">{config.label}</p>
      <p className="mt-1 text-xs text-[color:var(--text-muted)]">อัปเดตล่าสุด:</p>
      <p className="mt-1 flex items-start gap-2 text-base font-medium leading-relaxed text-[color:var(--text-primary)]">
        <span aria-hidden="true" className="leading-none">
          {config.icon}
        </span>
        <span>{renderHighlightedText(text)}</span>
      </p>
    </div>
  );
}
